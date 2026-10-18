import type { Topic } from '../../types';

export const subprocessModule: Topic = {
    id: 'python-modules-packages-subprocess',
    name: 'subprocess',
    beginner: [
        {
            content: `<h4>Running Other Programs</h4>
The <code>subprocess</code> module starts external programs - <code>git</code>, a compiler, another Python script - waits for them, and collects their output and exit code. It is Python's counterpart of Java's <code>ProcessBuilder</code>.<br><br>
The main function is <code>subprocess.run([program, arg1, arg2, ...])</code>. Pass the command as a <b>list</b>: the first item is the program, each further item is one argument.<br><br>
The examples run Python itself (<code>sys.executable</code>) as the child program, so they work the same on Windows, macOS and Linux.`
        },
        {
            content: `<h4>Capturing Output</h4>
<code>capture_output=True</code> collects what the program prints; <code>text=True</code> decodes it from bytes into strings. The result object holds <code>returncode</code>, <code>stdout</code> and <code>stderr</code>.`,
            codeExamples: [
                `import subprocess
import sys

result = subprocess.run(
    [sys.executable, "-c", "print('Hello from a child process')"],
    capture_output=True,
    text=True,
)

print(result.returncode)            # 0 means success
print(result.stdout.strip())
print(repr(result.stderr))

# OUTPUT:
# 0
# Hello from a child process
# ''`
            ]
        },
        {
            content: `<h4>Exit Codes and Errors</h4>
By convention a program exits with <code>0</code> on success and a non-zero code on failure. <code>run()</code> doesn't raise on failure by default - check <code>returncode</code>, or pass <code>check=True</code> to get a <code>CalledProcessError</code>.`,
            codeExamples: [
                `import subprocess
import sys

failing = [sys.executable, "-c", "import sys; print('oops', file=sys.stderr); sys.exit(3)"]

result = subprocess.run(failing, capture_output=True, text=True)
print(result.returncode, result.stderr.strip())

try:
    subprocess.run(failing, capture_output=True, text=True, check=True)
except subprocess.CalledProcessError as error:
    print("Failed with exit code", error.returncode)

# OUTPUT:
# 3 oops
# Failed with exit code 3`
            ]
        },
        {
            content: `<h4>Timeouts</h4>
<code>timeout=seconds</code> stops waiting: the child is killed and <code>TimeoutExpired</code> is raised. Always set one when calling programs that might hang.`,
            codeExamples: [
                `import subprocess
import sys

try:
    subprocess.run([sys.executable, "-c", "import time; time.sleep(5)"], timeout=1)
except subprocess.TimeoutExpired:
    print("Took too long - the child process was killed")

# OUTPUT:
# Took too long - the child process was killed`
            ]
        },
        {
            content: `<h4>Running Real Tools</h4>
Any installed program works the same way. Shell built-ins such as <code>dir</code> (Windows) are not programs, so they need the shell - prefer Python equivalents like <code>pathlib</code> instead.`,
            codeExamples: [
                `import subprocess

result = subprocess.run(["git", "--version"], capture_output=True, text=True)
print(result.stdout.strip())

# OUTPUT (depends on your installed version - e.g.):
# git version 2.46.0`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Why shell=True Is Dangerous</h3>
With <code>shell=True</code> the command is a single string interpreted by the system shell (<code>cmd.exe</code> or <code>/bin/sh</code>). If any part comes from a user, characters like <code>;</code>, <code>&amp;&amp;</code>, <code>|</code> or <code>$( )</code> can smuggle in extra commands - <b>shell injection</b>. With a list and no shell, each item is passed as exactly one argument and nothing is interpreted. If you truly need a shell, quote untrusted parts with <code>shlex.quote</code> (POSIX shells).`,
            codeExamples: [
                `import shlex

filename = "report.txt; rm -rf ~"          # imagine this came from a user

# DANGEROUS - the shell sees TWO commands:
#   subprocess.run(f"cat {filename}", shell=True)
# SAFE - the whole string is ONE argument to cat:
#   subprocess.run(["cat", filename])

print(shlex.quote(filename))
print(shlex.split("git commit -m 'first commit'"))

# OUTPUT:
# 'report.txt; rm -rf ~'
# ['git', 'commit', '-m', 'first commit']`
            ]
        },
        {
            content: `<h3>Sending Input, Environment and Working Directory</h3>
• <code>input=</code> writes data to the child's standard input.<br>
• <code>env=</code> replaces the child's environment variables - start from a copy of <code>os.environ</code>, or the child loses <code>PATH</code> and other essentials.<br>
• <code>cwd=</code> runs the child in another folder.`,
            codeExamples: [
                `import os
import subprocess
import sys

result = subprocess.run(
    [sys.executable, "-c", "import sys; print(sys.stdin.read().upper())"],
    input="hello\\nworld",
    capture_output=True,
    text=True,
)
print(result.stdout, end="")

env = {**os.environ, "APP_MODE": "test"}
result = subprocess.run(
    [sys.executable, "-c", "import os; print(os.environ['APP_MODE'])"],
    env=env,
    capture_output=True,
    text=True,
)
print(result.stdout.strip())

# OUTPUT:
# HELLO
# WORLD
# test`
            ]
        },
        {
            content: `<h3>Popen: Streaming Long-Running Processes</h3>
<code>run()</code> waits for the program to finish before returning. <code>Popen</code> starts it and returns immediately, so you can read its output <b>line by line</b> while it runs - useful for build tools, servers and progress logs.`,
            codeExamples: [
                `import subprocess
import sys

cmd = [sys.executable, "-u", "-c", "for i in range(3): print('step', i)"]

with subprocess.Popen(cmd, stdout=subprocess.PIPE, text=True) as proc:
    for line in proc.stdout:              # arrives as the child prints it
        print("got:", line.rstrip())

print("exit code", proc.returncode)

# OUTPUT:
# got: step 0
# got: step 1
# got: step 2
# exit code 0`
            ]
        },
        {
            content: `<h3>Avoid os.system</h3>
<code>os.system("command")</code> is the old way: it always goes through the shell (injection risk), can't capture output, and returns a platform-dependent status value. <code>subprocess.run</code> replaces it - and <code>os.popen</code> - in all new code.`
        },
        {
            content: `<h3>Compared with Java's ProcessBuilder</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Task</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Build the command</td><td><code>new ProcessBuilder("git", "status")</code></td><td><code>["git", "status"]</code></td></tr>
<tr class='text-center'><td>Run and wait</td><td><code>pb.start().waitFor()</code></td><td><code>subprocess.run(cmd)</code></td></tr>
<tr class='text-center'><td>Read output</td><td><code>process.getInputStream()</code></td><td><code>capture_output=True</code> → <code>result.stdout</code></td></tr>
<tr class='text-center'><td>Working directory</td><td><code>pb.directory(dir)</code></td><td><code>cwd=dir</code></td></tr>
<tr class='text-center'><td>Environment</td><td><code>pb.environment().put(k, v)</code></td><td><code>env={**os.environ, k: v}</code></td></tr>
<tr class='text-center'><td>Timeout</td><td><code>waitFor(5, TimeUnit.SECONDS)</code></td><td><code>timeout=5</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you run a command and capture its output?</td><td><code>subprocess.run(cmd, capture_output=True, text=True).stdout</code></td></tr>
<tr class='text-center'><td>Why pass the command as a list?</td><td>Each item becomes exactly one argument with no shell parsing, which prevents injection and quoting bugs</td></tr>
<tr class='text-center'><td>What does check=True do?</td><td>Raises CalledProcessError if the exit code is non-zero</td></tr>
<tr class='text-center'><td>How do you stop a hung process?</td><td>Pass <code>timeout=</code>; the child is killed and TimeoutExpired is raised</td></tr>
<tr class='text-center'><td>run() vs Popen?</td><td>run waits for completion and returns the result; Popen returns immediately so you can interact with or stream from the process</td></tr>
<tr class='text-center'><td>Why is os.system discouraged?</td><td>It always uses the shell, can't capture output and gives a platform-dependent status</td></tr>
</table>`
        }
    ]
};
