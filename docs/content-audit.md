# Content accuracy audit

Ten independent reviewers audited all 474 topics across 28 courses for technical
accuracy. **113 confirmed errors** were found, plus 2 structural issues found separately.
Each reviewer was told that a false accusation is worse than a miss, and several verified
their claims by compiling or running the code; all ten reported HIGH confidence.

**All 113 are now fixed, along with both structural issues.** Entries below keep the
original finding text so every change can be reviewed against what was actually wrong.
The FIXED markers date from the first pass and are no longer meaningful as a filter.

Verified after the final pass: the type checker is clean, the production build exits 0,
a fresh content scan finds zero rogue style/script/html/body tags, and the course tree is
unchanged at 28 courses / 78 modules / 474 topics / 3,430 blocks / 2,173 code examples.

| Area | Topics checked | Errors |
| --- | ---: | ---: |
| Java basics | 25 | 15 |
| Java OOP | 25 | 13 |
| Modern Java (8-21) | 23 | 15 |
| Collections + JVM | 42 | 14 |
| Web frontend | 61 | 12 |
| Design & architecture patterns | 127 | 11 |
| Exceptions, JDBC, MySQL, Hibernate | 38 | 11 |
| JSP & Servlets | 43 | 8 |
| CS fundamentals & data science | 46 | 8 |
| Concurrency | 13 | 6 |

The single most common failure is a **stated output that does not match what the code
actually does** (about 20 of the 113). Students run the example, get something else, and
lose trust in the platform. The second most common is a **version claim** — a feature
attributed to the wrong Java release.

---

## Java basics

1. **FIXED — Access-modifier matrix was inverted.** `AccessSpecifiers.tsx`. The data rows
   were in `private | default | protected | public` order but the header read
   `default | public | private | protected`. As rendered it claimed public is invisible
   outside its package and private is reachable from a different-package subclass. Header
   reordered to match the data; all six rows are now correct.
2. **FIXED — "Everything in Java is treated as an object."** `FeaturesOfJava.tsx`. The
   eight primitives are not objects; the same file's own interview answer said so.
3. **FIXED — "In C, int occupies 2 bytes on 32-bit."** `FeaturesOfJava.tsx`. C's `int` is
   4 bytes on essentially every modern platform; 2 bytes was 16-bit compilers.
4. **FIXED — "default constructor added by JVM at compile time."** `ConstructorInJava.tsx`.
   javac inserts it; the JVM does nothing at compile time.
5. **FIXED — "Primitive types: stored in stack."** `DataTypesAndVariables.tsx`. Only
   primitive *locals* are on the stack; primitive *fields* live in the object on the heap.
6. **Static block "runs the moment the class is loaded, even before main()."**
   `StaticKeyword.tsx` (lines 81-101, 201-232). Class initialization is lazy (JLS 12.4.1) —
   it runs immediately before first active use. In both listings `main() started` actually
   prints FIRST, so both claimed outputs are wrong.
7. **`ForEachRemoveBug` claims ConcurrentModificationException.** `LoopingStatements.tsx`
   (375-393). Removing the *second-to-last* element leaves `cursor == size`, so `hasNext()`
   is false and the loop exits silently — no exception. Remove a non-penultimate element.
8. **Ternary NPE claim.** `WrapperClass.tsx` (239-259). The conditional operator evaluates
   only the selected branch (JLS 15.25), so the null branch is never unboxed when not taken
   — which is why the example's own output is `1` with no exception.
9. **`a instanceof String` presented as runnable.** `OperatorsInJava.tsx` (243-258). With
   `a` declared `Animal`, this is a compile error, so the whole class fails to compile.
10. **"Proof" that default access fails across packages.** `AccessSpecifiers.tsx` (129-145).
    Both classes are declared `package com.p1;` — same package — so it compiles fine and
    demonstrates the opposite of its heading.
11. **Constructor assigns parameters to themselves.** `ConstructorInJava.tsx` (137-164).
    `id = id;` leaves the fields at `0`/`null` forever; needs `this.id = id;`.
