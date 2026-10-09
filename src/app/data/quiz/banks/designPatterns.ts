import type { QuizBank } from '../types';

// Course-wide bank: design-patterns (Design Patterns in Java) — creational, structural, behavioral.
export const designPatterns: QuizBank = {
  key: 'design-patterns',
  label: 'Design Patterns in Java',
  questions: [
    {
      id: 'dp-singleton-threadsafe',
      question: 'Which is the most robust way to implement a Singleton in Java?',
      options: [
        'A single-element enum, which the JVM guarantees against reflection and serialization attacks',
        'A static field initialised lazily with a plain null check',
        'A synchronized getInstance() that allocates on first call',
        'A public static final field of an ordinary class',
      ],
      correctAnswer: 0,
      explanation:
        'The enum form is initialised once by the class loader, and the language forbids reflective instantiation and handles serialization correctly. A plain lazy null check is not thread safe, and even double-checked locking needs volatile to be correct.',
      difficulty: 'expert',
    },
    {
      id: 'dp-factory-vs-abstract-factory',
      question: 'What separates the Factory Method pattern from Abstract Factory?',
      options: [
        'Factory Method defers creation of one product to a subclass; Abstract Factory creates whole families of related products',
        'Abstract Factory is simply the interface version of Factory Method',
        'Factory Method can only create immutable objects',
        'Abstract Factory is limited to a single product type',
      ],
      correctAnswer: 0,
      explanation:
        'Factory Method is one overridable creation hook. Abstract Factory groups several such hooks behind one interface so an entire family stays consistent, which is how UI toolkits keep every widget on the same theme.',
      difficulty: 'intermediate',
    },
    {
      id: 'dp-builder-purpose',
      question: 'Which problem does the Builder pattern primarily solve?',
      options: [
        'Constructing an object with many optional parameters without a combinatorial explosion of constructors',
        'Guaranteeing only one instance of a class exists',
        'Letting incompatible interfaces work together',
        'Adding behaviour to an object at runtime',
      ],
      correctAnswer: 0,
      explanation:
        'Builder replaces the telescoping-constructor anti-pattern with readable, named steps and can validate the whole object in build(). It also makes immutable objects with many fields practical to construct.',
      difficulty: 'beginner',
    },
    {
      id: 'dp-adapter-vs-decorator',
      question: 'Both Adapter and Decorator wrap another object. What is the difference in intent?',
      options: [
        'Adapter changes an interface to one the client expects; Decorator keeps the interface and adds behaviour',
        'Adapter adds behaviour while Decorator changes the interface',
        'Adapter works on classes and Decorator only on interfaces',
        'They are the same pattern under two names',
      ],
      correctAnswer: 0,
      explanation:
        'Structure alone does not identify a pattern, intent does. Adapter exists to translate a mismatched interface. Decorator deliberately preserves the interface so wrappers can stack, which is how the java.io streams compose.',
      difficulty: 'expert',
    },
    {
      id: 'dp-strategy-purpose',
      question: 'When is Strategy the right pattern?',
      options: [
        'When several interchangeable algorithms exist and the choice should be made at runtime without conditionals scattered through the code',
        'When an object must notify many dependants of state changes',
        'When object creation must be centralised',
        'When you need to add responsibilities to an object dynamically',
      ],
      correctAnswer: 0,
      explanation:
        'Strategy turns a growing if-else or switch over behaviour into a set of small classes behind one interface, chosen by injection. In modern Java a strategy is often just a lambda, since the interface is usually functional.',
      difficulty: 'beginner',
    },
    {
      id: 'dp-observer-jdk',
      question: 'Which JDK feature is the clearest real-world example of the Observer pattern?',
      options: [
        'Listener registration in Swing and JavaFX, where components notify registered handlers of events',
        'The java.io decorator stream hierarchy',
        'The Collections.unmodifiableList wrapper',
        'The Runtime.getRuntime() accessor',
      ],
      correctAnswer: 0,
      explanation:
        'Event listeners are Observer in its canonical form: a subject keeps a list of registered observers and pushes updates to all of them. The original java.util.Observer was deprecated in Java 9 for being too limited.',
      difficulty: 'intermediate',
    },
    {
      id: 'dp-proxy-purpose',
      question: 'What does a Proxy add that a plain reference does not?',
      options: [
        'A stand-in that controls access, enabling lazy loading, security checks, caching or remote invocation',
        'A guarantee that only one instance exists',
        'The ability to convert between incompatible interfaces',
        'A snapshot of the object state for undo support',
      ],
      correctAnswer: 0,
      explanation:
        'Proxy shares the subject interface but interposes logic around the real object. Hibernate lazy loading and Spring AOP both work this way, which is why a lazily loaded entity can throw once its session is closed.',
      difficulty: 'intermediate',
    },
    {
      id: 'dp-template-method',
      question: 'How does Template Method structure an algorithm?',
      options: [
        'A base class fixes the overall sequence in a final method and leaves specific steps for subclasses to override',
        'Each step is a separate object chosen at runtime',
        'The algorithm is chosen by a factory at construction time',
        'Steps are chained so each decides whether to pass the request on',
      ],
      correctAnswer: 0,
      explanation:
        'The skeleton lives in one place and is usually final so subclasses cannot reorder it; only the designated hook methods vary. Strategy solves a similar problem with composition instead of inheritance, which is generally more flexible.',
      difficulty: 'intermediate',
    },
  ],
};
