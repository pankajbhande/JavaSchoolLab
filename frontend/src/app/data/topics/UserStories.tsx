import { Topic } from '../coreJava';

export const userStories: Topic = {
    id: 'user-stories',
    name: 'User Stories',
    beginner: [
        {
            content: `<h3>What is a User Story?</h3>
A User Story is a short, simple description of a feature written from the perspective of the person who wants it, following the format: <br><br>

<strong>As a</strong> [type of user], <strong>I want</strong> [some goal] <strong>so that</strong> [some reason/benefit]. <br><br>

It captures the "who, what, and why" of a requirement in a way that's easy for everyone on the team to understand - not a technical spec.`
        },
        {
            content: `<h4>Sample User Story (e-commerce checkout)</h4>`,
            codeExamples: [
                `As a returning customer,
I want my saved shipping address to be pre-filled at checkout,
So that I can complete my purchase faster without re-typing my address.`
            ]
        },
        {
            content: `<h4>The "3 C's" of a User Story</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>C</th><th>Meaning</th></tr>
<tr><td>Card</td><td>The story is written on a small card (or ticket) - short by design</td></tr>
<tr><td>Conversation</td><td>Details are clarified through discussion with the Product Owner, not by writing an exhaustive spec upfront</td></tr>
<tr><td>Confirmation</td><td>Acceptance criteria confirm when the story is "done"</td></tr>
</table>`
        },
        {
            content: `<h4>User Story vs Task vs Epic</h4>
An <strong>Epic</strong> is a large body of work ("Redesign checkout flow") that is broken down into several <strong>User Stories</strong> ("As a customer, I want to apply a coupon..."), and each story is broken down into <strong>Tasks</strong> for the dev team ("Create coupon validation API endpoint"). Stories are the unit that Product Owners prioritize in the backlog; tasks are the unit developers estimate and complete.`
        }
    ],
    expert: [
        {
            content: `<h3>The INVEST Checklist</h3>
Good user stories are judged against the INVEST criteria: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">I - Independent   can be delivered without depending on another story
N - Negotiable     details are open to discussion, not a rigid contract
V - Valuable       delivers real value to a user or the business
E - Estimable      the team can size it (story points)
S - Small          fits within a single sprint
T - Testable       has clear acceptance criteria to verify "done"</pre>

A story that fails "Independent" or "Small" (e.g., "As a user, I want a fully redesigned checkout") should be split into smaller vertical slices before it enters a sprint.`
        },
        {
            content: `<h3>Splitting Large Stories (Vertical Slicing)</h3>
A common mistake is splitting stories horizontally by technical layer (frontend story, backend story, database story) - none of which delivers value alone. Instead, split vertically so each slice is independently shippable: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Epic: "Coupon codes at checkout"

BAD (horizontal split - nothing works until all 3 are done):
  - Story 1: Build coupon database table
  - Story 2: Build coupon API
  - Story 3: Build coupon UI field

GOOD (vertical slice - each delivers a working, demoable increment):
  - Story 1: Apply a single fixed-amount coupon (happy path end-to-end)
  - Story 2: Apply a percentage-based coupon
  - Story 3: Show error for expired/invalid coupon</pre>`
        },
        {
            content: `<h3>Common Pitfalls in Practice</h3>
• <strong>Writing stories as tasks</strong> - "Create CouponController.java" is implementation detail, not a user story; it belongs on the technical task list under the story. <br>
• <strong>Missing the "so that" clause</strong> - without the benefit/reason, teams lose the "why" and may over-engineer or misprioritize. <br>
• <strong>No acceptance criteria attached</strong> - a story without acceptance criteria is not ready for a sprint (fails the "Definition of Ready"). <br>
• <strong>Stories too big to finish in a sprint</strong> - carries over sprint after sprint, distorting velocity metrics; should be split. <br>
• <strong>Confusing persona with role</strong> - "As a user" is often too generic; specific personas ("As a first-time guest shopper" vs "As a loyalty-program member") surface very different needs.`
        },
        {
            content: `<h3>User Story Card in Practice (Jira/Azure DevOps style)</h3>`,
            codeExamples: [
                `Title: Apply coupon code at checkout

As a customer,
I want to enter a coupon code during checkout,
So that I receive a discount before payment.

Priority: High
Story Points: 5
Sprint: Sprint 14

Acceptance Criteria: (see "Acceptance Criteria" topic)
Linked Business Requirement: Reduce cart abandonment by 15%`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the standard format of a user story?</td><td>"As a [role], I want [goal], so that [benefit]."</td></tr>
<tr><td>What does INVEST stand for?</td><td>Independent, Negotiable, Valuable, Estimable, Small, Testable - criteria for a well-formed user story.</td></tr>
<tr><td>How is a user story different from a use case?</td><td>A user story is a short, conversational placeholder for a requirement; a use case is a detailed, step-by-step description of user-system interaction including alternate flows.</td></tr>
<tr><td>What is the relationship between an Epic, a Story, and a Task?</td><td>An Epic is a large body of work broken into Stories; each Story is broken into Tasks for implementation.</td></tr>
<tr><td>Why should stories be split vertically rather than horizontally?</td><td>Vertical slices deliver end-to-end, demoable value each sprint; horizontal (layer-based) splits leave nothing usable until all layers are done.</td></tr>
<tr><td>What are the "3 C's" of a user story?</td><td>Card, Conversation, Confirmation.</td></tr>
<tr><td>What makes a story ready for a sprint (Definition of Ready)?</td><td>It is small, has clear acceptance criteria, is estimated, and has no open blocking questions.</td></tr>
<tr><td>Who typically writes user stories?</td><td>Product Owner or Business Analyst, often collaboratively with the development team during backlog refinement.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
A user story is a mid-pipeline artifact - it doesn't originate raw stakeholder chatter, and it doesn't get executed directly by developers either. It's the translation layer in between: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Raw stakeholder ask (Slack/email):
  "Customers keep emailing asking why they can't save their card"
        |
        v
Refined into a story during backlog refinement:
  "As a returning customer, I want to save my card at checkout,
   so I don't have to re-enter it next time"
        |
        v
Acceptance criteria attached, story sized (5 points), marked "Ready"
        |
        v
Pulled into Sprint Backlog (Sprint 11)
        |
        v
Dev implements SavedCardService + UI field
        |
        v
QA verifies against acceptance criteria -> story moved to "Done"
        |
        v
Feature ships -> traced back in the RTM to the original ask</pre>

If a "story" skips the refinement step and goes straight from a raw ask into a sprint, it usually turns out to be underspecified mid-sprint - exactly the "not ready" failure mode.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Story carries over 4 sprints in a row, velocity looks terrible</td><td>Story was too large to begin with and was never split before entering the backlog</td><td>Check story points against team's typical single-sprint capacity</td><td>Split into vertical slices during refinement, before it's pulled into a sprint</td></tr>
<tr><td>Developer builds the feature, PO rejects it in review</td><td>Story had no acceptance criteria, so "done" was left to the developer's personal interpretation</td><td>Check whether the story had AC attached before development started</td><td>Enforce Definition of Ready: no story enters a sprint without acceptance criteria</td></tr>
<tr><td>Feature technically works but solves the wrong problem</td><td>Story was written as a technical task ("add caching layer") instead of from the user's actual need, losing the "so that" context</td><td>Check whether the story has a clear "so that" benefit tied to a real user goal</td><td>Rewrite from the user's perspective and validate the "so that" with the actual stakeholder before estimating</td></tr>
<tr><td>Two teams both build overlapping "profile edit" functionality</td><td>The same underlying need was captured as two separate stories by two different POs with no shared backlog visibility</td><td>Search backlog/epics for duplicate or overlapping story titles across teams</td><td>Consolidate under one epic with a single owning team before further stories are written</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Stories written by the developer after the fact</strong> to retroactively document what was already built - defeats the purpose of using stories to drive design conversation. <br>
• <strong>"As a user" for every story</strong> - genericizing the persona hides real differences in need between, say, a guest and a loyalty member. <br>
• <strong>Story titles that are really technical tasks</strong> - "Refactor OrderService" is engineering work, not a user story; it belongs on the tech-debt backlog. <br>
• <strong>Skipping the "Conversation" C</strong> - treating the written card as a complete contract instead of a placeholder for a discussion, leading to silent misunderstandings. <br>
• <strong>Never revisiting story size after estimation drifts</strong> - a story that turns out much bigger mid-sprint should be re-split and re-planned, not force-completed by cutting corners.`
        }
    ]
};
