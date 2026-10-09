import { Topic } from '../../coreJava';

export const powerOf2: Topic = {
    id: 'dsa-bit-manipulation-power-of-2',
    name: 'Power of 2',
    beginner: [
        {
            content: `<h4>Checking if a Number is a Power of 2, in O(1)</h4>
A power of 2 has EXACTLY ONE set bit (e.g. 8 = 1000, 16 = 10000). Recall <code>num &amp; (num - 1)</code> clears the lowest set bit - if <code>num</code> had only ONE set bit to begin with, clearing it leaves 0. So: <code>num &gt; 0 &amp;&amp; (num &amp; (num - 1)) == 0</code>.`,
            codeExamples: [
                `package com.javaschoollab;

public class PowerOfTwoDemo {

    static boolean isPowerOfTwo(int num) {
        return num > 0 && (num & (num - 1)) == 0;
    }

    public static void main(String[] args) {
        System.out.println(isPowerOfTwo(16));   // true
        System.out.println(isPowerOfTwo(18));   // false
        System.out.println(isPowerOfTwo(1));    // true (2^0)
        System.out.println(isPowerOfTwo(0));    // false
    }
}
// OUTPUT:
// true
// false
// true
// false`
            ],
            codeExplanations: [
                `num & (num - 1) clears the lowest set bit of num. If num had exactly ONE set bit to begin with (which is what "power of 2" means in binary), clearing it leaves 0, so the equality check passes. 16 (10000) has one set bit so it passes; 18 (10010) has two set bits so clearing the lowest one still leaves a nonzero value, correctly failing. 1 (2^0) also has exactly one bit set, so it passes; 0 is excluded by the num > 0 guard before the bit trick is even evaluated.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the num &gt; 0 Guard is Essential</h3>
Without the <code>num &gt; 0</code> check, <code>num = 0</code> would WRONGLY pass: <code>0 &amp; (0 - 1)</code> equals <code>0 &amp; -1</code>, and since <code>-1</code> in two's complement is all 1 bits, ANDing with it leaves <code>0</code> unchanged - giving a false positive for zero, which is NOT a power of 2. Negative numbers are excluded for the same underlying reason: their two's complement representation always has the sign bit set alongside other bits, so this trick alone can't safely distinguish them without the explicit positivity check.`,
            codeExamples: [
                `package com.javaschoollab;

public class PowerOfTwoEdgeCasesDemo {
    public static void main(String[] args) {
        int zero = 0;
        System.out.println("0 & (0-1) = " + (zero & (zero - 1)));   // 0 -- would wrongly pass without the guard

        System.out.println("Guarded check for 0: " + (zero > 0 && (zero & (zero - 1)) == 0));

        int negative = -8;
        System.out.println("Guarded check for -8: " + (negative > 0 && (negative & (negative - 1)) == 0));
    }
}
// OUTPUT:
// 0 & (0-1) = 0
// Guarded check for 0: false
// Guarded check for -8: false`
            ],
            codeExplanations: [
                `For zero, 0 - 1 underflows to -1 (all 1 bits in two's complement), and 0 & -1 is still 0 - so the bit trick alone would wrongly call 0 a power of 2, which is why num > 0 is checked first and short-circuits before the trick runs. For -8, the guard also short-circuits immediately, since a negative number can never be a valid power of 2 regardless of what its bit pattern happens to look like.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does clearing the lowest set bit detect "exactly one set bit"?</td><td>num & (num-1) clears the lowest set bit - if that was the ONLY set bit, the result is 0; if there were other set bits, they survive and the result is nonzero</td></tr>
<tr class='text-center'><td>Why is num > 0 required in the power-of-2 check?</td><td>Without it, num = 0 gives 0 & (0-1) = 0 & -1 = 0, incorrectly satisfying the "result is 0" condition even though 0 is not a valid power of 2</td></tr>
<tr class='text-center'><td>How would you find the NEXT power of 2 greater than or equal to a given number?</td><td>Repeatedly OR the number with itself right-shifted by increasing powers of 2 (1,2,4,8,16) to fill in all bits below the highest set bit, then add 1 - a classic bit-manipulation technique used in hash table capacity rounding</td></tr>
</table>`
        }
    ]
};
