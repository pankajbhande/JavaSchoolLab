import { Topic } from '../../coreJava';

export const minStack: Topic = {
    id: 'dsa-stack-min-stack',
    name: 'Min Stack',
    beginner: [
        {
            content: `<h4>A Stack That Also Tracks Its Minimum, in O(1)</h4>
Design a stack supporting <code>push</code>, <code>pop</code>, <code>top</code>, AND <code>getMin</code> - all O(1). The obvious idea (scan the stack for the minimum) is O(n) per query. The trick: maintain a SECOND stack that tracks the minimum-so-far at each point in time, growing and shrinking in lockstep with the main stack.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class MinStackDemo {

    static class MinStack {
        private final Deque<Integer> stack = new ArrayDeque<>();
        private final Deque<Integer> minStack = new ArrayDeque<>();   // tracks running minimum

        void push(int val) {
            stack.push(val);
            // push the SMALLER of val and the current min - minStack always mirrors stack's size
            minStack.push(minStack.isEmpty() ? val : Math.min(val, minStack.peek()));
        }

        void pop() {
            stack.pop();
            minStack.pop();   // both stacks shrink together, staying in sync
        }

        int top() {
            return stack.peek();
        }

        int getMin() {
            return minStack.peek();   // O(1) - always up to date
        }
    }

    public static void main(String[] args) {
        MinStack ms = new MinStack();
        ms.push(5);
        ms.push(3);
        ms.push(7);
        System.out.println("Min: " + ms.getMin());   // 3
        ms.pop();   // removes 7
        System.out.println("Min: " + ms.getMin());   // still 3
        ms.pop();   // removes 3
        System.out.println("Min: " + ms.getMin());   // back to 5
    }
}
// OUTPUT:
// Min: 3
// Min: 3
// Min: 5`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The O(1) Extra Space Version - One Stack Only</h3>
Instead of a full second stack, store the running minimum in a SINGLE variable, and when a new minimum is pushed, push a specially-encoded value that lets popping restore the previous minimum. This trades a second full stack for pure arithmetic (works well when values fit safely in a wider type like <code>long</code>).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class MinStackOneStackDemo {

    static class MinStack {
        private final Deque<Long> stack = new ArrayDeque<>();
        private long min = Long.MAX_VALUE;

        void push(int val) {
            if (stack.isEmpty()) {
                stack.push((long) val);
                min = val;
            } else if (val >= min) {
                stack.push((long) val);            // normal value, no encoding needed
            } else {
                // encode: push a value that lets us recover the OLD min on pop
                stack.push(2L * val - min);
                min = val;                          // new minimum
            }
        }

        void pop() {
            long top = stack.pop();
            if (top < min) {
                min = 2 * min - top;   // decode: restore the previous minimum
            }
        }

        int top() {
            long top = stack.peek();
            return (int) (top < min ? min : top);   // encoded values aren't the real top
        }

        int getMin() {
            return (int) min;
        }
    }

    public static void main(String[] args) {
        MinStack ms = new MinStack();
        ms.push(5);
        ms.push(3);
        ms.push(7);
        System.out.println("Min: " + ms.getMin() + ", Top: " + ms.top());
        ms.pop();
        System.out.println("Min: " + ms.getMin() + ", Top: " + ms.top());
    }
}
// OUTPUT:
// Min: 3, Top: 7
// Min: 3, Top: 3`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why must the auxiliary min-stack push a value on EVERY push, not just new minimums?</td><td>Keeping it the exact same size as the main stack means pop() can always pop both together, staying in sync - if it only pushed on new minimums, popping would need extra logic to know whether to also pop the min-stack</td></tr>
<tr class='text-center'><td>What's the space trade-off of the two-stack approach vs the one-stack encoding trick?</td><td>Two stacks: O(n) extra space, simple to reason about. One-stack encoding: O(1) extra space (just one long variable), but trickier logic and risk of overflow if not using a wider type</td></tr>
<tr class='text-center'><td>Could you track the min with a single variable and NO second structure at all?</td><td>Not correctly across pops - once the current minimum is popped, you'd have no way to know what the PREVIOUS minimum was without re-scanning, which is exactly the problem this design avoids</td></tr>
</table>`
        }
    ]
};
