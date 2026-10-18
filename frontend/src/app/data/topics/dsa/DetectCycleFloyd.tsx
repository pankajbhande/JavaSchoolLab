import { Topic } from '../../coreJava';

export const detectCycleFloyd: Topic = {
    id: "dsa-linked-list-detect-cycle-floyd-s-algorithm",
    name: "Detect Cycle - Floyd's Algorithm",
    beginner: [
        {
            content: `<h4>Detecting a Cycle with Two Pointers</h4>
Floyd's Cycle Detection (the "tortoise and hare") uses a <code>slow</code> pointer moving 1 step and a <code>fast</code> pointer moving 2 steps at a time. If there's a cycle, fast will eventually lap slow and they'll land on the SAME node; if there's no cycle, fast reaches <code>null</code> first.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 320 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px;height:auto;font-family:monospace">
  <rect x="10" y="50" width="50" height="30" fill="#fff7ed" stroke="#ea580c"/><text x="35" y="70" text-anchor="middle" font-size="12" fill="#9a3412">1</text>
  <line x1="60" y1="65" x2="90" y2="65" stroke="#6b7280" marker-end="url(#af)"/>
  <circle cx="150" cy="65" r="45" fill="none" stroke="#9ca3af" stroke-dasharray="4,4"/>
  <circle cx="150" cy="20" r="15" fill="#ecfdf5" stroke="#059669"/><text x="150" y="24" text-anchor="middle" font-size="11" fill="#065f46">2</text>
  <circle cx="192" cy="65" r="15" fill="#ecfdf5" stroke="#059669"/><text x="192" y="69" text-anchor="middle" font-size="11" fill="#065f46">3</text>
  <circle cx="150" cy="110" r="15" fill="#ecfdf5" stroke="#059669"/><text x="150" y="114" text-anchor="middle" font-size="11" fill="#065f46">4</text>
  <circle cx="108" cy="65" r="15" fill="#ecfdf5" stroke="#059669"/><text x="108" y="69" text-anchor="middle" font-size="11" fill="#065f46">5</text>
  <text x="230" y="60" font-size="11" fill="#059669">cycle: slow &amp; fast meet inside</text>
  <defs><marker id="af" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6b7280"/></marker></defs>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

public class DetectCycleDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static boolean hasCycle(Node head) {
        Node slow = head, fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;           // moves 1 step
            fast = fast.next.next;      // moves 2 steps

            if (slow == fast) {
                return true;   // fast lapped slow - there IS a cycle
            }
        }
        return false;   // fast reached the end - no cycle
    }

    public static void main(String[] args) {
        Node a = new Node(1);
        Node b = new Node(2);
        Node c = new Node(3);
        a.next = b; b.next = c; c.next = a;   // creates a cycle back to a

        System.out.println(hasCycle(a));

        Node x = new Node(1);
        x.next = new Node(2);
        System.out.println(hasCycle(x));   // no cycle
    }
}
// OUTPUT:
// true
// false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Fast is Guaranteed to Catch Slow (Not Just Skip Past It)</h3>
Once BOTH pointers are inside the cycle, fast gains exactly 1 net position on slow every iteration (fast moves 2, slow moves 1). Since the cycle has finite length, the GAP between them shrinks by 1 each step until it hits 0 - fast cannot "jump over" slow, because a gap of 1 becomes a gap of 0 (a meeting), never a gap of -1.`,
            codeExamples: [
                `package com.javaschoollab;

public class CycleLengthDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    // Once a meeting point is found, walk the cycle again to measure its length
    static int cycleLength(Node head) {
        Node slow = head, fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                int length = 1;
                Node cur = slow.next;
                while (cur != slow) {
                    length++;
                    cur = cur.next;
                }
                return length;
            }
        }
        return 0;   // no cycle
    }

    public static void main(String[] args) {
        Node a = new Node(1);
        Node b = new Node(2);
        Node c = new Node(3);
        Node d = new Node(4);
        a.next = b; b.next = c; c.next = d; d.next = b;   // cycle of length 3: b -> c -> d -> b

        System.out.println("Cycle length: " + cycleLength(a));
    }
}
// OUTPUT:
// Cycle length: 3`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of Floyd's algorithm?</td><td>O(n) time, O(1) space - a huge improvement over the O(n) space naive approach of storing every visited node in a HashSet</td></tr>
<tr class='text-center'><td>Why check fast != null AND fast.next != null in the loop condition?</td><td>fast.next.next would throw a NullPointerException if fast.next were null - both checks together guarantee it's safe to jump two steps ahead</td></tr>
<tr class='text-center'><td>Could fast ever skip over slow and miss the meeting?</td><td>No - once both are in the cycle, the gap between them shrinks by exactly 1 each iteration (2-step minus 1-step), so it passes through every integer value down to 0, guaranteeing a meeting</td></tr>
</table>`
        }
    ]
};
