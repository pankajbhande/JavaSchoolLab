import { Topic } from '../coreJava';

export const developmentStage: Topic = {
    id: 'development-stage',
    name: 'Development',
    beginner: [
        {
            content: `<h3>What is the Development Stage?</h3>
This is the stage where developers actually write the code, turning the design documents into a working
application. <br><br>
Just like construction workers actually build the house once the architect's plan is ready, developers
write code following the HLD/LLD created in the design stage. <br><br>
Example: For an online shopping app, developers now write the actual Java/Spring Boot code for
"AddToCart", "Checkout", and "Payment" features based on the design documents.`
        },
        {
            content: `<h3>How Work is Divided</h3>
Large applications are broken into smaller tasks/modules and assigned to different developers or teams -
some work on the front-end (what the user sees), some on the back-end (server logic), and some on the
database layer. <br><br>
Example: One developer builds the login screen (front-end), another builds the authentication API
(back-end), and another sets up the user table (database).`
        },
        {
            content: `<h3>Coding Standards</h3>
Teams follow agreed-upon rules for naming variables, formatting code, and writing comments so that code
written by different developers looks consistent and is easy for anyone on the team to read later. <br><br>
Example: Everyone agrees to name Java classes in PascalCase (e.g. OrderService) and variables in
camelCase (e.g. totalAmount), so the codebase feels like it was written by one person.`
        },
        {
            content: `<h3>Version Control</h3>
Developers use tools like Git to save their code changes and work together without overwriting each
other's work. <br><br>
Example: A developer creates a new "feature branch" for the wishlist feature, writes code there, and
later merges it into the main codebase once it is reviewed - without disturbing other developers'
ongoing work.`
        },
        {
            content: `<h3>Code Review</h3>
Before code is added to the main project, another developer reviews it to catch mistakes, suggest
improvements, and make sure it follows the team's standards. <br><br>
Example: A senior developer reviews a junior developer's checkout code and points out that error
handling is missing when the payment fails.`
        }
    ],
    expert: [
        {
            content: `<h3>What Actually Happens at This Stage in a Real Org</h3>
Development is organized into sprints (in Agile teams), with developers picking up tickets from the
backlog, writing code, running local tests, and raising pull requests (PRs) for peer review before
merging. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Pick ticket from Sprint Backlog --> Create feature branch
   --> Write code + unit tests --> Self-test locally
   --> Raise Pull Request --> Peer Code Review --> Address comments
   --> Merge to main branch --> Ticket moved to "Done"</pre>`
        },
        {
            content: `<h3>Practices and Tooling</h3>
• <strong>Branching strategy</strong>: Git Flow, trunk-based development, or feature branching. <br>
• <strong>Static code analysis</strong>: SonarQube, ESLint/Checkstyle to catch code smells automatically. <br>
• <strong>Unit testing</strong>: JUnit/Mockito (Java), Jest (JS) written alongside the feature code, often
following TDD (Test-Driven Development). <br>
• <strong>Pair programming</strong>: two developers work together on complex or risky code. <br>
• <strong>IDE + linters</strong>: IntelliJ IDEA, VS Code with configured formatters to enforce consistency
automatically instead of manual review nitpicks. <br><br>
Tools commonly used: Git/GitHub/GitLab/Bitbucket for source control, Jira for task tracking, SonarQube
for code quality gates, Slack for team communication during blockers.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pitfall</th><th>Impact</th></tr>
<tr><td>Skipping unit tests to "save time"</td><td>Bugs surface later in QA/production, costing far more to fix</td></tr>
<tr><td>Huge pull requests with 1000+ lines changed</td><td>Reviewers can't review thoroughly, defects slip through</td></tr>
<tr><td>Ignoring design documents while coding</td><td>Implementation diverges from architecture, causing integration issues</td></tr>
<tr><td>Hardcoding configuration values (URLs, secrets)</td><td>Makes deployment across environments (dev/test/prod) error-prone and insecure</td></tr>
<tr><td>No code comments/documentation for complex logic</td><td>Future maintainers (or even original author) struggle to understand the code</td></tr>
</table>`
        },
        {
            content: `<h3>Sample Feature-Branch Git Workflow</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">$ git checkout -b feature/JIRA-231-wishlist
$ git add .
$ git commit -m "JIRA-231: add wishlist add/remove endpoints"
$ git push origin feature/JIRA-231-wishlist
# Open Pull Request -> reviewers approve -> merge to main
# CI pipeline automatically runs tests on the PR</pre>
Notice the commit message references the ticket ID (JIRA-231) - this traceability lets anyone later
trace a line of code back to the exact requirement/user story it implements.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the purpose of code review?</td><td>To catch bugs, enforce standards, share knowledge, and improve code quality before merging into the main branch</td></tr>
<tr><td>What is Test-Driven Development (TDD)?</td><td>A practice where developers write failing unit tests first, then write just enough code to make them pass</td></tr>
<tr><td>What is a feature branch and why use it?</td><td>An isolated Git branch for developing one feature, so ongoing work doesn't disturb the stable main branch</td></tr>
<tr><td>What does a static code analysis tool like SonarQube check for?</td><td>Code smells, duplication, security vulnerabilities, and adherence to coding standards, automatically on every commit/PR</td></tr>
<tr><td>Why should configuration values not be hardcoded?</td><td>Hardcoding breaks portability across environments and can leak secrets; use environment variables/config files instead</td></tr>
<tr><td>What is pair programming?</td><td>Two developers work together at one workstation - one writes code, the other reviews in real time - to reduce defects on complex work</td></tr>
<tr><td>How does development stage output feed into the next SDLC stage?</td><td>Completed, reviewed, and merged code becomes the input for the Testing stage where it's formally validated against requirements</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Development sits between design and build/test - every commit a developer makes is what the rest of the
pipeline downstream operates on. In a real org this stage is tightly wired into source control and CI so
that "written code" and "verified code" are only minutes apart. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">IDE (local coding + unit tests) --> Git push --> Pull Request
   --> CI triggers automatically (build + test + SonarQube)
   --> Peer review in GitHub/GitLab --> Merge to main
   --> Main branch becomes input to the Build Stage pipeline</pre>
Tooling around this stage (Git hosting, SonarQube, IDE linters) exists so that problems introduced during
development are caught within minutes, not discovered days later in a separate QA phase.`
        },
        {
            content: `<h3>Production Problems Caused by This Stage</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A production outage traces back to a null pointer exception in a rarely-hit code path</td><td>No unit tests were written for edge cases, only the happy path was manually clicked through</td><td>Check test coverage report for that class/method - it's near zero for error branches</td><td>Enforce minimum coverage gates in CI and require tests for error-handling paths before merge</td></tr>
<tr><td>A security breach exploits a hardcoded database password found in the repo</td><td>Developer hardcoded credentials directly in source code during development</td><td>Search git history - the secret is committed in plaintext, possibly even after being "removed" later</td><td>Move secrets to environment variables/secret managers (Vault, AWS Secrets Manager) and add secret-scanning to CI</td></tr>
<tr><td>A "simple" bug fix reintroduces a bug that was fixed six months ago</td><td>No regression/unit test was ever added to lock in the original fix</td><td>Check if the original fix commit added any test - it didn't</td><td>Make it a team norm that every bug fix ships with a regression test that fails without the fix</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>"Cowboy coding"</strong> - committing directly to the main branch without branches, PRs, or review. <br>
• <strong>Copy-paste driven development</strong> - duplicating logic across the codebase instead of extracting shared, tested utilities. <br>
• <strong>Rubber-stamp code reviews</strong> - reviewers approve without actually reading the diff, defeating the purpose of review. <br>
• <strong>Writing tests only to satisfy a coverage percentage</strong> rather than to verify real behavior - tests that assert nothing meaningful. <br>
• <strong>Long-lived feature branches</strong> that diverge from main for weeks, causing painful merge conflicts and integration surprises at the end.`
        }
    ]
};
