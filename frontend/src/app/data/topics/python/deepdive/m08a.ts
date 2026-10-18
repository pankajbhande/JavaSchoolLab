// Module 8 (Modules & Packages), part A: import mechanics, modules, packages, paths, os/sys.
import { dd, r, type DeepDive } from './deepDive';

export const m08a: Record<string, DeepDive> = {
    'import & from ... import': dd(
        [`<code>import m</code> loads module <code>m</code> and binds the name <code>m</code>; you use <code>m.name</code>. <code>from m import name</code> copies a specific name into your namespace.`,
            r`import math                       # whole module: use math.sqrt
from math import pi, floor         # specific names: use directly
print(math.sqrt(16), pi, floor(2.7))

# OUTPUT:
# 4.0 3.141592653589793 2`],
        [`Nobody writes everything from scratch. Imports reuse the standard library, third-party packages and your own files, and keep code organised.`,
            r`# Without import you would re-implement everything
from statistics import mean, median
scores = [70, 80, 90, 100]
print(mean(scores), median(scores))

# OUTPUT:
# 85 85.0`],
        [`Every real script starts with imports: web frameworks, data libraries, logging, file and date handling.`,
            r`# Typical script header
import os
import sys
from datetime import date
from pathlib import Path

print(isinstance(os.getcwd(), str), sys.version_info.major, date(2024, 3, 1).year, Path("a/b.txt").suffix)

# OUTPUT:
# True 3 2024 .txt`],
        [`<b>Advantages:</b> a module is imported only once and cached in <code>sys.modules</code>, so repeated imports are cheap.`,
            r`import sys
import json
import json                                  # second import: no reload
print("json" in sys.modules, sys.modules["json"] is json)

# OUTPUT:
# True True`],
        [`<b>Disadvantages:</b> <code>from m import *</code> pollutes the namespace and name clashes silently overwrite earlier names.`,
            r`from math import *
print(sqrt(9))
sqrt = "oops"                                # you just shadowed math.sqrt
try:
    print(sqrt(9))
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# 3.0
# TypeError: 'str' object is not callable`],
        [`<b>Limitations:</b> circular imports (a imports b, b imports a) fail with partially initialised modules, and <code>from m import name</code> binds a copy of the reference, so later changes in m are not seen.`,
            r`import types, sys
cfg = types.ModuleType("cfg"); cfg.level = 1
sys.modules["cfg"] = cfg                     # a stand-in module
from cfg import level                        # copies the value 1
cfg.level = 2
print(level, cfg.level)                      # level did not follow

# OUTPUT:
# 1 2`],
        `
   import m
      |  1. look in sys.modules (cache) --found--> bind name m
      |  2. search sys.path for m.py / package
      |  3. compile + execute module body once
      +--4. store in sys.modules, bind name
   from m import x  ==> same, then bind only x
`,
        `Import at the top of the file, one module per line, grouped stdlib / third-party / local (PEP 8). Avoid star imports. Break import cycles by moving shared code to a third module or importing inside the function; heavy imports can be lazy to cut start-up time (CLI tools).`
    ),

    'Import Aliases': dd(
        [`<code>as</code> gives an import a shorter or different local name: <code>import numpy as np</code>, <code>from math import sqrt as root</code>.`,
            r`import datetime as dt
from math import sqrt as root
print(dt.date(2024, 5, 17).isoformat(), root(25))

# OUTPUT:
# 2024-05-17 5.0`],
        [`Long module names are tedious to type, and two modules may export the same name. Aliases solve both.`,
            r`from json import loads as json_loads
from ast import literal_eval as py_eval      # both could be called "loads"/"eval"
print(json_loads("[1, 2]"), py_eval("(1, 2)"))

# OUTPUT:
# [1, 2] (1, 2)`],
        [`Community conventions: <code>np</code>, <code>pd</code>, <code>plt</code>, <code>tf</code>. Also used to choose an implementation by availability.`,
            r`try:
    import ujson as fastjson                 # optional faster library
except ImportError:
    import json as fastjson                  # fallback, same API
print(fastjson.dumps({"a": 1}))

# OUTPUT:
# {"a": 1}`],
        [`<b>Advantages:</b> shorter code, avoids clashes, lets you swap implementations without changing call sites.`,
            r`import collections as c, itertools as it
print(c.Counter("hello").most_common(1), list(it.islice(it.count(), 3)))

# OUTPUT:
# [('l', 2)] [0, 1, 2]`],
        [`<b>Disadvantages:</b> nonstandard aliases confuse readers, and aliasing can hide where a name comes from.`,
            r`import random as math              # legal but terrible
print(math.__name__)                 # the real module name is unchanged

# OUTPUT:
# random`],
        [`<b>Limitations:</b> an alias only renames your local binding; <code>import a.b as x</code> needs a real submodule, and the original name is not defined.`,
            r`import os.path as osp
try:
    print(os)                        # "os" itself was NOT bound by "import os.path as osp"
except NameError as e:
    print("NameError:", e)

# OUTPUT:
# NameError: name 'os' is not defined`],
        `
   import numpy as np
       real module object  <---- name "np" (your namespace)
   sys.modules["numpy"]    <---- same object, still cached under its real name
`,
        `Use only the community-standard aliases; elsewhere prefer full names for clarity. Optional-dependency fallbacks via try/except ImportError are fine at library edges, but hide them behind one adapter module.`
    ),

    '__name__ & __main__': dd(
        [`Every module has a <code>__name__</code>. When a file is run directly it is <code>"__main__"</code>; when imported it is the module name. The guard <code>if __name__ == "__main__":</code> runs code only on direct execution.`,
            r`# file: tool.py
def greet():
    return "hello"

print("module name is", __name__)
if __name__ == "__main__":
    print("running as a script:", greet())

# OUTPUT (python tool.py):
# module name is __main__
# running as a script: hello
# OUTPUT (import tool):
# module name is tool`],
        [`A file is often both a reusable library and a script. Without the guard, importing it would execute the script part and spam output or start servers.`,
            r`import io, contextlib, types
src = 'print("side effect!")\nif __name__ == "__main__":\n    print("main only")'
mod = types.ModuleType("lib")                 # simulate importing under the name "lib"
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    exec(src, mod.__dict__)
print(repr(buf.getvalue()))

# OUTPUT:
# 'side effect!\n'`],
        [`Every CLI program uses it, and test files use it to run tests when executed directly.`,
            r`import sys
def main(argv):
    print("args:", argv)
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))             # exit code to the shell

# OUTPUT (python app.py a b):
# args: ['a', 'b']`],
        [`<b>Advantages:</b> reuse + execution in one file, easy unit testing of <code>main()</code>, clean exit codes.`,
            r`def main():
    return 42
# tests can import main and call it directly, without running the script part
print(main())

# OUTPUT:
# 42`],
        [`<b>Disadvantages:</b> logic placed directly under the guard cannot be imported or tested; multiprocessing on Windows/macOS needs the guard or it spawns recursively.`,
            r`# Windows/macOS multiprocessing (spawn) re-imports the main module.
# Without the guard each child would re-run the pool creation!
from multiprocessing import Pool
def sq(x): return x * x

if __name__ == "__main__":
    with Pool(2) as p:
        print(p.map(sq, [1, 2, 3]))

# OUTPUT:
# [1, 4, 9]`],
        [`<b>Limitations:</b> it only distinguishes "run as main" from "imported"; it says nothing about packages. Use <code>python -m pkg</code> with <code>__main__.py</code> for package entry points.`,
            r`# Inside a package run with "python -m mypkg" the module is mypkg.__main__
print(__name__ == "__main__")        # True for the entry script, False otherwise

# OUTPUT (python script.py):
# True`],
        `
   python tool.py            import tool
        |                         |
   __name__ == "__main__"    __name__ == "tool"
        |                         |
   guard block RUNS          guard block SKIPPED (only defs load)
`,
        `Keep the guard body to one call: sys.exit(main()). Put real logic in importable functions so it can be unit-tested and reused, and expose entry points via pyproject console_scripts rather than telling users to run files by path.`
    ),

    'Creating Modules': dd(
        [`Any <code>.py</code> file is a module. Its top-level names (functions, classes, variables) become attributes of the module object when imported.`,
            r`# Build a module file at run time so the example is self-contained
import pathlib, sys
pathlib.Path("shapes.py").write_text("PI = 3.14\ndef area(r):\n    return PI * r * r\n")
sys.path.insert(0, ".")                    # make sure the current folder is searched
import shapes
print(shapes.area(2), shapes.__name__)

# OUTPUT:
# 12.56 shapes`],
        [`Large programs in one file are unreadable. Modules split code by responsibility and let teams work in parallel.`,
            r`import shapes
print([n for n in dir(shapes) if not n.startswith("__")])   # public contents

# OUTPUT:
# ['PI', 'area']`],
        [`<code>utils.py</code>, <code>config.py</code>, <code>models.py</code> are the usual project building blocks; each is imported where needed.`,
            r`import shapes, os
print(os.path.basename(shapes.__file__))        # where the module lives

# OUTPUT:
# shapes.py`],
        [`<b>Advantages:</b> reuse, namespaces (<code>shapes.area</code> vs another <code>area</code>), and <code>__all__</code> to define the public API.`,
            r`import pathlib, sys
pathlib.Path("api.py").write_text("__all__ = ['pub']\ndef pub(): return 1\ndef _private(): return 2\n")
ns = {}
exec("from api import *", ns)
print(sorted(k for k in ns if not k.startswith("__")))

# OUTPUT:
# ['pub']`],
        [`<b>Disadvantages:</b> module-level code runs at import time (slow or side-effecting imports); modules are singletons, so shared mutable state leaks between users.`,
            r`import pathlib, sys, importlib
pathlib.Path("state.py").write_text("items = []\n")
import state
state.items.append(1)
import state as again                  # same module object
print(again.items)

# OUTPUT:
# [1]`],
        [`<b>Limitations:</b> a file named like a standard module (random.py, json.py) shadows it; edits are not seen by a running program unless you <code>importlib.reload</code>.`,
            r`import pathlib, importlib, shapes
pathlib.Path("shapes.py").write_text("PI = 3.0\ndef area(r):\n    return PI * r * r\n")
print(shapes.PI)                       # still the old version in memory
importlib.reload(shapes)
print(shapes.PI)

# OUTPUT:
# 3.14
# 3.0`],
        `
   shapes.py                     main.py
   +--------------+              import shapes
   | PI = 3.14    |  -------->   shapes.PI
   | def area(r)  |              shapes.area(2)
   +--------------+      (module object cached in sys.modules)
`,
        `Keep modules cohesive and import-light: no work at import time except definitions. Avoid module-level mutable globals; pass dependencies in or use explicit objects. Never name your files after stdlib modules.`
    ),

    'Creating Packages & __init__.py': dd(
        [`A <b>package</b> is a directory of modules. <code>__init__.py</code> marks it (optional for namespace packages since 3.3) and runs when the package is imported, so it can expose a simple public API.`,
            r`import pathlib, sys
root = pathlib.Path("shop"); (root / "pay").mkdir(parents=True, exist_ok=True)
(root / "__init__.py").write_text("")
(root / "pay" / "__init__.py").write_text("from .card import charge\n")
(root / "pay" / "card.py").write_text("def charge(x):\n    return f'charged {x}'\n")
sys.path.insert(0, ".")
import shop.pay
print(shop.pay.charge(50))

# OUTPUT:
# charged 50`],
        [`Hundreds of modules need hierarchy. Packages group related modules and give dotted names (<code>shop.pay.card</code>) that avoid clashes.`,
            r`import shop.pay.card
print(shop.pay.card.__name__, shop.pay.__package__)

# OUTPUT:
# shop.pay.card shop.pay`],
        [`Every library is a package: <code>django.db.models</code>, <code>numpy.linalg</code>. Applications use packages such as <code>app/api</code>, <code>app/services</code>.`,
            r`import json, email
print(json.__path__ is not None, hasattr(email, "__path__"))   # packages have __path__

# OUTPUT:
# True True`],
        [`<b>Advantages:</b> <code>__init__.py</code> can re-export names, so users write <code>from shop.pay import charge</code> and internal layout can change freely.`,
            r`from shop.pay import charge          # short public path
from shop.pay.card import charge as c2
print(charge is c2)

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> heavy code in <code>__init__.py</code> slows every import of any submodule, and re-exports create import cycles easily.`,
            r`import pathlib, sys, time
pathlib.Path("slowpkg").mkdir(exist_ok=True)
pathlib.Path("slowpkg/__init__.py").write_text("import time; time.sleep(0.2)\n")
pathlib.Path("slowpkg/tiny.py").write_text("X = 1\n")
t = time.perf_counter()
import slowpkg.tiny                    # pays the __init__ cost just to get X
print(round(time.perf_counter() - t, 1) >= 0.2)

# OUTPUT:
# True`],
        [`<b>Limitations:</b> a missing <code>__init__.py</code> still imports as a namespace package, which can hide packaging mistakes; relative imports only work inside packages, not scripts.`,
            r`import pathlib
pathlib.Path("nsdemo").mkdir(exist_ok=True)
pathlib.Path("nsdemo/mod.py").write_text("Y = 2\n")   # no __init__.py
import nsdemo.mod
print(nsdemo.__file__, nsdemo.mod.Y)

# OUTPUT:
# None 2`],
        `
   shop/                      import shop.pay.card
   +-- __init__.py              1. import shop      (runs shop/__init__.py)
   +-- pay/                     2. import shop.pay  (runs pay/__init__.py)
   |    +-- __init__.py         3. import shop.pay.card
   |    +-- card.py
   +-- cart.py
`,
        `Keep __init__.py tiny: define the public API with __all__ and light re-exports, no heavy work. Use src/ layout and pyproject.toml so tests run against the installed package. Split packages by domain, not by technical type, and keep dependencies pointing one way.`
    ),

    'Absolute vs Relative Imports': dd(
        [`<b>Absolute</b> imports give the full path from a top-level package (<code>from shop.pay import card</code>). <b>Relative</b> imports use dots: <code>.</code> current package, <code>..</code> parent.`,
            r`import pathlib, sys
b = pathlib.Path("rel"); (b / "sub").mkdir(parents=True, exist_ok=True)
(b / "__init__.py").write_text("")
(b / "sub" / "__init__.py").write_text("")
(b / "util.py").write_text("def tag(): return 'util'\n")
(b / "sub" / "a.py").write_text("from rel.util import tag as abs_tag\nfrom ..util import tag as rel_tag\n")
sys.path.insert(0, ".")
import rel.sub.a as a
print(a.abs_tag(), a.rel_tag())

# OUTPUT:
# util util`],
        [`Absolute imports are explicit and survive file moves within a package; relative imports keep a package self-contained and rename-proof as a whole.`,
            r`import rel.sub.a as a
print(a.abs_tag is a.rel_tag)        # both point to the very same function

# OUTPUT:
# True`],
        [`Large codebases: PEP 8 recommends absolute imports; inside tightly coupled sub-packages relative imports (<code>from . import x</code>) are common.`,
            r`# Inside rel/sub/a.py the dots mean:
#   from .   import b      -> rel.sub.b
#   from ..  import util   -> rel.util
#   from ..util import tag -> rel.util.tag
import rel.sub.a as a
print(a.__package__)

# OUTPUT:
# rel.sub`],
        [`<b>Advantages:</b> absolute = readable and greppable; relative = short and package-rename safe.`,
            r`import importlib
m = importlib.import_module(".util", package="rel")   # resolve relative name by hand
print(m.__name__)

# OUTPUT:
# rel.util`],
        [`<b>Disadvantages:</b> relative imports are harder to read in deep trees; absolute imports break if the top-level package is renamed.`,
            r`# Reaching too high is an error
import pathlib, sys
pathlib.Path("rel/bad.py").write_text("from ... import nothing\n")
try:
    import rel.bad
except ImportError as e:
    print("ImportError:", e)

# OUTPUT:
# ImportError: attempted relative import beyond top-level package`],
        [`<b>Limitations:</b> relative imports work only in modules that are part of a package; running such a file as a script fails.`,
            r`try:
    exec("from . import x", {"__name__": "__main__"})     # as if run directly
except ImportError as e:
    print("ImportError:", e)

# OUTPUT:
# ImportError: attempted relative import with no known parent package`],
        `
   rel/                    from .util   -> rel.util       (same level)
   +-- util.py             from ..util  -> rel.util       (from rel.sub.a)
   +-- sub/                from rel.util-> rel.util       (absolute, always same)
        +-- a.py
`,
        `Default to absolute imports (clearer in reviews and tools); use relative ones only within a cohesive subpackage you may relocate. Enforce import direction with a linter (import-linter) so layers do not form cycles.`
    ),

    'sys.path': dd(
        [`<code>sys.path</code> is the list of directories Python searches for modules, in order: the script folder, <code>PYTHONPATH</code>, the standard library, then site-packages.`,
            r`import sys
print(type(sys.path).__name__, len(sys.path) > 0)
print(sys.path[0] == "" or isinstance(sys.path[0], str))

# OUTPUT:
# list True
# True`],
        [`If a module is not on <code>sys.path</code>, import fails with ModuleNotFoundError. Knowing the path explains most "it works on my machine" import bugs.`,
            r`try:
    import not_a_real_module
except ModuleNotFoundError as e:
    print("ModuleNotFoundError:", e.name)

# OUTPUT:
# ModuleNotFoundError: not_a_real_module`],
        [`Scripts and tests add project folders; plugin systems add a plugin directory at run time; virtual environments just put their site-packages on the path.`,
            r`import sys, pathlib
pathlib.Path("plugins").mkdir(exist_ok=True)
pathlib.Path("plugins/hello_plugin.py").write_text("def run(): return 'plugin ran'\n")
sys.path.append("plugins")              # now importable by name
import hello_plugin
print(hello_plugin.run())

# OUTPUT:
# plugin ran`],
        [`<b>Advantages:</b> it is a plain list you can modify at run time; <code>importlib.util</code> can also load a file from any path.`,
            r`import importlib.util
spec = importlib.util.spec_from_file_location("hp", "plugins/hello_plugin.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)            # load by path, no sys.path change
print(mod.run())

# OUTPUT:
# plugin ran`],
        [`<b>Disadvantages:</b> order matters and a stray folder at the front can shadow real modules; global mutable path edits affect the entire process.`,
            r`import sys, pathlib
pathlib.Path("shadow").mkdir(exist_ok=True)
pathlib.Path("shadow/random.py").write_text("NAME = 'fake random'\n")
sys.path.insert(0, "shadow")
sys.modules.pop("random", None)         # force a fresh import for the demo
import random
print(random.NAME)
sys.path.remove("shadow"); sys.modules.pop("random", None)

# OUTPUT:
# fake random`],
        [`<b>Limitations:</b> changes made to <code>sys.path</code> last only for that process; the path is read at start-up from environment and site config, and does not follow newly created directories automatically.`,
            r`import sys, os
print("PYTHONPATH" in os.environ)     # usually False unless you set it
print(any("site-packages" in p or "dist-packages" in p for p in sys.path))

# OUTPUT (example):
# False
# True`],
        `
   import foo  --> search in order:
     1. script dir / ""      (sys.path[0])
     2. PYTHONPATH entries
     3. standard library
     4. site-packages (installed packages, venv)
     first match wins  -->  else ModuleNotFoundError
`,
        `Prefer installing your project (pip install -e .) over editing sys.path or PYTHONPATH. Mutating sys.path in library code is a smell; use entry points or importlib for plugin loading and keep paths explicit and configurable.`
    ),

    'os & sys': dd(
        [`<code>os</code> talks to the operating system (files, directories, environment, processes); <code>sys</code> talks to the interpreter (arguments, path, exit, stdin/stdout, version).`,
            r`import os, sys
print(os.name in ("nt", "posix"), os.path.join("a", "b.txt").replace("\\", "/"))
print(sys.argv[0] != "", sys.platform in ("win32", "linux", "darwin"))

# OUTPUT:
# True a/b.txt
# True True`],
        [`Programs need the current folder, environment variables, command-line arguments and exit codes - things the language itself does not provide.`,
            r`import os
os.environ["APP_MODE"] = "test"                 # set for this process
print(os.environ.get("APP_MODE"), os.getenv("MISSING", "default"))

# OUTPUT:
# test default`],
        [`Deployment config via environment variables, CLI tools reading <code>sys.argv</code>, scripts listing and creating directories, returning exit codes to CI.`,
            r`import os, sys
os.makedirs("out/reports", exist_ok=True)
open("out/reports/a.txt", "w").close()
print(sorted(os.listdir("out/reports")))
print(os.path.exists("out"), os.path.isdir("out/reports"))

# OUTPUT:
# ['a.txt']
# True True`],
        [`<b>Advantages:</b> cross-platform wrappers (<code>os.path.join</code>, <code>os.sep</code>), process control (<code>os.getpid</code>), streams via <code>sys.stdin/stdout/stderr</code>.`,
            r`import sys
sys.stdout.write("to stdout\n")
sys.stderr.write("to stderr\n")        # separate stream, can be redirected independently
print(sys.getsizeof([]) > 0, sys.maxsize > 2**31)

# OUTPUT:
# to stdout
# to stderr
# True True`],
        [`<b>Disadvantages:</b> <code>os.system</code> and string paths are easy to misuse (injection, wrong separators); a lot of overlap with pathlib and subprocess now.`,
            r`import os
p = "data" + "/" + "file.txt"               # hard-coded separator: fragile
q = os.path.join("data", "file.txt")        # portable
print(q.replace("\\", "/") == p)

# OUTPUT:
# True`],
        [`<b>Limitations:</b> behaviour differs by OS (permissions, case sensitivity, signals), environment changes affect only the current process and its children, and <code>os.environ</code> values must be strings.`,
            r`import os
try:
    os.environ["PORT"] = 8080               # must be str
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: str expected, not int`],
        `
   your program
     |-- os  --> operating system : files, dirs, env vars, pids
     |-- sys --> interpreter      : argv, path, modules, stdin/out/err, exit()
   sys.exit(2) --> shell sees exit code 2
`,
        `Use os for OS facilities but pathlib for paths, subprocess for commands, and argparse/typer instead of raw sys.argv. Read configuration once from the environment at start-up into a typed settings object (12-factor) rather than scattering os.getenv calls.`
    )
};