12. **`LongestSubarrayWithSumLE` output.** `ArrayProgram.tsx` (1130-1148). Prints **4**, not 3.
13. **`MaxSumSubarrayAtLeastK` output.** `ArrayProgram.tsx` (751-776). Prints **6**, not 5.
14. **`LongestSubarrayAlternatingEvenOdd` output.** `ArrayProgram.tsx` (1108-1128). Prints **3**, not 2.
15. **"Vowels: 3".** `StringInJava.tsx` (408-450). `"Hello Java"` has 4 vowels (e, o, a, a).

## Java OOP

1. **FIXED — "For every object unique number is generated ... called as hashcode."**
   `ClassesAndObjects.tsx`. Hash codes are not unique; collisions are expected and are
   exactly why buckets fall back to `equals()`.
2. **FIXED — "Before JDK 1.7, interface does not have any method body."**
   `AbstractionInJava.tsx`. The boundary is Java 8 (`default`/`static`).
3. **FIXED — "The compiler auto-generates serialVersionUID."** `SerializationInJava.tsx`.
   The serialization runtime derives it at (de)serialization time; javac never emits one.
4. **Private field read across top-level classes.** `SerializationInJava.tsx`. Verified
   compile error: `balance has private access in Account`. Needs a getter.
5. **Interface impl declared package-private.** `AbstractionInJava.tsx`. Verified error:
   `attempting to assign weaker access privileges; was public`.
6. **Abstract method in a non-abstract class.** `AbstractionInJava.tsx` (intermediate,
   Example 1). Verified error: `Test is not abstract and does not override x1()`.
7. **"JVM adds `abstract` during compilation."** `AbstractionInJava.tsx`. Implicit
   `public abstract` applies only to *interface* methods, and it is javac, not the JVM.
8. **"Dynamic dispatch" defined as upcasting.** `InheritanceInJava.tsx`. Dynamic dispatch
   is the runtime selection of the overriding implementation, not the assignment.
9. **Planet gravity output.** `EnumsInJava.tsx`. With the constants given the result is
   **9.61**, not 9.80.
10. **"If the abstract class doesn't have constructor, a subclass will not compile."**
    `AbstractionInJava.tsx` Q11. Every class gets an implicit no-arg constructor.
11. **`setAccessible` demo.** `ReflectionApiInJava.tsx`. `Account` is a nested class, so on
    Java 11+ they are nestmates and the reflective read succeeds without it.
12. **Deprecation-warning demo.** `AnnotationsInJava.tsx`. Warnings are suppressed within
    the same outermost class; the call must come from a different class.
13. **"Abstract method can only be used in an abstract class."** `AbstractionInJava.tsx`.
    They also appear in interfaces, as the same page says two paragraphs later.

## Modern Java (8 - 21)

1. **FIXED — Pattern dominance rule stated backwards.** `PatternMatchingForSwitch.tsx`.
   Said dominated patterns must come AFTER dominating ones; the compiler requires the
   opposite, and the page contradicted itself two sections later.
2. **FIXED — instanceof pattern matching "finalized in Java 17."**
   `PatternMatchingForInstanceof.tsx`. Final in Java 16 (JEP 394).
3. **FIXED — "Java 11 added ifPresentOrElse / or / stream."** `OptionalEnhancements.tsx`.
   Those are Java 9; Java 10 added no-arg `orElseThrow()`; Java 11 added only `isEmpty()`.
4. **FIXED — "static methods can't be called via an instance reference."**
   `StaticMethodJava8.tsx`. A *class's* static method can be (JLS 15.12); only an
   *interface's* static method cannot.
5. **FIXED — `sealed class Shape` with an abstract method.** `SealedClasses.tsx`. Did not
   compile; now `abstract sealed`.
6. **String Templates taught as a current preview feature.** `StringTemplates.tsx`.
   JEP 430/459 was re-previewed in Java 22 and then **withdrawn and removed** — none of the
   `STR."..."` code on this page compiles on any current JDK, even with `--enable-preview`.
   This page needs a prominent withdrawal notice or removal.
