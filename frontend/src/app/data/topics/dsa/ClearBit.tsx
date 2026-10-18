import { Topic } from '../../coreJava';

export const clearBit: Topic = {
    id: 'dsa-bit-manipulation-clear-bit',
    name: 'Clear Bit',
    beginner: [
        {
            content: `<h4>Turning OFF a Specific Bit</h4>
To CLEAR bit <code>i</code> (force it to 0): AND the number with a mask that has a 0 at position i and 1s everywhere else - <code>num &amp; ~(1 &lt;&lt; i)</code>. AND-ing with 1 leaves a bit unchanged; AND-ing with 0 forces it to 0.`,
            codeExamples: [
                `package com.javaschoollab;

public class ClearBitDemo {

    static int clearBit(int num, int i) {
        return num & ~(1 << i);
    }

    public static void main(String[] args) {
        int num = 15;   // binary: 1111
        System.out.println(Integer.toBinaryString(num));

        num = clearBit(num, 1);   // clear bit at index 1
        System.out.println(Integer.toBinaryString(num));

        num = clearBit(num, 1);   // clearing an ALREADY-clear bit changes nothing
        System.out.println(Integer.toBinaryString(num));
    }
}
// OUTPUT:
// 1111
// 1101
// 1101`
            ],
            codeExplanations: [
                `num starts as 1111. ~(1 << 1) builds the mask 1101 (a single 0 at position 1, 1s everywhere else). ANDing num with that mask forces bit 1 to 0 while leaving every other bit as it was, giving 1101. Running clearBit again on the same number ANDs with the same mask again - bit 1 is already 0, and 0 AND anything stays 0, so the second call is a no-op, matching what "clear" should do to an already-clear bit.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Clearing All Bits FROM the Lowest Set Bit Downward, and Other Tricks</h3>
Two related tricks that come up frequently:
<ul>
<li><code>num &amp; (num - 1)</code> - clears the LOWEST set bit (used in the classic O(set bits) popcount algorithm).</li>
<li><code>num &amp; (-num)</code> - ISOLATES the lowest set bit (used in Fenwick Tree indexing).</li>
</ul>
Both rely on the same underlying behavior: subtracting 1 from a number flips its lowest set bit to 0 and everything below it to 1.`,
            codeExamples: [
                `package com.javaschoollab;

public class BitTricksDemo {
    public static void main(String[] args) {
        int num = 12;   // binary: 1100

        int clearedLowest = num & (num - 1);   // clears the lowest set bit
        int isolatedLowest = num & (-num);      // isolates ONLY the lowest set bit

        System.out.println("Original       : " + Integer.toBinaryString(num));
        System.out.println("Clear lowest   : " + Integer.toBinaryString(clearedLowest));
        System.out.println("Isolate lowest : " + Integer.toBinaryString(isolatedLowest));
    }
}
// OUTPUT:
// Original       : 1100
// Clear lowest   : 1000
// Isolate lowest : 100`
            ],
            codeExplanations: [
                `num is 1100. num - 1 borrows through the lowest set bit, turning it into 1011 - the lowest 1 becomes 0 and every bit below it becomes 1. ANDing that with the original 1100 keeps only bits that were 1 in both, which excludes the now-zeroed lowest bit and the newly-flipped lower bits, leaving 1000 - the lowest set bit cleared. -num in two's complement equals ~num + 1; ANDing num with -num cancels out every bit except the lowest set one, isolating it as 0100 (decimal 4).`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does ~(1 << i) produce a mask with a single 0 at position i?</td><td>1 << i produces a single 1 at position i and 0s elsewhere; NOT flips every bit, turning that single 1 into a single 0 while every other bit becomes 1</td></tr>
<tr class='text-center'><td>How does num & (num - 1) clear the lowest set bit?</td><td>Subtracting 1 turns the lowest set bit into 0 and every bit below it into 1 (borrow propagation); ANDing with the original number keeps only bits that were 1 in BOTH, which excludes that now-flipped lowest bit and the now-flipped-to-1 lower bits that weren't originally set</td></tr>
<tr class='text-center'><td>What's the time complexity of the "clear lowest set bit" popcount loop (repeatedly applying num &= num-1)?</td><td>O(number of set bits), not O(total bits) - each iteration removes exactly one 1 bit, so a sparse number (few set bits) finishes faster than a dense one</td></tr>
</table>`
        }
    ]
};
