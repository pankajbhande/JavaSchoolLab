import { Topic } from '../../coreJava';

export const hashMapTopic: Topic = {
    id: 'dsa-hashing-hashmap',
    name: 'HashMap',
    beginner: [
        {
            content: `<h4>What is a HashMap?</h4>
A HashMap stores key-value pairs and gives average O(1) <code>put</code>, <code>get</code>, and <code>remove</code> - the key is passed through a <b>hash function</b> to compute a bucket index directly, instead of scanning for it like an array or list would.
<ul>
<li>Keys are unique; inserting an existing key overwrites its value.</li>
<li>Iteration order is NOT guaranteed (use <code>LinkedHashMap</code> for insertion order, <code>TreeMap</code> for sorted order).</li>
<li>A good hashCode() implementation is what makes O(1) average case possible - a bad one degrades toward O(n).</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class HashMapBasicsDemo {
    public static void main(String[] args) {
        Map<String, Integer> ages = new HashMap<>();
        ages.put("Asha", 28);
        ages.put("Rahul", 32);
        ages.put("Asha", 29);   // overwrites the previous value for "Asha"

        System.out.println("Asha's age : " + ages.get("Asha"));
        System.out.println("Has Priya? : " + ages.containsKey("Priya"));
        System.out.println("Missing    : " + ages.getOrDefault("Priya", -1));

        for (Map.Entry<String, Integer> entry : ages.entrySet()) {
            System.out.println(entry.getKey() + " -> " + entry.getValue());
        }
    }
}
// OUTPUT:
// Asha's age : 29
// Has Priya? : false
// Missing    : -1
// Asha -> 29
// Rahul -> 32`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>How HashMap Actually Works Internally</h3>
Java's HashMap stores entries in an array of <b>buckets</b>. Inserting a key computes <code>hash(key) % bucketCount</code> to pick a bucket; multiple keys landing in the same bucket form a linked list (or, since Java 8, a red-black tree once a bucket exceeds 8 entries, to cap worst-case lookup at O(log n) instead of O(n)).<br><br>
The map automatically <b>resizes</b> (doubles its bucket array and rehashes everything) once the number of entries exceeds <code>capacity &times; loadFactor</code> (default load factor 0.75) - this keeps average bucket occupancy low and O(1) operations fast.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Objects;

public class CustomKeyDemo {

    static class Point {
        final int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }

        // WITHOUT equals()/hashCode(), two Points with the same x,y
        // would be treated as DIFFERENT keys - default Object identity is used.
        @Override
        public boolean equals(Object o) {
            if (!(o instanceof Point)) return false;
            Point p = (Point) o;
            return x == p.x && y == p.y;
        }

        @Override
        public int hashCode() {
            return Objects.hash(x, y);   // consistent with equals()
        }
    }

    public static void main(String[] args) {
        HashMap<Point, String> labels = new HashMap<>();
        labels.put(new Point(1, 2), "origin-ish");

        // A DIFFERENT Point object, but equal by value - equals()+hashCode() make it work
        System.out.println(labels.get(new Point(1, 2)));
    }
}
// OUTPUT:
// origin-ish`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why must a custom key class override BOTH equals() and hashCode()?</td><td>The contract requires equal objects to have equal hash codes - overriding only equals() breaks HashMap, since two "equal" keys could land in different buckets and never be found as the same key</td></tr>
<tr class='text-center'><td>What triggers a HashMap resize?</td><td>When size exceeds capacity * loadFactor (default 0.75); the bucket array doubles and every entry is rehashed into its new bucket</td></tr>
<tr class='text-center'><td>Why did Java 8 add tree-based buckets (red-black trees)?</td><td>To cap worst-case lookup time within a single bucket at O(log n) instead of O(n), protecting against pathological hash collisions (accidental or adversarial) that would otherwise degrade a bucket into a long linked list</td></tr>
</table>`
        }
    ]
};
