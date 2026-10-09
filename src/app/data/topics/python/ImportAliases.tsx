import type { Topic } from '../../types';

export const importAliases: Topic = {
    id: 'python-modules-packages-import-aliases',
    name: 'Import Aliases',
    beginner: [
        {
            content: `<h4>What is an Import Alias?</h4>
<code>as</code> gives an imported module or name a different local name:<br><br>
• <code>import module as short</code><br>
• <code>from module import name as other</code><br><br>
Aliases shorten long names you type constantly and resolve clashes between two names that would otherwise collide. Java has no equivalent - you would have to write the fully qualified class name.`,
            codeExamples: [
                `import statistics as stats
from datetime import datetime as dt

print(stats.mean([70, 80, 90]))
print(dt(2026, 10, 4).strftime("%d %b %Y"))

# OUTPUT:
# 80
# 04 Oct 2026`
            ]
        },
        {
            content: `<h4>Community-Standard Aliases</h4>
Some aliases are so universal that every tutorial, answer and codebase uses them. Use exactly these - readers expect them.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Import</th><th>Library</th></tr>
<tr class='text-center'><td><code>import numpy as np</code></td><td>NumPy - arrays and numerical computing</td></tr>
<tr class='text-center'><td><code>import pandas as pd</code></td><td>pandas - data tables (DataFrames)</td></tr>
<tr class='text-center'><td><code>import matplotlib.pyplot as plt</code></td><td>Matplotlib - charts</td></tr>
<tr class='text-center'><td><code>import seaborn as sns</code></td><td>Seaborn - statistical charts</td></tr>
<tr class='text-center'><td><code>import tensorflow as tf</code></td><td>TensorFlow - machine learning</td></tr>
</table>`,
            codeExamples: [
                `import numpy as np            # pip install numpy

marks = np.array([72, 88, 95])
print(marks.mean(), marks.max())

# OUTPUT:
# 85.0 95`
            ]
        },
        {
            content: `<h4>Resolving Name Clashes</h4>
<code>math.sqrt</code> works on real numbers, <code>cmath.sqrt</code> on complex numbers. Importing both as <code>sqrt</code> would make the second silently replace the first. Aliases keep both.`,
            codeExamples: [
                `from math import sqrt
from cmath import sqrt as complex_sqrt

print(sqrt(16))
print(complex_sqrt(-16))
print(sqrt(-16))

# OUTPUT:
# 4.0
# 4j
# ValueError: math domain error`
            ]
        },
        {
            content: `<h4>Shortening Deep Package Paths</h4>
Some modules live deep inside packages. An alias saves you from repeating the full path.`,
            codeExamples: [
                `import xml.etree.ElementTree as ET

root = ET.fromstring("<course><name>Python</name></course>")
print(root.find("name").text)

# OUTPUT:
# Python`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>When NOT to Alias</h3>
An alias is a new name every reader must learn. Only use one when it is a community standard, fixes a clash, or shortens a genuinely long path. <code>import os as o</code> or <code>import json as j</code> save two keystrokes and cost readability.`,
            codeExamples: [
                `# Unhelpful - nobody expects these
import json as j
import random as rnd

# Fine - standard or clarifying
import numpy as np
from cmath import sqrt as complex_sqrt`
            ]
        },
        {
            content: `<h3>An Alias Doesn't Rename the Module</h3>
<code>as</code> only changes the name in <b>your</b> file. The module object is the same one stored in <code>sys.modules</code> under its real name.`,
            codeExamples: [
                `import sys
import json as j

print(j.__name__)
print(j is sys.modules["json"])
print("json" in dir())          # the real name was not bound here

# OUTPUT:
# json
# True
# False`
            ]
        },
        {
            content: `<h3>import a.b.c as c Binds Only c</h3>
A plain <code>import xml.etree.ElementTree</code> binds the top-level name <code>xml</code>, and you must write the full dotted path every time. With <code>as</code>, only the alias is bound - the top-level package name is not.`,
            codeExamples: [
                `import xml.etree.ElementTree as ET

print(ET.__name__)
print("ET" in dir(), "xml" in dir())

# OUTPUT:
# xml.etree.ElementTree
# True False`
            ]
        },
        {
            content: `<h3>Optional Fast Implementations</h3>
Aliasing inside <code>try/except ImportError</code> lets the rest of the code use one name whether or not an optional, faster package is installed - as long as both offer the functions you call.`,
            codeExamples: [
                `try:
    import ujson as json        # faster, if installed
except ImportError:
    import json                 # standard library fallback

data = json.loads('{"course": "Python", "modules": 40}')
print(data["modules"])

# OUTPUT:
# 40`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>import numpy as np</code> do?</td><td>Imports numpy and binds it to the local name np instead of numpy</td></tr>
<tr class='text-center'><td>Does an alias change <code>module.__name__</code>?</td><td>No - only the local name changes; the module is the same object in sys.modules</td></tr>
<tr class='text-center'><td>How do you import two functions with the same name?</td><td>Alias one: <code>from cmath import sqrt as complex_sqrt</code></td></tr>
<tr class='text-center'><td>What does <code>import a.b.c as c</code> bind?</td><td>Only c - the name a is not bound</td></tr>
<tr class='text-center'><td>When should you avoid aliases?</td><td>When they are non-standard abbreviations that only save a few characters</td></tr>
</table>`
        }
    ]
};
