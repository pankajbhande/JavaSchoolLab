import type { Topic } from '../../types';

export const pathlibModule: Topic = {
    id: 'python-modules-packages-pathlib',
    name: 'pathlib',
    beginner: [
        {
            content: `<h4>Paths as Objects</h4>
<code>pathlib</code> (Python 3.4+) represents file-system paths as <code>Path</code> objects instead of plain strings. You join paths with the <code>/</code> operator, ask a path for its name or extension, and read or write files directly from it. It handles Windows <code>\\</code> and macOS/Linux <code>/</code> separators for you - it plays the role of <code>java.nio.file.Path</code> and <code>Files</code> in Java.`,
            codeExamples: [
                `from pathlib import Path

report = Path("data") / "2024" / "sales.csv"
print(report.as_posix())         # forward slashes on every OS
print(type(report).__name__)     # WindowsPath on Windows, PosixPath elsewhere

print(Path.cwd())                # current working directory
print(Path.home())               # your home folder

# OUTPUT (the last three lines depend on your machine - e.g.):
# data/2024/sales.csv
# WindowsPath
# C:\\Users\\abaji\\projects\\shop
# C:\\Users\\abaji`
            ]
        },
        {
            content: `<h4>Parts of a Path</h4>
These attributes only look at the text of the path - the file doesn't need to exist. <code>PurePosixPath</code> is used here so the output is identical on every operating system.`,
            codeExamples: [
                `from pathlib import PurePosixPath

p = PurePosixPath("/home/abaji/reports/sales.2024.csv")

print(p.name)           # final component
print(p.stem)           # name without the last suffix
print(p.suffix)         # last extension
print(p.suffixes)       # all extensions
print(p.parent)         # containing folder
print(p.parents[1])     # two levels up
print(p.parts)
print(p.with_suffix(".xlsx").name)
print(p.with_name("summary.txt"))

# OUTPUT:
# sales.2024.csv
# sales.2024
# .csv
# ['.2024', '.csv']
# /home/abaji/reports
# /home/abaji
# ('/', 'home', 'abaji', 'reports', 'sales.2024.csv')
# sales.2024.xlsx
# /home/abaji/reports/summary.txt`
            ]
        },
        {
            content: `<h4>Reading and Writing Files</h4>
<code>write_text</code>/<code>read_text</code> open, write/read and close the file in one call - always pass <code>encoding="utf-8"</code>. <code>write_bytes</code>/<code>read_bytes</code> do the same for binary data. The examples work inside a temporary folder that is deleted automatically afterwards.`,
            codeExamples: [
                `import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as tmp:
    notes = Path(tmp) / "notes.txt"
    print(notes.exists())

    notes.write_text("line 1\\nline 2\\n", encoding="utf-8")
    print(notes.exists(), notes.is_file(), notes.is_dir())
    print(notes.read_text(encoding="utf-8").splitlines())

    data = Path(tmp) / "data.bin"
    data.write_bytes(bytes([0, 255, 16]))
    print(data.read_bytes())

# OUTPUT:
# False
# True True False
# ['line 1', 'line 2']
# b'\\x00\\xff\\x10'`
            ]
        },
        {
            content: `<h4>Folders: mkdir, iterdir, glob</h4>
<code>mkdir(parents=True, exist_ok=True)</code> creates a folder and any missing parents, and doesn't complain if it already exists. <code>iterdir()</code> lists a folder; <code>glob()</code> matches a pattern in one folder and <code>rglob()</code> searches recursively. Their order isn't guaranteed, so sort the results.`,
            codeExamples: [
                `import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as tmp:
    project = Path(tmp) / "project"
    (project / "src" / "utils").mkdir(parents=True, exist_ok=True)

    (project / "README.md").write_text("# Demo", encoding="utf-8")
    (project / "src" / "app.py").write_text("print(1)", encoding="utf-8")
    (project / "src" / "utils" / "helpers.py").write_text("", encoding="utf-8")

    print(sorted(p.name for p in project.iterdir()))
    print(sorted(p.name for p in (project / "src").glob("*.py")))
    print(sorted(p.relative_to(project).as_posix() for p in project.rglob("*.py")))

# OUTPUT:
# ['README.md', 'src']
# ['app.py']
# ['src/app.py', 'src/utils/helpers.py']`
            ]
        },
        {
            content: `<h4>Renaming and Deleting</h4>
<code>rename()</code> returns the new <code>Path</code> (3.8+). <code>unlink()</code> deletes a file; <code>rmdir()</code> deletes an <b>empty</b> folder.`,
            codeExamples: [
                `import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as tmp:
    draft = Path(tmp) / "draft.txt"
    draft.write_text("v1", encoding="utf-8")

    final = draft.rename(draft.with_name("final.txt"))
    print(draft.exists(), final.name)

    final.unlink()
    print(final.exists())

    empty = Path(tmp) / "empty"
    empty.mkdir()
    empty.rmdir()
    print(empty.exists())

# OUTPUT:
# False final.txt
# False
# False`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>pathlib vs os.path</h3>
Older code uses string functions from <code>os</code> and <code>os.path</code>. Both still work; <code>pathlib</code> is the modern, more readable choice.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Task</th><th>os / os.path</th><th>pathlib</th></tr>
<tr class='text-center'><td>Join</td><td><code>os.path.join(a, b)</code></td><td><code>Path(a) / b</code></td></tr>
<tr class='text-center'><td>File name</td><td><code>os.path.basename(p)</code></td><td><code>p.name</code></td></tr>
<tr class='text-center'><td>Folder</td><td><code>os.path.dirname(p)</code></td><td><code>p.parent</code></td></tr>
<tr class='text-center'><td>Extension</td><td><code>os.path.splitext(p)[1]</code></td><td><code>p.suffix</code></td></tr>
<tr class='text-center'><td>Exists?</td><td><code>os.path.exists(p)</code></td><td><code>p.exists()</code></td></tr>
<tr class='text-center'><td>Make folders</td><td><code>os.makedirs(p, exist_ok=True)</code></td><td><code>p.mkdir(parents=True, exist_ok=True)</code></td></tr>
<tr class='text-center'><td>List a folder</td><td><code>os.listdir(p)</code></td><td><code>p.iterdir()</code></td></tr>
<tr class='text-center'><td>Find files</td><td><code>glob.glob("**/*.py", recursive=True)</code></td><td><code>p.rglob("*.py")</code></td></tr>
<tr class='text-center'><td>Read a file</td><td><code>open(p).read()</code></td><td><code>p.read_text(encoding="utf-8")</code></td></tr>
</table>
Most standard-library functions (<code>open</code>, <code>shutil</code>, <code>os</code>) accept <code>Path</code> objects directly.`
        },
        {
            content: `<h3>Pure Paths vs Concrete Paths</h3>
• <b>Pure paths</b> (<code>PurePath</code>, <code>PurePosixPath</code>, <code>PureWindowsPath</code>) only manipulate text - no file-system access. You can parse a Windows path on Linux and vice versa.<br>
• <b>Concrete paths</b> (<code>Path</code>) add file-system methods. <code>Path(...)</code> automatically creates a <code>WindowsPath</code> or <code>PosixPath</code> for the current OS.`,
            codeExamples: [
                `from pathlib import PureWindowsPath, PurePosixPath

w = PureWindowsPath(r"C:\\Users\\Abaji\\report.docx")
print(w.drive, w.name, w.suffix)
print(w.parent)
print(w.as_posix())

print(PurePosixPath("/srv/app") / "static" / "site.css")
print(PureWindowsPath("C:/data") == PureWindowsPath("c:\\\\DATA"))   # Windows paths are case-insensitive

# OUTPUT:
# C: report.docx .docx
# C:\\Users\\Abaji
# C:/Users/Abaji/report.docx
# /srv/app/static/site.css
# True`
            ]
        },
        {
            content: `<h3>Absolute Paths, resolve() and relative_to()</h3>
• <code>absolute()</code> prefixes the current directory; <code>resolve()</code> also follows symbolic links and removes <code>..</code> parts.<br>
• <code>relative_to(base)</code> gives the path relative to a base folder (and raises <code>ValueError</code> if it isn't inside it); <code>is_relative_to()</code> (3.9+) checks first.`,
            codeExamples: [
                `from pathlib import Path, PurePosixPath

print(Path("reports/../data/sales.csv").resolve())

css = PurePosixPath("/srv/app/static/css/site.css")
print(css.relative_to("/srv/app"))
print(css.is_relative_to("/srv/app"), css.is_relative_to("/etc"))

# OUTPUT (first line depends on your current folder - e.g.):
# /home/abaji/project/data/sales.csv
# static/css/site.css
# True False`
            ]
        },
        {
            content: `<h3>Files Next to Your Script: Path(__file__).parent</h3>
Relative paths like <code>Path("config.json")</code> are resolved against the <b>current working directory</b> - wherever the user launched Python from, not where the script lives. To load a file shipped alongside your code, build the path from <code>__file__</code>.`,
            codeExamples: [
                `from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CONFIG = BASE_DIR / "config.json"

print(CONFIG.name, CONFIG.parent == BASE_DIR)

# OUTPUT:
# config.json True
# CONFIG is now correct no matter which folder you run the script from`
            ]
        },
        {
            content: `<h3>File Metadata with stat()</h3>
<code>stat()</code> returns size, timestamps and permissions.`,
            codeExamples: [
                `import tempfile
from datetime import datetime
from pathlib import Path

with tempfile.TemporaryDirectory() as tmp:
    f = Path(tmp) / "hello.txt"
    f.write_text("hello", encoding="utf-8")
    info = f.stat()
    print(info.st_size, "bytes")
    print(datetime.fromtimestamp(info.st_mtime))

# OUTPUT (the timestamp is when you run it - e.g.):
# 5 bytes
# 2026-10-04 18:30:12.345678`
            ]
        },
        {
            content: `<h3>Whole Folders: shutil</h3>
<code>pathlib</code> works on single files and empty folders. For copying, moving and deleting <b>trees</b>, use <code>shutil</code>, which accepts <code>Path</code> objects: <code>copy2</code>, <code>copytree</code>, <code>move</code>, <code>rmtree</code>. Be careful - <code>rmtree</code> deletes everything inside, with no recycle bin.`,
            codeExamples: [
                `import shutil
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as tmp:
    src = Path(tmp) / "src"
    (src / "sub").mkdir(parents=True)
    (src / "sub" / "a.txt").write_text("A", encoding="utf-8")

    backup = shutil.copytree(src, Path(tmp) / "backup")
    print(sorted(p.relative_to(backup).as_posix() for p in backup.rglob("*")))

    shutil.rmtree(src)
    print(src.exists(), backup.exists())

# OUTPUT:
# ['sub', 'sub/a.txt']
# False True`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why prefer pathlib over os.path?</td><td>Paths are objects with readable methods and the / operator; separators are handled per OS</td></tr>
<tr class='text-center'><td>stem vs suffix vs name?</td><td>For "report.csv": name "report.csv", stem "report", suffix ".csv"</td></tr>
<tr class='text-center'><td>How do you create nested folders safely?</td><td><code>p.mkdir(parents=True, exist_ok=True)</code></td></tr>
<tr class='text-center'><td>How do you find all .py files recursively?</td><td><code>Path(".").rglob("*.py")</code></td></tr>
<tr class='text-center'><td>PurePath vs Path?</td><td>PurePath only manipulates the path text; Path adds file-system operations</td></tr>
<tr class='text-center'><td>How do you open a file located next to the script?</td><td><code>Path(__file__).resolve().parent / "file.txt"</code></td></tr>
<tr class='text-center'><td>How do you delete a non-empty folder?</td><td><code>shutil.rmtree(path)</code> - rmdir() only removes empty folders</td></tr>
</table>`
        }
    ]
};
