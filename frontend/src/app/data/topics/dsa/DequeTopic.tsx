import { Topic } from '../../coreJava';

export const dequeTopic: Topic = {
    id: 'dsa-queue-deque-deque',
    name: 'Deque',
    beginner: [
        {
            content: `<h4>What is a Deque?</h4>
A Deque (Double-Ended Queue) allows O(1) insertion AND removal at BOTH ends - it generalizes both a stack (use only one end) and a queue (use front for one op, back for the other). Java's <code>Deque</code> interface, backed by <code>ArrayDeque</code>, is genuinely the Swiss Army knife of the collections framework.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class DequeBasicsDemo {
    public static void main(String[] args) {
        Deque<Integer> deque = new ArrayDeque<>();

        deque.addFirst(2);
        deque.addFirst(1);
        deque.addLast(3);
        deque.addLast(4);

        System.out.println(deque);   // [1, 2, 3, 4]

        System.out.println("removeFirst: " + deque.removeFirst());
        System.out.println("removeLast : " + deque.removeLast());
        System.out.println(deque);
    }
}
// OUTPUT:
// [1, 2, 3, 4]
// removeFirst: 1
// removeLast : 4
// [2, 3]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Deque as a Stack AND a Queue - Why It Replaced Both</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Usage</th><th>push/pop equivalent</th></tr>
<tr class='text-center'><td>As a stack</td><td>push() = addFirst(), pop() = removeFirst() - both operate on the same end</td></tr>
<tr class='text-center'><td>As a queue</td><td>offer() = addLast(), poll() = removeFirst() - opposite ends</td></tr>
</table>
This is exactly why the JDK documentation recommends <code>ArrayDeque</code> over BOTH <code>java.util.Stack</code> and <code>LinkedList</code> as a queue - one class, faster than either legacy alternative, with no synchronization overhead.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class DequeAsStackAndQueueDemo {
    public static void main(String[] args) {
        // Using Deque as a STACK (LIFO)
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        System.out.println("Stack pop: " + stack.pop());   // 3 - last in, first out

        // Using Deque as a QUEUE (FIFO)
        Deque<Integer> queue = new ArrayDeque<>();
        queue.offer(1);
        queue.offer(2);
        queue.offer(3);
        System.out.println("Queue poll: " + queue.poll());   // 1 - first in, first out
    }
}
// OUTPUT:
// Stack pop: 3
// Queue poll: 1`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is ArrayDeque preferred over java.util.Stack and LinkedList as a Queue?</td><td>ArrayDeque avoids the legacy Stack's unnecessary synchronization overhead, and avoids LinkedList's per-node allocation/pointer-chasing cost - it's an unsynchronized, array-backed, cache-friendly implementation</td></tr>
<tr class='text-center'><td>What DSA problems specifically require a deque (not just a queue or stack alone)?</td><td>Sliding Window Maximum (needs to remove from both ends), palindrome checking (compare from both ends), and 0-1 BFS (push to front for 0-weight edges, back for 1-weight edges)</td></tr>
<tr class='text-center'><td>Can ArrayDeque hold null elements?</td><td>No - null is used internally as a sentinel to indicate "empty slot", so ArrayDeque explicitly forbids null elements (unlike LinkedList, which does allow them)</td></tr>
</table>`
        }
    ]
};
