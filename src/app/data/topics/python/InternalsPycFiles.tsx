import type { Topic } from '../../types';

export const internalsPycFiles: Topic = {
    id: 'python-internals-pyc-files-pycache',
    name: '.pyc Files & __pycache__',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>.pyc</b> file is the compiled bytecode of a module, stored in a <code>__pycache__</code> folder so the next import can skip compilation. Its name carries the interpreter version, for example <code>mod.cpython-312.pyc</code>. The file starts with a 16-byte header (magic number, flags, timestamp or hash, source size) followed by a <code>marshal</code>-serialised code object. It is similar in spirit to a Java <code>.class</code> file, but it is a disposable cache, not a deliverable.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 262 244" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:262px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="241.7" height="46" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="130.9" y="29.5">magic number (4 bytes)</tspan><tspan x="130.9" y="44.5">identifies the Python version</tspan></text><rect x="10" y="62" width="241.7" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="130.9" y="81.5">flags (4 bytes)</tspan></text><rect x="10" y="99" width="241.7" height="46" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="130.9" y="118.5">mtime or hash (4 bytes)</tspan><tspan x="130.9" y="133.5">staleness check</tspan></text><rect x="10" y="151" width="241.7" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="130.9" y="170.5">source size (4 bytes)</tspan></text><rect x="10" y="188" width="241.7" height="46" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="130.9" y="207.5">marshal data</tspan><tspan x="130.9" y="222.5">the serialised code object</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: layout of a .pyc file (Python 3.7+): 16-byte header, then the code object</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Without a cache, every import would re-tokenize, re-parse and re-compile the source, making start-up of large programs noticeably slower - and you would not understand the mysterious <code>__pycache__</code> folders.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Speed up <b>start-up</b> by reusing compiled bytecode when the source is unchanged.</li>
<li>Keep caches for several Python versions side by side via the cache tag.</li>
<li>Decide what to commit (never <code>__pycache__</code>) and what is safe to delete.</li>
<li>Understand how Python detects stale caches (timestamp or hash in the header).</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Create a .pyc, read its header, run it</h4>
The program compiles a tiny module in a temporary folder, inspects the resulting .pyc file and executes the cached code object.`,
            codeExamples: [
                `import importlib.util
import marshal
import os
import py_compile
import tempfile

HEADER_SIZE = 16                      # magic + flags + mtime/hash + size (3.7+)
SOURCE = "GREETING = 'hello from cache'\\n"


def build_pyc(folder):
    source_path = os.path.join(folder, "mod.py")
    with open(source_path, "w") as handle:
        handle.write(SOURCE)
    return py_compile.compile(source_path)


def read_bytes(path):
    with open(path, "rb") as handle:
        return handle.read()


def main():
    with tempfile.TemporaryDirectory() as folder:
        pyc_path = build_pyc(folder)
        print(os.path.basename(os.path.dirname(pyc_path)))
        print(pyc_path.endswith(".pyc"))

        data = read_bytes(pyc_path)
        print(data[:4] == importlib.util.MAGIC_NUMBER)

        code = marshal.loads(data[HEADER_SIZE:])
        print(code.co_name)

        namespace = {}
        exec(code, namespace)
        print(namespace["GREETING"])


if __name__ == "__main__":
    main()

# OUTPUT:
# __pycache__
# True
# True
# <module>
# hello from cache`
            ],
            codeExplanations: [
                `py_compile writes the .pyc into a __pycache__ folder beside the source. The first four bytes equal importlib.util.MAGIC_NUMBER, which changes with the Python version. Skipping the 16-byte header, marshal.loads rebuilds the module's code object (named <module>), and exec() runs it without ever reading the source again.`
            ]
        },
        {
            content: `<h4>What is the __pycache__ Folder?</h4>
After you <b>import</b> a module, a folder named <code>__pycache__</code> appears beside it, holding files like <code>helpers.cpython-312.pyc</code>. A <b>.pyc</b> file is the <b>compiled bytecode</b> of that module, saved so Python can skip the compile step next time. It is a cache: delete it and Python simply regenerates it.
<pre>myproject/
  main.py                      &lt;- the script you run: NOT cached
  helpers.py
  __pycache__/
    helpers.cpython-312.pyc    &lt;- bytecode of helpers.py for CPython 3.12</pre>
The file name shows the <b>Python version</b> (<code>cpython-312</code> = CPython 3.12), so different versions keep separate caches side by side.`
        },
        {
            content: `<h4>Faster Start-Up, Not Faster Code</h4>
A .pyc saves only the <b>compilation</b> time when a module is loaded. Once loaded, the code runs exactly as fast as it would without the cache. That is why the script you run directly (<code>main.py</code>) is not cached: it is loaded only once, so caching it would not help.`
        },
        {
            content: `<h4>Finding the Cache Path</h4>`,
            codeExamples: [
                `import importlib.util
import sys

print(sys.implementation.cache_tag)
path = importlib.util.cache_from_source("helpers.py")
print(path.replace("\\\\", "/"))

# OUTPUT (CPython 3.12):
# cpython-312
# __pycache__/helpers.cpython-312.pyc`
            ],
            codeExplanations: [
                `cache_from_source() applies the standard naming rule: a __pycache__ folder next to the source, and the interpreter's cache tag inserted before the .pyc extension. The replace() call only makes the Windows backslash path print like the others.`
            ]
        },
        {
            content: `<h4>Should You Commit It?</h4>
<ul>
<li><b>No</b> - add <code>__pycache__/</code> and <code>*.pyc</code> to <code>.gitignore</code>. They are generated, machine- and version-specific files.</li>
<li>It is always <b>safe to delete</b> them.</li>
<li>To stop Python writing them (for example in a read-only container) run with <code>python -B</code> or set <code>PYTHONDONTWRITEBYTECODE=1</code>.</li>
</ul>`
        }
    ],

    expert: [
        {
            content: `<h3>Anatomy of a .pyc File</h3>
Since Python 3.7 a .pyc has a <b>16-byte header</b> followed by a <b>marshalled code object</b> (the compiled module, serialized with the <code>marshal</code> module):
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Bytes</th><th>Meaning</th></tr>
<tr class='text-center'><td>0-3</td><td><b>Magic number</b> - identifies the bytecode version; changes in every minor Python release</td></tr>
<tr class='text-center'><td>4-7</td><td><b>Flags</b> - say whether validation uses timestamp or hash (PEP 552)</td></tr>
<tr class='text-center'><td>8-15</td><td>Source file modification time + size, <i>or</i> a hash of the source</td></tr>
<tr class='text-center'><td>16 onward</td><td>The marshalled code object</td></tr>
</table>`,
            codeExamples: [
                `import importlib.util
import marshal
import os
import py_compile
import tempfile

folder = tempfile.mkdtemp()
source = os.path.join(folder, "hello.py")
with open(source, "w") as f:
    f.write("print('hello from a .pyc')\\n")

pyc_path = py_compile.compile(source, cfile=os.path.join(folder, "hello.pyc"))

with open(pyc_path, "rb") as f:
    header = f.read(16)
    code = marshal.load(f)

print(header[:4] == importlib.util.MAGIC_NUMBER)
print(len(header))
exec(code)

# OUTPUT:
# True
# 16
# hello from a .pyc`
            ]
        },
        {
            content: `<h3>How Python Decides the Cache Is Stale</h3>
On every import Python compares the header with the source file:
<ul>
<li><b>Timestamp-based (default):</b> the recorded modification time and size must match the .py file. Edit the file and the cache is ignored and rewritten.</li>
<li><b>Hash-based (PEP 552):</b> the header holds a hash of the source. <i>Checked</i> hash pycs re-hash the source on import; <i>unchecked</i> hash pycs are trusted without checking, which gives <b>reproducible builds</b> (identical output for identical input) - useful for packaging and deployment.</li>
<li>If the magic number differs (a different Python version) the file is ignored.</li>
</ul>`,
            codeExamples: [
                `import py_compile

py_compile.compile(
    "helpers.py",
    invalidation_mode=py_compile.PycInvalidationMode.CHECKED_HASH,
)

# Or pre-compile a whole tree (what installers like pip do):
#   python -m compileall src/
#   python -m compileall --invalidation-mode checked-hash src/`
            ]
        },
        {
            content: `<h3>Controlling Where Bytecode Is Written</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Setting</th><th>Effect</th></tr>
<tr class='text-center'><td><code>python -B</code>, <code>PYTHONDONTWRITEBYTECODE=1</code>, <code>sys.dont_write_bytecode</code></td><td>Don't write .pyc files</td></tr>
<tr class='text-center'><td><code>PYTHONPYCACHEPREFIX=/tmp/pycache</code> (3.8+)</td><td>Write all caches under one separate directory tree instead of beside the sources</td></tr>
<tr class='text-center'><td><code>python -m compileall</code></td><td>Pre-compile everything now (faster first start-up in containers)</td></tr>
<tr class='text-center'><td><code>module.__cached__</code></td><td>The path of the .pyc a loaded module used</td></tr>
</table>
In Docker, a common pattern is <code>PYTHONDONTWRITEBYTECODE=1</code> for development images (no clutter in mounted volumes) and an explicit <code>compileall</code> step in production images (no compile work on cold start).`
        },
        {
            content: `<h3>Myths and Pitfalls</h3>
<ul>
<li><b>A .pyc is not "protected" code.</b> Bytecode is easily disassembled (<code>dis</code>) and often decompiled back to near-original source. Shipping only .pyc files is obscurity, not security.</li>
<li><b>Bytecode is not portable between versions.</b> A 3.11 .pyc will not run on 3.12 (different magic number and instruction set). It <i>is</i> portable across operating systems for the same version.</li>
<li><b>Stale caches after clock problems:</b> timestamp validation can be fooled if files are restored with misleading mtimes; hash-based pycs avoid this.</li>
<li><b>Read-only installs:</b> if Python cannot write the cache it silently runs without it - correct but slower to start.</li>
<li><b>Source-less distribution:</b> a <code>.pyc</code> placed directly next to (not inside) the missing <code>.py</code> can still be imported; <code>zipapp</code> bundles also use this machinery.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Faster start-up: the compile step is skipped on later imports</td><td>Does not make running code faster, only loading it</td></tr>
<tr><td>Versioned file names let several Pythons share one source tree</td><td>Not portable between Python versions</td></tr>
<tr><td>Automatic: stale caches are detected and regenerated</td><td>Clutters the folder tree and must be git-ignored</td></tr>
<tr><td>Safe to delete at any time</td><td>Shipping only .pyc files is weak protection for source code</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a .pyc file?</td><td>Cached compiled bytecode of a module, stored in <code>__pycache__</code></td></tr>
<tr class='text-center'><td>Does it make the program run faster?</td><td>No - only the loading of imported modules (it skips recompiling)</td></tr>
<tr class='text-center'><td>Why isn't the main script cached?</td><td>It is loaded once, so caching would give no benefit</td></tr>
<tr class='text-center'><td>How does Python know a .pyc is outdated?</td><td>By the source's modification time and size stored in the header, or by a source hash for hash-based pycs; the magic number must also match the version</td></tr>
<tr class='text-center'><td>Is it safe to delete __pycache__?</td><td>Yes - it is regenerated on the next import</td></tr>
</table>`
        }
    ]
};
