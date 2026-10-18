import { Topic } from '../coreJava';

export const arrayProgram: Topic = {
                        id: 'arrayprogram',
                        name: 'Array Program',
                        beginner: [
                            {
                                content: `<h4>Basic Array Operations</h4><ol><li>Sum of array elements</li><li>Maximum and minimum element in array</li><li>Reverse an array</li><li>Sort an array (Bubble Sort, Selection Sort, Insertion Sort)</li><li>Find the second largest element in an array</li></ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class SumOfArray {
public static void main(String[] args) {
 int[] array = { 1, 2, 3, 4, 5 };
 int sum = 0;
 for (int num : array) {
 sum += num;
 }
 System.out.println("Sum of array elements: " + sum);
 }
}

OUTPUT: Sum of array elements: 15`,

                                    `package com.javaschoollab.demo;
import java.util.Arrays;
public class MaxMinArray {
public static void main(String[] args) {
 int[] array = { 1, 2, 3, 4, 5 };
 int max = Arrays.stream(array).max().getAsInt();
 int min = Arrays.stream(array).min().getAsInt();
 System.out.println("Maximum element: " + max);
 System.out.println("Minimum element: " + min);
 }
}

OUTPUT:
Maximum element: 5
Minimum element: 1 `,

                                    `package com.javaschoollab.demo;
public class ReverseArray {
public static void main(String[] args) {
 int[] array = { 1, 2, 3, 4, 5 };
 for (int i = 0; i < array.length / 2; i++) {
 int temp = array[i];
 array[i] = array[array.length - 1 - i];
 array[array.length - 1 - i] = temp;
 }
 System.out.print("Reversed array: ");
 for (int num : array) {
 System.out.print(num + " ");
 }
 }
}

OUTPUT: Reversed array: 5 4 3 2 1 `,

                                    `package com.javaschoollab.demo;
public class BubbleSort {
public static void main(String[] args) {
 int[] array = { 5, 3, 8, 1, 2 };
 for (int i = 0; i < array.length - 1; i++) {
 for (int j = 0; j < array.length - 1 - i; j++) {
 if (array[j] > array[j + 1]) {
 int temp = array[j];
 array[j] = array[j + 1];
 array[j + 1] = temp;
 }
 }
 }
 System.out.print("Sorted array: ");
 for (int num : array) {
 System.out.print(num + " ");
 }
 }
}

OUTPUT: Sorted array: 1 2 3 5 8 `,

                                    `package com.javaschoollab.demo;
public class SecondLargest {
public static void main(String[] args) {
 int[] array = { 5, 3, 8, 1, 2 };
 int firstLargest = Integer.MIN_VALUE;
 int secondLargest = Integer.MIN_VALUE;
 for (int num : array) {
 if (num > firstLargest) {
 secondLargest = firstLargest;
 firstLargest = num;
 } else if (num > secondLargest && num != firstLargest) {
 secondLargest = num;
 }
 }
 System.out.println("Second largest element: " + secondLargest);
 }
}

OUTPUT: Second largest element: 5 `,
                                ]
                            },
                            {
                                content: `<h4>Array Analysis & Combining Arrays</h4><ol><li>Count the number of even and odd elements in an array</li><li>Find the number of occurrences of a given element in an array</li><li>Check if an array is a palindrome</li><li>Merge two arrays</li><li>Find the intersection of two arrays</li></ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class CountEvenOdd {
public static void main(String[] args) {
 int[] array = { 5, 3, 8, 1, 2 };
 int evenCount = 0;
 int oddCount = 0;
 for (int num : array) {
 if (num % 2 == 0) {
 evenCount++;
 } else {
 oddCount++;
 }
 }
 System.out.println("Number of even elements: " + evenCount);
 System.out.println("Number of odd elements: " + oddCount);
 }
}

OUTPUT:
Number of even elements: 2
Number of odd elements: 3 `,

                                    `package com.javaschoollab.demo;
public class CountOccurrences {
public static void main(String[] args) {
 int[] array = { 5, 3, 8, 5, 2 };
 int target = 5;
 int count = 0;
 for (int num : array) {
 if (num == target) {
 count++;
 }
 }
 System.out.println("Number of occurrences of " + target + ": " + count);
 }
}

OUTPUT: Number of occurrences of 5: 2 `,

                                    `package com.javaschoollab.demo;
public class PalindromeArray {
public static void main(String[] args) {
 int[] array = { 1, 2, 3, 2, 1 };
 boolean isPalindrome = true;
 for (int i = 0; i < array.length / 2; i++) {
 if (array[i] != array[array.length - 1 - i]) {
 isPalindrome = false;
 break;
 }
 }
 System.out.println("Is array a palindrome: " + isPalindrome);
 }
}

OUTPUT: Is array a palindrome: true`,

                                    `package com.javaschoollab.demo;
import java.util.Arrays;
public class MergeArrays {
public static void main(String[] args) {
 int[] array1 = { 1, 3, 5 };
 int[] array2 = { 2, 4, 6 };
 int[] mergedArray = new int[array1.length + array2.length];
 System.arraycopy(array1, 0, mergedArray, 0, array1.length);
 System.arraycopy(array2, 0, mergedArray, array1.length, array2.length);
 System.out.println("Merged array: " + Arrays.toString(mergedArray));
 }
}

OUTPUT: Merged array: [1, 3, 5, 2, 4, 6] `,

                                    `package com.javaschoollab.demo;
import java.util.HashSet;
import java.util.Set;
public class IntersectionArrays {
public static void main(String[] args) {
 int[] array1 = { 1, 3, 4, 5 };
 int[] array2 = { 3, 5, 7, 8 };
 Set<Integer> set1 = new HashSet<>();
 Set<Integer> intersection = new HashSet<>();
 for (int num : array1) {
 set1.add(num);
 }
 for (int num : array2) {
 if (set1.contains(num)) {
 intersection.add(num);
 }
 }
 System.out.println("Intersection of arrays: " + intersection);
 }
}

OUTPUT: Intersection of arrays: [3, 5] `,
                                ]
                            },
                            {
                                content: `<h4>Array Transformation Programs</h4><ol><li>Find the union of two arrays</li><li>Remove duplicates from an array</li><li>Rotate an array to the left by a given number of positions</li><li>Rotate an array to the right by a given number of positions</li><li>Move all zeros to the end of the array</li></ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
import java.util.HashSet;
import java.util.Set;
public class UnionArrays {
public static void main(String[] args) {
 int[] array1 = { 1, 3, 4, 5 };
 int[] array2 = { 3, 5, 7, 8 };
 Set<Integer> union = new HashSet<>();
 for (int num : array1) {
 union.add(num);
 }
 for (int num : array2) {
 union.add(num);
 }
 System.out.println("Union of arrays: " + union);
 }
}

OUTPUT: Union of arrays: [1, 3, 4, 5, 7, 8]`,

                                    `package com.javaschoollab.demo;
import java.util.Arrays;
public class RemoveDuplicatesArray {
public static void main(String[] args) {
 int[] array = { 1, 2, 2, 3, 4, 4, 5 };
 int[] tempArray = Arrays.stream(array).distinct().toArray();
 System.out.print("Array after removing duplicates: ");
 for (int num : tempArray) {
 System.out.print(num + " ");
 }
 }
}

OUTPUT: Array after removing duplicates: 1 2 3 4 5 `,

                                    `package com.javaschoollab.demo;
public class LeftRotateArray {
public static void main(String[] args) {
 int[] array = { 1, 2, 3, 4, 5 };
 int n = 2; // Number of positions to rotate
 int[] rotatedArray = new int[array.length];
 for (int i = 0; i < array.length; i++) {
 rotatedArray[i] = array[(i + n) % array.length];
 }
 System.out.print("Array after left rotation: ");
 for (int num : rotatedArray) {
 System.out.print(num + " ");
 }
 }
}

OUTPUT: Array after left rotation: 3 4 5 1 2`,

                                    `package com.javaschoollab.demo;
public class RightRotateArray {
public static void main(String[] args) {
 int[] array = { 1, 2, 3, 4, 5 };
 int n = 2; // Number of positions to rotate
 int[] rotatedArray = new int[array.length];
 for (int i = 0; i < array.length; i++) {
 rotatedArray[(i + n) % array.length] = array[i];
 }
 System.out.print("Array after right rotation: ");
 for (int num : rotatedArray) {
 System.out.print(num + " ");
 }
 }
}

OUTPUT: Array after right rotation: 4 5 1 2 3 `,

                                    `package com.javaschoollab.demo;
public class MoveZerosToEnd {
public static void main(String[] args) {
 int[] array = { 0, 1, 0, 3, 12 };
 int count = 0; // Count of non-zero elements
 for (int i = 0; i < array.length; i++) {
 if (array[i] != 0) {
 array[count++] = array[i];
 }
 }
 while (count < array.length) {
 array[count++] = 0;
 }
 System.out.print("Array after moving zeros to the end: ");
 for (int num : array) {
 System.out.print(num + " ");
 }
 }
}

OUTPUT: Array after moving zeros to the end: 1 3 12 0 0 `,
                                ]
                            },
                            {
                                content: `<h4>Advanced Beginner Array Programs</h4><ol><li>Find the sum of two arrays</li><li>Find the common elements in three sorted arrays</li><li>Find the smallest and second smallest element in an array</li><li>Find the kth smallest and largest element in an array</li><li>Segregate even and odd numbers in an array</li></ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
import java.util.Arrays;
public class SumOfTwoArrays {
public static void main(String[] args) {
 int[] array1 = { 1, 2, 3 };
 int[] array2 = { 4, 5, 6 };
 int[] sumArray = new int[array1.length];
 for (int i = 0; i < array1.length; i++) {
 sumArray[i] = array1[i] + array2[i];
 }
 System.out.println("Sum of the two arrays: " + Arrays.toString(sumArray));
 }
}

OUTPUT: Sum of the two arrays: [5, 7, 9] `,

                                    `package com.javaschoollab.demo;
import java.util.ArrayList;
import java.util.List;
public class CommonElementsThreeArrays {
public static void main(String[] args) {
 int[] array1 = { 1, 5, 10, 20, 40, 80 };
 int[] array2 = { 6, 7, 20, 80, 100 };
 int[] array3 = { 3, 4, 15, 20, 30, 70, 80, 120 };
 List<Integer> common = new ArrayList<>();
 int i = 0, j = 0, k = 0;
 while (i < array1.length && j < array2.length && k < array3.length) {
 if (array1[i] == array2[j] && array2[j] == array3[k]) {
 common.add(array1[i]);
 i++;
 j++;
 k++;
 } else if (array1[i] < array2[j]) {
 i++;
 } else if (array2[j] < array3[k]) {
 j++;
 } else {
 k++;
 }
 }
 System.out.println("Common elements in three arrays: " + common);
 }
}

OUTPUT: Common elements in three arrays: [20, 80] `,

                                    `package com.javaschoollab.demo;
public class SmallestSecondSmallest {
public static void main(String[] args) {
 int[] array = { 12, 13, 1, 10, 34, 1 };
 int firstMin = Integer.MAX_VALUE, secondMin = Integer.MAX_VALUE;
 for (int num : array) {
 if (num < firstMin) {
 secondMin = firstMin;
 firstMin = num;
 } else if (num < secondMin && num != firstMin) {
 secondMin = num;
 }
 }
 System.out.println("Smallest element: " + firstMin);
 System.out.println("Second smallest element: " + secondMin);
 }
}

OUTPUT:
Smallest element: 1
Second smallest element: 10 `,

                                    `package com.javaschoollab.demo;
import java.util.Arrays;
public class KthSmallestLargest {
public static void main(String[] args) {
 int[] array = { 12, 3, 5, 7, 19 };
 int k = 2;
 Arrays.sort(array);

 int kthSmallest = array[k - 1];
 int kthLargest = array[array.length - k];

 System.out.println("k = " + k + ", smallest: " + kthSmallest);
 System.out.println("k = " + k + ", largest: " + kthLargest);
 }
}

OUTPUT:
k = 2, smallest: 5
k = 2, largest: 12 `,

                                    `package com.javaschoollab.demo;
public class SegregateEvenOdd {
public static void main(String[] args) {
 int[] array = { 12, 34, 45, 9, 8, 90, 3 };
 int left = 0, right = array.length - 1;

 while (left < right) {
 while (array[left] % 2 == 0 && left < right) {
 left++;
 }
 while (array[right] % 2 == 1 && left < right) {
 right--;
 }
 if (left < right) {
 int temp = array[left];
 array[left] = array[right];
 array[right] = temp;
 left++;
 right--;
 }
 }
 System.out.print("Array after segregation: ");

 for (int num : array) {
 System.out.print(num + " ");
 }
 }
}

OUTPUT: Array after segregation: 12 34 90 8 9 45 3 `,
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>Subsequence & Sum Programs</h4><ol><li>Find the equilibrium index of an array</li><li>Find the maximum sum of a subarray (Kadane's algorithm)</li><li>Find the longest increasing subsequence in an array</li><li>Find the longest common subsequence between two arrays</li><li>Find the missing number in a given array of size n containing numbers from 1 to n-1</li></ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class EquilibriumIndex {
public static void main(String[] args) {
 int[] array = { 1, 3, 5, 2, 2 };
 int totalSum = 0, leftSum = 0;
 for (int num : array) {
 totalSum += num;
 }
 for (int i = 0; i < array.length; i++) {
 totalSum -= array[i];
 if (leftSum == totalSum) {
 System.out.println("Equilibrium index: " + i);
 return;
 }
 leftSum += array[i];
 }
 System.out.println("No equilibrium index found");
 }
}

OUTPUT: Equilibrium index: 2 `,

                                    `package com.javaschoollab.demo;
public class KadanesAlgorithm {
public static void main(String[] args) {
 int[] array = { -2, 1, -3, 4, -1, 2, 1, -5, 4 };
 int maxSoFar = array[0], maxEndingHere = array[0];
 for (int i = 1; i < array.length; i++) {
 maxEndingHere = Math.max(array[i], maxEndingHere + array[i]);
 maxSoFar = Math.max(maxSoFar, maxEndingHere);
 }
 System.out.println("Maximum sum of a subarray: " + maxSoFar);
 }
}

OUTPUT: Maximum sum of a subarray: 6 `,

                                    `package com.javaschoollab.demo;
import java.util.Arrays;
public class LongestIncreasingSubsequence {
public static void main(String[] args) {
 int[] array = { 10, 22, 9, 33, 21, 50, 41, 60, 80 };
 int[] lis = new int[array.length];
 Arrays.fill(lis, 1);
 for (int i = 1; i < array.length; i++) {
 for (int j = 0; j < i; j++) {
 if (array[i] > array[j] && lis[i] < lis[j] + 1) {
 lis[i] = lis[j] + 1;
 }
 }
 }
 int maxLis = 0;
 for (int i = 0; i < lis.length; i++) {
 if (maxLis < lis[i]) {
 maxLis = lis[i];
 }
 }
 System.out.println("Length of longest increasing subsequence: " + maxLis);
 }
}

OUTPUT: Length of longest increasing subsequence: 6 `,

                                    `package com.javaschoollab.demo;
public class LongestCommonSubsequence {
public static void main(String[] args) {
 int[] array1 = { 1, 3, 4, 1, 2, 8 };
 int[] array2 = { 3, 4, 1, 2, 1, 3, 8 };
 int[][] lcs = new int[array1.length + 1][array2.length + 1];
 for (int i = 1; i <= array1.length; i++) {
 for (int j = 1; j <= array2.length; j++) {
 if (array1[i - 1] == array2[j - 1]) {
 lcs[i][j] = lcs[i - 1][j - 1] + 1;
 } else {
 lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
 }
 }
 }
 System.out.println("Length of longest common subsequence: " + lcs[array1.length][array2.length]);
 }
}

OUTPUT: Length of longest common subsequence: 5 `,

                                    `package com.javaschoollab.demo;
public class MissingNumber {
public static void main(String[] args) {
 int[] array = { 1, 2, 4, 5, 6 };
 int n = array.length + 1; // As one number is missing
 int totalSum = (n * (n + 1)) / 2;
 int arraySum = 0;
 for (int num : array) {
 arraySum += num;
 }
 int missingNumber = totalSum - arraySum;
 System.out.println("Missing number: " + missingNumber);
 }
}

OUTPUT: Missing number: 3 `,
                                ]
                            },
                            {
                                content: `<h4>Subarray & Pair Analysis</h4><ol><li>Check if there are duplicate elements in an array within k distance from each other</li><li>Find the length of the largest subarray with 0 sum</li><li>Find the largest subarray with equal number of 0s and 1s</li><li>Find the maximum product of two integers in an array</li><li>Find the peak element in an array</li></ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
import java.util.HashSet;
public class DuplicatesWithinKDistance {
public static void main(String[] args) {
 int[] array = { 1, 2, 3, 1, 4, 5 };
 int k = 3;
 boolean duplicatesFound = false;
 HashSet<Integer> set = new HashSet<>();
 for (int i = 0; i < array.length; i++) {
 if (set.contains(array[i])) {
 duplicatesFound = true;
 break;
 }
 set.add(array[i]);
 if (i >= k) {
 set.remove(array[i - k]);
 }
 }
 System.out.println("Duplicates within " + k + " distance: " + duplicatesFound);
 }
}

OUTPUT: Duplicates within 3 distance: true `,

                                    `package com.javaschoollab.demo;
import java.util.HashMap;
public class LargestSubarrayWithZeroSum {
public static void main(String[] args) {
 int[] array = { 15, -2, 2, -8, 1, 7, 10, 23 };
 HashMap<Integer, Integer> map = new HashMap<>();
 int maxLength = 0, sum = 0;
 for (int i = 0; i < array.length; i++) {
 sum += array[i];
 if (array[i] == 0 && maxLength == 0) {
 maxLength = 1;
 }
 if (sum == 0) {
 maxLength = i + 1;
 }
 Integer prevIndex = map.get(sum);
 if (prevIndex != null) {
 maxLength = Math.max(maxLength, i - prevIndex);
 } else {
 map.put(sum, i);
 }
 }
 System.out.println("Length of the largest subarray with 0 sum: " + maxLength);
 }
}
OUTPUT: Length of the largest subarray with 0 sum: 5 `,

                                    `package com.javaschoollab.demo;
import java.util.HashMap;
public class LargestSubarrayEqualZerosOnes {
public static void main(String[] args) {
 int[] array = { 1, 0, 0, 1, 0, 1, 1 };
 HashMap<Integer, Integer> map = new HashMap<>();
 int maxLength = 0, sum = 0;
 for (int i = 0; i < array.length; i++) {
 sum += (array[i] == 0) ? -1 : 1;
 if (sum == 0) {
 maxLength = i + 1;
 }
 if (map.containsKey(sum)) {
 maxLength = Math.max(maxLength, i - map.get(sum));
 } else {
 map.put(sum, i);
 }
 }
 System.out.println("Largest subarray with equal number of 0s and 1s: " + maxLength);
 }
}

OUTPUT: Largest subarray with equal number of 0s and 1s: 6 `,

                                    `package com.javaschoollab.demo;
public class MaximumProduct {
public static void main(String[] args) {
 int[] array = { 1, 20, 30, 40, 50, 60 };
 int maxProduct = Integer.MIN_VALUE;
 for (int i = 0; i < array.length - 1; i++) {
 for (int j = i + 1; j < array.length; j++) {
 int product = array[i] * array[j];
 if (product > maxProduct) {
 maxProduct = product;
 }
 }
 }
 System.out.println("Maximum product of two integers: " + maxProduct);
 }
}

OUTPUT: Maximum product of two integers: 3000`,

                                    `package com.javaschoollab.demo;
public class PeakElement {
public static void main(String[] args) {
 int[] array = { 1, 3, 20, 4, 1, 0 };
 int peakElement = findPeakElement(array);
 System.out.println("Peak element: " + peakElement);
 }
public static int findPeakElement(int[] array) {
 int left = 0, right = array.length - 1;
 while (left < right) {
 int mid = (left + right) / 2;
 if (array[mid] > array[mid + 1]) {
 right = mid;
 } else {
 left = mid + 1;
 }
 }
 return array[left];
 }
}
OUTPUT: Peak element: 20 `,
                                ]
                            },
                            {
                                content: `<h4>Element Relationship Programs</h4><ol><li>Find the maximum difference between two elements in an array such that larger element appears after the smaller element</li><li>Find the element that appears more than n/2 times in an array (Majority Element)</li><li>Find the next greater element for each element in an array</li><li>Find the first repeating and first non-repeating element in an array</li><li>Find the maximum sum of a subarray with at least k elements</li></ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class MaximumDifference {
public static void main(String[] args) {
 int[] array = { 2, 3, 10, 6, 4, 8, 1 };
 int maxDifference = array[1] - array[0];
 int minElement = array[0];
 for (int i = 1; i < array.length; i++) {
 if (array[i] - minElement > maxDifference) {
 maxDifference = array[i] - minElement;
 }
 if (array[i] < minElement) {
 minElement = array[i];
 }
 }
 System.out.println("Maximum difference: " + maxDifference);
 }
}

OUTPUT: Maximum difference: 8 `,

                                    `package com.javaschoollab.demo;
public class MajorityElement {
public static void main(String[] args) {
 int[] array = { 2, 2, 1, 1, 1, 2, 2 };
 int count = 0, candidate = -1;
 for (int num : array) {
 if (count == 0) {
 candidate = num;
 }
 count += (num == candidate) ? 1 : -1;
 }
 count = 0;
 for (int num : array) {
 if (num == candidate) {
 count++;
 }
 }
 if (count > array.length / 2) {
 System.out.println("Majority element: " + candidate);
 } else {
 System.out.println("No majority element found");
 }
 }
}

OUTPUT: Majority element: 2 `,

                                    `package com.javaschoollab.demo;
import java.util.Stack;
public class NextGreaterElement {
public static void main(String[] args) {
 int[] array = { 4, 5, 2, 25 };
 int[] nge = new int[array.length];
 Stack<Integer> stack = new Stack<>();
 for (int i = array.length - 1; i >= 0; i--) {
 while (!stack.isEmpty() && stack.peek() <= array[i]) {
 stack.pop();
 }
 nge[i] = stack.isEmpty() ? -1 : stack.peek();
 stack.push(array[i]);
 }
 System.out.print("Next greater elements: ");
 for (int num : nge) {
 System.out.print(num + " ");
 }
 }
}
OUTPUT: Next greater elements: 5 25 25 -1
`,

                                    `package com.javaschoollab.demo;
import java.util.HashMap;
import java.util.Map;
public class FirstRepeatingNonRepeating {
public static void main(String[] args) {
 int[] array = { 10, 5, 3, 4, 3, 5, 6 };
 Map<Integer, Integer> countMap = new HashMap<>();
 Integer firstRepeating = null, firstNonRepeating = null;
 for (int num : array) {
 countMap.put(num, countMap.getOrDefault(num, 0) + 1);
 }
 for (int num : array) {
 if (countMap.get(num) > 1) {
 firstRepeating = num;
 break;
 }
 }
 for (int num : array) {
 if (countMap.get(num) == 1) {
 firstNonRepeating = num;
 break;
 }
 }
 System.out.println("First repeating element: " + firstRepeating);
 System.out.println("First non-repeating element: " + firstNonRepeating);
 }
}

OUTPUT:
First repeating element: 5
First non-repeating element: 10 `,

                                    `package com.javaschoollab.demo;
public class MaxSumSubarrayAtLeastK {
public static void main(String[] args) {
 int[] array = { 1, 2, 3, -10, -3 };
 int k = 2;
 int n = array.length;
 int[] maxSum = new int[n];
 maxSum[0] = array[0];
 for (int i = 1; i < n; i++) {
 maxSum[i] = Math.max(array[i], maxSum[i - 1] + array[i]);
 }
 int sum = 0;
 for (int i = 0; i < k; i++) {
 sum += array[i];
 }
 int result = sum;
 for (int i = k; i < n; i++) {
 sum = sum + array[i] - array[i - k];
 result = Math.max(result, sum);
 result = Math.max(result, sum + maxSum[i - k]);
 }
 System.out.println("Maximum sum of subarray with at least " + k + " elements: " + result);
 }
}

OUTPUT: Maximum sum of subarray with at least 2 elements: 6 `,
                                ]
                            },
                            {
                                content: `<h4>Advanced Subarray Sum Programs</h4><ol><li>Check if there is a subarray with sum equal to zero</li><li>Find the sum of the minimum elements of all subarrays</li><li>Find the maximum circular subarray sum</li><li>Find the maximum sum of a subarray with exactly k elements</li><li>Find the minimum difference between the sums of two subarrays of size n/2</li></ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
import java.util.HashSet;
public class SubarrayWithZeroSum {
public static void main(String[] args) {
 int[] array = { 4, 2, -3, 1, 6 };
 boolean found = false;
 int sum = 0;
 HashSet<Integer> set = new HashSet<>();
 for (int num : array) {
 sum += num;
 if (sum == 0 || set.contains(sum)) {
 found = true;
 break;
 }
 set.add(sum);
 }
 System.out.println("Is there a subarray with sum equal to zero: " + found);
 }
}

OUTPUT: Is there a subarray with sum equal to zero: true `,

                                    `package com.javaschoollab.demo;
public class SumOfMinElements {
public static void main(String[] args) {
 int[] array = { 3, 1, 2, 4 };
 int n = array.length;
 int result = 0;
 for (int i = 0; i < n; i++) {
 int min = array[i];
 for (int j = i; j < n; j++) {
 min = Math.min(min, array[j]);
 result += min;
 }
 }
 System.out.println("Sum of the minimum elements of all subarrays: " + result);
 }
}

OUTPUT: Sum of the minimum elements of all subarrays: 17 `,

                                    `package com.javaschoollab.demo;
public class MaxCircularSubarraySum {
public static void main(String[] args) {
 int[] array = { 8, -8, 9, -9, 10, -11, 12 };
 int maxKadane = kadane(array);
 int maxWrap = 0;
 for (int i = 0; i < array.length; i++) {
 maxWrap += array[i];
 array[i] = -array[i];
 }
 maxWrap = maxWrap + kadane(array);
 int result = Math.max(maxKadane, maxWrap);
 System.out.println("Maximum circular subarray sum: " + result);
 }
private static int kadane(int[] array) {
 int maxSoFar = array[0], maxEndingHere = array[0];
 for (int i = 1; i < array.length; i++) {
 maxEndingHere = Math.max(array[i], maxEndingHere + array[i]);
 maxSoFar = Math.max(maxSoFar, maxEndingHere);
 }
 return maxSoFar;
 }
}

OUTPUT: Maximum circular subarray sum: 22 `,

                                    `package com.javaschoollab.demo;
public class MaxSumSubarrayExactlyK {
public static void main(String[] args) {
 int[] array = { 2, 1, 5, 1, 3, 2 };
 int k = 3;
 int maxSum = 0;
 for (int i = 0; i < k; i++) {
 maxSum += array[i];
 }
 int windowSum = maxSum;
 for (int i = k; i < array.length; i++) {
 windowSum += array[i] - array[i - k];
 maxSum = Math.max(maxSum, windowSum);
 }
 System.out.println("Maximum sum of subarray with exactly " + k + " elements: " + maxSum);
 }
}

OUTPUT: Maximum sum of subarray with exactly 3 elements: 9`,

                                    `package com.javaschoollab.demo;
import java.util.Arrays;
public class MinDifferenceSubarrays {
public static void main(String[] args) {
 int[] array = { 1, 6, 11, 5 };
 int totalSum = Arrays.stream(array).sum();
 int n = array.length / 2;
 int targetSum = totalSum / 2;
 boolean[][] dp = new boolean[array.length + 1][targetSum + 1];
 for (int i = 0; i <= array.length; i++) {
 dp[i][0] = true;
 }
 for (int i = 1; i <= array.length; i++) {
 for (int j = 1; j <= targetSum; j++) {
 if (array[i - 1] <= j) {
 dp[i][j] = dp[i - 1][j] || dp[i - 1][j - array[i - 1]];
 } else {
 dp[i][j] = dp[i - 1][j];
 }
 }
 }
 int sum1 = 0;
 for (int j = targetSum; j >= 0; j--) {
 if (dp[array.length][j]) {
 sum1 = j;
 break;
 }
 }
 int sum2 = totalSum - sum1;
 int minDifference = Math.abs(sum2 - sum1);
 System.out.println("Minimum difference between the sums of two subarrays of size n/2: "
+ minDifference);
 }
}

OUTPUT: Minimum difference between the sums of two subarrays of size n/2: 1 `,
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h4>Advanced Subarray Search Programs</h4><ol><li>Check if a given array represents a Binary Search Tree or not</li><li>Find the maximum length of a subarray with a given sum</li><li>Find the minimum length of a subarray with a given sum</li><li>Find the maximum length of a subarray with distinct elements</li><li>Find the minimum length of a subarray with all elements of another array</li></ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class ArrayRepresentsBST {
public static void main(String[] args) {
 int[] array = { 3, 5, 7, 9, 11, 13, 15 };
 boolean isBST = isBST(array, 0, array.length - 1);
 System.out.println("Does the array represent a BST: " + isBST);
 }
public static boolean isBST(int[] array, int start, int end) {
 if (start >= end) {
 return true;
 }
 int mid = (start + end) / 2;
 if ((mid > 0 && array[mid] <= array[mid - 1]) || (mid < array.length - 1 && array[mid] >=
array[mid + 1])) {
 return false;
 }
 return isBST(array, start, mid - 1) && isBST(array, mid + 1, end);
 }
}

OUTPUT: Does the array represent a BST: true `,

                                    `package com.javaschoollab.demo;
import java.util.HashMap;
public class MaxLengthSubarrayGivenSum {
public static void main(String[] args) {
 int[] array = { 10, 5, 2, 7, 1, 9 };
 int targetSum = 15;
 int maxLength = 0;
 int sum = 0;
 HashMap<Integer, Integer> map = new HashMap<>();
 for (int i = 0; i < array.length; i++) {
 sum += array[i];
 if (sum == targetSum) {
 maxLength = i + 1;
 }
 if (map.containsKey(sum - targetSum)) {
 maxLength = Math.max(maxLength, i - map.get(sum - targetSum));
 }
 map.putIfAbsent(sum, i);
 }
 System.out.println("Maximum length of subarray with sum " + targetSum + ": " + maxLength);
 }
}

OUTPUT: Maximum length of subarray with sum 15: 4 `,

                                    `package com.javaschoollab.demo;
public class MinLengthSubarrayGivenSum {
public static void main(String[] args) {
 int[] array = { 2, 3, 1, 2, 4, 3 };
 int targetSum = 7;
 int minLength = Integer.MAX_VALUE;
 int sum = 0;
 int left = 0;
 for (int right = 0; right < array.length; right++) {
 sum += array[right];
 while (sum >= targetSum) {
 minLength = Math.min(minLength, right - left + 1);
 sum -= array[left++];
 }
 }
 if (minLength == Integer.MAX_VALUE) {
 System.out.println("No subarray with the given sum found");
 } else {
 System.out.println("Minimum length of subarray with sum " + targetSum + ": " +
minLength);
 }
 }
}

OUTPUT: Minimum length of subarray with sum 7: 2 `,

                                    `package com.javaschoollab.demo;
import java.util.HashSet;
public class MaxLengthSubarrayDistinctElements {
public static void main(String[] args) {
 int[] array = { 5, 2, 3, 5, 4, 3 };
 int maxLength = 0;
 int left = 0;
 HashSet<Integer> set = new HashSet<>();
 for (int right = 0; right < array.length; right++) {
 while (set.contains(array[right])) {
 set.remove(array[left]);
 left++;
 }
 set.add(array[right]);
 maxLength = Math.max(maxLength, right - left + 1);
 }
 System.out.println("Maximum length of subarray with distinct elements: " + maxLength);
 }
}

OUTPUT: Maximum length of subarray with distinct elements: 4 `,

                                    `package com.javaschoollab.demo;
import java.util.HashMap;
import java.util.Map;
public class MinLengthSubarrayWithAllElements {
public static void main(String[] args) {
 int[] array1 = { 2, 3, 1, 2, 4, 3 };
 int[] array2 = { 2, 4, 3 };
 int minLength = Integer.MAX_VALUE;
 Map<Integer, Integer> map = new HashMap<>();
 for (int num : array2) {
 map.put(num, map.getOrDefault(num, 0) + 1);
 }
 int left = 0;
 int count = 0;
 for (int right = 0; right < array1.length; right++) {
 if (map.containsKey(array1[right])) {
 map.put(array1[right], map.get(array1[right]) - 1);
 if (map.get(array1[right]) >= 0) {
 count++;
 }
 }
 while (count == array2.length) {
 minLength = Math.min(minLength, right - left + 1);
 if (map.containsKey(array1[left])) {
 map.put(array1[left], map.get(array1[left]) + 1);
 if (map.get(array1[left]) > 0) {
 count--;
 }
 }
 left++;
 }
 }
 if (minLength == Integer.MAX_VALUE) {
 System.out.println("No subarray contains all elements of the given array");
 } else {
 System.out.println("Minimum length of subarray with all elements of given array:
" + minLength);
 }
 }
}

OUTPUT: Minimum length of subarray with all elements of given array: 3 `,
                                ]
                            },
                            {
                                content: `<h4>Sliding Window & Hashing Programs</h4><ol><li>Find the length of the smallest subarray with at least k distinct elements</li><li>Find the longest subarray with the same element</li><li>Find the longest subarray with alternating even and odd elements</li><li>Find the longest subarray with a sum less than or equal to a given value</li><li>Find the number of subarrays with a given sum</li></ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
import java.util.HashMap;
import java.util.Map;
public class SmallestSubarrayWithKDistinct {
public static void main(String[] args) {
 int[] array = { 1, 2, 1, 2, 3 };
 int k = 2;
 int minLength = Integer.MAX_VALUE;
 Map<Integer, Integer> map = new HashMap<>();
 int left = 0;
 for (int right = 0; right < array.length; right++) {
 map.put(array[right], map.getOrDefault(array[right], 0) + 1);
 while (map.size() >= k) {
 minLength = Math.min(minLength, right - left + 1);
 if (map.get(array[left]) == 1) {
 map.remove(array[left]);
 } else {
 map.put(array[left], map.get(array[left]) - 1);
 }
 left++;
 }
 }
 if (minLength == Integer.MAX_VALUE) {
 System.out.println("No subarray with at least " + k + " distinct elements found");
 } else {
 System.out.println("Length of smallest subarray with at least " + k + " distinct
elements: " + minLength);
 }
 }
}

OUTPUT: Length of smallest subarray with at least 2 distinct elements: 2`,

                                    `package com.javaschoollab.demo;
public class LongestSubarrayWithSameElement {
public static void main(String[] args) {
 int[] array = { 1, 1, 2, 2, 2, 3, 3 };
 int maxLength = 1, currentLength = 1;
 for (int i = 1; i < array.length; i++) {
 if (array[i] == array[i - 1]) {
 currentLength++;
 } else {
 maxLength = Math.max(maxLength, currentLength);
 currentLength = 1;
 }
 }
 maxLength = Math.max(maxLength, currentLength);
 System.out.println("Length of longest subarray with the same element: " + maxLength);
 }
}

OUTPUT: Length of longest subarray with the same element: 3 `,

                                    `package com.javaschoollab.demo;
public class LongestSubarrayAlternatingEvenOdd {
public static void main(String[] args) {
 int[] array = { 10, 12, 14, 7, 8 };
 int maxLength = 1, currentLength = 1;
 for (int i = 1; i < array.length; i++) {
 if ((array[i] % 2 == 0 && array[i - 1] % 2 != 0) || (array[i] % 2 != 0 && array[i - 1]
% 2 == 0)) {
 currentLength++;
 } else {
 maxLength = Math.max(maxLength, currentLength);
 currentLength = 1;
 }
 }
 maxLength = Math.max(maxLength, currentLength);
 System.out.println("Length of longest subarray with alternating even and odd elements: " +
maxLength);
 }
}

OUTPUT: Length of longest subarray with alternating even and odd elements: 3`,

                                    `package com.javaschoollab.demo;
public class LongestSubarrayWithSumLE {
public static void main(String[] args) {
 int[] array = { 1, 2, 3, 4, 5 };
 int target = 11;
 int maxLength = 0, sum = 0, left = 0;
 for (int right = 0; right < array.length; right++) {
 sum += array[right];
 while (sum > target) {
 sum -= array[left++];
 }
 maxLength = Math.max(maxLength, right - left + 1);
 }
 System.out.println("Longest subarray with a sum less than or equal to " + target + ": " +
maxLength);
 }
}

OUTPUT: Longest subarray with a sum less than or equal to 11: 4 `,

                                    `package com.javaschoollab.demo;
import java.util.HashMap;
public class SubarraysWithGivenSum {
public static void main(String[] args) {
 int[] array = { 10, 2, -2, -20, 10 };
 int target = -10;
 int count = 0, sum = 0;
 HashMap<Integer, Integer> map = new HashMap<>();
 for (int num : array) {
 sum += num;
 if (sum == target) {
 count++;
 }
 if (map.containsKey(sum - target)) {
 count += map.get(sum - target);
 }
 map.put(sum, map.getOrDefault(sum, 0) + 1);
 }
 System.out.println("Number of subarrays with sum " + target + ": " + count);
 }
}

OUTPUT: Number of subarrays with sum -10: 3 `,
                                ]
                            },
                            {
                                content: `<h4>Two-Pointer & In-Place Techniques</h4><ol><li>Find all pairs in a sorted array with a given sum (two-pointer technique, O(n))</li><li>Rotate an array left using the 3-reversal trick (in-place, O(1) extra space)</li><li>Find all duplicate elements in O(n) time and O(1) extra space (values in range 1..n)</li><li>Trapping Rain Water - maximum water trapped between bars (two-pointer, O(n))</li><li>Longest subarray of 1s after flipping at most k zeros (sliding window, O(n))</li></ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class PairsWithGivenSum {
public static void main(String[] args) {
 int[] array = { 1, 2, 3, 4, 6, 8, 9, 11 };
 int target = 10;
 int left = 0, right = array.length - 1;
 System.out.print("Pairs with sum " + target + ": ");
 while (left < right) {
 int sum = array[left] + array[right];
 if (sum == target) {
 System.out.print("(" + array[left] + ", " + array[right] + ") ");
 left++;
 right--;
 } else if (sum < target) {
 left++;
 } else {
 right--;
 }
 }
}
}

OUTPUT: Pairs with sum 10: (1, 9) (2, 8) (4, 6) `,

                                    `package com.javaschoollab.demo;
import java.util.Arrays;
public class RotateArrayReversalTrick {
public static void main(String[] args) {
 int[] array = { 1, 2, 3, 4, 5, 6, 7 };
 int d = 2;
 reverse(array, 0, d - 1);
 reverse(array, d, array.length - 1);
 reverse(array, 0, array.length - 1);
 System.out.println("Array after left rotation by " + d + ": " + Arrays.toString(array));
}
private static void reverse(int[] array, int start, int end) {
 while (start < end) {
 int temp = array[start];
 array[start] = array[end];
 array[end] = temp;
 start++;
 end--;
 }
}
}

// Trick: reverse first d elements, reverse remaining n-d elements, then reverse the whole array.
OUTPUT: Array after left rotation by 2: [3, 4, 5, 6, 7, 1, 2] `,

                                    `package com.javaschoollab.demo;
import java.util.ArrayList;
import java.util.List;
public class FindAllDuplicatesInPlace {
public static void main(String[] args) {
 int[] array = { 4, 3, 2, 7, 8, 2, 3, 1 };
 List<Integer> duplicates = new ArrayList<>();
 for (int i = 0; i < array.length; i++) {
 int index = Math.abs(array[i]) - 1;
 if (array[index] < 0) {
 duplicates.add(index + 1);
 } else {
 array[index] = -array[index];
 }
 }
 System.out.println("Duplicate elements: " + duplicates);
}
}

// Trick: for each value x, negate array[x-1]; if it's already negative, x is a duplicate.
OUTPUT: Duplicate elements: [2, 3] `,

                                    `package com.javaschoollab.demo;
public class TrappingRainWater {
public static void main(String[] args) {
 int[] height = { 0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1 };
 int left = 0, right = height.length - 1;
 int leftMax = 0, rightMax = 0, water = 0;
 while (left < right) {
 if (height[left] < height[right]) {
 leftMax = Math.max(leftMax, height[left]);
 water += leftMax - height[left];
 left++;
 } else {
 rightMax = Math.max(rightMax, height[right]);
 water += rightMax - height[right];
 right--;
 }
 }
 System.out.println("Total trapped rain water: " + water);
}
}

OUTPUT: Total trapped rain water: 6 `,

                                    `package com.javaschoollab.demo;
public class LongestSubarrayWithKZeroFlips {
public static void main(String[] args) {
 int[] array = { 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0 };
 int k = 2;
 int left = 0, zeros = 0, maxLength = 0;
 for (int right = 0; right < array.length; right++) {
 if (array[right] == 0) {
 zeros++;
 }
 while (zeros > k) {
 if (array[left] == 0) {
 zeros--;
 }
 left++;
 }
 maxLength = Math.max(maxLength, right - left + 1);
 }
 System.out.println("Longest subarray of 1s after flipping at most " + k + " zeros: " + maxLength);
}
}

OUTPUT: Longest subarray of 1s after flipping at most 2 zeros: 6 `
                                ]
                            }
                        ]
};
