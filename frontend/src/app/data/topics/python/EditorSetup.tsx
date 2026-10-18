import type { Topic } from '../../types';

export const editorSetup: Topic = {
    id: 'python-basics-vs-code-pycharm-setup',
    name: 'VS Code & PyCharm Setup',
    beginner: [
        {
            content: `<h4>Why Use an IDE or Code Editor?</h4>
You can write Python in Notepad, but a proper editor gives you <b>syntax highlighting</b>, <b>auto-completion</b>, <b>error underlining</b> before you run, one-click <b>run and debug</b>, and automatic formatting. The two most popular choices are:<br><br>
• <b>VS Code</b> - free, lightweight editor from Microsoft; Python support comes from extensions.<br>
• <b>PyCharm</b> - full IDE from JetBrains built specifically for Python, with a free tier and a paid Professional tier.`
        },
        {
            content: `<h4>Setting Up VS Code</h4>
1. Install VS Code from <b>code.visualstudio.com</b>.<br>
2. Open the Extensions panel (<code>Ctrl+Shift+X</code>) and install <b>Python</b> by Microsoft. It brings <b>Pylance</b> (auto-complete, type checking) and the debugger with it.<br>
3. Open your project folder with <b>File → Open Folder</b>.<br>
4. Press <code>Ctrl+Shift+P</code> → <b>Python: Select Interpreter</b> and choose the Python (or virtual environment) to use.<br>
5. Open a <code>.py</code> file and click the ▶ <b>Run</b> button in the top-right corner, or press <code>F5</code> to debug.`
        },
        {
            content: `<h4>Setting Up PyCharm</h4>
1. Download PyCharm from <b>jetbrains.com/pycharm</b>.<br>
2. <b>New Project</b> → choose a location. PyCharm offers to create a virtual environment for you - accept it.<br>
3. Right-click the project → <b>New → Python File</b>.<br>
4. Right-click inside the file → <b>Run</b> (<code>Shift+F10</code> runs again, <code>Shift+F9</code> debugs).<br>
5. Change the interpreter at any time under <b>Settings → Project → Python Interpreter</b>.`
        },
        {
            content: `<h4>Your First Run</h4>
Create <code>hello.py</code>, paste the code below, and run it from the editor. The output appears in the integrated terminal / Run panel.`,
            codeExamples: [
                `name = input("What is your name? ")
print(f"Welcome to Python, {name}!")

# OUTPUT:
# What is your name? Sheru
# Welcome to Python, Sheru!`
            ]
        },
        {
            content: `<h4>VS Code vs PyCharm</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>VS Code</th><th>PyCharm</th></tr>
<tr class='text-center'><td>Type</td><td>General editor + extensions</td><td>Dedicated Python IDE</td></tr>
<tr class='text-center'><td>Startup / memory</td><td>Light and fast</td><td>Heavier</td></tr>
<tr class='text-center'><td>Refactoring tools</td><td>Good</td><td>Excellent</td></tr>
<tr class='text-center'><td>Multiple languages</td><td>Excellent (JS, Java, Go...)</td><td>Python-focused</td></tr>
<tr class='text-center'><td>Best for</td><td>Mixed-language projects, beginners who want one editor for everything</td><td>Large Python codebases, Django projects</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>Project-Level VS Code Settings</h3>
Settings saved in <code>.vscode/settings.json</code> travel with the project, so every developer gets the same interpreter, formatter and linter. A common setup uses <b>Ruff</b> for linting and formatting on save.`,
            codeExamples: [
                `// .vscode/settings.json
{
    "python.defaultInterpreterPath": "\${workspaceFolder}/.venv/Scripts/python.exe",
    "[python]": {
        "editor.defaultFormatter": "charliermarsh.ruff",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.organizeImports": "explicit"
        }
    },
    "python.analysis.typeCheckingMode": "basic"
}`
            ]
        },
        {
            content: `<h3>Debugging with Breakpoints</h3>
Instead of sprinkling <code>print()</code> calls, click in the gutter to the left of a line number to set a <b>breakpoint</b>, then press <code>F5</code> (VS Code) or <code>Shift+F9</code> (PyCharm). Execution pauses on that line and you can:<br>
• inspect every variable in the <b>Variables</b> panel,<br>
• <b>Step Over</b> (<code>F10</code>) to run the next line, <b>Step Into</b> (<code>F11</code>) to enter a function call,<br>
• evaluate any expression in the <b>Debug Console</b>.<br><br>
VS Code stores launch options in <code>.vscode/launch.json</code>.`,
            codeExamples: [
                `// .vscode/launch.json - run the current file with arguments
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Current File",
            "type": "debugpy",
            "request": "launch",
            "program": "\${file}",
            "args": ["--verbose"],
            "console": "integratedTerminal"
        }
    ]
}`
            ]
        },
        {
            content: `<h3>Other Tools Worth Knowing</h3>
• <b>Jupyter Notebooks</b> (<code>.ipynb</code>) - run code cell by cell with inline charts; supported in both VS Code and PyCharm. Standard for data science.<br>
• <b>IDLE</b> - the tiny editor bundled with Python; fine for a first experiment.<br>
• <b>Google Colab</b> - notebooks in the browser with nothing to install.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Your editor shows "Import could not be resolved" but the code runs. Why?</td><td>The editor is using a different interpreter from the one where the package is installed - select the right interpreter / virtual environment</td></tr>
<tr class='text-center'><td>What is Pylance?</td><td>Microsoft's Python language server for VS Code, giving completion, navigation and type checking</td></tr>
<tr class='text-center'><td>Why commit .vscode/settings.json?</td><td>So the whole team shares the same formatter, linter and interpreter path</td></tr>
<tr class='text-center'><td>Breakpoint vs print debugging?</td><td>A breakpoint pauses execution so you can inspect all state interactively without editing and re-running code</td></tr>
</table>`
        }
    ]
};
