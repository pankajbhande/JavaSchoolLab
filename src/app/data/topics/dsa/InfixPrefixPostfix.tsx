import { Topic } from '../../coreJava';

export const infixPrefixPostfix: Topic = {
    id: 'dsa-stack-infix-prefix-postfix',
    name: 'Infix / Prefix / Postfix',
    beginner: [
        {
            content: `<h4>The Three Notations</h4>
<ul>
<li><b>Infix</b> - operator BETWEEN operands: <code>a + b</code>. Natural for humans, ambiguous for computers without precedence rules and parentheses.</li>
<li><b>Prefix (Polish Notation)</b> - operator BEFORE operands: <code>+ a b</code>. No parentheses or precedence ever needed - the structure is unambiguous just from token order.</li>
<li><b>Postfix (Reverse Polish Notation)</b> - operator AFTER operands: <code>a b +</code>. Same unambiguous property as prefix; this is what calculators and stack machines actually evaluate internally.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class InfixToPostfixDemo {

    static int precedence(char op) {
        if (op == '+' || op == '-') return 1;
        if (op == '*' || op == '/') return 2;
        return 0;
    }

    // Shunting Yard: converts infix "a+b*c" style input into postfix "abc*+"
    static String infixToPostfix(String infix) {
        StringBuilder output = new StringBuilder();
        Deque<Character> ops = new ArrayDeque<>();

        for (char c : infix.toCharArray()) {
            if (Character.isLetterOrDigit(c)) {
                output.append(c);
            } else if (c == '(') {
                ops.push(c);
            } else if (c == ')') {
                while (ops.peek() != '(') {
                    output.append(ops.pop());
                }
                ops.pop();
            } else {   // operator
                while (!ops.isEmpty() && precedence(ops.peek()) >= precedence(c)) {
                    output.append(ops.pop());
                }
                ops.push(c);
            }
        }
        while (!ops.isEmpty()) {
            output.append(ops.pop());
        }
        return output.toString();
    }

    public static void main(String[] args) {
        System.out.println(infixToPostfix("a+b*c"));
        System.out.println(infixToPostfix("(a+b)*c"));
    }
}
// OUTPUT:
// abc*+
// ab+c*`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Infix to Prefix - Reverse, Convert, Reverse Again</h3>
A clever trick avoids writing a separate prefix converter from scratch: reverse the infix string (swapping <code>(</code> and <code>)</code>), run the SAME infix-to-postfix logic, then reverse the result. This works because prefix is postfix read backward, with mirrored parentheses.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class InfixToPrefixDemo {

    static int precedence(char op) {
        if (op == '+' || op == '-') return 1;
        if (op == '*' || op == '/') return 2;
        return 0;
    }

    static String infixToPostfix(String infix) {
        StringBuilder output = new StringBuilder();
        Deque<Character> ops = new ArrayDeque<>();
        for (char c : infix.toCharArray()) {
            if (Character.isLetterOrDigit(c)) {
                output.append(c);
            } else if (c == '(') {
                ops.push(c);
            } else if (c == ')') {
                while (ops.peek() != '(') output.append(ops.pop());
                ops.pop();
            } else {
                // NOTE: for right-to-left prefix conversion, equal precedence should NOT
                // pop (keeps left-to-right operators grouped correctly once re-reversed)
                while (!ops.isEmpty() && precedence(ops.peek()) > precedence(c)) {
                    output.append(ops.pop());
                }
                ops.push(c);
            }
        }
        while (!ops.isEmpty()) output.append(ops.pop());
        return output.toString();
    }

    static String reverseAndSwapParens(String s) {
        StringBuilder sb = new StringBuilder();
        for (int i = s.length() - 1; i >= 0; i--) {
            char c = s.charAt(i);
            if (c == '(') sb.append(')');
            else if (c == ')') sb.append('(');
            else sb.append(c);
        }
        return sb.toString();
    }

    static String infixToPrefix(String infix) {
        String reversed = reverseAndSwapParens(infix);
        String postfixOfReversed = infixToPostfix(reversed);
        return new StringBuilder(postfixOfReversed).reverse().toString();
    }

    public static void main(String[] args) {
        System.out.println(infixToPrefix("a+b*c"));
    }
}
// OUTPUT:
// +a*bc`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why don't prefix and postfix need parentheses or precedence rules?</td><td>The position of each operator relative to its operands fully determines the structure - there's exactly one way to parse a valid prefix/postfix expression, unlike infix where "a+b*c" is ambiguous without a precedence convention</td></tr>
<tr class='text-center'><td>Why must equal-precedence operators NOT be popped when converting infix to PREFIX (only to postfix)?</td><td>Because the conversion works on the reversed string, popping on equal precedence would flip the evaluation order of same-precedence operators (e.g. a-b-c), producing an incorrect prefix expression once re-reversed</td></tr>
<tr class='text-center'><td>Which notation do CPUs / stack-based virtual machines (like the JVM) actually use internally?</td><td>Postfix (RPN) - bytecode instructions push operands and apply operators to the top of an operand stack, exactly matching postfix evaluation order</td></tr>
</table>`
        }
    ]
};
