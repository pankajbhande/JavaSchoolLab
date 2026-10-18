// The DSA (Data Structures & Algorithms) syllabus: 23 categories spanning interview prep
// through competitive programming. Most topics start as placeholders (name + a short
// "coming soon" body) and get real content filled in one at a time - the navigation and
// routing for the whole syllabus exists from day one, same shape as springBootModules.ts.
//
// A handful of topics already had full write-ups under the old "Algorithms" course; those
// are imported and slotted into their matching category below instead of being stubbed.

import type { Topic, SubTopic } from './types';
import { complexityAnalysis } from './topics/ComplexityAnalysis';
import { sortingAlgorithms } from './topics/SortingAlgorithms';
import { searchingAlgorithms } from './topics/SearchingAlgorithms';
import { recursionAndDp } from './topics/RecursionAndDp';
import { graphBfsdfs } from './topics/GraphBfsdfs';

import { array1D } from './topics/dsa/Array1D';
import { array2DMatrix } from './topics/dsa/Array2DMatrix';
import { prefixSum } from './topics/dsa/PrefixSum';
import { suffixSum } from './topics/dsa/SuffixSum';
import { differenceArray } from './topics/dsa/DifferenceArray';
import { kadanesAlgorithm } from './topics/dsa/KadanesAlgorithm';
import { slidingWindow } from './topics/dsa/SlidingWindow';
import { twoPointers } from './topics/dsa/TwoPointers';
import { fastSlowPointersArray } from './topics/dsa/FastSlowPointersArray';
import { arrayRotation } from './topics/dsa/ArrayRotation';
import { cyclicSort } from './topics/dsa/CyclicSort';
import { dutchNationalFlag } from './topics/dsa/DutchNationalFlag';
import { mergeIntervalsArray } from './topics/dsa/MergeIntervalsArray';
import { monotonicArray } from './topics/dsa/MonotonicArray';
import { rangeQueriesArray } from './topics/dsa/RangeQueriesArray';

import { stringManipulation } from './topics/dsa/StringManipulation';
import { characterFrequency } from './topics/dsa/CharacterFrequency';
import { anagram } from './topics/dsa/Anagram';
import { palindrome } from './topics/dsa/Palindrome';
import { substringsSubsequences } from './topics/dsa/SubstringsSubsequences';
import { prefixSuffixString } from './topics/dsa/PrefixSuffixString';
import { stringHashing } from './topics/dsa/StringHashing';
import { rollingHash } from './topics/dsa/RollingHash';
import { patternMatching } from './topics/dsa/PatternMatching';
import { kmpAlgorithm } from './topics/dsa/KmpAlgorithm';
import { zAlgorithm } from './topics/dsa/ZAlgorithm';
import { rabinKarpAlgorithm } from './topics/dsa/RabinKarpAlgorithm';
import { manachersAlgorithm } from './topics/dsa/ManachersAlgorithm';
import { trieBasedStringProblems } from './topics/dsa/TrieBasedStringProblems';

import { hashMapTopic } from './topics/dsa/HashMapTopic';
import { hashSetTopic } from './topics/dsa/HashSetTopic';
import { frequencyMapTopic } from './topics/dsa/FrequencyMapTopic';
import { collisionConcepts } from './topics/dsa/CollisionConcepts';
import { customHashing } from './topics/dsa/CustomHashing';
import { prefixSumHashMap } from './topics/dsa/PrefixSumHashMap';
import { twoSumPattern } from './topics/dsa/TwoSumPattern';
import { subarraySumHashing } from './topics/dsa/SubarraySumHashing';
import { longestConsecutiveSequence } from './topics/dsa/LongestConsecutiveSequence';

import { singlyLinkedList } from './topics/dsa/SinglyLinkedList';
import { doublyLinkedList } from './topics/dsa/DoublyLinkedList';
import { circularLinkedList } from './topics/dsa/CircularLinkedList';
import { reverseLinkedList } from './topics/dsa/ReverseLinkedList';
import { detectCycleFloyd } from './topics/dsa/DetectCycleFloyd';
import { findCycleStart } from './topics/dsa/FindCycleStart';
import { mergeLinkedLists } from './topics/dsa/MergeLinkedLists';
import { intersectionOfLinkedLists } from './topics/dsa/IntersectionOfLinkedLists';
import { removeNthNode } from './topics/dsa/RemoveNthNode';
import { fastSlowPointerLinkedList } from './topics/dsa/FastSlowPointerLinkedList';
import { lruCache } from './topics/dsa/LruCache';

import { stackImplementation } from './topics/dsa/StackImplementation';
import { balancedParentheses } from './topics/dsa/BalancedParentheses';
import { monotonicStackTopic } from './topics/dsa/MonotonicStackTopic';
import { nextGreaterElement } from './topics/dsa/NextGreaterElement';
import { nextSmallerElement } from './topics/dsa/NextSmallerElement';
import { previousGreaterSmaller } from './topics/dsa/PreviousGreaterSmaller';
import { largestRectangleHistogram } from './topics/dsa/LargestRectangleHistogram';
import { stockSpan } from './topics/dsa/StockSpan';
import { expressionEvaluation } from './topics/dsa/ExpressionEvaluation';
import { infixPrefixPostfix } from './topics/dsa/InfixPrefixPostfix';
import { minStack } from './topics/dsa/MinStack';
import { maxStack } from './topics/dsa/MaxStack';

