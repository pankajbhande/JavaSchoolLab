import type { Topic } from '../../types';

export const practiceNumberGuessingGame: Topic = {
    id: 'python-control-flow-practice-number-guessing-game',
    name: 'Practice: Number Guessing Game',
    beginner: [
        {
            content: `<h4>The Task</h4>
The computer picks a secret number between 1 and 100. The player guesses; after each guess the program says <b>"Too low"</b> or <b>"Too high"</b>. The player has 7 attempts.<br><br>
<b>Concepts practised:</b> the <code>random</code> module, <code>while</code> loops, <code>if/elif/else</code>, counters, input validation, <code>break</code>, and the loop <code>else</code> clause.`
        },
        {
            content: `<h4>Step 1: Pick a Secret Number</h4>
<code>random.randint(a, b)</code> returns a random integer from a to b - <b>both ends included</b>.`,
            codeExamples: [
                `import random

secret = random.randint(1, 100)
print("Secret (for testing only):", secret)

# OUTPUT (changes every run):
# Secret (for testing only): 42`
            ]
        },
        {
            content: `<h4>Step 2: The Complete Game</h4>
The loop counts attempts. A valid correct guess ends the game with <code>break</code>; if the loop runs out of attempts instead, its <code>else</code> block reveals the number.`,
            codeExamples: [
                `import random

secret = random.randint(1, 100)
max_attempts = 7
attempts = 0

print("I'm thinking of a number between 1 and 100.")
print(f"You have {max_attempts} attempts.")

while attempts < max_attempts:
    text = input(f"Guess #{attempts + 1}: ").strip()
    if not text.isdigit():
        print("Please enter a whole number.")
        continue                         # invalid input doesn't use an attempt
    guess = int(text)
    if not 1 <= guess <= 100:
        print("Stay between 1 and 100.")
        continue
    attempts += 1

    if guess < secret:
        print("Too low!")
    elif guess > secret:
        print("Too high!")
    else:
        print(f"Correct! You got it in {attempts} attempts.")
        break
else:
    print(f"Out of attempts! The number was {secret}.")

# SAMPLE RUN (secret was 37):
# I'm thinking of a number between 1 and 100.
# You have 7 attempts.
# Guess #1: 50
# Too high!
# Guess #2: 25
# Too low!
# Guess #3: abc
# Please enter a whole number.
# Guess #3: 37
# Correct! You got it in 3 attempts.`
            ]
        },
        {
            content: `<h4>Step 3: Play Again?</h4>
Put one round in a function and call it in an outer loop.`,
            codeExamples: [
                `def play_round():
    ...                     # the game from Step 2 goes here

while True:
    play_round()
    again = input("Play again? (y/n): ").strip().lower()
    if again != "y":
        print("Thanks for playing!")
        break`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Why 7 Attempts? Binary Search</h3>
The best strategy is to always guess the middle of the remaining range - each guess halves the possibilities. 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1, so <b>7 guesses</b> (⌈log₂ 101⌉) are always enough. Let the computer play to prove it.`,
            codeExamples: [
                `def computer_guesses(secret, low=1, high=100):
    tries = 0
    while low <= high:
        tries += 1
        mid = (low + high) // 2
        if mid == secret:
            return tries
        if mid < secret:
            low = mid + 1
        else:
            high = mid - 1

worst = max(computer_guesses(n) for n in range(1, 101))
average = sum(computer_guesses(n) for n in range(1, 101)) / 100
print("Worst case:", worst, "guesses")
print("Average:", average, "guesses")

# OUTPUT:
# Worst case: 7 guesses
# Average: 5.8 guesses`
            ]
        },
        {
            content: `<h3>Making Random Code Testable</h3>
Random output is hard to test. Two standard fixes: <b>seed</b> the generator so the "random" sequence is repeatable, or <b>pass the secret in</b> as a parameter so a test can choose it.`,
            codeExamples: [
                `import random

random.seed(7)
first_run = [random.randint(1, 100) for _ in range(3)]
random.seed(7)
second_run = [random.randint(1, 100) for _ in range(3)]
print(first_run == second_run)          # same seed -> same "random" numbers

def check(guess, secret):
    if guess < secret:
        return "low"
    if guess > secret:
        return "high"
    return "correct"

assert check(10, 37) == "low"
assert check(37, 37) == "correct"
print("tests passed")

# OUTPUT:
# True
# tests passed`
            ]
        },
        {
            content: `<h3>Difficulty Levels with a Dictionary</h3>`,
            codeExamples: [
                `LEVELS = {
    "easy": (1, 50, 10),       # (low, high, attempts)
    "medium": (1, 100, 7),
    "hard": (1, 1000, 10),
}

choice = input("Difficulty (easy/medium/hard): ").strip().lower()
low, high, max_attempts = LEVELS.get(choice, LEVELS["medium"])
print(f"Guess a number from {low} to {high} in {max_attempts} attempts")

# SAMPLE RUN:
# Difficulty (easy/medium/hard): hard
# Guess a number from 1 to 1000 in 10 attempts`
            ]
        },
        {
            content: `<h3>Extend It</h3>
1. Show "Warm" / "Cold" depending on how close the guess is.<br>
2. Remember the <b>best score</b> in a file (<code>best_score.txt</code>) between runs.<br>
3. Reverse the game: <b>you</b> pick the number and the computer guesses using binary search, while you answer "h", "l" or "c".<br>
4. Detect a player who repeats a guess and tell them.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Is <code>randint(1, 100)</code> inclusive?</td><td>Yes, both ends - unlike <code>randrange(1, 100)</code>, which excludes 100</td></tr>
<tr class='text-center'><td>Minimum guesses that always suffice for 1-100?</td><td>7, using binary search (⌈log₂ 101⌉)</td></tr>
<tr class='text-center'><td>How do you make random results reproducible?</td><td><code>random.seed(value)</code> before generating</td></tr>
<tr class='text-center'><td>Should you use random for passwords or tokens?</td><td>No - use the <code>secrets</code> module, which is cryptographically secure</td></tr>
<tr class='text-center'><td>What does the while-else do in this game?</td><td>Its else block runs only when attempts run out without a break (no correct guess)</td></tr>
</table>`
        }
    ]
};
