import { Topic } from '../../coreJava';

export const mergeLinkedLists: Topic = {
    id: 'dsa-linked-list-merge-linked-lists',
    name: 'Merge Linked Lists',
    beginner: [
        {
            content: `<h4>Merging Two Sorted Linked Lists</h4>
Given two already-sorted linked lists, merge them into one sorted list in O(n + m) time and O(1) extra space (reusing existing nodes) - the same core comparison step as the merge phase of Merge Sort, just applied to linked nodes instead of array slots.`,
            codeExamples: [
                `package com.javaschoollab;

public class MergeTwoSortedListsDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static Node mergeTwoLists(Node l1, Node l2) {
        Node dummy = new Node(-1);   // placeholder simplifies edge cases at the head
        Node tail = dummy;

        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                tail.next = l1;
                l1 = l1.next;
            } else {
                tail.next = l2;
                l2 = l2.next;
            }
            tail = tail.next;
        }
        tail.next = (l1 != null) ? l1 : l2;   // attach whichever list has leftovers

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
        Node l1 = new Node(1);
        l1.next = new Node(3);
        l1.next.next = new Node(5);

        Node l2 = new Node(2);
        l2.next = new Node(4);
        l2.next.next = new Node(6);

        print(mergeTwoLists(l1, l2));
    }
}
// OUTPUT:
// 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> null`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Merging K Sorted Lists with a Min-Heap</h3>
Merging just two lists is O(n + m). Merging K lists naively (repeatedly merging two at a time) is O(K&middot;N) where N is the total node count. A min-heap holding the current HEAD of each list gives O(N log K): always extract the smallest head, advance that list, repeat.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.PriorityQueue;

public class MergeKSortedListsDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static Node mergeKLists(Node[] lists) {
        PriorityQueue<Node> heap = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (Node head : lists) {
            if (head != null) heap.offer(head);
        }

        Node dummy = new Node(-1);
        Node tail = dummy;

        while (!heap.isEmpty()) {
            Node smallest = heap.poll();
            tail.next = smallest;
            tail = tail.next;

            if (smallest.next != null) {
                heap.offer(smallest.next);   // push the next node from the same list
            }
        }
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
        Node l1 = new Node(1); l1.next = new Node(4); l1.next.next = new Node(5);
        Node l2 = new Node(1); l2.next = new Node(3); l2.next.next = new Node(4);
        Node l3 = new Node(2); l3.next = new Node(6);

        print(mergeKLists(new Node[]{l1, l2, l3}));
    }
}
// OUTPUT:
// 1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6 -> null`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use a dummy head node in the merge function?</td><td>It eliminates a special-case check for "is this the very first node" - tail always has something valid to attach to, and the real result is simply dummy.next</td></tr>
<tr class='text-center'><td>Why is the min-heap approach O(N log K) instead of O(N log N)?</td><td>The heap never holds more than K elements at once (one per list) - every poll/offer is O(log K), and there are N total nodes processed, giving O(N log K)</td></tr>
<tr class='text-center'><td>What's the alternative to a min-heap for merging K lists, and its complexity?</td><td>Pairwise merge (merge lists 2 at a time, repeat) gives O(N log K) too, via divide-and-conquer pairing - asymptotically the same as the heap approach, sometimes preferred to avoid heap overhead for small K</td></tr>
</table>`
        }
    ]
};
