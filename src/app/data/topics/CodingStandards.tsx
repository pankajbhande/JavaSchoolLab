import { Topic } from '../coreJava';

export const codingStandards: Topic = {
    id: 'coding-standards',
    name: 'Coding Standards',
    beginner: [
        {
            content: `<h3>What are Coding Standards?</h3>
Coding standards are an agreed-upon set of rules a team follows while writing code - things like how to format braces,
how to name variables, how much a line can indent, and how to structure a file. <br><br>
Think of it like a company dress code: everyone can still express their own style, but a shared baseline makes the
team look and work consistently. <br><br>
A real-world example: if two developers write the same class differently - one uses 2-space indentation with camelCase,
the other uses tabs with snake_case - the codebase becomes hard to read as a whole, even though both pieces of code
"work" individually.`
        },
        {
            content: `<h4>Why do teams enforce them?</h4>
• <strong>Readability</strong> - anyone on the team can open any file and understand it quickly. <br>
• <strong>Maintainability</strong> - future you (or a new hire) can safely modify old code. <br>
• <strong>Fewer bugs</strong> - many standards (like always using braces on if-statements) exist specifically to prevent
common mistakes. <br>
• <strong>Faster code reviews</strong> - reviewers focus on logic, not on arguing about spacing.`
        },
        {
            content: `<h4>A simple Java example</h4>
Compare these two snippets that do the exact same thing:`,
            codeExamples: [
                `// Without a coding standard - inconsistent, cramped, hard to scan
public class calc{
  public int Add(int a,int b){return a+b;}
  public int subtract(int A,int B)
  {
      return A-B;
  }
}`,
                `// With a coding standard applied consistently
public class Calculator {

    public int add(int a, int b) {
        return a + b;
    }

    public int subtract(int a, int b) {
        return a - b;
    }
}`
            ]
        },
        {
            content: `<h4>Common areas coding standards cover</h4>
• Indentation (spaces vs tabs, how many) <br>
• Brace placement (same line vs new line) <br>
• Maximum line length <br>
• File and package organization <br>
• Comment style (Javadoc for public APIs) <br>
• Import ordering, no wildcard imports <br><br>
Most teams don't invent these rules from scratch - they adopt a published guide such as Google's Java Style Guide
or Oracle's original Code Conventions for Java, and then tweak a few things to fit their needs.`
        },
        {
            content: `<h4>Tools that help</h4>
Humans forget rules; tools don't. Teams typically wire a formatter and a linter into their build so standards are
enforced automatically instead of relying on memory: <br>
• <strong>Checkstyle</strong> / <strong>SpotBugs</strong> - flag style and bug-pattern violations in Java. <br>
• <strong>Google Java Format</strong> / <strong>Spotless</strong> - auto-format code on save or on build. <br>
• IDE settings (IntelliJ/Eclipse code style profiles) shared across the team via a config file.`
        }
    ],
    expert: [
        {
            content: `<h3>Coding Standards in Real Engineering Orgs</h3>
At scale, coding standards stop being a style preference and become an engineering-velocity lever. Large orgs
(Google, Amazon, Netflix) publish an internal style guide and back it with automated enforcement in CI - a PR that
violates the standard simply cannot merge. This removes the debate from code review entirely: reviewers are freed
to discuss design and correctness, not brace placement. <br><br>
The standard usually lives in one canonical document (often a wiki page or a checked-in <code>.editorconfig</code> /
Checkstyle XML) so it's discoverable, versioned, and reviewable like any other artifact.`
        },
        {
            content: `<h3>Enforcement Pipeline</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
Developer writes code
        |
        v
  IDE auto-format on save  (fast feedback, near-zero cost)
        |
        v
  Pre-commit hook runs formatter + linter  (catches anything IDE missed)
        |
        v
  CI pipeline runs Checkstyle / SpotBugs / SonarQube  (hard gate, blocks merge)
        |
        v
  Code review focuses on logic & design, not formatting
</pre>
The earlier in this pipeline a violation is caught, the cheaper it is to fix - this is the same "shift-left" idea
used for testing and security.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>Bikeshedding</strong> - teams spend more time debating tabs-vs-spaces than they save from having a standard.
The fix is to pick a well-known guide (Google Style, Sun/Oracle conventions) instead of designing one from scratch. <br>
• <strong>Standard exists but isn't automated</strong> - a document nobody enforces decays within weeks; automated
tooling is what actually keeps a codebase consistent. <br>
• <strong>One-size-fits-all across very different codebases</strong> - a legacy module and a new microservice may
reasonably need slightly different rules; most linters support per-directory overrides for this reason. <br>
• <strong>Reformatting an entire legacy file in one PR</strong> - this destroys the git blame history and creates a huge,
unreviewable diff; large-scale reformatting should be its own dedicated, clearly-labeled commit.`
        },
        {
            content: `<h3>Coding Standards vs Related Concepts</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Concept</th><th>Focus</th></tr>
<tr><td>Coding Standards</td><td>Consistent style/formatting - how code looks</td></tr>
<tr><td>Naming Conventions</td><td>A subset of coding standards focused specifically on names</td></tr>
<tr><td>Code Review</td><td>Human judgment on design/logic quality - what code does and why</td></tr>
<tr><td>Static Analysis (SonarQube)</td><td>Automated detection of bugs, vulnerabilities, and code smells - not just style</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Why do coding standards matter on a team, even if code "works" without them?</td><td>They make code readable and maintainable by anyone on the team, reduce review friction, and prevent classes of bugs through agreed-upon safe patterns.</td></tr>
<tr><td>How do you enforce coding standards without relying on manual review?</td><td>Wire a formatter (e.g. Google Java Format) and a static analyzer (Checkstyle/SpotBugs/SonarQube) into pre-commit hooks and CI so violations block the build automatically.</td></tr>
<tr><td>What's the difference between a linter and a formatter?</td><td>A formatter rewrites code to match style rules automatically (indentation, spacing); a linter flags issues (some stylistic, some correctness-related) that often require a human decision.</td></tr>
<tr><td>Should you reformat an entire legacy file while fixing an unrelated bug?</td><td>No - keep the fix and any large-scale reformatting in separate commits/PRs so the diff stays reviewable and git blame history is preserved.</td></tr>
<tr><td>Name two widely adopted Java style guides.</td><td>Google Java Style Guide and Oracle's (Sun's) original Code Conventions for the Java Programming Language.</td></tr>
<tr><td>What is "bikeshedding" in the context of coding standards?</td><td>Spending disproportionate time debating trivial style choices (tabs vs spaces) instead of adopting an existing standard and moving on.</td></tr>
<tr><td>Where should coding standards be documented for a team?</td><td>In a checked-in, versioned config (Checkstyle XML, .editorconfig) plus a short reference doc - not just tribal knowledge.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Coding standards enforcement sits at multiple checkpoints in a real delivery pipeline - each one cheaper to fail at than the last:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  IDE (save)  --format on save-->  Pre-commit hook  --lint+format-->  git push
        |                                                                 |
        v                                                                 v
  Cheapest to fix (never leaves the editor)                    CI pipeline (Checkstyle/
                                                                  SpotBugs/SonarQube gate)
                                                                         |
                                                                         v
                                                              PR blocked from merge on
                                                              violation - human review
                                                              never sees style noise
</pre>
Notice the standard is never enforced by a human reading a diff line-by-line - by the time a reviewer opens the PR,
style is already guaranteed clean, so their attention is 100% available for logic and design.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Code reviews take days and mostly argue about formatting</td><td>No automated formatter/linter wired into CI, so style enforcement falls on humans</td><td>Check PR comment history - if most comments are about spacing/braces rather than logic, tooling is missing</td><td>Add a formatter (Google Java Format/Spotless) as a pre-commit hook and a linter as a CI gate</td></tr>
<tr><td>A "one-off" utility class silently diverges from the rest of the codebase's style</td><td>Standard exists only as a wiki doc, never automated, so it decays as new contributors join without reading it</td><td>Run the linter against the whole repo - violations cluster in files added after the doc was last actively enforced</td><td>Convert the doc into a checked-in Checkstyle/ESLint-equivalent config that runs in CI, not just as guidance</td></tr>
<tr><td>A routine bug-fix PR touches 800 lines instead of 5</td><td>Someone ran an auto-formatter across an entire legacy file in the same commit as the fix</td><td>git diff shows whitespace-only changes mixed with the real fix; git blame is now useless for that file</td><td>Revert, then land the formatting pass as its own dedicated, clearly-labeled commit/PR separate from the fix</td></tr>
<tr><td>New microservice team keeps re-litigating tabs vs spaces every sprint</td><td>Team tried to invent its own style guide from scratch instead of adopting a published one</td><td>No canonical reference document exists; every disagreement has no tiebreaker to point to</td><td>Adopt Google Java Style Guide (or similar) wholesale, deviate only where there's a strong documented reason</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Style debates in code review comments</strong> - if a human is typing "please use 4 spaces here," that's a
tooling gap, not a review win. <br>
• <strong>A style guide with no enforcement teeth</strong> - a document nobody's build ever checks against is
functionally optional and will drift within weeks. <br>
• <strong>Inventing a bespoke house style</strong> - reinventing rules that Google/Sun already solved wastes time and
produces something new hires have never seen before. <br>
• <strong>Silent mass-reformatting</strong> - running a formatter across an entire legacy codebase in one PR, burying
a real change inside thousands of whitespace diffs and destroying git blame. <br>
• <strong>Standards frozen in time</strong> - never revisiting the config as the language evolves (e.g. new Java
syntax the linter doesn't yet understand and flags incorrectly).`
        }
    ]
};
