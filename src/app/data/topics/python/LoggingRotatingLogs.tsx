import type { Topic } from '../../types';

export const loggingRotatingLogs: Topic = {
    id: 'python-debugging-rotating-logs',
    name: 'Rotating Logs',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A log file that only grows will eventually fill the disk. <b>Log rotation</b> caps it: when the current file reaches a size limit, <code>RotatingFileHandler</code> renames it to <code>.1</code>, shifts older backups up by one, starts a fresh file and deletes the oldest backup beyond <code>backupCount</code>. <code>TimedRotatingFileHandler</code> does the same by time (for example daily). In Java this is the job of Log4j's <i>RollingFileAppender</i>.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 591 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:591px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="162.7" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="91.4" y="30.5">app.log</tspan><tspan x="91.4" y="45.5">newest, written now</tspan></text><line x1="172.7" y1="34" x2="202.7" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="206.7" y="10" width="89.7" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="251.6" y="30.5">app.log.1</tspan><tspan x="251.6" y="45.5">previous</tspan></text><line x1="296.4" y1="34" x2="326.4" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="330.4" y="10" width="89.7" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="375.3" y="30.5">app.log.2</tspan><tspan x="375.3" y="45.5">older</tspan></text><line x1="420.1" y1="34" x2="450.1" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="454.1" y="10" width="126.2" height="48" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="517.2" y="30.5">deleted at the</tspan><tspan x="517.2" y="45.5">next rollover</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: on rollover each file moves one step to the right; the oldest is removed</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> A single ever-growing <code>app.log</code> becomes gigabytes, is slow to open or search, and can fill the server's disk and crash the application.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Keep disk usage <b>bounded</b>: at most <code>(backupCount + 1) x maxBytes</code> bytes.</li>
<li>Keep recent history in small, easy-to-read files.</li>
<li>Delete old logs automatically instead of by a manual clean-up job.</li>
<li>Run services for months without log-related outages.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Watching a rollover with a tiny size limit</h4>
The logs are written into a temporary folder, so running this program leaves nothing behind.`,
            codeExamples: [
                `import logging
import os
import tempfile
from logging.handlers import RotatingFileHandler

MAX_BYTES = 100
BACKUPS = 2
MESSAGES = 12


def write_logs(path):
    logger = logging.getLogger("demo")
    logger.setLevel(logging.INFO)
    handler = RotatingFileHandler(path, maxBytes=MAX_BYTES, backupCount=BACKUPS, encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(handler)
    for number in range(MESSAGES):
        logger.info("message number %d", number)
    logger.removeHandler(handler)
    handler.close()


def summarize(path):
    with open(path, encoding="utf-8") as file:
        lines = file.read().splitlines()
    first = lines[0].split()[-1]
    last = lines[-1].split()[-1]
    print(f"{os.path.basename(path):<11}{len(lines)} lines, first={first}, last={last}")


def main():
    with tempfile.TemporaryDirectory() as folder:
        path = os.path.join(folder, "demo.log")
        write_logs(path)
        for name in (path, path + ".1", path + ".2"):
            summarize(name)
        print("demo.log.3 exists:", os.path.exists(path + ".3"))


if __name__ == "__main__":
    main()

# OUTPUT:
# demo.log   2 lines, first=10, last=11
# demo.log.1 5 lines, first=5, last=9
# demo.log.2 5 lines, first=0, last=4
# demo.log.3 exists: False`
            ],
            codeExplanations: [
                `Each message line is 17 bytes (18 for numbers 10 and 11). A rollover happens when the next write would reach 100 bytes, so five lines fit per file. Two rollovers (before message 5 and before message 10) leave messages 10-11 in demo.log, 5-9 in demo.log.1 and 0-4 in demo.log.2. With backupCount=2 no demo.log.3 is ever created.`
            ]
        },
        {
            content: `<h4>The Problem: Logs Grow Forever</h4>
A plain <code>FileHandler</code> appends to one file for as long as the program runs. After weeks the file may be gigabytes, slow to open, and may fill the disk and crash the server. <b>Log rotation</b> solves this: when the file reaches a limit (by size or by time), it is renamed to a numbered or dated <b>backup</b>, a fresh file starts, and the oldest backups are deleted.`
        },
        {
            content: `<h4>Rotating by Size: RotatingFileHandler</h4>
<code>maxBytes</code> is the size limit and <code>backupCount</code> is how many old files to keep. When <code>app.log</code> would exceed the limit it becomes <code>app.log.1</code>, the previous <code>.1</code> becomes <code>.2</code>, and so on; anything beyond <code>backupCount</code> is deleted.`,
            codeExamples: [
                `import logging
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    "app.log",
    maxBytes=1_000_000,        # roll over at about 1 MB
    backupCount=3,             # keep app.log plus app.log.1 ... app.log.3
    encoding="utf-8",
)
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))

log = logging.getLogger("app")
log.setLevel(logging.INFO)
log.addHandler(handler)

log.info("service started")

# Files on disk after a lot of logging:
#   app.log      <- newest
#   app.log.1
#   app.log.2
#   app.log.3    <- oldest; deleted when the next rollover happens`
            ]
        },
        {
            content: `<h4>Seeing Rotation Happen</h4>
Using a tiny limit makes the behaviour visible. Run this in an <b>empty folder</b>:`,
            codeExamples: [
                `import logging
import os
from logging.handlers import RotatingFileHandler

log = logging.getLogger("demo")
log.setLevel(logging.INFO)
log.addHandler(RotatingFileHandler("demo.log", maxBytes=100, backupCount=2))

for i in range(12):
    log.info("message number %d", i)

print(sorted(f for f in os.listdir(".") if f.startswith("demo.log")))

# OUTPUT:
# ['demo.log', 'demo.log.1', 'demo.log.2']`
            ],
            codeExplanations: [
                `Each line is 17 or 18 bytes, so about five fit in 100 bytes. Writing the sixth message triggers a rollover, and the same happens again at the eleventh. After two rollovers demo.log holds the newest messages (10 and 11), demo.log.1 holds messages 5 to 9 and demo.log.2 holds the oldest, messages 0 to 4. With backupCount=2 a third rollover would delete demo.log.2, discarding the oldest data to bound disk use.`
            ]
        },
        {
            content: `<h4>Rotating by Time: TimedRotatingFileHandler</h4>
Often you want one file per day. <code>when</code> chooses the unit and <code>interval</code> how many of them. Old files get a date suffix such as <code>app.log.2026-10-05</code>.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th><code>when</code></th><th>Rolls over</th></tr>
<tr class='text-center'><td><code>"S"</code> / <code>"M"</code> / <code>"H"</code> / <code>"D"</code></td><td>every interval seconds / minutes / hours / days</td></tr>
<tr class='text-center'><td><code>"midnight"</code></td><td>every night at midnight</td></tr>
<tr class='text-center'><td><code>"W0"</code> ... <code>"W6"</code></td><td>on a weekday (0 = Monday)</td></tr>
</table>`,
            codeExamples: [
                `import logging
from logging.handlers import TimedRotatingFileHandler

handler = TimedRotatingFileHandler(
    "app.log",
    when="midnight",
    interval=1,
    backupCount=7,             # keep one week of daily files
    encoding="utf-8",
    utc=True,                  # roll over at UTC midnight, not local time
)
logging.getLogger("app").addHandler(handler)

# Files after a few days:
#   app.log                  <- today
#   app.log.2026-10-04
#   app.log.2026-10-03`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Rotation Is Not Safe With Multiple Processes</h3>
<code>RotatingFileHandler</code> is safe across <b>threads</b> but <b>not across processes</b>. If a web server runs several worker processes that all log to <code>app.log</code>, each process rotates on its own: one renames the file while others keep writing to the renamed file or lose lines. On <b>Windows</b> the rename can even fail with <code>PermissionError</code> because another process has the file open.

Reliable options:
<ul>
<li><b>One writer:</b> workers send records through a <code>QueueHandler</code> (or a socket) to a single process running a <code>QueueListener</code> that owns the file.</li>
<li><b>External rotation:</b> let <code>logrotate</code> (Linux) rotate the file and use <code>WatchedFileHandler</code>, which reopens the file when it is replaced.</li>
<li><b>No files at all:</b> write to stdout/stderr and let the platform (Docker, Kubernetes, systemd/journald) collect, rotate and ship logs.</li>
<li>A third-party handler such as <code>concurrent-log-handler</code>, which uses file locking.</li>
</ul>`,
            codeExamples: [
                `import logging
import logging.handlers
import queue

# Many threads/processes put records on a queue; ONE listener writes the file.
log_queue = queue.Queue()

file_handler = logging.handlers.RotatingFileHandler(
    "app.log", maxBytes=5_000_000, backupCount=5, encoding="utf-8"
)
file_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))