import { queueTopic } from './topics/dsa/QueueTopic';
import { circularQueue } from './topics/dsa/CircularQueue';
import { dequeTopic } from './topics/dsa/DequeTopic';
import { priorityQueueTopic } from './topics/dsa/PriorityQueueTopic';
import { monotonicQueue } from './topics/dsa/MonotonicQueue';
import { slidingWindowMaxMin } from './topics/dsa/SlidingWindowMaxMin';

import { binarySearchTopic } from './topics/dsa/BinarySearchTopic';
import { lowerBound } from './topics/dsa/LowerBound';
import { upperBound } from './topics/dsa/UpperBound';
import { binarySearchOnAnswer } from './topics/dsa/BinarySearchOnAnswer';
import { searchInRotatedSortedArray } from './topics/dsa/SearchInRotatedSortedArray';
import { ternarySearch } from './topics/dsa/TernarySearch';
import { exponentialSearch } from './topics/dsa/ExponentialSearch';
import { interpolationSearch } from './topics/dsa/InterpolationSearch';

import { selectionSort } from './topics/dsa/SelectionSort';
import { insertionSort } from './topics/dsa/InsertionSort';
import { mergeSortTopic } from './topics/dsa/MergeSortTopic';
import { quickSortTopic } from './topics/dsa/QuickSortTopic';
import { heapSortTopic } from './topics/dsa/HeapSortTopic';
import { countingSort } from './topics/dsa/CountingSort';
import { radixSort } from './topics/dsa/RadixSort';
import { bucketSort } from './topics/dsa/BucketSort';
import { stableVsUnstableSorting } from './topics/dsa/StableVsUnstableSorting';
import { inPlaceSorting } from './topics/dsa/InPlaceSorting';
import { comparatorCustomSorting } from './topics/dsa/ComparatorCustomSorting';
import { externalSorting } from './topics/dsa/ExternalSorting';

import { binaryTree } from './topics/dsa/BinaryTree';
import { binarySearchTreeTopic } from './topics/dsa/BinarySearchTreeTopic';
import { fullCompletePerfectBinaryTree } from './topics/dsa/FullCompletePerfectBinaryTree';
import { balancedTree } from './topics/dsa/BalancedTree';
import { treeTraversalPreorder } from './topics/dsa/TreeTraversalPreorder';
import { treeTraversalInorder } from './topics/dsa/TreeTraversalInorder';
import { treeTraversalPostorder } from './topics/dsa/TreeTraversalPostorder';
import { treeTraversalLevelOrder } from './topics/dsa/TreeTraversalLevelOrder';
import { recursiveTraversal } from './topics/dsa/RecursiveTraversal';
import { iterativeTraversal } from './topics/dsa/IterativeTraversal';
import { heightDepth } from './topics/dsa/HeightDepth';
import { diameterOfATree } from './topics/dsa/DiameterOfATree';
import { lowestCommonAncestor } from './topics/dsa/LowestCommonAncestor';
import { pathSum } from './topics/dsa/PathSum';
import { treeViewLeft } from './topics/dsa/TreeViewLeft';
import { treeViewRight } from './topics/dsa/TreeViewRight';
import { treeViewTop } from './topics/dsa/TreeViewTop';
import { treeViewBottom } from './topics/dsa/TreeViewBottom';
import { boundaryTraversal } from './topics/dsa/BoundaryTraversal';
import { verticalTraversal } from './topics/dsa/VerticalTraversal';
import { zigzagTraversal } from './topics/dsa/ZigzagTraversal';
import { serializeDeserializeTree } from './topics/dsa/SerializeDeserializeTree';
import { bstOperations } from './topics/dsa/BstOperations';
import { bstValidation } from './topics/dsa/BstValidation';
import { kthSmallestLargestBst } from './topics/dsa/KthSmallestLargestBst';
import { morrisTraversal } from './topics/dsa/MorrisTraversal';

import { minHeap } from './topics/dsa/MinHeap';
import { maxHeap } from './topics/dsa/MaxHeap';
import { heapify } from './topics/dsa/Heapify';
import { buildHeap } from './topics/dsa/BuildHeap';
import { heapSortViaPriorityQueue } from './topics/dsa/HeapSortViaPriorityQueue';
import { kthLargestSmallestHeap } from './topics/dsa/KthLargestSmallestHeap';
import { topKProblems } from './topics/dsa/TopKProblems';
import { medianFromDataStream } from './topics/dsa/MedianFromDataStream';
import { twoHeapTechnique } from './topics/dsa/TwoHeapTechnique';
import { priorityQueueViaHeap } from './topics/dsa/PriorityQueueViaHeap';
import { dfsGraph } from './topics/dsa/DfsGraph';

