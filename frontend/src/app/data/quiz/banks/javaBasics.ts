import type { QuizBank } from '../types';

// Module: java > basics (Java Basics, 27 topics)
export const javaBasics: QuizBank = {
  key: 'java/basics',
  label: 'Java Basics',
  questions: [
    {
      id: 'jb-local-default',
      question: 'What happens when you read a local variable that was declared but never assigned?',
      options: [
        'The code fails to compile',
        'It reads as 0 for numeric types and null for references',
        'It compiles but throws NullPointerException at runtime',
        'It reads whatever value was left in that stack slot',
      ],
      correctAnswer: 0,
      explanation:
        'Unlike fields, local variables get no default value. The compiler performs definite-assignment analysis and rejects the program with a variable-might-not-have-been-initialized error. Fields DO default to 0, false or null, which is why the two are often confused.',
      difficulty: 'beginner',
    },
    {
      id: 'jb-post-increment-self',
      question: 'After running int x = 10; x = x++; what is the value of x?',
      options: ['10', '11', '12', 'It does not compile'],
      correctAnswer: 0,
      explanation:
        'The post-increment evaluates to the OLD value 10 and then bumps x to 11 as a side effect. The assignment immediately writes the saved 10 back over it, so the increment is discarded. This is why x = x++ is a classic bug.',
      difficulty: 'intermediate',
    },
    {
      id: 'jb-string-identity',
      question: 'One String is assigned from a literal and another is built with new String() from the same literal. What does comparing them with == give?',
      options: [
        'false, because new String() forces a separate object outside the pool',
        'true, because both hold the same characters',
        'true, because the compiler interns every String',
        'It does not compile, because Strings cannot be compared with ==',
      ],
      correctAnswer: 0,
      explanation:
        'The == operator compares references, not contents. A literal comes from the string pool, while new String() always allocates a fresh object on the heap. Calling equals() would give true; == gives false.',
      difficulty: 'intermediate',
    },
    {
      id: 'jb-integer-cache',
      question: 'Two Integer variables are boxed from 127 and two more from 128. Comparing each pair with ==, what do you get?',
      options: [
        'true for the 127 pair and false for the 128 pair',
        'true for both pairs',
        'false for both pairs',
        'false for the 127 pair and true for the 128 pair',
      ],
      correctAnswer: 0,
      explanation:
        'Autoboxing routes through Integer.valueOf(), which caches instances from -128 to 127. Both 127 boxes are therefore the same object, while each 128 allocates a new object. Always use equals() to compare boxed values.',
      difficulty: 'expert',
    },
    {
      id: 'jb-primitive-set',
      question: 'Which of these is NOT one of the eight Java primitive types?',
      options: ['String', 'char', 'boolean', 'byte'],
      correctAnswer: 0,
      explanation:
        'The eight primitives are byte, short, int, long, float, double, char and boolean. String is a class in java.lang; it just gets special treatment from the compiler that makes it feel built in.',
      difficulty: 'beginner',
    },
    {
      id: 'jb-integer-division',
      question: 'What does printing the expression 7 / 2 display in Java?',
      options: ['3', '3.5', '4', '3.0'],
      correctAnswer: 0,
      explanation:
        'Both operands are int, so Java performs integer division and truncates toward zero. The fractional part is discarded, not rounded. Making one operand a double gives 3.5.',
      difficulty: 'beginner',
    },
    {
      id: 'jb-final-reference',
      question: 'A List field is declared final and initialised with a new ArrayList. Which statement is true?',
      options: [
        'You can add and remove elements, but cannot reassign the variable to another list',
        'The list becomes immutable, so add() throws UnsupportedOperationException',
        'Both reassignment and mutation are blocked by the compiler',
        'final has no effect on reference variables, only on primitives',
      ],
      correctAnswer: 0,
      explanation:
        'final freezes the reference, not the object it points at. Reassigning the variable is a compile error, but adding to the list works fine. For genuine immutability you need List.copyOf() or Collections.unmodifiableList().',
      difficulty: 'intermediate',
    },
    {
      id: 'jb-static-block-order',
      question: 'When does a static initializer block run?',
      options: [
        'Once, when the class is first loaded and initialized, before main() or any instance exists',
        'Every time an object of the class is constructed, just before the constructor body',
        'Only when a static method on the class is explicitly called',
        'After main() finishes, as part of class unloading',
      ],
      correctAnswer: 0,
      explanation:
        'Static blocks belong to the class, not to instances. The JVM runs them exactly once during class initialization, in source order. Instance initializer blocks, written without the static keyword, are the ones that run per construction.',
      difficulty: 'intermediate',
    },
    {
      id: 'jb-array-defaults',
      question: 'A new int array and a new String array are both allocated with length 3. What do their first elements hold?',
      options: [
        '0 and null',
        'null and null',
        '0 and an empty string',
        'Nothing, both throw until you assign elements',
      ],
      correctAnswer: 0,
      explanation:
        'Array elements are fields of the array object, so they take type defaults: 0 for int and null for any reference type. Calling a method on the String element would throw NullPointerException, because allocating the array does not allocate the Strings inside it.',
      difficulty: 'beginner',
    },
    {
      id: 'jb-string-immutable',
      question: 'Why is concatenating Strings with the + operator inside a long loop discouraged?',
      options: [
        'String is immutable, so each concatenation allocates a new object and copies every existing character',
        'The string pool overflows and throws OutOfMemoryError after about 1000 iterations',
        'String concatenation is not thread safe inside loops',
        'The compiler rejects the + operator on String inside a for loop',
      ],
      correctAnswer: 0,
      explanation:
        'Every concatenation produces a brand new object and copies all existing characters, making the loop quadratic in the total length. StringBuilder mutates one internal buffer instead, which is why it is the right tool for loop accumulation.',
      difficulty: 'intermediate',
    },
    {
      id: 'jb-char-promotion',
      question: 'A char literal holding the letter a is added to the int 1. What is the type and value of that expression?',
      options: [
        'int, with the value 98',
        'char, with the value b',
        'String, with the value a1',
        'It does not compile, because char and int cannot be added',
      ],
      correctAnswer: 0,
      explanation:
        'char is a 16-bit integral type, so binary numeric promotion widens it to int: the letter a is 97, giving 98. Printing the expression shows 98, not b. An explicit char cast is needed to get the letter back.',
      difficulty: 'expert',
    },
    {
      id: 'jb-main-signature',
      question: 'Which signature will the JVM accept as an application entry point?',
      options: [
        'public static void main(String... args)',
        'public void main(String[] args)',
        'static void main(String[] args)',
        'public static int main(String[] args)',
      ],
      correctAnswer: 0,
      explanation:
        'The entry point must be public, static, return void and take a single String array. Varargs compiles down to String[], so it qualifies. Dropping public, dropping static or returning int all make the JVM fail to find main.',
      difficulty: 'intermediate',
    },
    {
      id: 'jb-switch-string',
      question: 'From which Java version can a switch statement operate on a String?',
      options: ['Java 7', 'Java 5', 'Java 8', 'Strings are still not permitted in switch'],
      correctAnswer: 0,
      explanation:
        'Java 7 added String in switch, compiled as a hashCode() lookup followed by equals() checks. Java 5 had earlier added enums in switch, and Java 14 added switch expressions with the arrow form.',
      difficulty: 'beginner',
    },
    {
      id: 'jb-pass-semantics',
      question: 'A method reassigns its object parameter to a brand new object. What does the caller observe afterwards?',
      options: [
        'Nothing changes for the caller, because Java passes the reference by value',
        'The caller variable now points at the new object',
        'A compile error, because parameters are implicitly final',
        'The original object is garbage collected immediately',
      ],
      correctAnswer: 0,
      explanation:
        'Java is strictly pass-by-value; for objects the value copied is the reference itself. Mutating the object through the parameter IS visible to the caller, but reassigning the parameter only repoints the local copy.',
      difficulty: 'expert',
    },
  ],
};
