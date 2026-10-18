import { Topic } from '../../coreJava';

export const intersectionOfLinkedLists: Topic = {
    id: 'dsa-linked-list-intersection-of-linked-lists',
    name: 'Intersection of Linked Lists',
    beginner: [
        {
            content: `<h4>Finding Where Two Lists Merge</h4>
Two singly linked lists that eventually MERGE into a shared tail (like a Y shape) - find the exact node where they intersect. The naive approach: HashSet all nodes of one list, then check each node of the other list for membership - O(n + m) time, O(n) space.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 340 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:340px;height:auto;font-family:monospace">
  <text x="10" y="20" font-size="11" fill="#9a3412">A: a1 -&gt; a2 &#8594;</text>
  <text x="10" y="85" font-size="11" fill="#9a3412">B: b1 -&gt; b2 -&gt; b3 &#8594;</text>
  <rect x="150" y="35" width="40" height="26" fill="#ecfdf5" stroke="#059669"/><text x="170" y="53" text-anchor="middle" font-size="11" fill="#065f46">c1</text>
  <rect x="200" y="35" width="40" height="26" fill="#ecfdf5" stroke="#059669"/><text x="220" y="53" text-anchor="middle" font-size="11" fill="#065f46">c2</text>
  <line x1="100" y1="15" x2="148" y2="45" stroke="#ea580c" marker-end="url(#ai)"/>
  <line x1="100" y1="80" x2="148" y2="50" stroke="#ea580c" marker-end="url(#ai)"/>
  <line x1="190" y1="48" x2="197" y2="48" stroke="#6b7280" marker-end="url(#ai)"/>
  <defs><marker id="ai" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6b7280"/></marker></defs>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashSet;
import java.util.Set;

public class IntersectionHashSetDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    // O(n + m) time, O(n) space
    static Node getIntersectionNode(Node headA, Node headB) {
        Set<Node> visited = new HashSet<>();
        Node cur = headA;
        while (cur != null) {
            visited.add(cur);
            cur = cur.next;
        }

        cur = headB;
        while (cur != null) {
            if (visited.contains(cur)) {
                return cur;   // first shared node found
            }
            cur = cur.next;
        }
        return null;
    }

    public static void main(String[] args) {
        Node shared = new Node(8);
        shared.next = new Node(9);

        Node a = new Node(1);
        a.next = new Node(2);
        a.next.next = shared;

        Node b = new Node(3);
        b.next = shared;

        Node result = getIntersectionNode(a, b);
        System.out.println(result != null ? result.val : "no intersection");
    }
}
// OUTPUT:
// 8`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Two-Pointer O(1)-Space Trick</h3>
Run a pointer down each list; when a pointer reaches the end, redirect it to the OTHER list's head. Both pointers then travel exactly <code>lenA + lenB</code> total steps before either reaching the intersection node or both becoming <code>null</code> together - the length difference between the two lists is automatically cancelled out by the redirect.`,
            codeExamples: [
                `package com.javaschoollab;

public class IntersectionTwoPointerDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    // O(n + m) time, O(1) space - no HashSet needed
    static Node getIntersectionNode(Node headA, Node headB) {
        if (headA == null || headB == null) return null;

        Node pA = headA, pB = headB;

        // When pA falls off list A, redirect it to headB (and vice versa) -
        // this equalizes the distance each pointer travels before meeting.
        while (pA != pB) {
            pA = (pA == null) ? headB : pA.next;
            pB = (pB == null) ? headA : pB.next;
        }
        return pA;   // either the intersection node, or null (both fell off together)
    }

    public static void main(String[] args) {
        Node shared = new Node(8);
        shared.next = new Node(9);

        Node a = new Node(1);
        a.next = new Node(2);
        a.next.next = shared;

        Node b = new Node(3);
        b.next = shared;

        Node result = getIntersectionNode(a, b);
        System.out.println(result != null ? result.val : "no intersection");
    }
}
// OUTPUT:
// 8`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does redirecting a pointer to the other list's head equalize the distances?</td><td>Pointer A travels lenA + lenB total steps before reaching the intersection (or end); pointer B travels lenB + lenA - the SAME total, so they arrive at the intersection point simultaneously regardless of each list's individual length</td></tr>
<tr class='text-center'><td>What if the two lists don't intersect at all?</td><td>Both pointers eventually become null at the same "step" (after traveling lenA + lenB each), and pA == pB == null exits the loop correctly, returning null</td></tr>
<tr class='text-center'><td>Why compare node REFERENCES, not values, to detect the intersection?</td><td>Two different nodes could coincidentally hold the same value; only reference equality (pA == pB) guarantees it's the actual shared node, not a value collision</td></tr>
</table>`
        }
    ]
};
