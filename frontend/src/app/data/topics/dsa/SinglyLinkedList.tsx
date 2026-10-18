import { Topic } from '../../coreJava';

export const singlyLinkedList: Topic = {
    id: 'dsa-linked-list-singly-linked-list',
    name: 'Singly Linked List',
    beginner: [
        {
            content: `<h4>What is a Singly Linked List?</h4>
A chain of <b>nodes</b>, each holding a value and a reference to the NEXT node - unlike an array, the elements are NOT contiguous in memory.
<ul>
<li><b>head</b> points to the first node; the last node's <code>next</code> is <code>null</code>.</li>
<li>Insertion/deletion at the FRONT is O(1) - no shifting needed, unlike an array.</li>
<li>Random access (<code>get(i)</code>) is O(n) - there's no direct index, you must walk from the head.</li>
</ul>

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 460 80" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:monospace">
  <text x="10" y="16" font-size="12" fill="#374151">head</text>
  <g font-size="13">
    <rect x="10" y="24" width="60" height="32" fill="#fff7ed" stroke="#ea580c"/><text x="40" y="45" text-anchor="middle" fill="#9a3412">10</text>
    <line x1="70" y1="40" x2="105" y2="40" stroke="#6b7280" marker-end="url(#arrow)"/>
    <rect x="110" y="24" width="60" height="32" fill="#fff7ed" stroke="#ea580c"/><text x="140" y="45" text-anchor="middle" fill="#9a3412">20</text>
    <line x1="170" y1="40" x2="205" y2="40" stroke="#6b7280" marker-end="url(#arrow)"/>
    <rect x="210" y="24" width="60" height="32" fill="#fff7ed" stroke="#ea580c"/><text x="240" y="45" text-anchor="middle" fill="#9a3412">30</text>
    <line x1="270" y1="40" x2="305" y2="40" stroke="#6b7280" marker-end="url(#arrow)"/>
    <text x="315" y="45" font-size="12" fill="#6b7280">null</text>
  </g>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6b7280"/></marker></defs>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

public class SinglyLinkedListDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static class LinkedList {
        Node head;

        void addFirst(int val) {
            Node newNode = new Node(val);
            newNode.next = head;   // point the new node at the current head
            head = newNode;         // new node becomes the head
        }

        void printList() {
            Node current = head;
            while (current != null) {
                System.out.print(current.val + " -> ");
                current = current.next;
            }
            System.out.println("null");
        }
    }

    public static void main(String[] args) {
        LinkedList list = new LinkedList();
        list.addFirst(30);
        list.addFirst(20);
        list.addFirst(10);
        list.printList();
    }
}
// OUTPUT:
// 10 -> 20 -> 30 -> null`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Insertion at a Given Position and Deletion</h3>
Both require walking to the node just BEFORE the target position, then relinking pointers - O(n) to reach the position, O(1) for the relink itself. This is the opposite trade-off from an array: linked lists are cheap to modify once you're AT the right spot, expensive to get there; arrays are the reverse.`,
            codeExamples: [
                `package com.javaschoollab;

public class LinkedListOpsDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static Node insertAt(Node head, int index, int val) {
        Node newNode = new Node(val);
        if (index == 0) {
            newNode.next = head;
            return newNode;   // new head
        }
        Node prev = head;
        for (int i = 0; i < index - 1; i++) {
            prev = prev.next;   // walk to the node BEFORE the insertion point
        }
        newNode.next = prev.next;
        prev.next = newNode;
        return head;
    }

    static Node deleteAt(Node head, int index) {
        if (index == 0) return head.next;   // removing the head itself
        Node prev = head;
        for (int i = 0; i < index - 1; i++) {
            prev = prev.next;
        }
        prev.next = prev.next.next;   // skip over the deleted node
        return head;
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
        head.next.next = new Node(4);

        head = insertAt(head, 2, 3);   // insert 3 at index 2
        print(head);

        head = deleteAt(head, 0);      // remove the head
        print(head);
    }
}
// OUTPUT:
// 1 -> 2 -> 3 -> 4 -> null
// 2 -> 3 -> 4 -> null`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is insertion at the front O(1) for a linked list but O(n) for an array?</td><td>A linked list just repoints head to a new node; an array must shift every existing element one slot to the right to make room at index 0</td></tr>
<tr class='text-center'><td>Why is random access O(n) for a linked list?</td><td>There's no formula to jump directly to index i like arr[i] - the only way to reach node i is by following next pointers from the head, one node at a time</td></tr>
<tr class='text-center'><td>When would you choose a LinkedList over an ArrayList in Java?</td><td>Rarely in practice - ArrayList's cache locality usually wins even for front-insertion-heavy workloads; a genuine linked-list win is when you already hold a reference to the node and need O(1) insertion/deletion AT that exact node without re-searching</td></tr>
</table>`
        }
    ]
};
