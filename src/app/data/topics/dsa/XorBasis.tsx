import { Topic } from '../../coreJava';

export const xorBasis: Topic = {
    id: 'dsa-bit-manipulation-xor-basis',
    name: 'XOR Basis',
    beginner: [
        {
            content: `<h4>What an XOR Basis Represents</h4>
Numbers form a vector space over GF(2) under XOR. An XOR BASIS is a minimal set of numbers such that every XOR combination of ANY subset of the original array can be reproduced by XOR-ing some subset of the basis. Building it lets you answer questions like "what is the maximum possible XOR of any subset?" without checking all 2&#8319; subsets.`,
            codeExamples: [
                `package com.javaschoollab;

public class XorBasisIntro {
    public static void main(String[] args) {
        int[] nums = {5, 1, 2};   // binary: 101, 001, 010

        // Every subset XOR combination of {5, 1, 2} can be derived
        // from a basis of at most 3 independent "bit directions".
        int allXor = 0;
        for (int num : nums) allXor ^= num;
        System.out.println("XOR of all: " + allXor);
    }
}
// OUTPUT:
// XOR of all: 6`
            ],
            codeExplanations: [
                `5, 1 and 2 are three independent "directions" in the bit-vector space, so XOR-ing all of them together (101 ^ 001 ^ 010) walks through each bit position: bit 0 has an odd number of 1s among the three (from 5 and 1), bit 1 has an odd count too (from 2), bit 2 has just one contributor (from 5) - giving 110, which is 6. This single combination is only one of eight possible subset-XOR results the full basis-building example below computes exhaustively.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Building the Basis with Gaussian Elimination over GF(2)</h3>
Maintain an array <code>basis[]</code> indexed by bit position (highest bit first). For each new number, reduce it by XOR-ing away any basis vector whose highest set bit matches one of the number's set bits; if the number becomes 0, it was already representable by the existing basis (discard it); otherwise, it contributes a NEW independent direction - insert it at its highest bit position. Once built, the MAXIMUM XOR achievable from the basis is found greedily: XOR the running result with any basis vector that INCREASES it.`,
            codeExamples: [
                `package com.javaschoollab;

public class XorBasisMaxXorDemo {

    static final int BITS = 32;

    static void insert(int[] basis, int num) {
        for (int bit = BITS - 1; bit >= 0; bit--) {
            if (((num >> bit) & 1) == 0) continue;

            if (basis[bit] == 0) {
                basis[bit] = num;   // new independent direction
                return;
            }
            num ^= basis[bit];      // reduce using existing basis vector
        }
        // num became 0 -> already representable, contributes nothing new
    }

    static int maxXor(int[] basis) {
        int result = 0;
        for (int bit = BITS - 1; bit >= 0; bit--) {
            if ((result ^ basis[bit]) > result) {
                result ^= basis[bit];
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {3, 10, 5, 25};
        int[] basis = new int[BITS];

        for (int num : nums) insert(basis, num);

        System.out.println("Maximum subset XOR: " + maxXor(basis));
    }
}
// OUTPUT:
// Maximum subset XOR: 28`
            ],
            codeExplanations: [
                `insert() walks a number from its highest bit downward: if a basis slot at that bit position is empty, the number becomes a new basis vector there; otherwise it gets XORed with the existing vector at that bit (eliminating that bit from the number, Gaussian-elimination style) and the walk continues to lower bits. After all four numbers are inserted, maxXor() greedily tries each basis vector from the highest bit down, keeping it only if XOR-ing it in makes the running result strictly bigger - which always sets the most significant available bit first, the same way comparing binary numbers works, arriving at 28.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the insert() function XOR the incoming number with basis[bit] instead of just comparing?</td><td>This is Gaussian elimination over GF(2) - XOR-ing out the basis vector's highest bit "reduces" the number the same way row reduction eliminates a leading coefficient, revealing whether it adds new information or is already spanned by the existing basis</td></tr>
<tr class='text-center'><td>Why does the greedy maxXor() loop (highest bit to lowest) correctly find the maximum?</td><td>Basis vectors are stored with distinct highest-set-bit positions, so applying them from the highest bit down greedily sets the most significant possible bits first - matching how binary numbers are ordered by magnitude</td></tr>
<tr class='text-center'><td>What is the maximum possible size of an XOR basis for 32-bit integers?</td><td>32 - one basis vector per bit position at most, since the vector space of 32-bit integers over GF(2) has dimension 32</td></tr>
</table>`
        }
    ]
};
