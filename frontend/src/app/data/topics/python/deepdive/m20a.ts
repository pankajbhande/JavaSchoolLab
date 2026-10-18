// Module 20 (Python Internals): CPython, bytecode, AST, frames, code objects, namespaces.
import { dd, r, type DeepDive } from './deepDive';

export const m20a: Record<string, DeepDive> = {
    'CPython & the Interpreter': dd(
        [`<b>CPython</b> is the reference implementation of Python, written in C. The word "Python" usually means CPython: it compiles your source to bytecode and executes it on a stack-based virtual machine (the eval loop).`,
            r`import sys, platform

print(platform.python_implementation())      # which implementation runs this
print(sys.implementation.name)               # 'cpython'
print(sys.version_info[:2])

# OUTPUT (example):
# CPython
# cpython
# (3, 12)`],
        [`The language is a specification; you need an implementation to run it. Knowing the interpreter explains performance (GIL, bytecode loop), memory model (refcounting) and why some behaviour is "CPython detail".`,
            r`# Same code, different engines: CPython, PyPy (JIT), Jython (JVM), MicroPython (embedded)
import sys
impl = sys.implementation.name
print("running on", impl)
print("has refcounts:", hasattr(sys, "getrefcount"))

# OUTPUT (CPython):
# running on cpython
# has refcounts: True`],
        [`Servers and CI run CPython; data-heavy code relies on its C API (NumPy, pandas); PyPy speeds long-running pure-Python loops; MicroPython targets microcontrollers; Cython and mypyc compile Python-like code to C extensions.`,
            r`import sys, sysconfig

print("C compiler used to build:", "GCC" in sys.version or "MSC" in sys.version
      or "Clang" in sys.version)
print("GIL build:", sysconfig.get_config_var("Py_GIL_DISABLED") in (None, 0))

# OUTPUT (typical):
# C compiler used to build: True
# GIL build: True`],
        [`<b>Advantages:</b> most compatible implementation, all C extensions work, best ecosystem and tooling, and a clear, readable C code base.`,
            r`import math
print(type(math.sqrt))        # built-in function implemented in C
print(math.sqrt.__module__)

# OUTPUT:
# <class 'builtin_function_or_method'>
# math`],
        [`<b>Disadvantages:</b> no JIT by default (an experimental one arrived in 3.13), interpretation overhead per bytecode, and the GIL limits multi-threaded CPU work.`,
            r`import time
t = time.perf_counter()
total = 0
for i in range(3_000_000):
    total += i                # every iteration runs several bytecodes
print(total, "in", round(time.perf_counter() - t, 2), "s (about 0.1-0.3 s)")

# OUTPUT (varies):
# 4499998500000 in 0.15 s (about 0.1-0.3 s)`],
        [`<b>Limitations:</b> behaviour like refcount timing, int caching and dict ordering of internals is implementation-specific; portability to PyPy/others is not guaranteed for C-extension heavy code.`,
            r`import sys
# Code that assumes CPython internals breaks elsewhere:
if hasattr(sys, "_getframe"):
    print("frame access available (CPython/PyPy), but not guaranteed by the spec")

# OUTPUT:
# frame access available (CPython/PyPy), but not guaranteed by the spec`],
        `
   source.py ─► Tokenizer ─► Parser ─► AST ─► Compiler ─► Bytecode (code object)
                                                                │
                                              ┌─────────────────▼───────────┐
                                              │  Eval loop (virtual machine) │
                                              │  stack, frames, refcounting  │
                                              └─────────────────┬───────────┘
                                                                ▼
                                                  C runtime / OS calls
`,
        `Pick the runtime to match the workload: CPython for compatibility, PyPy for long-running pure-Python CPU work, free-threaded 3.13+ builds for threaded CPU scaling once your dependencies support it. Do not write code that depends on CPython internals unless it is isolated behind an interface.`
    ),

    'Compilation: Source to Bytecode': dd(
        [`Before running, CPython <b>compiles</b> source code into <b>bytecode</b>: a compact instruction list for its virtual machine. The built-in <code>compile()</code> exposes this step and returns a code object.`,
            r`code = compile("x = 2 + 3\nprint(x)", "<demo>", "exec")
print(type(code).__name__)
exec(code)                      # run the compiled code

# OUTPUT:
# code
# 5`],
        [`Interpreting text line by line would be slow. Compiling once into bytecode lets the VM run simple, fast instructions and allows optimisations such as constant folding to happen up front.`,
            r`import dis
src = "y = 60 * 60 * 24"
dis.dis(compile(src, "<s>", "exec"))     # the multiplication is gone: folded

# OUTPUT (3.12, abridged):
#   1   RESUME        0
#       LOAD_CONST    0 (86400)
#       STORE_NAME    0 (y)
#       RETURN_CONST  1 (None)`],
        [`Compilation happens at import time and for <code>exec</code>/<code>eval</code>. Frameworks compile templates and expressions; syntax errors surface here, before any line of the module runs.`,
            r`try:
    compile("def f(:\n  pass", "<bad>", "exec")
except SyntaxError as e:
    print("caught before running:", e.msg)

# OUTPUT:
# caught before running: invalid syntax`],
        [`<b>Advantages:</b> faster than re-parsing, early syntax checks, compile modes (<code>exec</code>, <code>eval</code>, <code>single</code>), and flags such as <code>optimize</code> levels.`,
            r`print(eval(compile("3 * 7", "<e>", "eval")))        # expression mode
code = compile("a = 1", "<x>", "exec", optimize=0)
ns = {}
exec(code, ns)
print(ns["a"])

# OUTPUT:
# 21
# 1`],
        [`<b>Disadvantages:</b> compile time adds startup cost for large modules, bytecode is version specific, and dynamic <code>exec</code> of strings is a security and debugging risk.`,
            r`import time
src = "\n".join(f"v{i} = {i} * 2" for i in range(20000))
t = time.perf_counter()
compile(src, "<big>", "exec")
print("compile of 20k lines took ms:", round((time.perf_counter() - t) * 1000) > 0)

# OUTPUT (varies):
# compile of 20k lines took ms: True`],
        [`<b>Limitations:</b> the compiler only understands syntax, not types (type errors appear at runtime), and compiled code objects are tied to the interpreter version that made them.`,
            r`import sys
code = compile("1 + 1", "<v>", "eval")
print(sys.version_info[:2], "magic number is tied to this version")
print(sys.implementation.cache_tag)     # e.g. cpython-312

# OUTPUT (example):
# (3, 12) magic number is tied to this version
# cpython-312`],
        `
   "x = 1 + 2"
        │ tokenize
        ▼
   NAME  =  NUMBER  +  NUMBER
        │ parse
        ▼
      AST ─► symbol table ─► optimise (fold 1+2 -> 3)
        │ codegen
        ▼
   Bytecode:  LOAD_CONST 3 ; STORE_NAME x
`,
        `Compilation costs are paid once per module per interpreter version, so ship pre-compiled .pyc (compileall) in containers to speed cold starts. Avoid eval/exec of untrusted strings; if you must, use ast.literal_eval or a restricted DSL.`
    ),

    '.pyc Files & __pycache__': dd(
        [`When a module is imported, CPython saves its compiled bytecode into a <b>.pyc</b> file inside <code>__pycache__/</code>, named with the interpreter tag, for example <code>mod.cpython-312.pyc</code>. Next time it loads the .pyc instead of recompiling.`,
            r`import py_compile, tempfile, os

d = tempfile.mkdtemp()
src = os.path.join(d, "mod.py")
open(src, "w").write("print('hi')\n")
pyc = py_compile.compile(src)             # writes into __pycache__
print(os.path.relpath(pyc, d))

# OUTPUT (3.12):
# __pycache__\mod.cpython-312.pyc`],
        [`Parsing and compiling large modules on every start wastes time. Caching bytecode makes repeated imports, scripts, and CLI tools start faster.`,
            r`import importlib.util, sys
print(importlib.util.cache_from_source("pkg/util.py"))
print(sys.dont_write_bytecode)             # True if caching is disabled

# OUTPUT (3.12, POSIX paths shown):
# pkg/__pycache__/util.cpython-312.pyc
# False`],
        [`The header stores a magic number, flags and either the source mtime and size or a hash. If the source changes the .pyc is regenerated. Docker images often run <code>python -m compileall</code> at build; the main script itself is never cached.`,
            r`import importlib.util, struct, py_compile, tempfile, os

d = tempfile.mkdtemp(); p = os.path.join(d, "m.py")
open(p, "w").write("x = 1\n")
pyc = py_compile.compile(p)
head = open(pyc, "rb").read(16)
magic = head[:4]
print(magic == importlib.util.MAGIC_NUMBER)        # version check
flags = struct.unpack("<I", head[4:8])[0]
print("flags:", flags)                              # 0 = timestamp based

# OUTPUT:
# True
# flags: 0`],
        [`<b>Advantages:</b> faster imports, automatic invalidation, read-only deployments can ship pre-built .pyc, and unchecked hash-based .pyc give reproducible builds.`,
            r`import py_compile, tempfile, os
p = os.path.join(tempfile.mkdtemp(), "r.py")
open(p, "w").write("v = 7\n")
out = py_compile.compile(p, invalidation_mode=py_compile.PycInvalidationMode.CHECKED_HASH)
print(os.path.exists(out))                         # hash-based, reproducible

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> stale or orphaned files clutter repositories (add <code>__pycache__/</code> to .gitignore), read-only file systems cannot write them, and they speed up loading only, not execution.`,
            r`import time
# .pyc does NOT make the loop faster, only module loading:
t = time.perf_counter()
sum(i for i in range(1_000_000))
print("runtime speed unchanged by pyc:", time.perf_counter() - t > 0)

# OUTPUT:
# runtime speed unchanged by pyc: True`],
        [`<b>Limitations:</b> the format is not portable across Python versions, it is not a secure or obfuscated form (bytecode decompiles easily), and the top-level script is always recompiled.`,
            r`import marshal, py_compile, tempfile, os
p = os.path.join(tempfile.mkdtemp(), "s.py")
open(p, "w").write("secret = 'password123'\n")
pyc = py_compile.compile(p)
code = marshal.loads(open(pyc, "rb").read()[16:])    # skip the 16-byte header
print(code.co_consts)       # strings are visible: pyc is not protection

# OUTPUT:
# ('password123', None)`],
        `
   import mod
      │
      ├─ __pycache__/mod.cpython-312.pyc exists and is fresh?
      │        yes ─► marshal.load ─► code object ─► execute
      └─ no  ─► compile mod.py ─► write .pyc ─► execute
   .pyc layout:  [magic 4B][flags 4B][mtime 4B][size 4B][marshalled code]
`,
        `Pre-compile in the build stage (compileall, optionally with unchecked-hash for immutable images) and set PYTHONDONTWRITEBYTECODE=1 plus a read-only file system at runtime. Never treat .pyc as a way to protect secrets or IP; use compiled extensions or server-side logic instead.`
    ),

    'Python Bytecode & the dis Module': dd(
        [`<b>Bytecode</b> is the low-level instruction set of the CPython VM. The <code>dis</code> module disassembles functions into readable instructions like <code>LOAD_FAST</code>, <code>BINARY_OP</code>, <code>RETURN_VALUE</code>.`,
            r`import dis

def add(a, b):
    return a + b

dis.dis(add)

# OUTPUT (3.12):
#   1           0 RESUME                   0
#   2           2 LOAD_FAST                0 (a)
#               4 LOAD_FAST                1 (b)
#               6 BINARY_OP                0 (+)
#              10 RETURN_VALUE`],
        [`Reading bytecode shows what Python really does, explains performance differences between two ways of writing the same thing, and helps debug closures, comprehensions and scoping.`,
            r`import dis

def f(): return [i * 2 for i in range(3)]
def g():
    out = []
    for i in range(3): out.append(i * 2)
    return out

def count(fn): return sum(1 for _ in dis.get_instructions(fn))
print("comprehension instructions:", count(f) > 0)
print("loop instructions         :", count(g) > count(f) )

# OUTPUT (3.12):
# comprehension instructions: True
# loop instructions         : True`],
        [`Profiling micro-optimisations, understanding the stack machine, security tools that analyse bytecode, debuggers and coverage tools (which hook line events), and learning why <code>a, b = b, a</code> needs no temporary.`,
            r`import dis
def swap(a, b):
    a, b = b, a
    return a, b
ops = [i.opname for i in dis.get_instructions(swap)]
print("SWAP" in ops or "ROT_TWO" in ops)     # 3.11+ uses SWAP, older ROT_TWO

# OUTPUT:
# True`],
        [`<b>Advantages:</b> a tangible view of execution, stable enough for tooling, <code>dis.Bytecode</code> and <code>get_instructions</code> give structured access, and <code>show_caches</code>/<code>adaptive</code> reveal 3.11+ specialisation.`,
            r`import dis
def f(x): return x + 1
for ins in dis.get_instructions(f):
    if ins.opname == "BINARY_OP":
        print(ins.opname, ins.argrepr, "at offset", ins.offset)

# OUTPUT (3.12):
# BINARY_OP + at offset 6`],
        [`<b>Disadvantages:</b> opcodes change between versions (even minor ones), output is noisy for beginners, and bytecode length is not a reliable measure of speed.`,
            r`import dis, io, contextlib
def f(a): return -a
buf = io.StringIO()
with contextlib.redirect_stdout(buf): dis.dis(f)
print("UNARY_NEGATIVE" in buf.getvalue())     # opcode names/numbers differ by version

# OUTPUT (3.12):
# True`],
        [`<b>Limitations:</b> dis shows only the generic instructions, not the specialised ones the adaptive interpreter swaps in at runtime (use <code>adaptive=True</code> after warm-up), and nothing about C-level cost of each opcode.`,
            r`import dis
def f(x): return x + 1
for _ in range(100): f(1)                      # warm up the adaptive interpreter
dis.dis(f, adaptive=True)                      # shows e.g. BINARY_OP_ADD_INT

# OUTPUT (3.12, abridged):
#   2  RESUME
#      LOAD_FAST   0 (x)
#      LOAD_CONST  1 (1)
#      BINARY_OP_ADD_INT 0 (+)
#      RETURN_VALUE`],
        `
   def add(a, b): return a + b

   VM operand stack
   ┌────────┐ LOAD_FAST a    ┌────────┐ LOAD_FAST b    ┌────────┐ BINARY_OP +  ┌────────┐
   │        │ ─────────────► │   a    │ ─────────────► │   b    │ ───────────► │ a + b  │
   └────────┘                └────────┘                │   a    │              └────────┘
                                                       └────────┘  RETURN_VALUE
`,
        `Use dis for learning, verifying optimisations and writing tooling, but never ship logic that depends on specific opcodes. For performance work measure with timeit and profilers first; bytecode inspection explains results rather than predicting them.`
    ),

    'AST & the ast Module': dd(
        [`An <b>AST</b> (Abstract Syntax Tree) is the tree form of source code that the parser produces. The <code>ast</code> module lets Python code parse, inspect, transform and compile that tree.`,
            r`import ast

tree = ast.parse("x = 1 + 2")
print(ast.dump(tree.body[0].value))

# OUTPUT:
# BinOp(left=Constant(value=1), op=Add(), right=Constant(value=2))`],
        [`Text is hard to analyse reliably (regex breaks on nested syntax), but a tree is exact. Linters, formatters, type checkers and refactoring tools all work on ASTs.`,
            r`import ast

src = "def f(a, b): return a + b\ndef g(): pass\nclass C: pass"
tree = ast.parse(src)
funcs = [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
print(funcs, [n.name for n in ast.walk(tree) if isinstance(n, ast.ClassDef)])

# OUTPUT:
# ['f', 'g'] ['C']`],
        [`Used by pytest (assert rewriting), flake8/ruff plugins, black, mypy, code generators and safe expression evaluation via <code>ast.literal_eval</code>. <code>NodeVisitor</code> and <code>NodeTransformer</code> implement custom checks and rewrites.`,
            r`import ast

class NoPrint(ast.NodeVisitor):                 # a tiny linter
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name) and node.func.id == "print":
            print(f"line {node.lineno}: avoid print()")
        self.generic_visit(node)

NoPrint().visit(ast.parse("x = 1\nprint(x)\nprint('hi')"))

# OUTPUT:
# line 2: avoid print()
# line 3: avoid print()`],
        [`<b>Advantages:</b> precise structural understanding, safe literal parsing, ability to rewrite code programmatically, and positions (<code>lineno</code>, <code>col_offset</code>) on nodes.`,
            r`import ast

print(ast.literal_eval("{'a': [1, 2, 3], 'ok': True}"))     # safe, unlike eval

try:
    ast.literal_eval("__import__('os').getcwd()")            # code is refused
except ValueError:
    print("refused: not a literal")

# OUTPUT:
# {'a': [1, 2, 3], 'ok': True}
# refused: not a literal`],
        [`<b>Disadvantages:</b> node classes change between Python versions (for example Num to Constant), trees are verbose, and ast drops comments and formatting.`,
            r`import ast
tree = ast.parse("x = 1  # a comment\n")
print("comment" in ast.dump(tree))           # comments do not exist in the AST

# OUTPUT:
# False`],
        [`<b>Limitations:</b> parsing validates syntax only (no name resolution or types), unparse output is normalised (<code>ast.unparse</code>), and very deep expressions can hit recursion limits.`,
            r`import ast
tree = ast.parse("x   =   (1+2)")
print(ast.unparse(tree))                    # formatting is lost and regenerated

# OUTPUT:
# x = 1 + 2`],
        `
   "total = price * 2"
              │ ast.parse
              ▼
          Assign
          ├─ targets: Name(total, Store)
          └─ value:   BinOp
                      ├─ left : Name(price, Load)
                      ├─ op   : Mult
                      └─ right: Constant(2)
`,
        `Build tooling on ast (or libcst when comments and formatting must survive), not on regular expressions. Pin tests to the Python versions you support because node shapes evolve, and never use eval where ast.literal_eval or a small parser will do.`
    ),

    'Execution Model & Frames': dd(
        [`Each function call creates a <b>frame</b>: the execution context holding the code object, local variables, the operand stack and the current instruction. Frames form a call stack; <code>return</code> or an exception pops the frame.`,
            r`import sys

def inner():
    f = sys._getframe()
    print("in", f.f_code.co_name, "called from", f.f_back.f_code.co_name)

def outer():
    inner()

outer()

# OUTPUT:
# in inner called from outer`],
        [`Frames explain scoping (locals vs globals vs builtins), recursion limits, tracebacks (a list of frames), generators that pause and resume, and how debuggers show variables.`,
            r`import inspect

def f(x):
    y = x * 2
    frame = inspect.currentframe()
    print(frame.f_locals)                  # snapshot of local names
    print(frame.f_lineno, frame.f_code.co_name)

f(5)

# OUTPUT:
# {'x': 5, 'y': 10, 'frame': <frame ...>}
# 5 f`],
        [`Debuggers, profilers (<code>sys.setprofile</code>), coverage tools (<code>sys.settrace</code>) and loggers (<code>findCaller</code>) all walk frames. Generators and coroutines keep a frame alive between resumptions.`,
            r`import sys

calls = []
def tracer(frame, event, arg):
    if event == "call":
        calls.append(frame.f_code.co_name)
    return None

def a(): b()
def b(): pass

sys.settrace(tracer); a(); sys.settrace(None)
print(calls)

# OUTPUT:
# ['a', 'b']`],
        [`<b>Advantages:</b> a uniform model for all calls, introspection of the live program, and cheap suspension for generators and async code.`,
            r`def counter():
    n = 0
    while True:
        n += 1
        yield n            # frame (and local n) is suspended, not destroyed

c = counter()
print(next(c), next(c), c.gi_frame.f_locals["n"])

# OUTPUT:
# 1 2 2`],
        [`<b>Disadvantages:</b> each call has setup cost (Python function calls are slower than in compiled languages), frames hold references that delay garbage collection, and deep recursion is bounded.`,
            r`import timeit
def f(): pass
print(timeit.timeit(f, number=1_000_000) > 0)    # about 30-50 ns per call (varies)

# OUTPUT:
# True`],
        [`<b>Limitations:</b> frame objects are CPython internals (f_locals semantics changed in 3.13), accessing them is slow, and tail-call elimination does not exist so recursion depth is limited.`,
            r`import sys
def fact(n): return 1 if n <= 1 else n * fact(n - 1)
print(len(str(fact(500))))                  # depth 500: fine
try:
    fact(5000)
except RecursionError:
    print("no tail-call optimisation: limit", sys.getrecursionlimit())

# OUTPUT:
# 1135
# no tail-call optimisation: limit 1000`],
        `
   call stack (grows down)             one frame
   ┌────────────────────────┐         ┌──────────────────────────┐
   │ <module>               │         │ f_code    -> code object │
   ├────────────────────────┤         │ f_locals  -> {x: 5}      │
   │ outer()                │         │ f_globals -> module dict │
   ├────────────────────────┤         │ f_back    -> caller      │
   │ inner()   (running)    │ ◄────── │ value stack, f_lasti     │
   └────────────────────────┘         └──────────────────────────┘
`,
        `Do not build business logic on frame inspection; keep it to debuggers, loggers and test tooling. Convert deep recursion to loops or explicit stacks, and remember that stored tracebacks and generators keep frames, and all their locals, alive.`
    ),

    'Code Objects': dd(
        [`A <b>code object</b> is the immutable result of compiling a block: it holds the bytecode, constants, names and argument info. A function object wraps a code object plus its globals and defaults, reachable through <code>f.__code__</code>.`,
            r`def greet(name, greeting="Hi"):
    msg = f"{greeting}, {name}"
    return msg

c = greet.__code__
print(c.co_name, c.co_argcount)
print(c.co_varnames)
print(c.co_consts)

# OUTPUT (3.12):
# greet 2
# ('name', 'greeting', 'msg')
# (None, ', ')`],
        [`It separates <i>what to run</i> (the code) from <i>where it runs</i> (the function and frame). That lets one code object serve many closures and lets tools inspect any function without running it.`,
            r`def make(n):
    def add(x): return x + n          # closure
    return add

a, b = make(1), make(100)
print(a.__code__ is b.__code__)       # same code object
print(a.__closure__[0].cell_contents, b.__closure__[0].cell_contents)

# OUTPUT:
# True
# 1 100`],
        [`Frameworks read <code>co_varnames</code> and <code>co_argcount</code> to inspect signatures (older dependency injection), profilers key statistics on <code>co_filename</code> and <code>co_firstlineno</code>, and metaprogramming can build functions with <code>types.FunctionType</code> and <code>code.replace()</code>.`,
            r`import types

def original(): return "old"
new_code = original.__code__.replace(co_consts=(None, "patched"))
patched = types.FunctionType(new_code, globals())
print(patched())

# OUTPUT:
# patched`],
        [`<b>Advantages:</b> introspection of any function, cheap sharing between closures, and <code>replace()</code> creates modified copies safely because code objects are immutable.`,
            r`def f(a, b, *args, **kw): pass
c = f.__code__
print(c.co_argcount, c.co_flags & 0x04 != 0, c.co_flags & 0x08 != 0)  # *args, **kw flags

# OUTPUT:
# 2 True True`],
        [`<b>Disadvantages:</b> attributes and layout are CPython internals that change between versions (3.11 added co_qualname, exception tables), so raw manipulation is fragile.`,
            r`def f(): pass
print(hasattr(f.__code__, "co_qualname"))     # new in 3.11
print(hasattr(f.__code__, "co_lnotab"))       # deprecated; replaced by co_lines()

# OUTPUT (3.12):
# True
# True`],
        [`<b>Limitations:</b> code objects are read-only (you cannot edit bytecode in place), they cannot be pickled by the standard pickle (only marshalled), and they carry no runtime state such as variable values.`,
            r`import pickle
def f(): pass
try:
    pickle.dumps(f.__code__)
except TypeError as e:
    print("cannot pickle:", e)

# OUTPUT:
# cannot pickle: cannot pickle 'code' object`],
        `
   function object  f                      code object (immutable)
   ┌───────────────────────┐              ┌───────────────────────────┐
   │ __code__  ────────────┼────────────► │ co_code      bytecode     │
   │ __globals__           │              │ co_consts    (None, ...)  │
   │ __defaults__          │              │ co_varnames  ('a','b')    │
   │ __closure__           │              │ co_names, co_argcount ... │
   └───────────────────────┘              └───────────────────────────┘
`,
        `Code-object manipulation belongs in debuggers, profilers and compilers, not in application logic. If you need runtime-generated behaviour, prefer closures, functools, or decorators; if you need to alter code, regenerate from an AST and recompile.`
    ),

    'Namespaces & Symbol Tables': dd(
        [`A <b>namespace</b> is a mapping from names to objects (module globals, a function's locals, a class body, builtins). The compiler builds a <b>symbol table</b> that decides, per name, whether it is local, global, free (closure) or cell.`,
            r`x = "global"

def f():
    y = "local"
    print(sorted(locals()))          # function namespace
    print("x" in globals())          # module namespace

f()
print(type(__builtins__).__name__ in ("module", "dict"))

# OUTPUT:
# ['y']
# True
# True`],
        [`Without clear namespaces, names would collide. The rules (LEGB: Local, Enclosing, Global, Built-in) make lookups predictable and are the reason for bugs like <code>UnboundLocalError</code>.`,
            r`count = 0
def bad():
    try:
        count += 1          # assignment makes 'count' LOCAL for the whole function
    except UnboundLocalError as e:
        print("error:", e)

def good():
    global count
    count += 1

bad(); good(); print(count)

# OUTPUT:
# error: cannot access local variable 'count' where it is not associated with a value
# 1`],
        [`Real impact: closures with <code>nonlocal</code>, module-level state, class attribute resolution, name shadowing of builtins (<code>list = []</code>), and plug-in systems that exec code into a custom dict.`,
            r`def counter():
    n = 0
    def inc():
        nonlocal n          # refers to the enclosing namespace
        n += 1
        return n
    return inc

c = counter(); c(); c()
print(c())

ns = {}
exec("a = 5\nb = a * 2", ns)         # custom namespace for dynamic code
print(ns["b"])

# OUTPUT:
# 3
# 10`],
        [`<b>Advantages:</b> isolation between modules and functions, predictable LEGB lookup, introspection through <code>vars()</code> / <code>dir()</code>, and the <code>symtable</code> module for analysis.`,
            r`import symtable

src = "g = 1\ndef f(a):\n    b = a + g\n    return b\n"
top = symtable.symtable(src, "<s>", "exec")
fn = top.get_children()[0]
for s in fn.get_symbols():
    kind = "param" if s.is_parameter() else "global" if s.is_global() else "local"
    print(s.get_name(), kind)

# OUTPUT:
# a param
# b local
# g global`],
        [`<b>Disadvantages:</b> shadowing is silent, a name used for assignment anywhere in a function becomes local everywhere in it, and global lookups are slower than local ones.`,
            r`print = "oops"                  # shadows the builtin in this module
try:
    print("hello")
except TypeError as e:
    print("shadowed:", e)
del print                        # remove shadow -> builtin visible again
print("hello again")

# OUTPUT:
# shadowed: 'str' object is not callable
# hello again`],
        [`<b>Limitations:</b> class bodies do not form an enclosing scope for methods, comprehensions have their own scope (inlined in 3.12 but still isolated), and modifying <code>locals()</code> inside a function does not change variables.`,
            r`class A:
    x = 10
    def method(self):
        try:
            return x            # NOT the class attribute: class scope is skipped
        except NameError:
            return "NameError: need self.x or A.x"

print(A().method())

def f():
    a = 1
    locals()["a"] = 99          # modifies a snapshot, not the variable
    return a
print(f())

# OUTPUT:
# NameError: need self.x or A.x
# 1`],
        `
   name lookup order (LEGB)
   ┌────────────────────────────────────────────────────────────┐
   │ Built-in   print, len, Exception ...                       │
   │  ┌──────────────────────────────────────────────────────┐  │
   │  │ Global (module)   x, f, classes                      │  │
   │  │  ┌────────────────────────────────────────────────┐  │  │
   │  │  │ Enclosing (outer function)  n   <- nonlocal    │  │  │
   │  │  │  ┌──────────────────────────────────────────┐  │  │  │
   │  │  │  │ Local (current function)  y              │  │  │  │
   │  │  │  └──────────────────────────────────────────┘  │  │  │
   │  │  └────────────────────────────────────────────────┘  │  │
   │  └──────────────────────────────────────────────────────┘  │
   └────────────────────────────────────────────────────────────┘
`,
        `Keep module state minimal and explicit: pass dependencies as arguments, avoid global and nonlocal for anything but tiny closures, and never shadow builtins (enable linters A001/A002). For plug-in or template systems always exec into a dedicated dict, and remember that exec is not a sandbox.`
    )
};
