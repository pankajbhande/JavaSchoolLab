import type { Topic } from '../../types';

export const practiceAtmSimulation: Topic = {
    id: 'python-control-flow-practice-atm-simulation',
    name: 'Practice: ATM Simulation',
    beginner: [
        {
            content: `<h4>The Task</h4>
Simulate an ATM session:<br>
1. The user gets <b>3 attempts</b> to enter the correct PIN; after that the card is blocked.<br>
2. A menu offers: check balance, deposit, withdraw, mini statement, exit.<br>
3. Withdrawals must be multiples of ₹100, cannot exceed the balance, and are limited to ₹20,000 per day.<br>
4. The mini statement shows the last 5 transactions.<br><br>
<b>Concepts practised:</b> <code>for ... else</code>, <code>while True</code> menus, <code>if/elif</code> chains, input validation, lists, and f-string formatting.`
        },
        {
            content: `<h4>Step 1: PIN Verification with for-else</h4>
The <code>else</code> block runs only if the loop finishes without a <code>break</code> - that is, all three attempts were wrong.`,
            codeExamples: [
                `PIN = "4321"

for attempts_left in range(3, 0, -1):
    pin = input("Enter your 4-digit PIN: ").strip()
    if pin == PIN:
        print("Login successful.")
        break
    print(f"Incorrect PIN. {attempts_left - 1} attempt(s) left.")
else:
    print("Card blocked. Please contact your bank.")
    raise SystemExit

# SAMPLE RUN:
# Enter your 4-digit PIN: 1111
# Incorrect PIN. 2 attempt(s) left.
# Enter your 4-digit PIN: 4321
# Login successful.`
            ]
        },
        {
            content: `<h4>Step 2: The Complete ATM</h4>
Amounts are stored as whole rupees (<code>int</code>) - never use <code>float</code> for money.`,
            codeExamples: [
                `PIN = "4321"
DAILY_LIMIT = 20_000

balance = 5_000
withdrawn_today = 0
history = []


def read_amount(prompt):
    text = input(prompt).strip()
    if not text.isdigit() or int(text) == 0:
        print("Enter a positive whole amount.")
        return None
    return int(text)


for attempts_left in range(3, 0, -1):
    if input("Enter your 4-digit PIN: ").strip() == PIN:
        print("Login successful.")
        break
    print(f"Incorrect PIN. {attempts_left - 1} attempt(s) left.")
else:
    print("Card blocked. Please contact your bank.")
    raise SystemExit

while True:
    print()
    print("1. Check balance")
    print("2. Deposit")
    print("3. Withdraw")
    print("4. Mini statement")
    print("5. Exit")
    choice = input("Choose an option: ").strip()

    if choice == "1":
        print(f"Available balance: ₹{balance:,}")

    elif choice == "2":
        amount = read_amount("Amount to deposit: ")
        if amount is None:
            continue
        balance += amount
        history.append(f"Deposit   +{amount:>8,}")
        print(f"Deposited ₹{amount:,}. New balance: ₹{balance:,}")

    elif choice == "3":
        amount = read_amount("Amount to withdraw: ")
        if amount is None:
            continue
        if amount % 100 != 0:
            print("Amount must be a multiple of ₹100.")
        elif amount > balance:
            print("Insufficient balance.")
        elif withdrawn_today + amount > DAILY_LIMIT:
            print(f"Daily limit reached. You can withdraw ₹{DAILY_LIMIT - withdrawn_today:,} more today.")
        else:
            balance -= amount
            withdrawn_today += amount
            history.append(f"Withdraw  -{amount:>8,}")
            print(f"Please collect ₹{amount:,}. Remaining balance: ₹{balance:,}")

    elif choice == "4":
        print("--- Mini statement ---")
        if not history:
            print("No transactions yet.")
        for entry in history[-5:]:
            print(entry)
        print(f"Balance: ₹{balance:,}")

    elif choice == "5":
        print("Thank you for banking with us!")
        break

    else:
        print("Invalid option, choose 1-5.")`
            ]
        },
        {
            content: `<h4>Sample Run</h4>`,
            codeExamples: [
                `# Enter your 4-digit PIN: 4321
# Login successful.
#
# 1. Check balance  ...  5. Exit
# Choose an option: 2
# Amount to deposit: 2500
# Deposited ₹2,500. New balance: ₹7,500
#
# Choose an option: 3
# Amount to withdraw: 1250
# Amount must be a multiple of ₹100.
#
# Choose an option: 3
# Amount to withdraw: 3000
# Please collect ₹3,000. Remaining balance: ₹4,500
#
# Choose an option: 4
# --- Mini statement ---
# Deposit   +   2,500
# Withdraw  -   3,000
# Balance: ₹4,500
#
# Choose an option: 5
# Thank you for banking with us!`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Refactor: Put the Rules in a Class</h3>
The menu code mixes user interaction with banking rules. Moving the rules into an <code>Account</code> class that <b>raises exceptions</b> lets the same logic serve a CLI, a GUI or a web API - and makes it testable.`,
            codeExamples: [
                `class InsufficientFunds(Exception):
    pass


class Account:
    def __init__(self, balance=0):
        self.balance = balance
        self.history = []

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self.balance += amount
        self.history.append(("deposit", amount))

    def withdraw(self, amount):
        if amount <= 0 or amount % 100:
            raise ValueError("withdrawal must be a positive multiple of 100")
        if amount > self.balance:
            raise InsufficientFunds(f"balance is only {self.balance}")
        self.balance -= amount
        self.history.append(("withdraw", amount))


acc = Account(5000)
acc.deposit(2500)
acc.withdraw(3000)
print(acc.balance, acc.history)

try:
    acc.withdraw(10_000)
except InsufficientFunds as error:
    print("Error:", error)

# OUTPUT:
# 4500 [('deposit', 2500), ('withdraw', 3000)]
# Error: balance is only 4500`
            ]
        },
        {
            content: `<h3>Never Store a PIN in Plain Text</h3>
Real systems store only a <b>salted, slow hash</b> of a PIN or password, and compare with a constant-time function so attackers can't learn anything from response times. <code>getpass</code> hides the PIN while it is typed.`,
            codeExamples: [
                `import hashlib
import hmac
import os

def hash_pin(pin, salt):
    return hashlib.pbkdf2_hmac("sha256", pin.encode(), salt, 100_000)

salt = os.urandom(16)
stored_hash = hash_pin("4321", salt)        # only salt + hash are saved

def verify(pin):
    return hmac.compare_digest(hash_pin(pin, salt), stored_hash)

print(verify("1234"), verify("4321"))

# from getpass import getpass
# pin = getpass("PIN: ")                    # input is not echoed

# OUTPUT:
# False True`
            ]
        },
        {
            content: `<h3>Money: int, Decimal, Never float</h3>
<code>0.1 + 0.2 != 0.3</code> in floating point, and those tiny errors add up in balances. Store whole rupees or paise as <code>int</code>, or use <code>decimal.Decimal</code> created from strings when you need fractional amounts.`,
            codeExamples: [
                `from decimal import Decimal

print(sum([0.1] * 10))                  # float drift
print(sum([Decimal("0.10")] * 10))      # exact

# OUTPUT:
# 0.9999999999999999
# 1.00`
            ]
        },
        {
            content: `<h3>Extend It</h3>
1. Add a <b>change PIN</b> option that asks for the old PIN first.<br>
2. Add <b>fund transfer</b> between two <code>Account</code> objects - make sure money is never lost if the second step fails.<br>
3. Show the date and time of each transaction using <code>datetime.now()</code>.<br>
4. Save accounts to a JSON file so the balance survives restarts.<br>
5. Dispense notes: for an amount like 2,700, show how many ₹500, ₹200 and ₹100 notes are given.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does for-else help with PIN attempts?</td><td>The else block runs only when no break happened, i.e. every attempt failed - no flag variable needed</td></tr>
<tr class='text-center'><td>Why not use float for balances?</td><td>Binary floating point can't represent most decimal fractions exactly, so errors accumulate</td></tr>
<tr class='text-center'><td>How should a PIN or password be stored?</td><td>As a salted hash from a slow algorithm (PBKDF2, bcrypt, scrypt, Argon2), compared with hmac.compare_digest</td></tr>
<tr class='text-center'><td>Why raise exceptions in Account instead of printing?</td><td>It separates business rules from the user interface, so callers decide how to report errors and tests can check them</td></tr>
<tr class='text-center'><td>What does <code>raise SystemExit</code> do?</td><td>Ends the program, like <code>sys.exit()</code></td></tr>
</table>`
        }
    ]
};
