import { Topic } from '../../coreJava';

export const circularLinkedList: Topic = {
    id: 'dsa-linked-list-circular-linked-list',
    name: 'Circular Linked List',
    beginner: [
        {
            content: `<h4>What is a Circular Linked List?</h4>
Instead of ending at <code>null</code>, the LAST node's <code>next</code> points back to the FIRST node, forming a loop. Useful for anything that naturally cycles: round-robin CPU scheduling, a circular playlist, or the Josephus problem.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 300 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:300px;height:auto;font-family:monospace">
  <circle cx="150" cy="80" r="15" fill="#fff7ed" stroke="#ea580c"/><text x="150" y="84" text-anchor="middle" font-size="12" fill="#9a3412">A</text>
  <circle cx="230" cy="120" r="15" fill="#fff7ed" stroke="#ea580c"/><text x="230" y="124" text-anchor="middle" font-size="12" fill="#9a3412">B</text>
  <circle cx="150" cy="150" r="15" fill="#fff7ed" stroke="#ea580c"/><text x="150" y="154" text-anchor="middle" font-size="12" fill="#9a3412">C</text>
  <circle cx="70" cy="120" r="15" fill="#fff7ed" stroke="#ea580c"/><text x="70" y="124" text-anchor="middle" font-size="12" fill="#9a3412">D</text>
  <path d="M163,90 L217,113" stroke="#6b7280" marker-end="url(#arrowc)" fill="none"/>
  <path d="M222,133 L163,147" stroke="#6b7280" marker-end="url(#arrowc)" fill="none"/>
  <path d="M137,147 L78,133" stroke="#6b7280" marker-end="url(#arrowc)" fill="none"/>
  <path d="M78,110 L137,90" stroke="#6b7280" marker-end="url(#arrowc)" fill="none"/>
  <defs><marker id="arrowc" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6b7280"/></marker></defs>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

public class CircularLinkedListDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static class CircularList {
        Node last;   // pointing at 'last' makes both head (last.next) and tail O(1) to reach

        void add(int val) {
            Node newNode = new Node(val);
            if (last == null) {
                last = newNode;
                last.next = last;   // points to itself - a list of one node
                return;
            }
            newNode.next = last.next;   // new node points at the current head
            last.next = newNode;        // old last points at the new node
            last = newNode;             // new node becomes the last
        }

        // Prints exactly n nodes to avoid looping forever on a circular structure
        void printN(int n) {
            if (last == null) return;
            Node cur = last.next;   // start at the head
            for (int i = 0; i < n; i++) {
                System.out.print(cur.val + " ");
                cur = cur.next;
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        CircularList list = new CircularList();
        list.add(1);
        list.add(2);
        list.add(3);

        list.printN(3);   // one full loop
        list.printN(6);   // two full loops - proves it never hits "null"
    }
}
// OUTPUT:
// 1 2 3
// 1 2 3 1 2 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Josephus Problem - The Classic Circular List Application</h3>
n people stand in a circle; starting from person 1, every kth person is eliminated until one remains. A circular linked list models this directly - no modulo-arithmetic index juggling needed, just remove the current node and advance k-1 steps around the ring.`,
            codeExamples: [
                `package com.javaschoollab;

public class JosephusDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static int josephus(int n, int k) {
        Node head = new Node(1);
        Node prev = head;
        for (int i = 2; i <= n; i++) {
            prev.next = new Node(i);
            prev = prev.next;
        }
        prev.next = head;   // close the circle

        Node current = head;
        while (current.next != current) {   // only one node left when this is true
            for (int i = 0; i < k - 1; i++) {
                current = current.next;
            }
            current.next = current.next.next;   // eliminate the next person
        }
        return current.val;   // the survivor
    }

    public static void main(String[] args) {
        System.out.println("Survivor: " + josephus(7, 3));
    }
}
// OUTPUT:
// Survivor: 4`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you traverse a circular linked list without an infinite loop?</td><td>Track the starting node and stop when the traversal returns to it, or track a known count of nodes and iterate exactly that many times</td></tr>
<tr class='text-center'><td>Why point at 'last' instead of 'head' in a circular singly linked implementation?</td><td>last.next directly gives the head (O(1)), while also keeping O(1) access to the tail for appends - pointing at head alone would make appends O(n) to find the tail</td></tr>
<tr class='text-center'><td>What real systems use a circular linked list?</td><td>Round-robin CPU/process scheduling, circular buffers for streaming data, and multiplayer turn rotation are classic examples</td></tr>
</table>`
        }
    ]
};
