import { Topic } from '../../coreJava';

export const palindrome: Topic = {
    id: 'dsa-strings-palindrome',
    name: 'Palindrome',
    beginner: [
        {
            content: `<h4>Checking a Palindrome</h4>
A palindrome reads the same forward and backward. The classic O(n) check uses <b>two pointers</b> starting at both ends, moving toward the middle - no need to build a reversed copy of the string.`,
            codeExamples: [
                `package com.javaschoollab;

public class PalindromeCheckDemo {

    static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("racecar"));
        System.out.println(isPalindrome("hello"));
    }
}
// OUTPUT:
// true
// false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Longest Palindromic Substring - Expand Around Center</h3>
A palindrome is symmetric around its center. For each possible center (n centers for odd-length palindromes, n-1 "between characters" centers for even-length ones), expand outward while both sides match - O(n&sup2;) total, much simpler to reason about than DP, and the standard interview answer before jumping to Manacher's Algorithm for the O(n) solution.`,
            codeExamples: [
                `package com.javaschoollab;

public class LongestPalindromicSubstringDemo {

    static String longestPalindrome(String s) {
        if (s.isEmpty()) return "";
        int start = 0, maxLen = 1;

        for (int center = 0; center < s.length(); center++) {
            int len1 = expandAroundCenter(s, center, center);       // odd length
            int len2 = expandAroundCenter(s, center, center + 1);   // even length
            int len = Math.max(len1, len2);

            if (len > maxLen) {
                maxLen = len;
                start = center - (len - 1) / 2;
            }
        }
        return s.substring(start, start + maxLen);
    }

    // Expands outward while s.charAt(left) == s.charAt(right), returns the palindrome length
    static int expandAroundCenter(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        return right - left - 1;
    }

    public static void main(String[] args) {
        System.out.println(longestPalindrome("babad"));
        System.out.println(longestPalindrome("cbbd"));
    }
}
// OUTPUT:
// bab
// bb`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does "expand around center" need 2n-1 centers, not n?</td><td>Odd-length palindromes are centered ON a character (n such centers); even-length palindromes are centered BETWEEN two characters (n-1 such centers) - together 2n-1</td></tr>
<tr class='text-center'><td>What's the time complexity of expand-around-center, and what beats it?</td><td>O(n^2) worst case (n centers, each expansion up to O(n)); Manacher's Algorithm solves the same problem in O(n) using previously computed palindrome radii to skip redundant comparisons</td></tr>
<tr class='text-center'><td>How would you check if a string can be REARRANGED into a palindrome?</td><td>Count character frequencies - a rearrangement is possible only if at most one character has an odd count (that one becomes the middle character for odd-length strings)</td></tr>
</table>`
        }
    ]
};
