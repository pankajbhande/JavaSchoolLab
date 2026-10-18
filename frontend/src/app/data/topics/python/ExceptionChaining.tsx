import type { Topic } from '../../types';

export const exceptionChaining: Topic = {
    id: 'python-exceptions-exception-chaining',
    name: 'Exception Chaining',
    beginner: [
        {
            content: `<h4>What is Exception Chaining?</h4>
When a new exception is raised while another one is being handled, Python <b>links</b> them and shows both in the traceback. You see what originally went wrong <i>and</i> what happened next - nothing is lost. There are three variants:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Form</th><th>Meaning</th><th>Traceback shows</th></tr>
<tr class='text-center'><td>raise inside except (implicit)</td><td>A second error happened while handling the first</td><td>"During handling of the above exception, another exception occurred:"</td></tr>
<tr class='text-center'><td><code>raise New(...) from err</code></td><td>The new error was deliberately caused by the old one</td><td>"The above exception was the direct cause of the following exception:"</td></tr>
<tr class='text-center'><td><code>raise New(...) from None</code></td><td>Hide the original error</td><td>Only the new exception</td></tr>
</table>`
        },
        {
            content: `<h4>Implicit Chaining</h4>
Here the <code>except</code> block itself fails. Python keeps the first exception and prints both.`,
            codeExamples: [
                `config = {}

try:
    port = config["port"]
except KeyError:
    port = int("eighty")          # a bug in the handler

# OUTPUT:
# Traceback (most recent call last):
#   ...
# KeyError: 'port'
#
# During handling of the above exception, another exception occurred:
#
# Traceback (most recent call last):
#   ...
# ValueError: invalid literal for int() with base 10: 'eighty'`
            ]
        },
        {
            content: `<h4>Explicit Chaining with from</h4>
<code>raise NewError(...) from err</code> says "this new error was caused by that one". It is the standard way to turn a low-level error into a clearer, higher-level one while keeping the original for debugging.`,
            codeExamples: [
                `class ConfigError(Exception):
    pass

def get_port(config):
    try:
        return int(config["port"])
    except KeyError as err:
        raise ConfigError("'port' is missing from the config file") from err

get_port({})

# OUTPUT:
# Traceback (most recent call last):
#   ...
# KeyError: 'port'
#
# The above exception was the direct cause of the following exception:
#
# Traceback (most recent call last):
#   ...
# ConfigError: 'port' is missing from the config file`
            ]
        },
        {
            content: `<h4>Suppressing the Original with from None</h4>
When the original exception is just noise for the reader (an internal detail), <code>from None</code> hides it.`,
            codeExamples: [
                `class ConfigError(Exception):
    pass

def get_port(config):
    try:
        return int(config["port"])
    except KeyError:
        raise ConfigError("'port' is missing from the config file") from None

get_port({})

# OUTPUT:
# Traceback (most recent call last):
#   ...
# ConfigError: 'port' is missing from the config file`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>__cause__, __context__ and __suppress_context__</h3>
The links are stored on the new exception:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Form</th><th><code>__cause__</code></th><th><code>__context__</code></th><th><code>__suppress_context__</code></th></tr>
<tr class='text-center'><td>implicit</td><td>None</td><td>the handled exception</td><td>False</td></tr>
<tr class='text-center'><td><code>from err</code></td><td>err</td><td>the handled exception</td><td>True</td></tr>
<tr class='text-center'><td><code>from None</code></td><td>None</td><td>the handled exception</td><td>True</td></tr>
</table>
<code>__context__</code> is always recorded; <code>__suppress_context__</code> only tells the traceback printer not to show it.`,
            codeExamples: [
                `class ConfigError(Exception):
    pass

try:
    try:
        {}["port"]
    except KeyError as err:
        raise ConfigError("port missing") from err
except ConfigError as e:
    print(repr(e.__cause__))
    print(repr(e.__context__))
    print(e.__suppress_context__)

# OUTPUT:
# KeyError('port')
# KeyError('port')
# True`
            ]
        },
        {
            content: `<h3>Translating Exceptions at Layer Boundaries</h3>
A configuration loader may fail with <code>JSONDecodeError</code>, <code>KeyError</code> or <code>ValueError</code>. Callers shouldn't need to know these internals - they catch one domain exception, while <code>__cause__</code> keeps the technical detail. Note the order: <code>JSONDecodeError</code> is a subclass of <code>ValueError</code>, so it must be caught first.`,
            codeExamples: [
                `import json

class ConfigError(Exception):
    """Problems with the application configuration."""

def load_config(text):
    try:
        data = json.loads(text)
        return {"host": data["host"], "port": int(data["port"])}
    except json.JSONDecodeError as err:
        raise ConfigError("config is not valid JSON") from err
    except KeyError as err:
        raise ConfigError(f"missing setting: {err.args[0]}") from err
    except ValueError as err:
        raise ConfigError("port must be a number") from err

samples = [
    '{"host": "db"}',
    '{"host": "db", "port": "x"}',
    "not json",
    '{"host": "db", "port": "5432"}',
]
for text in samples:
    try:
        print(load_config(text))
    except ConfigError as e:
        print("ConfigError:", e, "| caused by", type(e.__cause__).__name__)

# OUTPUT:
# ConfigError: missing setting: port | caused by KeyError
# ConfigError: port must be a number | caused by ValueError
# ConfigError: config is not valid JSON | caused by JSONDecodeError
# {'host': 'db', 'port': 5432}`
            ]
        },
        {
            content: `<h3>Logging the Whole Chain</h3>
<code>logging.exception()</code> (inside an except block) and <code>traceback.print_exception()</code> print the full chain, including the "direct cause" section - so translating exceptions never costs you debugging information.`,
            codeExamples: [
                `import logging

logging.basicConfig(level=logging.ERROR, format="%(levelname)s %(message)s")

try:
    load_config("not json")          # from the previous example
except ConfigError:
    logging.exception("startup failed")

# OUTPUT:
# ERROR startup failed
# Traceback (most recent call last):
#   ...
# json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
#
# The above exception was the direct cause of the following exception:
#
# Traceback (most recent call last):
#   ...
# ConfigError: config is not valid JSON`
            ]
        },
        {
            content: `<h3>Compared with Java</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td><code>throw new ConfigException("msg", cause);</code></td><td><code>raise ConfigError("msg") from cause</code></td></tr>
<tr class='text-center'><td><code>e.getCause()</code></td><td><code>e.__cause__</code></td></tr>
<tr class='text-center'><td>"Caused by:" section in the stack trace</td><td>"The above exception was the direct cause of the following exception:"</td></tr>
<tr class='text-center'><td>No automatic context - an exception thrown in a catch block loses the original unless you pass it</td><td>Implicit chaining records <code>__context__</code> automatically</td></tr>
</table>`
        },
        {
            content: `<h3>add_note(): Context Without a New Type</h3>
If you only want to add information - not change the exception type - <code>add_note()</code> (3.11+) is lighter than chaining: re-raise the same exception with an extra line of context.`,
            codeExamples: [
                `def import_rows(rows):
    for line_no, row in enumerate(rows, start=1):
        try:
            int(row)
        except ValueError as err:
            err.add_note(f"in row {line_no} of students.csv")
            raise

import_rows(["10", "x"])

# OUTPUT:
# Traceback (most recent call last):
#   ...
# ValueError: invalid literal for int() with base 10: 'x'
# in row 2 of students.csv`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>raise X from err</code> do?</td><td>Raises X with <code>__cause__</code> set to err; the traceback shows err as the direct cause</td></tr>
<tr class='text-center'><td>Implicit vs explicit chaining?</td><td>Implicit: an exception raised while handling another sets <code>__context__</code>. Explicit: <code>from err</code> sets <code>__cause__</code> and marks it intentional</td></tr>
<tr class='text-center'><td>What does <code>from None</code> do?</td><td>Suppresses display of the original exception (sets <code>__suppress_context__</code>)</td></tr>
<tr class='text-center'><td>Why translate exceptions at layer boundaries?</td><td>Callers handle one domain error type while the original is preserved for debugging</td></tr>
<tr class='text-center'><td>Java equivalent of <code>from err</code>?</td><td>Passing the cause to the constructor: <code>new MyException(msg, cause)</code></td></tr>
</table>`
        }
    ]
};
