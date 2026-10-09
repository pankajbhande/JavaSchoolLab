import { Topic } from '../../coreJava';

export const leftRightShift: Topic = {
    id: 'dsa-bit-manipulation-left-right-shift',
    name: 'Left / Right Shift',
    beginner: [
        {
            content: `<h4>Shifting Bits - Fast Multiplication/Division by Powers of 2</h4>
<ul>
<li><code>&lt;&lt;</code> (left shift) - shifts bits left, filling with 0s. <code>x &lt;&lt; n</code> equals <code>x &times; 2&#8319;</code>.</li>
<li><code>&gt;&gt;</code> (signed right shift) - shifts bits right, preserving the SIGN bit (fills with 1s for negative numbers). <code>x &gt;&gt; n</code> equals <code>x / 2&#8319;</code> (rounding toward negative infinity).</li>
<li><code>&gt;&gt;&gt;</code> (unsigned right shift) - shifts right, always filling with 0s, IGNORING sign - Java-specific, doesn't exist in C/C++.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class ShiftOperatorsDemo {
    public static void main(String[] args) {
        System.out.println(5 << 2);     // 5 * 4 = 20
        System.out.println(20 >> 2);    // 20 / 4 = 5
        System.out.println(-8 >> 1);    // signed: preserves sign, rounds toward -infinity -> -4
        System.out.println(-8 >>> 28);  // unsigned: treats as raw bits, fills with 0s
    }
}
// OUTPUT:
// 20
// 5
// -4
// 15`
            ],
            codeExplanations: [
                `5 << 2 shifts the bits of 5 left by two positions, which is the same as multiplying by 2 squared (4), giving 20. 20 >> 2 shifts right by two, dividing by 4, giving 5. -8 >> 1 shifts right but refills the vacated top bit with the ORIGINAL sign bit (1, since -8 is negative), so the result stays negative (-4). -8 >>> 28 instead refills with 0s regardless of sign, then shifts almost the entire 32-bit pattern out, leaving only the few leading bits of the original number's raw representation.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why >> and >>> Differ ONLY for Negative Numbers</h3>
For positive numbers, both operators behave identically (the sign bit is already 0, so there's nothing different to preserve). The difference only manifests for NEGATIVE numbers: <code>&gt;&gt;</code> replicates the leading 1 (sign bit) as it shifts, keeping the number negative; <code>&gt;&gt;&gt;</code> always fills with 0s, turning a negative number into a large POSITIVE one after shifting - a classic source of bugs when the distinction is forgotten.`,
            codeExamples: [
                `package com.javaschoollab;

public class SignedVsUnsignedShiftDemo {
    public static void main(String[] args) {
        int negative = -16;

        System.out.println("Signed   >> 2: " + (negative >> 2));    // stays negative: -4
        System.out.println("Unsigned >>> 2: " + (negative >>> 2));   // becomes a huge positive number

        System.out.println();
        System.out.println("Positive numbers: BOTH operators behave identically");
        int positive = 16;
        System.out.println("Signed   >> 2: " + (positive >> 2));
        System.out.println("Unsigned >>> 2: " + (positive >>> 2));
    }
}
// OUTPUT:
// Signed   >> 2: -4
// Unsigned >>> 2: 1073741820
//
// Positive numbers: BOTH operators behave identically
// Signed   >> 2: 4
// Unsigned >>> 2: 4`
            ],
            codeExplanations: [
                `For -16 (negative), >> refills with the sign bit (1) so the number stays negative and shrinks toward zero correctly (-4), while >>> refills with 0s, turning the same bit pattern into a huge positive number because the sign bit is no longer treated specially. For 16 (positive) the sign bit is already 0, so both operators refill with 0s and produce identical results - proving the difference only ever matters for negative inputs.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why doesn't C/C++ have Java's >>> operator?</td><td>Java standardized signed integer representation (always two's complement) across all platforms; C/C++ historically left this implementation-defined, so an "unsigned right shift" on a signed type had ambiguous behavior - Java sidesteps this by defining >>> explicitly</td></tr>
<tr class='text-center'><td>Does left shift on a signed integer risk overflow the same way multiplication does?</td><td>Yes - shifting bits off the left edge silently discards them, exactly like integer overflow from multiplication; x << n for large n can produce unexpected results if bits get shifted out of the 32/64-bit range</td></tr>
<tr class='text-center'><td>Why is x >> 1 sometimes preferred over x / 2 for performance-critical code?</td><td>Shift is typically a single fast CPU instruction, while division can take multiple cycles - though for POSITIVE numbers specifically, since signed division rounds toward zero while >> rounds toward negative infinity, they only produce identical results for non-negative x</td></tr>
</table>`
        }
    ]
};
