// Module 33 (Linux & Python).
import { dd, r, type DeepDive } from './deepDive';

export const m33a: Record<string, DeepDive> = {
    'Shell Basics': dd(
        [`The <b>shell</b> (bash, zsh, sh) is the text interface to Linux: you type commands, it starts programs, wires their input/output with pipes and redirections. Python drives the shell through <code>subprocess</code>.`,
            r`import subprocess

# Shell:  echo "hello linux" | tr a-z A-Z
# Python: run the pipeline, capture stdout as text
out = subprocess.run('echo "hello linux" | tr a-z A-Z',
                     shell=True, capture_output=True, text=True)
print(out.stdout.strip(), "| exit code:", out.returncode)

# OUTPUT (on Linux/macOS):
# HELLO LINUX | exit code: 0`],
        [`Servers have no GUI. Deployment, log inspection, automation and debugging all happen in a shell, so knowing pipes, exit codes and quoting is baseline knowledge for backend engineers.`,
            r`import subprocess
# Exit code 0 = success, anything else = failure (the contract of every command)
ok = subprocess.run(["true"]).returncode
bad = subprocess.run(["false"]).returncode
print("true ->", ok, "| false ->", bad)

# OUTPUT:
# true -> 0 | false -> 1`],
        [`Ops engineers chain <code>grep</code>, <code>awk</code>, <code>sort</code>, <code>uniq</code> to analyse logs; Python replaces long pipelines when logic grows.`,
            r`# Shell:  grep ERROR app.log | sort | uniq -c
# Same in Python, no subprocess needed
from collections import Counter
lines = ["ERROR db", "INFO ok", "ERROR db", "ERROR net"]
c = Counter(l for l in lines if "ERROR" in l)
for msg, n in c.items():
    print(n, msg)

# OUTPUT:
# 2 ERROR db
# 1 ERROR net`],
        [`<b>Advantages:</b> fastest way to compose existing tools, scriptable, ubiquitous on servers, perfect for glue tasks.`,
            r`import subprocess
# Compose: count files in current dir via a pipeline
r = subprocess.run("ls | wc -l", shell=True, capture_output=True, text=True)
print("entries:", int(r.stdout))

# OUTPUT (example):
# entries: 12`],
        [`<b>Disadvantages:</b> quoting rules are error-prone, text-only pipes lose structure, <code>shell=True</code> with user input enables command injection, scripts are hard to test.`,
            r`import subprocess, shlex
user = "file.txt; echo PWNED"                 # hostile input
# BAD : subprocess.run(f"cat {user}", shell=True)   -> runs 'echo PWNED' too
# GOOD: argument list, no shell involved, or shlex.quote
safe = subprocess.run(["echo", user], capture_output=True, text=True)
print(safe.stdout.strip())
print(shlex.quote(user))

# OUTPUT:
# file.txt; echo PWNED
# 'file.txt; echo PWNED'`],
        [`<b>Limitations:</b> shell behaviour differs between bash, zsh, dash and Windows cmd; no real data types; error handling by default continues after failures.`,
            r`import subprocess
# Without "set -e" a script continues after a failed step
r = subprocess.run("false; echo still running", shell=True,
                   capture_output=True, text=True)
print(r.stdout.strip(), "| exit:", r.returncode)

# OUTPUT:
# still running | exit: 0`],
        `
   keyboard ─► shell (bash) ─► parses: quotes, globs, pipes
                  │
                  ├─► fork() + exec("grep")  ─┐
                  │                           │ stdout ──pipe──► stdin
                  └─► fork() + exec("sort")  ◄┘
                              │
                          exit code ($?) returned to the shell
`,
        `Use shell for 5-line glue, Python once you need functions, tests, JSON or error handling. Always pass argument lists, set a timeout, check returncode (<code>check=True</code>), and never interpolate untrusted input into a shell string.`
    ),

    'Environment Variables': dd(
        [`<b>Environment variables</b> are key/value strings inherited by every child process. They carry configuration (PATH, HOME, DATABASE_URL) without hard-coding it. Python exposes them as <code>os.environ</code>.`,
            r`import os
os.environ["APP_MODE"] = "dev"                 # set for this process + children
print(os.environ["APP_MODE"])
print(os.environ.get("MISSING", "default"))   # safe read with fallback

# OUTPUT:
# dev
# default`],
        [`The same code must run on laptop, CI and production with different databases and secrets. Configuration in environment variables (the twelve-factor approach) keeps code identical and secrets out of git.`,
            r`import os
# Read config once, convert types explicitly - env values are always str
DEBUG = os.getenv("DEBUG", "0") == "1"
PORT = int(os.getenv("PORT", "8000"))
print(type(PORT).__name__, PORT, DEBUG)

# OUTPUT:
# int 8000 False`],
        [`Containers, systemd units and CI jobs inject env vars; local development loads a <code>.env</code> file via python-dotenv or pydantic-settings.`,
            r`import os, subprocess, sys
# Children inherit a COPY; override per child with env=
child_env = {**os.environ, "STAGE": "test"}
out = subprocess.run([sys.executable, "-c", "import os;print(os.environ['STAGE'])"],
                     env=child_env, capture_output=True, text=True)
print(out.stdout.strip())

# OUTPUT:
# test`],
        [`<b>Advantages:</b> language-agnostic, no files to deploy, easy per-environment override, standard across Docker/Kubernetes/CI.`,
            r`import os
# Precedence pattern: env var overrides default
def setting(name, default):
    return os.environ.get(name, default)
os.environ["TIMEOUT"] = "30"
print(setting("TIMEOUT", "10"), setting("RETRIES", "3"))

# OUTPUT:
# 30 3`],
        [`<b>Disadvantages:</b> everything is a string, no schema or validation, visible in <code>/proc/PID/environ</code> and crash dumps, easy to typo a name silently.`,
            r`import os
os.environ["WORKERS"] = "four"
try:
    int(os.environ["WORKERS"])
except ValueError as e:
    print("bad config:", e)

# OUTPUT:
# bad config: invalid literal for int() with base 10: 'four'`],
        [`<b>Limitations:</b> size limits (about 128 KB per variable on Linux, ~32 KB total on Windows), changes in a child never affect the parent, no structured values.`,
            r`import os, subprocess, sys
# A child cannot change its parent's environment
subprocess.run([sys.executable, "-c", "import os; os.environ['X']='child'"])
print("parent sees X:", os.environ.get("X"))

# OUTPUT:
# parent sees X: None`],
        `
   shell:  export DB_URL=postgres://...
     │ fork() - child gets a COPY
     ▼
   python app.py ──► os.environ["DB_URL"]
     │ subprocess inherits copy
     ▼
   child process (its own changes stay local)
`,
        `Validate env at startup (pydantic-settings) and fail fast. For secrets prefer mounted files or a secret manager over env vars, since env leaks into logs, child processes and crash reports. Document every variable; treat the set as a contract.`
    ),

    'Processes & Signals': dd(
        [`A <b>process</b> is a running program with a PID, memory and file descriptors. <b>Signals</b> are asynchronous notifications (SIGINT, SIGTERM, SIGKILL, SIGHUP) the kernel sends to processes. Python handles them with the <code>signal</code> module.`,
            r`import os, signal
print("my pid:", os.getpid() > 0, "| parent:", os.getppid() > 0)
print(signal.Signals.SIGTERM.value, signal.Signals.SIGINT.value)

# OUTPUT:
# my pid: True | parent: True
# 15 2`],
        [`Services must shut down cleanly: finish requests, flush buffers, close connections. Orchestrators (systemd, Docker, Kubernetes) ask with SIGTERM and only force-kill after a grace period.`,
            r`import signal, os, time
done = False
def on_term(signum, frame):
    global done
    print("got SIGTERM, cleaning up")
    done = True
signal.signal(signal.SIGTERM, on_term)      # register handler
os.kill(os.getpid(), signal.SIGTERM)        # send the signal to ourselves
time.sleep(0.1)
print("shutdown flag:", done)

# OUTPUT (Linux/macOS):
# got SIGTERM, cleaning up
# shutdown flag: True`],
        [`Gunicorn workers, Celery, Docker stop and <code>kubectl delete pod</code> all rely on SIGTERM graceful shutdown. Ctrl+C sends SIGINT, which Python turns into KeyboardInterrupt.`,
            r`import subprocess, sys, time
p = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(60)"])
time.sleep(0.3)
p.terminate()                  # polite: SIGTERM
print("exit code:", p.wait(timeout=5))

# OUTPUT (Linux/macOS):
# exit code: -15`],
        [`<b>Advantages:</b> lightweight inter-process notification, standard across all Unix tools, lets programs react to events like reload (SIGHUP).`,
            r`import signal
# SIGUSR1 as a custom "dump stats" trigger
counter = {"calls": 0}
signal.signal(signal.SIGUSR1, lambda s, f: print("stats:", counter))
counter["calls"] = 7
signal.raise_signal(signal.SIGUSR1)

# OUTPUT (Linux/macOS):
# stats: {'calls': 7}`],
        [`<b>Disadvantages:</b> handlers run between bytecodes at awkward moments, only simple work is safe inside, signals coalesce (several arrive as one), behaviour differs on Windows.`,
            r`import signal
print("SIGKILL catchable?", end=" ")
try:
    signal.signal(signal.SIGKILL, lambda *a: None)
except OSError as e:
    print("no -", e.strerror)

# OUTPUT (Linux/macOS):
# SIGKILL catchable? no - Invalid argument`],
        [`<b>Limitations:</b> SIGKILL and SIGSTOP cannot be caught; Python handlers only run in the main thread; Windows supports just SIGINT/SIGTERM/SIGBREAK basics.`,
            r`import signal, threading
def try_in_thread():
    try:
        signal.signal(signal.SIGTERM, lambda *a: None)
    except ValueError as e:
        print("thread:", e)
t = threading.Thread(target=try_in_thread); t.start(); t.join()

# OUTPUT:
# thread: signal only works in main thread of the main interpreter`],
        `
   kubectl stop / docker stop / systemctl stop
            │ SIGTERM (15)
            ▼
   ┌────────────────────┐   grace period (30s)   ┌───────────┐
   │ your Python app    │──── handler: finish ──►│ exit(0)   │
   │ signal.signal(...) │     requests, close db └───────────┘
   └────────────────────┘
            │ still alive after grace?
            ▼ SIGKILL (9) - cannot be caught
`,
        `Make every service handle SIGTERM: stop accepting work, drain in-flight tasks, then exit; keep handlers tiny (set a flag, use an Event). As PID 1 in containers, use an init (tini, --init) so signals reach your process and zombies are reaped. Design jobs to be idempotent because SIGKILL will eventually happen.`
    ),

    'Permissions & the Filesystem': dd(
        [`Linux files have an owner, a group and permission bits for user/group/other: read (4), write (2), execute (1). <code>chmod 640</code> means owner rw, group r, others none. Python reads and sets them through <code>os</code>, <code>stat</code> and <code>pathlib</code>.`,
            r`import os, stat, tempfile
p = os.path.join(tempfile.mkdtemp(), "secret.txt")
open(p, "w").write("x")
os.chmod(p, 0o640)                         # rw-r-----
mode = os.stat(p).st_mode
print(oct(stat.S_IMODE(mode)), stat.filemode(mode))

# OUTPUT (Linux/macOS):
# 0o640 -rw-r-----`],
        [`Permissions are the first line of defence: a web server user should not read SSH keys, and uploaded files should never be executable. Wrong modes cause both "Permission denied" bugs and security holes.`,
            r`import os, tempfile
p = os.path.join(tempfile.mkdtemp(), "run.sh")
open(p, "w").write("#!/bin/sh\necho hi\n")
print("executable?", os.access(p, os.X_OK))
os.chmod(p, 0o755)
print("executable?", os.access(p, os.X_OK))

# OUTPUT (Linux/macOS):
# executable? False
# executable? True`],
        [`Private keys must be 600 (ssh refuses otherwise), app data dirs belong to a service account, and containers run as non-root users with mounted volumes owned correctly.`,
            r`import os, tempfile, stat
key = os.path.join(tempfile.mkdtemp(), "id_rsa")
fd = os.open(key, os.O_WRONLY | os.O_CREAT, 0o600)   # create with safe mode atomically
os.write(fd, b"PRIVATE"); os.close(fd)
print(stat.filemode(os.stat(key).st_mode))

# OUTPUT (Linux/macOS):
# -rw-------`],
        [`<b>Advantages:</b> simple, fast, enforced by the kernel, works with groups and ACLs, and umask provides safe defaults.`,
            r`import os
old = os.umask(0o077)           # new files: owner-only by default
print("previous umask:", oct(old))
os.umask(old)

# OUTPUT (example):
# previous umask: 0o22`],
        [`<b>Disadvantages:</b> coarse (one owner, one group), octal modes are cryptic, Windows semantics differ, easy to over-grant with chmod 777.`,
            r`import stat
mode = 0o777
print(stat.filemode(stat.S_IFREG | mode), "-> world-writable: a security smell")

# OUTPUT:
# -rwxrwxrwx -> world-writable: a security smell`],
        [`<b>Limitations:</b> only rwx bits; no per-user fine rules without ACLs; root bypasses them; <code>os.chmod</code> on Windows only toggles read-only.`,
            r`import os
print("effective uid:", os.geteuid() if hasattr(os, "geteuid") else "n/a (Windows)")
# uid 0 (root) ignores permission bits - containers should not run as root.

# OUTPUT (example, Linux as normal user):
# effective uid: 1000`],
        `
   -  r w x  r - x  r - -   app.py
   │  └─┬─┘  └─┬─┘  └─┬─┘
   │   owner   group  others
   │    7=4+2+1 5=4+1  4
   └─ type (- file, d dir, l link)         chmod 754 app.py
`,
        `Apply least privilege: dedicated service users, 640 for config, 600 for keys, no setuid, read-only root filesystems in containers. Create sensitive files with the right mode at open time (os.open mode) to avoid a race window between create and chmod.`
    ),

    'Cron Jobs': dd(
        [`<b>cron</b> runs commands on a schedule. Each crontab line has five time fields (minute hour day-of-month month day-of-week) then the command. Python scripts are scheduled like any command.`,
            r`# crontab -e  (shown as data)
CRON = "*/15 9-17 * * 1-5  /usr/bin/python3 /opt/app/report.py >> /var/log/report.log 2>&1"
minute, hour, dom, month, dow, *cmd = CRON.split()
print("minute:", minute, "| hour:", hour, "| weekdays:", dow)
print("command:", " ".join(cmd)[:30])

# OUTPUT:
# minute: */15 | hour: 9-17 | weekdays: 1-5
# command: /usr/bin/python3 /opt/app/report.py`],
        [`Backups, report generation, cache cleanup and data syncs must run without a human. Cron is the zero-dependency way to do it on a single machine.`,
            r`# A job that is safe to schedule: idempotent, logs, exits non-zero on failure
import sys, logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
def job():
    logging.info("nightly cleanup done")
    return 0
sys.exit(job())

# OUTPUT (example):
# 2026-10-05 02:00:01,120 nightly cleanup done`],
        [`Typical: 0 2 * * * database backup, */5 * * * * health check, 0 0 1 * * monthly invoice. Cron has a minimal environment, so use absolute paths and activate the venv explicitly.`,
            r`import os
# Cron runs with PATH=/usr/bin:/bin and no HOME config - print what you get
print("PATH:", os.environ.get("PATH"))
print("use absolute python: /opt/app/.venv/bin/python")

# OUTPUT (inside cron, example):
# PATH: /usr/bin:/bin
# use absolute python: /opt/app/.venv/bin/python`],
        [`<b>Advantages:</b> preinstalled everywhere, simple text config, no daemon of your own, survives reboots.`,
            r`# Parse a field the way cron does: */15 -> every 15 minutes
def expand(step, limit=60):
    return list(range(0, limit, step))
print(expand(15))

# OUTPUT:
# [0, 15, 30, 45]`],
        [`<b>Disadvantages:</b> overlapping runs if a job exceeds its interval, silent failures without logging/mail, no retry or dependency handling, time zone and DST surprises.`,
            r`import fcntl, sys
# Prevent overlapping runs with a lock file
lock = open("/tmp/report.lock", "w")
try:
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)   # fail if already held
    print("lock acquired, running")
except BlockingIOError:
    print("previous run still active, skipping"); sys.exit(0)

# OUTPUT (Linux/macOS, first run):
# lock acquired, running`],
        [`<b>Limitations:</b> minute granularity at best, single-host (no cluster awareness, duplicates if you scale out), no missed-run catch-up if the machine was off.`,
            r`# Two hosts with the same crontab both fire -> duplicate work
hosts = ["web-1", "web-2"]
print("runs of nightly job:", len(hosts), "(want 1) -> use leader election or a queue")

# OUTPUT:
# runs of nightly job: 2 (want 1) -> use leader election or a queue`],
        `
   ┌──── minute (0-59)
   │ ┌──── hour (0-23)
   │ │ ┌──── day of month
   │ │ │ ┌──── month
   │ │ │ │ ┌──── day of week (0-6)
   │ │ │ │ │
   0 2 * * *  /opt/app/.venv/bin/python backup.py
   crond ──every minute──► matches? ──► fork + exec job ──► log/mail
`,
        `Cron is fine for single-host housekeeping. For fleets use Kubernetes CronJob, Celery beat, Airflow or cloud schedulers with concurrencyPolicy, retries and alerts. Always make jobs idempotent, lock against overlap and monitor with a heartbeat (dead-man switch) so silence is detected.`
    ),

    'SSH': dd(
        [`<b>SSH</b> (Secure Shell) gives encrypted remote login, command execution and file transfer. Authentication uses passwords or, better, public/private key pairs. From Python use <code>paramiko</code> or call the system <code>ssh</code> binary.`,
            r`import subprocess
# Run one command on a remote host through the system ssh client
cmd = ["ssh", "-o", "BatchMode=yes", "deploy@server.example.com", "uptime"]
print("would run:", " ".join(cmd))
# subprocess.run(cmd, capture_output=True, text=True, timeout=15)

# OUTPUT:
# would run: ssh -o BatchMode=yes deploy@server.example.com uptime`],
        [`Passwords sent over telnet or ftp are readable by anyone on the path. SSH encrypts the channel, verifies the server identity (known_hosts) and lets you automate access without typing secrets.`,
            r`import hashlib, base64
# A host key fingerprint is a hash of the server public key - verify it on first connect
fake_key = b"ssh-ed25519 AAAA...demo"
fp = base64.b64encode(hashlib.sha256(fake_key).digest()).decode().rstrip("=")
print("SHA256:" + fp[:20] + "...")

# OUTPUT (example):
# SHA256:...(20 chars)...`],
        [`Deployments (git pull + restart), tunnelling to private databases, ansible/fabric automation and <code>scp</code>/<code>rsync</code> backups all ride on SSH. CI uses a dedicated deploy key.`,
            r`# Local port-forward: reach a private DB through a bastion
#   ssh -L 5433:db.internal:5432 bastion.example.com
# Then Python connects to localhost:5433
import socket
print("connect to:", ("127.0.0.1", 5433), "-> tunnelled to db.internal:5432")

# OUTPUT:
# connect to: ('127.0.0.1', 5433) -> tunnelled to db.internal:5432`],
        [`<b>Advantages:</b> strong encryption, key-based passwordless login, tunnelling, agent forwarding, file transfer, universal tooling.`,
            r`# paramiko example (pip install paramiko) - shown as a function, not executed
def remote_uptime(host, user, key_file):
    import paramiko
    c = paramiko.SSHClient()
    c.load_system_host_keys()                       # verify known_hosts
    c.set_missing_host_key_policy(paramiko.RejectPolicy())
    c.connect(host, username=user, key_filename=key_file, timeout=10)
    _, out, _ = c.exec_command("uptime")
    return out.read().decode()
print(callable(remote_uptime))

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> key distribution and rotation are manual, exposed port 22 is scanned constantly, agent forwarding can be abused, interactive prompts break automation.`,
            r`# Anti-pattern: disabling host key checking removes MITM protection
bad = ["ssh", "-o", "StrictHostKeyChecking=no", "host", "ls"]
good = ["ssh", "-o", "StrictHostKeyChecking=yes", "host", "ls"]
print("never use:", bad[2])
print("use      :", good[2])

# OUTPUT:
# never use: StrictHostKeyChecking=no
# use      : StrictHostKeyChecking=yes`],
        [`<b>Limitations:</b> each connection costs a handshake (use ControlMaster or pooled sessions), no built-in audit trail of commands, scales poorly to thousands of hosts without tools.`,
            r`# Sequential SSH to N hosts is O(N) handshakes
n, handshake_ms = 500, 300
print("serial time:", n * handshake_ms / 1000, "seconds -> parallelise or use ansible")

# OUTPUT:
# serial time: 150.0 seconds -> parallelise or use ansible`],
        `
   laptop                                      server
   ┌────────────┐   TCP 22, encrypted        ┌──────────────┐
   │ ssh client │◄──────────────────────────►│ sshd         │
   │ id_ed25519 │  1 key exchange            │ authorized_  │
   │ (private)  │  2 verify host key         │ keys (public)│
   └────────────┘  3 sign challenge          └──────────────┘
`,
        `Use ed25519 keys, disable password login and root login, restrict by firewall/bastion, and prefer short-lived certificates or SSM-style access for fleets. Do not use SSH as a deployment API at scale; use immutable images and orchestrators, and keep SSH for break-glass operations.`
    ),

    'Bash + Python Scripting': dd(
        [`Combine both: Bash excels at starting programs and wiring pipes; Python at logic, data and error handling. A script can be Python launched from Bash, or Python calling shell commands via <code>subprocess</code>.`,
            r`#!/usr/bin/env python3
# Bash wrapper:   python3 tool.py --count 3 && echo "done"
import argparse, sys
p = argparse.ArgumentParser()
p.add_argument("--count", type=int, default=1)
a = p.parse_args(["--count", "3"])        # normally parse_args() reads sys.argv
print("count =", a.count)
sys.exit(0)                               # exit code is what Bash tests with $?

# OUTPUT:
# count = 3`],
        [`Bash scripts above ~30 lines become unreadable and untestable; Python scripts that only call 10 commands are verbose. Mixing lets each tool do what it is best at.`,
            r`import subprocess
# Bash is good at one-liners; capture the result and parse it in Python
r = subprocess.run(["python3", "-c", "print('a b c')"], capture_output=True, text=True, check=True)
words = r.stdout.split()
print(len(words), words)

# OUTPUT:
# 3 ['a', 'b', 'c']`],
        [`Deploy scripts, backup jobs, log processors and CI steps: Bash handles the orchestration (<code>set -euo pipefail</code>), Python handles JSON/API parsing.`,
            r`import json, subprocess
# Equivalent of:  curl -s api | jq '.name'
payload = '{"name": "deploy-bot", "ok": true}'
data = json.loads(payload)
print(data["name"])
# Piping into Python from bash:  cat data.json | python3 parse.py
import sys
print("stdin is a pipe:", not sys.stdin.isatty())

# OUTPUT (example):
# deploy-bot
# stdin is a pipe: True`],
        [`<b>Advantages:</b> fast iteration, access to every CLI tool, Python gives real data structures, exceptions and unit tests.`,
            r`import subprocess
# check=True turns a failing command into an exception (Bash needs set -e)
try:
    subprocess.run(["python3", "-c", "import sys; sys.exit(3)"], check=True)
except subprocess.CalledProcessError as e:
    print("failed with code", e.returncode)

# OUTPUT:
# failed with code 3`],
        [`<b>Disadvantages:</b> two languages to maintain, quoting at the boundary, portability issues (GNU vs BSD tools), harder debugging across process borders.`,
            r`import subprocess
# Spaces in filenames break naive string commands
name = "my report.txt"
print(subprocess.run(["echo", name], capture_output=True, text=True).stdout.strip())
# shell form 'echo ' + name would split into TWO arguments

# OUTPUT:
# my report.txt`],
        [`<b>Limitations:</b> startup cost of each subprocess, environment and working directory are per-process, large outputs need streaming, Windows lacks most Unix tools.`,
            r`import subprocess, sys
# Stream big output line by line instead of buffering everything in memory
p = subprocess.Popen([sys.executable, "-c", "for i in range(3): print('line', i)"],
                     stdout=subprocess.PIPE, text=True)
for line in p.stdout:
    print("got:", line.strip())
p.wait()

# OUTPUT:
# got: line 0
# got: line 1
# got: line 2`],
        `
   deploy.sh (Bash)
   set -euo pipefail
        │ git pull; docker build ...
        ├──► python3 check_config.py ──► exit 0/1
        │         ▲   json / logic / API calls
        └── exit code propagates up ──► CI pass / fail
`,
        `Keep Bash as a thin launcher (env, paths, set -euo pipefail) and put logic in a Python package with tests. Prefer pathlib/shutil over calling cp/mv, and subprocess with lists, timeouts and check=True. When the script becomes a product, make it a proper CLI (typer/click) with entry points.`
    ),
};
