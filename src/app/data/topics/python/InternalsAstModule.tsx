import type { Topic } from '../../types';

export const internalsAstModule: Topic = {
    id: 'python-internals-ast-the-ast-module',
    name: 'AST & the ast Module',
    beginner: [
        {
            content: `<h4>Introduction</h4>
An <b>Abstract Syntax Tree</b> (AST) is the tree that the parser builds from your source, with each node standing for a construct such as an assignment or an addition. The <code>ast</code> module lets Python programs <b>read, analyse and rewrite</b> that tree before it is compiled. Java offers a similar view through the compiler tree API and annotation processors; in Python the tree is a plain, easy-to-use part of the standard library.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 477 270" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:477px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<line x1="180.8" y1="41.0" x2="122.7" y2="80.0" stroke="#6b7280" marker-end="url(#ar)"/><line x1="231.3" y1="41.0" x2="300.2" y2="80.0" stroke="#6b7280" marker-end="url(#ar)"/><line x1="305.4" y1="111.0" x2="249.7" y2="150.0" stroke="#6b7280" marker-end="url(#ar)"/><line x1="348.3" y1="111.0" x2="400.5" y2="150.0" stroke="#6b7280" marker-end="url(#ar)"/><line x1="213.3" y1="181.0" x2="172.8" y2="225.0" stroke="#6b7280" marker-end="url(#ar)"/><line x1="242.8" y1="181.0" x2="286.0" y2="225.0" stroke="#6b7280" marker-end="url(#ar)"/><rect x="170" y="10" width="67.8" height="31" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="203.9" y="29.5">Assign</tspan></text><rect x="40" y="80" width="97" height="46" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="88.5" y="99.5">Name total</tspan><tspan x="88.5" y="114.5">(Store)</tspan></text><rect x="290" y="80" width="75.1" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="327.6" y="99.5">BinOp +</tspan></text><rect x="190" y="150" width="75.1" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="227.6" y="169.5">BinOp *</tspan></text><rect x="380" y="150" width="82.4" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="421.2" y="169.5">Name tax</tspan></text><rect x="110" y="225" width="97" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="158.5" y="244.5">Name price</tspan></text><rect x="260" y="225" width="82.4" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="301.2" y="244.5">Name qty</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: AST of: total = price * qty + tax  (the multiplication sits deeper, so it runs first)</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Analysing code with string searches or regular expressions breaks on comments, strings and formatting, so tools like linters or code generators cannot trust it.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Analyse code <b>structurally</b>: find every function, import or call reliably.</li>
<li>Build linters, formatters, checkers and code-generation tools.</li>
<li>Transform code safely by editing the tree and recompiling it.</li>
<li>Evaluate literals safely with <code>ast.literal_eval()</code> instead of <code>eval()</code>.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Read and rewrite code with ast</h4>
The program collects variable names with a visitor, then rewrites every addition into a subtraction using a transformer.`,
            codeExamples: [
                `import ast

SOURCE = "total = price * qty + tax"


class NameCollector(ast.NodeVisitor):
    def __init__(self):
        self.loaded = []

    def visit_Name(self, node):
        if isinstance(node.ctx, ast.Load):
            self.loaded.append(node.id)


class AddToSub(ast.NodeTransformer):
    def visit_Add(self, node):
        return ast.Sub()


def evaluate(tree):
    return eval(compile(tree, "<ast>", "eval"))


def main():
    tree = ast.parse(SOURCE)
    print(type(tree).__name__, type(tree.body[0]).__name__)

    collector = NameCollector()
    collector.visit(tree)
    print("Names read:", collector.loaded)

    expr = ast.parse("10 + 5", mode="eval")
    print("Before:", evaluate(expr))
    changed = ast.fix_missing_locations(AddToSub().visit(expr))
    print("After: ", evaluate(changed))

    print(ast.literal_eval("[1, 2, 3]"))


if __name__ == "__main__":
    main()

# OUTPUT:
# Module Assign
# Names read: ['price', 'qty', 'tax']
# Before: 15
# After:  5
# [1, 2, 3]`
            ],
            codeExplanations: [
                `The visitor skips total because it has a Store context and records the names that are only read, in tree order. The transformer replaces each Add operator node with Sub, so 10 + 5 compiles as 10 - 5. literal_eval safely turns a list literal into a real list without running arbitrary code.`
            ]
        },
        {
            content: `<h4>What is an AST?</h4>
An <b>Abstract Syntax Tree</b> is a tree that represents the <i>structure</i> of your code. The parser turns text such as <code>x = 1 + 2 * 3</code> into nested nodes - an assignment whose value is an addition whose right side is a multiplication. "Abstract" means irrelevant details (whitespace, parentheses, comments) are dropped and only meaning remains. The AST is what the compiler consumes to produce bytecode, and the <code>ast</code> module lets <b>your</b> code read and change it.`
        },
        {
            content: `<h4>Parsing and Dumping a Tree</h4>
<code>ast.parse()</code> returns the tree; <code>ast.dump(tree, indent=2)</code> prints it in readable form.`,
            codeExamples: [
                `import ast

tree = ast.parse("x = 1 + 2 * 3")
print(ast.dump(tree.body[0], indent=2))

# OUTPUT (Python 3.9+; newer versions may omit empty fields):
# Assign(
#   targets=[
#     Name(id='x', ctx=Store())],
#   value=BinOp(
#     left=Constant(value=1),
#     op=Add(),
#     right=BinOp(
#       left=Constant(value=2),
#       op=Mult(),
#       right=Constant(value=3))))`
            ],
            codeExplanations: [
                `The tree shows operator precedence: 2 * 3 is nested deeper than the addition, so it is evaluated first. The target x is a Name node with a Store context (it is being assigned), while names being read have a Load context. tree.body is the list of statements in the module.`
            ]
        },
        {
            content: `<h4>Common Node Types</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Node</th><th>Represents</th></tr>
<tr class='text-center'><td><code>Module</code></td><td>The whole file; its <code>body</code> is a list of statements</td></tr>
<tr class='text-center'><td><code>FunctionDef</code>, <code>ClassDef</code></td><td>A <code>def</code> or <code>class</code> statement</td></tr>
<tr class='text-center'><td><code>Assign</code>, <code>Return</code>, <code>If</code>, <code>For</code></td><td>Statements</td></tr>
<tr class='text-center'><td><code>Name</code>, <code>Constant</code>, <code>Attribute</code></td><td>A variable, a literal value, <code>obj.attr</code></td></tr>
<tr class='text-center'><td><code>BinOp</code>, <code>Compare</code>, <code>BoolOp</code></td><td>Arithmetic, comparisons, <code>and</code>/<code>or</code></td></tr>
<tr class='text-center'><td><code>Call</code></td><td>A function call</td></tr>
</table>`
        },
        {
            content: `<h4>Finding Things With NodeVisitor</h4>
Subclass <code>ast.NodeVisitor</code> and define <code>visit_&lt;NodeName&gt;</code> methods. The visitor walks the tree and calls yours for each matching node. Here we list every function call with its line number - the seed of a linter.`,
            codeExamples: [
                `import ast

source = """def greet(name):
    print("Hello", name)

def main():
    greet("Abaji")
    greet("Raoji")
"""

class CallFinder(ast.NodeVisitor):
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            print(node.func.id, "on line", node.lineno)
        self.generic_visit(node)          # keep walking into children

CallFinder().visit(ast.parse(source))

# OUTPUT:
# print on line 2
# greet on line 5
# greet on line 6`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Changing Code: NodeTransformer</h3>
A <code>NodeTransformer</code> can <b>replace</b> nodes. After modifying a tree, call <code>ast.fix_missing_locations</code> (new nodes lack line numbers), then <code>compile</code> and run it. <code>ast.unparse</code> (3.9+) converts a tree back to source.`,
            codeExamples: [
                `import ast

class AddToMul(ast.NodeTransformer):
    def visit_BinOp(self, node):
        self.generic_visit(node)                # transform children first
        if isinstance(node.op, ast.Add):
            node.op = ast.Mult()
        return node

tree = ast.parse("2 + 3", mode="eval")
tree = ast.fix_missing_locations(AddToMul().visit(tree))

print(ast.unparse(tree))
print(eval(compile(tree, "<ast>", "eval")))

# OUTPUT:
# 2 * 3
# 6`
            ]
        },
        {
            content: `<h3>ast.literal_eval: Safe Evaluation of Literals</h3>
<code>eval()</code> runs <b>any</b> code, so passing it untrusted text is a security hole. <code>ast.literal_eval()</code> parses the text and accepts only Python <b>literals</b> (numbers, strings, lists, dicts, tuples, sets, booleans, <code>None</code>) - never calls or names.`,
            codeExamples: [
                `import ast

print(ast.literal_eval("[1, 2, {'a': (3, 4)}]"))

try:
    ast.literal_eval("__import__('os').getcwd()")
except ValueError:
    print("rejected: not a literal")

# OUTPUT:
# [1, 2, {'a': (3, 4)}]
# rejected: not a literal`
            ]
        },
        {
            content: `<h3>Building a Tiny Linter</h3>
<code>ast.walk(tree)</code> yields every node, which is enough for simple checks. This one flags <code>print()</code> calls left in code and functions without a docstring - using only the standard library.`,
            codeExamples: [
                `import ast

source = '''def documented():
    """Does something."""
    return 1

def undocumented():
    print("debug")
    return 2
'''

tree = ast.parse(source)

for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef) and ast.get_docstring(node) is None:
        print(f"line {node.lineno}: function '{node.name}' has no docstring")
    if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
            and node.func.id == "print"):
        print(f"line {node.lineno}: print() call left in code")

# OUTPUT:
# line 5: function 'undocumented' has no docstring
# line 6: print() call left in code`
            ]
        },
        {
            content: `<h3>Where the AST Is Used in the Real World</h3>
<ul>
<li><b>Linters and checkers:</b> <code>pyflakes</code> (inside flake8), <code>pylint</code>, <code>bandit</code> (security rules) analyse the AST.</li>
<li><b>pytest</b> rewrites the AST of test modules so that a plain <code>assert a == b</code> reports the values of <code>a</code> and <code>b</code>.</li>
<li><b>Code generation and macros:</b> libraries that transform Python (dataclass-like generators, numba-style JITs, DSLs) inspect function ASTs.</li>
<li><b>Formatters and refactoring tools:</b> Black parses code and checks the AST is equivalent after formatting; LibCST keeps comments and whitespace, which the plain AST cannot.</li>
<li><b>Documentation generators</b> read function signatures and docstrings without importing (running) the code - safer for untrusted code.</li>
</ul>`
        },
        {
            content: `<h3>Limits and Gotchas</h3>
<ul>
<li><b>Comments and formatting are lost.</b> <code>ast.unparse</code> produces valid but re-formatted code. For round-trip editing use LibCST.</li>
<li><b>The tree changes between versions.</b> New syntax adds nodes (<code>Match</code> in 3.10, <code>TypeAlias</code> in 3.12) and some nodes change (<code>Constant</code> replaced <code>Num</code>/<code>Str</code> in 3.8). Test your tool on each supported version.</li>
<li><b>Positions:</b> nodes carry <code>lineno</code>, <code>col_offset</code>, <code>end_lineno</code>, <code>end_col_offset</code> - use them for precise error reporting.</li>
<li><b>Mind the context:</b> forgetting <code>fix_missing_locations</code> after building nodes leads to confusing "missing lineno" compile errors.</li>
<li><b>Parsing is not executing.</b> <code>ast.parse</code> is safe on untrusted code; <code>compile</code>/<code>exec</code>/<code>eval</code> of the result is not.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Exact structural view of code, immune to formatting</td><td>Node classes and fields change between Python versions</td></tr>
<tr><td>Visitor and Transformer classes make walking easy</td><td>Comments and exact formatting are lost in the tree</td></tr>
<tr><td>Enables linters, refactoring tools and code generators</td><td>Hand-built trees need correct line numbers (fix_missing_locations)</td></tr>
<tr><td>literal_eval gives a safe alternative to eval</td><td>Verbose compared with a simple text search for small jobs</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is an AST?</td><td>A tree of nodes representing the structure of the source code, produced by the parser and consumed by the compiler</td></tr>
<tr class='text-center'><td>How do you get one in Python?</td><td><code>ast.parse(source)</code>; show it with <code>ast.dump(tree, indent=2)</code></td></tr>
<tr class='text-center'><td>NodeVisitor vs NodeTransformer?</td><td>A visitor only reads the tree; a transformer returns replacement nodes to modify it</td></tr>
<tr class='text-center'><td>Why prefer <code>ast.literal_eval</code> to <code>eval</code>?</td><td>It accepts only literals, so untrusted input cannot run code</td></tr>
<tr class='text-center'><td>Name a tool that relies on the AST.</td><td>flake8/pyflakes, pylint, bandit, Black, and pytest's assertion rewriting</td></tr>
</table>`
        }
    ]
};
