import { Topic } from '../../coreJava';

export const xorProperties: Topic = {
    id: 'dsa-bit-manipulation-xor-properties',
    name: 'XOR Properties',
    beginner: [
        {
            content: `<h4>The Core XOR Identities</h4>
<ul>
<li><code>a ^ 0 = a</code> - XOR with 0 is the identity operation.</li>
<li><code>a ^ a = 0</code> - a number XORed with itself cancels out to 0.</li>
<li><code>a ^ b = b ^ a</code> - commutative.</li>
<li><code>(a ^ b) ^ c = a ^ (b ^ c)</code> - associative, so order/grouping in a chain of XORs doesn't matter.</li>
</ul>
These four identities alone unlock the "find the unique/missing element" family of interview problems.`,
            codeExamples: [
                `package com.javaschoollab;

public class XorIdentitiesDemo {
    public static void main(String[] args) {
        int a = 25;

        System.out.println(a ^ 0);    // identity: 25
        System.out.println(a ^ a);    // self-cancel: 0

        // Find the single number that appears once, when every other number appears twice
        int[] nums = {4, 1, 2, 1, 2};
        int unique = 0;
        for (int num : nums) {
            unique ^= num;   // pairs cancel via a^a=0, leaving only the unpaired value
        }
        System.out.println("Unique: " + unique);
    }
}
// OUTPUT:
// 25
// 0
// Unique: 4`
            ],
            codeExplanations: [
                `a ^ 0 leaves 25 unchanged (identity), and a ^ a cancels to 0 (self-inverse). In the array loop, every value that appears exactly twice gets XORed into unique twice - and since XOR is associative and commutative, those two occurrences always end up cancelling each other out via a^a=0 regardless of what order they appear in, no matter what other values sit between them. The one value that appears only once has nothing to cancel it, so it survives as the final result: 4.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Swap Without a Temp Variable, and Find Two Unique Numbers</h3>
XOR's self-inverse property allows swapping two variables without a third: <code>a ^= b; b ^= a; a ^= b;</code>. A harder classic: given an array where EXACTLY two numbers appear once and all others appear twice, XOR-ing everything gives <code>x ^ y</code> (the XOR of the two uniques). Find any SET bit in that result - it's a bit where x and y differ - then partition the array by that bit to separate x and y into two independent XOR-reduction groups.`,
            codeExamples: [
                `package com.javaschoollab;

public class TwoUniqueNumbersDemo {

    static int[] findTwoUnique(int[] nums) {
        int xorAll = 0;
        for (int num : nums) xorAll ^= num;

        int diffBit = xorAll & (-xorAll);   // isolate one bit where x and y differ

        int x = 0, y = 0;
        for (int num : nums) {
            if ((num & diffBit) != 0) {
                x ^= num;
            } else {
                y ^= num;
            }
        }
        return new int[]{x, y};
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 1, 3, 2, 5};   // 3 and 5 are the unique ones
        int[] result = findTwoUnique(nums);
        System.out.println(result[0] + ", " + result[1]);
    }
}
// OUTPUT:
// 5, 3`
            ],
            codeExplanations: [
                `XORing the whole array cancels every paired value, leaving xorAll = x ^ y (the two uniques combined). xorAll & (-xorAll) isolates one bit where x and y must differ, since a shared bit would have cancelled to 0 in xorAll. Splitting the array by whether each number has that bit set guarantees x and y land in different groups, and within each group every OTHER value still appears in pairs and cancels via XOR - so each group's running XOR converges on exactly one of the two answers: 5 and 3.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does XOR-ing an array find the single unpaired element?</td><td>Every value that appears exactly twice XORs with itself to 0 (a^a=0), and 0 XORed with anything else leaves it unchanged (a^0=a) - so all paired values cancel, leaving only the unpaired one</td></tr>
<tr class='text-center'><td>Why does isolating one differing bit correctly split x and y in the two-unique-numbers problem?</td><td>Any bit where x and y differ guarantees x and y fall into DIFFERENT partition groups - within each group, every OTHER number still appears in pairs and cancels via XOR, leaving exactly one of {x, y} per group</td></tr>
<tr class='text-center'><td>Does the temp-free XOR swap work if a and b are the SAME variable (i.e. aliasing)?</td><td>No - if a and b reference the same memory location, a ^= b zeroes it out on the first step, and the "swap" corrupts the value to 0 instead of leaving it unchanged</td></tr>
</table>`
        }
    ]
};