7. **"Pattern variable is final-by-default."** `PatternMatchingForInstanceof.tsx`. JEP 394
   dropped the implicit finality; the same page's interview table says so correctly.
8. **"Record patterns (Java 21 preview)."** `Records.tsx`. Final in Java 21 (JEP 440).
9. **"switch + sealed types (Java 17+)."** `SwitchExpressions.tsx`. Type patterns in `case`
   were preview in 17-20 and standard only in Java 21 (JEP 441).
10. **`forEach` Set example shows the Map example's output.** `ForEachMethodJava8.tsx`.
    Should print `Element1 Element2 Element3` twice.
11. **`generateClass()` throws at runtime.** `TextBlocks.tsx`. Six `%s` conversions, four
    arguments — `MissingFormatArgumentException`. Needs explicit `%1$s` indices throughout.
12. **"`var` uses the Poly Expression inference algorithm."** `LocalVariableTypeInference.tsx`.
    `var` requires a *standalone* initializer, which is why `var f = () -> {}` is an error.
13. **Method-reference output 23.** `LambdaExpressionJava8.tsx`. `"Hello Method Reference"`
    has length **22**.
14. **Explanation names the wrong argument.** `FunctionalInterfaceJava8.tsx`. Prose says
    `"ashok"`; the code passes `"Pankaj"`.
15. **StringJoiner output shows brackets.** `StringJoinerJava8.tsx`. `new StringJoiner(",")`
    prints `Sheru,Dheeraj,Pankaj` — brackets need the 3-arg constructor.

## Collections & JVM

1. **FIXED — Vector's Iterator listed as "fail-safe."** `CollectionFramework.ts:3866`.
   Vector's `Iterator` is fail-fast exactly like ArrayList's; only its legacy `Enumeration`
   is not.
2. **FIXED — ArrayList growth `(cap * 3/2) + 1`.** `CollectionFramework.ts:1259,1325`. The
   `+1` is the Java 6 formula; modern is `oldCapacity + (oldCapacity >> 1)`, so 10 → 15.
3. **"Fail-safe iterators work on a clone ... ConcurrentHashMap."**
   `CollectionFramework.ts:274`. CHM iterators are *weakly consistent* over the live table;
   only `CopyOnWriteArrayList` iterates a frozen snapshot.
4. **ArrayList traversal output shown sorted.** `CollectionFramework.ts:1369-1373`. Built as
   10, 40, 30, 20 — printing `10, 20, 30, 40` implies ArrayList sorts, contradicting the
   topic's own insertion-order rule.
5. **"LinkedList: O(1) insert/delete in the middle."** `CollectionFramework.ts:394`. Relink
   is O(1) only once you hold the node; `add(int, E)` must traverse first, so it is O(n).
6. **HashSet bucket "new node becomes the head."** `CollectionFramework.ts:8369,8376`. Head
   insertion is Java 7; since Java 8 a colliding node is appended at the **tail**.
7. **"ConcurrentHashMap uses segment-level locking."** `CollectionFramework.ts:404,6886`.
   Segments were removed in Java 8 — now CAS on empty bins plus `synchronized` on the bin
   head. The same file states this correctly 7 lines away.
8. **Static variables located in the Method Area.** `MethodAreaJvm.tsx:106-107`. Since JDK 7
   static field *values* live in the `java.lang.Class` mirror on the heap; two sibling
   topics say so, so the course contradicts itself.
9. **TimSort contract-violation demo.** `CollectionFramework.ts:7391-7413`. TimSort only
   runs the merge check at ≥ `MIN_MERGE` (32); a 12-element array takes `binarySort` and
   never throws.
10. **Comparator trace shows -6 and 10000.** `CollectionFramework.ts:7998`. `"HR".compareTo("IT")`
    is -1 and `thenComparing` delegates to `Integer.compareTo`, returning 1 — not the raw
    salary difference.
11. **"`Arrays.asList()` (JDK 1.8+)."** `CollectionFramework.ts:2005`. It has existed since
    Java 1.2; only `List.of` is Java 9.