listener = logging.handlers.QueueListener(log_queue, file_handler)
listener.start()

log = logging.getLogger("app")
log.setLevel(logging.INFO)
log.addHandler(logging.handlers.QueueHandler(log_queue))   # non-blocking for callers

log.info("handled by the listener thread")

listener.stop()                         # flush before exit`
            ]
        },
        {
            content: `<h3>Compressing Rotated Files</h3>
Handlers expose two hooks: <code>namer</code> chooses the backup file name and <code>rotator</code> performs the move. Overriding both lets you gzip each old log, typically cutting disk use by 90% or more.`,
            codeExamples: [
                `import gzip
import logging
import os
import shutil
from logging.handlers import RotatingFileHandler

def namer(name):
    return name + ".gz"                 # app.log.1  ->  app.log.1.gz

def rotator(source, dest):
    with open(source, "rb") as f_in, gzip.open(dest, "wb") as f_out:
        shutil.copyfileobj(f_in, f_out)
    os.remove(source)

handler = RotatingFileHandler("app.log", maxBytes=1_000_000, backupCount=5)
handler.namer = namer
handler.rotator = rotator

logging.getLogger("app").addHandler(handler)`
            ]
        },
        {
            content: `<h3>Rotation in dictConfig and a Production Checklist</h3>
Use the same classes from a configuration dictionary:`,
            codeExamples: [
                `import logging.config

logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "std": {"format": "%(asctime)s %(levelname)s %(name)s: %(message)s"},
    },
    "handlers": {
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "app.log",
            "maxBytes": 5_000_000,
            "backupCount": 5,
            "formatter": "std",
            "encoding": "utf-8",
        },
        "console": {"class": "logging.StreamHandler", "formatter": "std"},
    },
    "root": {"level": "INFO", "handlers": ["console", "file"]},
})`
            ]
        },
        {
            content: `<h3>Sizing and Retention</h3>
<ul>
<li><b>Budget disk deliberately:</b> total space is about <code>maxBytes x (backupCount + 1)</code> per log. Five files of 5 MB is 30 MB - a number you can plan around.</li>
<li><b>Match retention to need:</b> 7 to 30 daily files for troubleshooting; ship logs to a central store (ELK, Loki, CloudWatch) for long-term search and audit.</li>
<li><b>Rotate by time</b> when people ask "what happened on Tuesday?"; <b>by size</b> when the priority is capping disk use.</li>
<li><b>Mind privacy:</b> rotated logs containing personal data still fall under retention and deletion rules.</li>
<li><b>Alert on volume:</b> a sudden jump in log size often signals a bug (an error in a tight loop).</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Disk use has a hard upper limit</td><td>Oldest messages are permanently lost</td></tr>
<tr><td>Old logs are cleaned up automatically</td><td>Not safe for several processes writing the same file</td></tr>
<tr><td>Part of the standard library (<code>logging.handlers</code>)</td><td>Renaming open files can fail on Windows if another program holds them</td></tr>
<tr><td>Choose size-based or time-based rotation</td><td>A small <code>maxBytes</code> splits one incident across files</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why rotate logs?</td><td>To bound disk use and keep files a manageable size</td></tr>
<tr class='text-center'><td>RotatingFileHandler vs TimedRotatingFileHandler?</td><td>Rotating rolls over by file size (<code>maxBytes</code>); Timed rolls over on a schedule (<code>when</code>, <code>interval</code>)</td></tr>
<tr class='text-center'><td>What does <code>backupCount</code> do?</td><td>Limits how many old files are kept; the oldest is deleted at the next rollover</td></tr>
<tr class='text-center'><td>Is rotation safe with multiple processes?</td><td>No - use a QueueHandler with a single writer, <code>WatchedFileHandler</code> with logrotate, or log to stdout</td></tr>
<tr class='text-center'><td>How do you compress rotated logs?</td><td>Set the handler's <code>namer</code> and <code>rotator</code> attributes to add .gz and gzip the file</td></tr>
</table>`
        }
    ]
};
