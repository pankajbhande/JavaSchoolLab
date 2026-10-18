import { Topic } from '../../coreJava';

export const previousGreaterSmaller: Topic = {
    id: 'dsa-stack-previous-greater-smaller',
    name: 'Previous Greater / Smaller',
    beginner: [
        {
            content: `<h4>Looking LEFT Instead of Right</h4>
"Previous Greater/Smaller Element" asks the mirror question of Next Greater/Smaller: for each element, find the nearest one to its LEFT that is bigger (or smaller). Same monotonic stack technique, just scanned left to right while comparing against elements that came BEFORE - so a match is recorded immediately (no deferred pop-and-record needed).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class PreviousGreaterElementDemo {

    static int[] previousGreaterElements(int[] arr) {
        int n = arr.length;
        int[] result = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();   // decreasing stack of VALUES

        for (int i = 0; i < n; i++) {
            // Pop anything that's not bigger than the current element -
            // it can never be the "previous greater" for anything after this point either
            while (!stack.isEmpty() && stack.peek() <= arr[i]) {
                stack.pop();
            }
            result[i] = stack.isEmpty() ? -1 : stack.peek();
            stack.push(arr[i]);
        }
        return result;
    }

    public static void main(String[] args) {
        int[] arr = {4, 5, 2, 10, 8};
        System.out.println(Arrays.toString(previousGreaterElements(arr)));
    }
}
// OUTPUT:
// [-1, -1, 5, -1, 10]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "Previous" Problems Resolve in ONE Pass, "Next" Problems Sometimes Don't</h3>
Previous-element problems always know the answer the moment they visit a position (everything relevant is already on the stack, to the left). Next-element problems must WAIT until a qualifying element appears later, which is why Next Greater/Smaller stores indices and fills in the result array as a side effect of popping, while Previous Greater/Smaller can fill in the result array directly, inline, as it goes.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class PreviousSmallerElementDemo {

    static int[] previousSmallerElements(int[] arr) {
        int n = arr.length;
        int[] result = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();   // increasing stack of values

        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && stack.peek() >= arr[i]) {
                stack.pop();
            }
            result[i] = stack.isEmpty() ? -1 : stack.peek();
            stack.push(arr[i]);
        }
        return result;
    }

    public static void main(String[] args) {
        int[] arr = {4, 8, 5, 2, 25};
        System.out.println(Arrays.toString(previousSmallerElements(arr)));
    }
}
// OUTPUT:
// [-1, 4, 4, -1, 2]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can you push values directly instead of indices for Previous Greater/Smaller?</td><td>Yes when only the VALUE is needed - unlike Next Greater/Smaller, there's no deferred lookup requiring you to track WHERE the answer came from, since the answer is resolved immediately at each position</td></tr>
<tr class='text-center'><td>How would Largest Rectangle in Histogram use previous-smaller specifically?</td><td>The nearest strictly-shorter bar to the LEFT gives the left boundary of the widest rectangle that bar's height can span - computed with exactly this previous-smaller-element pattern</td></tr>
<tr class='text-center'><td>What happens with duplicate values - does >= or > matter for correctness?</td><td>It determines tie-breaking: using >= treats equal elements as "not previous greater" (they get popped), which matters for problems needing a STRICT previous greater rather than greater-or-equal</td></tr>
</table>`
        }
    ]
};
