import { Topic } from '../../coreJava';

export const checkBit: Topic = {
    id: 'dsa-bit-manipulation-check-bit',
    name: 'Check Bit',
    beginner: [
        {
            content: `<h4>Testing Whether a Specific Bit is Set</h4>
To CHECK bit <code>i</code>: AND the number with a mask having only bit i set, then compare to 0 - <code>(num &amp; (1 &lt;&lt; i)) != 0</code>. Every OTHER bit gets ANDed to 0 regardless of its value, leaving only bit i's actual value to determine the result.`,
            codeExamples: [
                `package com.javaschoollab;

public class CheckBitDemo {

    static boolean isBitSet(int num, int i) {
        return (num & (1 << i)) != 0;
    }

    public static void main(String[] args) {
        int num = 10;   // binary: 1010

        for (int i = 0; i < 4; i++) {
            System.out.println("Bit " + i + ": " + isBitSet(num, i));
        }
    }
}
// OUTPUT:
// Bit 0: false
// Bit 1: true
// Bit 2: false
// Bit 3: true`
            ],
            codeExplanations: [
                `num is 1010. For each i, (1 << i) builds a mask with only bit i set. ANDing num with that mask zeroes out every OTHER bit and leaves bit i's own value in place: for i=1 and i=3 (where num has 1s) the AND is nonzero, so isBitSet returns true; for i=0 and i=2 (where num has 0s) the AND is 0, so it returns false - exactly reproducing num's binary pattern 1010 read right to left.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Iterating Over All Set Bit POSITIONS Efficiently</h3>
A common pattern: process every SET bit's position (not just count them). Combine "isolate lowest set bit" with "find its position via a log or built-in bit-count method" - much faster than checking every possible position individually when the number is sparse (few bits set).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class IterateSetBitsDemo {

    static List<Integer> getSetBitPositions(int num) {
        List<Integer> positions = new ArrayList<>();
        while (num != 0) {
            int lowestBit = num & (-num);           // isolate the lowest set bit
            int position = Integer.numberOfTrailingZeros(lowestBit);   // find its index
            positions.add(position);
            num &= (num - 1);                        // clear that lowest set bit
        }
        return positions;
    }

    public static void main(String[] args) {
        System.out.println(getSetBitPositions(41));   // binary: 101001
    }
}
// OUTPUT:
// [0, 3, 5]`
            ],
            codeExplanations: [
                `num & (-num) isolates only the lowest set bit of num, and numberOfTrailingZeros converts that single-bit value directly into its position - no scanning loop needed. Each pass records that position, then num &= (num - 1) clears exactly that lowest set bit so the next iteration finds the next-lowest one. For 41 (binary 101001) this visits positions 0, 3, then 5 in three iterations total - one iteration per set bit, not per bit position.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why compare to != 0 rather than == 1 when checking a bit?</td><td>(num & (1 << i)) doesn't produce exactly 1 or 0 - it produces the ORIGINAL VALUE of bit i shifted into place, which could be a much larger number (e.g. 8 if i=3) - only comparing against 0 correctly tests "is this bit set" regardless of position</td></tr>
<tr class='text-center'><td>What's the time complexity of iterating over set bit positions using "num &= num-1"?</td><td>O(number of set bits) - each loop iteration removes exactly one set bit, so the loop runs exactly as many times as there are 1s in the number, not O(total bit width)</td></tr>
<tr class='text-center'><td>What does Integer.numberOfTrailingZeros do, and why is it useful here?</td><td>It returns the count of trailing zero bits before the first 1 - exactly the POSITION of a number that has only ONE bit set (like the isolated lowest set bit), giving an O(1) way to find that position instead of a manual loop</td></tr>
</table>`
        }
    ]
};
