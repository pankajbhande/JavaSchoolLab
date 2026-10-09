import type { Topic } from '../../types';

export const internalsBytecodeDis: Topic = {
    id: 'python-internals-python-bytecode-the-dis-module',
    name: 'Python Bytecode & the dis Module',
    beginner: [
        {
            content: `<h4>Introduction</h4>
<b>Bytecode</b> is the list of tiny instructions the Python Virtual Machine executes. It is <b>stack based</b>: instructions push values onto an operand stack and others pop them to compute. The <code>dis</code> module disassembles it, much like <code>javap -c</code> does for a Java <code>.class</code> file. Bytecode is a CPython <i>implementation detail</i>: opcodes are renamed, added and merged between versions.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 569 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:569px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="104.3" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="62.2" y="30.5">LOAD_FAST a</tspan><tspan x="62.2" y="45.5">stack: [a]</tspan></text><line x1="114.3" y1="34" x2="144.3" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="148.3" y="10" width="118.9" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="207.8" y="30.5">LOAD_FAST b</tspan><tspan x="207.8" y="45.5">stack: [a, b]</tspan></text><line x1="267.2" y1="34" x2="297.2" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="301.2" y="10" width="111.6" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="357" y="30.5">BINARY_OP +</tspan><tspan x="357" y="45.5">stack: [a+b]</tspan></text><line x1="412.8" y1="34" x2="442.8" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="446.8" y="10" width="111.6" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="502.6" y="30.5">RETURN_VALUE</tspan><tspan x="502.6" y="45.5">stack: []</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: a + b on the stack machine (3.13 may fuse the two loads into one instruction)</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Without looking at bytecode, performance questions ("is this faster than that?") are guesses, and you cannot see what the interpreter really does for a simple expression like <code>a + b</code>.
<br><br>
<b>Why we need it:</b>
<ul>
<li>See exactly which instructions a function compiles to and how the <b>operand stack</b> is used.</li>
<li>Compare two ways of writing code by looking at what each really does.</li>
<li>Debug surprising behaviour (global vs local lookups, default arguments).</li>
<li>Learn the Python counterpart of reading <code>javap -c</code> output.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Asking questions of the bytecode</h4>
Instead of printing the full disassembly (which differs between versions), the program queries stable facts about it.`,
            codeExamples: [
                `import dis


def add(a, b):
    return a + b


def shout(text):
    return print(text.upper())


def has_op(func, prefix):
    return any(ins.opname.startswith(prefix)
               for ins in dis.get_instructions(func))


def main():
    # Prefixes are used because 3.13 fuses LOAD_FAST pairs
    # and 3.12+ may use RETURN_CONST in other functions.
    print("add loads locals:   ", has_op(add, "LOAD_FAST"))
    print("add uses BINARY_OP: ", has_op(add, "BINARY_OP"))
    print("add returns:        ", has_op(add, "RETURN"))
    print("add uses a global:  ", has_op(add, "LOAD_GLOBAL"))
    print("shout uses a global:", has_op(shout, "LOAD_GLOBAL"))

    effect = dis.stack_effect(dis.opmap["BINARY_OP"], 0)
    print("BINARY_OP stack effect:", effect)
    print("has raw bytes:", len(add.__code__.co_code) > 0)


if __name__ == "__main__":
    main()

# OUTPUT (Python 3.11 - 3.13):
# add loads locals:    True
# add uses BINARY_OP:  True
# add returns:         True
# add uses a global:   False
# shout uses a global: True
# BINARY_OP stack effect: -1
# has raw bytes: True`
            ],
            codeExplanations: [
                `dis.get_instructions yields one object per instruction, so we can ask whether an opcode family appears. add reads only locals (LOAD_FAST), so it has no LOAD_GLOBAL, while shout looks up the built-in print through a global lookup. BINARY_OP pops two values and pushes one, a net stack change of -1.`
            ]
        },
        {
            content: `<h4>What is Bytecode?</h4>
<b>Bytecode</b> is the list of simple instructions the Python Virtual Machine actually executes. Each instruction is tiny: load a variable, add two values, jump, call a function. The VM is <b>stack-based</b>: instructions push values onto an operand stack and other instructions pop them off and compute. The standard <code>dis</code> (disassembler) module prints bytecode in readable form.

Note: bytecode is an <b>implementation detail</b> of CPython. Instruction names and numbers change between versions; the examples below are from Python 3.12.`
        },
        {
            content: `<h4>Your First Disassembly</h4>`,
            codeExamples: [
                `import dis

def add(a, b):
    return a + b

dis.dis(add)

# OUTPUT (Python 3.12):
#   1           0 RESUME                   0
#
#   2           2 LOAD_FAST                0 (a)
#               4 LOAD_FAST                1 (b)
#               6 BINARY_OP                0 (+)
#              10 RETURN_VALUE`
            ],
            codeExplanations: [
                `Reading it as a stack machine: LOAD_FAST a pushes a; LOAD_FAST b pushes b; BINARY_OP (+) pops both, adds them and pushes the result; RETURN_VALUE pops the result and returns it. The numbers at the left are the line numbers and byte offsets. "FAST" means a fast local variable, stored in an array and addressed by index. RESUME is a no-op marker at the start of a function.`
            ]
        },
        {
            content: `<h4>Reading the Columns</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Column</th><th>Meaning</th></tr>
<tr class='text-center'><td>First number (e.g. <code>2</code>)</td><td>Source line the instruction came from</td></tr>
<tr class='text-center'><td>Second number (e.g. <code>4</code>)</td><td>Byte offset of the instruction</td></tr>
<tr class='text-center'><td><code>LOAD_FAST</code></td><td>The opcode name</td></tr>
<tr class='text-center'><td><code>1</code></td><td>The raw argument (an index into a table)</td></tr>
<tr class='text-center'><td><code>(b)</code></td><td>The argument resolved to something readable</td></tr>
<tr class='text-center'><td><code>&gt;&gt;</code></td><td>Marks a jump target (shown in code with branches and loops)</td></tr>
</table>`
        },
        {
            content: `<h4>Instructions as Data</h4>
<code>dis.get_instructions()</code> returns the instructions as objects, so you can analyse code programmatically.`,
            codeExamples: [
                `import dis

def add(a, b):
    return a + b

for instruction in dis.get_instructions(add):
    print(instruction.opname, repr(instruction.argrepr))

# OUTPUT (Python 3.12):
# RESUME ''
# LOAD_FAST 'a'
# LOAD_FAST 'b'
# BINARY_OP '+'
# RETURN_VALUE ''`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Branches and Loops</h3>
Control flow compiles to <b>jump</b> instructions. Disassembling an <code>if</code> shows how a condition becomes a test followed by a conditional jump.`,
            codeExamples: [
                `import dis

def sign(n):
    if n < 0:
        return "negative"
    return "non-negative"

dis.dis(sign)

# OUTPUT (Python 3.12, simplified: offsets and jump targets are left out):
#   2           RESUME
#
#   3           LOAD_FAST                0 (n)
#               LOAD_CONST               1 (0)
#               COMPARE_OP               2 (<)
#               POP_JUMP_IF_FALSE        (jump over the next line)
#
#   4           RETURN_CONST             2 ('negative')
#
#   5     >>    RETURN_CONST             3 ('non-negative')`
            ],
            codeExplanations: [
                `n < 0 is evaluated onto the stack, then POP_JUMP_IF_FALSE jumps over the first return when the condition is false. RETURN_CONST (3.12) returns a constant directly. The exact instruction names and the way jump targets are labelled change with the version - the structure test-then-jump does not.`
            ]
        },
        {
            content: `<h3>Why Local Variables Are Faster Than Globals</h3>
Bytecode shows <b>why</b> performance advice holds. A local is read with <code>LOAD_FAST</code>, an array index. A global or built-in needs <code>LOAD_GLOBAL</code>, a dictionary lookup (with a cache in modern versions). A hot loop that calls a global function repeatedly can be sped up by binding it to a local first.`,
            codeExamples: [
                `import dis

def use_global():
    return len([1, 2, 3])

def use_local(length=len):
    return length([1, 2, 3])

names_global = [i.opname for i in dis.get_instructions(use_global)]
names_local = [i.opname for i in dis.get_instructions(use_local)]

print("LOAD_GLOBAL" in names_global)
print("LOAD_GLOBAL" in names_local, "LOAD_FAST" in names_local)

# OUTPUT:
# True
# False True`
            ]
        },
        {
            content: `<h3>Specialization: Bytecode That Rewrites Itself</h3>
Since 3.11, after a function has run a few times, generic instructions are replaced by <b>specialised</b> versions tuned to the types seen (<code>BINARY_OP</code> becomes <code>BINARY_OP_ADD_INT</code>, <code>LOAD_ATTR</code> becomes <code>LOAD_ATTR_INSTANCE_VALUE</code>...). The <code>adaptive=True</code> option of <code>dis</code> shows the warmed-up form. Because of this, microbenchmarks measured on cold code can mislead.`,
            codeExamples: [
                `import dis

def add(a, b):
    return a + b

for _ in range(1000):          # warm the function up with ints
    add(1, 2)

dis.dis(add, adaptive=True)    # look for BINARY_OP_ADD_INT in the output`
            ]
        },
        {
            content: `<h3>Code You Can Learn From the Disassembly</h3>
<ul>
<li><b>Chained comparison:</b> <code>a &lt; b &lt; c</code> evaluates <code>b</code> only once (it uses a stack <code>COPY</code>).</li>
<li><b>Membership against a literal:</b> <code>x in (1, 2, 3)</code> uses one constant tuple; no list is built on each call.</li>
<li><b>f-strings:</b> compile to direct formatting instructions, which is why they beat <code>%</code> and <code>.format</code> in speed.</li>
<li><b>Comprehensions:</b> before 3.12 each comprehension had its own function (and frame); 3.12 inlines them.</li>
<li><b>try/except:</b> since 3.11 costs nothing when no exception occurs: an exception table replaces setup instructions.</li>
</ul>`,
            codeExamples: [
                `import dis

def f(x):
    return x in (1, 2, 3)

constants = f.__code__.co_consts
print((1, 2, 3) in constants)

names = [i.opname for i in dis.get_instructions(f)]
print("BUILD_LIST" in names, "BUILD_TUPLE" in names)

# OUTPUT:
# True
# False False`
            ]
        },
        {
            content: `<h3>Practical Uses of dis</h3>
<ul>
<li><b>Settling "which is faster?" arguments</b> by seeing what is really executed (then confirm with <code>timeit</code>).</li>
<li><b>Understanding surprising behaviour</b> such as why <code>x += 1</code> on a global needs a <code>global</code> declaration, or what a decorator really does.</li>
<li><b>Tooling:</b> coverage tools, debuggers and profilers hook into line and instruction events; bytecode-rewriting libraries instrument or optimise code.</li>
<li><b>Never depend on bytecode in production logic.</b> It changes every release; code that inspects opcodes will break.</li>
</ul>
Command line: <code>python -m dis script.py</code> disassembles a whole file; <code>dis.show_code(func)</code> prints a summary of the code object.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Shows exactly what the interpreter executes</td><td>Opcodes change between Python versions</td></tr>
<tr><td>Stack model is tiny and easy to reason about</td><td>Reading raw output takes practice</td></tr>
<tr><td>dis is built in - no extra tools</td><td>Bytecode speed does not map simply to wall-clock time</td></tr>
<tr><td>Useful for settling micro-optimisation arguments with evidence</td><td>Not a stable interface to build tools on</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is Python bytecode?</td><td>The low-level instruction set the PVM executes, produced by compiling source code</td></tr>
<tr class='text-center'><td>What kind of machine executes it?</td><td>A stack machine: instructions push and pop operands on an evaluation stack</td></tr>
<tr class='text-center'><td>How do you inspect bytecode?</td><td><code>dis.dis(function)</code> or <code>python -m dis file.py</code></td></tr>
<tr class='text-center'><td>LOAD_FAST vs LOAD_GLOBAL?</td><td>Fast locals are an array index; globals/builtins are dictionary lookups - locals are faster</td></tr>
<tr class='text-center'><td>Is bytecode stable across versions?</td><td>No - opcodes change in nearly every release; it is a CPython implementation detail</td></tr>
</table>`
        }
    ]
};
