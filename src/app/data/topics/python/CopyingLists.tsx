import type { Topic } from '../../types';

export const copyingLists: Topic = {
    id: 'python-collections-copying-lists',
    name: 'Copying Lists',
    beginner: [
        {
            content: `<h4>Assignment Does Not Copy</h4>
<code>b = a</code> does not create a second list. It makes <code>b</code> another <b>name</b> for the same list, so a change through either name shows up in both. This is called <b>aliasing</b>.`,
            codeExamples: [
                `original = [1, 2, 3]
alias = original

alias.append(4)
print(original)
print(alias is original)

# OUTPUT:
# [1, 2, 3, 4]
# True`
            ]
        },
        {
            content: `<h4>Five Ways to Copy a List</h4>
Each of these creates a <b>new</b> list containing the same items.`,
            codeExamples: [
                `import copy

a = [1, 2, 3]

c1 = a.copy()            # clearest
c2 = a[:]                # slice of everything
c3 = list(a)             # constructor
c4 = [*a]                # unpacking
c5 = copy.copy(a)        # copy module

c1.append(99)
print(a, c1)
print(all(c is not a for c in (c1, c2, c3, c4, c5)))

# OUTPUT:
# [1, 2, 3] [1, 2, 3, 99]
# True`
            ]
        },
        {
            content: `<h4>Functions Receive the Same List</h4>
Passing a list to a function does not copy it. If the function modifies its parameter, the caller's list changes.`,
            codeExamples: [
                `def add_bonus(marks):
    for i in range(len(marks)):
        marks[i] += 5
    return marks

scores = [70, 80]
new_scores = add_bonus(scores)
print(scores, new_scores)        # both changed - same list

def add_bonus_safe(marks):
    return [m + 5 for m in marks]   # build a new list instead

scores = [70, 80]
print(add_bonus_safe(scores), scores)

# OUTPUT:
# [75, 85] [75, 85]
# [75, 85] [70, 80]`
            ]
        },
        {
            content: `<h4>When Do You Need a Copy?</h4>
• Before modifying a list that someone else also uses (a function argument, a shared default).<br>
• When you want to keep the "before" version, e.g. for undo.<br>
• When you need to loop over a list while adding or removing items from it: loop over a copy.`,
            codeExamples: [
                `tasks = ["a", "skip", "b", "skip"]
for t in tasks.copy():           # iterate over a snapshot
    if t == "skip":
        tasks.remove(t)
print(tasks)

# OUTPUT:
# ['a', 'b']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>All of These Copies Are Shallow</h3>
A shallow copy creates a new outer list but fills it with the <b>same item objects</b>. For numbers and strings that doesn't matter (they're immutable). For <b>nested</b> lists it does: the inner lists are shared. See <i>Shallow Copy vs Deep Copy</i> for the full story.`,
            codeExamples: [
                `import copy

grid = [[1, 2], [3, 4]]
shallow = grid.copy()
deep = copy.deepcopy(grid)

grid[0].append(99)               # change an inner list

print(shallow)                   # sees it - shares inner lists
print(deep)                      # independent
print(shallow[0] is grid[0], deep[0] is grid[0])

# OUTPUT:
# [[1, 2, 99], [3, 4]]
# [[1, 2], [3, 4]]
# True False`
            ]
        },
        {
            content: `<h3>Rebinding vs Mutating</h3>
<code>a = [...]</code> makes the name point at a new list and leaves aliases alone. <code>a[:] = [...]</code> changes the existing list's contents, so every alias sees it. Choose deliberately.`,
            codeExamples: [
                `a = [1, 2, 3]
alias = a
a = [0]                  # rebinding: alias still sees the old list
print(alias)

a = [1, 2, 3]
alias = a
a[:] = [0]               # mutating: alias sees the change
print(alias)

# OUTPUT:
# [1, 2, 3]
# [0]`
            ]
        },
        {
            content: `<h3>Defensive Copies in Classes</h3>
If a class stores a list it was given, the caller can still change it from outside. Copy on the way in (and return copies or tuples on the way out) to protect the object's state.`,
            codeExamples: [
                `class Course:
    def __init__(self, students):
        self._students = list(students)      # defensive copy

    @property
    def students(self):
        return tuple(self._students)         # read-only view for callers

names = ["Asha", "Ravi"]
course = Course(names)
names.append("Hacker")
print(course.students)

# OUTPUT:
# ('Asha', 'Ravi')`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Does <code>b = a</code> copy a list?</td><td>No - it creates an alias to the same list</td></tr>
<tr class='text-center'><td>Ways to copy a list?</td><td><code>a.copy()</code>, <code>a[:]</code>, <code>list(a)</code>, <code>[*a]</code>, <code>copy.copy(a)</code> - all shallow</td></tr>
<tr class='text-center'><td>When is a shallow copy not enough?</td><td>When the list contains mutable objects (e.g. nested lists) that you will change - use copy.deepcopy</td></tr>
<tr class='text-center'><td>Is a list passed to a function copied?</td><td>No - the function gets a reference to the same list</td></tr>
<tr class='text-center'><td><code>a = []</code> vs <code>a[:] = []</code> / <code>a.clear()</code>?</td><td>The first rebinds the name; the others empty the existing list, which all aliases see</td></tr>
</table>`
        }
    ]
};
