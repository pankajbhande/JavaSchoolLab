import { Topic } from '../../coreJava';

export const stockSpan: Topic = {
    id: 'dsa-stack-stock-span',
    name: 'Stock Span',
    beginner: [
        {
            content: `<h4>The Stock Span Problem</h4>
For each day's stock price, the "span" is how many CONSECUTIVE days (ending today, going backward) had a price &le; today's price. This is Previous Greater Element in disguise: the span is the distance back to the nearest previous day with a STRICTLY GREATER price (or back to the start, if none).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class StockSpanDemo {

    static int[] calculateSpan(int[] prices) {
        int n = prices.length;
        int[] span = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();   // holds indices, decreasing price

        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && prices[stack.peek()] <= prices[i]) {
                stack.pop();   // this earlier day cannot be anyone's boundary anymore
            }
            span[i] = stack.isEmpty() ? (i + 1) : (i - stack.peek());
            stack.push(i);
        }
        return span;
    }

    public static void main(String[] args) {
        int[] prices = {100, 80, 60, 70, 60, 75, 85};
        System.out.println(java.util.Arrays.toString(calculateSpan(prices)));
    }
}
// OUTPUT:
// [1, 1, 1, 2, 1, 4, 6]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Streaming Version - a StockSpanner Class</h3>
The interview follow-up wraps this into a class that processes prices ONE AT A TIME as they arrive (like a live feed), rather than given the whole array up front - the same monotonic stack idea, just maintained as persistent state across calls instead of computed in one function.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class StockSpanner {

    // Each stack entry pairs a price with its span, so popped spans can be reused
    private final Deque<int[]> stack = new ArrayDeque<>();   // {price, span}

    public int next(int price) {
        int span = 1;
        while (!stack.isEmpty() && stack.peek()[0] <= price) {
            span += stack.pop()[1];   // absorb the popped day's span into this one
        }
        stack.push(new int[]{price, span});
        return span;
    }

    public static void main(String[] args) {
        StockSpanner spanner = new StockSpanner();
        int[] prices = {100, 80, 60, 70, 60, 75, 85};
        for (int p : prices) {
            System.out.print(spanner.next(p) + " ");
        }
    }
}
// OUTPUT:
// 1 1 1 2 1 4 6`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why absorb a popped day's span into the new day's span in the streaming version?</td><td>Once a day is popped, its own days-back count is already known to be entirely covered by the new higher price - adding it in avoids re-scanning those days individually</td></tr>
<tr class='text-center'><td>What's the amortized time complexity per call to next()?</td><td>O(1) amortized - same monotonic stack argument: across all calls combined, total pushes and pops are each bounded by the number of calls made</td></tr>
<tr class='text-center'><td>How does stock span relate to Next/Previous Greater Element?</td><td>It's literally Previous Greater Element with the answer expressed as a DISTANCE (days back) instead of a value - the exact same decreasing-stack mechanics apply</td></tr>
</table>`
        }
    ]
};
