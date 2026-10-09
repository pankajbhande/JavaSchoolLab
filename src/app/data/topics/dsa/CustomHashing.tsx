import { Topic } from '../../coreJava';

export const customHashing: Topic = {
    id: 'dsa-hashing-custom-hashing',
    name: 'Custom Hashing',
    beginner: [
        {
            content: `<h4>Writing a Custom hashCode()</h4>
Any object used as a HashMap/HashSet key needs a <code>hashCode()</code> that is CONSISTENT with <code>equals()</code>: two equal objects must return the same hash code (the reverse isn't required - different objects CAN share a hash, that's just a collision).
<ul>
<li>Use <code>Objects.hash(field1, field2, ...)</code> for a quick, correct implementation.</li>
<li>A good hash spreads values evenly across buckets - a hashCode() that always returns the same constant is technically legal but destroys performance (every key collides into one bucket).</li>
</ul>

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 420 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:monospace">
  <text x="10" y="20" font-size="13" fill="#374151">Object key --&gt; hashCode() --&gt; bucket index</text>
  <rect x="10" y="35" width="90" height="30" rx="4" fill="#fff7ed" stroke="#ea580c"/>
  <text x="55" y="55" font-size="12" text-anchor="middle" fill="#9a3412">Point(1,2)</text>
  <text x="115" y="55" font-size="14" fill="#6b7280">&#8594;</text>
  <rect x="135" y="35" width="110" height="30" rx="4" fill="#fff7ed" stroke="#ea580c"/>
  <text x="190" y="55" font-size="12" text-anchor="middle" fill="#9a3412">hash = 994</text>
  <text x="255" y="55" font-size="14" fill="#6b7280">&#8594;</text>
  <rect x="275" y="35" width="130" height="30" rx="4" fill="#ecfdf5" stroke="#059669"/>
  <text x="340" y="55" font-size="12" text-anchor="middle" fill="#065f46">bucket 994 % 16 = 2</text>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class CustomHashCodeDemo {

    static class Point {
        final int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof Point)) return false;
            Point p = (Point) o;
            return x == p.x && y == p.y;
        }

        @Override
        public int hashCode() {
            return Objects.hash(x, y);   // MUST be consistent with equals()
        }

        @Override
        public String toString() {
            return "(" + x + "," + y + ")";
        }
    }

    public static void main(String[] args) {
        Map<Point, String> labels = new HashMap<>();
        labels.put(new Point(1, 2), "A");

        Point lookupKey = new Point(1, 2);   // a DIFFERENT object, same field values
        System.out.println("hashCode equal : " + (new Point(1, 2).hashCode() == lookupKey.hashCode()));
        System.out.println("Found via map  : " + labels.get(lookupKey));
    }
}
// OUTPUT:
// hashCode equal : true
// Found via map  : A`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The equals()/hashCode() Contract - and What Breaks Without It</h3>
Java's contract: if <code>a.equals(b)</code> is true, then <code>a.hashCode() == b.hashCode()</code> MUST also be true. Violating this silently breaks every hash-based collection - a key can be "put" successfully but never "found" again, because <code>get()</code> looks in the bucket matching the (wrong) hash, not the bucket where it was actually stored.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class BrokenHashCodeDemo {

    // BROKEN: equals() overridden, hashCode() left as default Object identity
    static class BadPoint {
        final int x, y;
        BadPoint(int x, int y) { this.x = x; this.y = y; }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof BadPoint)) return false;
            BadPoint p = (BadPoint) o;
            return x == p.x && y == p.y;
        }
        // NO hashCode() override - inherits Object's identity-based hash
    }

    public static void main(String[] args) {
        Map<BadPoint, String> map = new HashMap<>();
        map.put(new BadPoint(1, 2), "value");

        BadPoint lookupKey = new BadPoint(1, 2);   // equals() says these are the same "content"
        System.out.println("equals() says equal : " + new BadPoint(1, 2).equals(lookupKey));
        System.out.println("get() finds it?      : " + map.get(lookupKey));   // null! looked in the WRONG bucket
    }
}
// OUTPUT:
// equals() says equal : true
// get() finds it?      : null`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the equals()/hashCode() contract exactly?</td><td>Equal objects (by equals()) must produce equal hash codes; unequal objects are NOT required to have different hash codes (collisions are allowed)</td></tr>
<tr class='text-center'><td>Why is a hashCode() that always returns 0 technically "legal" but terrible?</td><td>It satisfies the contract (equal objects do get equal - identical - hashes) but forces EVERY key into one bucket, degrading the HashMap to a linked list with O(n) operations</td></tr>
<tr class='text-center'><td>Should mutable fields be used in hashCode()?</td><td>Avoid it - if a field used in hashCode() changes after the object is already a map key, the object becomes "lost" (get() computes a new hash and looks in the wrong bucket, even though equals() would still match if found)</td></tr>
</table>`
        }
    ]
};
