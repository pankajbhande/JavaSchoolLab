import { Topic } from '../../coreJava';

export const generateParentheses: Topic = {
    id: 'dsa-recursion-backtracking-generate-parentheses',
    name: 'Generate Parentheses',
    beginner: [
        {
            content: `<h4>All Valid Combinations of N Pairs</h4>
Generate every well-formed combination of N pairs of parentheses. Track two counts as you build the string: <code>open</code> used so far, <code>close</code> used so far. Add <code>'('</code> whenever <code>open &lt; n</code>; add <code>')'</code> only when <code>close &lt; open</code> (never more closes than opens at any point - that's what makes a prefix valid).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class GenerateParenthesesDemo {

    static List<String> generateParenthesis(int n) {
        List<String> result = new ArrayList<>();
        backtrack(new StringBuilder(), 0, 0, n, result);
        return result;
    }

    static void backtrack(StringBuilder current, int open, int close, int n, List<String> result) {
        if (current.length() == 2 * n) {
            result.add(current.toString());
            return;
        }

        if (open < n) {
            current.append('(');
            backtrack(current, open + 1, close, n, result);
            current.deleteCharAt(current.length() - 1);   // backtrack
        }

        if (close < open) {   // only close if there's an unmatched open to close
            current.append(')');
            backtrack(current, open, close + 1, n, result);
            current.deleteCharAt(current.length() - 1);   // backtrack
        }
    }

    public static void main(String[] args) {
        System.out.println(generateParenthesis(3));
    }
}
// OUTPUT:
// [((())), (()()), (())(), ()(()), ()()()]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "close < open" is the Entire Validity Guarantee</h3>
This single condition is doing ALL the work of validity checking: it guarantees that at every prefix of the string, the number of <code>)</code> never exceeds the number of <code>(</code> - which is EXACTLY the definition of a valid parenthesization prefix. Combined with the final length check (<code>2n</code> total characters means both counts reached exactly <code>n</code>), no separate "is this valid?" verification function is ever needed - correctness is built into the generation process itself.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyCloseCheckMattersDemo {
    public static void main(String[] args) {
        // Without the "close < open" guard, invalid sequences like ")(" would be generated.
        // With it: at EVERY point during generation, close <= open is maintained -
        // which is the textbook definition of a "balanced prefix".

        System.out.println("open=2, close=1: close < open is TRUE -> allowed to add ')'");
        System.out.println("open=1, close=1: close < open is FALSE -> NOT allowed to add ')' yet");
        System.out.println("(adding ')' here would make close > open, producing an invalid prefix like '())')");
    }
}
// OUTPUT:
// open=2, close=1: close < open is TRUE -> allowed to add ')'
// open=1, close=1: close < open is FALSE -> NOT allowed to add ')' yet
// (adding ')' here would make close > open, producing an invalid prefix like '())')`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many valid combinations exist for N pairs, and what's the relevant sequence?</td><td>The Nth Catalan number - C(2n, n) / (n+1) - which grows roughly as 4^n / n^1.5, so the algorithm's time complexity is bounded by that count times O(n) to build each string</td></tr>
<tr class='text-center'><td>Why is this considered "backtracking with built-in pruning" rather than "generate then filter"?</td><td>Invalid branches (where close would exceed open) are never even attempted - the algorithm only ever explores paths that could still lead to a valid result, unlike generating ALL 2^(2n) bit-strings and checking each for validity afterward</td></tr>
<tr class='text-center'><td>How would you count JUST the number of valid combinations without generating them all?</td><td>The Catalan number formula directly, or a DP recurrence: C(n) = sum over i of C(i) * C(n-1-i) - no need for backtracking at all if only the count is needed</td></tr>
</table>`
        }
    ]
};
