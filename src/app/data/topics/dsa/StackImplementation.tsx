import { Topic } from '../../coreJava';

export const stackImplementation: Topic = {
    id: 'dsa-stack-stack-implementation',
    name: 'Stack Implementation',
    beginner: [
        {
            content: `<h4>What is a Stack?</h4>
A stack is a LIFO (Last In, First Out) structure - the last element pushed is the first one popped, like a stack of plates. Three core operations, all O(1):
<ul>
<li><code>push(x)</code> - add to the top</li>
<li><code>pop()</code> - remove and return the top</li>
<li><code>peek()</code> - look at the top without removing it</li>
</ul>
Java's <code>Deque</code> (via <code>ArrayDeque</code>) is the recommended stack implementation - <code>java.util.Stack</code> is legacy and synchronized (slower, unneeded overhead for single-threaded use).

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:160px;height:auto;font-family:monospace">
  <rect x="20" y="20" width="80" height="28" fill="#ecfdf5" stroke="#059669"/><text x="60" y="39" text-anchor="middle" font-size="12" fill="#065f46">30 (top)</text>
  <rect x="20" y="48" width="80" height="28" fill="#fff7ed" stroke="#ea580c"/><text x="60" y="67" text-anchor="middle" font-size="12" fill="#9a3412">20</text>
  <rect x="20" y="76" width="80" height="28" fill="#fff7ed" stroke="#ea580c"/><text x="60" y="95" text-anchor="middle" font-size="12" fill="#9a3412">10</text>
  <line x1="20" y1="104" x2="100" y2="104" stroke="#374151" stroke-width="2"/>
  <text x="60" y="120" text-anchor="middle" font-size="10" fill="#6b7280">bottom</text>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class StackBasicsDemo {
    public static void main(String[] args) {
        Deque<Integer> stack = new ArrayDeque<>();   // preferred over java.util.Stack

        stack.push(10);
        stack.push(20);
        stack.push(30);

        System.out.println("Top (peek): " + stack.peek());
        System.out.println("Pop       : " + stack.pop());
        System.out.println("Top now   : " + stack.peek());
        System.out.println("Size      : " + stack.size());
    }
}
// OUTPUT:
// Top (peek): 30
// Pop       : 30
// Top now   : 20
// Size      : 2`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Array-Backed vs Linked-List-Backed Stack</h3>
<code>ArrayDeque</code> is backed by a resizable circular array - amortized O(1) push/pop with excellent cache locality, no per-node pointer overhead. A hand-rolled linked-list-backed stack is simpler to reason about (push/pop just manipulate the head) but pays for a Node allocation and pointer chasing on every operation. This is exactly why the JDK recommends <code>ArrayDeque</code> over building your own linked stack, and over the legacy <code>Stack</code> class.`,
            codeExamples: [
                `package com.javaschoollab;

public class LinkedListStackDemo {

    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static class Stack {
        private Node top;

        void push(int val) {
            Node newNode = new Node(val);
            newNode.next = top;
            top = newNode;
        }

        int pop() {
            if (top == null) throw new RuntimeException("Stack is empty");
            int val = top.val;
            top = top.next;
            return val;
        }

        int peek() {
            if (top == null) throw new RuntimeException("Stack is empty");
            return top.val;
        }

        boolean isEmpty() {
            return top == null;
        }
    }

    public static void main(String[] args) {
        Stack stack = new Stack();
        stack.push(1);
        stack.push(2);
        stack.push(3);

        while (!stack.isEmpty()) {
            System.out.print(stack.pop() + " ");
        }
    }
}
// OUTPUT:
// 3 2 1`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the JDK recommend ArrayDeque over java.util.Stack?</td><td>Stack extends the legacy synchronized Vector, adding unnecessary locking overhead for single-threaded use; ArrayDeque is unsynchronized and faster, explicitly documented as the preferred stack implementation</td></tr>
<tr class='text-center'><td>What's the amortized time complexity of push on a resizable-array-backed stack?</td><td>O(1) amortized - most pushes are O(1), and the occasional resize (doubling capacity, copying all elements) is O(n) but happens rarely enough that it averages out to O(1) per operation</td></tr>
<tr class='text-center'><td>How would you implement a stack using two queues, or vice versa?</td><td>Classic exercise: a queue-based stack makes push O(n) (rotate the queue after adding) or pop O(n), depending which operation you optimize - it's a good way to test understanding of the FIFO vs LIFO distinction</td></tr>
</table>`
        }
    ]
};
