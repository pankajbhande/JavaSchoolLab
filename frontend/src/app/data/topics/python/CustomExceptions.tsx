import type { Topic } from '../../types';

export const customExceptions: Topic = {
    id: 'python-exceptions-custom-exceptions',
    name: 'Custom Exceptions',
    beginner: [
        {
            content: `<h4>Why Create Your Own Exceptions?</h4>
Built-in exceptions like <code>ValueError</code> are generic. A custom exception names a problem specific to <b>your</b> application - <code>InsufficientFundsError</code>, <code>InvalidMarksError</code> - so callers can catch exactly that problem and nothing else.<br><br>
• Subclass <code>Exception</code> (never <code>BaseException</code>, which is reserved for things like Ctrl+C and <code>sys.exit()</code>).<br>
• End the name with <code>Error</code>, like the built-ins.<br>
• A docstring (or just <code>pass</code>) is enough for the body.`,
            codeExamples: [
                `class InvalidMarksError(Exception):
    """Raised when marks are outside the range 0-100."""

def set_marks(marks):
    if not 0 <= marks <= 100:
        raise InvalidMarksError(f"marks must be 0-100, got {marks}")
    return marks

try:
    set_marks(120)
except InvalidMarksError as e:
    print("Caught:", e)

# OUTPUT:
# Caught: marks must be 0-100, got 120`
            ]
        },
        {
            content: `<h4>Catching Only Your Exception</h4>
Because the type is specific, an <code>except InvalidMarksError</code> block won't accidentally swallow unrelated bugs such as a <code>TypeError</code>.`,
            codeExamples: [
                `class InvalidMarksError(Exception):
    pass

def set_marks(marks):
    if not 0 <= marks <= 100:
        raise InvalidMarksError(f"marks must be 0-100, got {marks}")
    return marks

for value in (85, -4):
    try:
        print("Saved", set_marks(value))
    except InvalidMarksError as e:
        print("Rejected:", e)

# OUTPUT:
# Saved 85
# Rejected: marks must be 0-100, got -4`
            ]
        },
        {
            content: `<h4>Adding Extra Information</h4>
An exception is an ordinary object, so it can carry data the handler needs. Store the values as attributes and pass a readable message to <code>super().__init__()</code>.`,
            codeExamples: [
                `class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        self.shortfall = amount - balance
        super().__init__(f"cannot withdraw {amount}; balance is {balance}")

try:
    raise InsufficientFundsError(1000, 1500)
except InsufficientFundsError as e:
    print(e)
    print("Short by", e.shortfall)

# OUTPUT:
# cannot withdraw 1500; balance is 1000
# Short by 500`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Build an Exception Hierarchy</h3>
Give your application (or library) one <b>base exception</b> and derive specific ones from it. Callers can then choose: catch one specific error, or catch the base class to handle "anything that went wrong in banking" - without catching unrelated bugs.`,
            codeExamples: [
                `class BankError(Exception):
    """Base class for all banking errors."""

class InsufficientFundsError(BankError):
    pass

class AccountLockedError(BankError):
    pass

def withdraw(account, amount):
    if account["locked"]:
        raise AccountLockedError(f"account {account['id']} is locked")
    if amount > account["balance"]:
        raise InsufficientFundsError(f"balance {account['balance']} < {amount}")
    account["balance"] -= amount

accounts = [
    {"id": 1, "locked": True, "balance": 500},
    {"id": 2, "locked": False, "balance": 500},
]
for acc in accounts:
    try:
        withdraw(acc, 800)
    except InsufficientFundsError as e:
        print("Ask for a smaller amount:", e)
    except BankError as e:              # any other banking error
        print("Bank error:", e)

# OUTPUT:
# Bank error: account 1 is locked
# Ask for a smaller amount: balance 500 < 800`
            ]
        },
        {
            content: `<h3>Customising __str__ and Keeping args in Sync</h3>
<code>print(e)</code> uses <code>__str__</code>; <code>repr(e)</code> and pickling use <code>e.args</code>. Passing the <b>same values</b> to <code>super().__init__()</code> that your <code>__init__</code> receives keeps the exception picklable - important when it crosses process boundaries (multiprocessing, task queues). If <code>args</code> doesn't match the constructor's parameters, unpickling fails with a <code>TypeError</code>, because Python rebuilds the exception as <code>cls(*args)</code>.`,
            codeExamples: [
                `import pickle

class ValidationError(Exception):
    def __init__(self, field, problem):
        super().__init__(field, problem)     # args == constructor parameters
        self.field = field
        self.problem = problem

    def __str__(self):
        return f"{self.field}: {self.problem}"

e = ValidationError("email", "missing @")
print(e)
print(repr(e))
print(e.args)

copy = pickle.loads(pickle.dumps(e))
print(copy, "|", copy.field)

# OUTPUT:
# email: missing @
# ValidationError('email', 'missing @')
# ('email', 'missing @')
# email: missing @ | email`
            ]
        },
        {
            content: `<h3>When NOT to Create a Custom Exception</h3>
Don't invent a type when a built-in already says it. A function that rejects a negative number should raise <code>ValueError</code>; a missing lookup key should raise <code>KeyError</code>. Create custom exceptions when:<br>
• callers need to handle <b>this</b> failure differently from others,<br>
• the error carries domain data (account, amount, field name),<br>
• you are writing a library and want one base class users can catch.<br><br>
A custom exception can also inherit from a built-in as well, e.g. <code>class InvalidAmountError(BankError, ValueError)</code>, so existing <code>except ValueError</code> code still catches it.`
        },
        {
            content: `<h3>Adding Context with add_note() (Python 3.11+)</h3>
Sometimes you don't need a new type - just more context. <code>e.add_note(text)</code> attaches extra lines that are printed after the error message in the traceback, and stored in <code>e.__notes__</code>.`,
            codeExamples: [
                `try:
    try:
        int("12a")
    except ValueError as e:
        e.add_note("while reading row 7 of marks.csv")
        raise
except ValueError as e:
    print(e)
    print(e.__notes__)

# OUTPUT:
# invalid literal for int() with base 10: '12a'
# ['while reading row 7 of marks.csv']
#
# Uncaught, the traceback would end with:
# ValueError: invalid literal for int() with base 10: '12a'
# while reading row 7 of marks.csv`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Which class should custom exceptions inherit from?</td><td><code>Exception</code> (or a subclass) - not BaseException</td></tr>
<tr class='text-center'><td>Why give an application one base exception?</td><td>Callers can catch all of its errors with one except clause, or specific subclasses when they need to</td></tr>
<tr class='text-center'><td>How do you attach data to an exception?</td><td>Store attributes in <code>__init__</code> and call <code>super().__init__(message)</code></td></tr>
<tr class='text-center'><td>Why keep <code>args</code> matching the constructor?</td><td>Pickling rebuilds the exception as <code>cls(*args)</code>; a mismatch breaks it</td></tr>
<tr class='text-center'><td>When is a custom exception unnecessary?</td><td>When a built-in like ValueError or KeyError already describes the problem and callers don't need to distinguish it</td></tr>
<tr class='text-center'><td>What does add_note() do?</td><td>Adds extra context lines to an exception, shown in the traceback (3.11+)</td></tr>
</table>`
        }
    ]
};
