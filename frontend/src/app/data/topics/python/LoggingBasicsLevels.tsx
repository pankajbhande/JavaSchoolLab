import type { Topic } from '../../types';

export const loggingBasicsLevels: Topic = {
    id: 'python-debugging-logging-basics-log-levels',
    name: 'logging Basics & Log Levels',
    beginner: [
        {
            content: `<h4>Introduction</h4>
The standard <code>logging</code> module records what a program does as <b>messages with a severity level</b>: <code>DEBUG</code>, <code>INFO</code>, <code>WARNING</code>, <code>ERROR</code> and <code>CRITICAL</code>. A <b>logger</b> has a threshold level and silently drops anything below it, so one program can be verbose in development and quiet in production without code changes. It is the Python counterpart of Java's <b>SLF4J / Log4j</b>, and the level names are almost the same.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 313 236" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:313px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="292.8" height="31" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="156.4" y="29.5">CRITICAL  50   program may stop</tspan></text><rect x="10" y="47" width="292.8" height="31" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="156.4" y="66.5">ERROR     40   an operation failed</tspan></text><rect x="10" y="84" width="292.8" height="31" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="156.4" y="103.5">WARNING   30   unexpected, continues</tspan></text><rect x="10" y="121" width="292.8" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="156.4" y="140.5">INFO      20   normal events</tspan></text><rect x="10" y="158" width="292.8" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="156.4" y="177.5">DEBUG     10   developer detail</tspan></text><rect x="10" y="195" width="292.8" height="31" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="156.4" y="214.5">setLevel(WARNING): top three pass</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: a logger passes messages at or above its level</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> print() output cannot be switched off, filtered or sent elsewhere. Production code is flooded with debug text, or you delete the prints and lose the information when a bug appears.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Separate <b>routine detail</b> from <b>real problems</b> using levels.</li>
<li>Change verbosity by configuration, not by editing code.</li>
<li>Add context (logger name, level, time) to every message automatically.</li>
<li>Use the same API in libraries and applications.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Five levels, two thresholds</h4>
The same five messages are emitted twice: first with the logger at WARNING, then at DEBUG. Output goes to stdout.`,
            codeExamples: [
                `import logging
import sys

FORMAT = "%(levelname)-8s %(name)s: %(message)s"


def build_logger(level):
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(FORMAT))
    logger = logging.getLogger("shop")
    logger.setLevel(level)
    logger.addHandler(handler)
    return logger


def emit_all(logger):
    logger.debug("cache miss for item %d", 7)
    logger.info("order %s created", "A-101")
    logger.warning("low stock: %d left", 3)
    logger.error("payment failed")
    logger.critical("database down")


def main():
    logger = build_logger(logging.WARNING)
    print("--- level WARNING ---")
    emit_all(logger)

    logger.setLevel(logging.DEBUG)
    print("--- level DEBUG ---")
    emit_all(logger)


if __name__ == "__main__":
    main()

# OUTPUT:
# --- level WARNING ---
# WARNING  shop: low stock: 3 left
# ERROR    shop: payment failed
# CRITICAL shop: database down
# --- level DEBUG ---
# DEBUG    shop: cache miss for item 7
# INFO     shop: order A-101 created
# WARNING  shop: low stock: 3 left
# ERROR    shop: payment failed
# CRITICAL shop: database down`
            ],
            codeExplanations: [
                `%(levelname)-8s pads the level name to 8 characters so the columns line up. The handler itself has no level, so the logger's threshold decides what passes: WARNING lets three messages through, DEBUG lets all five. Arguments such as %d are formatted only when a message is actually emitted.`
            ]
        },
        {
            content: `<h4>Why logging Instead of print()?</h4>
<code>print()</code> is fine for a quick look, but real applications need more. The standard <code>logging</code> module gives you:
<ul>
<li><b>Severity levels</b> - separate routine detail from real problems.</li>
<li><b>Switchable output</b> - show everything while developing, only warnings in production, without editing code.</li>
<li><b>Context</b> - timestamps, module name, line number, thread, and tracebacks added automatically.</li>
<li><b>Destinations</b> - console, files, email, network - decided by configuration, not by each call.</li>
</ul>
It is Python's equivalent of Java's SLF4J / Log4j.`
        },
        {
            content: `<h4>The Five Levels</h4>
A logger only emits messages at or above its configured level. The default level is <b>WARNING</b>, which is why <code>info()</code> messages seem to vanish until you configure logging.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Level</th><th>Number</th><th>Use for</th></tr>
<tr class='text-center'><td><code>DEBUG</code></td><td>10</td><td>Detailed diagnostics for developers</td></tr>
<tr class='text-center'><td><code>INFO</code></td><td>20</td><td>Normal events: started, request served, job finished</td></tr>
<tr class='text-center'><td><code>WARNING</code></td><td>30</td><td>Something unexpected, but the program carries on (disk nearly full)</td></tr>
<tr class='text-center'><td><code>ERROR</code></td><td>40</td><td>A failure: an operation could not be completed</td></tr>
<tr class='text-center'><td><code>CRITICAL</code></td><td>50</td><td>The whole program may not be able to continue</td></tr>
</table>`
        },
        {
            content: `<h4>Your First Logger</h4>
<code>basicConfig()</code> sets up a console handler once. <code>getLogger(name)</code> returns a named logger; each call logs at one level.`,
            codeExamples: [
                `import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:%(name)s:%(message)s",
)
log = logging.getLogger("shop")

log.debug("hidden - below INFO")
log.info("started")
log.warning("low stock: %d items", 3)
log.error("payment failed")

# OUTPUT (written to stderr):
# INFO:shop:started
# WARNING:shop:low stock: 3 items
# ERROR:shop:payment failed`
            ],
            codeExplanations: [
                `The level INFO lets INFO and above through, so the debug line is dropped. The format string describes each line: level name, logger name, message. Notice the message uses %d with a separate argument rather than formatting the string first - the logging module does the formatting only if the message is actually emitted.`
            ]
        },
        {
            content: `<h4>Logging Exceptions</h4>
Inside an <code>except</code> block, <code>log.exception()</code> logs at ERROR level <b>and appends the full traceback</b>. It is the right way to record a caught failure.`,
            codeExamples: [
                `import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(message)s")
log = logging.getLogger("calc")

def divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        log.exception("could not divide %s by %s", a, b)
        return None

print(divide(10, 0))

# OUTPUT (shortened):
# ERROR:could not divide 10 by 0
# Traceback (most recent call last):
#   ...
# ZeroDivisionError: division by zero
# None`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>One Logger per Module: getLogger(__name__)</h3>
Loggers form a <b>hierarchy</b> by dotted name: <code>"app.db"</code> is a child of <code>"app"</code>, which is a child of the root logger. A child with no level of its own <b>inherits</b> its parent's level, and its records <b>propagate</b> upward to the parents' handlers. Creating <code>log = logging.getLogger(__name__)</code> at the top of each module mirrors your package structure automatically, so you can tune verbosity per package.`,
            codeExamples: [
                `import logging

logging.basicConfig(level=logging.WARNING,
                    format="%(name)s %(levelname)s %(message)s")

logging.getLogger("app").setLevel(logging.DEBUG)

logging.getLogger("app.db").debug("query ran")     # inherits DEBUG from "app"
logging.getLogger("other").debug("never shown")    # inherits WARNING from root
logging.getLogger("other").warning("shown")

# OUTPUT:
# app.db DEBUG query ran
# other WARNING shown`
            ]
        },
        {
            content: `<h3>Lazy Formatting: Pass Arguments, Do Not Build the String</h3>
<code>log.debug("value=%s", obj)</code> defers formatting until the record is actually emitted. <code>log.debug(f"value={obj}")</code> formats <b>every time</b>, even when DEBUG is off - wasted work in hot paths, and an expensive <code>__str__</code> may run for nothing. For costly <i>argument computation</i> guard with <code>log.isEnabledFor(logging.DEBUG)</code>.`,
            codeExamples: [
                `import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("demo")

class Costly:
    def __str__(self):
        print("formatting!")
        return "costly"

log.debug("value=%s", Costly())        # DEBUG is off: __str__ never runs
log.debug(f"value={Costly()}")         # the f-string calls __str__ immediately

if log.isEnabledFor(logging.DEBUG):
    log.debug("expensive: %s", sum(range(10_000_000)))

# OUTPUT:
# formatting!`
            ]
        },
        {
            content: `<h3>Rules for Libraries vs Applications</h3>
<ul>
<li><b>Applications</b> configure logging <i>once</i>, at startup (<code>basicConfig</code> or <code>dictConfig</code>) in the entry-point module.</li>
<li><b>Libraries</b> only call <code>getLogger(__name__)</code> and log. They must <b>never</b> call <code>basicConfig</code> or add real handlers - that is the application's decision. A library may add a <code>NullHandler</code> to its top-level logger to avoid "no handlers" noise.</li>
<li>Don't log in <b>module-level code that runs on import</b>, before configuration exists.</li>
<li>Don't call <code>logging.info()</code> (module-level functions use the <i>root</i> logger) from library code; use a named logger.</li>
</ul>`,
            codeExamples: [
                `# mylib/__init__.py
import logging
logging.getLogger(__name__).addHandler(logging.NullHandler())

# mylib/client.py
import logging
log = logging.getLogger(__name__)         # "mylib.client"

def fetch(url):
    log.debug("fetching %s", url)
    ...`
            ]
        },
        {
            content: `<h3>Useful Extras: exc_info, extra and stack_info</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Option</th><th>Effect</th></tr>
<tr class='text-center'><td><code>exc_info=True</code></td><td>Attach the current exception's traceback to any level (<code>log.warning("retrying", exc_info=True)</code>)</td></tr>
<tr class='text-center'><td><code>stack_info=True</code></td><td>Attach the current call stack (no exception needed)</td></tr>
<tr class='text-center'><td><code>extra={"user_id": 7}</code></td><td>Add custom fields to the record, usable as <code>%(user_id)s</code> in a formatter</td></tr>
<tr class='text-center'><td><code>log.setLevel(...)</code></td><td>Change a logger's threshold at runtime</td></tr>
<tr class='text-center'><td><code>logging.disable(logging.CRITICAL)</code></td><td>Silence everything, e.g. during tests</td></tr>
</table>
<b>Security:</b> never log passwords, tokens, card numbers or other personal data. Logs are copied to many systems and kept for a long time.`,
            codeExamples: [
                `import logging

logging.basicConfig(level=logging.INFO,
                    format="%(levelname)s [user=%(user_id)s] %(message)s")
log = logging.getLogger("audit")

log.info("profile updated", extra={"user_id": 7})

# OUTPUT:
# INFO [user=7] profile updated`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Levels let you filter noise without touching call sites</td><td>Default level is WARNING: <code>info()</code> seems to vanish</td></tr>
<tr><td>Verbosity is a configuration choice per environment</td><td>More setup than a simple <code>print()</code></td></tr>
<tr><td>Lazy <code>%</code> formatting avoids wasted work</td><td>Easy to log secrets or personal data by accident</td></tr>
<tr><td>Standard library: same API in every Python project</td><td>Level choice is subjective; teams need conventions</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are the logging levels, in order?</td><td>DEBUG (10), INFO (20), WARNING (30), ERROR (40), CRITICAL (50)</td></tr>
<tr class='text-center'><td>What is the default level and why does it matter?</td><td>WARNING - so debug and info messages are dropped until you configure a lower level</td></tr>
<tr class='text-center'><td>Why <code>getLogger(__name__)</code>?</td><td>Names follow the module hierarchy, so you can set levels per package and see where each message came from</td></tr>
<tr class='text-center'><td>Why <code>log.info("x=%s", x)</code> instead of an f-string?</td><td>Formatting is deferred until the message will actually be emitted</td></tr>
<tr class='text-center'><td>How do you log an exception with its traceback?</td><td><code>log.exception("msg")</code> inside the except block, or <code>exc_info=True</code></td></tr>
<tr class='text-center'><td>Should a library configure logging?</td><td>No - only the application configures handlers; a library just uses a named logger (and a NullHandler)</td></tr>
</table>`
        }
    ]
};
