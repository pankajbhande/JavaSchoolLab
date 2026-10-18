import { Topic } from '../../coreJava';

export const doublyLinkedList: Topic = {
    id: 'dsa-linked-list-doubly-linked-list',
    name: 'Doubly Linked List',
    beginner: [
        {
            content: `<h4>What is a Doubly Linked List?</h4>
Each node holds a reference to BOTH the next node and the previous node, allowing traversal in either direction and O(1) deletion of a KNOWN node without needing to walk from the head to find its predecessor.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 400 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:monospace">
  <g font-size="13">
    <rect x="30" y="24" width="60" height="32" fill="#fff7ed" stroke="#ea580c"/><text x="60" y="45" text-anchor="middle" fill="#9a3412">10</text>
    <rect x="150" y="24" width="60" height="32" fill="#fff7ed" stroke="#ea580c"/><text x="180" y="45" text-anchor="middle" fill="#9a3412">20</text>
    <rect x="270" y="24" width="60" height="32" fill="#fff7ed" stroke="#ea580c"/><text x="300" y="45" text-anchor="middle" fill="#9a3412">30</text>
    <line x1="90" y1="35" x2="147" y2="35" stroke="#6b7280" marker-end="url(#arrow2)"/>
    <line x1="150" y1="45" x2="93" y2="45" stroke="#9ca3af" marker-end="url(#arrow2)"/>
    <line x1="210" y1="35" x2="267" y2="35" stroke="#6b7280" marker-end="url(#arrow2)"/>
    <line x1="270" y1="45" x2="213" y2="45" stroke="#9ca3af" marker-end="url(#arrow2)"/>
  </g>
  <text x="30" y="75" font-size="11" fill="#6b7280">next: gray &#8594;   prev: light &#8592;</text>
  <defs><marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6b7280"/></marker></defs>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

public class DoublyLinkedListDemo {

    static class Node {
        int val;
        Node prev, next;
        Node(int val) { this.val = val; }
    }

    static class DoublyLinkedList {
        Node head, tail;

        void addLast(int val) {
            Node newNode = new Node(val);
            if (tail == null) {
                head = tail = newNode;
                return;
            }
            tail.next = newNode;
            newNode.prev = tail;
            tail = newNode;
        }

        void printForward() {
            Node cur = head;
            while (cur != null) {
                System.out.print(cur.val + " ");
                cur = cur.next;
            }
            System.out.println();
        }

        void printBackward() {
            Node cur = tail;
            while (cur != null) {
                System.out.print(cur.val + " ");
                cur = cur.prev;
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        DoublyLinkedList list = new DoublyLinkedList();
        list.addLast(10);
        list.addLast(20);
        list.addLast(30);

        list.printForward();
        list.printBackward();
    }
}
// OUTPUT:
// 10 20 30
// 30 20 10`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>O(1) Deletion of a Known Node - Why This Matters</h3>
Given a REFERENCE to a node in a singly linked list, deleting it still requires an O(n) walk from the head to find its predecessor (to relink <code>prev.next</code>). A doubly linked list skips that walk entirely - the node already knows its own predecessor via <code>prev</code>. This is exactly why an LRU Cache is implemented with a doubly linked list: eviction and promotion both need O(1) removal of an arbitrary node.`,
            codeExamples: [
                `package com.javaschoollab;

public class O1DeleteDemo {

    static class Node {
        int val;
        Node prev, next;
        Node(int val) { this.val = val; }
    }

    // Deletes a node given DIRECTLY (no traversal needed) - O(1)
    static void deleteNode(Node node) {
        if (node.prev != null) node.prev.next = node.next;
        if (node.next != null) node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
    }

    public static void main(String[] args) {
        Node a = new Node(1);
        Node b = new Node(2);
        Node c = new Node(3);
        a.next = b; b.prev = a;
        b.next = c; c.prev = b;

        deleteNode(b);   // O(1) - no need to search for b's predecessor

        System.out.println("a.next = " + a.next.val);   // now points straight to c
        System.out.println("c.prev = " + c.prev.val);
    }
}
// OUTPUT:
// a.next = 3
// c.prev = 1`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the memory trade-off of a doubly linked list vs singly linked?</td><td>Each node stores an extra pointer (prev), roughly doubling per-node pointer overhead, in exchange for backward traversal and O(1) deletion of a known node</td></tr>
<tr class='text-center'><td>Why does LRU Cache use a doubly linked list specifically?</td><td>Moving a recently-used node to the front (or evicting the least-recently-used node at the back) both need O(1) removal-from-current-position plus O(1) insertion-elsewhere - only possible without an O(n) predecessor search because of the prev pointer</td></tr>
<tr class='text-center'><td>What is Java's built-in doubly linked list class?</td><td>java.util.LinkedList implements both List and Deque using a doubly linked internal structure</td></tr>
</table>`
        }
    ]
};
