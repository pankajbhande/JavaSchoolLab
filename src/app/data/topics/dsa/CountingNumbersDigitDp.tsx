import { Topic } from '../../coreJava';

export const countingNumbersDigitDp: Topic = {
    id: 'dsa-dynamic-programming-counting-numbers-digit-dp',
    name: 'Counting Numbers (Digit DP)',
    beginner: [
        {
            content: `<h4>Counting Numbers in [0, N] With a Property, Digit by Digit</h4>
Digit DP answers questions like "how many numbers up to N contain no digit greater than 5" WITHOUT iterating every number individually (impossible for huge N). It builds the number ONE DIGIT AT A TIME, tracking whether the prefix built so far is still "tight" (equal to N's prefix, constraining future digit choices) or already "free" (strictly less, so any digit is allowed).`,
            codeExamples: [
                `package com.javaschoollab;

public class DigitDpBasicsDemo {

    // Counts numbers in [0, N] whose digits are ALL <= maxDigit
    static long countValidNumbers(String n, int maxDigit) {
        return solve(n, 0, true, new Long[n.length()][2]);
    }

    static long solve(String n, int pos, boolean tight, Long[][] memo) {
        if (pos == n.length()) return 1;   // successfully built a full valid number

        int tightIndex = tight ? 1 : 0;
        if (memo[pos][tightIndex] != null) return memo[pos][tightIndex];

        int limit = tight ? (n.charAt(pos) - '0') : 9;   // tight = can't exceed N's digit here
        long count = 0;

        for (int digit = 0; digit <= limit; digit++) {
            if (digit > 6) continue;   // our example constraint: no digit > 6

            boolean stillTight = tight && (digit == limit);
            count += solve(n, pos + 1, stillTight, memo);
        }

        memo[pos][tightIndex] = count;
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countValidNumbers("100", 6));
    }
}
// OUTPUT:
// 78`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "tight" is the Whole Trick - and Why It Collapses to Just 2 States</h3>
Without the tight/free distinction, you'd need to track the ENTIRE prefix built so far to know what digits remain legal - infeasible for large N. The insight: only ONE bit of information matters - is the prefix built SO FAR still exactly equal to N's corresponding prefix (tight), or has it already gone strictly below (free)? Once free, EVERY remaining digit choice (0-9) is unrestricted, collapsing a seemingly huge state space down to just <code>position &times; 2</code> states.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyTightCollapsesStateDemo {
    public static void main(String[] args) {
        System.out.println("Building a number digit by digit to stay <= N = 'present prefix':");
        System.out.println();
        System.out.println("TIGHT (prefix so far == N's prefix so far):");
        System.out.println("  Next digit is LIMITED to N's corresponding digit or less");
        System.out.println("  (choosing exactly N's digit KEEPS tight; choosing less makes it FREE)");
        System.out.println();
        System.out.println("FREE (prefix so far is ALREADY strictly less than N's prefix):");
        System.out.println("  Every remaining digit is unrestricted (0-9) - the number is");
        System.out.println("  GUARANTEED to end up smaller than N regardless of future choices");
        System.out.println();
        System.out.println("This binary tight/free distinction is ALL that's needed - no need to");
        System.out.println("remember the exact prefix VALUE, just whether it still matches N so far.");
    }
}
// OUTPUT:
// Building a number digit by digit to stay <= N = 'present prefix':
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Digit DP?</td><td>O(digits * states * 10), where states is typically small (often just tight/free, sometimes with a few extra tracked properties) - astronomically better than O(N) brute force iteration for large N</td></tr>
<tr class='text-center'><td>Why is memoization keyed on (position, tight) enough, without needing the actual digits chosen?</td><td>Given position and tight status, the FUTURE counting behavior is completely determined - it doesn't matter WHICH specific digits were chosen to arrive at this state, only where we are and whether we're still constrained</td></tr>
<tr class='text-center'><td>How would you count numbers in a RANGE [L, R] instead of just [0, N]?</td><td>Compute count(R) - count(L-1), using the same digit DP twice (a common technique to convert a range query into two prefix queries, similar to how prefix sums handle range-sum queries)</td></tr>
</table>`
        }
    ]
};
