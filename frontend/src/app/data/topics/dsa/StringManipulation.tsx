import { Topic } from '../../coreJava';

export const stringManipulation: Topic = {
    id: 'dsa-strings-string-manipulation',
    name: 'String Manipulation',
    beginner: [
        {
            content: `<h4>Java Strings Are Immutable</h4>
Every "modification" of a <code>String</code> - concatenation, substring, replace - creates a <b>new</b> String object; the original is never changed. This is why building a string inside a loop with <code>+=</code> is O(n&sup2;): each concatenation allocates a whole new copy.
<ul>
<li>Use <code>StringBuilder</code> for repeated modifications - it's mutable and appends in amortized O(1).</li>
<li><code>charAt(i)</code>, <code>substring(l, r)</code>, <code>toCharArray()</code> are the core building blocks for most string algorithms.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class StringVsBuilderDemo {

    public static void main(String[] args) {
        // WRONG for a loop: O(n^2), a new String object every iteration
        String bad = "";
        for (int i = 0; i < 5; i++) {
            bad += i;
        }

        // RIGHT: StringBuilder mutates its internal buffer, amortized O(1) per append
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            sb.append(i);
        }
        String good = sb.toString();

        System.out.println(bad);
        System.out.println(good);
        System.out.println(bad.equals(good));   // same result, different cost to build
    }
}
// OUTPUT:
// 01234
// 01234
// true`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>String Pool and == vs equals()</h3>
String literals are interned into a shared <b>string pool</b> - two literals with the same text point at the SAME object, so <code>==</code> can appear to "work" by accident. Strings built with <code>new String(...)</code> or by concatenation at runtime are NOT pooled, so <code>==</code> silently breaks. Always use <code>.equals()</code> for content comparison.`,
            codeExamples: [
                `package com.javaschoollab;

public class StringPoolDemo {
    public static void main(String[] args) {
        String a = "hello";
        String b = "hello";                 // same pooled literal
        String c = new String("hello");     // a NEW object, not pooled

        System.out.println("a == b        : " + (a == b));         // true - same pooled reference
        System.out.println("a == c        : " + (a == c));         // false - different objects
        System.out.println("a.equals(c)   : " + a.equals(c));      // true - same content
        System.out.println("a == c.intern(): " + (a == c.intern())); // true - intern() returns the pooled reference
    }
}
// OUTPUT:
// a == b        : true
// a == c        : false
// a.equals(c)   : true
// a == c.intern(): true`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is repeated String concatenation in a loop O(n&sup2;)?</td><td>Each += creates a brand new String, copying all previous characters plus the new one - across n iterations the total copying is 1+2+...+n = O(n^2)</td></tr>
<tr class='text-center'><td>When should you use StringBuilder over String?</td><td>Whenever building a string incrementally, especially in a loop - StringBuilder appends into a resizable internal char array in amortized O(1)</td></tr>
<tr class='text-center'><td>Why should you never use == to compare string content?</td><td>== compares object references, not characters - it only "works" for pooled literals, and silently breaks for strings built with new String(...) or produced by concatenation</td></tr>
</table>`
        }
    ]
};
