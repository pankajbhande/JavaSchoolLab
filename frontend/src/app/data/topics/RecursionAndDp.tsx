import { Topic } from '../coreJava';

export const recursionAndDp: Topic = {
    id: 'dsa-dynamic-programming-fibonacci-dp',
    name: 'Fibonacci (DP)',
    beginner: [
        {
            content: `<h3>Recursion</h3>
A recursive function calls itself with a smaller version of the problem until it reaches a <strong>base case</strong> that can be answered directly without further recursion. Every recursive function needs both a base case (to stop) and a recursive case (to progress toward it).<br>`,
            codeExamples: [
                `// Naive recursive Fibonacci - O(2^n), very slow for large n
// because it recomputes the same subproblems repeatedly
int fib(int n) {
    if (n <= 1) return n;         // base case
    return fib(n - 1) + fib(n - 2); // recursive case
}

System.out.println(fib(10)); // 55`
            ]
        }
    ],
    intermediate: [
        {
            content: `<h4>Dynamic Programming (Memoization)</h4>
Dynamic Programming speeds up recursive solutions that re-solve the same subproblems, by <strong>caching (memoizing)</strong> each subproblem's result the first time it's computed. This turns exponential-time recursion into linear or polynomial time.<br>`,
            codeExamples: [
                `import java.util.HashMap;
import java.util.Map;

// Memoized Fibonacci - O(n), each value computed only once
Map<Integer, Long> cache = new HashMap<>();

long fibMemo(int n) {
    if (n <= 1) return n;
    if (cache.containsKey(n)) return cache.get(n); // reuse cached result

    long result = fibMemo(n - 1) + fibMemo(n - 2);
    cache.put(n, result); // cache it for future calls
    return result;
}

System.out.println(fibMemo(50)); // instant, vs impossibly slow with naive recursion`
            ]
        }
    ]
};
