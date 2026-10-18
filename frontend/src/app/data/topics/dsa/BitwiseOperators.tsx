import { Topic } from '../../coreJava';

export const bitwiseOperators: Topic = {
    id: 'dsa-bit-manipulation-and-or-xor-not',
    name: 'AND / OR / XOR / NOT',
    beginner: [
        {
            content: `<h4>The Four Core Bitwise Operators</h4>
<ul>
<li><code>&amp;</code> (AND) - 1 only if BOTH bits are 1.</li>
<li><code>|</code> (OR) - 1 if EITHER bit is 1.</li>
<li><code>^</code> (XOR) - 1 if the bits are DIFFERENT.</li>
<li><code>~</code> (NOT) - flips every bit.</li>
</ul>
These operate on EVERY bit of an int/long simultaneously, in a single CPU instruction - the reason bit tricks are often dramatically faster than equivalent arithmetic or conditional logic.`,
            codeExamples: [
                `package com.javaschoollab;

public class BitwiseOperatorsDemo {
    public static void main(String[] args) {
        int a = 12;   // 1100
        int b = 10;   // 1010

        System.out.println("a & b = " + (a & b));   // 1000 = 8
        System.out.println("a | b = " + (a | b));    // 1110 = 14
        System.out.println("a ^ b = " + (a ^ b));    // 0110 = 6
        System.out.println("~a    = " + (~a));        // flips all 32 bits
    }
}
// OUTPUT:
// a & b = 8
// a | b = 14
// a ^ b = 6
// ~a    = -13`
            ],
            codeExplanations: [
                `a = 1100, b = 1010 in binary. & keeps a bit only where BOTH a and b have a 1, giving 1000 (8). | keeps a bit where EITHER has a 1, giving 1110 (14). ^ keeps a bit only where a and b DIFFER, giving 0110 (6). ~a flips every one of a's 32 bits, including the sign bit, which is why the result comes out negative (-13) instead of a small flipped number.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why ~a Equals -(a+1) - Two's Complement Explained</h3>
Java integers use TWO'S COMPLEMENT representation: negating a number is done by flipping all bits and adding 1. So <code>~a</code> (just the flip, no +1) equals <code>-a - 1</code>, or equivalently <code>-(a+1)</code> - which is why <code>~12 = -13</code>, not <code>-12</code>. Understanding this is essential for correctly reasoning about bit tricks involving negative numbers or NOT.`,
            codeExamples: [
                `package com.javaschoollab;

public class TwosComplementDemo {
    public static void main(String[] args) {
        for (int a : new int[]{0, 1, 5, 12, -1}) {
            System.out.println("~" + a + " = " + (~a) + "  (expected -(a+1) = " + (-(a + 1)) + ")");
        }
    }
}
// OUTPUT:
// ~0 = -1  (expected -(a+1) = -1)
// ~1 = -2  (expected -(a+1) = -2)
// ~5 = -6  (expected -(a+1) = -6)
// ~12 = -13  (expected -(a+1) = -13)
// ~-1 = 0  (expected -(a+1) = 0)`
            ],
            codeExplanations: [
                `The loop prints ~a next to the value -(a+1) predicted by two's complement, for several inputs including 0 and a negative number. Every pair matches, confirming that Java's ~ operator is never a simple "flip the digits" operation on the number you see - it always lands on -(a+1), because flipping all bits of a two's-complement number is mathematically equivalent to negating it and subtracting one.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the key self-inverse property of XOR, and why is it useful?</td><td>a ^ a = 0, and a ^ 0 = a - XORing a value with itself cancels it out; this is the foundation of the "find the single non-duplicate" trick and swapping without a temp variable</td></tr>
<tr class='text-center'><td>How do you swap two variables without a temporary variable using XOR?</td><td>a ^= b; b ^= a; a ^= b; - each step uses XOR's self-inverse property to progressively exchange the values, though in practice a temp variable is usually clearer and just as fast</td></tr>
<tr class='text-center'><td>Why are bitwise operators generally faster than equivalent arithmetic operations?</td><td>They map directly to single CPU instructions operating on all bits in parallel, while operations like division or modulo can require multiple clock cycles - though modern compilers often auto-optimize obvious arithmetic-to-bitwise conversions anyway (e.g. x/2 to x>>1 for unsigned values)</td></tr>
</table>`
        }
    ]
};
