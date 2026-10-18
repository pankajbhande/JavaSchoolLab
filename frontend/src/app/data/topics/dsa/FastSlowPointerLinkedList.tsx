import { Topic } from '../../coreJava';

export const fastSlowPointerLinkedList: Topic = {
    id: 'dsa-linked-list-fast-slow-pointer',
    name: 'Fast & Slow Pointer',
    beginner: [
        {
            content: `<h4>Finding the Middle Node</h4>
Beyond cycle detection, fast/slow pointers solve "find the middle in one pass" cleanly: when <code>fast</code> (2 steps) reaches the end, <code>slow</code> (1 step) is exactly at the middle - no need to count the length first and walk again.`,
            codeExamples: [
                `package com.javaschoollab;

public class MiddleOfLinkedListDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static Node findMiddle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;   // middle (or the second of two middles for even length)
    }

    public static void main(String[] args) {
        Node head = new Node(1);
        head.next = new Node(2);
        head.next.next = new Node(3);
        head.next.next.next = new Node(4);
        head.next.next.next.next = new Node(5);

        System.out.println("Middle: " + findMiddle(head).val);
    }
}
// OUTPUT:
// Middle: 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Palindrome Linked List - Combining Three Techniques</h3>
Checking if a linked list reads the same forward and backward, in O(n) time and O(1) extra space, combines THREE fast/slow-pointer-family techniques in sequence: find the middle, reverse the second half, then compare both halves node by node.`,
            codeExamples: [
                `package com.javaschoollab;

public class PalindromeLinkedListDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static boolean isPalindrome(Node head) {
        if (head == null || head.next == null) return true;

        // Step 1: find the middle using fast/slow
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }

        // Step 2: reverse the second half, starting from slow
        Node secondHalf = reverse(slow);

        // Step 3: compare the first half against the reversed second half
        Node p1 = head, p2 = secondHalf;
        boolean result = true;
        while (p2 != null) {
            if (p1.val != p2.val) {
                result = false;
                break;
            }
            p1 = p1.next;
            p2 = p2.next;
        }
        return result;
    }

    static Node reverse(Node head) {
        Node prev = null;
        while (head != null) {
            Node next = head.next;
            head.next = prev;
            prev = head;
            head = next;
        }
        return prev;
    }

    public static void main(String[] args) {
        Node a = new Node(1);
        a.next = new Node(2);
        a.next.next = new Node(2);
        a.next.next.next = new Node(1);

        System.out.println(isPalindrome(a));
    }
}
// OUTPUT:
// true`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the "find middle" trick give the SECOND middle on an even-length list?</td><td>When fast reaches exactly the end (fast == null) after an even number of nodes, slow has advanced n/2 times, landing on the second of the two middle nodes - a deliberate, useful convention for the palindrome check</td></tr>
<tr class='text-center'><td>Is the palindrome check's O(1) space claim really true if it reverses half the list?</td><td>Yes - the reversal happens IN PLACE by rewiring existing next pointers, no new nodes or auxiliary array are allocated</td></tr>
<tr class='text-center'><td>What's a courtesy step a careful implementation would add after the palindrome check?</td><td>Re-reverse the second half back to restore the original list structure, if the caller shouldn't observe the list being mutated</td></tr>
</table>`
        }
    ]
};
