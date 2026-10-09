import { Topic } from '../../coreJava';

export const countSetBits: Topic = {
    id: 'dsa-bit-manipulation-count-set-bits',
    name: 'Count Set Bits',
    beginner: [
        {
            content: `<h4>Counting the Number of 1 Bits (Popcount)</h4>
The simplest approach: check each of the 32 bits one at a time with <code>(num &gt;&gt; i) &amp; 1</code> and add up how many are 1. Correct, but does 32 iterations REGARDLESS of how many bits are actually set.`,
            codeExamples: [
                `package com.javaschoollab;

public class CountSetBitsNaiveDemo {

    static int countSetBits(int num) {
        int count = 0;
        for (int i = 0; i < 32; i++) {
            if (((num >> i) & 1) == 1) {
                count++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countSetBits(11));   // binary: 1011
        System.out.println(countSetBits(255));  // binary: 11111111
    }
}
// OUTPUT:
// 3
// 8`
            ],
            codeExplanations: [
                `The loop checks all 32 possible bit positions one by one with (num >> i) & 1, adding 1 to count every time that bit is 1. For 11 (binary 1011) three positions are 1, so count ends at 3; for 255 (binary 11111111) all eight low bits are 1, so count ends at 8. This always does 32 checks regardless of how many bits are actually set, which is what the Kernighan approach below improves on.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Brian Kernighan's Algorithm - O(Set Bits) Instead of O(32)</h3>
Repeatedly apply <code>num &amp; (num - 1)</code>, which clears the LOWEST set bit each time. Count how many times you can do this before <code>num</code> becomes 0 - that count IS the number of set bits. For SPARSE numbers (few 1s), this finishes far faster than checking all 32 positions. Java also exposes this natively via <code>Integer.bitCount()</code>, which is intrinsic-optimized by the JVM (often a single hardware POPCNT instruction).`,
            codeExamples: [
                `package com.javaschoollab;

public class KernighanPopcountDemo {

    static int countSetBits(int num) {
        int count = 0;
        while (num != 0) {
            num &= (num - 1);   // clears the lowest set bit
            count++;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countSetBits(11));               // 3
        System.out.println(Integer.bitCount(11));            // built-in, same result
        System.out.println(Integer.bitCount(Integer.MAX_VALUE));
    }
}
// OUTPUT:
// 3
// 3
// 31`
            ],
            codeExplanations: [
                `Each pass of the while loop applies num &= (num - 1), which clears exactly the lowest set bit, and increments count once per pass - so the loop runs exactly as many times as there are 1 bits, not 32 times regardless. Integer.bitCount() does the same job as a single built-in call, which the JVM can compile down to one hardware POPCNT instruction, confirmed here by both approaches agreeing on 3 for the number 11, and 31 for Integer.MAX_VALUE (which is all 1 bits except the sign bit).`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why prefer Brian Kernighan's algorithm over checking all 32 bits?</td><td>Its runtime is O(number of set bits) rather than O(32) fixed - for sparse numbers (e.g. a single set bit) it finishes in one iteration instead of always doing 32</td></tr>
<tr class='text-center'><td>Should you use Integer.bitCount() or a manual loop in production code?</td><td>Integer.bitCount() - it's a JDK intrinsic that the JIT compiler can replace with a single hardware POPCNT instruction on supported CPUs, making it faster than any hand-written Java loop</td></tr>
<tr class='text-center'><td>What's a classic interview problem that reduces to counting set bits?</td><td>"Counting Bits" (LeetCode 338) - compute the popcount for every number from 0 to n efficiently using DP: bits[i] = bits[i &amp; (i-1)] + 1, reusing previously computed results instead of recomputing from scratch</td></tr>
</table>`
        }
    ]
};
