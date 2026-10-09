import { Topic } from '../coreJava';

export const acceptanceCriteria: Topic = {
    id: 'acceptance-criteria',
    name: 'Acceptance Criteria',
    beginner: [
        {
            content: `<h3>What is Acceptance Criteria?</h3>
Acceptance Criteria (AC) are the specific, testable conditions that a user story or requirement must satisfy to be considered "done" and accepted by the Product Owner. If a user story is the "what and why", acceptance criteria is "how we prove it works."`
        },
        {
            content: `<h4>Sample Acceptance Criteria - Given/When/Then Format (Gherkin)</h4>
This is the most common industry format, used with a matching user story: <br><br>
"As a customer, I want to apply a coupon code at checkout, so that I get a discount."`,
            codeExamples: [
                `Scenario 1: Valid coupon applied
Given I am at the checkout page with items in my cart
When I enter a valid, unexpired coupon code and click "Apply"
Then the order total is reduced by the coupon discount
And a confirmation message "Coupon applied" is shown

Scenario 2: Expired coupon
Given I am at the checkout page
When I enter an expired coupon code and click "Apply"
Then the system displays "This coupon has expired"
And the order total remains unchanged

Scenario 3: Coupon already used
Given I have already used my one-time coupon on a previous order
When I try to apply the same coupon again
Then the system displays "This coupon has already been used"`
            ]
        },
        {
            content: `<h4>Why Acceptance Criteria Matters</h4>
Without AC, "done" is subjective - the developer thinks it's done, but the Product Owner sees it differently, causing rework. AC removes ambiguity and gives QA a direct source for test cases. It is agreed BEFORE development starts, not after.`
        },
        {
            content: `<h4>Two Common Formats</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Format</th><th>Style</th><th>Best For</th></tr>
<tr><td>Given/When/Then (Gherkin)</td><td>Scenario-based, precondition -> action -> outcome</td><td>Behavior-driven development, automated testing</td></tr>
<tr><td>Rule-based checklist</td><td>Simple bullet list of pass/fail conditions</td><td>Simple stories, non-technical stakeholders</td></tr>
</table>`
        }
    ],
    expert: [
        {
            content: `<h3>Acceptance Criteria vs Definition of Done</h3>
These are often confused: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Acceptance Criteria</th><th>Definition of Done (DoD)</th></tr>
<tr><td>Specific to ONE user story</td><td>Applies to EVERY story on the team, universally</td></tr>
<tr><td>Functional correctness for that feature</td><td>Team-wide quality bar (code reviewed, unit tests written, no critical bugs, documentation updated)</td></tr>
<tr><td>Written by Product Owner / BA</td><td>Agreed once by the whole Scrum team</td></tr>
</table>
Both must be satisfied for a story to be truly complete - AC proves the feature is correct, DoD proves the engineering quality bar was met.`
        },
        {
            content: `<h3>Writing Testable AC - the BA's Discipline</h3>
Weak AC leads to weak test coverage. Compare: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Weak AC</th><th>Strong, Testable AC</th></tr>
<tr><td>"Coupon should work correctly"</td><td>"Given a valid coupon code, when applied, then discount is subtracted from subtotal before tax calculation"</td></tr>
<tr><td>"Error handling should be good"</td><td>"Given an invalid coupon code, when applied, then error message 'Invalid coupon code' displays within 1 second, order total unchanged"</td></tr>
</table>

Good AC always specifies: the exact trigger, the exact system response, and any boundary/edge condition (empty input, max length, concurrent use, expired state).`
        },
        {
            content: `<h3>Common Pitfalls in Practice</h3>
• <strong>AC written after development starts</strong> - defeats the purpose; AC should be agreed during backlog refinement, before the sprint. <br>
• <strong>Only happy-path scenarios covered</strong> - missing negative/edge cases (invalid input, network failure, concurrent access) causes production bugs. <br>
• <strong>AC that describes implementation, not behavior</strong> - "Then the CouponService.validate() method returns true" leaks internal design into a business-facing artifact. <br>
• <strong>Ambiguous outcome</strong> - "Then it should look nice" is not verifiable; specify exact expected behavior/output. <br>
• <strong>AC not reviewed by QA</strong> - QA should validate AC is testable and complete before the story is pulled into a sprint.`
        },
        {
            content: `<h3>Acceptance Criteria Drives Automated Testing (BDD)</h3>
In Behavior-Driven Development, Given/When/Then AC is written in a format tools like Cucumber, SpecFlow, or JBehave can execute directly as automated tests - closing the loop between requirement and verification: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Business Analyst writes:
  Given/When/Then scenario (plain English)
            |
            v
QA/Dev automates it with a BDD framework
            |
            v
Scenario runs as part of CI/CD pipeline on every build
            |
            v
Failing scenario = requirement not met = build fails</pre>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is acceptance criteria?</td><td>The specific, testable conditions a user story must meet to be considered complete and accepted.</td></tr>
<tr><td>What is the Given/When/Then format?</td><td>A Gherkin-style structure: Given a precondition, When an action occurs, Then an expected outcome results.</td></tr>
<tr><td>How is acceptance criteria different from Definition of Done?</td><td>AC is specific to one story's functional correctness; DoD is a team-wide quality checklist applied to every story.</td></tr>
<tr><td>Who writes acceptance criteria?</td><td>Typically the Product Owner or Business Analyst, often refined collaboratively with the dev/QA team.</td></tr>
<tr><td>When should acceptance criteria be finalized?</td><td>Before the story enters a sprint - during backlog refinement, as part of the Definition of Ready.</td></tr>
<tr><td>Why should AC avoid implementation details?</td><td>AC describes observable system behavior, not internal code structure - keeping it valid even if implementation changes.</td></tr>
<tr><td>What happens if only happy-path AC is written?</td><td>Edge cases and negative scenarios go untested, leading to production defects.</td></tr>
<tr><td>How does AC support automated testing?</td><td>Given/When/Then scenarios can be directly automated using BDD frameworks like Cucumber, tying requirements to CI/CD test runs.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Acceptance criteria is the hinge point where a business-facing requirement becomes an executable, automatable test artifact: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">User Story: "As a customer, I want to apply a coupon at checkout"
        |
        v
AC written during backlog refinement (Given/When/Then), BEFORE
development starts, reviewed by PO + QA + Dev
        |
        v
Story pulled into sprint -> Dev builds against the AC as the spec
        |
        v
QA/Dev automate the Given/When/Then scenarios in Cucumber/SpecFlow
        |
        v
Scenarios run on every CI build (regression safety net)
        |
        v
Failing scenario blocks the build -> requirement is "not met",
not just "a bug"</pre>

This is why AC quality directly determines automated test quality - weak AC produces weak, happy-path-only regression suites.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Feature passes every test but customer says "this isn't what I asked for"</td><td>AC was written by the developer after building the feature, describing what was built rather than what was needed</td><td>Check the AC's timestamp/history against the story's development start date</td><td>Enforce that AC is written and PO-approved during refinement, before the story is picked up</td></tr>
<tr><td>Invalid coupon crashes checkout in production</td><td>AC covered only the valid-coupon happy path; expired/invalid/reused scenarios were never written</td><td>Review the story's AC list for negative/edge-case scenarios</td><td>Require at least one negative-path AC scenario per story before it's marked Ready</td></tr>
<tr><td>Regression suite is green but a real bug ships anyway</td><td>AC described implementation details ("service returns true") instead of observable behavior, so the automated test didn't actually validate user-facing outcome</td><td>Read the Given/When/Then text - does "Then" describe a UI/business outcome or an internal method call?</td><td>Rewrite AC in terms of observable system behavior, not internal implementation</td></tr>
<tr><td>QA and Dev argue over whether a ticket is "done" or a "new bug"</td><td>Story never had explicit AC in the first place, so "done" was implicit and subjective</td><td>Check the ticket for an AC section at all</td><td>Block sprint entry for any story lacking written, PO-approved AC (Definition of Ready)</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>AC written after the feature is already built</strong> - turns it into a rubber stamp instead of a design tool that shapes development. <br>
• <strong>Only happy-path scenarios documented</strong> - leaves every negative/edge case as an undiscovered production bug waiting to happen. <br>
• <strong>AC that leaks implementation detail</strong> - locking the test to a specific internal method/class name, so it breaks on refactors that don't change behavior. <br>
• <strong>Vague, unverifiable outcomes</strong> - "Then it should work properly" gives QA nothing concrete to test against. <br>
• <strong>Confusing AC with Definition of Done</strong> - reusing the team-wide DoD checklist as if it were the feature-specific proof of correctness, missing the actual business scenario validation.`
        }
    ]
};
