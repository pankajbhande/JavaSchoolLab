import type { QuizBank } from '../types';

// Module: java > oop (OOPS Concept, 6 topics)
export const javaOop: QuizBank = {
  key: 'java/oop',
  label: 'OOPS Concept',
  questions: [
    {
      id: 'oop-multiple-inheritance',
      question: 'Why does Java forbid a class from extending more than one class?',
      options: [
        'To avoid the diamond problem, where two parents supply conflicting implementations of the same method',
        'Because the JVM can only store one superclass pointer per object header',
        'Because it would make every method call slower at runtime',
        'It is an arbitrary restriction that interfaces later removed entirely',
      ],
      correctAnswer: 0,
      explanation:
        'With two superclasses defining the same method, the compiler cannot tell which implementation to inherit. Interfaces sidestep this because, before default methods, they carried no implementation at all, and Java 8 requires you to resolve any default-method clash explicitly.',
      difficulty: 'intermediate',
    },
    {
      id: 'oop-overload-vs-override',
      question: 'When is an overloaded method resolved, compared with an overridden one?',
      options: [
        'Overloading is resolved at compile time from the declared types; overriding is dispatched at runtime from the actual object',
        'Both are resolved at compile time from the declared types',
        'Both are dispatched at runtime from the actual object',
        'Overloading is resolved at runtime; overriding is resolved at compile time',
      ],
      correctAnswer: 0,
      explanation:
        'Overload selection is static: the compiler picks a signature using the reference types it can see. Overriding is dynamic dispatch: the JVM looks at the object actually on the heap. This is why passing null to overloaded methods can be ambiguous at compile time.',
      difficulty: 'expert',
    },
    {
      id: 'oop-static-override',
      question: 'What happens when a subclass declares a static method with the same signature as a static method in its parent?',
      options: [
        'The parent method is hidden, not overridden, and which one runs depends on the reference type',
        'It is a normal override and dynamic dispatch applies',
        'The code fails to compile, because static methods cannot be redeclared',
        'The parent method is removed from the subclass entirely',
      ],
      correctAnswer: 0,
      explanation:
        'Static methods belong to the class, so there is no dynamic dispatch. This is method hiding: a Parent-typed reference calls the parent version even when it points at a Child instance. Marking such a method with the override annotation is a compile error.',
      difficulty: 'expert',
    },
    {
      id: 'oop-abstract-constructor',
      question: 'Can an abstract class declare a constructor?',
      options: [
        'Yes, and it runs via super() when a concrete subclass is instantiated',
        'No, because an abstract class can never be instantiated',
        'Yes, but it is silently ignored at runtime',
        'Only if the class also declares at least one abstract method',
      ],
      correctAnswer: 0,
      explanation:
        'Abstract classes hold state, and that state needs initialising. You cannot call new on the abstract type directly, but the constructor still runs as part of building a concrete subclass instance, which is exactly why it is allowed.',
      difficulty: 'intermediate',
    },
    {
      id: 'oop-interface-vs-abstract',
      question: 'Since Java 8 interfaces can carry default methods. What still separates an abstract class from an interface?',
      options: [
        'An abstract class can hold mutable instance state and constructors; an interface cannot',
        'Nothing, they became functionally identical in Java 8',
        'Only an abstract class may declare concrete methods',
        'A class can implement only one interface but extend many abstract classes',
      ],
      correctAnswer: 0,
      explanation:
        'Interface fields are implicitly public, static and final, so an interface cannot carry per-instance state, and it has no constructor. An abstract class can do both, which is why it stays the right choice when subclasses share data rather than just behaviour.',
      difficulty: 'intermediate',
    },
    {
      id: 'oop-private-override',
      question: 'A parent declares a private method. The child declares a method with the identical name and signature. What is the relationship?',
      options: [
        'None, they are unrelated methods, because a private method is not visible to subclasses',
        'The child overrides the parent method as usual',
        'The code fails to compile because of the name clash',
        'The child method is implicitly made private too',
      ],
      correctAnswer: 0,
      explanation:
        'Overriding requires the parent method to be visible to the subclass. A private method is not inherited at all, so the child simply declares a brand new method that happens to share a name.',
      difficulty: 'expert',
    },
    {
      id: 'oop-covariant-return',
      question: 'An overriding method returns a subtype of the type the parent method returned. Is that legal?',
      options: [
        'Yes, this is a covariant return type and has been allowed since Java 5',
        'No, an override must match the parent return type exactly',
        'Only if the parent method is abstract',
        'Only for primitive return types',
      ],
      correctAnswer: 0,
      explanation:
        'Java 5 relaxed the rule so an override may narrow the return type. Any caller holding the parent type still gets something assignable to what it expected, so type safety is preserved. Parameter types, by contrast, must still match exactly.',
      difficulty: 'expert',
    },
    {
      id: 'oop-encapsulation',
      question: 'What does encapsulation actually buy you beyond making fields private?',
      options: [
        'The class can change its internal representation without breaking callers, and can enforce invariants on every change',
        'It makes the object immutable',
        'It makes field access faster because the JVM can inline private fields',
        'It is required for a class to be serializable',
      ],
      correctAnswer: 0,
      explanation:
        'Private fields plus accessors give you a seam. You can swap the internal data structure, add validation, or start logging, all without touching a single caller. Getters and setters that blindly expose every field give up most of that benefit.',
      difficulty: 'intermediate',
    },
    {
      id: 'oop-super-implicit',
      question: 'A constructor body does not begin with this() or super(). What does the compiler do?',
      options: [
        'It inserts a call to the no-argument super() constructor as the first statement',
        'It skips the parent constructor entirely',
        'It reports an error demanding an explicit call',
        'It calls every parent constructor in declaration order',
      ],
      correctAnswer: 0,
      explanation:
        'Java guarantees the parent is initialised before the child body runs, so it inserts super() for you. If the parent has no accessible no-argument constructor, that inserted call fails to compile, which is the usual cause of the confusing error about a missing super constructor.',
      difficulty: 'intermediate',
    },
  ],
};
