import { Topic } from '../coreJava';

export const amortizedComplexity: Topic = {
    id: 'amortized-complexity',
    name: 'Amortized Complexity',
    beginner: [
        {
            content: `<h3>What is Amortized Complexity?</h3>
Amortized complexity describes the <strong>average cost per operation over a long sequence of
operations</strong>, even when a few individual operations in that sequence are much more expensive than
the rest. <br><br>

It is NOT the same as "average case" (which is about typical input). Amortized analysis is about
<strong>spreading out the cost of occasional expensive operations across many cheap ones</strong>, so the
per-operation cost, averaged over the whole sequence, stays low. <br><br>

The textbook Java example is <code>ArrayList.add()</code> — most calls are O(1), but every so often the
internal array is full and must be resized, which is O(n). Yet across n total additions, the AVERAGE cost
per add is still O(1) — this is called <strong>amortized O(1)</strong>.`
        },
        {
            content: `<h3>Why ArrayList.add() Is Usually O(1)</h3>
An ArrayList is backed by a fixed-size array. As long as there's room, adding an element just places it
in the next free slot — that's O(1).`,
            codeExamples: [`import java.util.*;

public class ArrayListAddFast {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(10); // capacity 10, room for 10 elements

        // Each of these is O(1) - array has spare capacity, no resize needed
        for (int i = 0; i < 10; i++) {
            list.add(i);
        }
        System.out.println("Added 10 elements, size = " + list.size());
    }
}
// OUTPUT:
// Added 10 elements, size = 10`]
        },
        {
            content: `<h3>The Occasional Expensive Resize</h3>
When the backing array is full, ArrayList must allocate a NEW, larger array and copy every existing
element into it — an O(n) operation — before the new element can be added.`,
            codeExamples: [`import java.util.*;

public class ArrayListResizeCost {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(4); // small starting capacity
        for (int i = 0; i < 4; i++) list.add(i);  // 4 cheap O(1) adds fill it up

        // The 5th add() triggers a resize:
        // 1. Allocate a new, bigger array (commonly ~1.5x the old capacity)
        // 2. Copy all 4 existing elements into it - O(n)
        // 3. THEN place the new element - O(1)
        list.add(4); // this single call costs O(n), not O(1)

        System.out.println("Size after resize-triggering add: " + list.size());
    }
}
// OUTPUT:
// Size after resize-triggering add: 5`]
        }
    ],

    intermediate: [
        {
            content: `<h3>Averaging the Cost Across n Additions</h3>
Suppose we add n elements one at a time, and the array doubles in size every time it fills up (a common
growth strategy). The resize costs happen at sizes 1, 2, 4, 8, 16, ... — a geometric sequence. <br><br>

Total cost of all resizes combined: <code>1 + 2 + 4 + 8 + ... + n ≈ 2n</code> (a geometric series sums to
roughly twice the final size). <br><br>

Total cost of all n insertions (cheap O(1) ones) plus all resize copying = <code>n + 2n = 3n</code>. <br><br>

Average cost per operation = <code>3n / n = 3</code> = a <strong>constant</strong>, independent of n.
That constant-per-operation average is exactly what "amortized O(1)" means.`,
            codeExamples: [`public class DoublingCostAnalysis {
    public static void main(String[] args) {
        // Simulating capacity growth by doubling: 1, 2, 4, 8, 16, 32...
        int capacity = 1;
        int totalCopyWork = 0;
        int n = 32; // total elements we plan to add

        while (capacity < n) {
            totalCopyWork += capacity; // cost of copying old elements on each resize
            capacity *= 2;             // capacity doubles
        }

        System.out.println("Total elements added: " + n);
        System.out.println("Total copy work from all resizes: " + totalCopyWork);
        System.out.println("Amortized cost per add: ~" +
            (double) (n + totalCopyWork) / n); // stays small/constant, not growing with n
    }
}
// OUTPUT:
// Total elements added: 32
// Total copy work from all resizes: 31
// Amortized cost per add: ~1.96875`]
        },
        {
            content: `<h3>The Doubling Strategy Visualized</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Capacity growth: 1 -> 2 -> 4 -> 8 -> 16 -> 32 ...

add() calls:  1   2   3   4   5   6   7   8   9  ...
Cost:         1   R2  1   R4  1   1   1   R8  1  ...
              ^   ^       ^               ^
              |   |       |               |
           cheap resize cheap          resize
           O(1)  O(n)  O(1)             O(n)

Even though resizes (R) cost O(n), they get RARER as capacity grows -
they happen at sizes 1, 2, 4, 8, 16, 32... (doubling), so their total
combined cost across n adds is only about 2n, not n^2.

Spread that 2n resize cost evenly across all n add() calls:
  amortized cost per add = O(1)</pre>
This is why doubling (rather than, say, growing by a fixed +1 each time) is essential — growing by a
constant amount instead of a multiplicative factor would make total resize cost O(n^2), NOT amortized O(1).`
        }
    ],

    expert: [
        {
            content: `<h3>Amortized vs Worst-Case vs Average-Case</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Term</th><th>Meaning</th></tr>
<tr class='text-center'><td>Worst-case (Big-O)</td><td>Cost of the single most expensive operation, considered in isolation</td></tr>
<tr class='text-center'><td>Average-case</td><td>Expected cost assuming some probability distribution over inputs</td></tr>
<tr class='text-center'><td>Amortized</td><td>Total cost of a SEQUENCE of n operations, divided by n - guaranteed even for adversarial inputs, unlike average-case</td></tr>
</table>
<br>
Amortized O(1) for <code>ArrayList.add()</code> means: any single call could be O(n) in the worst case
(during a resize), but no matter what sequence of adds you perform, the TOTAL cost of n adds is never
worse than O(n) - guaranteed, not probabilistic.`
        },
        {
            content: `<h3>Common Java Structures With Amortized Costs</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Structure / Operation</th><th>Per-Call Worst Case</th><th>Amortized Cost</th></tr>
<tr class='text-center'><td>ArrayList.add(x) at end</td><td>O(n) during resize</td><td>O(1)</td></tr>
<tr class='text-center'><td>StringBuilder.append(x)</td><td>O(n) during internal buffer resize</td><td>O(1)</td></tr>
<tr class='text-center'><td>HashMap.put(k, v)</td><td>O(n) during rehash</td><td>O(1) average</td></tr>
<tr class='text-center'><td>ArrayDeque push/pop (array-backed)</td><td>O(n) during resize</td><td>O(1)</td></tr>
</table>`
        },
        {
            content: `<h3>Amortized Analysis via the "Accounting Method" (Banker's Method)</h3>
One common way to formally prove amortized O(1): imagine each <code>add()</code> call is "charged" a
constant number of extra credits (say, 3 units) even though it only needs 1 unit for the cheap case. The
unused credits from cheap operations are saved up and used to "pay" for the expensive resize when it
happens - so no operation ever appears to exceed its flat charged cost when viewed over the whole
sequence.`,
            codeExamples: [`public class AccountingMethodDemo {
    // Conceptual simulation: each add() is "charged" 3 credits.
    // 1 credit pays for placing the new element.
    // 2 credits are banked to help pay for a FUTURE resize's copy work.
    public static void main(String[] args) {
        int credits = 0;
        int size = 0;
        int capacity = 1;

        for (int i = 1; i <= 16; i++) {
            credits += 3;      // charge 3 credits for this add()
            credits -= 1;      // 1 credit spent placing the element
            size++;

            if (size > capacity) {
                int copyCost = capacity;   // O(capacity) to copy old elements
                credits -= copyCost;       // pay for the resize using banked credits
                capacity *= 2;
            }
            System.out.println("After add " + i + ": credits banked = " + credits);
        }
        // Credits never go negative -> proves amortized cost per add stayed
        // at a constant 3 units even though some individual adds cost O(n)
    }
}`]
        },
        {
            content: `<h3>Common Mistakes When Reasoning About Amortized Complexity</h3>
• <strong>Confusing amortized O(1) with worst-case O(1)</strong> - a single <code>ArrayList.add()</code>
call CAN still be O(n) if it happens to trigger a resize; amortized only guarantees the average over
many calls. In latency-sensitive real-time code, this occasional spike can matter. <br>
• <strong>Assuming any growable structure has amortized O(1) growth</strong> - it depends entirely on
the growth strategy. Growing capacity by a FIXED amount (e.g. +1 or +10 each time) instead of a
multiplicative factor makes total resize cost O(n^2), destroying the amortized O(1) guarantee. <br>
• <strong>Forgetting HashMap resizing follows the same idea</strong> - <code>put()</code> is amortized
O(1) average because the bucket array also doubles when the load factor threshold is crossed. <br>
• <strong>Treating amortized cost as a per-call promise</strong> - it is a promise about the SEQUENCE
total, not any individual call.`
        },
        {
            content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is amortized complexity?</td><td>The average cost per operation across a long sequence, even when some individual operations are expensive</td></tr>
<tr class='text-center'><td>Why is ArrayList.add() called "amortized O(1)"?</td><td>Most calls are O(1); occasional O(n) resizes are rare enough (due to capacity doubling) that their total cost averages out to O(1) per call</td></tr>
<tr class='text-center'><td>Is amortized the same as average-case?</td><td>No - amortized is a guaranteed bound over any sequence of operations; average-case depends on input probability distribution</td></tr>
<tr class='text-center'><td>Can a single ArrayList.add() call still be O(n)?</td><td>Yes - if it triggers a resize; amortized O(1) is about the sequence total, not any one call</td></tr>
<tr class='text-center'><td>Why does doubling capacity give amortized O(1), but growing by +1 each time does not?</td><td>Doubling makes resizes exponentially rarer, keeping total resize cost at O(n); fixed-increment growth causes O(n) resizes on nearly every add, giving O(n^2) total</td></tr>
<tr class='text-center'><td>What is the accounting/banker's method?</td><td>A proof technique that charges each cheap operation a slightly higher flat cost, banking the surplus credits to pay for future expensive operations</td></tr>
<tr class='text-center'><td>Name another Java operation with amortized O(1) cost.</td><td>StringBuilder.append() and HashMap.put() - both use similar doubling/resizing strategies</td></tr>
<tr class='text-center'><td>Does amortized analysis assume random/average input?</td><td>No - it holds even for the worst possible sequence of operations, which is what makes it a strong guarantee</td></tr>
</table>`
        }
    ]
};
