import { Topic } from '../coreJava';

export const requirementStage: Topic = {
    id: 'requirement-stage',
    name: 'Requirement',
    beginner: [
        {
            content: `<h3>What is the Requirement Stage?</h3>
This is the very first stage of the Software Development Lifecycle. Here the team figures out
<strong>what</strong> needs to be built - before anyone writes a single line of code or a design diagram. <br><br>
Think of it like an architect meeting a client before drawing house plans - the architect first asks
"how many rooms, what budget, what style" before sketching anything. <br><br>
Real-world example: A retail client wants an online shopping app. In this stage the business analyst
talks to the client and end-users to find out: Should users be able to pay by UPI? Should there be a
wishlist? Should it support multiple languages? All these answers become the "requirements".`
        },
        {
            content: `<h3>Who is Involved?</h3>
• <strong>Client / Product Owner</strong> - person who wants the software built and knows the business need. <br>
• <strong>Business Analyst (BA)</strong> - talks to the client, writes down requirements clearly. <br>
• <strong>Project Manager</strong> - plans timeline and cost based on requirements. <br>
• <strong>End Users</strong> - sometimes interviewed directly to understand real day-to-day pain points. <br><br>
Example: For a hospital management system, the BA interviews doctors, receptionists, and patients to know
what each of them actually needs from the software.`
        },
        {
            content: `<h3>Functional vs Non-Functional Requirements</h3>
• <strong>Functional Requirement</strong> - what the system should DO. Example: "User should be able to
reset password using email OTP." <br>
• <strong>Non-Functional Requirement</strong> - HOW WELL the system should behave. Example: "The login
page must load within 2 seconds" or "The system must support 10,000 users at the same time." <br><br>
Beginner tip: Functional = features. Non-functional = quality attributes (speed, security, usability).`
        },
        {
            content: `<h3>How Requirements are Documented</h3>
Once gathered, requirements are written down in documents so nothing is forgotten or misunderstood: <br>
• <strong>BRD (Business Requirement Document)</strong> - high-level business goals. <br>
• <strong>SRS (Software Requirement Specification)</strong> - detailed, technical version used by developers. <br>
• <strong>User Stories</strong> - short simple sentences like "As a customer, I want to track my order,
so that I know when it will arrive." <br><br>
Example: In an Agile project, instead of a huge SRS document, the team simply keeps a list of user stories
in a tool like Jira.`
        },
        {
            content: `<h3>Why This Stage Matters</h3>
If requirements are wrong or incomplete, everything built afterward (design, code, tests) is built on a
weak foundation - it is far cheaper to fix a misunderstanding here than after the product is already coded. <br><br>
Real example: If the client actually wanted a "cash on delivery" option but nobody asked, the whole
payment module may need to be redesigned later, costing much more time and money.`
        }
    ],
    expert: [
        {
            content: `<h3>What Actually Happens at This Stage in a Real Org</h3>
In a professional engineering organization, the requirement stage is rarely a single meeting - it is an
iterative process spanning discovery workshops, stakeholder interviews, competitor analysis, and
prototyping. <br><br>
Typical flow: <br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Stakeholder Kickoff --> Discovery Workshops --> Requirement Elicitation
      --> Draft BRD/SRS --> Review & Sign-off --> Backlog Creation (Jira/Azure DevOps)</pre>
The Business Analyst or Product Manager owns this stage, but Tech Leads are usually pulled in early to
flag technical feasibility ("can we actually build this within budget/timeline?").`
        },
        {
            content: `<h3>Elicitation Techniques Used</h3>
• Stakeholder interviews and workshops <br>
• Surveys and questionnaires for large user bases <br>
• Competitor/market analysis <br>
• Prototyping / wireframes to validate understanding before committing to detailed specs <br>
• Use-case and user-story mapping <br><br>
Tooling commonly used: Confluence / Notion for documentation, Jira / Azure DevOps for backlog and
user stories, Figma for early low-fidelity mockups shown to stakeholders during requirement discussions.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pitfall</th><th>Impact</th></tr>
<tr><td>Gathering requirements only from one stakeholder</td><td>Missing perspectives lead to incomplete or conflicting features later</td></tr>
<tr><td>Ambiguous language ("system should be fast")</td><td>Not testable - no measurable acceptance criteria</td></tr>
<tr><td>No sign-off / approval process</td><td>Scope creep - client keeps adding "small" changes without formal tracking</td></tr>
<tr><td>Skipping non-functional requirements</td><td>Security, performance, and scalability issues discovered too late</td></tr>
<tr><td>Requirements frozen too early in Agile projects</td><td>Team can't adapt to changing business needs</td></tr>
</table>`
        },
        {
            content: `<h3>Requirement Traceability</h3>
Mature teams maintain a <strong>Requirement Traceability Matrix (RTM)</strong> that maps every requirement
to its design element, code module, and test case - so nothing gets lost and every requirement is
provably tested before release. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">REQ-101 "User can reset password via OTP"
   |--> Design: Password Reset Flow Diagram
   |--> Code: AuthController.resetPassword()
   |--> Test Case: TC-045 Verify OTP based reset</pre>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between BRD and SRS?</td><td>BRD captures high-level business goals for stakeholders; SRS is the detailed technical specification developers use to build the system</td></tr>
<tr><td>What is a functional vs non-functional requirement?</td><td>Functional describes what the system does (features); non-functional describes quality attributes like performance, security, scalability</td></tr>
<tr><td>What is requirement elicitation?</td><td>The process of gathering requirements through interviews, workshops, surveys, and observation</td></tr>
<tr><td>What is a Requirement Traceability Matrix (RTM)?</td><td>A document that links each requirement to its design, code, and test case to ensure full coverage</td></tr>
<tr><td>What is scope creep?</td><td>Uncontrolled addition of new requirements after the project scope was already agreed, without formal change management</td></tr>
<tr><td>How are requirements handled differently in Agile vs Waterfall?</td><td>Waterfall freezes requirements upfront in a full SRS; Agile captures them as evolving user stories in a backlog, refined every sprint</td></tr>
<tr><td>What makes a requirement "testable"?</td><td>It must be specific and measurable, e.g. "page loads in under 2 seconds" instead of "page should be fast"</td></tr>
<tr><td>Who typically signs off on requirements?</td><td>The client/product owner along with key stakeholders, formally approving the SRS/backlog before development starts</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Requirements don't live in isolation - they are the input that every later stage (and every tool that
supports it) is built to trace back to. In a real delivery pipeline the requirement stage feeds directly
into the backlog that CI/CD, testing, and even monitoring dashboards are ultimately measured against. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Stakeholders --> BA/PM (Confluence, Notion) --> SRS / User Stories
      --> Backlog (Jira/Azure DevOps) --> Sprint Planning
      --> Design & Development pull tickets from this backlog
      --> QA writes test cases traced back to REQ-IDs
      --> Product metrics/monitoring later validate the ORIGINAL business goal was met</pre>
The tooling around this stage (Jira, Confluence, RTM spreadsheets) exists specifically so every downstream
artifact - a design doc, a commit, a test case, even a production dashboard - can be traced back to a
single originating requirement.`
        },
        {
            content: `<h3>Production Problems Caused by This Stage</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A "finished" feature gets rejected by the client at UAT, weeks before launch</td><td>Requirement was written ambiguously and no one confirmed the actual interpretation with the client</td><td>Compare the SRS wording against what was actually built - vague phrases like "should be fast" reveal the gap</td><td>Rewrite requirements as specific, testable acceptance criteria and get formal sign-off before development starts</td></tr>
<tr><td>Production incident: system falls over under real load within days of launch</td><td>Non-functional requirements (expected concurrent users, response time) were never captured</td><td>Check the SRS/BRD for any performance/scalability numbers - usually absent entirely</td><td>Add explicit NFRs (e.g. "must support 10,000 concurrent users at &lt;2s response") and design/test against them</td></tr>
<tr><td>Legal/compliance flags a feature months after release as violating a regulation</td><td>Compliance and security stakeholders were never included in requirement gathering</td><td>Trace back who signed off on the original SRS - compliance team's name is missing</td><td>Make compliance/security a mandatory reviewer in the requirement sign-off process for regulated domains</td></tr>
<tr><td>Endless mid-sprint scope changes derail every release date</td><td>No formal change-request process; new "requirements" get added informally via chat/email</td><td>Look at the backlog churn - stories keep changing after sprint commitment with no tracked approval</td><td>Introduce a lightweight but mandatory change-control process so new asks are logged, impact-assessed, and approved before entering a sprint</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>"Requirements by hallway conversation"</strong> - decisions made verbally and never written down, so nobody can verify what was actually agreed. <br>
• <strong>Gold-plating</strong> - developers or BAs add "nice to have" features nobody asked for, inflating scope and timeline. <br>
• <strong>Copy-pasting requirements from a similar past project</strong> without validating they actually apply to this client's context. <br>
• <strong>Treating the SRS as a one-time document</strong> instead of a living artifact that gets updated (with versioning) as understanding evolves. <br>
• <strong>No traceability from requirement to test case</strong> - so at release time nobody can prove every requirement was actually verified.`
        }
    ]
};
