import type { QuizBank } from '../types';

// Module: java > exception-handling (Exception Handling in Java, 5 topics)
export const javaExceptions: QuizBank = {
  key: 'java/exception-handling',
  label: 'Exception Handling in Java',
  questions: [
    {
      id: 'ex-checked-vs-unchecked',
      question: 'What distinguishes a checked exception from an unchecked one?',
      options: [
        'A checked exception must be caught or declared with throws; unchecked ones extend RuntimeException and need neither',
        'A checked exception is detected by the JVM, an unchecked one by the compiler',
        'Checked exceptions can be recovered from, unchecked ones always terminate the program',
        'Unchecked exceptions cannot be caught at all',
      ],
      correctAnswer: 0,
      explanation:
        'The split is purely a compile-time contract. Anything extending Exception but not RuntimeException is checked, so the compiler forces you to handle or declare it. RuntimeException and Error sit outside that rule.',
      difficulty: 'beginner',
    },
    {
      id: 'ex-finally-always',
      question: 'Which situation stops a finally block from running?',
      options: [
        'A call to System.exit() inside the try block',
        'An exception thrown inside the try block',
        'A return statement inside the try block',
        'A break statement that leaves the try block',
      ],
      correctAnswer: 0,
      explanation:
        'return, break and thrown exceptions all still run finally on the way out. System.exit() halts the JVM immediately, so finally never executes. A JVM crash or a killed thread has the same effect.',
      difficulty: 'intermediate',
    },
    {
      id: 'ex-finally-return',
      question: 'A method returns a value from its try block, and the finally block also returns a different value. What does the caller receive?',
      options: [
        'The value returned by finally, because it overwrites the pending return',
        'The value returned by try, because it was evaluated first',
        'A compile error, since two returns conflict',
        'Both values, wrapped in an array',
      ],
      correctAnswer: 0,
      explanation:
        'A return inside finally discards the pending return value, and it will also swallow an in-flight exception. That silent loss is why most style guides ban returning from finally outright.',
      difficulty: 'expert',
    },
    {
      id: 'ex-catch-order',
      question: 'You write catch(Exception e) before catch(IOException e) in the same try. What happens?',
      options: [
        'A compile error, because IOException is already covered by the earlier, broader catch',
        'It compiles, and IOException is routed to the second block',
        'It compiles, but the second block is silently dead code',
        'It compiles and both blocks run for an IOException',
      ],
      correctAnswer: 0,
      explanation:
        'Catch clauses are tested top to bottom, so a broader type first makes any narrower type below it unreachable. The compiler rejects this outright. Always order catch blocks from most specific to most general.',
      difficulty: 'intermediate',
    },
    {
      id: 'ex-try-with-resources-order',
      question: 'Two resources are opened in a single try-with-resources statement. In what order are they closed?',
      options: [
        'Reverse of declaration order, so the last opened closes first',
        'Declaration order, so the first opened closes first',
        'Unspecified, the JVM may choose either',
        'Only the first resource is closed automatically',
      ],
      correctAnswer: 0,
      explanation:
        'Resources close in reverse order, mirroring how nested try-finally blocks would unwind. This matters when a later resource wraps an earlier one, such as a BufferedReader over a FileReader.',
      difficulty: 'expert',
    },
    {
      id: 'ex-error-vs-exception',
      question: 'Why should application code normally avoid catching Error?',
      options: [
        'Error signals a serious JVM-level failure such as OutOfMemoryError that the application usually cannot recover from',
        'Error cannot be caught, so the catch block never compiles',
        'Catching Error is a compile error unless the method declares it',
        'Error and Exception are interchangeable, so catching either is equivalent',
      ],
      correctAnswer: 0,
      explanation:
        'Throwable splits into Exception, which your code is expected to handle, and Error, which reports conditions like a stack overflow or exhausted heap. Catching Error usually just hides a fatal problem and leaves the JVM in an unreliable state.',
      difficulty: 'intermediate',
    },
  ],
};
