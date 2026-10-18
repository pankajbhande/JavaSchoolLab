import { Topic } from '../coreJava';

export const namingConventionsPractice: Topic = {
    id: 'naming-conventions-practice',
    name: 'Naming Conventions',
    beginner: [
        {
            content: `<h3>What are Naming Conventions?</h3>
Naming conventions are the agreed rules for what you call things in code - classes, methods, variables, constants,
and packages. A good name tells you what something is or does without needing to open the code and read it. <br><br>
Real-world analogy: a box labeled "Kitchen - Pots and Pans" is instantly useful; a box labeled "Stuff1" tells you
nothing until you open it. Code names work the same way.`
        },
        {
            content: `<h4>Java's standard naming rules</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Element</th><th>Convention</th><th>Example</th></tr>
<tr><td>Class / Interface</td><td>PascalCase (UpperCamelCase)</td><td><code>EmployeeService</code></td></tr>
<tr><td>Method / Variable</td><td>camelCase</td><td><code>calculateSalary</code>, <code>totalAmount</code></td></tr>
<tr><td>Constant</td><td>UPPER_SNAKE_CASE</td><td><code>MAX_RETRY_COUNT</code></td></tr>
<tr><td>Package</td><td>all lowercase, reverse domain</td><td><code>com.dhipansoft.billing</code></td></tr>
</table>`
        },
        {
            content: `<h4>A bad name vs a good name</h4>
The single most common beginner mistake is naming things after their type or using meaningless abbreviations instead
of naming them after their purpose.`,
            codeExamples: [
                `// Poor naming - what is "d"? what does "proc" do? what is "1"?
public class Emp1 {
    int d;
    String n;

    public void proc() {
        d = d - 5;
    }
}`,
                `// Clear naming - intent is obvious without reading the body
public class Employee {
    int daysOfLeaveRemaining;
    String fullName;

    public void deductEmergencyLeave() {
        daysOfLeaveRemaining = daysOfLeaveRemaining - 5;
    }
}`
            ]
        },
        {
            content: `<h4>Naming methods by what they do</h4>
A method name should read almost like a sentence when combined with its object. Booleans conventionally start with
<code>is</code>/<code>has</code>/<code>can</code>; actions start with a verb.`,
            codeExamples: [
                `boolean isEligible = employee.isEligibleForBonus();
boolean hasApproved = manager.hasApprovedLeave(request);

int totalSalary = payrollService.calculateTotalSalary(employee);
List<Employee> activeStaff = employeeRepository.findAllActive();`
            ]
        },
        {
            content: `<h4>Names to avoid</h4>
• Single letters outside of tiny loop counters (<code>i</code>, <code>j</code> in a short for-loop is fine; a field
named <code>x</code> is not). <br>
• Meaningless suffixes: <code>data</code>, <code>info</code>, <code>manager</code>, <code>temp2</code> used as if they
were descriptive. <br>
• Hungarian notation in Java (<code>strName</code>, <code>iCount</code>) - Java is statically typed and IDEs already
show types, so type prefixes add noise, not clarity. <br>
• Names that lie - a variable called <code>list</code> that is actually a <code>Map</code>.`
        }
    ],
    expert: [
        {
            content: `<h3>Naming Conventions as Documentation</h3>
Experienced engineers treat a good name as the cheapest form of documentation available - it never goes stale the way
a comment can, because it's forced to change wherever the identifier is used. Martin Fowler and Robert C. Martin
("Clean Code") both argue that most comments exist to compensate for a poorly chosen name; renaming the thing usually
removes the need for the comment entirely.`,
            codeExamples: [
                `// Comment compensating for a bad name
// n is the number of days since the invoice was issued
int n = calculateN(invoice);

// Better: no comment needed, the name carries the meaning
int daysSinceInvoiceIssued = calculateDaysSinceIssued(invoice);`
            ]
        },
        {
            content: `<h3>Convention Consistency Across a Codebase</h3>
Large codebases enforce naming through linters (Checkstyle's <code>MemberName</code>, <code>MethodName</code>,
<code>ConstantName</code> modules) rather than tribal memory, because inconsistent naming compounds: once one class
uses <code>getUser()</code> and another uses <code>fetchUser()</code> for the same kind of operation, developers can
no longer predict an API's shape and have to read source instead of guessing from the name. Consistency is often more
valuable than any individual naming choice being "perfect."`
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>Over-abbreviating</strong> to save keystrokes - modern IDEs autocomplete, so <code>calcTtlAmt()</code> saves
nothing and costs readability. <br>
• <strong>Encoding scope or type in the name</strong> (<code>m_balance</code>, <code>strName</code>) - redundant with
what the IDE already shows. <br>
• <strong>Generic names for domain concepts</strong> - calling something <code>Manager</code> or <code>Helper</code>
when a more specific name (<code>InvoiceReconciler</code>, <code>RetryPolicy</code>) would describe its actual
responsibility - often a symptom of a class doing too many unrelated things (see Refactoring / Single Responsibility). <br>
• <strong>Renaming without tooling</strong> - using find/replace instead of an IDE's "Rename Refactor" risks partial
renames and broken references across a large codebase.`
        },
        {
            content: `<h3>Naming in Different Contexts</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Context</th><th>Guidance</th></tr>
<tr><td>Test methods</td><td>Describe behavior, not implementation: <code>shouldThrowWhenBalanceIsNegative()</code></td></tr>
<tr><td>Boolean variables/methods</td><td>Read as a yes/no question: <code>isActive</code>, <code>hasPermission</code></td></tr>
<tr><td>Collections</td><td>Plural nouns: <code>employees</code>, not <code>employeeList</code> (type is redundant)</td></tr>
<tr><td>Generic type parameters</td><td>Single uppercase letter by convention: <code>T</code>, <code>K</code>, <code>V</code>, <code>E</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What casing convention does Java use for class names vs variable/method names?</td><td>Classes and interfaces use PascalCase (UpperCamelCase); methods and variables use camelCase; constants use UPPER_SNAKE_CASE.</td></tr>
<tr><td>Why is Hungarian notation (strName, iCount) discouraged in Java?</td><td>Java is statically typed and IDEs surface types on hover/autocomplete, so type prefixes are redundant and just add visual noise.</td></tr>
<tr><td>How does a good name reduce the need for comments?</td><td>A well-chosen name communicates intent directly at the call site and can't silently go stale the way a comment can, since renaming forces every usage to update.</td></tr>
<tr><td>What convention is typical for boolean variables and methods?</td><td>Prefix with is/has/can so the name reads as a yes/no question, e.g. isEligible, hasApproved.</td></tr>
<tr><td>Why should you rename via IDE refactor tools instead of find-and-replace?</td><td>IDE rename understands scope and syntax, so it updates every real reference correctly without accidentally matching unrelated text or missing usages.</td></tr>
<tr><td>What does it usually mean when you can't find a specific name for a class, like Manager or Helper?</td><td>It's often a sign the class has too many unrelated responsibilities and should be split (Single Responsibility Principle).</td></tr>
<tr><td>What naming style is recommended for unit test method names?</td><td>Describe the expected behavior/scenario rather than implementation detail, e.g. shouldThrowWhenBalanceIsNegative().</td></tr>
<tr><td>How are naming conventions typically enforced across a team?</td><td>Via automated linters (e.g. Checkstyle naming modules) wired into CI, not manual review alone.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Naming decisions ripple outward from a single class into API contracts, database schemas, and log/metric names that
outlive any individual PR:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  Domain concept identified   ("a customer's outstanding balance")
        |
        v
  Class/field name chosen  --------->  becomes REST API field name (JSON)
        |                                     |
        v                                     v
  Becomes DB column name              Becomes metric/log field name
  (schema migrations needed              (dashboards, alerts, queries
   to rename later - expensive)           reference it by string)
</pre>
Because a name propagates into contracts other systems and teams depend on (API clients, dashboards, downstream
consumers), renaming after the fact is often far more expensive than getting it right during initial review - this is
why naming gets real scrutiny in design/API review, not just code review.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Two services expose nearly-identical fields named differently (userId vs customerId) causing integration bugs</td><td>No shared naming vocabulary/glossary across teams for the same domain concept</td><td>Compare OpenAPI specs side by side - same concept, different names, causing mapping bugs at the client</td><td>Establish a shared domain glossary; enforce consistent field naming in API review before publishing a spec</td></tr>
<tr><td>An on-call engineer misdiagnoses an incident because a boolean named "flag" is actually inverted logic</td><td>Non-descriptive name (flag, data, status) hides what true/false actually mean</td><td>Reading the variable's usages takes minutes instead of seconds because the name gives no hint of polarity</td><td>Rename to something unambiguous like isDisabled or hasExpired so intent is obvious without reading implementation</td></tr>
<tr><td>A refactor introduces a subtle bug because a rename missed a reflection-based or string-referenced usage</td><td>Renaming was done via find-and-replace instead of IDE-aware rename refactoring</td><td>grep for the old name after the "rename" still finds hits in config files, SQL, or reflective code</td><td>Use IDE rename-refactor tooling and separately grep non-code references (YAML/SQL/JSON) that tools can't see</td></tr>
<tr><td>New hires consistently guess the wrong method name and have to read source instead of using autocomplete</td><td>Inconsistent naming across the codebase (getUser() in one class, fetchUser() in another) for equivalent operations</td><td>Grep for common verb prefixes (get/fetch/retrieve/load) across services shows no agreed convention</td><td>Pick one verb per operation type and enforce via linter/style guide; document it as the team default</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Naming after implementation instead of purpose</strong> - <code>ArrayListOfUsers</code> instead of
<code>Users</code>; if the type changes to a Set later, the name lies. <br>
• <strong>Cute or joke names in production code</strong> - <code>doTheThing()</code>, <code>magicHappensHere()</code> -
funny once, confusing to every future reader who wasn't in on the joke. <br>
• <strong>Copy-pasting a name and forgetting to rename it</strong> - a method still called <code>calculateTax</code>
that was copy-pasted and repurposed to calculate a discount. <br>
• <strong>Negated booleans</strong> - <code>isNotValid</code>, <code>disableFlag == false</code> forces double-negative
reasoning at every call site. <br>
• <strong>Inconsistent pluralization/typing</strong> - a field named <code>employee</code> that's actually a
<code>List&lt;Employee&gt;</code>, misleading every caller about its shape.`
        }
    ]
};
