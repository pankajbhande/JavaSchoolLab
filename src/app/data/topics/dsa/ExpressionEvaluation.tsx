import { Topic } from '../../coreJava';

export const expressionEvaluation: Topic = {
    id: 'dsa-stack-expression-evaluation',
    name: 'Expression Evaluation',
    beginner: [
        {
            content: `<h4>Evaluating an Expression with a Stack</h4>
A stack naturally handles operator precedence and parentheses: numbers get pushed, and operators trigger a "resolve now" step based on precedence rules. The canonical simple case is evaluating a <b>Reverse Polish Notation (postfix)</b> expression - no precedence ambiguity at all, since the operator always applies to the two most recently pushed operands.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class EvaluatePostfixDemo {

    static int evaluate(String[] tokens) {
        Deque<Integer> stack = new ArrayDeque<>();

        for (String token : tokens) {
            switch (token) {
                case "+": case "-": case "*": case "/": {
                    int b = stack.pop();
                    int a = stack.pop();
                    stack.push(apply(a, b, token));
                    break;
                }
                default:
                    stack.push(Integer.parseInt(token));
            }
        }
        return stack.pop();
    }

    static int apply(int a, int b, String op) {
        switch (op) {
            case "+": return a + b;
            case "-": return a - b;
            case "*": return a * b;
            case "/": return a / b;
            default: throw new IllegalArgumentException("Unknown operator: " + op);
        }
    }

    public static void main(String[] args) {
        // "3 4 + 2 *" means (3 + 4) * 2
        String[] tokens = {"3", "4", "+", "2", "*"};
        System.out.println(evaluate(tokens));
    }
}
// OUTPUT:
// 14`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Evaluating a Standard Infix Expression with Precedence and Parentheses</h3>
A full calculator (e.g. <code>"3 + 5 * ( 2 - 8 )"</code>) needs TWO stacks: one for numbers, one for operators. An operator is only applied once a higher-or-equal-precedence operator or a closing parenthesis forces it to resolve.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class EvaluateInfixDemo {

    static int precedence(char op) {
        if (op == '+' || op == '-') return 1;
        if (op == '*' || op == '/') return 2;
        return 0;
    }

    static int applyOp(int a, int b, char op) {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return a / b;
            default: throw new IllegalArgumentException();
        }
    }

    static int evaluate(String expr) {
        Deque<Integer> nums = new ArrayDeque<>();
        Deque<Character> ops = new ArrayDeque<>();
        int i = 0;

        while (i < expr.length()) {
            char c = expr.charAt(i);
            if (c == ' ') { i++; continue; }

            if (Character.isDigit(c)) {
                int num = 0;
                while (i < expr.length() && Character.isDigit(expr.charAt(i))) {
                    num = num * 10 + (expr.charAt(i) - '0');
                    i++;
                }
                nums.push(num);
                continue;
            } else if (c == '(') {
                ops.push(c);
            } else if (c == ')') {
                while (ops.peek() != '(') {
                    nums.push(applyOp(nums.pop(), nums.pop(), ops.pop()));
                }
                ops.pop();   // discard the '('
            } else {   // an operator
                while (!ops.isEmpty() && precedence(ops.peek()) >= precedence(c)) {
                    nums.push(applyOp(nums.pop(), nums.pop(), ops.pop()));
                }
                ops.push(c);
            }
            i++;
        }

        while (!ops.isEmpty()) {
            nums.push(applyOp(nums.pop(), nums.pop(), ops.pop()));
        }
        return nums.pop();
    }

    public static void main(String[] args) {
        System.out.println(evaluate("3 + 5 * ( 2 - 8 )"));
    }
}
// OUTPUT:
// -27`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is postfix so much easier to evaluate than infix?</td><td>Postfix has no ambiguity about operator order or precedence - every operator immediately applies to the two most recently seen operands, in the exact order written</td></tr>
<tr class='text-center'><td>Note the popped operand order: applyOp(nums.pop(), nums.pop(), op) - why does order matter?</td><td>For non-commutative operators (- and /), popping gives the SECOND operand first and the first operand second, so it must be applyOp(secondPop, firstPop, op) to get a - b, not b - a; the code above pops b then a for exactly this reason</td></tr>
<tr class='text-center'><td>How would you convert infix to postfix directly (the Shunting Yard algorithm)?</td><td>Same operator-stack idea, but instead of applying operators immediately, output operands directly and push popped operators to an output list instead of computing - producing the postfix token sequence</td></tr>
</table>`
        }
    ]
};
