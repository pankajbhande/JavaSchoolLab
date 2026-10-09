// Module 6 (Exception Handling): all topics.
import { dd, r, type DeepDive } from './deepDive';

export const m06a: Record<string, DeepDive> = {
    'What are Exceptions?': dd(
        [`An <b>exception</b> is an object Python creates when something goes wrong at runtime (dividing by zero, missing file, bad key). Normal flow stops and Python looks for a handler; if none exists the program ends with a traceback.`,
            r`# An error at runtime raises an exception object
numbers = [10, 20, 30]
print("before")
print(numbers[5])          # IndexError is raised here - flow stops
print("after")             # never reached

# OUTPUT:
# before
# IndexError: list index out of range`],
        [`Programs meet bad input, missing files and dead networks. Without exceptions every function would have to return error codes that callers might forget to check. Exceptions separate the normal path from the error path.`,
            r`# Error-code style (easy to ignore) vs exception style (cannot be ignored)
def parse_code(s):
    return int(s)            # raises ValueError by itself on bad input

try:
    age = parse_code("abc")
except ValueError as e:
    print("Caught:", e)

# OUTPUT:
# Caught: invalid literal for int() with base 10: 'abc'`],
        [`Web APIs turn exceptions into HTTP 400/500 responses, batch jobs log and continue with the next record, and installers roll back on failure.`,
            r`# Batch job: one bad record must not kill the whole run
records = ["5", "x", "7"]
total = 0
for rec in records:
    try:
        total += int(rec)
    except ValueError:
        print("skipping bad record:", rec)
print("total =", total)

# OUTPUT:
# skipping bad record: x
# total = 12`],
        [`<b>Advantages:</b> errors carry a type, message and traceback; they propagate up the call stack automatically; code stays readable because the happy path is not cluttered with checks.`,
            r`# Propagation: no code in the middle needs to know about the error
def level3(): return 1 / 0
def level2(): return level3()
def level1(): return level2()

try:
    level1()
except ZeroDivisionError as e:
    print("handled at the top:", e)

# OUTPUT:
# handled at the top: division by zero`],
        [`<b>Disadvantages:</b> invisible control flow (any line may jump away), over-broad handlers hide real bugs, and a raised exception costs more than an if-check.`,
            r`# Disadvantage: a bare/broad except silently hides a typo bug
def total(prices):
    try:
        return sum(prces)          # typo: NameError swallowed below
    except Exception:
        return 0                   # wrong, but nobody notices

print(total([1, 2, 3]))

# OUTPUT:
# 0`],
        [`<b>Limitations:</b> a few failures cannot be caught or are not meant to be (SyntaxError at compile time, hard crashes, process kill, memory exhaustion in C code). Exceptions are also per thread.`,
            r`# SyntaxError happens before the code runs, so try/except in the same file cannot catch it
# But code compiled at runtime can be caught:
try:
    eval("1 +")
except SyntaxError as e:
    print("caught only because eval compiles at runtime:", type(e).__name__)

# OUTPUT:
# caught only because eval compiles at runtime: SyntaxError`],
        `
   call stack                                   handler search
   +-----------+
   | level1()  |  <-- except ZeroDivisionError   (3) found, handled
   +-----------+              ^
   | level2()  |              | (2) no handler, unwind
   +-----------+              |
   | level3()  |  1/0 --> raise ZeroDivisionError (1)
   +-----------+
`,
        `Use exceptions for exceptional, not routine, conditions. Catch at the boundary that can actually recover (request handler, job loop), let everything else bubble up, and always log the traceback. Prefer explicit checks (if key in d) when the failure is common and hot.`
    ),

    'try & except': dd(
        [`<code>try</code> wraps risky code; <code>except</code> names the error type to handle. If the try block raises that type, the except block runs and the program continues.`,
            r`try:
    value = int("42x")                 # risky call
except ValueError:                     # only ValueError is handled
    value = 0
    print("not a number, using 0")
print("value:", value)

# OUTPUT:
# not a number, using 0
# value: 0`],
        [`You need a way to keep running, show a friendly message, retry, or clean up instead of crashing on predictable failures such as user typos.`,
            r`# Keep asking until the input is valid (input simulated with a list)
answers = iter(["ten", "", "10"])
while True:
    try:
        n = int(next(answers))
        break
    except ValueError:
        print("please enter digits")
print("accepted", n)

# OUTPUT:
# please enter digits
# please enter digits
# accepted 10`],
        [`Reading config files, parsing user or network data, calling external services and converting types are everyday try/except places.`,
            r`# Config reader with a default when the file is missing
def read_config(path):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        return "defaults"

print(read_config("no_such_file.cfg"))

# OUTPUT:
# defaults`],
        [`<b>Advantages:</b> EAFP style ("easier to ask forgiveness than permission") avoids race conditions between check and use, and the exception object gives details via <code>as e</code>.`,
            r`# EAFP: no race between "does the key exist" and "read it"
stock = {"apple": 3}
try:
    qty = stock["pear"]
except KeyError as e:
    qty = 0
    print("missing key:", e)
print(qty)

# OUTPUT:
# missing key: 'pear'
# 0`],
        [`<b>Disadvantages:</b> catching too much (bare <code>except:</code>) swallows KeyboardInterrupt and real bugs; a large try body makes it unclear which line failed.`,
            r`# Bare except even swallows Ctrl+C style exits
import sys
try:
    sys.exit(1)               # SystemExit
except:                       # bare except catches it - bad practice
    print("exit was swallowed!")

# OUTPUT:
# exit was swallowed!`],
        [`<b>Limitations:</b> except only matches by type (and subclasses); the first matching clause wins, so order matters; the name bound by <code>as e</code> is deleted when the block ends.`,
            r`try:
    1 / 0
except ZeroDivisionError as e:
    pass
try:
    print(e)                  # e was deleted at the end of the except block
except NameError as err:
    print("NameError:", err)

# OUTPUT:
# NameError: name 'e' is not defined`],
        `
   try:  -------------------+
      risky code             |  no error ----> skip except ----> continue
   except Type as e:  <------+  error of Type
      handle it  ---------------------------------------------> continue
   (other error types ---> keep propagating up)
`,
        `Keep try blocks tiny (one risky call), catch the narrowest type you can act on, and never use bare except. Handle errors where you have enough context to recover; otherwise let them propagate and be logged centrally.`
    ),

    'else & finally': dd(
        [`<code>else</code> runs only if the try block finished with no exception. <code>finally</code> runs always - success, handled error, unhandled error, even return - making it the place for cleanup.`,
            r`try:
    n = int("7")
except ValueError:
    print("bad")
else:
    print("no error, n =", n)      # only on success
finally:
    print("cleanup always runs")

# OUTPUT:
# no error, n = 7
# cleanup always runs`],
        [`Cleanup (closing files, releasing locks, DB connections) must happen even when errors occur, and success-only code should not sit inside try where its own errors would be mis-caught.`,
            r`# Without finally the "release" line is skipped when an error happens
def run():
    print("lock acquired")
    try:
        return 1 / 0
    finally:
        print("lock released")      # still runs

try:
    run()
except ZeroDivisionError:
    print("error reported")

# OUTPUT:
# lock acquired
# lock released
# error reported`],
        [`DB transactions: commit in else, rollback in except, close the connection in finally. Same for temp files, sockets and timers.`,
            r`def transfer(ok):
    print("begin")
    try:
        if not ok: raise RuntimeError("insufficient funds")
    except RuntimeError as e:
        print("rollback:", e)
    else:
        print("commit")
    finally:
        print("close connection")

transfer(True); transfer(False)

# OUTPUT:
# begin
# commit
# close connection
# begin
# rollback: insufficient funds
# close connection`],
        [`<b>Advantages:</b> guaranteed cleanup, and <code>else</code> narrows try to only the risky line so unrelated bugs are not hidden.`,
            r`# else keeps the follow-up code outside the protected region
try:
    data = int("5")
except ValueError:
    print("bad number")
else:
    print("result:", 10 // (data - 5))   # ZeroDivisionError here is NOT caught by except ValueError

# OUTPUT:
# ZeroDivisionError: integer division or modulo by zero`],
        [`<b>Disadvantages:</b> a <code>return</code> in finally overrides the real return value or exception - a classic trap.`,
            r`def f():
    try:
        return "from try"
    finally:
        return "from finally"      # silently wins; also swallows exceptions

print(f())

# OUTPUT:
# from finally`],
        [`<b>Limitations:</b> finally cannot run if the process is killed (os._exit, power loss, kill -9), and an exception inside finally replaces the original one.`,
            r`def g():
    try:
        raise ValueError("original")
    finally:
        raise KeyError("from finally")     # replaces the ValueError

try:
    g()
except Exception as e:
    print(type(e).__name__, "| context:", repr(e.__context__))

# OUTPUT:
# KeyError | context: ValueError('original')`],
        `
   try ----> ok? --yes--> else ------+
              |                      |
              no --> except ---------+--> finally --> continue
              |                      |
          unhandled ----------------+--> finally --> keep propagating
`,
        `Treat finally as a last resort; prefer context managers (with) which package acquire/release safely. Never return, break or continue in finally. Use else to keep protected regions minimal.`
    ),

    'Handling Multiple Exceptions': dd(
        [`One try can have several except clauses, or one clause can take a tuple of types. Python checks them top to bottom and runs the first that matches.`,
            r`def parse(x):
    try:
        return 10 / int(x)
    except ValueError:
        return "not a number"
    except ZeroDivisionError:
        return "zero not allowed"

print(parse("a"), "|", parse("0"), "|", parse("5"))

# OUTPUT:
# not a number | zero not allowed | 2.0`],
        [`Different failures need different responses - retry on timeout, abort on bad input - and sometimes the same response fits several types.`,
            r`# Tuple form: same handling for several types
def load(d, k):
    try:
        return d[k]
    except (KeyError, IndexError, TypeError) as e:
        return f"lookup failed ({type(e).__name__})"

print(load({"a": 1}, "b"))
print(load([1, 2], 9))
print(load(None, 0))

# OUTPUT:
# lookup failed (KeyError)
# lookup failed (IndexError)
# lookup failed (TypeError)`],
        [`HTTP clients map timeouts, connection errors and bad status codes to different retry/abort policies. Here is the same idea using built-in types.`,
            r`def fetch(kind):
    try:
        if kind == "timeout": raise TimeoutError()
        if kind == "net":     raise ConnectionError()
        return "ok"
    except TimeoutError:
        return "retry later"
    except ConnectionError:
        return "check network"

print([fetch(k) for k in ("timeout", "net", "fine")])

# OUTPUT:
# ['retry later', 'check network', 'ok']`],
        [`<b>Advantages:</b> precise handling per failure; grouping avoids duplicate code. Python 3.11 adds <code>except*</code> for ExceptionGroup (concurrent errors).`,
            r`# Python 3.11+: handle several errors raised together
try:
    raise ExceptionGroup("batch", [ValueError("v"), TypeError("t")])
except* ValueError as eg:
    print("values:", [str(x) for x in eg.exceptions])
except* TypeError as eg:
    print("types :", [str(x) for x in eg.exceptions])

# OUTPUT:
# values: ['v']
# types : ['t']`],
        [`<b>Disadvantages:</b> long ladders of except clauses are noisy, and a broad class placed first hides the narrower ones below it.`,
            r`try:
    int("x")
except Exception:                     # too broad, placed first
    print("generic handler ran")
except ValueError:                    # unreachable in practice
    print("specific handler")

# OUTPUT:
# generic handler ran`],
        [`<b>Limitations:</b> only the first matching clause runs; you cannot fall through to a second one. Re-raise or nest a try if you need both.`,
            r`try:
    try:
        int("x")
    except ValueError:
        print("inner handled")
        raise                          # re-raise so the outer clause also sees it
except Exception as e:
    print("outer saw:", type(e).__name__)

# OUTPUT:
# inner handled
# outer saw: ValueError`],
        `
   raised error --> except A?  --no--> except B?  --no--> except (C, D)?  --no--> propagate
                       | yes               | yes               | yes
                    run A, stop         run B, stop         run C/D, stop
`,
        `Order handlers from most specific to most general and keep the list short; if you need a long ladder, define a custom base class so one clause can cover a whole family. Do not use exceptions to implement branching business rules.`
    ),

    'raise': dd(
        [`<code>raise</code> throws an exception on purpose. Use it when your code detects a state it cannot continue from. A bare <code>raise</code> inside except re-raises the current error.`,
            r`def set_age(age):
    if age < 0:
        raise ValueError("age cannot be negative")
    return age

try:
    set_age(-5)
except ValueError as e:
    print("Error:", e)

# OUTPUT:
# Error: age cannot be negative`],
        [`Validation, contract checks and failed preconditions must stop the caller from using bad data. Returning None quietly spreads the bug further away.`,
            r`def sqrt_safe(x):
    if x < 0:
        raise ValueError(f"cannot take sqrt of {x}")
    return x ** 0.5

print(sqrt_safe(9))
try:
    sqrt_safe(-1)
except ValueError as e:
    print(e)

# OUTPUT:
# 3.0
# cannot take sqrt of -1`],
        [`Libraries validate arguments and raise TypeError/ValueError; services re-raise after logging; frameworks raise HTTP errors (e.g. 404) that the web layer turns into responses.`,
            r`def log_and_reraise():
    try:
        {}["id"]
    except KeyError:
        print("logged: id missing")
        raise                          # same exception continues upward

try:
    log_and_reraise()
except KeyError as e:
    print("caller got KeyError", e)

# OUTPUT:
# logged: id missing
# caller got KeyError 'id'`],
        [`<b>Advantages:</b> fail fast with a clear message at the point of the problem; you can raise a class or an instance; <code>raise ... from</code> keeps the cause.`,
            r`# Raising the class itself creates an instance with no message
try:
    raise NotImplementedError             # abstract-method style
except NotImplementedError as e:
    print("empty message:", repr(str(e)))

# OUTPUT:
# empty message: ''`],
        [`<b>Disadvantages:</b> raising the wrong type misleads callers; messages without context are hard to debug; raising in hot loops is slower than a check.`,
            r`# Wrong type: the caller who catches ValueError will not see this
def divide(a, b):
    if b == 0:
        raise Exception("bad")            # too generic, no useful type
    return a / b

try:
    divide(1, 0)
except ValueError:
    print("never reached")
except Exception as e:
    print("only generic catch works:", e)

# OUTPUT:
# only generic catch works: bad`],
        [`<b>Limitations:</b> you can only raise BaseException subclasses (instances or classes); raising anything else is a TypeError.`,
            r`try:
    raise "just a string"
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: exceptions must derive from BaseException`],
        `
   if bad_state:                    caller
       raise ValueError("why") ----> except ValueError as e:
                                         use e / log / recover
   (no handler anywhere) ----> traceback printed, program exits with code 1
`,
        `Raise the most specific built-in type that fits, or a custom domain exception; put actionable context in the message. Validate at API boundaries and trust internal data; use assert only for developer invariants since it is stripped with -O.`
    ),

    'Custom Exceptions': dd(
        [`A custom exception is your own class that inherits from <code>Exception</code>. It gives errors a domain-specific name and can carry extra data.`,
            r`class InsufficientFunds(Exception):
    """Raised when a withdrawal is larger than the balance."""
    def __init__(self, balance, needed):
        super().__init__(f"balance {balance} < needed {needed}")
        self.balance, self.needed = balance, needed

try:
    raise InsufficientFunds(100, 250)
except InsufficientFunds as e:
    print(e, "| short by", e.needed - e.balance)

# OUTPUT:
# balance 100 < needed 250 | short by 150`],
        [`Built-in types are too generic: callers need to tell "payment declined" from "bad JSON" and react differently, without parsing message strings.`,
            r`class AppError(Exception): pass
class NotFound(AppError): pass
class Forbidden(AppError): pass

def get(user):
    if user == "ghost": raise NotFound(user)
    if user == "guest": raise Forbidden(user)
    return "data"

for u in ("ghost", "guest", "ann"):
    try:
        print(get(u))
    except NotFound:  print("404")
    except Forbidden: print("403")

# OUTPUT:
# 404
# 403
# data`],
        [`Every serious library ships its own base error (requests.RequestException, sqlalchemy.exc.SQLAlchemyError) so users can catch everything from that library with one clause.`,
            r`class PaymentError(Exception): pass
class CardDeclined(PaymentError): pass

def pay(card):
    if card == "bad": raise CardDeclined("card declined")
    return "paid"

for c in ("ok", "bad"):
    try:
        print(pay(c))
    except PaymentError as e:           # one clause for the whole family
        print("payment problem:", e)

# OUTPUT:
# paid
# payment problem: card declined`],
        [`<b>Advantages:</b> self-documenting names, structured data (error codes, fields), and a hierarchy that allows catching at any level.`,
            r`class ValidationError(Exception):
    def __init__(self, field, msg):
        super().__init__(f"{field}: {msg}")
        self.field = field              # machine-readable detail

try:
    raise ValidationError("email", "missing @")
except ValidationError as e:
    print("field =", e.field, "| text =", e)

# OUTPUT:
# field = email | text = email: missing @`],
        [`<b>Disadvantages:</b> too many tiny classes add maintenance; custom constructors can break pickling across processes if arguments are not passed to super().`,
            r`import pickle
class Bad(Exception):
    def __init__(self, a, b):
        super().__init__(f"{a}-{b}")      # args == ("1-2",) - only ONE argument
        self.a, self.b = a, b

try:
    pickle.loads(pickle.dumps(Bad(1, 2)))   # rebuilds as Bad("1-2") -> missing b
except TypeError as e:
    print("unpickle failed:", e)

# OUTPUT:
# unpickle failed: Bad.__init__() missing 1 required positional argument: 'b'`],
        [`<b>Limitations:</b> they must derive from BaseException (use Exception, not BaseException); deriving from BaseException makes them escape normal "except Exception" handlers.`,
            r`class Odd(BaseException): pass     # avoid: not an Exception subclass
try:
    try:
        raise Odd()
    except Exception:
        print("not reached")
except BaseException as e:
    print("only BaseException caught it:", type(e).__name__)

# OUTPUT:
# only BaseException caught it: Odd`],
        `
   BaseException
      +-- Exception
            +-- AppError           <- your base (one clause catches all)
                  +-- NotFound
                  +-- Forbidden
                  +-- PaymentError
                        +-- CardDeclined
`,
        `Define one base exception per package and subclass it for distinct recovery actions, not for every message. Include structured attributes instead of forcing callers to parse text, and keep the hierarchy stable since it is public API.`
    ),

    'Exception Hierarchy': dd(
        [`All exceptions form a class tree rooted at <code>BaseException</code>. Most errors live under <code>Exception</code>; catching a parent also catches every child.`,
            r`# Walk the inheritance chain (MRO) of a built-in error
print([c.__name__ for c in FileNotFoundError.__mro__])

# OUTPUT:
# ['FileNotFoundError', 'OSError', 'Exception', 'BaseException', 'object']`],
        [`Knowing the tree lets you catch a whole category with one clause (LookupError for KeyError and IndexError, OSError for file/network faults).`,
            r`for bad in ({}, []):
    try:
        bad[0]
    except LookupError as e:             # parent of KeyError and IndexError
        print(type(e).__name__, "is a LookupError")

# OUTPUT:
# KeyError is a LookupError
# IndexError is a LookupError`],
        [`File code catches OSError (covers FileNotFoundError, PermissionError, TimeoutError); main loops catch Exception but let KeyboardInterrupt and SystemExit pass.`,
            r`print(issubclass(FileNotFoundError, OSError))
print(issubclass(PermissionError, OSError))
print(issubclass(KeyboardInterrupt, Exception))   # False: Ctrl+C is not an Exception

# OUTPUT:
# True
# True
# False`],
        [`<b>Advantages:</b> catch at the right granularity; the tree is introspectable with <code>__subclasses__()</code>.`,
            r`print(sorted(c.__name__ for c in ArithmeticError.__subclasses__()))

# OUTPUT:
# ['FloatingPointError', 'OverflowError', 'ZeroDivisionError']`],
        [`<b>Disadvantages:</b> the tree is big (60+ classes) and a few placements surprise people, e.g. <code>except Exception</code> does not catch KeyboardInterrupt, and OSError has many aliases.`,
            r`import socket
print(IOError is OSError, EnvironmentError is OSError)   # old names are aliases
print(socket.error is OSError)

# OUTPUT:
# True True
# True`],
        [`<b>Limitations:</b> you cannot reorder built-in classes; with multiple inheritance, layouts of built-in exception bases can conflict.`,
            r`try:
    class Weird(OSError, SyntaxError): pass
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: multiple bases have instance lay-out conflict`],
        `
   BaseException
    +-- SystemExit, KeyboardInterrupt, GeneratorExit
    +-- Exception
         +-- ArithmeticError --> ZeroDivisionError, OverflowError
         +-- LookupError     --> KeyError, IndexError
         +-- OSError         --> FileNotFoundError, PermissionError ...
         +-- ValueError, TypeError, AttributeError, RuntimeError ...
`,
        `Design your own exceptions to slot into this tree (inherit from the closest built-in when semantics match, e.g. ValueError). Catch parents for resilience boundaries and children for specific recovery; never catch BaseException unless you re-raise.`
    ),

    'Exception Chaining': dd(
        [`Chaining links a new exception to the one that caused it. <code>raise NewError from old</code> sets <code>__cause__</code>; raising inside an except block sets <code>__context__</code> automatically.`,
            r`try:
    try:
        int("x")
    except ValueError as e:
        raise RuntimeError("config load failed") from e
except RuntimeError as err:
    print(err, "<- caused by:", repr(err.__cause__))

# OUTPUT:
# config load failed <- caused by: ValueError("invalid literal for int() with base 10: 'x'")`],
        [`Low-level errors (KeyError, socket error) mean little to the caller. You want to translate them into domain errors without losing the original traceback for debugging.`,
            r`class ConfigError(Exception): pass

def get_port(cfg):
    try:
        return int(cfg["port"])
    except KeyError as e:
        raise ConfigError("port not configured") from e

try:
    get_port({})
except ConfigError as e:
    print(e, "| root:", type(e.__cause__).__name__)

# OUTPUT:
# port not configured | root: KeyError`],
        [`Layered applications (repository, service, API) wrap lower-layer errors so the tracebacks show "The above exception was the direct cause of the following exception".`,
            r`import traceback
try:
    try:
        1 / 0
    except ZeroDivisionError as e:
        raise ValueError("bad ratio") from e
except ValueError:
    text = traceback.format_exc()
    print("direct cause" in text)          # the chain text is part of the traceback

# OUTPUT:
# True`],
        [`<b>Advantages:</b> full causal trail in logs; <code>from None</code> hides irrelevant internals when you want a clean public error.`,
            r`try:
    try:
        {}["k"]
    except KeyError:
        raise ValueError("clean message") from None   # suppress the chain
except ValueError as e:
    print(e, "| cause:", e.__cause__, "| suppressed:", e.__suppress_context__)

# OUTPUT:
# clean message | cause: None | suppressed: True`],
        [`<b>Disadvantages:</b> accidental implicit chaining ("During handling of the above exception, another exception occurred") produces confusing noise when a handler itself has a bug.`,
            r`try:
    try:
        1 / 0
    except ZeroDivisionError:
        undefined_name          # a bug inside the handler: NameError
except NameError as e:
    print("context kept:", type(e.__context__).__name__)

# OUTPUT:
# context kept: ZeroDivisionError`],
        [`<b>Limitations:</b> chains keep references to tracebacks and frames, which can retain big objects in memory; the cause must be an exception instance or None.`,
            r`try:
    raise ValueError("x") from "not an exception"
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: exception causes must derive from BaseException`],
        `
   KeyError('port')  ----- __cause__ ----->  ConfigError("port not configured")
   (low level, original)                      (domain level, what callers catch)
   traceback shows both:
     KeyError ... The above exception was the direct cause of ... ConfigError
`,
        `Wrap at layer boundaries so callers depend on your domain errors, not on a library's internals, and always use from e (or from None when the cause is a secret or noise). Log the full chain once at the top, not at each layer.`
    )
};
