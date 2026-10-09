import { Topic } from '../../coreJava';

export const collisionConcepts: Topic = {
    id: 'dsa-hashing-collision-concepts',
    name: 'Collision Concepts',
    beginner: [
        {
            content: `<h4>What is a Hash Collision?</h4>
A collision happens when two DIFFERENT keys hash to the SAME bucket - unavoidable in general, since there are usually far more possible keys than buckets (pigeonhole principle). How a hash table handles collisions is what determines its worst-case behavior.
<ul>
<li><b>Chaining:</b> each bucket holds a list (or tree) of all entries that hashed there - Java's HashMap uses this.</li>
<li><b>Open addressing:</b> on a collision, probe for the next open slot using a fixed rule (linear probing, quadratic probing, double hashing) - no extra list structure needed.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class CollisionDemo {
    public static void main(String[] args) {
        // A deliberately terrible hash function to force collisions
        int bucketCount = 4;

        int[] keys = {10, 14, 18, 22};
        for (int key : keys) {
            System.out.println(key + " -> bucket " + (key % bucketCount));
        }
        // All four keys collide into bucket 2! (10%4=2, 14%4=2, 18%4=2, 22%4=2)
        // A real HashMap would chain them together inside bucket 2.
    }
}
// OUTPUT:
// 10 -> bucket 2
// 14 -> bucket 2
// 18 -> bucket 2
// 22 -> bucket 2`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Chaining vs Open Addressing - Trade-offs</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Aspect</th><th>Chaining</th><th>Open Addressing</th></tr>
<tr class='text-center'><td>Extra memory</td><td>Yes - a list/tree node per entry</td><td>No - entries live directly in the array</td></tr>
<tr class='text-center'><td>Load factor &gt; 1</td><td>Allowed (buckets just get longer)</td><td>Impossible (array runs out of slots)</td></tr>
<tr class='text-center'><td>Cache locality</td><td>Poor (list nodes scattered in memory)</td><td>Good (probing stays within the array)</td></tr>
<tr class='text-center'><td>Deletion</td><td>Simple - remove from the bucket's list</td><td>Tricky - must mark a "tombstone", not truly empty the slot, or probing breaks</td></tr>
</table>
Java's HashMap uses chaining (with a red-black tree upgrade per bucket since Java 8, when a bucket exceeds 8 entries and the table has at least 64 buckets).`,
            codeExamples: [
                `package com.javaschoollab;

// Linear probing: open addressing with a simple "try the next slot" rule
public class LinearProbingDemo {

    static final int SIZE = 7;
    static Integer[] table = new Integer[SIZE];

    static void insert(int key) {
        int index = key % SIZE;
        while (table[index] != null) {
            index = (index + 1) % SIZE;   // probe forward on collision
        }
        table[index] = key;
    }

    public static void main(String[] args) {
        int[] keys = {10, 17, 24, 3};   // 10%7=3, 17%7=3 (collides!), 24%7=3 (collides!), 3%7=3 (collides!)
        for (int k : keys) insert(k);

        System.out.println(java.util.Arrays.toString(table));
    }
}
// OUTPUT:
// [null, null, null, 10, 17, 24, 3]
// All four keys wanted slot 3; linear probing pushed each collision to the next open slot`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can't open addressing have a load factor above 1?</td><td>Every entry occupies a real array slot with no auxiliary list - once the array is full, there is physically nowhere left to probe to</td></tr>
<tr class='text-center'><td>What is "clustering" in linear probing, and why is it a problem?</td><td>Consecutive collisions pile entries into long unbroken runs, making future collisions even MORE likely to land in that same run - degrading lookup toward O(n) in the worst case</td></tr>
<tr class='text-center'><td>Why does Java's HashMap upgrade a bucket to a tree instead of just growing the list?</td><td>A malicious or unlucky input could force many keys into one bucket; a tree caps that bucket's worst-case lookup at O(log n) instead of leaving it at O(n) for a linked list</td></tr>
</table>`
        }
    ]
};