import { recursionTree } from './topics/dsa/RecursionTree';
import { subsetsTopic } from './topics/dsa/SubsetsTopic';
import { subsequencesBacktracking } from './topics/dsa/SubsequencesBacktracking';
import { permutationsTopic } from './topics/dsa/PermutationsTopic';
import { combinationsTopic } from './topics/dsa/CombinationsTopic';
import { combinationSum } from './topics/dsa/CombinationSum';
import { nQueens } from './topics/dsa/NQueens';
import { sudokuSolver } from './topics/dsa/SudokuSolver';
import { ratInAMaze } from './topics/dsa/RatInAMaze';
import { wordSearchBacktracking } from './topics/dsa/WordSearchBacktracking';
import { generateParentheses } from './topics/dsa/GenerateParentheses';
import { backtrackingWithPruning } from './topics/dsa/BacktrackingWithPruning';
import { constraintSatisfaction } from './topics/dsa/ConstraintSatisfaction';

import { activitySelection } from './topics/dsa/ActivitySelection';
import { fractionalKnapsack } from './topics/dsa/FractionalKnapsack';
import { jobSequencing } from './topics/dsa/JobSequencing';
import { intervalScheduling } from './topics/dsa/IntervalScheduling';
import { mergeIntervalsGreedy } from './topics/dsa/MergeIntervalsGreedy';
import { minimumPlatforms } from './topics/dsa/MinimumPlatforms';
import { huffmanCoding } from './topics/dsa/HuffmanCoding';
import { gasStation } from './topics/dsa/GasStation';
import { jumpGame } from './topics/dsa/JumpGame';
import { fractionalOptimization } from './topics/dsa/FractionalOptimization';
import { greedyPlusHeap } from './topics/dsa/GreedyPlusHeap';

import { climbingStairs } from './topics/dsa/ClimbingStairs';
import { houseRobber } from './topics/dsa/HouseRobber';
import { kadaneDpFramework } from './topics/dsa/KadaneDpFramework';
import { gridPaths } from './topics/dsa/GridPaths';
import { uniquePaths } from './topics/dsa/UniquePaths';
import { minimumPathSum } from './topics/dsa/MinimumPathSum';
import { zeroOneKnapsack } from './topics/dsa/ZeroOneKnapsack';
import { unboundedKnapsack } from './topics/dsa/UnboundedKnapsack';
import { boundedKnapsack } from './topics/dsa/BoundedKnapsack';
import { subsetSumDp } from './topics/dsa/SubsetSumDp';
import { equalPartition } from './topics/dsa/EqualPartition';
import { targetSum } from './topics/dsa/TargetSum';

import { longestCommonSubsequence } from './topics/dsa/LongestCommonSubsequence';
import { longestCommonSubstring } from './topics/dsa/LongestCommonSubstring';
import { editDistance } from './topics/dsa/EditDistance';
import { longestPalindromicSubsequence } from './topics/dsa/LongestPalindromicSubsequence';
import { palindromePartitioning } from './topics/dsa/PalindromePartitioning';
import { longestIncreasingSubsequence } from './topics/dsa/LongestIncreasingSubsequence';
import { numberOfLis } from './topics/dsa/NumberOfLis';
import { maximumSumIncreasingSubsequence } from './topics/dsa/MaximumSumIncreasingSubsequence';
import { matrixChainMultiplication } from './topics/dsa/MatrixChainMultiplication';
import { burstBalloons } from './topics/dsa/BurstBalloons';
import { optimalBst } from './topics/dsa/OptimalBst';
import { diameterTreeDp } from './topics/dsa/DiameterTreeDp';
import { maximumPathSumTreeDp } from './topics/dsa/MaximumPathSumTreeDp';
import { treeIndependentSet } from './topics/dsa/TreeIndependentSet';
import { travelingSalesmanProblem } from './topics/dsa/TravelingSalesmanProblem';
import { assignmentProblems } from './topics/dsa/AssignmentProblems';
import { countingNumbersDigitDp } from './topics/dsa/CountingNumbersDigitDp';
import { digitConstraints } from './topics/dsa/DigitConstraints';

import { trieBasics } from './topics/dsa/TrieBasics';
import { prefixSearchTrie } from './topics/dsa/PrefixSearchTrie';
import { wordSearchTrie } from './topics/dsa/WordSearchTrie';
import { autoComplete } from './topics/dsa/AutoComplete';
import { wordDictionary } from './topics/dsa/WordDictionary';
import { binaryTrie } from './topics/dsa/BinaryTrie';
import { xorProblemsTrie } from './topics/dsa/XorProblemsTrie';

import { graphAdjacencyMatrix } from './topics/dsa/GraphAdjacencyMatrix';
import { graphAdjacencyList } from './topics/dsa/GraphAdjacencyList';
import { directedGraph } from './topics/dsa/DirectedGraph';
import { undirectedGraph } from './topics/dsa/UndirectedGraph';
import { weightedGraph } from './topics/dsa/WeightedGraph';
import { connectedComponents } from './topics/dsa/ConnectedComponents';
import { cycleDetectionGraph } from './topics/dsa/CycleDetectionGraph';
import { bipartiteGraph } from './topics/dsa/BipartiteGraph';
import { topologicalSort } from './topics/dsa/TopologicalSort';
import { kahnsAlgorithm } from './topics/dsa/KahnsAlgorithm';
import { dfsTopologicalSort } from './topics/dsa/DfsTopologicalSort';
import { shortestPathDijkstra } from './topics/dsa/ShortestPathDijkstra';
import { mstPrims } from './topics/dsa/MstPrims';
import { mstKruskals } from './topics/dsa/MstKruskals';
import { disjointSetUnion } from './topics/dsa/DisjointSetUnion';
import { unionFindApplications } from './topics/dsa/UnionFindApplications';

