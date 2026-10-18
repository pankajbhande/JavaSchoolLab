import type { Topic } from '../../types';

export const practiceMenuDrivenProgram: Topic = {
    id: 'python-control-flow-practice-menu-driven-program',
    name: 'Practice: Menu-Driven Program',
    beginner: [
        {
            content: `<h4>The Task</h4>
Build a <b>Student Record Manager</b> that shows a menu again and again until the user chooses Exit:<br>
1. Add a student (roll number, name, marks)<br>
2. View all students<br>
3. Search by name<br>
4. Update marks<br>
5. Delete a student<br>
6. Exit<br><br>
<b>Concepts practised:</b> <code>while True</code> menus, <code>match/case</code>, functions, dictionaries, validation loops and formatted tables. This "loop + menu + one function per option" structure is the backbone of most console applications.`
        },
        {
            content: `<h4>Step 1: The Data and a Validation Helper</h4>
Records live in a dictionary keyed by roll number. A helper keeps asking until it gets valid marks.`,
            codeExamples: [
                `students = {}      # roll number -> {"name": ..., "marks": ...}


def read_marks():
    while True:
        text = input("Marks (0-100): ").strip()
        if text.isdigit() and 0 <= int(text) <= 100:
            return int(text)
        print("Please enter a whole number from 0 to 100.")`
            ]
        },
        {
            content: `<h4>Step 2: One Function per Menu Option</h4>`,
            codeExamples: [
                `def add_student():
    roll = input("Roll number: ").strip()
    if roll in students:
        print("That roll number already exists.")
        return
    name = input("Name: ").strip().title()
    students[roll] = {"name": name, "marks": read_marks()}
    print(f"Added {name}.")


def view_students():
    if not students:
        print("No records yet.")
        return
    print(f"{'Roll':<6}{'Name':<15}{'Marks':>5}")
    print("-" * 26)
    for roll in sorted(students):
        s = students[roll]
        print(f"{roll:<6}{s['name']:<15}{s['marks']:>5}")


def search_students():
    query = input("Name contains: ").strip().lower()
    matches = [(r, s) for r, s in students.items() if query in s["name"].lower()]
    if not matches:
        print("No match found.")
    for roll, s in matches:
        print(f"{roll}: {s['name']} ({s['marks']})")


def update_marks():
    roll = input("Roll number: ").strip()
    if roll not in students:
        print("No such student.")
        return
    students[roll]["marks"] = read_marks()
    print("Marks updated.")


def delete_student():
    roll = input("Roll number: ").strip()
    if roll not in students:
        print("No such student.")
        return
    if input(f"Delete {students[roll]['name']}? (y/n): ").strip().lower() == "y":
        del students[roll]
        print("Deleted.")`
            ]
        },
        {
            content: `<h4>Step 3: The Menu Loop</h4>`,
            codeExamples: [
                `def main():
    while True:
        print()
        print("===== Student Record Manager =====")
        print("1. Add student      2. View all")
        print("3. Search by name   4. Update marks")
        print("5. Delete student   6. Exit")
        choice = input("Enter choice: ").strip()

        match choice:
            case "1":
                add_student()
            case "2":
                view_students()
            case "3":
                search_students()
            case "4":
                update_marks()
            case "5":
                delete_student()
            case "6":
                print("Goodbye!")
                break
            case _:
                print("Invalid choice, enter 1-6.")


if __name__ == "__main__":
    main()`
            ]
        },
        {
            content: `<h4>Sample Run</h4>`,
            codeExamples: [
                `# Enter choice: 1
# Roll number: 101
# Name: pankaj patil
# Marks (0-100): 88
# Added Pankaj Patil.
#
# Enter choice: 1
# Roll number: 102
# Name: sheru
# Marks (0-100): 120
# Please enter a whole number from 0 to 100.
# Marks (0-100): 74
# Added Sheru.
#
# Enter choice: 2
# Roll  Name           Marks
# --------------------------
# 101   Pankaj Patil      88
# 102   Sheru             74
#
# Enter choice: 3
# Name contains: she
# 102: Sheru (74)
#
# Enter choice: 6
# Goodbye!`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Data-Driven Menus</h3>
Store the menu as data - a dictionary from choice to <code>(label, function)</code>. The menu text and the dispatch are generated from one place, so adding an option means adding one line.`,
            codeExamples: [
                `MENU = {
    "1": ("Add student", add_student),
    "2": ("View all", view_students),
    "3": ("Search by name", search_students),
    "4": ("Update marks", update_marks),
    "5": ("Delete student", delete_student),
}

def main():
    while True:
        print()
        for key, (label, _) in MENU.items():
            print(f"{key}. {label}")
        print("0. Exit")
        choice = input("Enter choice: ").strip()
        if choice == "0":
            break
        entry = MENU.get(choice)
        if entry is None:
            print("Invalid choice.")
            continue
        label, action = entry
        action()`
            ]
        },
        {
            content: `<h3>Saving Records Between Runs</h3>
Load the records from a JSON file at start-up and save them on exit, so data survives after the program closes.`,
            codeExamples: [
                `import json
from pathlib import Path

DATA_FILE = Path("students.json")

def load_students():
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    return {}

def save_students(students):
    DATA_FILE.write_text(json.dumps(students, indent=2), encoding="utf-8")

students = load_students()
# ... run the menu loop ...
save_students(students)`
            ]
        },
        {
            content: `<h3>Adding a Statistics Option</h3>
Built-in functions make reports short.`,
            codeExamples: [
                `students = {
    "101": {"name": "Pankaj Patil", "marks": 88},
    "102": {"name": "Sheru", "marks": 74},
    "103": {"name": "Dheeraj", "marks": 39},
}

marks = [s["marks"] for s in students.values()]
topper = max(students.values(), key=lambda s: s["marks"])
failed = [s["name"] for s in students.values() if s["marks"] < 40]

print(f"Average: {sum(marks) / len(marks):.1f}")
print(f"Topper: {topper['name']} ({topper['marks']})")
print("Failed:", ", ".join(failed) or "none")

# OUTPUT:
# Average: 67.0
# Topper: Pankaj Patil (88)
# Failed: Dheeraj`
            ]
        },
        {
            content: `<h3>Extend It</h3>
1. Add the statistics option above to the menu.<br>
2. Sort the "View all" table by marks (highest first) with <code>sorted(..., key=..., reverse=True)</code>.<br>
3. Export all records to <code>students.csv</code> using the <code>csv</code> module.<br>
4. Store marks for several subjects per student and show each student's total and grade.<br>
5. Catch <code>KeyboardInterrupt</code> (Ctrl+C) so the program saves data before exiting.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you keep showing a menu until the user exits?</td><td>A <code>while True</code> loop that breaks on the exit option</td></tr>
<tr class='text-center'><td>Why one function per option?</td><td>Each piece is small, testable and reusable; the loop only dispatches</td></tr>
<tr class='text-center'><td>What is the benefit of a data-driven menu?</td><td>Labels and actions live in one structure, so options can be added or reordered without touching the loop</td></tr>
<tr class='text-center'><td>Why use a dict keyed by roll number?</td><td>O(1) lookup, update and delete by key, and duplicates are easy to detect</td></tr>
<tr class='text-center'><td>What does <code>if __name__ == "__main__"</code> add here?</td><td>The functions can be imported by tests or other modules without starting the menu</td></tr>
</table>`
        }
    ]
};
