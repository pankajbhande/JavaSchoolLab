import { Topic } from '../coreJava';

export const jvmArguments: Topic = {
    id: 'jvm-arguments',
    name: 'JVM Arguments',
    beginner: [
        {
            content: `<h3>What are JVM Arguments?</h3>
JVM arguments are command-line options passed to the <code>java</code> launcher that control how the JVM behaves -
things like how much memory it can use, which garbage collector to run, and what diagnostic output to print. <br><br>
You pass them before the main class name: <br><br>
<code>java [JVM arguments] -jar myapp.jar [program arguments]</code>`,
            codeExamples: [`# Example: run with a max heap of 512 MB and a min heap of 128 MB
java -Xms128m -Xmx512m -jar myapp.jar`]
        },
        {
            content: `<h3>-X Flags (Non-Standard but Common)</h3>
Flags starting with a single <code>-X</code> are "non-standard" - not guaranteed identical across every JVM vendor,
but the most common ones are supported everywhere in practice. These usually control memory and basic runtime
behavior: <br><br>
• <code>-Xms&lt;size&gt;</code> - initial heap size (e.g. <code>-Xms256m</code>) <br>
• <code>-Xmx&lt;size&gt;</code> - maximum heap size (e.g. <code>-Xmx1g</code>) <br>
• <code>-Xss&lt;size&gt;</code> - thread stack size (e.g. <code>-Xss512k</code>) <br>
• <code>-Xint</code> - run in interpreted-only mode (no JIT)`,
            codeExamples: [`# Cap the stack size per thread to 256 KB, useful when running many threads
java -Xss256k -jar myapp.jar`]
        },
        {
            content: `<h3>-XX Flags (Advanced/Non-Standard)</h3>
Flags starting with <code>-XX:</code> expose deeper JVM internals - garbage collector selection, JIT behavior,
diagnostics, and more. They come in a few shapes: <br><br>
• <strong>Boolean flags</strong> - toggled with <code>+</code> or <code>-</code>, e.g. <code>-XX:+PrintGCDetails</code>
enables it, <code>-XX:-PrintGCDetails</code> disables it. <br>
• <strong>Value flags</strong> - set with <code>=</code>, e.g. <code>-XX:MaxMetaspaceSize=256m</code>.`,
            codeExamples: [`# Turn on detailed GC logging (older JVMs) and choose the G1 collector
java -XX:+PrintGCDetails -XX:+UseG1GC -jar myapp.jar

# Set the max Metaspace size (where class metadata lives)
java -XX:MaxMetaspaceSize=256m -jar myapp.jar`]
        },
        {
            content: `<h3>Frequently Used Flags Cheat-Sheet</h3>
• <code>-Xms512m -Xmx512m</code> - set initial = max heap size (recommended in containers to avoid resize pauses). <br>
• <code>-XX:+HeapDumpOnOutOfMemoryError</code> - automatically write a heap dump when the app crashes with
<code>OutOfMemoryError</code>. <br>
• <code>-XX:+PrintGCDetails -Xlog:gc*</code> - see what the garbage collector is doing. <br>
• <code>-XX:+UseG1GC</code> / <code>-XX:+UseZGC</code> - choose which garbage collector algorithm to use.`
        },
        {
            content: `<h3>Why This Matters</h3>
Getting JVM arguments right is often the single biggest lever for application performance and stability in
production - more so than most code-level micro-optimizations. Setting the wrong heap size, or leaving diagnostics
off, is one of the most common causes of mysterious "it crashed in prod but not in dev" incidents.`
        }
    ],

    expert: [
        {
            content: `<h3>Standard vs Non-Standard vs Experimental/Diagnostic Flags</h3>
The JVM classifies its flags into tiers of stability, which matters for how safely you can rely on them across
versions and vendors: <br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Category</th><th>Prefix</th><th>Stability</th><th>Example</th></tr>
<tr class='text-center'><td>Standard</td><td>Single dash, no X</td><td>Supported by all JVM implementations, stable across versions</td><td><code>-cp</code>, <code>-jar</code>, <code>-D</code></td></tr>
<tr class='text-center'><td>Non-standard (X)</td><td><code>-X</code></td><td>HotSpot-specific but widely relied upon; can change without notice</td><td><code>-Xms</code>, <code>-Xmx</code>, <code>-Xss</code></td></tr>
<tr class='text-center'><td>Advanced (XX)</td><td><code>-XX:</code></td><td>Internal tuning flags, subject to change between releases</td><td><code>-XX:+UseG1GC</code></td></tr>
<tr class='text-center'><td>Diagnostic/Experimental</td><td><code>-XX:+Unlock...</code> required</td><td>Unstable, for debugging the JVM itself; requires unlocking</td><td><code>-XX:+UnlockDiagnosticVMOptions -XX:+PrintCompilation</code></td></tr>
</table>`
        },
        {
            content: `<h3>Discovering All Flags and Their Current Values</h3>
You rarely need to memorize every flag - the JVM can tell you what it's using and what's available.`,
            codeExamples: [`# Print every flag and its current value (including defaults you didn't set)
java -XX:+PrintFlagsFinal -version | grep -i heapsize

# Diff flags between two configurations - useful for reproducing a prod incident locally
java -XX:+PrintFlagsFinal -Xmx512m -version > with_512m.txt
java -XX:+PrintFlagsFinal -Xmx2g   -version > with_2g.txt
diff with_512m.txt with_2g.txt

# Inspect a running JVM's actual flags via jcmd (no restart needed)
jcmd <pid> VM.flags`]
        },
        {
            content: `<h3>Container-Aware Memory Flags</h3>
Before JDK 10, the JVM would read the <em>host</em> machine's total memory/CPU count even when running inside a
container with much tighter cgroup limits - a classic cause of containers being OOM-killed even though
<code>-Xmx</code> "looked fine." Since JDK 10+ (and backported to 8u191+), the JVM is container-aware by default via
<code>-XX:+UseContainerSupport</code>. <br><br>
Instead of a fixed <code>-Xmx</code>, many teams now use percentage-based flags so the same image scales correctly
across different container memory limits: <br><br>
<code>-XX:MaxRAMPercentage=75.0</code> - use up to 75% of the container's memory limit for the heap.`,
            codeExamples: [`# Recommended pattern for containerized services (Kubernetes, Docker)
java -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -XX:+UseContainerSupport -jar myapp.jar`]
        },
        {
            content: `<h3>Sample -XX:+PrintFlagsFinal Output</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">    intx CompileThreshold                        = 10000                                {pd product} {default}
   uintx InitialHeapSize                         = 268435456                             {product} {ergonomic}
   uintx MaxHeapSize                              = 4294967296                            {product} {ergonomic}
   uintx MaxMetaspaceSize                         = 18446744073709547520                  {product} {default}
     bool UseG1GC                                  = true                                  {product} {ergonomic}
     bool PrintGCDetails                           = false                                 {product} {default}</pre>
The <code>{ergonomic}</code> tag means the JVM chose this value automatically based on detected hardware/container
limits, not a value you explicitly set - important to check when diagnosing "why is my heap this size" issues.`
        },
        {
            content: `<h3>Production Troubleshooting Scenarios</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Container repeatedly OOM-killed despite <code>-Xmx</code> looking safely below the container limit</td><td>Heap + Metaspace + thread stacks + native memory (direct buffers, JIT code cache) together exceed the container's total memory limit, not just the heap</td><td>Use <code>-XX:NativeMemoryTracking=summary</code> and <code>jcmd &lt;pid&gt; VM.native_memory</code> to see the full memory breakdown</td><td>Lower <code>-Xmx</code>/<code>MaxRAMPercentage</code> to leave headroom for non-heap memory, or raise the container limit</td></tr>
<tr><td>Same JAR, same flags, but heap size differs between two servers</td><td>Percentage-based/ergonomic flags (e.g. <code>MaxRAMPercentage</code>) resolve differently depending on detected CPU/memory of each host or container</td><td>Compare <code>-XX:+PrintFlagsFinal</code> output on both machines, look for <code>{ergonomic}</code> values</td><td>Pin explicit values (<code>-Xmx</code>) if strict consistency across environments is required</td></tr>
<tr><td>App runs fine locally but fails to start in CI with "Invalid initial heap size"</td><td>A flag was set with a value larger than available memory in the CI runner, or with inconsistent units</td><td>Check the exact flags passed by the CI pipeline vs local run scripts</td><td>Align CI resource limits with the flags, or make heap sizing percentage-based instead of hardcoded</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between -X and -XX flags?</td><td>-X flags are non-standard but common HotSpot options (like -Xmx); -XX flags expose deeper, more volatile internal tuning options, often toggled with +/- or set with =</td></tr>
<tr><td>What does -Xms and -Xmx control?</td><td>-Xms sets the initial heap size, -Xmx sets the maximum heap size the JVM is allowed to grow to</td></tr>
<tr><td>Why set -Xms equal to -Xmx in production?</td><td>To avoid runtime heap resizing pauses and ensure predictable memory behavior, especially in containers with fixed memory limits</td></tr>
<tr><td>What does -XX:+HeapDumpOnOutOfMemoryError do?</td><td>Automatically writes a heap dump file to disk when the JVM throws an OutOfMemoryError, useful for post-mortem analysis</td></tr>
<tr><td>What is MaxRAMPercentage used for?</td><td>Sizing the heap as a percentage of the container's memory limit rather than a fixed value, so the same image scales correctly across different container sizes</td></tr>
<tr><td>How can you see all JVM flags and their actual values, including defaults?</td><td>Run <code>java -XX:+PrintFlagsFinal -version</code>, or use <code>jcmd &lt;pid&gt; VM.flags</code> on a running process</td></tr>
<tr><td>Why might a container be OOM-killed even though -Xmx is well within the container limit?</td><td>Because -Xmx only bounds heap memory - Metaspace, thread stacks, JIT code cache, and native/direct memory are separate and add to total RSS</td></tr>
</table>`
        }
    ]
};