12. **Record examples show `Alice(25)` output.** `CollectionFramework.ts:7686+`. Records
    without a `toString()` override print `Person[name=Alice, age=25]`.
13. **`MaxGCPauseMillis` "G1 / ZGC honor this."** `GcTuning.tsx:85,142`. It is a G1/Parallel
    ergonomic input; ZGC ignores it.
14. **`linkedHashSet.remove(10)` "removes the index 10."** `CollectionFramework.ts:4712`.
    Sets have no positional index; it removes the *element* 10.

## Concurrency

1. **"Unlike Hashtable, it does not allow null keys or values."**
   `ConcurrentCollectionsInJava.tsx`. Hashtable also rejects nulls — the contrast is with
   `HashMap`, as the file's own interview answer says.
2. **FIXED — "At a time one thread is executed only."** `MultithreadingInJava.tsx`. On an
   N-core CPU up to N threads run in true parallel.
3. **FIXED — `public void sleep(long)`.** `MultithreadingInJava.tsx`. It is
   `public static native void sleep(long)`; listing it as an instance method feeds the
   `t.sleep()` misconception.
4. **Synchronized demo output.** `SynchronizationInJava.tsx`. Shows one thread finishing all
   five withdrawals first; `synchronized` serializes each *call*, so names normally interleave.
5. **"ConcurrentHashMap uses lock striping (segments)."**
   `MultithreadingInterviewQuestions.tsx`. Java 7 implementation; removed in Java 8.
6. **`ThreadExample` missing its closing brace.** `MultithreadingInJava.tsx`. Fails to
   compile with "reached end of file while parsing".

## Exceptions, JDBC, MySQL, Hibernate

1. **FIXED — "Classes that directly inherit from Throwable ... are Checked Exceptions."**
   `CheckedAndUncheckedExceptions.tsx`. Nothing checked directly extends `Throwable` —
   `IOException` extends `Exception`, `FileNotFoundException` extends `IOException`.
2. **FIXED — "Unique key allows one NULL."** `MySQLCSS.ts:572,1580`. That is SQL Server.
   MySQL permits **multiple** NULLs in a nullable UNIQUE column.
3. **Oracle content presented as MySQL DML.** `MySQLCSS.ts:715-725`. MySQL has no `MERGE`
   and no `EXPLAIN PLAN`, and PL/SQL is Oracle's language.
4. **Criteria API taught against Hibernate 6.** `Hibernate.ts:480-490,831-855`.
   `session.createCriteria`/`Restrictions` was deprecated in 5.0 and **removed in 6** — it
   will not compile against the `hibernate-core 6.3.0.Final` this same course specifies.
5. **`getCurrentSession()` throughout the CRUD examples.** `Hibernate.ts:280,565,613`.
   The provided `hibernate.cfg.xml` never sets `hibernate.current_session_context_class`,
   so this throws `HibernateException: No CurrentSessionContext configured!`.
6. **LazyInitializationException "FIX 2" runs on a closed session.** `Hibernate.ts:1306-1318`.
7. **`javax.persistence.loadgraph` hint.** `Hibernate.ts:1408,1730`. Code imports
   `jakarta.persistence`; an unknown hint is silently ignored, so N+1 persists.
8. **`session.update()` "throws if already persistent."** `Hibernate.ts:1944`. It throws
   only if a *different* instance with the same id is attached.
9. **SQL-injection demo conclusion.** `IntroductionToJdbc.tsx:148`. `AND` binds tighter than
   `OR`, so the payload returns the admin row, not every row.
10. **`SQLRecoverableException` described as transient-retry.** `JdbcExceptionHandling.tsx:118`.
    That is `SQLTransientException`; recoverable requires a new connection first.
11. **ConcurrentModificationException demo.** `ExceptionHandlingInJava.tsx`. Removes the
    second-to-last element, so no exception is thrown at all.

## JSP & Servlets

1. **`jsp:fallback` described as custom-tag fallback.** `JSPServlet.ts:9117,9204`. Legal
   only inside `<jsp:plugin>`; the expert example is a translation error.
