import { Topic } from '../../coreJava';

export const monotonicStackTopic: Topic = {
    id: 'dsa-stack-monotonic-stack',
    name: 'Monotonic Stack',
    beginner: [
        {
            content: `<h4>What is a Monotonic Stack?</h4>
A stack maintained so its elements stay in strictly increasing (or decreasing) order from bottom to top - enforced by POPPING any element that would break that order before pushing a new one. It's the go-to tool whenever a problem asks "what's the next/previous element that's bigger/smaller than me?" across a whole array, in O(n) total instead of O(n&sup2;).
<ul>
<li><b>Increasing stack</b> (bottom&rarr;top gets bigger): pop while the top is &ge; the incoming element - used for "next SMALLER element".</li>
<li><b>Decreasing stack</b> (bottom&rarr;top gets smaller): pop while the top is &le; the incoming element - used for "next GREATER element".</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class MonotonicStackDemo {

    // Builds a strictly INCREASING stack (bottom to top), popping anything
    // that is >= the new element before pushing it.
    public static void main(String[] args) {
        int[] arr = {5, 3, 4, 1, 6};
        Deque<Integer> stack = new ArrayDeque<>();   // will end up increasing bottom->top

        for (int num : arr) {
            while (!stack.isEmpty() && stack.peek() >= num) {
                System.out.println("Popping " + stack.pop() + " because " + num + " is smaller/equal");
            }
            stack.push(num);
            System.out.println("Pushed " + num + ", stack now: " + stack);
        }
    }
}
// OUTPUT:
// Pushed 5, stack now: [5]
// Popping 5 because 3 is smaller/equal
// Pushed 3, stack now: [3]
// Pushed 4, stack now: [4, 3]
// Popping 4 because 1 is smaller/equal
// Popping 3 because 1 is smaller/equal
// Pushed 1, stack now: [1]
// Pushed 6, stack now: [6, 1]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Every Element is Pushed and Popped At Most Once - O(n) Total</h3>
It's easy to worry the nested while-loop makes this O(n&sup2;). It doesn't: across the ENTIRE run, every element is pushed exactly once and popped AT MOST once - so total pop operations across all iterations is bounded by n, giving amortized O(1) per element and O(n) overall. This is the same amortized argument used for dynamic array resizing and KMP's LPS fallback.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class MonotonicStackAmortizedProofDemo {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};   // worst case for pop count: strictly increasing input
        Deque<Integer> stack = new ArrayDeque<>();
        int totalPops = 0, totalPushes = 0;

        for (int num : arr) {
            while (!stack.isEmpty() && stack.peek() < num) {
                stack.pop();
                totalPops++;
            }
            stack.push(num);
            totalPushes++;
        }

        System.out.println("n = " + arr.length);
        System.out.println("Total pushes = " + totalPushes + " (exactly n)");
        System.out.println("Total pops   = " + totalPops + " (never exceeds n)");
    }
}
// OUTPUT:
// n = 5
// Total pushes = 5 (exactly n)
// Total pops   = 4 (never exceeds n)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you decide increasing vs decreasing stack for a given problem?</td><td>Ask what you're popping FOR: popping smaller elements when a bigger one arrives (decreasing stack) resolves "next greater"; popping bigger elements when a smaller one arrives (increasing stack) resolves "next smaller"</td></tr>
<tr class='text-center'><td>What class of problems is monotonic stack the standard tool for?</td><td>Next/previous greater or smaller element, largest rectangle in histogram, stock span, trapping rain water, and daily temperatures - anywhere the answer depends on the nearest larger/smaller neighbor</td></tr>
<tr class='text-center'><td>Why store INDICES on the stack instead of values in most implementations?</td><td>Indices let you compute distances/widths (e.g. "how many days until a warmer temperature") once a match is found - the value alone doesn't tell you position</td></tr>
</table>`
        }
    ]
};
