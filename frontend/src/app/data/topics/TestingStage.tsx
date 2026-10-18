import { Topic } from '../coreJava';

export const testingStage: Topic = {
    id: 'testing-stage',
    name: 'Testing',
    beginner: [
        {
            content: `<h3>What is the Testing Stage?</h3>
Once developers finish writing the code, the testing stage checks whether the software actually works
correctly and matches what was asked for in the requirements. <br><br>
Just like a car goes through quality checks before leaving the factory, software goes through testing
before it reaches real users. <br><br>
Example: For a shopping app, testers check - does "Add to Cart" actually add the item? Does the payment
go through correctly? Does the app crash if you enter wrong card details?`
        },
        {
            content: `<h3>Who Does Testing?</h3>
• <strong>QA Engineers / Testers</strong> - manually or automatically verify the app behaves as expected. <br>
• <strong>Developers</strong> - also write and run unit tests for their own code. <br>
• <strong>End Users (in later stages)</strong> - participate in User Acceptance Testing to confirm the
software truly meets their needs. <br><br>
Example: A QA engineer tests the login page with correct password, wrong password, and blank fields to
see if the app responds correctly in each case.`
        },
        {
            content: `<h3>Types of Testing (Simple View)</h3>
• <strong>Manual Testing</strong> - a person clicks through the app checking each feature by hand. <br>
• <strong>Automated Testing</strong> - scripts/tools automatically test the app, useful for repeating the
same checks quickly every time code changes. <br>
• <strong>Bug Reporting</strong> - when something doesn't work, testers log a "bug" with steps to
reproduce it, so developers can fix it. <br><br>
Example: A tester finds that clicking "Checkout" with an empty cart crashes the app, logs it as a bug
with screenshots, and the developer fixes it.`
        },
        {
            content: `<h3>Levels of Testing</h3>
• <strong>Unit Testing</strong> - testing one small piece of code (like a single method) in isolation. <br>
• <strong>Integration Testing</strong> - testing whether different modules work correctly together. <br>
• <strong>System Testing</strong> - testing the whole application end-to-end. <br>
• <strong>User Acceptance Testing (UAT)</strong> - the client/end-users test the app to confirm it's ready
to go live. <br><br>
Example: Unit test checks the "calculateDiscount()" method alone; integration test checks that "Cart" and
"Payment" modules work together; UAT is the client trying out the whole app before approving launch.`
        },
        {
            content: `<h3>Why This Stage Matters</h3>
Testing catches mistakes before real users experience them. A bug found during testing is far cheaper and
safer to fix than a bug found after the software is live and being used by thousands of customers. <br><br>
Example: If a banking app's testing stage misses a bug where money can be transferred twice by double
clicking, this could cause a real financial loss once live - so testing every scenario carefully matters.`
        }
    ],
    expert: [
        {
            content: `<h3>What Actually Happens at This Stage in a Real Org</h3>
In mature engineering organizations, testing is not a separate phase that happens only after development
- it is woven throughout the lifecycle ("shift-left testing"), with automated tests running continuously
as code is written and merged. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Unit Tests (run on every commit)
   --> Integration Tests (run on every PR merge)
   --> Regression Test Suite (run in CI pipeline nightly/per-build)
   --> System / E2E Tests (run in staging environment)
   --> UAT (client/business signs off)
   --> Performance & Security Testing (before production release)</pre>`
        },
        {
            content: `<h3>Testing Types and Tooling Used in Industry</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Testing Type</th><th>Purpose</th><th>Common Tools</th></tr>
<tr><td>Unit Testing</td><td>Verify individual methods/classes</td><td>JUnit, Mockito, Jest</td></tr>
<tr><td>Integration Testing</td><td>Verify modules/services work together</td><td>Spring Test, Postman/Newman, TestContainers</td></tr>
<tr><td>Regression Testing</td><td>Ensure new changes don't break existing features</td><td>Selenium, Cypress, Playwright</td></tr>
<tr><td>Performance Testing</td><td>Check speed/scalability under load</td><td>JMeter, Gatling, k6</td></tr>
<tr><td>Security Testing</td><td>Find vulnerabilities</td><td>OWASP ZAP, Burp Suite, SonarQube</td></tr>
<tr><td>UAT</td><td>Business/client confirms readiness</td><td>Manual walkthroughs, staging environment demos</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pitfall</th><th>Impact</th></tr>
<tr><td>Testing only "happy path" scenarios</td><td>Real-world edge cases (bad input, network failure) break the app in production</td></tr>
<tr><td>No regression suite - manual retesting everything each release</td><td>Slow releases, higher chance of missing an old bug that resurfaced</td></tr>
<tr><td>Testers brought in only at the very end</td><td>Bugs found too late, causing rushed fixes and delayed release dates</td></tr>
<tr><td>Flaky automated tests ignored instead of fixed</td><td>Team loses trust in the test suite and starts ignoring real failures too</td></tr>
<tr><td>No environment parity (testing on setup very different from production)</td><td>"Works on QA, fails on prod" issues caused by config/data differences</td></tr>
</table>`
        },
        {
            content: `<h3>Sample Automated Test (JUnit)</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">@Test
void shouldApplyTenPercentDiscountForPremiumUser() {
    Order order = new Order(1000.0, UserType.PREMIUM);
    double finalAmount = discountService.calculate(order);
    assertEquals(900.0, finalAmount);
}</pre>
This unit test is executed automatically every time code is pushed, giving fast feedback long before
the change ever reaches a manual QA tester or staging environment.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between verification and validation?</td><td>Verification checks "are we building the product right" (matches design/spec); Validation checks "are we building the right product" (matches user needs)</td></tr>
<tr><td>What is regression testing?</td><td>Re-running existing tests after a code change to ensure previously working features weren't broken</td></tr>
<tr><td>What is the testing pyramid?</td><td>A strategy favoring many fast unit tests, fewer integration tests, and very few slow end-to-end/UI tests, for a good speed/confidence balance</td></tr>
<tr><td>What is UAT and who performs it?</td><td>User Acceptance Testing - performed by the client/business users to confirm the software meets real business needs before go-live</td></tr>
<tr><td>What is "shift-left testing"?</td><td>Moving testing earlier in the SDLC (writing tests alongside code) rather than only after development finishes</td></tr>
<tr><td>What is a flaky test?</td><td>A test that passes and fails inconsistently without code changes, usually due to timing/environment issues - it erodes trust in the test suite</td></tr>
<tr><td>What's the difference between smoke testing and sanity testing?</td><td>Smoke testing is a quick broad check that critical functions work after a new build; sanity testing is a narrow check that a specific bug fix/feature works correctly</td></tr>
<tr><td>Why is performance testing important before release?</td><td>It reveals how the system behaves under real-world load, catching bottlenecks before they impact actual users in production</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Testing is not a single gate before release - it is layered throughout the pipeline, from the developer's
laptop to a dedicated staging environment, with each layer catching different classes of problems. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Dev laptop: Unit tests (JUnit) run on save/commit
   --> CI pipeline: Unit + Integration tests run on every PR
   --> Staging environment: E2E/Regression suite (Selenium/Cypress) + Performance (JMeter)
   --> Security scan (OWASP ZAP) before promotion
   --> UAT sign-off by business --> Promoted to Production
   --> Production: synthetic monitoring keeps "testing" critical flows continuously</pre>
Notice testing doesn't stop at release - synthetic transaction monitoring in production is effectively
testing running continuously against the live system.`
        },
        {
            content: `<h3>Production Problems Caused by This Stage</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>App works fine in QA but crashes constantly for real users</td><td>QA environment doesn't mirror production data volume, config, or third-party integrations</td><td>Compare QA vs prod environment configs/data scale - they diverge significantly</td><td>Build a staging environment that mirrors production as closely as possible (data shape, scale, integrations)</td></tr>
<tr><td>A critical bug ships because "it passed all tests"</td><td>Test suite only covers happy-path scenarios, no negative/edge-case tests</td><td>Review test cases for that feature - no tests for invalid input, timeouts, or concurrent access</td><td>Add negative, boundary, and concurrency test cases as a mandatory part of the definition of done</td></tr>
<tr><td>The team stops trusting CI failures and merges anyway</td><td>Flaky tests fail intermittently for reasons unrelated to real bugs, and were never fixed</td><td>Check CI history - the same tests fail/pass randomly across unrelated commits</td><td>Quarantine and fix flaky tests immediately rather than tolerating them; treat CI red as always meaningful</td></tr>
<tr><td>System collapses on the one day of the year it gets 10x normal traffic (e.g. sale event)</td><td>No performance/load testing was done for peak-traffic scenarios</td><td>Check if load tests exist at all, and if they simulate realistic peak concurrency</td><td>Run load/stress tests simulating expected peak traffic well before any major event</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Testing bolted on at the end</strong> - QA only starts once development is "complete," leaving no time to fix what's found. <br>
• <strong>100% manual regression before every release</strong> - slow, expensive, and error-prone compared to automating repeatable checks. <br>
• <strong>Vanity coverage metrics</strong> - chasing a coverage percentage with shallow tests instead of meaningful assertions on real behavior. <br>
• <strong>No dedicated, production-like test environment</strong> - testing against a stale or drastically simplified environment gives false confidence. <br>
• <strong>Treating testers as a separate silo</strong> instead of embedding quality practices into the whole team's daily workflow.`
        }
    ]
};
