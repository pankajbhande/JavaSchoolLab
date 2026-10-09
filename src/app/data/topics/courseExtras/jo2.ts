// Core Java overviews, part 2: OOP, multithreading, concurrency utilities, exceptions (keyed by topic id).
import { o, type Overview } from './javaLayout';

export const jo2: Record<string, Overview> = {
    'classes-objects': o(
        'A class is a blueprint that defines fields and methods; an object is an instance of a class created with new.',
        'Real-world problems are modelled as things with data and behavior. Classes and objects are the building blocks of object-oriented programs.',
        ['Models real-world entities naturally.', 'Reusable and organized code.', 'Each object keeps its own state.'],
        ['Poor design leads to god classes.', 'Objects use more memory than plain data.', 'Shared references can cause unexpected changes.'],
        ['Everything in Java is built from classes.', 'Needed for inheritance, polymorphism and frameworks.', 'Interviews start with class and object basics.'],
        ['Class = blueprint, object = instance.', 'Objects live on the heap; references point to them.', 'b = a copies the reference, not the object.', 'Unreferenced objects are garbage collected.', 'Override toString, equals and hashCode when needed.']),

    'Encapsulation in Java': o(
        'Encapsulation bundles data and methods in a class and hides the data with private fields, exposing it through controlled public methods.',
        'It protects objects from invalid changes and lets the internal design change without breaking users.',
        ['Data protection and validation.', 'Flexibility to change internals.', 'Loose coupling between classes.'],
        ['More code (getters and setters) if done mechanically.', 'Slight overhead of method calls.', 'Can be bypassed by reflection.'],
        ['One of the four OOP pillars.', 'Basis of maintainable code.', 'Interview favorite.'],
        ['Private fields, public methods.', 'Validate in setters or constructors.', 'Return copies of mutable fields.', 'Immutability is the strongest form.', 'Expose behavior, not raw state.']),

    'inheritance in Java': o(
        'Inheritance lets a class (child) reuse and extend another class (parent) using extends, modelling an is-a relationship.',
        'It avoids code duplication and lets related classes share behavior and be treated through a common type.',
        ['Code reuse.', 'Enables polymorphism.', 'Clear is-a hierarchies.'],
        ['Tight coupling between parent and child.', 'Fragile base class problem.', 'Deep hierarchies are hard to maintain.'],
        ['Core OOP pillar.', 'Frameworks rely on extending base classes.', 'Interviews ask inheritance vs composition.'],
        ['extends for classes, single inheritance only.', 'Constructors are not inherited; use super(...).', 'Use @Override.', 'Prefer composition when not truly is-a.', 'Every class extends Object.']),

    'Inheritance Types': o(
        'Types of inheritance are single, multilevel and hierarchical for classes; multiple and hybrid inheritance are achieved through interfaces.',
        'Knowing the types explains how hierarchies are shaped and why Java avoids multiple class inheritance.',
        ['Flexible modelling through interfaces.', 'Avoids the diamond problem for classes.', 'Sealed types limit hierarchies.'],
        ['No multiple class inheritance.', 'Deep multilevel chains are fragile.', 'Default method conflicts need manual resolution.'],
        ['Frequent interview topic.', 'Helps design clean hierarchies.', 'Prepares for interfaces and abstract classes.'],
        ['Single, multilevel, hierarchical via extends.', 'Multiple via implements.', 'Diamond problem avoided for classes.', 'Resolve default conflicts with X.super.m().', 'sealed restricts subclasses.']),

    'Abstraction in Java': o(
        'Abstraction hides implementation details and exposes only essential behavior, using abstract classes and interfaces.',
        'Users of a class should know what it does, not how. Abstraction allows implementations to change and be swapped.',
        ['Reduces complexity.', 'Loose coupling and easy testing.', 'Supports multiple implementations.'],
        ['Too many layers add indirection.', 'Poor abstractions leak details.', 'Interfaces with one implementation can be noise.'],
        ['Core OOP pillar.', 'Basis of Spring dependency injection.', 'Interviews ask abstract class vs interface.'],
        ['Abstract class: partial implementation, state.', 'Interface: contract, multiple implementation.', 'Cannot instantiate abstract classes.', 'Program to interfaces.', 'Template Method uses abstract steps.']),

    'Polymorphism in java': o(
        'Polymorphism means one interface with many forms: compile-time (overloading) and run-time (overriding).',
        'It lets the same code work with different object types, removing if-else chains and making programs extensible.',
        ['Extensible, open-closed design.', 'Cleaner code through common types.', 'Supports frameworks and plug-ins.'],
        ['Run-time dispatch hides which code runs.', 'Fields and static methods are not polymorphic.', 'Overload resolution rules can confuse.'],
        ['Core OOP pillar.', 'Needed to understand interfaces and frameworks.', 'Very common interview topic.'],
        ['Overloading: compile time; overriding: run time.', 'Parent reference can hold child object.', 'Fields are not polymorphic.', 'Use @Override.', 'Covariant return types are allowed.']),

    'Multitasking in Java': o(
        'Multitasking is running several tasks at once: process-based (separate programs) or thread-based (threads inside one program).',
        'Modern programs handle many users and I/O waits. Doing tasks concurrently keeps them responsive and uses all CPU cores.',
        ['Better CPU and I/O utilization.', 'Responsive applications.', 'Threads share memory cheaply.'],
        ['Shared data causes race conditions.', 'Debugging concurrency bugs is hard.', 'Too many threads waste resources.'],
        ['Servers and apps must handle concurrent work.', 'Foundation for threads and executors.', 'Interview staple.'],
        ['Process vs thread.', 'Concurrency vs parallelism.', 'Threads share the heap.', 'Size pools by workload type.', 'Amdahl law limits speedup.']),

    'MultiThreading in Java': o(
        'Multithreading is the ability of a Java program to run more than one thread inside a single process, created with <code>Thread</code>, <code>Runnable</code>, <code>Callable</code> and executors. A thread is the smallest unit of work the CPU can schedule; threads share the heap but each has its own stack and program counter. At production level it also means understanding the Java Memory Model (happens-before rules) and the <code>java.util.concurrent</code> toolkit, with platform threads and, from Java 21, lightweight virtual threads.',
        'It lets one program do several jobs together, so a slow task such as a file read or bank API call does not block everything behind it, and the application stays responsive while using all CPU cores. Real frameworks such as Spring Boot and Tomcat are multithreaded, and high-throughput services need bounded pools, back pressure and safe shutdown instead of a thread per request.',
        ['Faster execution: independent jobs run together and use multi-core CPUs better.', 'Responsive programs: the UI thread stays free during long background work.', 'Threads are cheaper than processes and failures stay isolated to one thread.', 'Tuned pools give high throughput and bounded resource use under traffic spikes.', 'CompletableFuture hides latency; virtual threads scale blocking IO code simply.', 'Built-in tools such as CountDownLatch, Semaphore and ConcurrentHashMap reduce hand-written locks.'],
        ['Race conditions and deadlocks (also livelock).', 'Bugs are non-deterministic and hard to test or debug.', 'Context-switch overhead and extra memory for each thread stack.', 'Thread pool starvation, false sharing and ThreadLocal leaks can hurt production systems.'],
        ['All server applications use threads.', 'Needed for executors, async and virtual threads.', 'Choose the right tool: ExecutorService for CPU work, CompletableFuture for pipelines, virtual threads for blocking IO.', 'Top interview topic (volatile, synchronized, atomics, pool sizing).'],
        ['start() creates a thread, run() does not.', 'Runnable vs Callable.', 'join waits for a thread.', 'Use executors, not raw threads.', 'Handle InterruptedException.']),

    'Life Cycle of Thread': o(
        'The life cycle of a thread is the set of states it passes through from creation until it dies: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING and TERMINATED, defined in <code>Thread.State</code>. You can read the current state with <code>getState()</code>. BLOCKED means waiting for a monitor lock, while WAITING means a call such as <code>wait()</code>, <code>join()</code> or <code>LockSupport.park()</code> without a timeout.',
        'Knowing the states shows what a thread is really doing (ready, sleeping or stuck on a lock) and lets you tell a slow thread from a stuck one. It explains why <code>start()</code> works only once and why calling <code>run()</code> directly is a mistake, and it gives the vocabulary of thread dumps used to diagnose hangs and deadlocks in production.',
        ['Clear model of thread behavior and easy debugging with getState() and jstack.', 'Explains wait, notify, sleep and join, so code ordering becomes predictable.', 'Prevents wrong API use such as IllegalThreadStateException from restarting a thread.', 'Deadlock detection (ThreadMXBean) and graceful shutdown with interrupt() and awaitTermination().', 'Helps size pools: mostly WAITING on IO suggests more threads or virtual threads, RUNNABLE suggests more cores.'],
        ['States are JVM-level and can mislead (RUNNABLE may be blocked in native I/O).', 'getState() is only a snapshot, so never use it for program logic.', 'A terminated thread cannot restart, and suspend() and resume() are deprecated.', 'Thread dumps are point in time, cost a pause and are hard to read with many virtual threads.', 'Interrupt is cooperative: a swallowed InterruptedException keeps a thread waiting.'],
        ['Frequent interview question (BLOCKED vs WAITING vs TIMED_WAITING).', 'Needed to read thread dumps and find contended locks.', 'Basis for synchronization topics and clean shutdown design.'],
        ['NEW to RUNNABLE on start().', 'BLOCKED waits for a monitor lock.', 'WAITING: wait/join; TIMED_WAITING: sleep.', 'sleep keeps locks, wait releases them.', 'Thread cannot be restarted.']),

    'Synchronization in Java ': o(
        'Synchronization controls access to shared data so only one thread at a time runs a critical section. It is written with the <code>synchronized</code> keyword on a method or block, using the hidden monitor lock every object has, and sits on a scale with <code>volatile</code>, atomics, <code>ReentrantLock</code> and <code>StampedLock</code>. The Java Memory Model guarantees that an unlock happens before the next lock of the same monitor, which makes writes visible.',
        'Without it, concurrent updates corrupt data (race conditions) and threads may see stale values. It makes read-modify-write steps atomic and visible, as needed for a shared bank balance, the last train seat or any shared counter, cache or map. Choosing the cheapest correct tool, the right lock granularity and a fixed lock order keeps systems both correct and fast.',
        ['Prevents race conditions and keeps shared data accurate.', 'Gives mutual exclusion and memory visibility with one keyword, built into the language.', 'Lock is released automatically on exceptions and is reentrant.', 'Cheap when uncontended, and supports wait and notify coordination.', 'Rich alternatives: atomics, ReadWriteLock, StampedLock, Semaphore, concurrent collections.'],
        ['Contention reduces parallel work; Amdahl law caps speedup.', 'Deadlock, livelock and lock convoy risk, especially with opposite lock order.', 'No timeout, no tryLock and not interruptible.', 'Easy to lock the wrong or a dangerous object (String literal, boxed Integer, this) or to use too wide a block.', 'In Java 21 blocking inside synchronized pins a virtual thread (fixed in Java 24).', 'Double-checked locking is broken without volatile.'],
        ['Essential for correct multithreaded programs.', 'Most-asked concurrency topic (double-checked locking, volatile).', 'Basis for java.util.concurrent and for avoiding production hangs.'],
        ['synchronized: mutual exclusion + visibility.', 'volatile: visibility only.', 'Atomics use CAS.', 'Lock in a consistent order to avoid deadlock.', 'Prefer immutability and concurrent collections.']),

    'Interview Questions': o(
        'This topic collects the most common multithreading interview questions with clear answers and code.',
        'Multithreading is one of the most tested areas for Java roles. Practising typical questions builds confidence.',
        ['Covers frequent questions in one place.', 'Short answers plus code.', 'Good for last-minute revision.'],
        ['Memorized answers without understanding fail follow-up questions.', 'Cannot cover every scenario.', 'Real systems are more complex.'],
        ['Prepares for interviews.', 'Reveals gaps in understanding.', 'Connects threads, locks and executors.'],
        ['Know thread states and methods.', 'Explain volatile vs synchronized.', 'Describe deadlock and avoidance.', 'Write a producer-consumer.', 'Know thread pools and CompletableFuture.']),

    'executor-framework': o(
        'The Executor framework separates task submission from execution using thread pools: ExecutorService, Executors, Future and ScheduledExecutorService.',
        'Creating a thread per task is expensive and unbounded. Pools reuse threads and manage lifecycle and queues.',
        ['Thread reuse and bounded resources.', 'Futures return results and exceptions.', 'Scheduling and shutdown support.'],
        ['Misconfigured pools cause starvation or memory growth.', 'Futures block on get.', 'Must be shut down.'],
        ['Standard way to run concurrent tasks.', 'Base for Spring async and CompletableFuture.', 'Common interview topic.'],
        ['submit returns Future.', 'Always shutdown.', 'Use bounded queues and named threads.', 'Fixed pool for CPU, tune for I/O.', 'Rejection policies handle overload.']),

    'completable-future': o(
        'CompletableFuture is an asynchronous result you can chain and combine with thenApply, thenCompose, thenCombine, allOf and exception handling.',
        'Calling several slow services one after another wastes time. CompletableFuture runs them in parallel and combines results without blocking threads.',
        ['Non-blocking composition.', 'Built-in error handling and timeouts.', 'Parallel calls with allOf.'],
        ['Callback chains can be hard to read.', 'Easy to block the common pool by mistake.', 'Exceptions are wrapped in CompletionException.'],
        ['Used in microservice calls.', 'Modern alternative to Future.', 'Interview topic for async programming.'],
        ['supplyAsync starts async work.', 'thenApply maps; thenCompose flattens.', 'exceptionally/handle for errors.', 'Use a custom executor for blocking calls.', 'orTimeout adds a deadline.']),

    'concurrent-collections': o(
        'Concurrent collections (ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue and others) are thread-safe collections designed for high concurrency.',
        'Plain collections break under concurrent modification, and synchronized wrappers scale poorly.',
        ['Safe and scalable.', 'Atomic operations like merge and putIfAbsent.', 'No ConcurrentModificationException.'],
        ['Compound operations still need atomic methods.', 'CopyOnWrite is costly for frequent writes.', 'size is only an estimate.'],
        ['Used in caches and queues in production.', 'Interview favorite (ConcurrentHashMap internals).', 'Needed for correct concurrent code.'],
        ['ConcurrentHashMap: no null keys or values.', 'Use merge, compute, putIfAbsent.', 'CopyOnWriteArrayList for read-mostly data.', 'BlockingQueue for producer-consumer.', 'Weakly consistent iterators.']),

    'locks-in-java': o(
        'Locks in java.util.concurrent.locks (ReentrantLock, ReadWriteLock, StampedLock) offer more control than synchronized.',
        'Some problems need timeouts, try-lock, fairness, multiple conditions or many readers with few writers.',
        ['tryLock and timeouts.', 'Read-write separation.', 'Multiple Condition queues.'],
        ['Must unlock in finally.', 'More code than synchronized.', 'Easy to misuse.'],
        ['Needed in advanced concurrency.', 'Interviews compare synchronized and ReentrantLock.', 'Used in many library internals.'],
        ['lock(); try { } finally { unlock(); }', 'tryLock avoids blocking forever.', 'ReadWriteLock for read-heavy data.', 'StampedLock: optimistic reads.', 'Lock in a fixed order.']),

    'exception-handling': o(
        'Exception handling deals with runtime errors using try, catch, finally and throw, so programs can recover or fail cleanly.',
        'Real programs meet missing files, bad input and network failures. Without handling, they crash with unhelpful errors.',
        ['Separates error handling from normal logic.', 'Stack traces help debugging.', 'Resources are cleaned up with finally and try-with-resources.'],
        ['Overuse hides bugs.', 'Exceptions are slow when thrown often.', 'Checked exceptions add boilerplate.'],
        ['Every real application handles errors.', 'Interviews test try-catch-finally rules.', 'Needed for robust APIs.'],
        ['try, catch, finally.', 'Catch specific exceptions first.', 'Never swallow exceptions silently.', 'Wrap with cause when translating.', 'Use try-with-resources.']),

    'exceptions': o(
        'Java exceptions are checked (must be handled or declared), unchecked (RuntimeException) and Errors (serious JVM problems).',
        'Choosing the right kind decides how callers are forced to react and keeps APIs clean.',
        ['Compiler enforces handling of checked exceptions.', 'Unchecked exceptions keep code concise.', 'Clear hierarchy.'],
        ['Checked exceptions clutter signatures and lambdas.', 'Wrong choice confuses callers.', 'Hierarchy knowledge needed.'],
        ['Very common interview question.', 'Guides API design.', 'Helps understand Spring exception translation.'],
        ['Throwable: Error and Exception.', 'RuntimeException is unchecked.', 'IOException is checked.', 'Errors are usually not caught.', 'Wrap checked exceptions in lambdas.']),

    'error': o(
        'An Error signals a serious JVM or system problem such as OutOfMemoryError or StackOverflowError that applications usually cannot recover from.',
        'Knowing common Errors helps you find memory leaks, infinite recursion and class loading problems in production.',
        ['Signals fatal conditions clearly.', 'Tools like heap dumps help diagnosis.', 'Prevents continuing in a broken state.'],
        ['Hard to recover from.', 'Root causes can be subtle (leaks).', 'Catching them may hide the real problem.'],
        ['Production incidents involve Errors.', 'Interview topic: Exception vs Error.', 'Teaches memory and stack concepts.'],
        ['StackOverflowError: deep recursion.', 'OutOfMemoryError: heap, metaspace, threads.', 'Use HeapDumpOnOutOfMemoryError.', 'ExitOnOutOfMemoryError in containers.', 'Do not catch Error to continue.']),

    'error2': o(
        'This topic covers frequently asked exception handling interview questions with answers.',
        'Exception rules (finally, throw vs throws, suppressed exceptions) are popular in interviews and often confuse developers.',
        ['Covers the typical traps.', 'Short answers with code.', 'Good revision material.'],
        ['Memorizing without practice fails follow-ups.', 'Edge cases are many.', 'Real design needs more than rules.'],
        ['Prepares for interviews.', 'Clarifies finally and return behavior.', 'Improves error design skills.'],
        ['finally runs unless the JVM exits.', 'throw raises, throws declares.', 'Suppressed exceptions keep secondary failures.', 'Return in finally overrides.', 'Translate exceptions at layer boundaries.']),

    'exception-handling3': o(
        'throw raises an exception object at a point in code and throws declares which checked exceptions a method may pass to its caller.',
        'Methods must signal failures and tell callers what to expect. throw and throws are the two halves of that contract.',
        ['Explicit failure signals.', 'Compiler checks declared exceptions.', 'Custom exceptions carry context.'],
        ['throws clauses can grow long.', 'Overriding methods cannot broaden them.', 'Unchecked exceptions are not enforced.'],
        ['Needed to write validation and APIs.', 'Frequent interview question.', 'Foundation for custom exceptions.'],
        ['throw new X(message).', 'throws lists checked exceptions.', 'Only Throwable can be thrown.', 'Override cannot throw broader checked exceptions.', 'Fail fast with requireNonNull.'])
};