import { segmentTree } from './topics/dsa/SegmentTree';
import { lazyPropagation } from './topics/dsa/LazyPropagation';
import { fenwickTreeBit } from './topics/dsa/FenwickTreeBit';

import { bitwiseOperators } from './topics/dsa/BitwiseOperators';
import { leftRightShift } from './topics/dsa/LeftRightShift';
import { setBit } from './topics/dsa/SetBit';
import { clearBit } from './topics/dsa/ClearBit';
import { toggleBit } from './topics/dsa/ToggleBit';
import { checkBit } from './topics/dsa/CheckBit';
import { countSetBits } from './topics/dsa/CountSetBits';
import { powerOf2 } from './topics/dsa/PowerOf2';
import { xorProperties } from './topics/dsa/XorProperties';
import { xorBasis } from './topics/dsa/XorBasis';
import { bitmasking } from './topics/dsa/Bitmasking';
import { bitmaskDp } from './topics/dsa/BitmaskDp';

const slug = (s: string) =>
    s.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

function placeholder(categoryId: string, name: string): Topic {
    return {
        id: `${categoryId}-${slug(name)}`,
        name,
        beginner: [
            {
                content: `<h4>${name}</h4>
Content for this topic is coming soon.`
            }
        ]
    };
}

/** Builds a module from topic names, swapping in a pre-written Topic wherever `overrides` names one. */
function buildModule(id: string, name: string, topicNames: string[], overrides: Record<string, Topic> = {}): SubTopic {
    return {
        id,
        name,
        topics: topicNames.map(n => overrides[n] ?? placeholder(id, n))
    };
}

