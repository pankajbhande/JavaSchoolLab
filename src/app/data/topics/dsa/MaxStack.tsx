import { Topic } from '../../coreJava';

export const maxStack: Topic = {
    id: 'dsa-stack-max-stack',
    name: 'Max Stack',
    beginner: [
        {
            content: `<h4>Max Stack - Same Idea as Min Stack, Mirrored</h4>
Identical to Min Stack, just tracking the MAXIMUM instead of the minimum: a second stack mirrors the main one, always holding "the largest value seen so far at this depth".`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class MaxStackDemo {

    static class MaxStack {
        private final Deque<Integer> stack = new ArrayDeque<>();
        private final Deque<Integer> maxStack = new ArrayDeque<>();

        void push(int val) {
            stack.push(val);
            maxStack.push(maxStack.isEmpty() ? val : Math.max(val, maxStack.peek()));
        }

        int pop() {
            maxStack.pop();
            return stack.pop();
        }

        int top() {
            return stack.peek();
        }

        int peekMax() {
            return maxStack.peek();
        }
    }

    public static void main(String[] args) {
        MaxStack ms = new MaxStack();
        ms.push(5);
        ms.push(1);
        ms.push(5);
        System.out.println("Max: " + ms.peekMax());
        System.out.println("Pop: " + ms.pop());
        System.out.println("Max after pop: " + ms.peekMax());
    }
}
// OUTPUT:
// Max: 5
// Pop: 5
// Max after pop: 5`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Hard Follow-up: popMax() - Remove the Maximum, Not Just the Top</h3>
LeetCode's actual "Max Stack" problem also requires <code>popMax()</code>: remove the LARGEST element wherever it sits in the stack, not just at the top - while preserving relative order of everything else. This can't be solved with just two parallel stacks; it needs a structure supporting removal from the middle, like a <code>TreeMap</code> of value &rarr; stack of positions, paired with a doubly linked list for O(log n) popMax.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class MaxStackWithPopMaxDemo {

    static class Node {
        int val;
        Node prev, next;
        Node(int val) { this.val = val; }
    }

    static class MaxStack {
        private final Node head = new Node(-1), tail = new Node(-1);
        private final TreeMap<Integer, Deque<Node>> valueToNodes = new TreeMap<>();

        MaxStack() {
            head.next = tail;
            tail.prev = head;
        }

        void push(int val) {
            Node node = new Node(val);
            node.prev = tail.prev;
            node.next = tail;
            tail.prev.next = node;
            tail.prev = node;
            valueToNodes.computeIfAbsent(val, k -> new ArrayDeque<>()).push(node);
        }

        int top() {
            return tail.prev.val;
        }

        int peekMax() {
            return valueToNodes.lastKey();
        }

        int popMax() {
            int maxVal = valueToNodes.lastKey();
            Node node = valueToNodes.get(maxVal).pop();
            if (valueToNodes.get(maxVal).isEmpty()) valueToNodes.remove(maxVal);

            node.prev.next = node.next;   // O(1) removal from the middle of the list
            node.next.prev = node.prev;
            return maxVal;
        }
    }

    public static void main(String[] args) {
        MaxStack ms = new MaxStack();
        ms.push(5);
        ms.push(1);
        ms.push(5);
        System.out.println(ms.popMax());   // removes ONE of the 5s (most recent)
        System.out.println(ms.top());       // 1 - the 5 in the middle is gone, top unaffected
        System.out.println(ms.peekMax());   // 5 - the other 5 remains
    }
}
// OUTPUT:
// 5
// 1
// 5`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the simple two-stack approach fail for popMax()?</td><td>Removing an arbitrary element from the MIDDLE of an array-backed stack is O(n) (everything above must shift), and the auxiliary max-stack has no way to "remove from the middle" and recompute correctly without a full rescan</td></tr>
<tr class='text-center'><td>Why pair a TreeMap with a doubly linked list for the full solution?</td><td>TreeMap gives O(log n) access to the current maximum value; the doubly linked list gives O(1) removal of a specific node once located, since each node already knows its own neighbors</td></tr>
<tr class='text-center'><td>What's the time complexity of push, pop, top, peekMax, and popMax in the full solution?</td><td>push/pop/top are O(log n) (TreeMap insertion), peekMax is O(log n) (TreeMap.lastKey), popMax is O(log n) - all logarithmic, versus O(n) for a naive middle-removal approach</td></tr>
</table>`
        }
    ]
};
