import { Topic } from '../../coreJava';

export const removeNthNode: Topic = {
    id: 'dsa-linked-list-remove-nth-node',
    name: 'Remove Nth Node',
    beginner: [
        {
            content: `<h4>Removing the Nth Node From the End - One Pass</h4>
Removing the Nth node from the END is awkward because a singly linked list only knows its length by walking it fully first (two passes), OR by using a gap of N between two pointers to solve it in ONE pass.`,
            codeExamples: [
                `package com.javaschoollab;

public class RemoveNthFromEndDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static Node removeNthFromEnd(Node head, int n) {
        Node dummy = new Node(-1);
        dummy.next = head;

        Node fast = dummy, slow = dummy;

        // Move fast n+1 steps ahead, creating a gap of n between fast and slow
        for (int i = 0; i <= n; i++) {
            fast = fast.next;
        }

        // Move both until fast reaches the end - slow now sits just BEFORE the target
        while (fast != null) {
            fast = fast.next;
            slow = slow.next;
        }

        slow.next = slow.next.next;   // skip over the node to remove
        return dummy.next;
    }

    static void print(Node head) {
        StringBuilder sb = new StringBuilder();
        while (head != null) {
            sb.append(head.val).append(" -> ");
            head = head.next;
        }
        System.out.println(sb + "null");
    }

    public static void main(String[] args) {
        Node head = new Node(1);
        head.next = new Node(2);
        head.next.next = new Node(3);
        head.next.next.next = new Node(4);
        head.next.next.next.next = new Node(5);

        print(removeNthFromEnd(head, 2));   // remove the 2nd node from the end
    }
}
// OUTPUT:
// 1 -> 2 -> 3 -> 5 -> null`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the Dummy Node and the n+1 Head Start Matter</h3>
The dummy node handles the edge case of removing the HEAD itself (when n equals the list's full length) without a special-cased branch - <code>slow</code> can safely start "before" the real head. Advancing <code>fast</code> exactly <code>n+1</code> steps (not n) is what leaves <code>slow</code> pointing at the node just BEFORE the target, ready to relink in one step, rather than landing ON the target itself.`,
            codeExamples: [
                `package com.javaschoollab;

public class RemoveNthEdgeCasesDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static Node removeNthFromEnd(Node head, int n) {
        Node dummy = new Node(-1);
        dummy.next = head;
        Node fast = dummy, slow = dummy;

        for (int i = 0; i <= n; i++) fast = fast.next;
        while (fast != null) {
            fast = fast.next;
            slow = slow.next;
        }
        slow.next = slow.next.next;
        return dummy.next;
    }

    static void print(Node head) {
        if (head == null) { System.out.println("empty list"); return; }
        StringBuilder sb = new StringBuilder();
        while (head != null) { sb.append(head.val).append(" -> "); head = head.next; }
        System.out.println(sb + "null");
    }

    public static void main(String[] args) {
        // Edge case: removing the ONLY node (n equals the full list length)
        Node single = new Node(1);
        print(removeNthFromEnd(single, 1));

        // Edge case: removing the head of a longer list
        Node head = new Node(1);
        head.next = new Node(2);
        print(removeNthFromEnd(head, 2));
    }
}
// OUTPUT:
// empty list
// 2 -> null`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time/space complexity of the two-pointer one-pass solution?</td><td>O(L) time (L = list length), O(1) extra space - a single traversal, versus a two-pass approach that also achieves O(L) time but conceptually walks the list twice</td></tr>
<tr class='text-center'><td>Why is a dummy head node used here specifically?</td><td>It uniformly handles removing the actual head node (when n == list length) without an if-branch, since slow always ends up at a real "previous" node, even when that's the dummy itself</td></tr>
<tr class='text-center'><td>What happens if n is larger than the list's length?</td><td>The loop advancing fast would run off the end (fast becomes null) before completing n+1 steps, causing a NullPointerException - a robust implementation should validate n against the list length first</td></tr>
</table>`
        }
    ]
};