2. **`isThreadSafe` meaning inverted.** `JSPServlet.ts:8995`. `isThreadSafe="false"` makes
   the container *serialize* requests (deprecated SingleThreadModel behaviour).
3. **`javax.servlet.error.*` attributes on a Jakarta container.**
   `JSPServlet.ts:8213,8253,8299`. Every example imports `jakarta.servlet.*`, so these
   return `null` and the following unboxing throws NPE inside the error handler.
4. **URL rewriting via a `sessionId` query parameter.** `JSPServlet.ts:5157-5167`. The
   container only recognises `;jsessionid=`; use `response.encodeURL()`.
5. **"`sendRedirect()` stops further execution."** `JSPServlet.ts:3968`. It returns normally;
   you need an explicit `return;`, as the course's own AuthFilter correctly does.
6. **Async example never calls `complete()`.** `JSPServlet.ts:6978-6992`. The client hangs
   until the 30s container timeout.
7. **`static int activeSessions` in a listener.** `JSPServlet.ts:7805-7825`. Non-atomic
   increment across request threads; use `AtomicInteger`.
8. **Broken JSON escaping.** `JSPServlet.ts:3208`. Single backslashes are consumed by the
   template literal, so the rendered Java does not compile.

## Design & architecture patterns

1. **"No duplicate processing happens by design."** `MessagingPatternsPart1.ts:276`.
   Point-to-point prevents fan-out, not redelivery — consumers must still be idempotent.
2. **Fail-fast iterator demo.** `designPattern.ts:2530-2551`. Verified by execution: removing
   the penultimate element prints no exception and yields `[A, C]`.
3. **Singleton "prevent cloning" that prevents nothing.** `designPattern.ts:146-167`. The
   class implements `Cloneable` and the override just calls `super.clone()`; the page's own
   output still shows two hashcodes. Must throw `CloneNotSupportedException`.
4. **FIXED — "Istio and Linkerd, both built on Envoy."** `CloudNativePatterns.ts:175,199,512`.
   Linkerd 2.x ships its own Rust micro-proxy.
5. **`findById()` returning the entity.** `ArchitecturalPatterns.ts:59`. Spring Data returns
   `Optional<Order>`, so this does not compile.
6. **ConcurrentHashMap listed as copy-based fail-safe.** `designPattern.ts:2514`,
   `IteratorPattern.tsx:181`. Weakly consistent, not a snapshot.
7. **"Header-Based / Recipient List Router."** `MessagingPatternsPart2.ts:66`. Recipient List
   is a distinct one-to-many EIP, unrelated to header inspection.
8. **Service mesh cited as Broker Architecture.** `ArchitecturalPatterns.ts:466,476`. A mesh
   is defined by *decentralized* sidecars — the opposite of a central broker.
9. **"In classic MVC, the View reads Model data passed by the Controller."**
   `EnterprisePatternsPart1.ts:120`. That is web/Model-2 MVC; in Smalltalk-80 MVC the View
   observes the Model directly.
10. **Class Adapter "only possible via multiple interface inheritance."**
    `AdapterPattern.tsx:127`. The standard form extends the Adaptee class and implements the
    Target interface — which the file's own next code block does.
11. **ATM dispenser output.** `ChainOfResponsibilityPattern.tsx:135`. 2000+500+200 = 2700,
    not 3700; correct is 1x2000, 3x500, 2x100.

## Web frontend

1. **FIXED — "Promise.all ... waits for all to settle."** `JavaScriptCourse.ts:775`. It
   rejects on the first rejection; `allSettled` is the one that waits.
2. **FIXED — "Inline > Internal > External CSS."** `HtmlandCSS.ts:2090`. There is no
   internal-over-external rule; equal specificity is resolved by source order.
