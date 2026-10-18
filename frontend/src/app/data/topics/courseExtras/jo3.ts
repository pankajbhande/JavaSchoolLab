// Core Java overviews, part 3: advanced language features (keyed by topic id).
import { o, type Overview } from './javaLayout';

export const jo3: Record<string, Overview> = {
    'enums-in-java': o(
        'An enum is a special class with a fixed set of named constants, which can also have fields, constructors and methods.',
        'Values like days, status codes and roles are limited sets. Enums make them type-safe instead of using loose ints or strings.',
        ['Type safety for fixed values.', 'Can carry data and behavior.', 'Work with switch, EnumMap and EnumSet.'],
        ['Cannot be extended or created at runtime.', 'Adding constants later may affect stored data.', 'Overuse for dynamic data is a mistake.'],
        ['Used for states and configuration everywhere.', 'Best singleton implementation.', 'Interview topic.'],
        ['Constants are singletons.', 'values(), valueOf(), ordinal(), name().', 'Compare with ==.', 'Do not store ordinal.', 'EnumMap and EnumSet are fast.']),

    'generics': o(
        'Generics let classes and methods work with types supplied by the caller, such as List&lt;String&gt;, with compile-time type checking.',
        'Without generics, collections held Objects and needed casts that could fail at run time.',
        ['Compile-time type safety.', 'No casting.', 'Reusable algorithms and classes.'],
        ['Type erasure removes type information at run time.', 'No primitives as type arguments.', 'Wildcards are hard to learn.'],
        ['All collections use generics.', 'Needed to read library signatures.', 'Frequent interview topic (erasure, PECS).'],
        ['&lt;T&gt; declares a type parameter.', 'extends bounds the type.', 'Wildcards: ? extends (read), ? super (write).', 'Erasure: no new T().', 'Generics are invariant.']),

    'annotations': o(
        'Annotations attach metadata to code, such as @Override, @Deprecated and custom ones read by tools and frameworks.',
        'Frameworks need configuration without code changes: dependency injection, mapping and testing are driven by annotations.',
        ['Less boilerplate.', 'Compiler checks (@Override).', 'Enable frameworks like Spring and JPA.'],
        ['Hidden behavior is hard to debug.', 'Reflection-based processing costs startup time.', 'Overuse reduces clarity.'],
        ['Spring, Hibernate and JUnit rely on them.', 'Needed to write custom annotations.', 'Interview topic.'],
        ['@Retention decides visibility.', '@Target limits where used.', 'Read with reflection.', 'Processors generate code at compile time.', 'Built-ins: Override, Deprecated, FunctionalInterface.']),

    'reflection-api': o(
        'Reflection inspects and uses classes, methods and fields at run time, for example Class.forName, getDeclaredMethods and invoke.',
        'Frameworks cannot know your classes at compile time. Reflection lets them create objects and call methods by name.',
        ['Dynamic behavior.', 'Powers frameworks (DI, ORM, JSON).', 'Inspect metadata and annotations.'],
        ['Slower than direct calls.', 'Breaks encapsulation and type safety.', 'Needs configuration in native images.'],
        ['Explains how Spring and Hibernate work.', 'Useful for writing tools and tests.', 'Interview topic.'],
        ['Class objects describe types.', 'getDeclaredX includes private members.', 'setAccessible bypasses access.', 'InvocationTargetException wraps causes.', 'Cache Method objects.']),

    'nested-inner-classes': o(
        'Nested classes are defined inside other classes: static nested, inner, local and anonymous classes.',
        'Some classes only make sense in the context of another (builders, iterators, callbacks). Nesting keeps them close and private.',
        ['Better encapsulation.', 'Inner classes access outer members.', 'Anonymous classes give inline implementations.'],
        ['Inner classes hold a hidden outer reference (leaks).', 'More complex syntax.', 'Lambdas replace many anonymous classes.'],
        ['Used in builders, iterators and listeners.', 'Interview topic.', 'Needed to read library code.'],
        ['Static nested: no outer instance.', 'Inner: outer.new Inner().', 'Local and anonymous capture effectively final variables.', 'Prefer static nested classes.', 'this vs Outer.this.']),

    'interfaces-in-java': o(
        'An interface defines a contract of methods that classes implement, with default, static and private methods in modern Java.',
        'Different classes need a common set of capabilities without sharing implementation. Interfaces provide that and support multiple inheritance of type.',
        ['Loose coupling.', 'Multiple implementation.', 'Enable lambdas through functional interfaces.'],
        ['Changing a published interface breaks implementers.', 'Too many tiny interfaces add noise.', 'Default method conflicts need resolution.'],
        ['Foundation of Spring and the Collections API.', 'Interview topic: interface vs abstract class.', 'Needed for testing with mocks.'],
        ['Methods are public abstract by default.', 'Fields are public static final.', 'default and static methods since Java 8.', 'A class can implement many interfaces.', 'Functional interface: one abstract method.']),

    'equals-hashcode': o(
        'equals defines logical equality and hashCode returns an int used by hash collections. They must be consistent: equal objects have equal hash codes.',
        'HashMap and HashSet find objects by hashCode and equals. Without correct overrides, lookups fail and duplicates appear.',
        ['Correct behavior of HashMap and HashSet.', 'Value-based equality.', 'Records generate both automatically.'],
        ['Easy to implement wrongly.', 'Mutable fields break hash-based collections.', 'Inheritance complicates symmetry.'],
        ['Very common interview topic.', 'Needed for map keys and set elements.', 'Prevents subtle bugs.'],
        ['Override both together.', 'Use Objects.equals and Objects.hash.', 'Do not use mutable fields in hashCode.', 'Equal objects must have equal hashCodes.', 'Records give both for free.']),

    'comparable-comparator': o(
        'Comparable gives a class its natural order with compareTo, while Comparator defines other orders externally with compare.',
        'Sorting and sorted collections need a way to order objects, by one field or several.',
        ['Flexible sorting.', 'Composable comparators (thenComparing).', 'Works with TreeSet, TreeMap, PriorityQueue.'],
        ['Inconsistent compare logic causes errors.', 'Subtraction can overflow.', 'Comparable allows only one natural order.'],
        ['Sorting is everywhere.', 'Interview topic.', 'Needed for sorted collections.'],
        ['compareTo: negative, zero, positive.', 'Comparator.comparing().thenComparing().', 'Use Integer.compare, not a - b.', 'Sorting is stable.', 'Keep consistent with equals.']),

    'object-cloning': o(
        'Cloning creates a copy of an object using Cloneable and clone(), producing a shallow copy by default.',
        'Sometimes you need an independent copy of an object, for example to keep a snapshot.',
        ['Quick copy of flat objects.', 'Arrays have a working clone().', 'Can be customized for deep copies.'],
        ['Shallow by default: nested objects are shared.', 'clone is fragile and bypasses constructors.', 'Discouraged in modern Java.'],
        ['Interview topic: shallow vs deep copy.', 'Teaches reference semantics.', 'Leads to copy constructors and immutability.'],
        ['Implement Cloneable and override clone().', 'Shallow vs deep copy.', 'Prefer copy constructors or factories.', 'CloneNotSupportedException without Cloneable.', 'Immutable objects need no cloning.']),

    'try-with-resources': o(
        'try-with-resources automatically closes resources that implement AutoCloseable at the end of the try block.',
        'Manually closing streams and connections in finally is verbose and easy to get wrong, leaking resources.',
        ['No resource leaks.', 'Less code than try-finally.', 'Keeps the original exception and adds suppressed ones.'],
        ['Resources must implement AutoCloseable.', 'Using the resource after the block fails.', 'close() exceptions can be surprising.'],
        ['Used with files, JDBC and HTTP.', 'Interview topic.', 'Best practice for cleanup.'],
        ['Declare resources in the try header.', 'Closed in reverse order.', 'close exceptions become suppressed.', 'Java 9 accepts existing variables.', 'Make close() idempotent.']),

    'varargs': o(
        'Varargs let a method accept zero or more arguments of one type, written as Type... name and seen as an array inside the method.',
        'Some methods naturally take a variable number of values, such as sum or format, without writing many overloads.',
        ['Flexible calls.', 'Cleaner APIs (printf, Arrays.asList).', 'Fewer overloads.'],
        ['Allocates an array on each call.', 'Ambiguity with overloads.', 'Generic varargs cause heap pollution warnings.'],
        ['Used throughout the JDK.', 'Interview topic on overload rules.', 'Helps write friendly APIs.'],
        ['Must be the last parameter; only one per method.', 'Inside it is an array.', 'Varargs is the last overload considered.', 'Beware of null arguments.', '@SafeVarargs for generic varargs.']),

    'initializer-blocks': o(
        'Initializer blocks run code during initialization: instance blocks per object before the constructor body, and static blocks once at class loading.',
        'Some setup does not fit a field initializer, such as filling a lookup table or shared constructor code.',
        ['Run complex initialization.', 'Static block runs once.', 'Shared code across constructors.'],
        ['Hidden execution order.', 'Exceptions in static blocks make the class unusable.', 'Rarely the clearest option.'],
        ['Appears in output-prediction questions.', 'Explains class loading and initialization.', 'Helps understand singletons.'],
        ['Static block: once at class init.', 'Instance block: each new object.', 'Order: parent static, child static, parent instance + constructor, child instance + constructor.', 'Static init errors become ExceptionInInitializerError.', 'Prefer constructors.']),

    'custom-exceptions': o(
        'A custom exception is your own exception class extending Exception or RuntimeException to represent a domain-specific error.',
        'Generic exceptions say little. Domain exceptions such as InsufficientFundsException describe what went wrong and let callers react precisely.',
        ['Clear, meaningful errors.', 'Carry extra data.', 'Easy mapping to HTTP responses.'],
        ['Too many exception classes add noise.', 'Checked custom exceptions clutter code.', 'Must keep messages free of secrets.'],
        ['Common in business code.', 'Interview topic.', 'Basis of API error handling.'],
        ['Extend RuntimeException for unchecked.', 'Provide message and cause constructors.', 'Name ends with Exception.', 'Add context fields.', 'Map centrally to responses.']),

    'marker-interfaces': o(
        'A marker interface has no methods and only tags a class with a capability, such as Serializable or Cloneable.',
        'The JVM or libraries need to know whether a class supports a feature, without requiring methods.',
        ['Simple tagging mechanism.', 'Usable as a type at compile time.', 'Checked with instanceof.'],
        ['No data or behavior.', 'Annotations are more flexible.', 'Inherited markers can tag subclasses unintentionally.'],
        ['Interview topic.', 'Explains Serializable and Cloneable.', 'Compares with annotations.'],
        ['No methods.', 'Examples: Serializable, Cloneable, RandomAccess.', 'Check with instanceof.', 'Annotations are the modern alternative.', 'Use a marker when you need a compile-time type.']),

    'object-class': o(
        'The Object class is the root of all Java classes and provides toString, equals, hashCode, getClass, clone, wait and notify.',
        'Every object needs basic behavior such as printing, comparing and locking. Object supplies defaults for all.',
        ['Common behavior for all classes.', 'Enables generic code.', 'Monitor support for synchronization.'],
        ['Default equals and toString are rarely useful.', 'finalize is deprecated.', 'Easy to misuse equals and hashCode.'],
        ['Always asked in interviews.', 'Basis of collections and threading.', 'Helps write correct classes.'],
        ['Every class extends Object.', 'Override toString, equals, hashCode.', 'getClass returns the runtime class.', 'wait/notify need the monitor.', 'Avoid finalize.']),

    'string-formatting': o(
        'String formatting builds text from templates with String.format, printf and formatted using specifiers like %s, %d and %.2f.',
        'Reports, logs and user messages need aligned, localized and readable output.',
        ['Readable templates.', 'Control width, precision, padding.', 'Locale-aware numbers and dates.'],
        ['Specifier mismatches fail at run time.', 'Slower than simple concatenation.', 'Injection risk if user text is used as the format.'],
        ['Used for logs and reports.', 'Interview topic.', 'Needed for money and date output.'],
        ['%s string, %d int, %f float, %n newline.', '%.2f for two decimals.', 'Pass a Locale for consistency.', 'formatted() since Java 15.', 'Never use it to build SQL.']),

    'immutable-classes': o(
        'An immutable class creates objects whose state never changes after construction, such as String, Integer and records.',
        'Shared mutable state causes bugs, especially with threads. Immutable objects are always safe to share.',
        ['Thread-safe without locks.', 'Safe as map keys and cache values.', 'Simple to reason about.'],
        ['Changes need new objects.', 'More allocations for frequent updates.', 'Requires defensive copies.'],
        ['Core of safe concurrent design.', 'Interview topic.', 'Records make it easy.'],
        ['final class, private final fields, no setters.', 'Copy mutable inputs and outputs.', 'List.copyOf makes immutable copies.', 'unmodifiableList is only a view.', 'Records are shallowly immutable.']),

    'multicatch-finally-trap': o(
        'Multi-catch handles several exception types in one block, and the try-finally return trap shows how return and exceptions in finally override earlier results.',
        'These details decide program output and are common sources of subtle bugs and interview traps.',
        ['Multi-catch removes duplicate handlers.', 'finally guarantees cleanup.', 'Precise rethrow keeps type information.'],
        ['return or throw in finally hides exceptions.', 'Multi-catch types cannot be related.', 'Easy to misjudge the final value.'],
        ['Frequent output-prediction questions.', 'Prevents hidden bugs.', 'Reinforces exception flow.'],
        ['catch (A | B e): unrelated types, e is final.', 'finally runs after try or catch.', 'return in finally overrides.', 'The returned primitive is evaluated before finally.', 'Never throw from finally.'])
};
