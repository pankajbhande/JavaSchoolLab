// Module 2 (Control Flow), part B: nested loops and practice programs.
import { dd, r, type DeepDive } from './deepDive';

export const m02b: Record<string, DeepDive> = {
    'Nested Loops': dd(
        [`A <b>nested loop</b> is a loop inside another loop. For every single pass of the outer loop, the inner loop runs completely. Total work is roughly <code>outer x inner</code> iterations.`,
            r`for row in range(1, 4):              # outer: runs 3 times
    for col in range(1, 4):          # inner: runs 3 times PER outer pass
        print(row * col, end="\t")
    print()                          # newline after each row

# OUTPUT:
# 1	2	3
# 2	4	6
# 3	6	9	`],
        [`Two-dimensional data (tables, grids, matrices, images) and "every pair" problems need two levels of iteration. One loop alone walks a line; two loops walk a plane.`,
            r`grid = [[1, 2, 3],
        [4, 5, 6]]
total = 0
for row in grid:                     # each row
    for value in row:                # each cell in that row
        total += value
print("sum of all cells:", total)

# OUTPUT:
# sum of all cells: 21`],
        [`Image processing (pixels), game boards, spreadsheets, matrix maths, comparing every pair of records, and printing patterns all use nested loops.`,
            r`# Real-time: find duplicate pairs of order ids
orders = [101, 102, 103, 102]
dups = set()
for i in range(len(orders)):
    for j in range(i + 1, len(orders)):      # j starts after i: no repeats
        if orders[i] == orders[j]:
            dups.add(orders[i])
print("duplicate ids:", dups)

# OUTPUT:
# duplicate ids: {102}`],
        [`<b>Advantages:</b> simple and direct for grids and pair-wise logic; the inner range can depend on the outer variable (triangles, combinations).`,
            r`# Advantage: inner range depends on outer variable => triangle
for i in range(1, 5):
    for j in range(i):
        print("*", end="")
    print()

# OUTPUT:
# *
# **
# ***
# ****`],
        [`<b>Disadvantages:</b> cost grows multiplicatively: two nested loops of n items are O(n squared), three are O(n cubed). Readability falls fast beyond two levels.`,
            r`# Disadvantage: iteration count grows as n * n
for n in (10, 100, 1000):
    count = 0
    for i in range(n):
        for j in range(n):
            count += 1
    print(f"n={n:<5} inner runs = {count}")

# OUTPUT:
# n=10    inner runs = 100
# n=100   inner runs = 10000
# n=1000  inner runs = 1000000`],
        [`<b>Limitations:</b> <code>break</code> and <code>continue</code> only affect the inner loop, and there are no labelled loops; leaving both needs a flag, a function with <code>return</code>, or an exception.`,
            r`# Limitation: leave BOTH loops by wrapping them in a function
def find(grid, target):
    for r_i, row in enumerate(grid):
        for c_i, v in enumerate(row):
            if v == target:
                return (r_i, c_i)        # exits both loops at once
    return None

print(find([[1, 2], [3, 4]], 3))
print(find([[1, 2], [3, 4]], 9))

# OUTPUT:
# (1, 0)
# None`],
        `
   outer i=0 ──► inner j=0,1,2 ─┐
   outer i=1 ──► inner j=0,1,2 ─┤   total = 3 x 3 = 9 passes
   outer i=2 ──► inner j=0,1,2 ─┘

          j=0   j=1   j=2
   i=0   (0,0) (0,1) (0,2)
   i=1   (1,0) (1,1) (1,2)
   i=2   (2,0) (2,1) (2,2)
`,
        `Always estimate the product of loop sizes before shipping. If the inner loop only checks membership, replace it with a set or dict lookup to turn O(n squared) into O(n); for numeric grids use NumPy; for pairs use <code>itertools.combinations</code> or <code>product</code> to flatten nesting.`
    ),

    'Practice: Calculator': dd(
        [`A command-line <b>calculator</b> reads two numbers and an operator, then performs the operation. It combines input, type conversion, branching and error handling in a small program.`,
            r`def calc(a, op, b):
    if op == "+":
        return a + b
    elif op == "-":
        return a - b
    elif op == "*":
        return a * b
    elif op == "/":
        return a / b
    raise ValueError(f"unknown operator {op}")

print(calc(8, "+", 2), calc(8, "/", 2))

# OUTPUT:
# 10 4.0`],
        [`It practices the core loop of every program: get input, validate, decide, compute, report. Division by zero and bad input force you to think about failure paths.`,
            r`def safe_calc(a, op, b):
    try:
        return a / b if op == "/" else {"+": a + b, "-": a - b, "*": a * b}[op]
    except ZeroDivisionError:
        return "cannot divide by zero"
    except KeyError:
        return "unknown operator"

print(safe_calc(5, "/", 0))
print(safe_calc(5, "^", 2))

# OUTPUT:
# cannot divide by zero
# unknown operator`],
        [`The same pattern powers expression evaluators, billing engines and formula fields in spreadsheets. A dict mapping operators to functions is the standard scalable form.`,
            r`import operator
OPS = {"+": operator.add, "-": operator.sub,
       "*": operator.mul, "/": operator.truediv, "**": operator.pow}

def evaluate(expr):
    a, op, b = expr.split()            # "7 ** 2" -> ["7", "**", "2"]
    return OPS[op](float(a), float(b))

print(evaluate("7 ** 2"))
print(evaluate("9 / 4"))

# OUTPUT:
# 49.0
# 2.25`],
        [`<b>Advantages:</b> tiny, testable, and teaches decomposition: separate the calculation (pure function) from input/output.`,
            r`# Pure function => easy to test with plain asserts
def add(a, b):
    return a + b

assert add(2, 3) == 5
assert add(-1, 1) == 0
print("all tests passed")

# OUTPUT:
# all tests passed`],
        [`<b>Disadvantages:</b> a naive version needs one branch per operator, and float arithmetic gives surprising results for money.`,
            r`# Disadvantage: binary floats are inexact
print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)

from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))      # exact decimal arithmetic

# OUTPUT:
# 0.30000000000000004
# False
# 0.3`],
        [`<b>Limitations:</b> a basic calculator handles one operation at a time; full expressions need parsing (precedence, brackets). Never use <code>eval()</code> on user input: it executes arbitrary code.`,
            r`# Limitation: eval is dangerous; ast.literal_eval only accepts literals
import ast
print(ast.literal_eval("[1, 2, 3]"))
try:
    ast.literal_eval("2 + 3 * 4")       # arithmetic is not a literal
    print("evaluated")
except ValueError:
    print("refused: not a plain literal")

# OUTPUT:
# [1, 2, 3]
# refused: not a plain literal`],
        `
   input ──► parse ──► validate ──► dispatch table ──► result
   "8 / 2"   [8,/,2]   op known?     OPS["/"](8, 2)     4.0
                          │ no
                          ▼
                     error message
`,
        `Separate parsing, evaluation and I/O. For real expression support, build a tokenizer plus a recursive-descent or shunting-yard parser, or walk Python's <code>ast</code> with a whitelist of node types. Money belongs in <code>Decimal</code> or integer cents.`
    ),

    'Practice: Number Guessing Game': dd(
        [`The <b>guessing game</b> picks a secret number and loops, comparing each guess and giving higher/lower hints until the player wins or runs out of tries. It uses <code>random</code>, <code>while</code>, branching and counters.`,
            r`import random
secret = 7                             # real game: random.randint(1, 10)
guesses = [3, 9, 7]                    # scripted player instead of input()
for tries, g in enumerate(guesses, start=1):
    if g == secret:
        print(f"correct in {tries} tries")
        break
    print("higher" if g < secret else "lower")
print("a real secret would be:", 1 <= random.randint(1, 10) <= 10)

# OUTPUT:
# higher
# lower
# correct in 3 tries
# a real secret would be: True`],
        [`It teaches the game-loop idea: state (secret, tries), repeat until a condition, give feedback, and end cleanly. It also introduces randomness and binary-search thinking.`,
            r`# Optimal strategy: binary search needs at most log2(100) ~ 7 guesses
secret, low, high, tries = 63, 1, 100, 0
while low <= high:
    mid = (low + high) // 2
    tries += 1
    if mid == secret:
        break
    if mid < secret:
        low = mid + 1
    else:
        high = mid - 1
print("found", mid, "in", tries, "guesses")

# OUTPUT:
# found 63 in 6 guesses`],
        [`Same state-machine loop appears in login retry limits, OTP verification (limited attempts) and any interactive CLI.`,
            r`# Real-time: OTP check with a max number of attempts
def verify(otp, attempts, max_tries=3):
    for n, a in enumerate(attempts[:max_tries], start=1):
        if a == otp:
            return f"verified on try {n}"
    return "account locked"

print(verify("4821", ["1111", "4821"]))
print(verify("4821", ["1", "2", "3", "4821"]))

# OUTPUT:
# verified on try 2
# account locked`],
        [`<b>Advantages:</b> small scope, immediate feedback, practices loops, conditions, counters, <code>random</code> and input validation together.`,
            r`# Advantage: input validation with a retry loop (scripted inputs)
inputs = iter(["abc", "42"])
while True:
    text = next(inputs)                # real code: input("Guess: ")
    if text.isdigit():
        guess = int(text)
        break
    print("please type a number")
print("guess =", guess)

# OUTPUT:
# please type a number
# guess = 42`],
        [`<b>Disadvantages:</b> the random module is not secure and input() blocks, making automatic testing harder unless logic is separated from I/O.`,
            r`# Disadvantage: unseeded randomness makes tests flaky
import random
print(random.randint(1, 10))           # different every run

# OUTPUT (varies):
# 7`],
        [`<b>Limitations:</b> <code>random</code> is predictable (Mersenne Twister): never use it for passwords or tokens, use <code>secrets</code> instead.`,
            r`import secrets
token = secrets.token_hex(4)           # cryptographically strong, 8 hex chars
print(len(token), "chars:", token)

# OUTPUT (varies):
# 8 chars: 9f3a1c7e`],
        `
   secret = random() ──►  ┌──────────────┐
                          │ read guess   │◄──────────┐
                          └──────┬───────┘           │
                                 ▼                   │
                       guess == secret? ──No──► hint ┘
                                 │Yes             (tries left?)
                                 ▼
                            win message
`,
        `Keep game logic (a class or pure functions that take a guess and return a result) separate from <code>input()</code>/<code>print()</code>, inject the random generator, and the whole thing becomes unit-testable. Use <code>secrets</code> whenever unpredictability has a security role.`
    ),

    'Practice: ATM Simulation': dd(
        [`An <b>ATM simulation</b> keeps an account balance and lets the user check balance, deposit and withdraw, repeating until they exit. It combines state, a menu loop, validation and rules such as "insufficient funds".`,
            r`balance = 1000
def withdraw(amount):
    global balance
    if amount <= 0:
        return "invalid amount"
    if amount > balance:
        return "insufficient funds"
    balance -= amount
    return f"dispensed {amount}, balance {balance}"

print(withdraw(300))
print(withdraw(5000))

# OUTPUT:
# dispensed 300, balance 700
# insufficient funds`],
        [`It models <b>state change with rules</b>: money must never go negative, invalid input must be rejected, and every operation must leave the account consistent. This is the core of banking, inventory and booking software.`,
            r`# Rules enforced in one place keep the state valid
class Account:
    def __init__(self, balance=0):
        self.balance = balance
    def deposit(self, amt):
        if amt <= 0:
            raise ValueError("deposit must be positive")
        self.balance += amt
    def withdraw(self, amt):
        if amt > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amt

a = Account(100)
a.deposit(50)
try:
    a.withdraw(500)
except ValueError as e:
    print("error:", e)
print(a.balance)

# OUTPUT:
# error: insufficient funds
# 150`],
        [`Real ATMs and payment systems add PIN attempts, daily limits, transaction logs and atomic database transactions on top of this exact structure.`,
            r`# Real-time: PIN with 3 attempts + transaction log
PIN, log = "1234", []
tries = ["0000", "1111", "1234"]
for n, t in enumerate(tries, 1):
    if t == PIN:
        log.append(f"login ok after {n} attempts")
        break
    log.append(f"bad pin ({n})")
print(log)

# OUTPUT:
# ['bad pin (1)', 'bad pin (2)', 'login ok after 3 attempts']`],
        [`<b>Advantages:</b> shows encapsulation of state, validation, exceptions and loop-driven menus in one realistic example; every rule is easy to unit test.`,
            r`# Advantage: a transaction history gives an audit trail
history = []
balance = 500
for kind, amt in [("deposit", 200), ("withdraw", 100)]:
    balance += amt if kind == "deposit" else -amt
    history.append((kind, amt, balance))
for row in history:
    print(row)

# OUTPUT:
# ('deposit', 200, 700)
# ('withdraw', 100, 600)`],
        [`<b>Disadvantages:</b> a global balance variable is fragile, and floats are wrong for money (rounding drift).`,
            r`# Disadvantage: float money drifts
balance = 0.0
for _ in range(10):
    balance += 0.1
print(balance)
cents = 0
for _ in range(10):
    cents += 10                        # integer cents are exact
print(cents / 100)

# OUTPUT:
# 0.9999999999999999
# 1.0`],
        [`<b>Limitations:</b> an in-memory simulation loses all data on exit and has no concurrency control: two simultaneous withdrawals could both pass the balance check in a real multi-user system.`,
            r`# Limitation: check-then-act is a race when shared by threads
balance = 100
def withdraw(amount):
    global balance
    if balance >= amount:              # another thread may withdraw here
        balance -= amount              # ...so balance can go negative
        return True
    return False
print(withdraw(80), withdraw(80), balance)    # sequential here: safe

# OUTPUT:
# True False 20`],
        `
   ┌────────── MENU LOOP ──────────┐
   │ 1 Balance  2 Deposit  3 Withdraw  4 Exit
   └──────┬───────────────────────┘
          ▼
   validate input ──► rule check ──► update state ──► log
          ▲                                           │
          └────────────── repeat until Exit ◄─────────┘
`,
        `In production the balance lives in a database and each operation runs inside a transaction with row locks or optimistic versioning; amounts are integers or Decimal; operations are idempotent and logged. An in-memory class is fine for learning, never for money.`
    ),

    'Practice: Menu-Driven Program': dd(
        [`A <b>menu-driven program</b> shows a list of numbered options inside a <code>while True</code> loop, reads the choice, runs the matching action, and exits on a quit option.`,
            r`def show_menu():
    print("1. Add  2. List  3. Quit")

todo = []
choices = iter(["1", "2", "3"])        # scripted instead of input()
while True:
    show_menu()
    choice = next(choices)
    if choice == "1":
        todo.append("buy milk")
    elif choice == "2":
        print(todo)
    elif choice == "3":
        break

# OUTPUT:
# 1. Add  2. List  3. Quit
# 1. Add  2. List  3. Quit
# ['buy milk']
# 1. Add  2. List  3. Quit`],
        [`Users interact with programs through repeated choices. The menu loop is the simplest event loop and the skeleton of most command-line tools.`,
            r`# Dispatch dict replaces a long if/elif chain
def add():  return "added"
def lst():  return "listing"
ACTIONS = {"1": add, "2": lst}

for key in ("1", "2", "9"):
    action = ACTIONS.get(key)
    print(action() if action else "invalid choice")

# OUTPUT:
# added
# listing
# invalid choice`],
        [`Admin consoles, installers, library systems, school management demos, and CLI tools (git subcommands, docker commands) all follow this pattern.`,
            r`# Real-time: subcommand style, like  git add / git status
import sys
def main(argv):
    commands = {"add": lambda: "staging files", "status": lambda: "clean tree"}
    cmd = argv[0] if argv else "status"
    return commands.get(cmd, lambda: "unknown command")()

print(main(["add"]), "|", main([]), "|", main(["zip"]))

# OUTPUT:
# staging files | clean tree | unknown command`],
        [`<b>Advantages:</b> easy for users, easy to extend (add a function and a dict entry), and demonstrates loops, functions and dispatch together.`,
            r`# Advantage: adding a feature = one function + one dict entry
actions = {"1": lambda: "add"}
actions["2"] = lambda: "delete"        # new feature, no change to the loop
print(sorted(actions))

# OUTPUT:
# ['1', '2']`],
        [`<b>Disadvantages:</b> blocking on <code>input()</code> prevents automation; users must type exactly; menus nest awkwardly in large programs.`,
            r`# Disadvantage: invalid text must be handled everywhere
raw = "two"
try:
    choice = int(raw)
except ValueError:
    print(repr(raw), "is not a number - ask again")

# OUTPUT:
# 'two' is not a number - ask again`],
        [`<b>Limitations:</b> a text menu is sequential and single-user; it does not scale to rich interactions that need a GUI, web UI, or argparse-style non-interactive flags.`,
            r`# Limitation: scripts and CI cannot answer prompts - offer flags too
import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--action", choices=["add", "list"], default="list")
args = parser.parse_args([])           # [] simulates no command-line flags
print("action:", args.action)

# OUTPUT:
# action: list`],
        `
        ┌─────────────────────────┐
   ┌───►│ print menu              │
   │    └───────────┬─────────────┘
   │                ▼
   │           read choice ──► ACTIONS[choice]()
   │                │
   │       quit? ───┴── No ──┐
   │        │Yes             │
   │        ▼                │
   │      exit               │
   └─────────────────────────┘
`,
        `Prefer a dispatch table or the <code>cmd</code>/<code>argparse</code>/Click libraries over hand-written menus. Make every action a pure function returning data, so the same code can later back a web API or GUI.`
    ),

    'Practice: Pattern Programs': dd(
        [`<b>Pattern programs</b> print shapes (triangles, pyramids, diamonds, number grids) using nested loops. The outer loop controls rows; the inner loops print spaces and symbols per row.`,
            r`n = 4
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))      # pyramid

# OUTPUT:
#    *
#   ***
#  *****
# *******`],
        [`Patterns train you to see how row number, column number and counts relate. That skill transfers to grids, matrices, tables, and any problem where two indexes interact.`,
            r`# Number triangle: row i prints 1..i
for i in range(1, 5):
    print(" ".join(str(j) for j in range(1, i + 1)))

# OUTPUT:
# 1
# 1 2
# 1 2 3
# 1 2 3 4`],
        [`The same row/column arithmetic builds text tables, console progress bars, bar charts in terminal reports, and board games such as tic-tac-toe or chess.`,
            r`# Real-time: text bar chart for a report
sales = {"Mon": 3, "Tue": 5, "Wed": 2}
for day, qty in sales.items():
    print(f"{day} | {'#' * qty} {qty}")

# OUTPUT:
# Mon | ### 3
# Tue | ##### 5
# Wed | ## 2`],
        [`<b>Advantages:</b> instant visual feedback, so mistakes are obvious; string multiplication (<code>"*" * n</code>) replaces an inner loop for simple shapes.`,
            r`# Advantage: str.center builds symmetric lines without counting spaces
for i in (1, 3, 5):
    print(("*" * i).center(5))

# OUTPUT:
#   *
#  ***
# *****`],
        [`<b>Disadvantages:</b> off-by-one errors in ranges are common, and output tests depend on exact whitespace.`,
            r`# Disadvantage: off-by-one - range(n) starts at 0, so the shape is shifted
for i in range(3):
    print("*" * i)              # first line is EMPTY, last has only 2 stars
print("--- fixed ---")
for i in range(1, 4):
    print("*" * i)

# OUTPUT:
#
# *
# **
# --- fixed ---
# *
# **
# ***`],
        [`<b>Limitations:</b> terminal patterns assume a monospaced font and fixed width; they do not scale to real graphics (use matplotlib, PIL or a GUI).`,
            r`# Limitation: wide characters break alignment in monospaced output
for word in ("abc", "日本語"):
    print(f"[{word:>6}]")          # width counts characters, not screen cells

# OUTPUT (alignment differs in many terminals):
# [   abc]
# [   日本語]`],
        `
   n = 4          row i   spaces    stars
      *             1      3        1
     ***            2      2        3
    *****           3      1        5
   *******          4      0        7
                  spaces = n - i      stars = 2*i - 1
`,
        `Work out a formula for each row (spaces, symbols) on paper before coding. Build the line as a string and print it once per row; this is faster than printing char by char and is easy to unit test by comparing returned strings.`
    ),
};
