import type { Topic } from '../../types';

export const pipAndVirtualEnvironments: Topic = {
    id: 'python-basics-pip-virtual-environments',
    name: 'pip & Virtual Environments',
    beginner: [
        {
            content: `<h4>What is pip?</h4>
<b>pip</b> is Python's package installer. It downloads third-party libraries from <b>PyPI</b> (the Python Package Index, pypi.org - over half a million packages) and installs them so you can <code>import</code> them. It plays the role Maven or Gradle dependencies play in Java.`,
            codeExamples: [
                `python -m pip install requests          # install the latest version
python -m pip install requests==2.32.3  # install an exact version
python -m pip install --upgrade requests
python -m pip uninstall requests
python -m pip list                      # everything installed
python -m pip show requests             # details of one package`
            ]
        },
        {
            content: `<h4>Why Virtual Environments?</h4>
Without isolation, every project on your computer shares one set of installed packages. Project A needs <code>Django 4</code>, project B needs <code>Django 5</code> - only one can be installed globally.<br><br>
A <b>virtual environment</b> (venv) is a self-contained folder with its own Python executable and its own <code>site-packages</code>. Packages installed while it is active go only into that folder. <b>Rule of thumb: one virtual environment per project.</b>`
        },
        {
            content: `<h4>Creating and Using a venv</h4>
<code>venv</code> is built into Python. The convention is to name the folder <code>.venv</code> inside your project.`,
            codeExamples: [
                `# 1. Create it (run once, in the project folder)
python -m venv .venv

# 2. Activate it
.venv\\Scripts\\activate          # Windows (cmd / PowerShell)
source .venv/bin/activate        # macOS / Linux

# The prompt now starts with (.venv)
# 3. Install packages - they go into .venv only
python -m pip install requests

# 4. Leave the environment
deactivate`
            ]
        },
        {
            content: `<h4>requirements.txt - Sharing Your Dependencies</h4>
The <code>.venv</code> folder is never committed to Git (add it to <code>.gitignore</code>). Instead you commit a list of packages, and anyone can rebuild an identical environment from it.`,
            codeExamples: [
                `# Save the exact versions currently installed
python -m pip freeze > requirements.txt

# requirements.txt now contains lines like:
# certifi==2024.8.30
# requests==2.32.3

# A teammate recreates the environment:
python -m venv .venv
.venv\\Scripts\\activate
python -m pip install -r requirements.txt`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Why <code>python -m pip</code> and Not Just <code>pip</code>?</h3>
The bare <code>pip</code> command belongs to whichever Python appears first on PATH, which may not be the one that runs your code. <code>python -m pip</code> always installs into exactly the interpreter you name. You can verify which environment is active from inside Python.`,
            codeExamples: [
                `import sys

print(sys.executable)                  # interpreter in use
print(sys.prefix != sys.base_prefix)   # True only inside a virtual environment

# OUTPUT (inside an active .venv on Windows):
# D:\\projects\\shop\\.venv\\Scripts\\python.exe
# True`
            ]
        },
        {
            content: `<h3>Version Specifiers</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Specifier</th><th>Meaning</th></tr>
<tr class='text-center'><td><code>requests==2.32.3</code></td><td>Exactly this version</td></tr>
<tr class='text-center'><td><code>requests>=2.30</code></td><td>2.30 or newer</td></tr>
<tr class='text-center'><td><code>requests>=2.30,&lt;3</code></td><td>Any 2.x from 2.30 up, but not 3.0</td></tr>
<tr class='text-center'><td><code>requests~=2.32.0</code></td><td>"Compatible release": &gt;=2.32.0 and &lt;2.33</td></tr>
<tr class='text-center'><td><code>requests!=2.31.0</code></td><td>Anything except a known-bad version</td></tr>
</table>`
        },
        {
            content: `<h3>"externally-managed-environment" Error</h3>
Recent Linux distributions and Homebrew Python block <code>pip install</code> into the system interpreter (PEP 668), because mixing pip packages with OS-managed packages can break system tools. The right fix is to use a virtual environment - not <code>--break-system-packages</code> and never <code>sudo pip</code>.<br><br>
For command-line tools you want available everywhere (e.g. <code>black</code>, <code>httpie</code>), use <b>pipx</b>, which gives each tool its own private environment.`
        },
        {
            content: `<h3>Editable Installs and Modern Tooling</h3>
• <code>pip install -e .</code> installs your own project in "editable" mode: imports point at your source folder, so code changes apply without reinstalling.<br>
• <code>pip freeze</code> lists every package including indirect dependencies, which makes requirements files noisy. Tools like <b>pip-tools</b>, <b>Poetry</b> and <b>uv</b> separate the packages you asked for from a generated <b>lock file</b> of exact versions.<br>
• <b>uv</b> is a very fast drop-in replacement: <code>uv venv</code>, <code>uv pip install requests</code>, or project mode with <code>uv add requests</code>.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem do virtual environments solve?</td><td>Dependency conflicts between projects - each project gets its own isolated set of packages and versions</td></tr>
<tr class='text-center'><td>Should .venv be committed to Git?</td><td>No - commit requirements.txt (or pyproject.toml + lock file) and recreate the environment from it</td></tr>
<tr class='text-center'><td>How do you check whether you are inside a venv?</td><td><code>sys.prefix != sys.base_prefix</code>, or look at <code>sys.executable</code></td></tr>
<tr class='text-center'><td>What is PyPI?</td><td>The Python Package Index - the public repository pip downloads packages from</td></tr>
<tr class='text-center'><td>Difference between <code>==</code> and <code>~=</code> in requirements?</td><td><code>==</code> pins one exact version; <code>~=</code> allows compatible patch/minor updates within a range</td></tr>
<tr class='text-center'><td>Why is <code>sudo pip install</code> a bad idea?</td><td>It overwrites packages the operating system depends on and can break system tools</td></tr>
</table>`
        }
    ]
};
