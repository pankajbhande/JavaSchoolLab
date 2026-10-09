import { Topic } from '../coreJava';

export const jitCompiler: Topic = {
    id: 'jit-compiler',
    name: 'JIT Compiler',
    beginner: [
        {
            content: `<h3>What is the JIT Compiler?</h3>
JIT stands for <strong>Just-In-Time</strong> compiler. It is a part of the JVM that converts frequently used bytecode
into native machine code <em>while the program is running</em>, so it can execute much faster. <br><br>
Java code goes through two stages before it becomes machine instructions: <br>
• <code>javac</code> compiles <code>.java</code> source files into <code>.class</code> bytecode (platform-independent). <br>
• The JVM then either <strong>interprets</strong> that bytecode line by line, or <strong>JIT-compiles</strong> hot parts of
it into native code for the actual CPU.`
        },
        {
            content: `<h3>Interpreter vs JIT-Compiled Code</h3>
When a Java program starts, the JVM's interpreter begins executing bytecode immediately - this gives fast startup but
slower execution, since every instruction is decoded and executed one at a time, every single time. <br><br>
• <strong>Interpreter</strong> - starts fast, runs slow, no upfront compilation delay. <br>
• <strong>JIT Compiler</strong> - takes a moment to compile, but the resulting native code runs dramatically faster on
repeated execution. <br><br>
The JVM combines both: start with the interpreter for quick startup, then JIT-compile the "hot" methods that run
over and over.`
        },
        {
            content: `<h3>What Makes a Method "Hot"?</h3>
The JVM keeps an invocation counter for every method and loop. Once a method is called (or a loop iterates) more than
a threshold number of times, the JVM marks it as <strong>hot</strong> and schedules it for JIT compilation on a
background compiler thread. <br><br>
This is why the very first few runs of a Java program (or the first few iterations of a loop) are often slower than
later ones - this warm-up period is sometimes called the <em>JIT warm-up</em>.`,
            codeExamples: [`# Print JIT compilation activity as it happens
java -XX:+PrintCompilation MyApp

# Sample output (trimmed):
#     102    1       3       java.lang.String::hashCode (60 bytes)
#     104    2       4       java.lang.Object::<init> (1 bytes)
#     205  156       4       com.myapp.OrderProcessor::calculateTotal (48 bytes)`]
        },
        {
            content: `<h3>C1 and C2 - The Two JIT Compilers</h3>
The HotSpot JVM (the standard Oracle/OpenJDK JVM) actually ships with two different JIT compilers: <br><br>
• <strong>C1 (Client Compiler)</strong> - compiles quickly with light optimizations. Good for fast startup and
short-lived programs. <br>
• <strong>C2 (Server Compiler)</strong> - takes longer to compile but produces highly optimized native code. Good for
long-running server applications. <br><br>
Modern JVMs use both together in a strategy called <strong>Tiered Compilation</strong>, which we cover next.`
        },
        {
            content: `<h3>Why This Matters to You</h3>
Understanding the JIT compiler explains real things you will see in production: <br>
• Why a server "feels slow" for the first minute after deploy and then speeds up (JIT warm-up). <br>
• Why microbenchmarks that don't warm up the JVM give misleading numbers. <br>
• Why load-testing tools often run a "warm-up phase" before taking measurements.`
        }
    ],

    expert: [
        {
            content: `<h3>Tiered Compilation in Detail</h3>
Since Java 8, the default strategy is <strong>Tiered Compilation</strong>, which uses C1 and C2 together across
five compilation levels: <br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Level</th><th>Compiler</th><th>Description</th></tr>
<tr class='text-center'><td>0</td><td>Interpreter</td><td>Pure bytecode interpretation, gathers profiling data</td></tr>
<tr class='text-center'><td>1</td><td>C1</td><td>Simple C1 compile, no profiling (for trivial methods)</td></tr>
<tr class='text-center'><td>2</td><td>C1</td><td>C1 compile with invocation/backedge counters only</td></tr>
<tr class='text-center'><td>3</td><td>C1</td><td>C1 compile with full profiling (branch, type profiling)</td></tr>
<tr class='text-center'><td>4</td><td>C2</td><td>Fully optimized C2 compile using profiling data from level 3</td></tr>
</table>
<br>
A method typically walks 0 -> 3 -> 4: it's interpreted and profiled, quickly C1-compiled with profiling to get fast
speedup sooner, and finally recompiled by C2 once it's proven hot enough to justify heavy optimization. This gives
Java both fast warm-up (like C1-only) and peak throughput (like C2-only).`
        },
        {
            content: `<h3>Key Optimizations C2 Performs</h3>
• <strong>Inlining</strong> - replacing a method call with the method body itself, eliminating call overhead and
opening the door to further optimizations. <br>
• <strong>Loop unrolling</strong> - duplicating loop bodies to reduce branch overhead. <br>
• <strong>Escape analysis</strong> - determining an object never leaves a method, enabling stack allocation or
elimination entirely (see the dedicated Escape Analysis topic). <br>
• <strong>Dead code elimination</strong> - removing code paths that profiling shows are never taken. <br>
• <strong>Speculative optimization with deoptimization</strong> - C2 will optimize aggressively based on assumptions
(e.g. "this call site is monomorphic") and fall back ("deoptimize") to the interpreter if that assumption is later
violated.`,
            codeExamples: [`# Inspect JIT compilation with more detail, including deoptimizations
java -XX:+PrintCompilation -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining MyApp

# A deoptimization event looks like this in -XX:+TraceDeoptimization output:
# Uncommon trap occurred in com.myapp.PaymentService::process
#   reason=class_check action=maybe_recompile`]
        },
        {
            content: `<h3>Sample JIT Compilation Log Walkthrough</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Timestamp  ID  Attributes  Tier  Method                                Bytes
    102     1      %      3    com.myapp.Order::isValid                12
    118     1              4    com.myapp.Order::isValid                12
    340    45      %      4    com.myapp.OrderProcessor::processBatch  210
    341    45              4    com.myapp.OrderProcessor::processBatch  210 (made not entrant)
    342    46              4    com.myapp.OrderProcessor::processBatch  225</pre>
"made not entrant" means the JVM invalidated a previously compiled version - typically because a class was loaded that
invalidates an inlining assumption, or because profiling revealed the earlier compile was suboptimal, triggering a
recompile.`
        },
        {
            content: `<h3>Production Troubleshooting Scenarios</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>New pods are slow for the first 60-90 seconds after every deploy, then fine</td><td>JIT warm-up - code is running interpreted/C1 until C2 kicks in</td><td>Compare <code>-XX:+PrintCompilation</code> timestamps against request latency graphs post-deploy</td><td>Add a warm-up phase (synthetic traffic) before routing real traffic, or use Application Class Data Sharing / CDS to reduce startup cost</td></tr>
<tr><td>Latency spikes randomly under steady load, not just at startup</td><td>C2 recompilation ("made not entrant") triggered by late class loading or megamorphic call sites</td><td>Enable <code>-XX:+PrintCompilation</code> and correlate recompiles with latency spike timestamps</td><td>Reduce polymorphism at hot call sites; avoid dynamic class loading during steady-state traffic</td></tr>
<tr><td>Short-lived batch job never seems to get fast</td><td>Job finishes before C2 has a chance to compile hot methods - it never leaves the interpreter/C1 tiers</td><td>Check job duration vs typical JIT threshold (~10,000 invocations for C2)</td><td>Either accept interpreted performance for short jobs, or use <code>-Xcomp</code>/AOT compilation for consistent latency on short-lived runs</td></tr>
</table>`
        },
        {
            content: `<h3>Useful JVM Flags for JIT Tuning</h3>
• <code>-XX:+PrintCompilation</code> - log every JIT compilation event. <br>
• <code>-XX:CompileThreshold=10000</code> - invocation count before C2 compiles a method (non-tiered mode). <br>
• <code>-XX:-TieredCompilation</code> - disable tiered compilation (use C2 only, slower warm-up). <br>
• <code>-Xint</code> - force pure interpretation, useful for isolating JIT-related bugs. <br>
• <code>-Xcomp</code> - force compilation of every method before it executes (useful for testing, terrible for
production).`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does JIT stand for and what does it do?</td><td>Just-In-Time compiler - converts hot bytecode into native machine code at runtime for faster execution</td></tr>
<tr><td>What is the difference between C1 and C2?</td><td>C1 compiles quickly with light optimization (good for startup); C2 compiles slower but produces highly optimized code (good for long-running throughput)</td></tr>
<tr><td>What is Tiered Compilation?</td><td>A strategy (default since Java 8) that uses C1 first for fast warm-up and profiling, then C2 for peak-optimized recompilation of hot methods</td></tr>
<tr><td>Why is a Java application slower right after startup?</td><td>Because code is initially interpreted or lightly compiled; JIT needs time (and invocation counts) to identify and optimize hot methods</td></tr>
<tr><td>What is deoptimization?</td><td>When the JVM discards an aggressively optimized compiled method and falls back to the interpreter because a runtime assumption it relied on was violated</td></tr>
<tr><td>What is method inlining and why does it matter?</td><td>Replacing a call site with the callee's body; it removes call overhead and enables further optimizations like escape analysis across the inlined code</td></tr>
<tr><td>How would you force the JVM to skip JIT compilation entirely?</td><td>Run with the <code>-Xint</code> flag, which forces pure interpretation</td></tr>
</table>`
        }
    ]
};
