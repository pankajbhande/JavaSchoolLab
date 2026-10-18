import { Topic } from '../coreJava';

export const buildStage: Topic = {
    id: 'build-stage',
    name: 'Build',
    beginner: [
        {
            content: `<h3>What is the Build Stage?</h3>
The build stage takes all the source code developers wrote and turns it into a runnable software package
- like compiling Java files into a .jar file, or bundling website files into a deployable package. <br><br>
Think of it like baking a cake - you have all the ingredients (source code files), and "building" mixes
and bakes them into one finished cake (a runnable application) that can actually be served. <br><br>
Example: A Java project's dozens of .java files get compiled and packaged into one single "app.jar" file
that can then be run on a server.`
        },
        {
            content: `<h3>What Happens During a Build</h3>
• Compiling source code into machine/byte code <br>
• Combining all required libraries (dependencies) the code depends on <br>
• Running quick automated checks (like unit tests) to catch obvious errors early <br>
• Packaging everything into one deployable unit (jar, war, zip, Docker image, etc.) <br><br>
Example: Maven or Gradle (Java build tools) download required libraries like Spring Boot, compile all
code, run unit tests, and produce a single "myapp.jar" file, all with one command.`
        },
        {
            content: `<h3>Build Tools</h3>
• <strong>Maven / Gradle</strong> - for Java projects. <br>
• <strong>npm / webpack</strong> - for JavaScript/React projects. <br>
• <strong>Make / CMake</strong> - for C/C++ projects. <br><br>
Example: Running "mvn package" in a Java project compiles the code, runs tests, and creates the final
.jar file automatically - a task that would be very error-prone to do by hand.`
        },
        {
            content: `<h3>Continuous Integration (CI)</h3>
Instead of building manually, teams set up an automated system that builds the code every time someone
pushes a change - catching build-breaking mistakes almost immediately. <br><br>
Example: A developer pushes code to GitHub; within a couple of minutes, an automated tool (like GitHub
Actions or Jenkins) builds the project and reports whether it succeeded or failed, right in the pull
request.`
        },
        {
            content: `<h3>Why This Stage Matters</h3>
If the build fails, nothing can move forward - it can't be tested or deployed. Catching build failures
early (right when code is pushed) saves the whole team from wasting time debugging a broken build later. <br><br>
Example: If a developer forgets to add a needed library, the build fails immediately with a clear error,
letting them fix it in minutes instead of the problem being discovered days later during deployment.`
        }
    ],
    expert: [
        {
            content: `<h3>What Actually Happens at This Stage in a Real Org</h3>
The build stage is the entry point of a CI/CD pipeline. Every commit/PR triggers an automated pipeline
that compiles code, runs fast tests, performs static analysis, and produces a versioned, immutable
artifact ready for deployment. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Code Push --> CI Server Triggered --> Fetch dependencies
   --> Compile --> Run unit tests --> Static code analysis (SonarQube)
   --> Package artifact (jar/Docker image) --> Push to Artifact Repository
   --> Notify team of pass/fail</pre>`
        },
        {
            content: `<h3>Sample CI Pipeline Snippet</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6"># .github/workflows/build.yml
name: Build
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
      - name: Build with Maven
        run: mvn -B clean package
      - name: Run unit tests
        run: mvn test
      - name: Build Docker image
        run: docker build -t myapp:$&#123;&#123; github.sha &#125;&#125; .</pre>
Every push automatically triggers this pipeline - if any step fails, the team is alerted immediately and
the broken commit never proceeds to later stages.`
        },
        {
            content: `<h3>Key Concepts and Tooling</h3>
• <strong>Artifact Repository</strong>: Nexus, JFrog Artifactory, Docker Hub - stores versioned build
outputs so any past version can be redeployed. <br>
• <strong>Build reproducibility</strong>: the same source code + same dependency versions should always
produce the same artifact ("hermetic builds"). <br>
• <strong>Dependency management</strong>: pinning exact library versions to avoid "works on my machine"
issues. <br>
• <strong>Build caching</strong>: reusing previously compiled results to make CI builds much faster. <br>
• <strong>Semantic versioning</strong>: tagging builds (e.g. 2.3.1) so teams can track exactly what changed.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pitfall</th><th>Impact</th></tr>
<tr><td>"Works on my machine" builds (no CI, manual local builds)</td><td>Inconsistent artifacts across environments cause hard-to-diagnose production issues</td></tr>
<tr><td>Unpinned dependency versions</td><td>A build that worked yesterday can silently break today when a library auto-updates</td></tr>
<tr><td>Slow, unoptimized build pipelines</td><td>Developers wait a long time for feedback, slowing down the whole team</td></tr>
<tr><td>Ignoring failed builds ("it'll pass eventually")</td><td>Broken main branch blocks everyone, and real failures get lost in the noise</td></tr>
<tr><td>Not versioning/tagging build artifacts</td><td>Impossible to know exactly what code is running in a given environment, or roll back safely</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Continuous Integration (CI)?</td><td>The practice of automatically building and testing code every time it's pushed, to catch integration issues early</td></tr>
<tr><td>What is the difference between a build tool and a CI server?</td><td>A build tool (Maven/Gradle) compiles and packages code; a CI server (Jenkins/GitHub Actions) automatically triggers and orchestrates that build on every change</td></tr>
<tr><td>What is a build artifact?</td><td>The packaged, deployable output of a build - e.g. a .jar, .war, or Docker image - stored in an artifact repository</td></tr>
<tr><td>Why should builds be reproducible?</td><td>So the same source and dependencies always produce an identical artifact, avoiding "it worked before" mysteries</td></tr>
<tr><td>What is the purpose of running unit tests during the build stage?</td><td>To fail fast - catching obviously broken code before it wastes time in later, slower testing stages</td></tr>
<tr><td>What is an artifact repository and why use one?</td><td>A storage system (Nexus, Artifactory) that keeps versioned build outputs, enabling traceability and easy rollback to any prior version</td></tr>
<tr><td>What does "fail fast" mean in a build pipeline?</td><td>Ordering pipeline steps so cheap/quick checks (compile, unit test) run before expensive ones, so failures are caught with minimal wasted time</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
The build stage is the narrow bridge between "source code" and "something that can actually be deployed."
Everything upstream (dev) produces source; everything downstream (deployment, monitoring) consumes the
versioned artifact this stage produces - nothing later ever touches raw source code again. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Source (Git) --> CI Server (Jenkins/GitHub Actions/GitLab CI)
   --> Compile + Unit Test + Static Analysis (SonarQube)
   --> Package (jar/Docker image) --> Artifact Repository (Nexus/Artifactory/ECR)
   --> Deployment Stage pulls the EXACT versioned artifact, never rebuilds from source</pre>
This "build once, deploy many times" principle is why the artifact repository sits at the center - it
guarantees the same tested bits reach staging and production, not two separately-built copies.`
        },
        {
            content: `<h3>Production Problems Caused by This Stage</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A feature that worked in staging is subtly broken in production</td><td>Staging and production were built from source separately instead of deploying the same artifact</td><td>Compare artifact checksums/versions between staging and prod - they differ</td><td>Adopt "build once, promote everywhere" - build a single immutable artifact and promote it unchanged through environments</td></tr>
<tr><td>A build that passed yesterday fails today with no code changes</td><td>Unpinned dependency versions - a transitive library silently auto-updated</td><td>Diff the dependency lock file / resolved versions between the two build runs</td><td>Pin exact dependency versions and use a lock file (or private mirror) so builds are reproducible</td></tr>
<tr><td>Nobody can tell which exact code version is running in production during an incident</td><td>Build artifacts weren't tagged/versioned, or the CI pipeline didn't stamp the commit SHA into the artifact</td><td>Check the artifact repository - artifacts are named "latest" instead of a traceable version</td><td>Tag every artifact with a semantic version and the source commit SHA, and expose the running version via a health/version endpoint</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Manual, developer-laptop builds pushed to production</strong> - no CI at all, "it built on my machine" is the only verification. <br>
• <strong>Rebuilding from source for every environment</strong> instead of promoting one immutable artifact - risks environment-specific build drift. <br>
• <strong>Skipping tests in the build to "make it green faster"</strong> - defeats the entire purpose of a build gate. <br>
• <strong>Giant, slow build pipelines with no caching</strong> - developers wait 30+ minutes for feedback and start ignoring/batching pushes. <br>
• <strong>No artifact retention/versioning policy</strong> - old artifacts get deleted, making rollback to a known-good version impossible.`
        }
    ]
};
