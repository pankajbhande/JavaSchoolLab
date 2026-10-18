import type { Topic } from '../../types';

export const internalsAst: Topic = {
    id: 'python-internals-ast-the-ast-module',
    name: 'AST & the ast Module',
    beginner: [
        {
            content: `<h4>What is an AST?</h4>
An <b>Abstract Syntax Tree</b> is the tree-shaped representation of your code that the parser builds before compilation. Each node is a construct - an assignment, a function call, a binary operation - and its children are the parts. It is "abstract" because details like brackets and whitespace are gone; only the structure remains. javac builds the same kind of tree before producing bytecode.`
        },
        {
            content: `<h4>Parsing and Dumping</h4>
<code>ast.parse()</code> returns the tree; <code>ast.dump()</code> prints it. <code>mode="eval"</code> parses a single expression.`,
            codeExamples: [
                `import ast

tree = ast.parse("x + 1", mode="eval")
print(ast.dump(tree, indent=2))

# OUTPUT (Python 3.12):
# Expression(
#   body=BinOp(
#     left=Name(id='x', ctx=Load()),
#     op=Add(),
#     right=Constant(value=1)))`
            ]
        },
        {
            content: `<h4>Walking the Tree</h4>
<code>ast.walk()</code> visits every node. Here we list every function defined in some source code, plus the names it calls.`,
            codeExamples: [
                `import ast

source = """
def load(path):
    return open(path).read()

def save(path, text):
    print("saving", path)
"""

tree = ast.parse(source)
for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef):
        args = [a.arg for a in node.args.args]
        print(node.name, args)
    elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
        print("  calls", node.func.id)

# OUTPUT:
# load ['path']
# save ['path', 'text']
#   calls print
#   calls open`
            ]
        },
        {
            content: `<h4>ast.literal_eval - Safe Parsing of Data</h4>
<code>literal_eval</code> evaluates only literals (numbers, strings, lists, dicts, tuples, sets, booleans, None). Anything else - function calls, names, attribute access - is rejected, which makes it safe for untrusted text, unlike <code>eval()</code>.`,
            codeExamples: [
                `import ast

print(ast.literal_eval("{'a': [1, 2], 'b': (3, None)}"))

try:
    ast.literal_eval("__import__('os').getcwd()")
except ValueError as e:
    print("rejected:", type(e).__name__)

# OUTPUT:
# {'a': [1, 2], 'b': (3, None)}
# rejected: ValueError`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>NodeVisitor: Structured Analysis</h3>
Subclass <code>ast.NodeVisitor</code> and define <code>visit_&lt;NodeType&gt;</code> methods; call <code>generic_visit</code> to keep descending. This is how linters find problems such as bare <code>except:</code> clauses.`,
            codeExamples: [
                `import ast

class Stats(ast.NodeVisitor):
    def __init__(self):
        self.functions = 0
        self.bare_excepts = 0

    def visit_FunctionDef(self, node):
        self.functions += 1
        self.generic_visit(node)

    def visit_ExceptHandler(self, node):
        if node.type is None:
            self.bare_excepts += 1
        self.generic_visit(node)

source = """
def a():
    try:
        pass
    except:
        pass

def b():
    def helper():
        pass
"""

s = Stats()
s.visit(ast.parse(source))
print(s.functions, s.bare_excepts)

# OUTPUT:
# 3 1`
            ]
        },
        {
            content: `<h3>Transforming Code and ast.unparse</h3>
<code>ast.NodeTransformer</code> returns replacement nodes; <code>ast.unparse()</code> (3.9+) turns a tree back into source text. Note that unparse normalises formatting - comments and original spacing are lost.`,
            codeExamples: [
                `import ast

class DoubleNumbers(ast.NodeTransformer):
    def visit_Constant(self, node):
        if isinstance(node.value, int):
            return ast.Constant(node.value * 2)
        return node

tree = ast.parse("price = 10+5   # comment")
new_tree = ast.fix_missing_locations(DoubleNumbers().visit(tree))
print(ast.unparse(new_tree))

namespace = {}
exec(compile(new_tree, "<ast>", "exec"), namespace)
print(namespace["price"])

# OUTPUT:
# price = 20 + 10
# 30`
            ]
        },
        {
            content: `<h3>Who Uses ASTs?</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Tool</th><th>What it does with the AST</th></tr>
<tr class='text-center'><td>Linters (Ruff, Pylint, Flake8)</td><td>Find bugs and style problems</td></tr>
<tr class='text-center'><td>Formatters (Black)</td><td>Check the reformatted code has the same AST as the original</td></tr>
<tr class='text-center'><td>pytest</td><td>Rewrites <code>assert</code> statements to show detailed failure messages</td></tr>
<tr class='text-center'><td>Type checkers (mypy)</td><td>Analyse types without running code</td></tr>
<tr class='text-center'><td>Coverage / security scanners (Bandit)</td><td>Locate risky calls such as <code>eval</code></td></tr>
</table>
Node classes can gain or change fields between Python versions, so tools built on <code>ast</code> are usually tested against several versions.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is an AST?</td><td>A tree representing the syntactic structure of code, built by the parser before compilation</td></tr>
<tr class='text-center'><td>How do you get one in Python?</td><td><code>ast.parse(source)</code>; inspect it with <code>ast.dump</code> or <code>ast.walk</code></td></tr>
<tr class='text-center'><td>Why is literal_eval safer than eval?</td><td>It only accepts literal values and rejects calls, names and attribute access</td></tr>
<tr class='text-center'><td>NodeVisitor vs NodeTransformer?</td><td>NodeVisitor inspects nodes; NodeTransformer can replace or remove them</td></tr>
<tr class='text-center'><td>What does ast.unparse do?</td><td>Converts an AST back to source code (without original comments or formatting)</td></tr>
<tr class='text-center'><td>Give a real use of the ast module</td><td>Linters, formatters, pytest's assertion rewriting, code-analysis and refactoring tools</td></tr>
</table>`
        }
    ]
};
