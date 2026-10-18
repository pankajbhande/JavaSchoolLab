// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };
// ===== Interfaces =====








// ===== Module 01 — Programming Concepts =====
import { variablesConcept } from './topics/VariablesConcept';
import { dataConcept } from './topics/DataConcept';
import { memoryConcept } from './topics/MemoryConcept';
import { algorithmsIntro } from './topics/AlgorithmsIntro';
import { flowchartsConcept } from './topics/FlowchartsConcept';
import { conditionsConcept } from './topics/ConditionsConcept';
import { loopsConcept } from './topics/LoopsConcept';
import { functionsConcept } from './topics/FunctionsConcept';
import { recursionConcept } from './topics/RecursionConcept';
import { inputOutputConcept } from './topics/InputOutputConcept';

// ===== Module 02 — Algorithms =====
import { searchingAlgorithms } from './topics/SearchingAlgorithms';
import { sortingAlgorithms } from './topics/SortingAlgorithms';
import { recursionAlgorithm } from './topics/RecursionAlgorithm';
import { backtrackingAlgorithm } from './topics/BacktrackingAlgorithm';
import { greedyAlgorithms } from './topics/GreedyAlgorithms';
import { dynamicProgramming } from './topics/DynamicProgramming';
import { divideAndConquer } from './topics/DivideAndConquer';
import { graphAlgorithms } from './topics/GraphAlgorithms';
import { treeAlgorithms } from './topics/TreeAlgorithms';

// ===== Module 03 — Complexity =====
import { bigONotation } from './topics/BigONotation';
import { bigOmegaNotation } from './topics/BigOmegaNotation';
import { bigThetaNotation } from './topics/BigThetaNotation';
import { timeComplexity } from './topics/TimeComplexity';
import { spaceComplexity } from './topics/SpaceComplexity';
import { amortizedComplexity } from './topics/AmortizedComplexity';

// ===== Course Data =====
export const ProgrammingFundamentals: Course[] = [
  {
    id: 'programming-fundamentals',
    name: 'Programming Fundamentals',
    icon: 'Layout',

    subTopics: [
      {
        id: 'programming-concepts',
        name: 'Programming Concepts',
        topics: [
          variablesConcept,
          dataConcept,
          memoryConcept,
          algorithmsIntro,
          flowchartsConcept,
          conditionsConcept,
          loopsConcept,
          functionsConcept,
          recursionConcept,
          inputOutputConcept
        ]
      },
      {
        id: 'algorithms-module',
        name: 'Algorithms',
        topics: [
          searchingAlgorithms,
          sortingAlgorithms,
          recursionAlgorithm,
          backtrackingAlgorithm,
          greedyAlgorithms,
          dynamicProgramming,
          divideAndConquer,
          graphAlgorithms,
          treeAlgorithms
        ]
      },
      {
        id: 'complexity-module',
        name: 'Complexity',
        topics: [
          bigONotation,
          bigOmegaNotation,
          bigThetaNotation,
          timeComplexity,
          spaceComplexity,
          amortizedComplexity
        ]
      }
    ],

    cheatNotes: [
      'Big-O - Upper bound (worst case) growth rate of an algorithm',
      'Big-Omega - Lower bound (best case) growth rate of an algorithm',
      'Big-Theta - Tight bound, used when best case and worst case match',
      'O(1) - Constant time, e.g. array index access',
      'O(log n) - Logarithmic time, e.g. binary search',
      'O(n) - Linear time, e.g. a single loop over an array',
      'O(n log n) - Linearithmic time, e.g. merge sort, quick sort average case',
      'O(n^2) - Quadratic time, e.g. bubble sort, nested loops',
      'Amortized O(1) - ArrayList.add() average cost despite occasional O(n) resizes',
      'Recursion - A function calling itself with a base case to stop',
      'Backtracking - Recursive search that undoes ("backtracks") choices that fail',
      'Dynamic Programming - Solving overlapping subproblems once and caching results',
      'Greedy Algorithm - Makes the locally optimal choice at each step, not always globally optimal',
      'Divide and Conquer - Break a problem into subproblems, solve, then combine',
      'BFS - Breadth-First Search, explores a graph level by level using a queue',
      'DFS - Depth-First Search, explores a graph as deep as possible before backtracking'
    ],

    interviewQuestions: [
      {
        company: 'General DSA & Programming Fundamentals',
        questions: [
          'What is the difference between Big-O, Big-Omega, and Big-Theta?',
          'What is the time and space complexity of common sorting algorithms?',
          'Explain the difference between recursion and iteration.',
          'When would you use Dynamic Programming instead of plain recursion?',
          'What is the difference between BFS and DFS, and when would you use each?',
          'Why is ArrayList.add() considered amortized O(1)?',
          'Explain backtracking with an example.',
          'What is the difference between a greedy algorithm and dynamic programming?',
          'What is the time complexity of binary search and why does it require sorted data?',
          'Explain divide and conquer with a real algorithm example.'
        ]
      }
    ]
  }
];
