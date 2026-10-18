import { Topic } from '../coreJava';

export const refactoring: Topic = {
    id: 'refactoring',
    name: 'Refactoring',
    beginner: [
        {
            content: `<h3>What is Refactoring?</h3>
Refactoring means changing the internal structure of code to make it cleaner and easier to work with, WITHOUT
changing what it does from the outside. The behavior stays identical - only the design improves. <br><br>
Real-world analogy: reorganizing a messy garage - you're not throwing anything away or changing what's stored there,
just arranging it so you can find things faster next time.`
        },
        {
            content: `<h4>Refactoring vs Fixing a Bug vs Adding a Feature</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Activity</th><th>Changes behavior?</th></tr>
<tr><td>Refactoring</td><td>No - output is identical before and after</td></tr>
<tr><td>Bug fix</td><td>Yes - incorrect behavior becomes correct</td></tr>
<tr><td>New feature</td><td>Yes - new behavior is added</td></tr>
</table>
This is why refactoring should never be mixed into the same commit as a bug fix or feature - it makes the change
impossible to review cleanly and hard to isolate if something breaks.`
        },
        {
            content: `<h4>A simple example: extracting a method</h4>
One of the most common beginner refactorings is pulling a chunk of logic out into its own well-named method.`,
            codeExamples: [
                `// Before refactoring - one long method doing three things at once
public void processOrder(Order order) {
    double total = 0;
    for (Item item : order.getItems()) {
        total += item.getPrice() * item.getQuantity();
    }
    if (order.getCustomer().isPremium()) {
        total = total * 0.9;
    }
    order.setTotal(total);
    emailService.send(order.getCustomer().getEmail(), "Order total: " + total);
}`,
                `// After refactoring - same behavior, clearer structure
public void processOrder(Order order) {
    double total = calculateTotal(order);
    order.setTotal(total);
    notifyCustomer(order, total);
}

private double calculateTotal(Order order) {
    double subtotal = order.getItems().stream()
        .mapToDouble(item -> item.getPrice() * item.getQuantity())
        .sum();
    return order.getCustomer().isPremium() ? subtotal * 0.9 : subtotal;
}

private void notifyCustomer(Order order, double total) {
    emailService.send(order.getCustomer().getEmail(), "Order total: " + total);
}`
            ]
        },
        {
            content: `<h4>Common beginner-level refactorings</h4>
• <strong>Rename</strong> - give a variable/method a clearer name. <br>
• <strong>Extract Method</strong> - pull a block of code into its own named method. <br>
• <strong>Extract Variable</strong> - give a confusing expression a descriptive name. <br>
• <strong>Remove duplicate code</strong> - if the same logic appears twice, move it into one shared method.`
        },
        {
            content: `<h4>The safety net: tests</h4>
Refactoring is only safe if you can prove behavior didn't change. That's what automated tests are for - run them
before refactoring (they should pass), refactor, then run them again (they should still pass, unchanged). Refactoring
without tests is really just "hoping nothing broke."`
        }
    ],
    expert: [
        {
            content: `<h3>Refactoring as a Discipline, Not an Afterthought</h3>
Martin Fowler's "Refactoring: Improving the Design of Existing Code" formalized refactoring as a catalog of small,
behavior-preserving transformations (Extract Method, Inline Variable, Replace Conditional with Polymorphism, etc.),
each individually low-risk. Mature teams practice continuous refactoring - improving code incrementally as they touch
it (the "Boy Scout Rule": leave the code cleaner than you found it) - rather than scheduling rare, risky "big rewrite"
projects.`
        },
        {
            content: `<h3>Red-Green-Refactor</h3>
In test-driven workflows, refactoring is a distinct, disciplined step, not something bolted on:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  RED       Write a failing test for the behavior you want
    |
    v
  GREEN     Write the simplest code that makes it pass (ugly is OK)
    |
    v
  REFACTOR  Clean up the implementation - tests must stay green throughout
    |
    v
  (repeat)
</pre>
The key discipline: never refactor and add new behavior in the same step. Mixing them means that if a test fails,
you don't know whether the new behavior is wrong or the refactor broke something.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>Refactoring without a safety net</strong> - restructuring untested legacy code is high-risk; the standard
approach is to write "characterization tests" that pin down current behavior first, then refactor. <br>
• <strong>Big-bang rewrites</strong> - rewriting a whole module from scratch instead of incrementally refactoring
often takes far longer than estimated and risks losing subtle behavior the original handled (see Joel Spolsky's
"Things You Should Never Do" on full rewrites). <br>
• <strong>Gold-plating</strong> - refactoring code that isn't actually causing problems, burning time with no business
value. Refactor where it's needed (code you're actively changing, or code causing real pain), not everywhere. <br>
• <strong>Scope creep in a PR</strong> - "just a small refactor" ballooning into a large diff that's hard to review.`
        },
        {
            content: `<h3>Refactoring and Technical Debt</h3>
Refactoring is the primary tool for paying down technical debt (see the Technical Debt topic) - it's how a team
converts "code that works but is hard to change" into "code that works and is easy to change," without altering
observable behavior along the way. Teams that never refactor accumulate debt until even small features become
disproportionately expensive to add.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What defines refactoring, as opposed to a bug fix?</td><td>Refactoring changes the internal structure of code without changing its external behavior; a bug fix intentionally changes incorrect behavior to correct behavior.</td></tr>
<tr><td>Why shouldn't refactoring and feature work be mixed in the same commit/PR?</td><td>It makes the diff hard to review and, if something breaks, hard to tell whether the restructuring or the new behavior caused it.</td></tr>
<tr><td>What is the "Boy Scout Rule" in the context of refactoring?</td><td>Leave the code a little cleaner than you found it whenever you touch it, rather than scheduling rare large rewrites.</td></tr>
<tr><td>Why is refactoring risky without automated tests?</td><td>Without tests you can't verify behavior stayed identical - you're relying on manual inspection, which misses edge cases.</td></tr>
<tr><td>What is a "characterization test" and when is it used?</td><td>A test written to pin down existing (even undocumented) behavior of legacy code before refactoring it, so the refactor can be verified against a known baseline.</td></tr>
<tr><td>Name two common refactoring techniques from Fowler's catalog.</td><td>Extract Method and Replace Conditional with Polymorphism (others: Rename Variable, Inline Method, Extract Class).</td></tr>
<tr><td>What is the risk of a "big-bang rewrite" versus incremental refactoring?</td><td>Rewrites often take far longer than estimated and can silently drop subtle behaviors the original system handled correctly.</td></tr>
<tr><td>How does refactoring relate to technical debt?</td><td>Refactoring is the mechanism for paying down technical debt - improving structure without changing behavior so future changes are cheaper.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Refactoring fits into the delivery pipeline as a protected, test-gated step - never a change shipped on faith alone:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  Full test suite green (baseline)
        |
        v
  Apply one small refactoring  (Extract Method, Rename, Inline...)
        |
        v
  Run full test suite again  --fail-->  revert immediately, suite proved behavior changed
        |
       pass
        v
  Commit refactor SEPARATELY from any feature/bugfix commit
        |
        v
  CI re-verifies on the PR   --->   Code review confirms: "behavior identical, structure improved"
</pre>
The test suite is what turns refactoring from "hope nothing broke" into a provable, mechanical, low-risk operation -
without it, what looks like refactoring is really just risky rewriting.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A "harmless cleanup" PR breaks a production feature nobody had a test for</td><td>Refactoring untested legacy code with no safety net to verify behavior was preserved</td><td>Post-incident review shows zero test coverage existed for the code path that broke</td><td>Write characterization tests to pin down current behavior BEFORE refactoring that code, not after</td></tr>
<tr><td>A months-long "rewrite the module" project ships late and still has bugs the old code didn't</td><td>Team chose a big-bang rewrite instead of incremental refactoring of the existing, working system</td><td>Project timeline shows a single large release rather than a series of small, independently verifiable steps</td><td>Break the rewrite into small, behavior-preserving refactoring steps shipped incrementally behind tests</td></tr>
<tr><td>A bug fix PR is nearly impossible to review and a reviewer misses the actual logic change</td><td>Refactoring and the bug fix were mixed into the same commit/PR</td><td>Diff contains large-scale renames/restructuring alongside a small behavioral change, burying the real fix</td><td>Split into two PRs: one pure refactor (no behavior change), one focused bug fix reviewed on its own</td></tr>
<tr><td>Team burns a sprint "refactoring" a module that was never actually causing problems</td><td>Refactoring applied indiscriminately instead of targeted at code that's frequently changed or actively painful</td><td>The "refactored" module has low change frequency and no related complaints/incidents in its history</td><td>Prioritize refactoring by (how often the code changes) x (how much pain it currently causes), not by preference</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Refactoring without a test safety net</strong> - restructuring code you can't verify is behavior-preserving
is really just an unverified rewrite. <br>
• <strong>Mixing refactoring with feature work in one commit</strong> - makes it impossible to tell whether a broken
test is due to new behavior or the restructuring. <br>
• <strong>Big-bang rewrites</strong> - "let's just rewrite this whole thing" instead of small, incremental,
independently verifiable steps. <br>
• <strong>Gold-plating</strong> - refactoring stable, rarely-touched code purely for aesthetic preference, with no
business or maintenance payoff. <br>
• <strong>Refactoring under deadline pressure with tests skipped "to save time"</strong> - removes the exact
verification mechanism that makes refactoring safe in the first place.`
        }
    ]
};
