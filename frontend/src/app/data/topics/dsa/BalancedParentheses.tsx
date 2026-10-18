import { Topic } from '../../coreJava';

export const balancedParentheses: Topic = {
    id: 'dsa-stack-balanced-parentheses',
    name: 'Balanced Parentheses',
    beginner: [
        {
            content: `<h4>Checking Balanced Brackets</h4>
The textbook stack application: scan left to right, PUSH every opening bracket, and on a closing bracket POP and check it matches the most recent unmatched opener. Any mismatch, or leftover brackets at the end, means unbalanced.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class BalancedParenthesesDemo {

    static boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();

        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else if (c == ')' || c == '}' || c == ']') {
                if (stack.isEmpty() || !matches(stack.pop(), c)) {
                    return false;   // no opener to match, or wrong type
                }
            }
        }
        return stack.isEmpty();   // any leftover opener means unbalanced
    }

    static boolean matches(char open, char close) {
        return (open == '(' && close == ')')
            || (open == '{' && close == '}')
            || (open == '[' && close == ']');
    }

    public static void main(String[] args) {
        System.out.println(isBalanced("{[()()]}"));
        System.out.println(isBalanced("{[(])}"));
        System.out.println(isBalanced("((("));
    }
}
// OUTPUT:
// true
// false
// false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Minimum Insertions to Make Parentheses Valid</h3>
A harder follow-up: given an unbalanced string, find the MINIMUM number of insertions needed to make it valid (each <code>)</code> must be part of a pair, and here specifically <code>))</code> closes one <code>(</code>). This uses the stack idea without literally pushing/popping - tracking counts is enough.`,
            codeExamples: [
                `package com.javaschoollab;

public class MinInsertionsDemo {

    // Rule: '(' needs exactly TWO ')' to close it (a common LeetCode variant)
    static int minInsertions(String s) {
        int openNeeded = 0;   // unmatched '(' still needing closes
        int insertions = 0;

        int i = 0;
        while (i < s.length()) {
            if (s.charAt(i) == '(') {
                openNeeded += 2;
                i++;
            } else {
                // count how many consecutive ')' follow
                int closeCount = 0;
                while (i < s.length() && s.charAt(i) == ')' && closeCount < 2) {
                    closeCount++;
                    i++;
                }
                if (closeCount == 1 && i == s.length()) {
                    insertions++;   // need one more ')' at the very end
                    closeCount = 2;
                }
                if (openNeeded == 0) {
                    insertions += (2 - closeCount);   // no '(' waiting - each ')' needs a partner
                } else {
                    openNeeded -= closeCount;
                    if (openNeeded < 0) {
                        insertions += -openNeeded;   // extra unmatched ')'
                        openNeeded = 0;
                    }
                }
            }
        }
        return insertions + openNeeded;   // any '(' still unclosed needs its ')' pair inserted
    }

    public static void main(String[] args) {
        System.out.println(minInsertions("(()))"));
    }
}
// OUTPUT:
// 1`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why must you check stack.isEmpty() at the very end, not just during the scan?</td><td>A string like "(((" never triggers a mismatch during the scan (no closing brackets appear), but leaves unmatched openers on the stack - only the final emptiness check catches this</td></tr>
<tr class='text-center'><td>What's the time and space complexity of the balanced-brackets check?</td><td>O(n) time (one pass), O(n) space worst case (a string of all openers pushes every character)</td></tr>
<tr class='text-center'><td>How would you find the LONGEST valid parentheses substring (only round brackets)?</td><td>Push indices instead of characters, seeding the stack with -1; on a valid match, the current length is index - stack.peek() after popping - a stack-based variant that tracks positions, not just characters</td></tr>
</table>`
        }
    ]
};
