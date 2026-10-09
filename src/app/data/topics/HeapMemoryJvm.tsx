import { Topic } from '../coreJava';

export const heapMemoryJvm: Topic = {
    id: 'heap-memory-jvm',
    name: 'Heap',
    beginner: [
        {
            content: `<h3>What is the Heap?</h3>
The <strong>Heap</strong> is the area of JVM memory where all objects live - every time you write <code>new</code>,
the object is created on the Heap. Unlike the Stack, the Heap is shared by every thread in the application.`
        },
        {
            content: `<h3>A Simple Example</h3>
Every object created here is placed on the Heap, no matter which method or thread creates it.`,
            codeExamples: [`public class HeapDemo {
    public static void main(String[] args) {
        String message = new String("Hello"); // object on Heap
        int[] numbers = new int[5];            // array object on Heap

        System.out.println(message);
        System.out.println("Array length: " + numbers.length);
    }
}
// OUTPUT:
// Hello
// Array length: 5`]
        },
        {
            content: `<h3>Young Generation and Old Generation</h3>
The Heap isn't one big blob of memory - it's divided into generations, based on the idea that most objects die
young: <br><br>
• <strong>Young Generation</strong> - where all new objects are created. Further split into: <br>
&nbsp;&nbsp;• <strong>Eden</strong> - brand new objects are born here. <br>
&nbsp;&nbsp;• <strong>Survivor 0 (S0)</strong> and <strong>Survivor 1 (S1)</strong> - objects that survive a
garbage collection in Eden get moved here. <br>
• <strong>Old Generation (Tenured)</strong> - objects that survive many garbage collections in the Young
Generation get "promoted" here, since they're likely to be long-lived.`
        },
        {
            content: `<h3>Controlling Heap Size with -Xms and -Xmx</h3>
You can control how much memory the Heap starts with and how much it can grow to, using JVM startup flags: <br><br>
• <code>-Xms&lt;size&gt;</code> - the initial Heap size. <br>
• <code>-Xmx&lt;size&gt;</code> - the maximum Heap size the JVM is allowed to use. <br><br>
Example: <code>java -Xms256m -Xmx1024m MyApp</code> starts with a 256 MB heap and allows it to grow up to 1024 MB.`
        },
        {
            content: `<h3>What Happens When the Heap Runs Out?</h3>
If the application keeps creating objects that can't be garbage collected (because something still references
them), the Heap eventually fills up completely. When that happens, the JVM throws
<code>java.lang.OutOfMemoryError: Java heap space</code> and the application typically crashes.`
        }
    ],

    expert: [
        {
            content: `<h3>Heap Layout in Detail</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                              HEAP
   +--------------------------------------------------------+
   |          Young Generation           |   Old Generation  |
   |  +--------+  +------+  +------+     |                   |
   |  |  Eden  |  |  S0  |  |  S1  |     |     Tenured        |
   |  +--------+  +------+  +------+     |   (long-lived      |
   |  new objects  survivor  survivor    |    objects live    |
   |  born here    space 0   space 1     |    here)           |
   +--------------------------------------------------------+
        Minor GC runs here                Major/Full GC runs here
        (fast, frequent)                  (slower, less frequent)</pre>`
        },
        {
            content: `<h3>Object Lifecycle Through the Generations</h3>
• A new object is allocated in <strong>Eden</strong>. <br>
• When Eden fills up, a <strong>Minor GC</strong> runs: live objects in Eden are copied to an empty Survivor space
(say S0), and Eden is cleared. <br>
• On the next Minor GC, live objects from Eden AND S0 are copied to S1, and both Eden and S0 are cleared - the
Survivor spaces swap roles each cycle. <br>
• Each time an object survives a GC cycle, its <strong>age</strong> counter increases. Once it crosses a
threshold (default is often 15, tunable via <code>-XX:MaxTenuringThreshold</code>), it gets <strong>promoted</strong>
to the Old Generation. <br>
• Objects in the Old Generation are only cleaned up by a <strong>Major/Full GC</strong>, which is more expensive
because it scans a much larger memory region.`
        },
        {
            content: `<h3>Heap Tuning Flags</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Flag</th><th>Purpose</th></tr>
<tr><td>-Xms&lt;size&gt;</td><td>Initial Heap size at JVM startup</td></tr>
<tr><td>-Xmx&lt;size&gt;</td><td>Maximum Heap size the JVM may grow to</td></tr>
<tr><td>-Xmn&lt;size&gt;</td><td>Size of the Young Generation specifically</td></tr>
<tr><td>-XX:NewRatio=&lt;n&gt;</td><td>Ratio of Old Generation size to Young Generation size</td></tr>
<tr><td>-XX:SurvivorRatio=&lt;n&gt;</td><td>Ratio of Eden size to each Survivor space size</td></tr>
<tr><td>-XX:MaxTenuringThreshold=&lt;n&gt;</td><td>How many GC cycles an object survives in Young Gen before promotion to Old Gen</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfall: Setting -Xms and -Xmx Very Far Apart</h3>
If <code>-Xms</code> is much smaller than <code>-Xmx</code>, the JVM has to repeatedly resize (grow) the Heap as
the application's memory needs increase, which causes pauses and CPU overhead. In production, it's a common best
practice to set <code>-Xms</code> and <code>-Xmx</code> to the <strong>same value</strong>, so the Heap size is
fixed upfront and the JVM doesn't spend time resizing it under load.`
        },
        {
            content: `<h3>Common Misconceptions</h3>
• <strong>"All objects go straight to the Old Generation."</strong> Wrong - almost all objects start in Eden;
only long-lived objects get promoted after surviving several GC cycles. <br>
• <strong>"A larger Heap always means better performance."</strong> Wrong - a very large Heap can mean longer
Full GC pause times when it does eventually need cleaning, even if it's cleaned less often. <br>
• <strong>"Garbage Collection frees memory immediately when an object goes out of scope."</strong> Wrong - the
object simply becomes eligible for collection; the actual reclaiming happens later, whenever the GC runs.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is stored on the Heap?</td><td>All objects and arrays created with 'new', shared across all threads</td></tr>
<tr><td>What are the two main generations of the Heap?</td><td>Young Generation (Eden + S0 + S1) and Old Generation (Tenured)</td></tr>
<tr><td>What triggers a Minor GC vs a Major/Full GC?</td><td>Minor GC runs when Eden fills up; Major/Full GC runs when the Old Generation needs cleaning, and is much more expensive</td></tr>
<tr><td>What do -Xms and -Xmx control?</td><td>-Xms sets the initial Heap size, -Xmx sets the maximum Heap size the JVM may grow to</td></tr>
<tr><td>What error is thrown when the Heap is exhausted?</td><td>java.lang.OutOfMemoryError: Java heap space</td></tr>
<tr><td>Why are there two Survivor spaces instead of one?</td><td>So live objects can be copied between them each GC cycle, always leaving one Survivor space empty to copy into, which keeps memory compact</td></tr>
<tr><td>Why is it recommended to set -Xms equal to -Xmx in production?</td><td>To avoid runtime Heap resizing overhead and pauses as the application's memory usage grows</td></tr>
<tr><td>What promotes an object from Young Gen to Old Gen?</td><td>Surviving a configured number of GC cycles (tenuring threshold) without being collected</td></tr>
</table>`
        }
    ]
};
