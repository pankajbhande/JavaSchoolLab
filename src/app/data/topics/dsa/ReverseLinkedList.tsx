import { Topic } from '../../coreJava';

export const reverseLinkedList: Topic = {
    id: 'dsa-linked-list-reverse-linked-list',
    name: 'Reverse Linked List',
    beginner: [
        {
            content: `<h4>Reversing a Linked List Iteratively</h4>
Reversing means flipping every node's <code>next</code> pointer to point BACKWARD instead of forward. Three pointers do it in one O(n) pass with O(1) extra space: <code>prev</code>, <code>current</code>, and a temporary to hold <code>current.next</code> before it gets overwritten.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 420 70" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:monospace">
  <g font-size="13">
    <rect x="10" y="14" width="50" height="30" fill="#ecfdf5" stroke="#059669"/><text x="35" y="34" text-anchor="middle" fill="#065f46">1</text>
    <rect x="100" y="14" width="50" height="30" fill="#fff7ed" stroke="#ea580c"/><text x="125" y="34" text-anchor="middle" fill="#9a3412">2</text>
    <rect x="190" y="14" width="50" height="30" fill="#fff7ed" stroke="#ea580c"/><text x="215" y="34" text-anchor="middle" fill="#9a3412">3</text>
  </g>
  <path d="M100,20 C 75,-5 35,-5 30,10" stroke="#059669" marker-end="url(#arrowr)" fill="none"/>
  <line x1="150" y1="30" x2="185" y2="30" stroke="#9ca3af" stroke-dasharray="3,3" marker-end="url(#arrowr)"/>
  <text x="60" y="60" font-size="11" fill="#059669">prev &#8592; already reversed link</text>
  <defs><marker id="arrowr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#059669"/></marker></defs>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

public class ReverseLinkedListDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static Node reverse(Node head) {
        Node prev = null;
        Node current = head;

        while (current != null) {
            Node nextTemp = current.next;   // save before overwriting
            current.next = prev;             // reverse the link
            prev = current;                  // advance prev
            current = nextTemp;              // advance current
        }
        return prev;   // prev is the new head
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

        print(head);
        Node reversed = reverse(head);
        print(reversed);
    }
}
// OUTPUT:
// 1 -> 2 -> 3 -> 4 -> null
// 4 -> 3 -> 2 -> 1 -> null`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Recursive Reversal, and Reversing Only a Sub-Range</h3>
The recursive version reverses the REST of the list first, then fixes up the current node's link - O(n) time like the iterative version, but O(n) space for the call stack instead of O(1). A common hard follow-up: reverse only nodes between positions <code>left</code> and <code>right</code>, leaving the rest untouched.`,
            codeExamples: [
                `package com.javaschoollab;

public class RecursiveReverseDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static Node reverseRecursive(Node head) {
        if (head == null || head.next == null) {
            return head;   // base case: empty list or a single node is already "reversed"
        }
        Node newHead = reverseRecursive(head.next);   // reverse everything after head first
        head.next.next = head;                          // make the next node point back at head
        head.next = null;                                // head is now the tail
        return newHead;
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

        print(reverseRecursive(head));
    }
}
// OUTPUT:
// 3 -> 2 -> 1 -> null`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is the temp variable for current.next needed before reversing the link?</td><td>Once current.next is overwritten to point at prev, the original "next node" reference is lost forever unless it was saved first - the temp preserves the path forward</td></tr>
<tr class='text-center'><td>What's the space complexity trade-off between iterative and recursive reversal?</td><td>Iterative: O(1) extra space. Recursive: O(n) space for the call stack - each recursive call stays on the stack until the base case returns</td></tr>
<tr class='text-center'><td>How would you reverse only nodes between position left and right?</td><td>Walk to the node just before 'left', then run the standard iterative reversal for (right - left + 1) nodes, and finally reconnect the reversed segment's new head/tail back into the rest of the original list</td></tr>
</table>`
        }
    ]
};
