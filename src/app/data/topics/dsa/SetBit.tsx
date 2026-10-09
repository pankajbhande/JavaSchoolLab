import { Topic } from '../../coreJava';

export const setBit: Topic = {
    id: 'dsa-bit-manipulation-set-bit',
    name: 'Set Bit',
    beginner: [
        {
            content: `<h4>Turning ON a Specific Bit</h4>
To SET bit <code>i</code> (force it to 1, regardless of its current value): OR the number with a mask that has ONLY bit i set - <code>num | (1 &lt;&lt; i)</code>. OR-ing with 0 leaves other bits unchanged; OR-ing with 1 forces that bit to 1.`,
            codeExamples: [
                `package com.javaschoollab;

public class SetBitDemo {

    static int setBit(int num, int i) {
        return num | (1 << i);
    }

    public static void main(String[] args) {
        int num = 5;   // binary: 0101
        System.out.println(Integer.toBinaryString(num));

        num = setBit(num, 1);   // set bit at index 1
        System.out.println(Integer.toBinaryString(num));

        num = setBit(num, 1);   // setting an ALREADY-set bit changes nothing
        System.out.println(Integer.toBinaryString(num));
    }
}
// OUTPUT:
// 101
// 111
// 111`
            ],
            codeExplanations: [
                `num starts as 0101. setBit(num, 1) builds the mask 1 << 1 = 0010 and ORs it in: any bit that's 1 in either operand becomes 1, so bit 1 flips from 0 to 1, giving 0111. Calling setBit(num, 1) again ORs the same mask into a number that already has bit 1 set - OR-ing a bit that's already 1 with another 1 just stays 1, so the value is unchanged, which is exactly the idempotent behavior "set" should have.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Setting a RANGE of Bits at Once</h3>
Setting bits <code>[i, j]</code> (inclusive) in one operation: build a mask with 1s in exactly that range, then OR it in - useful for problems that manipulate contiguous bit ranges (e.g. certain bitmask DP setups, or flag-register manipulation).`,
            codeExamples: [
                `package com.javaschoollab;

public class SetBitRangeDemo {

    // Sets all bits from index i to j (inclusive) to 1
    static int setBitRange(int num, int i, int j) {
        int mask = ((1 << (j - i + 1)) - 1) << i;   // j-i+1 ones, shifted into position
        return num | mask;
    }

    public static void main(String[] args) {
        int num = 0;   // 00000000
        int result = setBitRange(num, 2, 4);   // set bits 2,3,4
        System.out.println(Integer.toBinaryString(result));
    }
}
// OUTPUT:
// 11100`
            ],
            codeExplanations: [
                `(1 << (j-i+1)) - 1 first builds a block of (j-i+1) consecutive 1 bits at the LOW end of the number (a standard "k ones" trick), then << i slides that whole block left so it lines up exactly with positions i through j. OR-ing that shifted block into num turns on every bit in that range while leaving every other bit untouched, so setBitRange(0, 2, 4) lights up bits 2, 3 and 4 in one operation - shown as 11100 in the output.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does OR-ing with (1 << i) only affect bit i?</td><td>Every other position of the mask is 0, and OR-ing with 0 always leaves the original bit UNCHANGED - only the single 1 bit at position i forces that specific position to 1</td></tr>
<tr class='text-center'><td>What's the time complexity of setting a single bit?</td><td>O(1) - a single shift and OR operation, regardless of the number's magnitude</td></tr>
<tr class='text-center'><td>How does "((1 << (j-i+1)) - 1)" produce (j-i+1) consecutive 1 bits?</td><td>1 << (j-i+1) produces a single 1 bit followed by (j-i+1) zeros; subtracting 1 "borrows" through all those zeros, turning them all into 1s - a standard trick for generating a block of k ones</td></tr>
</table>`
        }
    ]
};
