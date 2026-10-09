import { Topic } from '../coreJava';

export const concurrentCollectionsInJava: Topic = {
    id: 'concurrent-collections',
    name: 'Concurrent Collections in Java',

    beginner: [
        {
            content: `<h4>Why Plain Collections Aren't Thread-Safe</h4>
<p><code>HashMap</code>, <code>ArrayList</code>, and friends assume <b>single-threaded</b> access. Under concurrent modification they can corrupt internal state, throw <code>ConcurrentModificationException</code> during iteration, or even (for <code>HashMap</code> before Java 8) loop forever.</p>
<ul>
<li><code>Collections.synchronizedMap(new HashMap&lt;&gt;())</code> fixes this by wrapping every method in a <b>single lock</b>. That lock is held for the whole call, so all threads compete for it even for unrelated keys. It works, but scales poorly.</li>
<li><code>java.util.concurrent</code> instead offers collections built <b>from the ground up</b> for concurrent access, with finer-grained (or lock-free) synchronization.</li>
</ul>`
        },
        {
            content: `<h4>ConcurrentHashMap</h4>
<p><code>ConcurrentHashMap</code> lets many threads read and write at the same time without one map-wide lock:</p>
<ul>
<li>Reads are largely <b>lock-free</b>.</li>
<li>Writes use <b>fine-grained locking</b> (per bucket in modern JDKs) instead of locking the whole map.</li>
<li>Iterators are <b>weakly consistent</b>. They never throw <code>ConcurrentModificationException</code>, but may or may not show updates made during iteration.</li>
<li>Unlike <code>HashMap</code>, it does <b>not</b> allow <code>null</code> keys or values (<code>Hashtable</code> rejects them too). This avoids the ambiguity between "no value" and "value is null" under concurrent access.</li>
</ul>`,
            codeExamples: [
                `import java.util.concurrent.ConcurrentHashMap;

public class ConcurrentHashMapDemo {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentHashMap<String, Integer> scores = new ConcurrentHashMap<>();

        Runnable writer = () -> {
            for (int i = 0; i < 1000; i++) {
                scores.merge("count", 1, Integer::sum); // atomic increment
            }
        };

        Thread t1 = new Thread(writer);
        Thread t2 = new Thread(writer);
        t1.start(); t2.start();
        t1.join(); t2.join();

        System.out.println("Final count: " + scores.get("count"));
    }
}
// OUTPUT:
// Final count: 2000`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>CopyOnWriteArrayList — Read-Heavy, Rare-Write Lists</h3>
<p>Every <b>write</b> (add/remove/set) creates a <b>brand-new copy</b> of the underlying array. <b>Reads</b> use the current snapshot with no locking at all.</p>
<ul>
<li>Perfect for <b>many readers, very few writers</b> (for example, a list of event listeners).</li>
<li>Iterators work over a fixed snapshot, so they <b>never throw</b> <code>ConcurrentModificationException</code>. If the list changes mid-iteration, the iterator does not see that change.</li>
<li>Poor for write-heavy workloads, because every write is an O(n) array copy.</li>
</ul>`,
            codeExamples: [
                `import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class CopyOnWriteDemo {
    public static void main(String[] args) {
        List<String> listeners = new CopyOnWriteArrayList<>();
        listeners.add("A");
        listeners.add("B");

        for (String listener : listeners) {
            System.out.println("Notifying: " + listener);
            if (listener.equals("A")) {
                listeners.add("C"); // modifying while iterating - safe here
            }
        }
        System.out.println("Final list: " + listeners);
    }
}
// OUTPUT:
// Notifying: A
// Notifying: B
// Final list: [A, B, C]
// (the loop walks the snapshot taken at its start, so "C" is not visited)`
            ]
        },
        {
            content: `<h3>BlockingQueue — Producer-Consumer Made Easy</h3>
<p><code>BlockingQueue&lt;E&gt;</code> adds waiting to a normal queue. <code>put()</code> blocks while the queue is <b>full</b>, and <code>take()</code> blocks while it is <b>empty</b>. No manual <code>wait()</code>/<code>notify()</code> is needed.</p>
<ul>
<li><code>ArrayBlockingQueue</code>: fixed capacity, backed by an array.</li>
<li><code>LinkedBlockingQueue</code>: optionally bounded, backed by linked nodes.</li>
</ul>
<p>This makes it the natural building block for a <b>producer-consumer</b> pipeline.</p>`,
            codeExamples: [
                `import java.util.concurrent.*;

public class BlockingQueueDemo {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);

        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 3; i++) {
                    queue.put(i); // blocks if the queue is full (capacity 2)
                    System.out.println("Produced: " + i);
                }
            } catch (InterruptedException ignored) {}
        });

        Thread consumer = new Thread(() -> {
            try {
                for (int i = 1; i <= 3; i++) {
                    int value = queue.take(); // blocks if the queue is empty
                    System.out.println("Consumed: " + value);
                }
            } catch (InterruptedException ignored) {}
        });

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
    }
}
// OUTPUT (interleaving of Produced/Consumed lines can vary):
// Produced: 1
// Produced: 2
// Consumed: 1
// Produced: 3
// Consumed: 2
// Consumed: 3`
            ]
        },
        {
            content: `<h3>ConcurrentSkipListMap — Sorted, Thread-Safe Access</h3>
<p>When you need a concurrent map that stays <b>sorted by key</b> (like a thread-safe <code>TreeMap</code>), use <code>ConcurrentSkipListMap</code>. <code>ConcurrentHashMap</code> gives no ordering at all. It is built on a <b>skip list</b> and gives O(log n) navigation (<code>firstKey()</code>, <code>ceilingKey()</code>) with mostly lock-free access.</p>`
        },
        {
            content: `<h3>Quick Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Collection</th><th>Best for</th><th>Key trade-off</th></tr>
<tr class='text-center'><td>Collections.synchronizedMap</td><td>Quick retrofits of legacy code</td><td>Single coarse lock - poor concurrency</td></tr>
<tr class='text-center'><td>ConcurrentHashMap</td><td>General-purpose concurrent map</td><td>No ordering; disallows null keys/values</td></tr>
<tr class='text-center'><td>CopyOnWriteArrayList</td><td>Many readers, very few writers</td><td>O(n) copy on every write</td></tr>
<tr class='text-center'><td>ArrayBlockingQueue / LinkedBlockingQueue</td><td>Producer-consumer pipelines</td><td>Blocking put()/take() replace manual wait/notify</td></tr>
<tr class='text-center'><td>ConcurrentSkipListMap</td><td>Sorted concurrent access</td><td>O(log n) ops vs O(1)-ish for ConcurrentHashMap</td></tr>
</table>
<br>

<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why not just use Collections.synchronizedMap everywhere?</td><td>It locks the entire map for every operation, so all threads contend for one lock even on unrelated keys - much worse throughput than ConcurrentHashMap</td></tr>
<tr class='text-center'><td>Does ConcurrentHashMap allow null keys/values?</td><td>No - unlike HashMap, this is disallowed to avoid ambiguity under concurrent access</td></tr>
<tr class='text-center'><td>Why doesn't CopyOnWriteArrayList throw ConcurrentModificationException?</td><td>Its iterator works over an immutable snapshot taken when iteration began, so concurrent writes never affect that iterator</td></tr>
<tr class='text-center'><td>When is CopyOnWriteArrayList a bad choice?</td><td>Write-heavy workloads - every write copies the entire backing array, which is O(n)</td></tr>
<tr class='text-center'><td>What does BlockingQueue's put()/take() replace?</td><td>Manual wait()/notify() coordination for producer-consumer patterns</td></tr>
</table>`
        }
    ]
};
