import { Topic } from '../../coreJava';

export const bitmasking: Topic = {
    id: 'dsa-bit-manipulation-bitmasking',
    name: 'Bitmasking',
    beginner: [
        {
            content: `<h4>Representing a Set of Choices as a Single Integer</h4>
A BITMASK uses each bit of an integer to represent whether one item is INCLUDED (1) or EXCLUDED (0) from a set. For <code>n</code> items, an integer from <code>0</code> to <code>2&#8319; - 1</code> can represent EVERY possible subset - enumerating all <code>2&#8319;</code> masks enumerates all subsets.`,
            codeExamples: [
                `package com.javaschoollab;

public class EnumerateSubsetsDemo {
    public static void main(String[] args) {
        String[] items = {"Pen", "Book", "Bag"};
        int n = items.length;

        for (int mask = 0; mask < (1 << n); mask++) {
            StringBuilder subset = new StringBuilder();
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    subset.append(items[i]).append(" ");
                }
            }
            System.out.println("Mask " + mask + " -> " + subset.toString().trim());
        }
    }
}
// OUTPUT:
// Mask 0 ->
// Mask 1 -> Pen
// Mask 2 -> Book
// Mask 3 -> Pen Book
// Mask 4 -> Bag
// Mask 5 -> Pen Bag
// Mask 6 -> Book Bag
// Mask 7 -> Pen Book Bag`
            ],
            codeExplanations: [
                `mask counts from 0 up to 2^n - 1, where n is the number of items - every integer in that range has a unique pattern of 3 bits, and every possible pattern of 3 bits is visited exactly once. For each mask, the inner loop checks bit i with (mask & (1 << i)): a 1 there means item i is included in that mask's subset. Since every combination of "each item in or out" corresponds to exactly one integer, looping over all masks enumerates every one of the 8 possible subsets, from the empty set (mask 0) to all three items (mask 7).`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Bitmask as DP/Backtracking State - Traveling Salesman Style</h3>
Beyond enumeration, a bitmask can represent "which subset of cities/tasks/items has been VISITED/USED so far", used as the STATE in DP or search. This compresses an otherwise unwieldy set-membership state into a single integer that's cheap to compare, hash, and transition (via OR to add an item, AND-NOT to remove one).`,
            codeExamples: [
                `package com.javaschoollab;

public class VisitedSetAsMaskDemo {

    // Demonstrates bitmask transitions used in state-space search (e.g. TSP-style DP)
    public static void main(String[] args) {
        int n = 4;
        int visited = 0;   // no city visited yet

        visited |= (1 << 0);   // visit city 0
        visited |= (1 << 2);   // visit city 2
        System.out.println("Visited mask: " + Integer.toBinaryString(visited));

        boolean allVisited = visited == (1 << n) - 1;
        System.out.println("All visited? " + allVisited);

        visited &= ~(1 << 0);   // backtrack: un-visit city 0
        System.out.println("After backtrack: " + Integer.toBinaryString(visited));
    }
}
// OUTPUT:
// Visited mask: 101
// All visited? false
// After backtrack: 100`
            ],
            codeExplanations: [
                `visited |= (1 << 0) and visited |= (1 << 2) turn on bits 0 and 2, giving the pattern 101 - representing "cities 0 and 2 have been visited." Comparing visited against (1 << n) - 1 (all n bits set) checks whether every city has been visited; here it correctly reports false since city 1 and 3 aren't set. visited &= ~(1 << 0) then clears bit 0 specifically - a classic backtracking "undo" step - dropping the pattern back to 100 (only city 2 remains marked visited).`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is bitmask enumeration limited to small n (typically n &le; 20-25)?</td><td>The number of masks is 2^n - it grows exponentially, so 20 items already means over a million masks; anything larger becomes computationally infeasible for exhaustive enumeration</td></tr>
<tr class='text-center'><td>How do you check if mask represents "all n items included"?</td><td>Compare mask == (1 << n) - 1 - that expression produces exactly n consecutive 1 bits, the mask value representing full inclusion</td></tr>
<tr class='text-center'><td>Why use a bitmask instead of a boolean array or HashSet for "visited" state in DP?</td><td>A bitmask is a single primitive int/long - cheap to copy, compare with ==, and use directly as a HashMap/array key, whereas a boolean array or HashSet needs deep comparison and more memory per state, which matters a lot when the DP has millions of states</td></tr>
</table>`
        }
    ]
};