3. **FIXED — "RGBA / HSLA control only background transparency."** `HtmlandCSS.ts:1945`.
4. **FIXED — "HTML tags are always written in lower case."** `HtmlandCSS.ts:253`.
5. **FIXED — "HTML invented ... in 1992."** `HtmlandCSS.ts:682`. 1989-1991.
6. **`useState` mutation example cannot run.** `Reactjs.ts:753-766`. `count` is `const`, so
   `count = count + 1` throws `TypeError` and nothing is logged. Use object mutation instead.
7. **"POST (secure, for sensitive data)."** `HtmlandCSS.ts:3978`. POST bodies are plaintext
   without HTTPS — a classic security misconception.
8. **Duplicate `id="gender"` on two radios.** `HtmlandCSS.ts:468-469`. Invalid HTML; the
   `<label for>` binds only to the first.
9. **"Inline elements cannot contain block elements."** `HtmlandCSS.ts:3774`. HTML5 gives
   `<a>` a transparent content model, so wrapping a `<div>` in an anchor is valid.
10. **"Babel compiles every JSX element into React.createElement."** `Reactjs.ts:495`.
    Outdated since React 17 — the automatic runtime emits `_jsx()` from `react/jsx-runtime`.
11. **"Absolute URL: links to an external resource on another website."** `HtmlandCSS.ts:990`.
    Absolute vs relative is about scheme+host, not which site.
12. **`<ul type="disc">`.** `HtmlandCSS.ts:2953+`. Obsolete in HTML5 (unlike `<ol type>`);
    use `list-style-type`.

## CS fundamentals & data science

1. **`drop_duplicates()` claim.** `DataScienceCourse.ts`. With no `subset` it compares whole
   rows, and the two Sheru rows differ, so nothing is removed — output has 4 rows, not 3.
2. **"Binary search best case Omega(log n)."** `BigOmegaNotation.tsx`. Best case is Omega(1);
   `SearchingAlgorithms.tsx` says so, so the two topics contradict each other.
3. **"Bubble Sort best O(n)."** `SortingAlgorithms.tsx`. The implementation taught on the
   same page has no early-exit flag, so its best case is Theta(n^2).
4. **N-Queens board output.** `BacktrackingAlgorithm.tsx`. Verified: the code returns
   `[1,3,0,2]`; the printed board is the second solution.
5. **FIXED — "The 3 Scrum Roles."** `ScrumFramework.tsx`. The 2020 Scrum Guide removed
   "roles" and the separate Development Team; they are accountabilities, and Developers.
6. **FIXED — "Kanban's 4 Core Principles."** `KanbanMethod.tsx`. Those are 4 of the 6 core
   *practices*; the 4 foundational principles are entirely different.
7. **Linear-regression output 86.0.** `MachineLearningCourse.ts`. The fit is deterministic
   (slope 7.5, intercept 41.5), so it prints **86.5**.
8. **Correlation values.** `DataScienceCourse.ts`. Actual Pearson values are 0.993 and
   -0.974, not 0.98 and -0.90.

## Structural issues (found outside the ten audits)

1. **A topic injects a global `<style>` block.** `coreJava` -> "difference between JVM JDK JRE"
   (beginner) embeds `<style>@keyframes jvmdiagGlowJdk ...</style>` inside its content HTML.
   Because content is rendered with `dangerouslySetInnerHTML`, that CSS is injected into the
   document rather than scoped to the topic. The keyframe names are namespaced so nothing
   breaks today, but it is a leak waiting to collide.
2. **Raw `<html><body>` inside content.** `jsp-servlet` -> `jsp-directives` (expert). The
   browser discards these tags when parsing an HTML fragment, so that example renders wrong.

---

## How this was produced

Ten reviewers ran in parallel, each given a disjoint slice, a domain-specific checklist of
the errors that area is prone to, and an explicit instruction that precision outranks
volume and that inventing a finding is worse than missing one. Several compiled or executed
the snippets they doubted rather than reasoning from memory, which is where the
output-mismatch findings came from.

Every fix applied so far was verified with `npm run typecheck` and by re-introspecting the
course tree to confirm the topic counts are unchanged (28 courses / 78 modules / 474 topics
/ 3,430 content blocks / 2,173 code examples).
