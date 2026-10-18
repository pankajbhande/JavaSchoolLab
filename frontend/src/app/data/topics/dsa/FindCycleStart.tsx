import { Topic } from '../../coreJava';

export const findCycleStart: Topic = {
    id: 'dsa-linked-list-find-cycle-start',
    name: 'Find Cycle Start',
    beginner: [
        {
            content: `<h4>Finding WHERE the Cycle Begins</h4>
Detecting a cycle exists is phase 1 of Floyd's algorithm. Phase 2 finds exactly which node the cycle starts at: reset one pointer to the head, keep the other at the meeting point, then advance BOTH one step at a time - they meet exactly at the cycle's entrance.`,
            codeExamples: [
                `package com.javaschoollab;

public class FindCycleStartDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static Node findCycleStart(Node head) {
        Node slow = head, fast = head;

        // Phase 1: find a meeting point inside the cycle
        boolean hasCycle = false;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                hasCycle = true;
                break;
            }
        }
        if (!hasCycle) return null;

        // Phase 2: one pointer from head, one from the meeting point, both step by step
        slow = head;
        while (slow != fast) {
            slow = slow.next;
            fast = fast.next;
        }
        return slow;   // the cycle's entrance
    }

    public static void main(String[] args) {
        Node a = new Node(1);
        Node b = new Node(2);
        Node c = new Node(3);
        Node d = new Node(4);
        a.next = b; b.next = c; c.next = d; d.next = c;   // cycle starts at c

        Node start = findCycleStart(a);
        System.out.println("Cycle starts at: " + (start != null ? start.val : "no cycle"));
    }
}
// OUTPUT:
// Cycle starts at: 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Math Behind Why Phase 2 Works</h3>
Let <code>a</code> = distance from head to the cycle's start, <code>b</code> = distance from the cycle's start to the meeting point, and <code>c</code> = the remaining cycle length back to the start. When they meet: slow traveled <code>a + b</code>, fast traveled <code>a + b + n&middot;(b + c)</code> for some integer n, and fast's distance is exactly double slow's. Substituting and simplifying shows <code>a = (n-1)&middot;(b+c) + c</code> - meaning "distance from head to cycle start" equals "distance from meeting point to cycle start" (mod cycle length). That's precisely why resetting one pointer to head and stepping both by 1 makes them converge at the entrance.`,
            codeExamples: [
                `// Verifying the math with a concrete trace
public class CycleMathTraceDemo {
    public static void main(String[] args) {
        // head -> 1 -> 2 -> [3 -> 4 -> 5 -> back to 3]
        //  a=2 (head to cycle start)   c=3 (cycle length)
        int a = 2, c = 3;

        // Phase 1 meets somewhere inside the cycle after slow travels a + b steps,
        // where b is some value determined by when fast laps slow.
        // Phase 2 proves: distance(head -> start) == distance(meetingPoint -> start)
        System.out.println("a (head to start)        : " + a);
        System.out.println("This equals the remaining distance from the meeting point to the start,");
        System.out.println("which is exactly what advancing both pointers by 1 step converges on.");
    }
}
// OUTPUT:
// a (head to start)        : 2
// This equals the remaining distance from the meeting point to the start,
// which is exactly what advancing both pointers by 1 step converges on.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why reset a pointer to HEAD instead of just continuing from the meeting point?</td><td>The meeting point is some arbitrary position inside the cycle, not necessarily near the start - the head-reset + equal-speed trick uses the distance relationship proven by Floyd's math to land exactly on the entrance</td></tr>
<tr class='text-center'><td>What's the overall time and space complexity of finding the cycle start?</td><td>O(n) time (two O(n) phases), O(1) space - same complexity class as just detecting a cycle exists</td></tr>
<tr class='text-center'><td>What LeetCode problem is this exactly, and what's the naive alternative?</td><td>"Linked List Cycle II" - the naive alternative is a HashSet tracking visited nodes, O(n) time but O(n) space; Floyd's approach keeps O(n) time while dropping to O(1) space</td></tr>
</table>`
        }
    ]
};
