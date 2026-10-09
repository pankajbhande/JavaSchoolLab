import type { Topic } from '../../types';

export const loggingHandlersFormatters: Topic = {
    id: 'python-debugging-handlers-formatters',
    name: 'Handlers & Formatters',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A logging call travels through a small pipeline. The <b>logger</b> creates a record if the level allows it; each attached <b>handler</b> decides where the record goes (console, file, network); each handler's <b>formatter</b> turns the record into text. Because handlers and formatters are separate objects, one message can go to several destinations in different shapes. Java developers will recognise Log4j's <i>appenders</i> and <i>layouts</i>.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 688 165" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:688px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<line x1="114.3" y1="59.2" x2="160.0" y2="42.8" stroke="#6b7280" marker-end="url(#ar)"/><line x1="114.3" y1="95.8" x2="160.0" y2="111.4" stroke="#6b7280" marker-end="url(#ar)"/><line x1="242.4" y1="28.0" x2="310.0" y2="28.0" stroke="#6b7280" marker-end="url(#ar)"/><line x1="257.0" y1="128.0" x2="310.0" y2="128.0" stroke="#6b7280" marker-end="url(#ar)"/><line x1="443.5" y1="28.0" x2="540.0" y2="28.0" stroke="#6b7280" marker-end="url(#ar)"/><line x1="472.7" y1="128.0" x2="540.0" y2="128.0" stroke="#6b7280" marker-end="url(#ar)"/><rect x="10" y="55" width="104.3" height="46" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="62.2" y="74.5">Logger</tspan><tspan x="62.2" y="89.5">level DEBUG</tspan></text><rect x="160" y="5" width="82.4" height="46" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="201.2" y="24.5">Handler</tspan><tspan x="201.2" y="39.5">WARNING+</tspan></text><rect x="160" y="105" width="97" height="46" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="208.5" y="124.5">Handler</tspan><tspan x="208.5" y="139.5">all levels</tspan></text><rect x="310" y="5" width="133.5" height="46" rx="6" fill="#f5f3ff" stroke="#7c3aed"/><text text-anchor="middle" font-size="12" fill="#5b21b6"><tspan x="376.8" y="24.5">Formatter</tspan><tspan x="376.8" y="39.5">level - message</tspan></text><rect x="310" y="105" width="162.7" height="46" rx="6" fill="#f5f3ff" stroke="#7c3aed"/><text text-anchor="middle" font-size="12" fill="#5b21b6"><tspan x="391.4" y="124.5">Formatter</tspan><tspan x="391.4" y="139.5">name | level | func</tspan></text><rect x="540" y="5" width="97" height="46" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="588.5" y="24.5">sys.stdout</tspan><tspan x="588.5" y="39.5">(console)</tspan></text><rect x="540" y="105" width="133.5" height="46" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="606.8" y="124.5">file / StringIO</tspan><tspan x="606.8" y="139.5">(detailed log)</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: one record, two handlers, each with its own level and formatter</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> With print() you must write a message to the screen, again to a file, and again in another format. Changing the destination means editing every call.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Send one message to <b>several destinations</b> at once.</li>
<li>Give each destination its own <b>level</b> and <b>format</b> (short on screen, detailed in a file).</li>
<li>Change where logs go by configuration, not by editing code.</li>
<li>Add fields such as logger name, function name or line number to every line.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: One logger, two handlers, two formats</h4>
A console handler shows only warnings in a short format; a second handler writes everything in a detailed format to an in-memory buffer (a file works the same way).`,
            codeExamples: [
                `import io
import logging
import sys

DETAILED = "%(name)s | %(levelname)-7s | %(funcName)s | %(message)s"


def build_logger(buffer):
    logger = logging.getLogger("app")
    logger.setLevel(logging.DEBUG)

    console = logging.StreamHandler(sys.stdout)
    console.setLevel(logging.WARNING)
    console.setFormatter(logging.Formatter("%(levelname)s - %(message)s"))

    detailed = logging.StreamHandler(buffer)
    detailed.setFormatter(logging.Formatter(DETAILED))

    logger.addHandler(console)
    logger.addHandler(detailed)
    return logger


def process(logger):
    logger.debug("start")
    logger.info("loaded %d rows", 42)
    logger.warning("row %d is empty", 7)


def main():
    buffer = io.StringIO()
    print("--- console: WARNING and up ---")
    process(build_logger(buffer))
    print("--- detailed handler ---")
    print(buffer.getvalue(), end="")


if __name__ == "__main__":
    main()

# OUTPUT:
# --- console: WARNING and up ---
# WARNING - row 7 is empty
# --- detailed handler ---
# app | DEBUG   | process | start
# app | INFO    | process | loaded 42 rows
# app | WARNING | process | row 7 is empty`
            ],
            codeExplanations: [
                `The logger lets everything through (DEBUG), then each handler applies its own filter: the console handler has level WARNING, the buffer handler has none. %(funcName)s is filled in automatically with the function that made the call, here process. Replace StringIO with logging.FileHandler("app.log") to write to a real file.`
            ]
        },
        {
            content: `<h4>The Four Parts of logging</h4>
The logging system separates <b>who</b> logs, <b>where</b> output goes, <b>what it looks like</b>, and <b>what is allowed through</b>:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Part</th><th>Role</th></tr>
<tr class='text-center'><td><b>Logger</b></td><td>The object your code calls (<code>log.info(...)</code>); decides by level whether to create a record</td></tr>
<tr class='text-center'><td><b>Handler</b></td><td>Sends records to a destination: console, file, email, network</td></tr>
<tr class='text-center'><td><b>Formatter</b></td><td>Turns a record into the final text line</td></tr>
<tr class='text-center'><td><b>Filter</b></td><td>Extra rules to accept or reject records</td></tr>
</table>
A logger can have <b>several handlers</b>, each with its own level and formatter - for example everything to a file, but only warnings to the console.`
        },
        {
            content: `<h4>Formatters: Describing the Line</h4>
A <code>Formatter</code> takes a format string using <code>%(name)s</code> placeholders (called <b>LogRecord attributes</b>).
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Placeholder</th><th>Meaning</th></tr>
<tr class='text-center'><td><code>%(asctime)s</code></td><td>Timestamp (format with <code>datefmt</code>)</td></tr>
<tr class='text-center'><td><code>%(levelname)s</code></td><td>DEBUG, INFO, WARNING...</td></tr>
<tr class='text-center'><td><code>%(name)s</code></td><td>Logger name</td></tr>
<tr class='text-center'><td><code>%(message)s</code></td><td>The log message</td></tr>
<tr class='text-center'><td><code>%(filename)s</code> <code>%(lineno)d</code> <code>%(funcName)s</code></td><td>Where the call was made</td></tr>
<tr class='text-center'><td><code>%(process)d</code> <code>%(threadName)s</code></td><td>Process id / thread name</td></tr>
</table>`
        },
        {
            content: `<h4>Console and File at Once</h4>
Attach one handler for the terminal (short and only INFO+) and one for a file (detailed, with everything).`,
            codeExamples: [
                `import logging
import sys

log = logging.getLogger("app")
log.setLevel(logging.DEBUG)            # the logger lets everything through

console = logging.StreamHandler(sys.stdout)
console.setLevel(logging.INFO)         # ...but this handler shows INFO and up
console.setFormatter(logging.Formatter("%(levelname)s - %(message)s"))

to_file = logging.FileHandler("app.log", encoding="utf-8")
to_file.setFormatter(logging.Formatter(
    "%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
))

log.addHandler(console)
log.addHandler(to_file)

log.debug("only in the file")
log.info("in both")

# OUTPUT on the console:
# INFO - in both
#
# CONTENTS of app.log (time varies):
# 2026-10-05 15:42:01 | app | DEBUG | only in the file
# 2026-10-05 15:42:01 | app | INFO | in both`
            ],
            codeExplanations: [
                `The logger's level is the first gate; each handler's level is a second gate. Setting the logger to DEBUG and the console handler to INFO is the usual pattern: the file gets full detail while the terminal stays quiet. datefmt uses strftime codes to shorten asctime and drops the milliseconds.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Duplicate-Lines Bug: propagate</h3>
By default a record handled by a logger <b>also travels up to its parents' handlers</b>. If you add a handler to a named logger <i>and</i> something configured the root logger (such as <code>basicConfig</code>), every message appears twice. Fix it by configuring only one place, or set <code>propagate = False</code>.`,
            codeExamples: [
                `import logging
import sys

logging.basicConfig(level=logging.INFO, format="root: %(message)s")

log = logging.getLogger("app")
log.addHandler(logging.StreamHandler(sys.stdout))

log.info("hello")
log.propagate = False
log.info("world")

# OUTPUT:
# hello           <- app's own handler
# root: hello     <- same record, propagated to the root handler
# world           <- with propagate=False only the app handler runs`
            ]
        },
        {
            content: `<h3>Custom Formatters: JSON Logs</h3>
Log aggregation tools (ELK, Loki, CloudWatch, Datadog) work best with <b>structured</b> logs, one JSON object per line. Subclass <code>Formatter</code> and override <code>format()</code>.`,
            codeExamples: [
                `import json
import logging

class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload)

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())

log = logging.getLogger("svc")
log.addHandler(handler)
log.setLevel(logging.INFO)
log.propagate = False

log.info("user %s logged in", "asha")

# OUTPUT:
# {"level": "INFO", "logger": "svc", "message": "user asha logged in"}`
            ]
        },
        {
            content: `<h3>Filters: Accept or Reject Records</h3>
A <code>Filter</code> returns <code>True</code> to keep a record and <code>False</code> to drop it. It can also <b>add fields</b> to every record (a request id, the current user). Attach it to a logger or to a handler.`,
            codeExamples: [
                `import logging

class NoHealthChecks(logging.Filter):
    def filter(self, record):
        return "/health" not in record.getMessage()

class AddHost(logging.Filter):
    def filter(self, record):
        record.host = "web-01"
        return True

handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(host)s %(message)s"))
handler.addFilter(AddHost())
handler.addFilter(NoHealthChecks())

log = logging.getLogger("access")
log.addHandler(handler)
log.setLevel(logging.INFO)
log.propagate = False

log.info("GET /health 200")
log.info("GET /orders 200")

# OUTPUT:
# web-01 GET /orders 200`
            ]
        },
        {
            content: `<h3>Configuring Everything With dictConfig</h3>
For real applications describe the whole setup in <b>one dictionary</b> (often loaded from YAML or JSON) with <code>logging.config.dictConfig</code>. It is declarative, easy to change per environment, and replaces many lines of <code>addHandler</code> calls.`,
            codeExamples: [
                `import logging.config

logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,       # keep loggers created before this call
    "formatters": {
        "std": {"format": "%(asctime)s %(levelname)s %(name)s: %(message)s"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "std",
            "level": "INFO",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": "app.log",
            "formatter": "std",
            "encoding": "utf-8",
        },
    },
    "loggers": {
        "app": {"level": "DEBUG", "handlers": ["console", "file"], "propagate": False},
        "urllib3": {"level": "WARNING"},      # quieten a noisy library
    },
    "root": {"level": "WARNING", "handlers": ["console"]},
})

logging.getLogger("app.orders").info("order created")`
            ]
        },
        {
            content: `<h3>Handler Types Worth Knowing</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Handler</th><th>Sends records to</th></tr>
<tr class='text-center'><td><code>StreamHandler</code></td><td>A stream: stderr by default, or <code>sys.stdout</code></td></tr>
<tr class='text-center'><td><code>FileHandler</code></td><td>A file</td></tr>
<tr class='text-center'><td><code>RotatingFileHandler</code> / <code>TimedRotatingFileHandler</code></td><td>A file that rolls over (next topic)</td></tr>
<tr class='text-center'><td><code>NullHandler</code></td><td>Nowhere - the "do nothing" handler for libraries</td></tr>
<tr class='text-center'><td><code>SMTPHandler</code></td><td>Email (use for CRITICAL only)</td></tr>
<tr class='text-center'><td><code>SysLogHandler</code> / <code>HTTPHandler</code></td><td>The system log / a web endpoint</td></tr>
<tr class='text-center'><td><code>QueueHandler</code> + <code>QueueListener</code></td><td>A queue, so slow handlers run on a background thread and do not block your code</td></tr>
</table>
In containers, the usual advice is to log to <b>stdout</b> with a <code>StreamHandler</code> and let the platform collect and ship the output.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Several destinations from a single log call</td><td>More objects to wire up than a single print()</td></tr>
<tr><td>Per-handler level and format give the right detail in each place</td><td>Adding a handler twice duplicates every line</td></tr>
<tr><td>Many ready-made handlers: file, rotating, syslog, email, HTTP</td><td>Format strings use the older <code>%(name)s</code> style by default</td></tr>
<tr><td>Format fields (function, line, thread) are added automatically</td><td>Misconfigured levels silently hide messages</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between a logger level and a handler level?</td><td>The logger level decides whether a record is created; each handler level then decides whether that handler outputs it</td></tr>
<tr class='text-center'><td>Why do log lines appear twice?</td><td>A record propagates to the root logger's handlers too; configure one place or set <code>propagate = False</code></td></tr>
<tr class='text-center'><td>How do you produce JSON logs?</td><td>Subclass <code>logging.Formatter</code> and override <code>format()</code> to return <code>json.dumps(...)</code></td></tr>
<tr class='text-center'><td>What is a Filter used for?</td><td>Dropping records or injecting extra context fields such as a request id</td></tr>
<tr class='text-center'><td>How do you configure logging for a whole app?</td><td><code>logging.config.dictConfig</code> with a dictionary of formatters, handlers, loggers and root</td></tr>
</table>`
        }
    ]
};
