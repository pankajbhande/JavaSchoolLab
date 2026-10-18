// Module 40 (Advanced Python), part B: imports, iteration protocols, code as data, and native interop.
import { dd, r, type DeepDive } from './deepDive';

export const m40b: Record<string, DeepDive> = {
    'Import Hooks': dd(
        [`When you write <code>import name</code>, Python asks each <b>finder</b> in <code>sys.meta_path</code> to locate the module; the first finder that returns a spec wins, and its <b>loader</b> creates and executes the module. Adding your own finder or loader customises what an import means.`,
            r`import sys, importlib.abc, importlib.util

class Finder(importlib.abc.MetaPathFinder):
    def find_spec(self, name, path, target=None):
        if name == "hello_virtual":            # a module with no file on disk
            return importlib.util.spec_from_loader(name, Loader())
        return None                            # None = "not mine, ask the next finder"

class Loader(importlib.abc.Loader):
    def create_module(self, spec):
        return None                            # use the default module object
    def exec_module(self, module):
        module.greet = lambda: "hi from nowhere"

sys.meta_path.insert(0, Finder())
import hello_virtual
print(hello_virtual.greet())

# OUTPUT:
# hi from nowhere`],
        [`Sometimes code does not live in ordinary .py files: it may be in a database, a zip, a network location, or be encrypted or generated. An import hook lets normal <code>import</code> statements work for those sources.`,
            r`import sys, importlib.abc, importlib.util

SOURCES = {"cfg": """
DEBUG = True
LEVEL = 3
"""}                                           # pretend this came from a database

class DictLoader(importlib.abc.Loader):
    def create_module(self, spec):
        return None
    def exec_module(self, module):
        exec(SOURCES[module.__name__], module.__dict__)   # run the source in the module

class DictFinder(importlib.abc.MetaPathFinder):
    def find_spec(self, name, path, target=None):
        if name in SOURCES:
            return importlib.util.spec_from_loader(name, DictLoader())

sys.meta_path.append(DictFinder())
import cfg
print(cfg.DEBUG, cfg.LEVEL)

# OUTPUT:
# True 3`],
        [`Real uses: pytest rewrites assertions through an import hook, tools like import-time profilers log what loads, editable installs map names to source trees, and lazy-loading wrappers delay heavy imports.`,
            r`import sys

class Spy:                                     # observes every import, changes nothing
    seen = []
    def find_spec(self, name, path, target=None):
        self.seen.append(name)
        return None                            # always defer to the real finders

spy = Spy()
sys.meta_path.insert(0, spy)
import colorsys, sched                         # not imported yet in a fresh interpreter
sys.meta_path.remove(spy)                      # always clean up your hook

print("colorsys" in spy.seen, "sched" in spy.seen)

# OUTPUT:
# True True`],
        [`<b>Advantages:</b> imports become pluggable without touching library code. The supporting <code>importlib</code> API also lets you find or load modules by name, safely, at run time.`,
            r`import importlib, importlib.util

name = "math"
if importlib.util.find_spec(name):             # is it importable? (no import performed)
    mod = importlib.import_module(name)        # import by string: plugin systems
    print(mod.sqrt(16))

print(importlib.util.find_spec("no_such_pkg_xyz"))

# OUTPUT:
# 4.0
# None`],
        [`<b>Disadvantages:</b> hooks are global: they affect every import in the process, order in <code>sys.meta_path</code> matters, and a buggy finder can break unrelated code or hijack even standard-library names.`,
            r`import sys, importlib.abc, importlib.util

class Shadow(importlib.abc.MetaPathFinder):
    def find_spec(self, name, path, target=None):
        if name == "colorsys":                 # hijacks a stdlib module for everyone
            return importlib.util.spec_from_loader(name, Fake())

class Fake(importlib.abc.Loader):
    def create_module(self, spec):
        return None
    def exec_module(self, module):
        module.rgb_to_hsv = "patched"

sys.meta_path.insert(0, Shadow())
sys.modules.pop("colorsys", None)
import colorsys
print(colorsys.rgb_to_hsv)

# OUTPUT:
# patched`],
        [`<b>Limitations:</b> hooks run only for modules not already in <code>sys.modules</code>. Anything imported earlier (including most of the standard library the interpreter loads at start-up) never reaches your finder.`,
            r`import sys, importlib.abc

calls = []
class F(importlib.abc.MetaPathFinder):
    def find_spec(self, name, path, target=None):
        calls.append(name)

sys.meta_path.insert(0, F())
import os                                      # cached in sys.modules at start-up
import sys as again                            # same
print(calls)

# OUTPUT:
# []`],
        `
   import foo
      │
      ▼
   sys.modules has 'foo'? ──yes──► return cached module   (hooks never run)
      │ no
      ▼
   for finder in sys.meta_path:            (your finder can sit anywhere in this list)
        spec = finder.find_spec('foo')   ──► first non-None spec wins
      ▼
   module = loader.create_module(spec);  sys.modules['foo'] = module
   loader.exec_module(module)            ──► module body runs, names appear
`,
        `Import hooks are powerful but global, so reserve them for tooling (test frameworks, profilers, packaging, sandboxes) and make them narrow: match exact names or prefixes, always return None otherwise, and register and remove them in one controlled place. For plugin loading prefer <code>importlib.metadata</code> entry points over custom finders.`
    ),

    'Custom Iterators & Containers': dd(
        [`An <b>iterator</b> implements <code>__iter__</code> (returning itself) and <code>__next__</code> (returning the next value or raising <code>StopIteration</code>). A <b>container</b> adds methods such as <code>__len__</code> and <code>__getitem__</code>. The <code>for</code> loop is just repeated calls to <code>__next__</code>.`,
            r`class Countdown:
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        return self                            # an iterator returns itself
    def __next__(self):
        if self.n <= 0:
            raise StopIteration                # tells 'for' the sequence is finished
        self.n -= 1
        return self.n + 1

print(list(Countdown(3)))

# OUTPUT:
# [3, 2, 1]`],
        [`Built-in types cannot model everything: a paged result, a tree walk, a database cursor, a circular buffer. Custom iteration lets your own objects work with <code>for</code>, <code>list()</code>, <code>sum()</code>, unpacking and comprehensions.`,
            r`class Range2:
    """Iterable (not an iterator): every for-loop gets a fresh generator."""
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        i = 0
        while i < self.n:
            yield i                            # a generator method is the easy way
            i += 1

nums = Range2(3)
print(list(nums), list(nums))                  # reusable, unlike a bare iterator

# OUTPUT:
# [0, 1, 2] [0, 1, 2]`],
        [`Pagination wrappers, file or log readers, custom collections and API result sets. Subclassing <code>collections.abc.Sequence</code> gives you <code>in</code>, <code>index</code>, <code>count</code>, <code>reversed</code> and iteration for the price of two methods.`,
            r`from collections.abc import Sequence

class Page(Sequence):                          # implement __len__ and __getitem__ only
    def __init__(self, items, size):
        self.items = items
        self.size = size
    def __len__(self):
        return (len(self.items) + self.size - 1) // self.size
    def __getitem__(self, i):
        if not 0 <= i < len(self):
            raise IndexError(i)
        return self.items[i * self.size:(i + 1) * self.size]

pages = Page(list("abcdefg"), 3)
print(len(pages), pages[2])
print(list(pages))
print(["d", "e", "f"] in pages, pages.index(["d", "e", "f"]))

# OUTPUT:
# 3 ['g']
# [['a', 'b', 'c'], ['d', 'e', 'f'], ['g']]
# True 1`],
        [`<b>Advantages:</b> lazy evaluation (values produced on demand), constant memory even for infinite streams, and seamless use with the whole iteration toolbox (<code>itertools</code>, comprehensions).`,
            r`import itertools

class Fib:
    def __iter__(self):
        a, b = 0, 1
        while True:                            # infinite, but nothing is stored
            yield a
            a, b = b, a + b

print(list(itertools.islice(Fib(), 10)))       # take only what you need

# OUTPUT:
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`],
        [`<b>Disadvantages:</b> iterators are single-use. A second pass silently produces nothing, a classic source of bugs when an iterator is passed around like a list.`,
            r`nums = iter([1, 2, 3])
print(sum(nums))
print(sum(nums))                               # exhausted: no error, just 0

# OUTPUT:
# 6
# 0`],
        [`<b>Limitations:</b> no length, no indexing and no rewinding on plain iterators; to peek or restart you must buffer (<code>itertools.tee</code>, <code>list()</code>) or return a new iterator from <code>__iter__</code>.`,
            r`gen = (x for x in range(3))
try:
    len(gen)
except TypeError as e:
    print("TypeError:", e)
try:
    gen[0]
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: object of type 'generator' has no len()
# TypeError: 'generator' object is not subscriptable`],
        `
   for x in obj:                    obj.__iter__()  ──► iterator
        │                                              │
        └─ repeat ───────────────►  iterator.__next__() ─► value
                                           │
                                  StopIteration ──► loop ends

   Iterable : has __iter__            (list, Range2, Page)      -> can be looped many times
   Iterator : __iter__ + __next__     (generator, Countdown)    -> one pass only
   Container: + __len__, __getitem__, __contains__  (Sequence / Mapping ABCs)
`,
        `Separate the iterable (reusable, owns the data) from the iterator (one traversal, owns the cursor), and implement <code>__iter__</code> as a generator whenever possible. Subclass the <code>collections.abc</code> classes for containers so semantics are consistent, and document whether your API returns a one-shot iterator or a re-iterable collection.`
    ),

    'AST Manipulation': dd(
        [`The <b>AST</b> (abstract syntax tree) is the tree Python builds from source before compiling it. The <code>ast</code> module lets you parse code into nodes, inspect or rewrite them, and compile the result.`,
            r`import ast

tree = ast.parse("x = 1 + 2")                  # source text -> tree of node objects
assign = tree.body[0]                          # an ast.Assign statement
print(ast.dump(assign.value))                  # the right-hand side expression

# OUTPUT:
# BinOp(left=Constant(value=1), op=Add(), right=Constant(value=2))`],
        [`<code>eval()</code> on user text is dangerous because it runs anything. Parsing to an AST lets you <i>whitelist</i> exactly which node types are allowed, giving a safe calculator or rules engine.`,
            r`import ast, operator

OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul}

def calc(expr):
    def ev(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in OPS:
            return OPS[type(node.op)](ev(node.left), ev(node.right))
        raise ValueError("not allowed: " + type(node).__name__)
    return ev(ast.parse(expr, mode="eval").body)

print(calc("2 + 3 * 4"))
try:
    calc("__import__('os')")                   # a Call node is not whitelisted
except ValueError as e:
    print("ValueError:", e)

# OUTPUT:
# 14
# ValueError: not allowed: Call`],
        [`Linters, formatters, test frameworks (pytest assertion rewriting), type checkers, code-coverage tools and refactoring tools all work by walking ASTs. <code>NodeVisitor</code> walks; <code>NodeTransformer</code> rewrites.`,
            r`import ast

src = """
def a(): pass
class K:
    def b(self): pass
"""

class Finder(ast.NodeVisitor):
    def __init__(self):
        self.names = []
    def visit_FunctionDef(self, node):         # called for every 'def'
        self.names.append(node.name)
        self.generic_visit(node)               # keep walking into children

f = Finder()
f.visit(ast.parse(src))
print(f.names)

# OUTPUT:
# ['a', 'b']`],
        [`<b>Advantages:</b> structural, not textual: you cannot be fooled by strings or comments. You can transform code and run it, which is the basis of macros, DSLs and instrumentation.`,
            r`import ast

class Double(ast.NodeTransformer):
    def visit_Constant(self, node):            # rewrite every integer literal
        if isinstance(node.value, int):
            return ast.copy_location(ast.Constant(node.value * 2), node)
        return node

tree = ast.parse("print(1 + 2)")
tree = ast.fix_missing_locations(Double().visit(tree))   # recompute line numbers
exec(compile(tree, "<ast>", "exec"))                     # now it is print(2 + 4)

# OUTPUT:
# 6`],
        [`<b>Disadvantages:</b> verbose, version-sensitive node shapes, and a round trip loses formatting: comments and original layout are not stored in the tree.`,
            r`import ast

src = "x = 1   # keep me" + chr(10) + "y=2"
print(ast.unparse(ast.parse(src)))             # Python 3.9+: comment and spacing are gone

# OUTPUT:
# x = 1
# y = 2`],
        [`<b>Limitations:</b> the AST only knows syntax, not runtime values or types. <code>ast.literal_eval</code> safely handles literals only; anything needing calls or names is rejected.`,
            r`import ast

print(ast.literal_eval("[1, {'a': (2, 3)}]"))  # containers of literals are fine
try:
    ast.literal_eval("len([1])")               # a Call: refused
except ValueError:
    print("ValueError")

# OUTPUT:
# [1, {'a': (2, 3)}]
# ValueError`],
        `
   source text ──ast.parse──► tree ──NodeVisitor / NodeTransformer──► new tree
                               │                                         │
   Assign                      │                         ast.fix_missing_locations
    ├─ Name x                  │                                         ▼
    └─ BinOp ── Constant 1     │                                  compile() ──► code object ──► exec / eval
          Add ─ Constant 2     └──► ast.unparse ──► source text
`,
        `Use the AST when you need correctness that regular expressions cannot give (linters, codemods, safe expression languages). For heavy refactors prefer libraries that preserve formatting (LibCST), pin tests to the supported Python versions because node classes change, and never feed untrusted ASTs to <code>compile</code> and <code>exec</code> without whitelisting.`
    ),

    'Bytecode': dd(
        [`CPython compiles every function to <b>bytecode</b>: a compact list of instructions for its virtual machine, stored in a <i>code object</i> at <code>function.__code__</code>. The <code>dis</code> module shows it in readable form.`,
            r`def add(a, b):
    return a + b

code = add.__code__                            # the compiled code object
print(code.co_varnames, code.co_argcount)      # local names and number of arguments
print(type(code.co_code).__name__, len(code.co_code) > 0)   # raw instruction bytes

# OUTPUT:
# ('a', 'b') 2
# bytes True`],
        [`Bytecode explains performance and behaviour that the source hides: what costs more, what is atomic, and what the compiler already optimised. It is also what debuggers, profilers and coverage tools hook into.`,
            r`import dis

def add(a, b):
    return a + b

ops = [i.opname for i in dis.get_instructions(add)]
print("BINARY_OP" in ops, ops[-1])             # BINARY_OP exists in 3.11+
# dis.dis(add) would print the full listing with offsets and operands

# OUTPUT:
# True RETURN_VALUE`],
        [`Typical real uses: checking the compiler's constant folding, learning why one form of code is faster, tools such as coverage.py and debuggers, and compiling expression strings once to run many times.`,
            r`def seconds_per_day():
    return 24 * 60 * 60

consts = seconds_per_day.__code__.co_consts
print(86400 in consts, 24 in consts)           # folded at compile time, not each call

code = compile("a * 2 + 1", "<expr>", "eval")  # compile once ...
print([eval(code, {"a": n}) for n in (1, 2, 3)])   # ... run many times

# OUTPUT:
# True False
# [3, 5, 7]`],
        [`<b>Advantages:</b> a stable inspection point for tooling, a cache format (<code>.pyc</code>) that skips re-parsing on later imports, and a way to learn exactly what the interpreter does.`,
            r`import dis, io, contextlib

def loop():
    total = 0
    for i in range(3):
        total += i
    return total

buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    dis.dis(loop)                              # capture the disassembly as text
listing = buf.getvalue()
print("FOR_ITER" in listing, "RETURN" in listing)   # the loop is a FOR_ITER instruction

# OUTPUT:
# True True`],
        [`<b>Disadvantages:</b> bytecode is an implementation detail of CPython: instruction names and layouts change between minor versions, and other interpreters (PyPy, Jython) differ.`,
            r`import importlib.util

magic = importlib.util.MAGIC_NUMBER            # first 4 bytes of every .pyc file
print(len(magic), magic[2:])                   # the first 2 bytes change every Python version

# A .pyc from Python 3.11 is rejected by 3.12 because the magic number differs.

# OUTPUT:
# 4 b'\r\n'`],
        [`<b>Limitations:</b> code objects are immutable and read-only; to change code you must build a new one with <code>code.replace(...)</code>, and hand-written bytecode can crash the interpreter, since the VM trusts it.`,
            r`def f():
    return 1

try:
    f.__code__.co_consts = (None, 2)           # code objects cannot be edited in place
except AttributeError:
    print("AttributeError: code objects are read-only")

new = f.__code__.replace(co_name="g")          # allowed: make a modified copy
print(new.co_name)

# OUTPUT:
# AttributeError: code objects are read-only
# g`],
        `
   source ──compile──► code object ─┬─ co_code      (instruction bytes)
                                    ├─ co_consts    (literals, folded constants)
                                    ├─ co_names     (global / attribute names)
                                    └─ co_varnames  (locals)
   import caches it:  __pycache__/mod.cpython-312.pyc
   run:  CPython VM  ──  LOAD_FAST a ─► LOAD_FAST b ─► BINARY_OP + ─► RETURN_VALUE   (stack machine)
`,
        `Read bytecode to understand performance and semantics, never to build features: opcodes change every release (3.11 added the adaptive specialising interpreter). If you need speed, profile, then reach for better algorithms, NumPy, Cython or a JIT. Ship source or wheels, and never rely on a .pyc as a security or portability mechanism.`
    ),

    'C Extensions & Python/C Interop': dd(
        [`Python can call native C code. Options from lowest to highest effort: <b>ctypes</b> (call any shared library with no compiler), <b>cffi</b>, <b>Cython</b> and <b>pybind11</b>/C++ bindings, and hand-written C extensions using the C API (<code>PyInit_name</code>, <code>PyObject*</code>). Here we use ctypes, which ships with Python.`,
            r`import ctypes, sys

# load the C runtime: msvcrt on Windows, the already-loaded libc elsewhere
libc = ctypes.CDLL("msvcrt") if sys.platform == "win32" else ctypes.CDLL(None)

libc.abs.argtypes = [ctypes.c_int]             # declare the C signature: int abs(int)
libc.abs.restype = ctypes.c_int
print(libc.abs(-7))                            # a real call into compiled C code

# OUTPUT:
# 7`],
        [`Python is slow in tight numeric loops and cannot re-implement decades of existing C/C++/Fortran libraries (OpenSSL, BLAS, SQLite, drivers). Interop lets Python orchestrate fast native code and reuse existing libraries.`,
            r`import ctypes

class Point(ctypes.Structure):                 # mirrors: struct Point { int x; int y; };
    _fields_ = [("x", ctypes.c_int), ("y", ctypes.c_int)]

p = Point(3, 4)
print(p.x + p.y, ctypes.sizeof(p))             # exactly 8 bytes, like the C struct
print(bytes(p))                                # raw memory (little-endian machine)

# OUTPUT:
# 7 8
# b'\x03\x00\x00\x00\x04\x00\x00\x00'`],
        [`NumPy, pandas, PyTorch, cryptography, lxml and database drivers are C/C++/Rust extensions with a Python face. Callbacks work too: here C's <code>qsort</code> calls back into a Python comparison function.`,
            r`import ctypes, sys

libc = ctypes.CDLL("msvcrt") if sys.platform == "win32" else ctypes.CDLL(None)

IntP = ctypes.POINTER(ctypes.c_int)
CMP = ctypes.CFUNCTYPE(ctypes.c_int, IntP, IntP)   # type of: int (*cmp)(int*, int*)

def py_cmp(a, b):
    return a[0] - b[0]                         # C passes pointers; index [0] reads the int

arr = (ctypes.c_int * 5)(5, 1, 4, 2, 3)        # a C array of 5 ints
libc.qsort(arr, len(arr), ctypes.sizeof(ctypes.c_int), CMP(py_cmp))
print(list(arr))

# OUTPUT:
# [1, 2, 3, 4, 5]`],
        [`<b>Advantages:</b> native speed, access to existing libraries, and zero-copy sharing of memory: a <code>memoryview</code> over a C array lets Python and C see the same bytes.`,
            r`import ctypes

buf = (ctypes.c_ubyte * 4)(1, 2, 3, 4)         # C memory owned by this array
view = memoryview(buf)                         # Python window onto the same bytes
view[0] = 99                                   # write through the view
print(list(buf), view.nbytes)

# OUTPUT:
# [99, 2, 3, 4] 4`],
        [`<b>Disadvantages:</b> no safety net. Wrong types or lengths corrupt memory or crash the interpreter with a segfault, and C integers silently wrap around instead of raising errors.`,
            r`import ctypes

print(ctypes.c_ubyte(257).value)               # 8-bit unsigned wraps: 257 % 256
print(ctypes.c_int(2**31).value)               # 32-bit signed overflow

# OUTPUT:
# 1
# -2147483648`],
        [`<b>Limitations:</b> ctypes needs you to restate every signature by hand (it cannot read headers), cannot call C++ templates, macros or inline functions, and binary extensions must be built per platform and Python version (wheels).`,
            r`import ctypes, sys

libc = ctypes.CDLL("msvcrt") if sys.platform == "win32" else ctypes.CDLL(None)
libc.abs.argtypes = [ctypes.c_int]

try:
    libc.abs("seven")                          # wrong type is caught only because we declared argtypes
except ctypes.ArgumentError:
    print("ArgumentError raised")

# OUTPUT:
# ArgumentError raised`],
        `
   Python code
      │  ctypes / cffi          (runtime, no compiler)
      │  Cython / pybind11      (compile step, nicer API)
      │  C API: PyInit_mod      (full control, most work)
      ▼
   ┌──────────────┐  PyObject* <-> C types   ┌───────────────────────┐
   │ CPython VM   │ ───────────────────────► │ native lib (.so/.dll) │
   │ (holds GIL)  │ ◄─────────────────────── │ fast loops, system API│
   └──────────────┘   result / callback      └───────────────────────┘
   release the GIL in long C calls so other threads can run
`,
        `Choose the thinnest binding that works: ctypes or cffi for calling existing C APIs, Cython or pybind11 for new hot paths, Rust with PyO3 when memory safety matters, and the raw C API only when you need maximum control. Build and test wheels in CI for each platform, use the stable ABI (abi3) to reduce rebuilds, release the GIL in long native sections, and define clear ownership rules for memory that crosses the boundary.`
    ),
};
