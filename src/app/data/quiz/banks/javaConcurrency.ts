import type { QuizBank } from '../types';

// Module: java > multithreading (Multithreading & Multitasking, 5 topics)
export const javaConcurrency: QuizBank = {
  key: 'java/multithreading',
  label: 'Multithreading & Multitasking',
  questions: [
    {
      id: 'th-start-vs-run',
      question: 'What is the difference between calling start() and calling run() on a Thread?',
      options: [
        'start() asks the JVM for a new thread of execution; run() is an ordinary method call on the current thread',
        'They are equivalent, start() is just the conventional name',
        'run() creates the thread and start() begins it, so both are required',
        'start() is asynchronous and run() blocks until the thread finishes',
      ],
      correctAnswer: 0,
      explanation:
        'Calling run() directly executes the body on whichever thread called it, so nothing runs concurrently. Only start() registers a new thread with the scheduler, which then invokes run() for you.',
      difficulty: 'beginner',
    },
    {
      id: 'th-start-twice',
      question: 'What happens if start() is called twice on the same Thread object?',
      options: [
        'The second call throws IllegalThreadStateException',
        'The thread restarts from the beginning of run()',
        'A second thread is created that shares the same run() body',
        'The second call is silently ignored',
      ],
      correctAnswer: 0,
      explanation:
        'A Thread object is single use. Once it has been started it can never return to the NEW state, so a second start() is rejected. To run the same task again, submit it to an executor or build a fresh Thread.',
      difficulty: 'intermediate',
    },
    {
      id: 'th-volatile',
      question: 'What does declaring a field volatile guarantee?',
      options: [
        'Visibility, so a write is seen by other threads, but not atomicity of compound operations',
        'Both visibility and atomicity, making increments thread safe',
        'That only one thread may access the field at a time',
        'That the field is stored in CPU registers for speed',
      ],
      correctAnswer: 0,
      explanation:
        'volatile stops the value being cached per thread and forbids certain reorderings, so a write becomes visible. It does nothing for read-modify-write sequences: count++ is still three operations and can still lose updates. Use AtomicInteger or a lock for that.',
      difficulty: 'expert',
    },
    {
      id: 'th-static-sync-lock',
      question: 'A class has one synchronized instance method and one synchronized static method. Can two threads run them at the same time?',
      options: [
        'Yes, because they lock different monitors: the instance versus the class object',
        'No, synchronized always serialises every method on the class',
        'No, because static methods implicitly lock the instance too',
        'Only if the object is declared volatile',
      ],
      correctAnswer: 0,
      explanation:
        'A synchronized instance method locks this, while a synchronized static method locks the Class object. They are independent monitors, so the two calls do not exclude each other. Mixing the two is a common source of races.',
      difficulty: 'expert',
    },
    {
      id: 'th-wait-monitor',
      question: 'Calling wait() on an object outside a synchronized block produces what?',
      options: [
        'IllegalMonitorStateException at runtime',
        'A compile error',
        'It works, but the thread never wakes up',
        'A deadlock',
      ],
      correctAnswer: 0,
      explanation:
        'wait(), notify() and notifyAll() require the calling thread to already own the monitor, since wait() has to release it atomically. The compiler cannot verify that, so the check happens at runtime.',
      difficulty: 'expert',
    },
    {
      id: 'th-sleep-vs-wait',
      question: 'How do Thread.sleep() and Object.wait() differ with respect to locks?',
      options: [
        'sleep() keeps every lock the thread holds; wait() releases the monitor it was called on',
        'Both release all held locks',
        'Both keep all held locks',
        'wait() keeps its lock while sleep() releases them',
      ],
      correctAnswer: 0,
      explanation:
        'sleep() is a timing operation and knows nothing about monitors, so sleeping inside a synchronized block blocks everyone else for the whole duration. wait() exists precisely to release the monitor so another thread can make progress and notify.',
      difficulty: 'expert',
    },
    {
      id: 'th-deadlock-condition',
      question: 'Two threads each hold one lock and wait for the other. Which change reliably prevents this deadlock?',
      options: [
        'Make every thread acquire the locks in the same global order',
        'Make both locks volatile',
        'Increase the thread pool size so more threads are available',
        'Replace synchronized with synchronized static methods',
      ],
      correctAnswer: 0,
      explanation:
        'Deadlock needs a circular wait, and a consistent global lock ordering makes a cycle impossible. Timeouts via tryLock() are the other common defence. Adding threads or changing lock visibility does nothing to break the cycle.',
      difficulty: 'expert',
    },
  ],
};
