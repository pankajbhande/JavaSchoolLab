// Core Java overviews, part 4: Java 8, 11, 17 and 21 features (keyed by topic id).
import { o, type Overview } from './javaLayout';

export const jo4: Record<string, Overview> = {
    'java8-functional-interface': o(
        'A functional interface has exactly one abstract method and can be implemented with a lambda or method reference, for example Function, Predicate, Consumer and Supplier.',
        'Passing behavior as a value needs a type for it. Functional interfaces provide that type.',
        ['Enable lambdas and streams.', 'Rich built-ins in java.util.function.', 'Composable behavior.'],
        ['Checked exceptions do not fit.', 'Many similar interfaces to learn.', 'Boxing in generic versions.'],
        ['Base of Java 8 style programming.', 'Interview topic.', 'Needed for streams and CompletableFuture.'],
        ['One abstract method.', '@FunctionalInterface checks it.', 'Function, Predicate, Consumer, Supplier.', 'andThen, compose, and, negate.', 'Primitive versions avoid boxing.']),

    'java8-lambda-expression': o(
        'A lambda is an anonymous function written as (parameters) -> expression that implements a functional interface.',
        'Anonymous classes were verbose for simple behavior. Lambdas make callbacks, sorting and stream operations concise.',
        ['Short, readable code.', 'Enable functional style.', 'Method references shorten further.'],
        ['Hard to debug when long.', 'Captured variables must be effectively final.', 'Overuse reduces clarity.'],
        ['Used with streams and collections daily.', 'Interview topic.', 'Basis for reactive and async code.'],
        ['Syntax: (a, b) -> a + b.', 'Target type is a functional interface.', 'Captures effectively final variables.', 'this means the enclosing object.', 'Four kinds of method references.']),

    'java8-default-method': o(
        'A default method is an interface method with a body, introduced in Java 8 so interfaces can evolve without breaking implementers.',
        'Adding a method to a widely used interface used to break every implementation. Defaults solve that.',
        ['Backward-compatible evolution.', 'Shared behavior in interfaces.', 'Enabled <code>stream()</code> and <code>forEach</code> on old types.'],
        ['Diamond conflicts need manual resolution.', 'No instance state.', 'Can blur interface and class roles.'],
        ['Interview topic.', 'Explains how the JDK evolved.', 'Useful for API design.'],
        ['<code>default</code> keyword with a body.', 'Class method wins over interface default.', 'Resolve conflicts with <code>X.super.m()</code>.', 'No fields in interfaces.', 'Use for convenience methods.']),

    'java8-static-method': o(
        'Interfaces can contain static methods with a body, called with the interface name, such as List.of and Comparator.naturalOrder.',
        'Helper and factory methods related to an interface used to need a separate utility class.',
        ['Keeps helpers with the interface.', 'Readable factory methods.', 'Not inherited, so no conflicts.'],
        ['Cannot be overridden.', 'Not callable through instances.', 'Can turn interfaces into dumping grounds.'],
        ['Used throughout modern JDK APIs.', 'Interview topic.', 'Good for clean API design.'],
        ['Call as Interface.method().', 'Not inherited by implementers.', 'Used for factories and combinators.', 'Java 9 adds private methods.', 'Keep them related to the interface.']),

    'java8-foreach-method': o(
        'forEach performs an action on every element of an Iterable, Map or Stream using a Consumer.',
        'Looping with a lambda is shorter than a for loop for simple actions and fits stream pipelines.',
        ['Concise.', 'Works with lambdas and method references.', 'forEachOrdered for ordered parallel streams.'],
        ['No break or continue.', 'Cannot modify the source during iteration.', 'Shared state is risky in parallel streams.'],
        ['Common in Java 8 code.', 'Interview topic on forEach vs loop.', 'Leads to stream thinking.'],
        ['Takes a Consumer.', 'No break or continue.', 'Do not modify the collection inside.', 'Prefer collect for building results.', 'forEachOrdered keeps order.']),

    'java8-optional-class': o(
        'Optional is a container that may or may not hold a non-null value, making absence explicit.',
        'Null returns cause NullPointerException. Optional forces callers to handle the missing-value case.',
        ['Explicit absence.', 'Functional chaining (map, flatMap, filter).', 'Fewer null checks.'],
        ['Extra object allocation.', 'Not for fields or parameters.', 'get() misuse throws exceptions.'],
        ['Used in Spring Data repositories.', 'Interview topic.', 'Teaches null-safe design.'],
        ['of, ofNullable, empty.', 'orElse vs orElseGet.', 'map and flatMap chain.', 'Use as return type only.', 'Prefer orElseThrow to get().']),

    'java8-string-joiner': o(
        'StringJoiner joins strings with a delimiter, optional prefix and suffix; String.join and Collectors.joining do the same in other contexts.',
        'Building comma-separated text with loops needs special handling for the last separator. Joiners remove that.',
        ['No trailing separator bugs.', 'Prefix and suffix support.', 'Works well with streams.'],
        ['Not thread-safe.', 'No escaping of delimiters.', 'StringBuilder may be faster for general appends.'],
        ['Used for CSV-like text and logs.', 'Interview topic.', 'Teaches clean string building.'],
        ['new StringJoiner(delimiter, prefix, suffix).', 'setEmptyValue for no elements.', 'String.join for collections.', 'Collectors.joining in streams.', 'Escape values yourself.']),

    'java8-stream-api': o(
        'The Stream API processes sequences of elements with pipelines of operations: source, intermediate operations like filter and map, and a terminal operation like collect.',
        'Data processing with loops is verbose and error prone. Streams express what to compute declaratively and can run in parallel.',
        ['Readable pipelines.', 'Lazy evaluation.', 'Easy parallelism.'],
        ['Hard to debug long chains.', 'Streams are single use.', 'Parallel streams can hurt performance.'],
        ['Used everywhere in modern Java.', 'Top interview topic.', 'Basis for reactive thinking.'],
        ['Source, intermediate, terminal.', 'Lazy until terminal operation.', 'map, filter, flatMap, sorted, distinct.', 'collect with groupingBy and joining.', 'parallel only for large CPU work.']),

    'java8-platform-enhancements': o(
        'Besides lambdas and streams, Java 8 added the java.time API, Base64, CompletableFuture, parallel array operations and Metaspace.',
        'The old Date and Calendar classes were mutable and confusing, and other gaps needed modern replacements.',
        ['Immutable, thread-safe date and time.', 'Built-in Base64.', 'Better concurrency utilities.'],
        ['New APIs to learn.', 'Mixing old Date with new time types needs conversion.', 'Some features were later removed (Nashorn).'],
        ['java.time is used in every project.', 'Interview topic.', 'Helps modernize legacy code.'],
        ['LocalDate, LocalDateTime, ZonedDateTime, Instant.', 'Duration vs Period.', 'DateTimeFormatter is thread-safe.', 'Base64 encoder and decoder.', 'Metaspace replaced PermGen.']),

    'var-keyword': o(
        'var lets the compiler infer the type of a local variable from its initializer, for example <code>var list = new ArrayList&lt;String&gt;()</code>.',
        'Long generic type names repeated on both sides add noise. var removes duplication while keeping static typing.',
        ['Less boilerplate.', 'Still statically typed.', 'Helps with long generic types.'],
        ['Can hide the type and reduce readability.', 'Not allowed for fields or parameters.', 'Infers the exact type, not the interface.'],
        ['Seen in modern code and interviews.', 'Teaches type inference.', 'Part of Java style guidelines.'],
        ['Local variables only.', 'Needs an initializer.', 'Not dynamic typing.', 'Use when the type is obvious.', 'Allowed in lambda parameters (Java 11).']),

    'string-methods-11': o(
        'Java 11 added String methods isBlank, strip, stripLeading, stripTrailing, repeat and lines.',
        'Input cleaning and text generation needed Unicode-aware whitespace handling and simple repetition.',
        ['Unicode-aware whitespace handling.', 'repeat and lines make common tasks simple.', 'Streams of lines are lazy.'],
        ['Only available from Java 11.', 'Small utilities, not a new capability.', 'Easy to mix up with trim.'],
        ['Used in validation and parsing.', 'Interview topic.', 'Shows how the String API evolved.'],
        ['isBlank checks whitespace-only strings.', 'strip handles Unicode spaces; trim does not.', 'repeat(n) repeats text.', 'lines() gives a Stream.', 'Negative repeat throws.']),

    'http-client': o(
        'The Java 11 HTTP Client (java.net.http) is a modern API for HTTP/1.1 and HTTP/2 with synchronous and asynchronous requests.',
        'Applications call REST APIs. The old HttpURLConnection was clumsy and lacked HTTP/2 and async support.',
        ['Built into the JDK.', 'HTTP/2 and async with CompletableFuture.', 'Clean builder API.'],
        ['Fewer features than libraries like OkHttp or Apache HttpClient.', 'You must check status codes yourself.', 'Retries and circuit breakers are manual.'],
        ['Needed to call web services.', 'Interview topic.', 'Prepares for REST client work.'],
        ['HttpClient is reusable and thread-safe.', 'Build HttpRequest, call send or sendAsync.', 'Set timeouts.', 'Check statusCode().', 'BodyHandlers choose the response type.']),

    'optional-11': o(
        'Java 11 adds Optional.isEmpty, and Java 9 and 10 added orElseThrow(), or, ifPresentOrElse and stream.',
        'Everyday Optional use needed clearer methods than negating isPresent or calling get.',
        ['More readable code.', 'Fallback chains with or.', 'Easy conversion to streams.'],
        ['Still not for fields and parameters.', 'Allocation overhead.', 'Versions differ in available methods.'],
        ['Used in modern service code.', 'Interview topic.', 'Improves null-safe style.'],
        ['isEmpty is the opposite of isPresent.', 'orElseThrow() replaces get().', 'or supplies a fallback Optional.', 'ifPresentOrElse handles both cases.', 'stream() turns it into 0 or 1 items.']),

    'files-11': o(
        'Java 11 added Files.readString and Files.writeString for simple text files, and Path.of to create paths.',
        'Reading or writing small text files used to need several lines of stream code.',
        ['Short, readable code.', 'UTF-8 by default.', 'Works with NIO.2 Path.'],
        ['readString loads the whole file in memory.', 'Throws IOException.', 'No atomic write: a crash can leave a partial file.'],
        ['Used for configs and small files.', 'Interview topic.', 'Shows modern file I/O style.'],
        ['readString and writeString.', 'APPEND option for appending.', 'Use Files.lines for big files.', 'Atomic write: temp file + move.', 'Path.of replaces Paths.get.']),

    'sealed-classes': o(
        'A sealed class or interface restricts which classes may extend or implement it using permits, with permitted subclasses being final, sealed or non-sealed.',
        'Some domains have a fixed set of variants, such as payment types. Sealing lets the compiler know all of them.',
        ['Closed hierarchies.', 'Exhaustive switches without default.', 'Clear domain models.'],
        ['Less open for extension.', 'Library evolution needs care.', 'Permitted classes must be in the same module or package.'],
        ['Modern Java modelling tool.', 'Interview topic for Java 17.', 'Works with records and pattern matching.'],
        ['sealed ... permits A, B.', 'Subclasses: final, sealed or non-sealed.', 'Enables exhaustive switch.', 'Use for states and results.', 'Adding a variant breaks incomplete switches.']),

    'pattern-matching': o(
        'Pattern matching for <code>instanceof</code> tests a type and binds a typed variable in one step: <code>if (o instanceof String s)</code>.',
        'The old <code>instanceof</code> check followed by a cast was repetitive and error prone.',
        ['No explicit casts.', 'Shorter equals and visitors.', 'Basis for switch patterns.'],
        ['Binding scope rules need care.', 'Overuse can take the place of cleaner polymorphism.', 'Generic types have restrictions.'],
        ['Used in modern code.', 'Interview topic.', 'Leads to switch and record patterns.'],
        ['<code>x instanceof T t</code> binds <code>t</code>.', 'Combine with <code>&amp;&amp;</code>.', 'Flow scoping after negated checks.', 'Great for equals.', 'Prefer polymorphism when you own the types.']),

    'records': o(
        'A record is a concise immutable data class whose constructor, accessors, equals, hashCode and toString are generated from its components.',
        'Data carrier classes needed lots of boilerplate. Records remove it.',
        ['Very short code.', 'Immutable value semantics.', 'Work with pattern matching.'],
        ['Cannot extend classes or add instance fields.', 'Shallow immutability only.', 'Not suitable as JPA entities.'],
        ['Used for DTOs and keys.', 'Interview topic.', 'Core Java 17 feature.'],
        ['record Point(int x, int y) {}.', 'Compact constructor for validation.', 'Copy mutable components.', 'Implements interfaces.', 'equals and hashCode use all components.']),

    'switch-expressions': o(
        'A switch expression returns a value, using arrows (->) with no fall-through and yield for blocks.',
        'The old switch statement needed breaks and temporary variables, causing bugs.',
        ['Concise and safe.', 'Must be exhaustive.', 'Multiple labels per case.'],
        ['Needs default for non-enum types.', 'Mixing old and new styles is not allowed.', 'Requires Java 14 or later.'],
        ['Everyday modern Java.', 'Interview topic.', 'Basis for pattern switches.'],
        ['case A, B -> value.', 'No break, no fall-through.', 'yield returns from blocks.', 'Exhaustive: all cases covered.', 'Throw in impossible branches.']),

    'text-blocks': o(
        'A text block is a multi-line string literal delimited by triple double quotes, with automatic indentation handling.',
        'JSON, SQL and HTML written with escapes and concatenation are hard to read.',
        ['Readable multi-line text.', 'No escaping of quotes.', 'Works with formatted().'],
        ['Indentation rules need learning.', 'SQL injection risk if values are formatted in.', 'Trailing spaces are removed.'],
        ['Used for SQL, JSON and HTML.', 'Interview topic.', 'Improves test readability.'],
        ['Opening delimiter then newline.', 'Common indentation is removed.', '\\s keeps a space; trailing backslash joins lines.', 'Use formatted() for values.', 'Use PreparedStatement for SQL values.']),

    'virtual-threads': o(
        'Virtual threads (Java 21) are lightweight threads managed by the JVM, so millions can run while blocking code stays simple.',
        'Thread-per-request code scales poorly with platform threads. Virtual threads keep the simple model and scale like async code.',
        ['Massive concurrency.', 'Simple blocking code.', 'Easy migration (Spring Boot 3.2 property).'],
        ['No benefit for CPU-bound work.', 'Pinning with long synchronized blocks.', 'ThreadLocal usage can grow memory.'],
        ['Major Java 21 feature.', 'Interview topic.', 'Changes how servers are designed.'],
        ['One virtual thread per task, no pools.', 'They unmount while blocked.', 'Limit resources with Semaphore.', 'Avoid pinning: prefer ReentrantLock.', 'Great for I/O-bound services.']),

    'record-patterns': o(
        'Record patterns deconstruct a record in instanceof and switch, binding its components to variables, and can be nested.',
        'Extracting fields from nested data with accessor calls is verbose. Patterns do it declaratively.',
        ['Concise data extraction.', 'Nested patterns.', 'Works with sealed types.'],
        ['Only for records.', 'Deep nesting can hurt readability.', 'Needs Java 21 or later.'],
        ['Modern data-oriented Java.', 'Common interview topic.', 'Replaces many visitor classes.'],
        ['if (o instanceof Point(int x, int y)).', 'Nested record patterns.', 'var infers component types.', 'null never matches.', 'Combine with sealed interfaces.']),

    'switch-pattern': o(
        'Pattern matching for switch (Java 21) allows type patterns, guards with when, case null and exhaustive checking over sealed types.',
        'Long instanceof chains are verbose. A pattern switch handles several types in one readable construct.',
        ['Readable multi-type handling.', 'Compiler checks exhaustiveness.', 'Guards add conditions.'],
        ['Case order matters (dominance).', 'Null needs explicit handling.', 'Requires Java 21.'],
        ['Core Java 21 feature.', 'Interview topic.', 'Pairs with sealed and records.'],
        ['case Type t when condition.', 'case null handles null.', 'Specific cases first.', 'Sealed types need no default.', 'Compiles to an efficient type switch.']),

    'sequenced-collections': o(
        'Sequenced collections (Java 21) add a common API to collections with a defined order: getFirst, getLast, addFirst, addLast, removeFirst, removeLast and reversed.',
        'Accessing the first or last element and reversing differed for List, Deque, LinkedHashSet and others.',
        ['Uniform API.', 'reversed() is a cheap view.', 'Less boilerplate.'],
        ['getFirst on empty throws.', 'HashSet and HashMap are not sequenced.', 'Custom collections may clash with new methods.'],
        ['Java 21 interview topic.', 'Simplifies common code.', 'Helps LRU cache and history code.'],
        ['SequencedCollection, SequencedSet, SequencedMap.', 'reversed() returns a view.', 'List, Deque, LinkedHashSet, TreeSet qualify.', 'HashSet does not.', 'Empty collections throw on getFirst.']),

    'string-templates': o(
        'String templates (preview in Java 21 and 22) embed expressions in strings, such as STR."Hello \\{name}", with processors that can validate or transform the result.',
        'String concatenation and format strings are error prone and can allow injection. Templates aimed to make interpolation safer.',
        ['Readable interpolation.', 'Processors can escape or bind values.', 'Works with text blocks.'],
        ['Preview feature; withdrawn for redesign.', 'Needs --enable-preview.', 'Not for production code.'],
        ['Shows the direction of the language.', 'Interview awareness.', 'Reinforces safe string building.'],
        ['Preview only: STR."...\\{expr}".', 'Stable alternatives: formatted, String.format.', 'Never build SQL by interpolation.', 'Use PreparedStatement for queries.', 'Requires --enable-preview.'])
};
