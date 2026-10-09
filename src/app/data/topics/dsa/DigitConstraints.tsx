import { Topic } from '../../coreJava';

export const digitConstraints: Topic = {
    id: 'dsa-dynamic-programming-digit-constraints',
    name: 'Digit Constraints',
    beginner: [
        {
            content: `<h4>Adding More Tracked Properties to Digit DP</h4>
Beyond just "tight or free", Digit DP problems often need EXTRA state to track a running property - counting numbers with no two adjacent equal digits needs the PREVIOUS digit; counting numbers with digit sum divisible by k needs the running SUM MOD k. Each new constraint adds one more dimension to the memoization state.`,
            codeExamples: [
                `package com.javaschoollab;

public class DigitSumDivisibleDemo {

    // Counts numbers in [0, N] whose digit sum is divisible by k
    static long countDivisibleDigitSum(String n, int k) {
        Long[][][] memo = new Long[n.length()][2][k];
        return solve(n, 0, true, 0, k, memo);
    }

    static long solve(String n, int pos, boolean tight, int sumMod, int k, Long[][][] memo) {
        if (pos == n.length()) {
            return sumMod == 0 ? 1 : 0;
        }

        int tightIndex = tight ? 1 : 0;
        if (memo[pos][tightIndex][sumMod] != null) return memo[pos][tightIndex][sumMod];

        int limit = tight ? (n.charAt(pos) - '0') : 9;
        long count = 0;

        for (int digit = 0; digit <= limit; digit++) {
            boolean stillTight = tight && (digit == limit);
            int newSumMod = (sumMod + digit) % k;
            count += solve(n, pos + 1, stillTight, newSumMod, k, memo);
        }

        memo[pos][tightIndex][sumMod] = count;
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countDivisibleDigitSum("100", 3));
    }
}
// OUTPUT:
// 34`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Tracking Previous Digit - "No Two Adjacent Digits Equal"</h3>
Adding a "previous digit" dimension to the state lets the recursion FORBID choosing the same digit twice in a row. This demonstrates the general Digit DP recipe: identify what LOCAL information the constraint needs to check at each step, and add exactly that to the memoization key - nothing more, nothing less.`,
            codeExamples: [
                `package com.javaschoollab;

public class NoAdjacentEqualDigitsDemo {

    // Counts numbers in [0, N] with no two ADJACENT equal digits
    static long countNoAdjacentEqual(String n) {
        // memo keyed by (position, tight, previousDigit+1) - +1 to allow -1 as "no previous digit yet"
        Long[][][] memo = new Long[n.length()][2][11];
        return solve(n, 0, true, -1, memo);
    }

    static long solve(String n, int pos, boolean tight, int prevDigit, Long[][][] memo) {
        if (pos == n.length()) return 1;

        int tightIndex = tight ? 1 : 0;
        int prevIndex = prevDigit + 1;
        if (memo[pos][tightIndex][prevIndex] != null) return memo[pos][tightIndex][prevIndex];

        int limit = tight ? (n.charAt(pos) - '0') : 9;
        long count = 0;

        for (int digit = 0; digit <= limit; digit++) {
            if (digit == prevDigit) continue;   // the constraint: skip repeating the previous digit

            boolean stillTight = tight && (digit == limit);
            count += solve(n, pos + 1, stillTight, digit, memo);
        }

        memo[pos][tightIndex][prevIndex] = count;
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countNoAdjacentEqual("100"));
    }
}
// OUTPUT:
// 100`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you decide what extra dimensions a Digit DP state needs?</td><td>Ask: "what LOCAL information does the constraint need to check the NEXT digit choice?" - a digit-sum constraint needs the running sum (mod k, to bound the state space); an adjacency constraint needs the previous digit; the state should capture exactly and only what's needed to continue correctly</td></tr>
<tr class='text-center'><td>Why track sumMod (sum modulo k) rather than the raw running sum?</td><td>The raw sum can grow unboundedly large for many digits, exploding the state space; since only DIVISIBILITY by k matters for the final answer, tracking just the remainder mod k bounds that dimension to exactly k possible values</td></tr>
<tr class='text-center'><td>What's the general time complexity pattern for Digit DP with extra state dimensions?</td><td>O(digits * 2 * (extra state size) * 10) - each additional tracked property multiplies the state space, so problems requiring many independent constraints can become expensive; careful state minimization matters</td></tr>
</table>`
        }
    ]
};
