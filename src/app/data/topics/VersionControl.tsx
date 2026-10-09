import { Topic } from '../coreJava';

export const versionControl: Topic = {
    id: 'version-control',
    name: 'Version Control',
    beginner: [
        {
            content: `<h3>What is Version Control?</h3>
Version control is a system that records changes to files over time, so you can see the history, revert to an older
version, and let multiple people work on the same project without overwriting each other's work. Git is the
overwhelmingly dominant tool used today. <br><br>
Real-world analogy: it's like "track changes" in a Word document combined with an unlimited undo history and the
ability for several people to edit different sections simultaneously without losing anyone's edits.`
        },
        {
            content: `<h4>Core concepts</h4>
• <strong>Repository (repo)</strong> - the folder Git is tracking, including its full history. <br>
• <strong>Commit</strong> - a saved snapshot of changes, with a message describing what changed and why. <br>
• <strong>Branch</strong> - an independent line of work, so you can build a feature without disturbing the stable
main code. <br>
• <strong>Remote</strong> - a copy of the repo hosted elsewhere (e.g. GitHub, GitLab) that team members push to and
pull from.`
        },
        {
            content: `<h4>The everyday Git workflow</h4>
A typical day-to-day sequence of commands for making and saving a change:`,
            codeExamples: [
                `# 1. Get the latest code
git pull origin main

# 2. Create a branch for your change
git checkout -b feature/add-login-validation

# 3. Make your code changes, then check what changed
git status
git diff

# 4. Stage and commit the change with a clear message
git add src/LoginValidator.java
git commit -m "Add null-check validation to LoginValidator"

# 5. Push your branch to the remote and open a Pull Request
git push origin feature/add-login-validation`
            ]
        },
        {
            content: `<h4>Undoing mistakes</h4>
One of Git's biggest benefits over just emailing zip files around: almost every mistake is recoverable.`,
            codeExamples: [
                `# Discard uncommitted changes to a file
git checkout -- src/LoginValidator.java

# Undo the last commit but keep the changes staged (fix and recommit)
git reset --soft HEAD~1

# See the full history of a file to find when a bug was introduced
git log --oneline src/LoginValidator.java`
            ]
        },
        {
            content: `<h4>Writing a good commit message</h4>
A commit message should explain WHY a change was made, in the imperative mood, so <code>git log</code> reads like a
changelog: <br>
• Good: <code>"Fix NullPointerException when order has no items"</code> <br>
• Poor: <code>"fix"</code>, <code>"updates"</code>, <code>"asdf"</code> - tells a future reader nothing.`
        }
    ],
    expert: [
        {
            content: `<h3>Why Version Control is Non-Negotiable</h3>
Version control isn't just a backup mechanism - it's the foundation nearly every other engineering practice on this
list depends on: code review happens on a diff between commits, CI/CD triggers off commits/branches, release
management tags specific commits as releases, and root cause analysis often starts with <code>git blame</code> to
find when and why a line of code was introduced. Losing history means losing the ability to answer "when did this
break, and why?"`
        },
        {
            content: `<h3>Distributed vs Centralized Version Control</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Model</th><th>Example</th><th>Key trait</th></tr>
<tr><td>Centralized</td><td>SVN, Perforce</td><td>One central server holds the full history; clients hold only a working copy</td></tr>
<tr><td>Distributed</td><td>Git, Mercurial</td><td>Every clone holds the FULL history, so most operations (commit, diff, log, branch) work offline</td></tr>
</table>
Git's distributed model is why branching is cheap and instantaneous (it's just a pointer to a commit, not a full file
copy) - this cheapness is what makes feature branches and branching strategies (see Branching Strategies) practical
at scale.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>Committing secrets</strong> - API keys/passwords committed to history remain recoverable even after
"deleting" the file in a later commit; they must be scrubbed from history entirely (and rotated) if leaked. <br>
• <strong>Giant, unfocused commits</strong> - a commit touching 40 unrelated files is nearly impossible to review or
revert cleanly; commits should be small and logically atomic. <br>
• <strong>Force-pushing shared branches</strong> - <code>git push --force</code> on a branch others are working from
rewrites history out from under them; use <code>--force-with-lease</code> and only on your own feature branches. <br>
• <strong>Vague commit messages</strong> - makes <code>git blame</code>/<code>git log</code> useless for root cause
analysis months later. <br>
• <strong>Never resolving merge conflicts carefully</strong> - blindly accepting "theirs" or "ours" can silently
discard someone's work.`
        },
        {
            content: `<h3>Merge Strategies</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
git merge feature-branch
    -> creates a merge commit, preserves full branch history (noisy but complete)

git merge --squash feature-branch
    -> combines all feature commits into one clean commit on main

git rebase main   (run from feature-branch)
    -> replays feature commits on top of latest main, linear history (no merge commit)
    -> NEVER rebase a branch other people are also committing to - it rewrites commit hashes
</pre>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between git fetch and git pull?</td><td>git fetch downloads remote changes without merging them into your local branch; git pull is fetch + merge (or rebase) in one step.</td></tr>
<tr><td>What is the difference between distributed and centralized version control?</td><td>Distributed (Git) gives every clone the full history so most operations work offline; centralized (SVN) requires a connection to a central server for history-based operations.</td></tr>
<tr><td>Why is a Git branch considered "cheap" to create?</td><td>A branch is just a lightweight pointer to a commit, not a copy of the whole codebase, so creating one is nearly instantaneous.</td></tr>
<tr><td>What's the danger of force-pushing to a shared branch?</td><td>It rewrites history that others may have already pulled and built on, potentially discarding their commits or causing painful conflicts.</td></tr>
<tr><td>How do you remove a secret that was accidentally committed?</td><td>Deleting it in a new commit isn't enough since it's still in history - you must rewrite history (e.g. git filter-repo/BFG) to purge it and rotate the leaked credential.</td></tr>
<tr><td>What's the difference between merge and rebase?</td><td>Merge creates a new commit joining two histories (preserves branch structure); rebase replays commits onto a new base for a linear history, but rewrites commit hashes.</td></tr>
<tr><td>Why should commit messages explain "why" rather than just "what"?</td><td>The diff already shows what changed; the message's value is context a diff can't provide - useful later for code archaeology and root cause analysis.</td></tr>
<tr><td>What command would you use to find which commit introduced a specific line of buggy code?</td><td>git blame to find the commit touching that line, often combined with git log -p or git bisect to narrow down when a regression was introduced.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Version control is the trigger at the start of nearly every automated engineering process - almost nothing else in
the pipeline can start without a commit landing somewhere:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  git commit  (local snapshot, message explains WHY)
        |
        v
  git push  (branch appears on remote: GitHub/GitLab)
        |
        v
  CI triggers automatically  (build, test, lint, security scan)
        |
        v
  PR opened  --->  Code review (diff between commits)
        |
        v
  Merge to main  --->  CD pipeline deploys the exact merged commit
        |
        v
  git tag v2.3.0   (marks precisely which commit is "in production")
</pre>
Every downstream practice - CI, code review, release management, root cause analysis via git blame/bisect - operates
on top of the commit history, which is why a clean, honest history isn't a nicety, it's load-bearing infrastructure.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>An API key is found exposed and actively used by an attacker weeks after "deleting" it from the repo</td><td>A secret was committed, then removed in a later commit - but it still exists in full in git history</td><td>git log -p on the file shows the secret in an earlier commit even though the current file looks clean</td><td>Rewrite history to purge it (git filter-repo/BFG) AND rotate the credential immediately - deletion in a new commit alone is not enough</td></tr>
<tr><td>A teammate's commits vanish overnight and nobody can find their afternoon of work</td><td>Someone force-pushed over a shared branch, rewriting history other people had already pulled from</td><td>reflog on the affected machine shows commits that no longer exist on the remote branch</td><td>Use --force-with-lease instead of --force, and only ever force-push branches that are exclusively yours</td></tr>
<tr><td>Root cause analysis for a regression takes hours instead of minutes</td><td>Commit messages are all "fix", "wip", "updates" with no context on why changes were made</td><td>git log --oneline on the affected file is uninformative; nobody can tell intent from history alone</td><td>Enforce descriptive, imperative-mood commit messages (possibly via commit-msg hook/lint) explaining why, not just what</td></tr>
<tr><td>A merge silently drops a bug fix that had already been reviewed and approved</td><td>A conflict was resolved by blindly accepting "ours" or "theirs" instead of manually reconciling both changes</td><td>git log shows the fix commit exists, but the merge commit's resulting file doesn't contain its change</td><td>Resolve conflicts manually, reviewing both sides' intent; treat merge commits themselves as reviewable, not automatic</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Committing secrets</strong> - API keys/passwords land in history and remain recoverable long after the file
"looks" clean. <br>
• <strong>Giant, unfocused commits</strong> - dozens of unrelated files in one commit make review and revert nearly
impossible. <br>
• <strong>Force-pushing shared branches</strong> - silently rewrites history teammates have already built on. <br>
• <strong>Vague commit messages</strong> ("fix", "wip", "asdf") - destroys the value of git blame/log for future
debugging and root cause analysis. <br>
• <strong>Rebasing branches other people are actively committing to</strong> - rewrites commit hashes out from under
collaborators, causing confusing duplicate-looking history.`
        }
    ]
};