export const dsaModules: SubTopic[] = [
    buildModule('dsa-foundations', 'Foundations', [
        'Time Complexity - Big O, Omega, Theta',
        'Space Complexity',
        'Recursion',
        'Iteration vs Recursion',
        'Mathematical Analysis',
        'Amortized Analysis',
        'Bit Manipulation Basics',
        'Modular Arithmetic',
        'GCD / LCM',
        'Prime Numbers / Sieve',
        'Combinatorics',
        'Probability Basics'
    ], { 'Time Complexity - Big O, Omega, Theta': complexityAnalysis }),

    buildModule('dsa-arrays', 'Arrays', [
        '1D Arrays',
        '2D / Matrix',
        'Prefix Sum',
        'Suffix Sum',
        'Difference Array',
        "Kadane's Algorithm",
        'Sliding Window',
        'Two Pointers',
        'Fast & Slow Pointers',
        'Array Rotation',
        'Cyclic Sort',
        'Dutch National Flag',
        'Merge Intervals',
        'Monotonic Array',
        'Range Queries'
    ], {
        '1D Arrays': array1D,
        '2D / Matrix': array2DMatrix,
        'Prefix Sum': prefixSum,
        'Suffix Sum': suffixSum,
        'Difference Array': differenceArray,
        "Kadane's Algorithm": kadanesAlgorithm,
        'Sliding Window': slidingWindow,
        'Two Pointers': twoPointers,
        'Fast & Slow Pointers': fastSlowPointersArray,
        'Array Rotation': arrayRotation,
        'Cyclic Sort': cyclicSort,
        'Dutch National Flag': dutchNationalFlag,
        'Merge Intervals': mergeIntervalsArray,
        'Monotonic Array': monotonicArray,
        'Range Queries': rangeQueriesArray
    }),

    buildModule('dsa-strings', 'Strings', [
        'String Manipulation',
        'Character Frequency',
        'Anagram',
        'Palindrome',
        'Substrings / Subsequences',
        'Prefix / Suffix',
        'String Hashing',
        'Rolling Hash',
        'Pattern Matching',
        'KMP Algorithm',
        'Z Algorithm',
        'Rabin-Karp Algorithm',
        "Manacher's Algorithm",
        'Trie-based String Problems'
    ], {
        'String Manipulation': stringManipulation,
        'Character Frequency': characterFrequency,
        'Anagram': anagram,
        'Palindrome': palindrome,
        'Substrings / Subsequences': substringsSubsequences,
        'Prefix / Suffix': prefixSuffixString,
        'String Hashing': stringHashing,
        'Rolling Hash': rollingHash,
        'Pattern Matching': patternMatching,
        'KMP Algorithm': kmpAlgorithm,
        'Z Algorithm': zAlgorithm,
        'Rabin-Karp Algorithm': rabinKarpAlgorithm,
        "Manacher's Algorithm": manachersAlgorithm,
        'Trie-based String Problems': trieBasedStringProblems
    }),

    buildModule('dsa-linked-list', 'Linked List', [
        'Singly Linked List',
        'Doubly Linked List',
        'Circular Linked List',
        'Reverse Linked List',
        "Detect Cycle - Floyd's Algorithm",
        'Find Cycle Start',
        'Merge Linked Lists',
        'Intersection of Linked Lists',
        'Remove Nth Node',
        'Fast & Slow Pointer',
        'LRU Cache'
    ], {
        'Singly Linked List': singlyLinkedList,
        'Doubly Linked List': doublyLinkedList,
        'Circular Linked List': circularLinkedList,
        'Reverse Linked List': reverseLinkedList,
        "Detect Cycle - Floyd's Algorithm": detectCycleFloyd,
        'Find Cycle Start': findCycleStart,
        'Merge Linked Lists': mergeLinkedLists,
        'Intersection of Linked Lists': intersectionOfLinkedLists,
        'Remove Nth Node': removeNthNode,
        'Fast & Slow Pointer': fastSlowPointerLinkedList,
        'LRU Cache': lruCache
    }),

    buildModule('dsa-stack', 'Stack', [
        'Stack Implementation',
        'Balanced Parentheses',
        'Monotonic Stack',
        'Next Greater Element',
        'Next Smaller Element',
        'Previous Greater / Smaller',
        'Largest Rectangle in Histogram',
        'Stock Span',
        'Expression Evaluation',
        'Infix / Prefix / Postfix',
        'Min Stack',
        'Max Stack'
    ], {
        'Stack Implementation': stackImplementation,
        'Balanced Parentheses': balancedParentheses,
        'Monotonic Stack': monotonicStackTopic,
        'Next Greater Element': nextGreaterElement,
        'Next Smaller Element': nextSmallerElement,
        'Previous Greater / Smaller': previousGreaterSmaller,
        'Largest Rectangle in Histogram': largestRectangleHistogram,
        'Stock Span': stockSpan,
        'Expression Evaluation': expressionEvaluation,
        'Infix / Prefix / Postfix': infixPrefixPostfix,
        'Min Stack': minStack,
        'Max Stack': maxStack
    }),

    buildModule('dsa-queue-deque', 'Queue / Deque', [
        'Queue',
        'Circular Queue',
        'Deque',
        'Priority Queue',
        'Monotonic Queue',
        'Sliding Window Maximum / Minimum'
    ], {
        'Queue': queueTopic,
        'Circular Queue': circularQueue,
        'Deque': dequeTopic,
        'Priority Queue': priorityQueueTopic,
        'Monotonic Queue': monotonicQueue,
        'Sliding Window Maximum / Minimum': slidingWindowMaxMin
    }),

    buildModule('dsa-hashing', 'Hashing', [
        'HashMap',
        'HashSet',
        'Frequency Map',
        'Collision Concepts',
        'Custom Hashing',
        'Prefix-Sum + HashMap',
        'Two-Sum Pattern',
        'Subarray Sum',
        'Longest Consecutive Sequence'
    ], {
        'HashMap': hashMapTopic,
        'HashSet': hashSetTopic,
        'Frequency Map': frequencyMapTopic,
        'Collision Concepts': collisionConcepts,
        'Custom Hashing': customHashing,
        'Prefix-Sum + HashMap': prefixSumHashMap,
        'Two-Sum Pattern': twoSumPattern,
        'Subarray Sum': subarraySumHashing,
        'Longest Consecutive Sequence': longestConsecutiveSequence
    }),

    buildModule('dsa-sorting', 'Sorting', [
        'Bubble Sort',
        'Selection Sort',
        'Insertion Sort',
        'Merge Sort',
        'Quick Sort',
        'Heap Sort',
        'Counting Sort',
        'Radix Sort',
        'Bucket Sort',
        'Stable vs Unstable Sorting',
        'In-place Sorting',
        'Comparator / Custom Sorting',
        'External Sorting'
    ], {
        'Bubble Sort': sortingAlgorithms,
        'Selection Sort': selectionSort,
        'Insertion Sort': insertionSort,
        'Merge Sort': mergeSortTopic,
        'Quick Sort': quickSortTopic,
        'Heap Sort': heapSortTopic,
        'Counting Sort': countingSort,
        'Radix Sort': radixSort,
        'Bucket Sort': bucketSort,
        'Stable vs Unstable Sorting': stableVsUnstableSorting,
        'In-place Sorting': inPlaceSorting,
        'Comparator / Custom Sorting': comparatorCustomSorting,
        'External Sorting': externalSorting
    }),

    buildModule('dsa-searching', 'Searching', [
        'Linear Search',
        'Binary Search',
        'Lower Bound',
        'Upper Bound',
        'Binary Search on Answer',
        'Search in Rotated Sorted Array',
        'Ternary Search',
        'Exponential Search',
        'Interpolation Search'
    ], {
        'Linear Search': searchingAlgorithms,
        'Binary Search': binarySearchTopic,
        'Lower Bound': lowerBound,
        'Upper Bound': upperBound,
        'Binary Search on Answer': binarySearchOnAnswer,
        'Search in Rotated Sorted Array': searchInRotatedSortedArray,
        'Ternary Search': ternarySearch,
        'Exponential Search': exponentialSearch,
        'Interpolation Search': interpolationSearch
    }),

    buildModule('dsa-trees', 'Trees', [
        'Binary Tree',
        'Binary Search Tree - BST',
        'Full / Complete / Perfect Binary Tree',
        'Balanced Tree',
        'Tree Traversal - Preorder',
        'Tree Traversal - Inorder',
        'Tree Traversal - Postorder',
        'Tree Traversal - Level Order',
        'Recursive Traversal',
        'Iterative Traversal',
        'Height / Depth',
        'Diameter of a Tree',
        'Lowest Common Ancestor',
        'Path Sum',
        'Tree View - Left View',
        'Tree View - Right View',
        'Tree View - Top View',
        'Tree View - Bottom View',
        'Boundary Traversal',
        'Vertical Traversal',
        'Zigzag Traversal',
        'Serialize / Deserialize a Tree',
        'BST Operations',
        'BST Validation',
        'Kth Smallest / Largest in BST',
        'Morris Traversal'
    ], {
        'Binary Tree': binaryTree,
        'Binary Search Tree - BST': binarySearchTreeTopic,
        'Full / Complete / Perfect Binary Tree': fullCompletePerfectBinaryTree,
        'Balanced Tree': balancedTree,
        'Tree Traversal - Preorder': treeTraversalPreorder,
        'Tree Traversal - Inorder': treeTraversalInorder,
        'Tree Traversal - Postorder': treeTraversalPostorder,
        'Tree Traversal - Level Order': treeTraversalLevelOrder,
        'Recursive Traversal': recursiveTraversal,
        'Iterative Traversal': iterativeTraversal,
        'Height / Depth': heightDepth,
        'Diameter of a Tree': diameterOfATree,
        'Lowest Common Ancestor': lowestCommonAncestor,
        'Path Sum': pathSum,
        'Tree View - Left View': treeViewLeft,
        'Tree View - Right View': treeViewRight,
        'Tree View - Top View': treeViewTop,
        'Tree View - Bottom View': treeViewBottom,
        'Boundary Traversal': boundaryTraversal,
        'Vertical Traversal': verticalTraversal,
        'Zigzag Traversal': zigzagTraversal,
        'Serialize / Deserialize a Tree': serializeDeserializeTree,
        'BST Operations': bstOperations,
        'BST Validation': bstValidation,
        'Kth Smallest / Largest in BST': kthSmallestLargestBst,
        'Morris Traversal': morrisTraversal
    }),

    buildModule('dsa-heap', 'Heap', [
        'Min Heap',
        'Max Heap',
        'Heapify',
        'Build Heap',
        'Heap Sort',
        'Kth Largest / Smallest',
        'Top K Problems',
        'Median from Data Stream',
        'Two Heap Technique',
        'Priority Queue'
    ], {
        'Min Heap': minHeap,
        'Max Heap': maxHeap,
        'Heapify': heapify,
        'Build Heap': buildHeap,
        'Heap Sort': heapSortViaPriorityQueue,
        'Kth Largest / Smallest': kthLargestSmallestHeap,
        'Top K Problems': topKProblems,
        'Median from Data Stream': medianFromDataStream,
        'Two Heap Technique': twoHeapTechnique,
        'Priority Queue': priorityQueueViaHeap
    }),

    buildModule('dsa-trie', 'Trie', [
        'Trie',
        'Prefix Search',
        'Word Search',
        'Auto-complete',
        'Word Dictionary',
        'Binary Trie',
        'XOR Problems (Trie)'
    ], {
        'Trie': trieBasics,
        'Prefix Search': prefixSearchTrie,
        'Word Search': wordSearchTrie,
        'Auto-complete': autoComplete,
        'Word Dictionary': wordDictionary,
        'Binary Trie': binaryTrie,
        'XOR Problems (Trie)': xorProblemsTrie
    }),

    buildModule('dsa-graphs', 'Graphs', [
        'Graph Representation - Adjacency Matrix',
        'Graph Representation - Adjacency List',
        'Directed Graph',
        'Undirected Graph',
        'Weighted Graph',
        'BFS',
        'DFS',
        'Connected Components',
        'Cycle Detection',
        'Bipartite Graph',
        'Topological Sort',
        "Kahn's Algorithm",
        'DFS Topological Sort',
        'Shortest Path - BFS',
        'Shortest Path - Dijkstra',
        'Shortest Path - Bellman-Ford',
        'Shortest Path - Floyd-Warshall',
        "Minimum Spanning Tree - Prim's",
        "Minimum Spanning Tree - Kruskal's",
        'Disjoint Set Union - DSU',
        'Union-Find',
        'Strongly Connected Components - Kosaraju',
        'Strongly Connected Components - Tarjan',
        'Bridges',
        'Articulation Points',
        'Euler Path / Circuit',
        'Hamiltonian Path / Cycle',
        'Graph Coloring',
        'Network Flow',
        'Maximum Flow',
        'Bipartite Matching'
    ], {
        'BFS': graphBfsdfs,
        'DFS': dfsGraph,
        'Graph Representation - Adjacency Matrix': graphAdjacencyMatrix,
        'Graph Representation - Adjacency List': graphAdjacencyList,
        'Directed Graph': directedGraph,
        'Undirected Graph': undirectedGraph,
        'Weighted Graph': weightedGraph,
        'Connected Components': connectedComponents,
        'Cycle Detection': cycleDetectionGraph,
        'Bipartite Graph': bipartiteGraph,
        'Topological Sort': topologicalSort,
        "Kahn's Algorithm": kahnsAlgorithm,
        'DFS Topological Sort': dfsTopologicalSort,
        'Shortest Path - Dijkstra': shortestPathDijkstra,
        "Minimum Spanning Tree - Prim's": mstPrims,
        "Minimum Spanning Tree - Kruskal's": mstKruskals,
        'Disjoint Set Union - DSU': disjointSetUnion,
        'Union-Find': unionFindApplications
    }),

    buildModule('dsa-recursion-backtracking', 'Recursion & Backtracking', [
        'Recursion Tree',
        'Subsets',
        'Subsequences',
        'Permutations',
        'Combinations',
        'Combination Sum',
        'N-Queens',
        'Sudoku Solver',
        'Rat in a Maze',
        'Word Search (Backtracking)',
        'Generate Parentheses',
        'Backtracking with Pruning',
        'Constraint Satisfaction'
    ], {
        'Recursion Tree': recursionTree,
        'Subsets': subsetsTopic,
        'Subsequences': subsequencesBacktracking,
        'Permutations': permutationsTopic,
        'Combinations': combinationsTopic,
        'Combination Sum': combinationSum,
        'N-Queens': nQueens,
        'Sudoku Solver': sudokuSolver,
        'Rat in a Maze': ratInAMaze,
        'Word Search (Backtracking)': wordSearchBacktracking,
        'Generate Parentheses': generateParentheses,
        'Backtracking with Pruning': backtrackingWithPruning,
        'Constraint Satisfaction': constraintSatisfaction
    }),

    buildModule('dsa-greedy', 'Greedy Algorithms', [
        'Activity Selection',
        'Fractional Knapsack',
        'Job Sequencing',
        'Interval Scheduling',
        'Merge Intervals (Greedy)',
        'Minimum Platforms',
        'Huffman Coding',
        'Gas Station',
        'Jump Game',
        'Fractional Optimization',
        'Greedy + Heap'
    ], {
        'Activity Selection': activitySelection,
        'Fractional Knapsack': fractionalKnapsack,
        'Job Sequencing': jobSequencing,
        'Interval Scheduling': intervalScheduling,
        'Merge Intervals (Greedy)': mergeIntervalsGreedy,
        'Minimum Platforms': minimumPlatforms,
        'Huffman Coding': huffmanCoding,
        'Gas Station': gasStation,
        'Jump Game': jumpGame,
        'Fractional Optimization': fractionalOptimization,
        'Greedy + Heap': greedyPlusHeap
    }),

    buildModule('dsa-dynamic-programming', 'Dynamic Programming', [
        // 1D DP
        'Fibonacci (DP)',
        'Climbing Stairs',
        'House Robber',
        'Kadane (DP)',
        // 2D DP
        'Grid Paths',
        'Unique Paths',
        'Minimum Path Sum',
        // Knapsack
        '0/1 Knapsack',
        'Unbounded Knapsack',
        'Bounded Knapsack',
        'Subset Sum',
        'Equal Partition',
        'Target Sum',
        // String DP
        'Longest Common Subsequence - LCS',
        'Longest Common Substring',
        'Edit Distance',
        'Longest Palindromic Subsequence',
        'Palindrome Partitioning',
        // Sequence DP
        'Longest Increasing Subsequence - LIS',
        'Number of LIS',
        'Maximum Sum Increasing Subsequence',
        // Interval DP
        'Matrix Chain Multiplication',
        'Burst Balloons',
        'Optimal BST',
        // Tree DP
        'Diameter (Tree DP)',
        'Maximum Path Sum (Tree DP)',
        'Tree Independent Set',
        // Bitmask DP
        'Traveling Salesman Problem',
        'Assignment Problems',
        // Digit DP
        'Counting Numbers (Digit DP)',
        'Digit Constraints'
    ], {
        'Fibonacci (DP)': recursionAndDp,
        'Climbing Stairs': climbingStairs,
        'House Robber': houseRobber,
        'Kadane (DP)': kadaneDpFramework,
        'Grid Paths': gridPaths,
        'Unique Paths': uniquePaths,
        'Minimum Path Sum': minimumPathSum,
        '0/1 Knapsack': zeroOneKnapsack,
        'Unbounded Knapsack': unboundedKnapsack,
        'Bounded Knapsack': boundedKnapsack,
        'Subset Sum': subsetSumDp,
        'Equal Partition': equalPartition,
        'Target Sum': targetSum,
        'Longest Common Subsequence - LCS': longestCommonSubsequence,
        'Longest Common Substring': longestCommonSubstring,
        'Edit Distance': editDistance,
        'Longest Palindromic Subsequence': longestPalindromicSubsequence,
        'Palindrome Partitioning': palindromePartitioning,
        'Longest Increasing Subsequence - LIS': longestIncreasingSubsequence,
        'Number of LIS': numberOfLis,
        'Maximum Sum Increasing Subsequence': maximumSumIncreasingSubsequence,
        'Matrix Chain Multiplication': matrixChainMultiplication,
        'Burst Balloons': burstBalloons,
        'Optimal BST': optimalBst,
        'Diameter (Tree DP)': diameterTreeDp,
        'Maximum Path Sum (Tree DP)': maximumPathSumTreeDp,
        'Tree Independent Set': treeIndependentSet,
        'Traveling Salesman Problem': travelingSalesmanProblem,
        'Assignment Problems': assignmentProblems,
        'Counting Numbers (Digit DP)': countingNumbersDigitDp,
        'Digit Constraints': digitConstraints
    }),

    buildModule('dsa-divide-conquer', 'Divide & Conquer', [
        'Merge Sort (Divide & Conquer)',
        'Quick Sort (Divide & Conquer)',
        'Binary Search (Divide & Conquer)',
        'Counting Inversions',
        'Closest Pair of Points',
        'Divide & Conquer Optimization'
    ]),

    buildModule('dsa-bit-manipulation', 'Bit Manipulation', [
        'AND / OR / XOR / NOT',
        'Left / Right Shift',
        'Set Bit',
        'Clear Bit',
        'Toggle Bit',
        'Check Bit',
        'Count Set Bits',
        'Power of 2',
        'XOR Properties',
        'XOR Basis',
        'Bitmasking',
        'Bitmask DP'
    ], {
        'AND / OR / XOR / NOT': bitwiseOperators,
        'Left / Right Shift': leftRightShift,
        'Set Bit': setBit,
        'Clear Bit': clearBit,
        'Toggle Bit': toggleBit,
        'Check Bit': checkBit,
        'Count Set Bits': countSetBits,
        'Power of 2': powerOf2,
        'XOR Properties': xorProperties,
        'XOR Basis': xorBasis,
        'Bitmasking': bitmasking,
        'Bitmask DP': bitmaskDp
    }),

    buildModule('dsa-advanced-data-structures', 'Advanced Data Structures', [
        'AVL Tree',
        'Red-Black Tree',
        'B-Tree',
        'B Plus Tree',
        'Segment Tree',
        'Lazy Propagation',
        'Fenwick Tree / BIT',
        'Sparse Table',
        'Disjoint Set Union (Advanced)',
        'Interval Tree',
        'Ordered Set / Ordered Map',
        'Skip List'
    ], {
        'Segment Tree': segmentTree,
        'Lazy Propagation': lazyPropagation,
        'Fenwick Tree / BIT': fenwickTreeBit
    }),

    buildModule('dsa-advanced-algorithms', 'Advanced Algorithms', [
        "Tarjan's Algorithm",
        "Kosaraju's Algorithm",
        'Dijkstra (Advanced)',
        'Bellman-Ford (Advanced)',
        'Floyd-Warshall (Advanced)',
        'A* Search',
        'KMP (Advanced)',
        'Z Algorithm (Advanced)',
        'Manacher (Advanced)',
        'Rabin-Karp (Advanced)',
        'Boyer-Moore',
        'Kruskal (Advanced)',
        'Prim (Advanced)',
        'Ford-Fulkerson',
        'Edmonds-Karp',
        'Dinic',
        'Hopcroft-Karp',
        'Convex Hull (Advanced)',
        'Line Sweep',
        'Meet in the Middle',
        "Mo's Algorithm",
        'Heavy-Light Decomposition',
        'Centroid Decomposition'
    ]),

    buildModule('dsa-computational-geometry', 'Computational Geometry', [
        'Points / Lines',
        'Distance',
        'Orientation',
        'Cross Product',
        'Dot Product',
        'Line Intersection',
        'Segment Intersection',
        'Convex Hull',
        'Graham Scan',
        'Monotonic Chain',
        'Closest Pair',
        'Sweep Line'
    ]),

    buildModule('dsa-range-query', 'Range Query Techniques', [
        'Prefix Sum (Range Query)',
        'Difference Array (Range Query)',
        'Sparse Table (Range Query)',
        'Segment Tree (Range Query)',
        'Lazy Segment Tree',
        'Fenwick Tree (Range Query)',
        "Mo's Algorithm (Range Query)"
    ]),

    buildModule('dsa-patterns', 'Important Problem-Solving Patterns', [
        'Two Pointers (Pattern)',
        'Sliding Window (Pattern)',
        'Fast & Slow Pointer (Pattern)',
        'Prefix Sum (Pattern)',
        'Difference Array (Pattern)',
        'Binary Search on Answer (Pattern)',
        'Merge Intervals (Pattern)',
        'Monotonic Stack (Pattern)',
        'Monotonic Queue (Pattern)',
        'Top K Elements (Pattern)',
        'BFS / DFS (Pattern)',
        'Multi-source BFS',
        '0-1 BFS',
        'Topological Sorting (Pattern)',
        'Union-Find (Pattern)',
        'Greedy (Pattern)',
        'Backtracking (Pattern)',
        'Memoization (Pattern)',
        'Tabulation',
        'Divide & Conquer (Pattern)',
        'Bitmasking (Pattern)',
        'Meet in the Middle (Pattern)',
        'Sweep Line (Pattern)',
        'Coordinate Compression',
        'State Compression'
    ])
];
