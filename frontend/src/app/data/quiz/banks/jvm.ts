import type { QuizBank } from '../types';

// Course-wide bank: java-memory-jvm (Java Memory & JVM) — covers all five of its modules.
export const jvm: QuizBank = {
  key: 'java-memory-jvm',
  label: 'Java Memory & JVM',
  questions: [
    {
      id: 'jvm-stack-vs-heap',
      question: 'Where do a local reference variable and the object it points at actually live?',
      options: [
        'The reference sits in the thread stack frame; the object itself is on the shared heap',
        'Both live on the stack for speed',
        'Both live on the heap, the stack only holds primitives',
        'The reference is on the heap and the object is in the method area',
      ],
      correctAnswer: 0,
      explanation:
        'Each thread owns a private stack holding frames of locals, which is why locals are inherently thread safe. Objects are allocated on the heap and shared, which is exactly why they need synchronisation.',
      difficulty: 'beginner',
    },
    {
      id: 'jvm-stack-per-thread',
      question: 'Which JVM memory area is private to each thread?',
      options: [
        'The stack and the program counter register',
        'The heap',
        'The method area',
        'The string pool',
      ],
      correctAnswer: 0,
      explanation:
        'Every thread gets its own stack, PC register and native method stack. The heap and the method area (metaspace) are shared, which is the root of every visibility and race problem in Java.',
      difficulty: 'intermediate',
    },
    {
      id: 'jvm-metaspace',
      question: 'What replaced PermGen in Java 8, and where does it live?',
      options: [
        'Metaspace, which is allocated in native memory rather than the Java heap',
        'The old generation, which absorbed all class metadata',
        'The code cache, which now stores class definitions',
        'Nothing, PermGen is still used and simply resized',
      ],
      correctAnswer: 0,
      explanation:
        'Class metadata moved out of the fixed-size PermGen into native memory, so it grows as needed and the classic PermGen OutOfMemoryError largely disappeared. It can still be capped with MaxMetaspaceSize.',
      difficulty: 'expert',
    },
    {
      id: 'jvm-generational',
      question: 'What assumption underpins generational garbage collection?',
      options: [
        'Most objects die young, so collecting a small young generation frequently reclaims most garbage cheaply',
        'Objects are collected in the order they were allocated',
        'Large objects are collected before small ones',
        'Every object survives at least one collection cycle',
      ],
      correctAnswer: 0,
      explanation:
        'The weak generational hypothesis says the vast majority of allocations become unreachable almost immediately. Collecting Eden often, and promoting only the survivors, keeps the common case fast and leaves the expensive old-generation work rare.',
      difficulty: 'intermediate',
    },
    {
      id: 'jvm-memory-leak',
      question: 'Java has a garbage collector, so how can an application still leak memory?',
      options: [
        'Objects stay reachable from a long-lived structure such as a static collection or cache, so the collector may not reclaim them',
        'The collector only runs when the heap is completely full',
        'Leaks are impossible in Java by design',
        'Only native code called through JNI can leak',
      ],
      correctAnswer: 0,
      explanation:
        'The collector reclaims unreachable objects, not unused ones. A static map that is only ever added to, an unremoved listener, or a ThreadLocal never cleared, all keep objects reachable forever. That is a leak in every practical sense.',
      difficulty: 'expert',
    },
    {
      id: 'jvm-oome-vs-soe',
      question: 'What distinguishes OutOfMemoryError from StackOverflowError?',
      options: [
        'OutOfMemoryError means the heap or metaspace is exhausted; StackOverflowError means one thread exceeded its stack depth, usually via unbounded recursion',
        'They are two names for the same condition',
        'StackOverflowError comes from the heap and OutOfMemoryError from the stack',
        'OutOfMemoryError is a checked exception while StackOverflowError is not',
      ],
      correctAnswer: 0,
      explanation:
        'They exhaust different regions. A deep or infinite recursion blows the per-thread stack; retaining too many live objects, or leaking them, exhausts the heap. Both extend Error, so neither is checked.',
      difficulty: 'intermediate',
    },
    {
      id: 'jvm-jit',
      question: 'What does the JIT compiler do that the interpreter does not?',
      options: [
        'It compiles frequently executed bytecode into native machine code at runtime, using observed profile data to optimise',
        'It compiles source files into bytecode before execution',
        'It removes unused classes from the heap',
        'It verifies bytecode for security violations',
      ],
      correctAnswer: 0,
      explanation:
        'The JVM starts interpreting, watches which methods and loops run hot, then compiles those to native code. Because it optimises against real runtime behaviour it can inline and speculate in ways an ahead-of-time compiler cannot, which is why long-running Java gets faster over time.',
      difficulty: 'expert',
    },
    {
      id: 'jvm-thread-dump',
      question: 'Your application hangs with low CPU usage. Which diagnostic is most useful first?',
      options: [
        'A thread dump, to see what every thread is blocked on and detect a deadlock',
        'A heap dump, to list the largest objects',
        'A GC log, to measure pause times',
        'A JIT compilation log',
      ],
      correctAnswer: 0,
      explanation:
        'Low CPU with no progress points at blocking, not allocation. A thread dump shows each thread state and the monitors it holds or waits for, and the JVM will explicitly report a detected deadlock. Heap dumps are the tool for memory growth instead.',
      difficulty: 'expert',
    },
  ],
};
