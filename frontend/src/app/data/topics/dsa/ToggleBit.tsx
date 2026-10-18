import { Topic } from '../../coreJava';

export const toggleBit: Topic = {
    id: 'dsa-bit-manipulation-toggle-bit',
    name: 'Toggle Bit',
    beginner: [
        {
            content: `<h4>Flipping a Specific Bit</h4>
To TOGGLE bit <code>i</code> (flip 0&rarr;1 or 1&rarr;0): XOR the number with a mask that has ONLY bit i set - <code>num ^ (1 &lt;&lt; i)</code>. XOR-ing with 0 leaves a bit unchanged; XOR-ing with 1 flips it - exactly the self-inverse property of XOR.`,
            codeExamples: [
                `package com.javaschoollab;

public class ToggleBitDemo {

    static int toggleBit(int num, int i) {
        return num ^ (1 << i);
    }

    public static void main(String[] args) {
        int num = 10;   // binary: 1010
        System.out.println(Integer.toBinaryString(num));

        num = toggleBit(num, 0);   // 0 -> 1
        System.out.println(Integer.toBinaryString(num));

        num = toggleBit(num, 0);   // 1 -> 0, back to original
        System.out.println(Integer.toBinaryString(num));
    }
}
// OUTPUT:
// 1010
// 1011
// 1010`
            ],
            codeExplanations: [
                `num starts as 1010. toggleBit(num, 0) XORs it with 0001: bit 0 is currently 0, and 0 ^ 1 = 1, so it flips on, giving 1011. Calling toggleBit(num, 0) a second time XORs the SAME mask into the new value: bit 0 is now 1, and 1 ^ 1 = 0, so it flips back off, returning exactly to 1010 - demonstrating that XOR-toggling a bit twice is a no-op, since XOR is its own inverse.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Toggling ALL Bits (Bitwise Complement Within N Bits)</h3>
Java's <code>~num</code> flips ALL 32 bits, including leading bits you might not care about, and produces a negative number for any positive input due to sign-bit flipping. To flip only the RELEVANT bits (e.g. within the actual bit-length of a small positive number), build a mask of exactly that many 1s and XOR with it instead of using raw NOT.`,
            codeExamples: [
                `package com.javaschoollab;

public class ToggleWithinRangeDemo {

    // Toggles ALL bits of num, but ONLY within num's own bit-length (no sign-bit pollution)
    static int toggleAllBits(int num) {
        if (num == 0) return 1;

        int bitLength = (int) (Math.log(num) / Math.log(2)) + 1;
        int mask = (1 << bitLength) - 1;   // exactly bitLength ones
        return num ^ mask;
    }

    public static void main(String[] args) {
        System.out.println(toggleAllBits(5));    // binary 101 -> 010 = 2
        System.out.println(toggleAllBits(7));    // binary 111 -> 000 = 0
        System.out.println(toggleAllBits(10));   // binary 1010 -> 0101 = 5
    }
}
// OUTPUT:
// 2
// 0
// 5`
            ],
            codeExplanations: [
                `bitLength computes how many bits are actually needed to represent num (e.g. 5 = 101 needs 3 bits). mask = (1 << bitLength) - 1 builds exactly that many 1 bits, matching num's own width - no more, no less. XORing num with that mask flips only those relevant bits (every 1 becomes 0 and every 0 becomes 1 within that width), which is why toggleAllBits(5) correctly gives 2 (010) instead of the huge negative number a raw ~5 would produce by also flipping the unused leading zero bits.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is XOR (not OR or AND) the correct operator for toggling?</td><td>Toggle means "flip based on current state" - XOR with 1 does exactly a ^ 1 = NOT a for that bit, while OR only ever sets bits to 1 and AND only ever sets bits to 0, neither of which can conditionally flip based on the current value</td></tr>
<tr class='text-center'><td>Why does the raw ~ operator misbehave for "toggle all bits of a small number"?</td><td>~ operates on ALL 32 bits of the int, including unused leading zeros - flipping those turns them into 1s too, producing a large negative number instead of the intended small toggled value confined to the number's actual bit-length</td></tr>
<tr class='text-center'><td>What's a real use case for toggling a specific bit?</td><td>Bitmask-based state tracking (e.g. a bitmask representing "which items are currently selected" in backtracking, toggling one item's membership in/out of the current selection)</td></tr>
</table>`
        }
    ]
};
