import { Topic } from '../coreJava';

export const springBootAop: Topic = {
    id: 'spring-boot-aop',
    name: 'Aspect-Oriented Programming (AOP)',
    beginner: [
        {
            content: `<h3>The Problem: Code That Does Not Belong Where It Sits</h3>
Open any real service class and you will find two kinds of code mixed together. There is the code that answers the question the class exists to answer - transfer money, register a student, price an order. And there is the code that is there because the <em>system</em> needs it - logging, timing, security checks, transaction boundaries, retries, auditing.<br><br>

The second kind is called a <strong>cross-cutting concern</strong>. It cuts <em>across</em> the class hierarchy: it is not the responsibility of any one class, yet every class needs it. Because inheritance runs vertically and this need runs horizontally, ordinary object-oriented tools cannot capture it. So it gets copy-pasted.<br>`,
            codeExamples: [
                `// Five methods. The business logic is 1 line each.
// The logging and timing is 6 lines each.

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public Order placeOrder(OrderRequest req) {
        log.info("ENTER placeOrder({})", req);
        long start = System.currentTimeMillis();
        try {
            Order result = repository.save(toEntity(req));      // <-- the actual work
            log.info("EXIT placeOrder -> {}", result);
            return result;
        } finally {
            log.info("placeOrder took {} ms", System.currentTimeMillis() - start);
        }
    }

    public Order cancelOrder(Long id) {
        log.info("ENTER cancelOrder({})", id);
        long start = System.currentTimeMillis();
        try {
            Order result = repository.cancel(id);               // <-- the actual work
            log.info("EXIT cancelOrder -> {}", result);
            return result;
        } finally {
            log.info("cancelOrder took {} ms", System.currentTimeMillis() - start);
        }
    }

    // ... and the same 6 lines again in refundOrder,
    //     shipOrder and reopenOrder.
}

// PROBLEMS:
// 1. 30 lines of plumbing hiding 5 lines of business logic.
// 2. Change the log format and you edit it in 5 places (and 400
//    more across the application).
// 3. Someone will forget the try/finally in method six.
// 4. Unit tests now assert on logging noise.`
            ]
        },
        {
            content: `<h3>The Fix: Say It Once</h3>
<strong>Aspect-Oriented Programming</strong> lets you write that plumbing <em>once</em>, in its own class, and declare <em>where</em> it should apply. The service goes back to being about orders.<br><br>

Nothing in <code>OrderService</code> refers to the aspect. That is the whole point - the concern is applied from the outside, so the business class never learns it is being logged.<br>`,
            codeExamples: [
                `// The service, after
@Service
public class OrderService {

    public Order placeOrder(OrderRequest req) {
        return repository.save(toEntity(req));
    }

    public Order cancelOrder(Long id) {
        return repository.cancel(id);
    }

    // ... three more, each one line. No logger, no timer, no try/finally.
}`,
                `// One aspect replaces all of it
@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Around("execution(* com.jsl.service..*(..))")
    public Object logAndTime(ProceedingJoinPoint pjp) throws Throwable {
        String name = pjp.getSignature().toShortString();
        log.info("ENTER {} args={}", name, Arrays.toString(pjp.getArgs()));
        long start = System.nanoTime();
        try {
            Object result = pjp.proceed();
            log.info("EXIT  {} -> {}", name, result);
            return result;
        } finally {
            log.info("{} took {} ms", name, (System.nanoTime() - start) / 1_000_000);
        }
    }
}

// OUTPUT (console) for a single POST /api/orders:
// INFO  c.j.a.LoggingAspect : ENTER OrderService.placeOrder(..) args=[OrderRequest(sku=BK-19, qty=2)]
// INFO  c.j.a.LoggingAspect : EXIT  OrderService.placeOrder(..) -> Order(id=41, status=PLACED)
// INFO  c.j.a.LoggingAspect : OrderService.placeOrder(..) took 37 ms
//
// Add a sixth service method tomorrow and it is logged automatically.`
            ]
        },
        {
            content: `<h3>The Vocabulary</h3>
AOP has five terms. They sound abstract until you map them onto the example above, so the table does exactly that.<br><br>

<table>
<tr><th>Term</th><th>Meaning</th></tr>
<tr><td>Aspect</td><td>The module holding a cross-cutting concern. <code>LoggingAspect</code> is one - a class annotated <code>@Aspect</code>.</td></tr>
<tr><td>Join Point</td><td>A point in program execution where an aspect <em>could</em> be applied. In Spring AOP a join point is always a <strong>method execution</strong> on a Spring bean - nothing else.</td></tr>
<tr><td>Pointcut</td><td>An expression selecting <em>which</em> join points to advise. <code>execution(* com.jsl.service..*(..))</code> is a pointcut.</td></tr>
<tr><td>Advice</td><td>The code that runs at a matched join point, and when it runs: before, after, or around.</td></tr>
<tr><td>Weaving</td><td>The act of linking aspects into the target. Spring does it at <strong>runtime</strong> by wrapping the bean in a proxy; AspectJ can do it at compile time.</td></tr>
<tr><td>Target object</td><td>The real, unadvised bean - the actual <code>OrderService</code> instance sitting behind the proxy.</td></tr>
</table>
<br>
A one-line summary worth memorising: <strong>a pointcut selects join points, and advice is what runs there.</strong><br><br>

Where each advice type fires relative to the method call:<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">      caller
        |
        v
  +-----------------------------------------------------+
  |  PROXY                                              |
  |                                                     |
  |    @Around  (before proceed)                        |
  |    @Before  ------------------------+               |
  |                                     v               |
  |                          +---------------------+    |
  |                          |  target method      |    |
  |                          |  (the JOIN POINT)   |    |
  |                          +----------+----------+    |
  |                                     |               |
  |             returns normally  <-----+----->  throws |
  |                    |                           |    |
  |            @AfterReturning              @AfterThrowing
  |                    |                           |    |
  |                    +-------------+-------------+    |
  |                                  v                  |
  |    @After   (finally - runs on BOTH paths)          |
  |    @Around  (after proceed - skipped if it threw)   |
  +-----------------------------------------------------+
        |
        v
      caller</pre>
<br>
Note the asymmetry: <code>@After</code> is a <code>finally</code> block and always runs. The code after <code>proceed()</code> in an <code>@Around</code> is <em>not</em> a finally block - if the target throws, that code is skipped unless you wrote your own try/finally.<br>`
        },
        {
            content: `<h3>Setting It Up</h3>
One starter. It pulls in <code>aspectjweaver</code> (Spring AOP borrows AspectJ's <em>annotations and pointcut syntax</em>, though not its weaver) and switches on <code>@EnableAspectJAutoProxy</code> through auto-configuration.<br><br>

You do not need <code>@EnableAspectJAutoProxy</code> in a Spring Boot application. In a plain Spring application you do.<br>`,
            codeExamples: [
                `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>

<!-- Gradle:
     implementation 'org.springframework.boot:spring-boot-starter-aop' -->

<!-- WITHOUT this dependency, an @Aspect class still compiles if
     aspectjweaver arrives transitively, and it is still registered as a
     @Component - but no advice ever fires. The class looks correct and
     does nothing, which is the most confusing failure mode there is. -->`,
                `# application.properties - useful while learning
logging.level.org.springframework.aop=DEBUG

# Force CGLIB even for beans that implement interfaces.
# Spring Boot already defaults this to true; see the Expert tab for why.
spring.aop.proxy-target-class=true`
            ]
        },
        {
            content: `<h3>Your First Aspect: <code>@Before</code></h3>
Two annotations make a class an aspect, and both are required:<br><br>

<div class="border">
<code>@Aspect</code> - tells Spring this class contains advice.<br>
<code>@Component</code> - tells Spring to create the bean in the first place.
</div><br>

<code>@Aspect</code> alone is a very common mistake. It is an AspectJ annotation, not a Spring stereotype, so it does not cause bean creation. If Spring never instantiates the class, Spring never reads its advice.<br>`,
            codeExamples: [
                `package com.jsl.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect            // "this class holds advice"      (AspectJ)
@Component         // "create this bean"             (Spring)  <-- do not omit
public class AuditAspect {

    @Before("execution(* com.jsl.service.OrderService.*(..))")
    public void beforeAnyOrderServiceMethod(JoinPoint jp) {
        System.out.println("[BEFORE] " + jp.getSignature().getName()
                + " args=" + Arrays.toString(jp.getArgs()));
    }
}

// OUTPUT on POST /api/orders:
// [BEFORE] placeOrder args=[OrderRequest(sku=BK-19, qty=2)]
//
// JoinPoint gives you read-only access to the call:
//   jp.getSignature()      -> Order com.jsl.service.OrderService.placeOrder(OrderRequest)
//   jp.getArgs()           -> the argument array
//   jp.getTarget()         -> the real bean behind the proxy
//   jp.getThis()           -> the proxy itself
//
// @Before CANNOT stop the method or change the return value.
// It can only throw - which does abort the call. For anything
// else, use @Around.`
            ]
        },
        {
            content: `<h3>Pointcut Expressions, Piece by Piece</h3>
The pointcut is where most of the learning is. The commonest designator is <code>execution</code>, and its grammar is:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">execution( modifiers?  return-type  declaring-type?.method-name(params)  throws? )
             optional    REQUIRED       optional    REQUIRED   REQUIRED   optional


execution( *  com.jsl.service.OrderService.placeOrder(..) )
           |            |            |          |        |
           |            |            |          |        +-- any arguments
           |            |            |          +----------- this method only
           |            |            +---------------------- this class only
           |            +----------------------------------- this package
           +------------------------------------------------ any return type


Wildcards:
    *      exactly one element   (one package segment, one word, one arg)
    ..     zero or more          (sub-packages, or any argument list)


execution(* com.jsl.service.*.*(..))       every method of every class
                                           DIRECTLY in com.jsl.service

execution(* com.jsl.service..*.*(..))      ... and in every SUB-package too
                          ^^
                          this is the difference: '..' descends

execution(public * *(..))                  every public method, anywhere
execution(* save*(..))                     any method whose name starts "save"
execution(String com.jsl..*.*(..))         only methods returning String
execution(* *..*Service.*(..))             any class named *Service
execution(* com.jsl..*.find*(Long))        find* taking exactly one Long
execution(* com.jsl..*.find*(Long, ..))    find* whose FIRST arg is a Long</pre>
<br>
Four other designators cover almost everything else:<br><br>

<table>
<tr><th>Designator</th><th>Selects</th></tr>
<tr><td><code>within(com.jsl.service..*)</code></td><td>Any join point inside that package or its sub-packages. Coarser than <code>execution</code>, and cheaper to match.</td></tr>
<tr><td><code>@annotation(com.jsl.Auditable)</code></td><td>Methods carrying that annotation. The most maintainable option - the target opts in explicitly.</td></tr>
<tr><td><code>@within(org.springframework.stereotype.Service)</code></td><td>Methods of any class carrying that annotation, e.g. every <code>@Service</code>.</td></tr>
<tr><td><code>bean(*Service)</code></td><td>Beans whose name matches. Spring-specific, and useful when you think in beans rather than packages.</td></tr>
<tr><td><code>args(Long, ..)</code></td><td>Calls whose runtime arguments match, and can bind them into the advice.</td></tr>
</table>`,
            codeExamples: [
                `// Name your pointcuts. An expression written once and referenced by
// method name is far easier to maintain than the same string pasted
// into six advice annotations.

@Aspect
@Component
public class PointcutDefinitions {

    @Pointcut("within(com.jsl.service..*)")
    public void inServiceLayer() {}                 // empty body - it is a label

    @Pointcut("@annotation(com.jsl.annotation.Auditable)")
    public void auditable() {}

    @Pointcut("execution(public * *(..))")
    public void anyPublicMethod() {}

    // Combine with && || !  exactly like boolean logic
    @Pointcut("inServiceLayer() && anyPublicMethod() && !auditable()")
    public void plainServiceCall() {}
}

// Reference it from another aspect by fully-qualified method name:
@Before("com.jsl.aspect.PointcutDefinitions.inServiceLayer()")
public void log(JoinPoint jp) { ... }`,
                `// Binding arguments - the advice can receive them, typed
@Before("execution(* com.jsl.service.OrderService.cancelOrder(..)) && args(orderId)")
public void beforeCancel(Long orderId) {
    System.out.println("[BEFORE] cancelling order " + orderId);
}
// OUTPUT: [BEFORE] cancelling order 41
//
// The parameter NAME must match the name inside args(). If it does not,
// startup fails with:
//   IllegalArgumentException: error at ::0 formal unbound in pointcut
//
// The same binding works for annotations - handy when the annotation
// carries attributes you need:
@Before("@annotation(auditable)")
public void beforeAudited(JoinPoint jp, Auditable auditable) {
    System.out.println("[AUDIT] action=" + auditable.action());
}`
            ]
        },
        {
            content: `<h3>The Five Advice Types</h3>
<table>
<tr><th>Annotation</th><th>When it runs</th></tr>
<tr><td><code>@Before</code></td><td>Before the method. Cannot prevent it running or alter the result; can only throw.</td></tr>
<tr><td><code>@After</code></td><td>After the method, on every path - like <code>finally</code>. Use it for cleanup that must always happen.</td></tr>
<tr><td><code>@AfterReturning</code></td><td>Only when the method returned normally. Can read (and with <code>returning=</code> bind) the returned value.</td></tr>
<tr><td><code>@AfterThrowing</code></td><td>Only when the method threw. Can bind the exception. It does <em>not</em> swallow it - the exception still propagates.</td></tr>
<tr><td><code>@Around</code></td><td>Wraps the call. The most powerful: it can change arguments, skip the call entirely, alter the return value, catch exceptions, or retry.</td></tr>
</table>`,
            codeExamples: [
                `@Aspect
@Component
public class OrderAspect {

    @Before("execution(* com.jsl.service.OrderService.*(..))")
    public void before(JoinPoint jp) {
        System.out.println("1. @Before        " + jp.getSignature().getName());
    }

    @AfterReturning(
        pointcut = "execution(* com.jsl.service.OrderService.*(..))",
        returning = "result")                    // name must match the parameter
    public void afterReturning(JoinPoint jp, Object result) {
        System.out.println("3. @AfterReturning result=" + result);
    }

    @AfterThrowing(
        pointcut = "execution(* com.jsl.service.OrderService.*(..))",
        throwing = "ex")
    public void afterThrowing(JoinPoint jp, Throwable ex) {
        System.out.println("3. @AfterThrowing  " + ex.getClass().getSimpleName()
                + ": " + ex.getMessage());
        // The exception continues to propagate. To stop it you need @Around.
    }

    @After("execution(* com.jsl.service.OrderService.*(..))")
    public void after(JoinPoint jp) {
        System.out.println("4. @After          (always runs)");
    }
}`,
                `// OUTPUT - happy path, placeOrder() returns normally:
// 1. @Before        placeOrder
// 3. @AfterReturning result=Order(id=41, status=PLACED)
// 4. @After          (always runs)

// OUTPUT - cancelOrder(999) throws OrderNotFoundException:
// 1. @Before        cancelOrder
// 3. @AfterThrowing  OrderNotFoundException: no order 999
// 4. @After          (always runs)
// ... then the exception reaches the controller advice -> 404
//
// Notice @AfterReturning did NOT run on the failing path, and
// @After ran on both. That is the whole distinction.
//
// TRAP: on a method returning void, @AfterReturning still fires and
// binds result = null. Declaring the parameter as a concrete type
// (returning = "result", Order result) instead of Object silently
// NARROWS the pointcut - advice only fires when the returned value
// is assignable to that type. A void method then never matches.`
            ]
        },
        {
            content: `<h3><code>@Around</code> and Performance Monitoring</h3>
<code>@Around</code> is the only advice that receives a <code>ProceedingJoinPoint</code>, and the only one that decides whether the target method runs at all. Calling <code>pjp.proceed()</code> invokes it; not calling it means the method never executes.<br><br>

<strong>The single most common bug in AOP:</strong> forgetting to <em>return</em> the result of <code>proceed()</code>. The advice runs, the method runs, and the caller receives <code>null</code>.<br>`,
            codeExamples: [
                `@Aspect
@Component
public class PerformanceAspect {

    private static final Logger log = LoggerFactory.getLogger(PerformanceAspect.class);
    private static final long SLOW_MS = 500;

    @Around("@within(org.springframework.stereotype.Service)")
    public Object measure(ProceedingJoinPoint pjp) throws Throwable {

        long start = System.nanoTime();
        boolean failed = false;
        try {
            return pjp.proceed();               // <-- RETURN it. See note below.
        } catch (Throwable t) {
            failed = true;
            throw t;                            // rethrow - do not swallow silently
        } finally {
            long ms = (System.nanoTime() - start) / 1_000_000;
            String name = pjp.getSignature().toShortString();
            if (failed) {
                log.warn("{} FAILED after {} ms", name, ms);
            } else if (ms > SLOW_MS) {
                log.warn("SLOW  {} took {} ms", name, ms);   // over budget
            } else {
                log.debug("{} took {} ms", name, ms);
            }
        }
    }
}

// OUTPUT:
// DEBUG PerformanceAspect : OrderService.placeOrder(..) took 37 ms
// WARN  PerformanceAspect : SLOW  ReportService.monthlySummary(..) took 4182 ms
// WARN  PerformanceAspect : OrderService.cancelOrder(..) FAILED after 3 ms`,
                `// THE BUG - and it compiles cleanly
@Around("execution(* com.jsl.service..*(..))")
public Object broken(ProceedingJoinPoint pjp) throws Throwable {
    long start = System.currentTimeMillis();
    pjp.proceed();                              // result thrown away
    System.out.println("took " + (System.currentTimeMillis() - start));
    return null;                                // or no explicit return at all
}
// OUTPUT:
// took 37
// ... and the controller returns  {}  or throws NullPointerException,
// because every advised method now returns null. The service ran
// correctly; the proxy discarded its answer.
//
// Correct: capture and return.
Object result = pjp.proceed();
return result;`,
                `// @Around can also REPLACE arguments and SUPPRESS the call.
@Around("@annotation(com.jsl.annotation.Retryable)")
public Object retry(ProceedingJoinPoint pjp) throws Throwable {
    int attempts = 0;
    while (true) {
        try {
            return pjp.proceed();
        } catch (TransientDataAccessException ex) {
            if (++attempts >= 3) throw ex;
            Thread.sleep(100L * attempts);
            log.warn("retry {} of 3 for {}", attempts, pjp.getSignature().getName());
        }
    }
}

// Passing modified arguments: proceed(Object[])
@Around("execution(* com.jsl.service.SearchService.find(String))")
public Object trim(ProceedingJoinPoint pjp) throws Throwable {
    Object[] args = pjp.getArgs();
    args[0] = ((String) args[0]).trim().toLowerCase();
    return pjp.proceed(args);                   // call with the NEW arguments
}
// OUTPUT: find("  Mumbai ") reaches the service as find("mumbai")`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Spring AOP is a Proxy, Not a Weaver</h3>
This single fact explains every surprise in Spring AOP, so it is worth stating precisely.<br><br>

<strong>AspectJ</strong> is a full AOP implementation. It performs <strong>bytecode weaving</strong>: at compile time or class-load time it rewrites the <code>.class</code> files, physically inserting advice into the method bodies. It can advise constructors, field access, static methods, private methods, and objects you created with <code>new</code>.<br><br>

<strong>Spring AOP</strong> does none of that. It creates a <strong>proxy</strong> - a separate object that implements the same interface or extends the same class, holds a reference to your real bean, and interposes advice on each call it forwards. Your bytecode is untouched.<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">What the container actually injects:

  @Autowired OrderService orderService;
                  |
                  v
        +---------------------+          +--------------------+
        |  OrderService$$      |  calls  |   OrderService     |
        |  SpringCGLIB$$0      | ------> |   (the TARGET,     |
        |                      |         |    your real bean) |
        |  advice runs HERE    |         |                    |
        +---------------------+          +--------------------+

  Every consequence below follows from this one picture:
  advice runs on the ARROW, not inside the box.</pre>
<br>
<table>
<tr><th>Aspect of the model</th><th>Consequence</th></tr>
<tr><td>Advice lives on the proxy</td><td>Only calls that <em>go through the proxy</em> are advised.</td></tr>
<tr><td>The proxy is a Spring bean</td><td>Objects created with <code>new</code> are never advised.</td></tr>
<tr><td>The proxy overrides methods</td><td><code>final</code>, <code>private</code> and <code>static</code> methods cannot be advised.</td></tr>
<tr><td>Join points are method executions only</td><td>No field access, no constructor, no <code>new</code> - unlike AspectJ.</td></tr>
</table>`,
            codeExamples: [
                `// Proof, in one line
@Service
public class OrderService {
    public void show() {
        System.out.println(this.getClass().getName());
    }
}

// OUTPUT with no aspects present:
// com.jsl.service.OrderService

// OUTPUT once ANY aspect matches this bean:
// com.jsl.service.OrderService$$SpringCGLIB$$0
//
// The '$$SpringCGLIB$$' in a stack trace or a toString() is how you
// confirm at runtime that a bean is actually proxied. If you expect
// advice and the class name is plain, no proxy was created and no
// advice will ever run.`
            ]
        },
        {
            content: `<h3>Self-Invocation: The Failure Everyone Hits</h3>
If a method of a bean calls another method of <em>the same</em> bean, the call goes through <code>this</code> - the raw target object - not through the proxy. The proxy is never involved, so <strong>no advice runs</strong>.<br><br>

This is the exact mechanism behind the most-reported Spring bug on the internet: "<code>@Transactional</code> is not working". It is not broken; the call simply never reached the proxy. The same is true of <code>@Cacheable</code>, <code>@Async</code>, <code>@PreAuthorize</code>, <code>@Retryable</code> and your own aspects, because they are all the same machinery.<br>`,
            codeExamples: [
                `@Service
public class ReportService {

    // Called from the controller -> goes through the proxy -> ADVISED
    public void generateAll() {
        for (Long id : ids) {
            generateOne(id);      // <-- 'this.generateOne(id)' - NO PROXY
        }
    }

    @Transactional
    @Auditable(action = "REPORT")
    public void generateOne(Long id) { ... }
}

// OUTPUT:
// [AUDIT] generateAll            <-- outer call was advised
// (nothing at all for generateOne, 200 times)
// ... and no transaction was ever opened for generateOne either.
//
// The annotations are correct. The stack trace goes
//   proxy -> generateAll -> generateOne
// and only the first arrow passes the proxy.`,
                `// FIX 1 - move it to another bean. The call then crosses a bean
// boundary, so it goes through that bean's proxy. This is the fix
// that survives code review, because it also fixes the design:
// a transaction boundary belongs to a collaborator, not to a loop.
@Service
public class ReportService {
    private final ReportGenerator generator;    // injected proxy
    public void generateAll() {
        ids.forEach(generator::generateOne);    // ADVISED
    }
}

// FIX 2 - self-injection. Works, and reads as a workaround.
@Service
public class ReportService {
    @Autowired @Lazy private ReportService self;   // @Lazy avoids the
                                                   // circular-reference failure
    public void generateAll() {
        ids.forEach(id -> self.generateOne(id));   // ADVISED
    }
}

// FIX 3 - grab the current proxy. Requires
// @EnableAspectJAutoProxy(exposeProxy = true), and throws
// IllegalStateException if you forget it. Last resort.
((ReportService) AopContext.currentProxy()).generateOne(id);

// FIX 4 - real AspectJ load-time weaving. Advice is woven into the
// bytecode, so self-invocation is advised like any other call. It
// solves the problem completely and costs you a -javaagent and a
// build/deploy step most teams do not want.`
            ]
        },
        {
            content: `<h3>JDK Dynamic Proxy vs CGLIB</h3>
Spring has two ways to build the proxy, and which one it picks changes what can be advised and what you can inject.<br><br>

<table>
<tr><th>&nbsp;</th><th>JDK dynamic proxy</th><th>CGLIB</th></tr>
<tr><td>Mechanism</td><td><code>java.lang.reflect.Proxy</code> - implements the interfaces</td><td>Generates a runtime <em>subclass</em> of the target</td></tr>
<tr><td>Requires</td><td>The bean implements at least one interface</td><td>A non-final class with a usable constructor</td></tr>
<tr><td>Can be injected as</td><td>The interface only - <strong>never</strong> the concrete class</td><td>The class or its interfaces</td></tr>
<tr><td>Cannot advise</td><td>Methods not on the interface</td><td><code>final</code> classes and <code>final</code> methods</td></tr>
<tr><td>Also blocked</td><td colspan="2"><code>private</code> and <code>static</code> methods, in both</td></tr>
</table>
<br>
Historically Spring chose JDK proxies when interfaces were present and CGLIB otherwise. <strong>Spring Boot sets <code>spring.aop.proxy-target-class=true</code>, so CGLIB is the default regardless of interfaces</strong> - specifically to avoid the "cannot inject the concrete type" failure below, which confused people for years.<br>`,
            codeExamples: [
                `// The classic JDK-proxy failure
public interface OrderService { Order place(OrderRequest r); }

@Service
public class OrderServiceImpl implements OrderService {
    public Order place(OrderRequest r) { ... }
    public void adminOnlyHelper() { ... }        // NOT on the interface
}

@Autowired private OrderServiceImpl orderService;    // <-- the mistake

// OUTPUT at startup, with proxy-target-class=false:
// BeanNotOfRequiredTypeException: Bean named 'orderServiceImpl' is
//   expected to be of type 'com.jsl.service.OrderServiceImpl' but was
//   actually of type 'com.sun.proxy.$Proxy142'
//
// The JDK proxy implements OrderService. It is NOT an OrderServiceImpl,
// so the injection point cannot be satisfied.
// Fix: inject the INTERFACE. (Boot's CGLIB default hides this, but
// depending on the concrete type is still the wrong habit.)
//
// And note adminOnlyHelper() is unadvised under a JDK proxy even when
// called through the proxy - it is not on the interface, so it is
// simply not part of the proxy's surface.`,
                `// The CGLIB failures - all silent, none of them errors
@Service
public final class TaxCalculator { ... }
// OUTPUT: startup fails, or with older Spring the bean is left
// unproxied. CGLIB cannot subclass a final class.

@Service
public class PricingService {
    @Transactional
    public final BigDecimal price(Order o) { ... }   // final METHOD
}
// OUTPUT: no error, no warning, no transaction. CGLIB cannot
// override it, so the subclass inherits it verbatim and the call
// bypasses the interceptor chain entirely.

@Service
public class ReportService {
    @Transactional
    private void write() { ... }          // private
    @Transactional
    public static void purge() { ... }    // static
}
// OUTPUT: neither is advised. Same reason.
//
// KOTLIN: classes and methods are final by DEFAULT. This is why
// Kotlin Spring projects need the kotlin-spring (all-open) compiler
// plugin - without it nothing is proxyable and nothing works.
//
// LOMBOK/RECORDS: a Java 'record' is final. Never put @Transactional
// or a custom aspect on a record's methods.`
            ]
        },
        {
            content: `<h3>Advice Ordering with <code>@Order</code></h3>
When several aspects match the same join point the order matters, and the default is undefined. Give each aspect an explicit precedence.<br><br>

<strong>Lower number means higher precedence</strong>, and for an <code>@Around</code> the higher-precedence aspect is the <strong>outermost</strong> wrapper - it runs first on the way in and <em>last</em> on the way out. Think of nested boxes, not a queue.<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">@Order(1) SecurityAspect     @Order(2) TxAspect      @Order(3) LoggingAspect

  +-- Security in ---------------------------------------+
  |    +-- Tx begin ------------------------------------+ |
  |    |    +-- Log enter -------------------------+    | |
  |    |    |          TARGET METHOD               |    | |
  |    |    +-- Log exit --------------------------+    | |
  |    +-- Tx commit -----------------------------------+ |
  +-- Security out --------------------------------------+

  IN:   1 -> 2 -> 3 -> target
  OUT:  target -> 3 -> 2 -> 1        (reverse - it is a stack)

  Consequence that bites: put logging at @Order(3), inside the
  transaction aspect, and your "method finished" log line is
  written BEFORE the commit. If the commit then fails, the log
  says success and the database says nothing happened.</pre>
<br>
Within a <em>single</em> aspect class, ordering between advice methods is not controlled by <code>@Order</code> at all. Spring orders by advice type (<code>@Around</code> and <code>@Before</code> first, then <code>@After</code>/<code>@AfterReturning</code>/<code>@AfterThrowing</code>), and beyond that it is unspecified. If two pieces of advice must be ordered relative to each other, put them in <strong>separate aspect classes</strong>.<br>`,
            codeExamples: [
                `@Aspect
@Component
@Order(1)                       // outermost
public class SecurityAspect {
    @Around("@annotation(com.jsl.annotation.Secured)")
    public Object check(ProceedingJoinPoint pjp) throws Throwable {
        if (!currentUserMayCall(pjp)) throw new AccessDeniedException("denied");
        return pjp.proceed();
    }
}

@Aspect
@Component
@Order(50)                      // inside security, outside logging
public class MetricsAspect { ... }

// Spring's own infrastructure has fixed precedences you should know:
//   @Transactional  interceptor : Ordered.LOWEST_PRECEDENCE (Integer.MAX_VALUE)
//   @Async          interceptor : Ordered.LOWEST_PRECEDENCE
//   @Cacheable      interceptor : Integer.MAX_VALUE - 1  (just OUTSIDE tx)
//   method security             : configurable, default 0-ish (outermost)
//
// So by default your @Order(1) aspect wraps the transaction. If you
// need to run INSIDE the transaction - to see uncommitted state, or
// to publish an event that must roll back with it - you must order
// your aspect after the transaction interceptor, or use a
// TransactionSynchronization callback instead.`,
                `// Demonstrating the order, with two aspects on one call:
// OUTPUT:
// [Security @Order(1)] IN
// [Metrics  @Order(50)] IN
//     OrderService.placeOrder executing
// [Metrics  @Order(50)] OUT  took 37 ms
// [Security @Order(1)] OUT
//
// Note the Metrics timing EXCLUDES the security check, because
// Metrics is inside it. Move Metrics to @Order(0) and the number
// suddenly includes authorisation cost. Aspect order changes what
// your performance numbers mean - decide deliberately.`
            ]
        },
        {
            content: `<h3>The Best Thing to Know: Spring Itself Is Built On This</h3>
Students treat AOP as an optional extra. It is not. A large part of Spring's declarative programming model <em>is</em> AOP, and once you see that, a whole class of bugs becomes predictable rather than mysterious.<br><br>

<table>
<tr><th>Annotation</th><th>How it actually works</th></tr>
<tr><td><code>@Transactional</code></td><td><code>TransactionInterceptor</code> - an <code>@Around</code> advice that begins a transaction, calls <code>proceed()</code>, then commits or rolls back.</td></tr>
<tr><td><code>@Cacheable</code>, <code>@CacheEvict</code></td><td><code>CacheInterceptor</code> - around advice that looks in the cache and <em>skips</em> <code>proceed()</code> on a hit.</td></tr>
<tr><td><code>@Async</code></td><td><code>AsyncExecutionInterceptor</code> - around advice that submits <code>proceed()</code> to a <code>TaskExecutor</code> and returns immediately.</td></tr>
<tr><td><code>@PreAuthorize</code>, <code>@Secured</code>, <code>@RolesAllowed</code></td><td>Spring Security method security - around advice evaluating the expression before <code>proceed()</code>.</td></tr>
<tr><td><code>@Retryable</code> (Spring Retry)</td><td>Around advice calling <code>proceed()</code> in a loop.</td></tr>
<tr><td><code>@Validated</code> on a bean</td><td><code>MethodValidationInterceptor</code> - validates arguments before <code>proceed()</code>.</td></tr>
<tr><td><code>@Timed</code> (Micrometer)</td><td>Around advice recording a timer - exactly the aspect from the beginner tab.</td></tr>
</table>
<br>
Because they share one mechanism, they share every limitation: all of them fail silently on self-invocation, on <code>final</code> methods, on <code>private</code> methods, and on objects created with <code>new</code>. Learn the rule once and you have debugged five features.<br>`,
            codeExamples: [
                `// This is roughly what Spring's TransactionInterceptor does.
// It is the aspect you already know how to write.
public Object invoke(MethodInvocation invocation) throws Throwable {

    TransactionStatus tx = txManager.getTransaction(definition);
    try {
        Object result = invocation.proceed();          // the target method
        txManager.commit(tx);
        return result;
    } catch (RuntimeException | Error ex) {
        txManager.rollback(tx);                        // default: unchecked only
        throw ex;
    } catch (Exception checked) {
        txManager.commit(tx);                          // <-- the famous surprise
        throw checked;
    }
}

// Which is exactly why:
//  - a CHECKED exception commits by default (use rollbackFor = Exception.class)
//  - catching the exception inside your own method means the
//    interceptor never sees it, and the transaction commits
//  - self-invocation skips the whole thing`,
                `// Practical diagnosis, using the same knowledge for any of them:
//
// "@Cacheable is not caching"          -> called from within the same bean?
// "@Async runs on the calling thread"  -> same. Or the method is final,
//                                         or the return type is not void
//                                         / Future / CompletableFuture.
// "@PreAuthorize allows everything"    -> same, or @EnableMethodSecurity missing
// "@Transactional does nothing"        -> same, or the method is not public,
//                                         or you are on a non-transactional
//                                         DataSource
//
// One question answers all four: DID THE CALL CROSS A PROXY?
//
// Confirm it at runtime:
System.out.println(AopUtils.isAopProxy(bean));       // true if proxied
System.out.println(AopUtils.isCglibProxy(bean));     // true if CGLIB
System.out.println(AopUtils.getTargetClass(bean));   // the real class`
            ]
        },
        {
            content: `<h3>The Practical Pattern: a Custom <code>@Auditable</code> Annotation</h3>
Package-based pointcuts such as <code>execution(* com.jsl.service..*(..))</code> are a maintenance liability: they silently start advising code that someone adds to that package next year, and reading a service method tells you nothing about what wraps it.<br><br>

A custom annotation with an <code>@annotation</code> pointcut inverts that. The target <strong>opts in</strong> visibly, the pointcut is narrow and fast, and the annotation can carry parameters the advice needs. This is how <code>@Transactional</code> and <code>@Cacheable</code> are designed, and it is the pattern to reach for in your own code.<br>`,
            codeExamples: [
                `// 1. The annotation - RUNTIME retention is mandatory, or the
//    pointcut can never see it.
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Auditable {
    String action();                               // e.g. "TRANSFER_FUNDS"
    boolean logArguments() default true;
    boolean logResult() default false;             // results may hold PII
}`,
                `// 2. The aspect. Binding the annotation as a parameter gives the
//    advice access to its attributes.
@Aspect
@Component
@Order(20)
public class AuditAspect {

    private final AuditRepository auditRepository;

    public AuditAspect(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    @Around("@annotation(auditable)")               // name matches the parameter
    public Object audit(ProceedingJoinPoint pjp, Auditable auditable) throws Throwable {

        AuditEntry entry = new AuditEntry();
        entry.setAction(auditable.action());
        entry.setMethod(pjp.getSignature().toShortString());
        entry.setUsername(currentUsername());
        entry.setStartedAt(Instant.now());
        if (auditable.logArguments()) {
            entry.setArguments(redact(pjp.getArgs()));   // never log raw PII
        }

        try {
            Object result = pjp.proceed();
            entry.setOutcome("SUCCESS");
            if (auditable.logResult()) entry.setResult(String.valueOf(result));
            return result;                               // <-- always return it
        } catch (Throwable ex) {
            entry.setOutcome("FAILURE");
            entry.setError(ex.getClass().getName() + ": " + ex.getMessage());
            throw ex;                                    // never swallow
        } finally {
            entry.setDurationMs(...);
            // Write on a REQUIRES_NEW transaction, or a rollback of the
            // business transaction erases the record of the failed attempt -
            // which is precisely the record an audit log exists to keep.
            auditWriter.saveIndependently(entry);
        }
    }
}`,
                `// 3. Usage - the intent is visible at the call site
@Service
public class AccountService {

    @Auditable(action = "TRANSFER_FUNDS", logResult = false)
    @Transactional
    public TransferReceipt transfer(Long from, Long to, BigDecimal amount) { ... }
}

// OUTPUT - a row in the audit table:
// | id | action         | method                        | username | outcome | ms  |
// |  1 | TRANSFER_FUNDS | AccountService.transfer(..)   | ajay     | SUCCESS |  61 |
// |  2 | TRANSFER_FUNDS | AccountService.transfer(..)   | meera    | FAILURE |   4 |
//
// Note both annotations on one method: @Auditable at @Order(20) wraps
// the transaction interceptor (LOWEST_PRECEDENCE), so the audit aspect
// sees the commit result. Reverse the order and you would record
// SUCCESS for a transaction that later rolled back.`
            ]
        },
        {
            content: `<h3>Cost, and Why a Broad Pointcut Is a Bad Idea</h3>
A single advised call costs very little - a proxy dispatch and an interceptor chain walk, on the order of tens to hundreds of nanoseconds. The problem is never one call. It is the pointcut that matches a hundred thousand of them.<br><br>

<table>
<tr><th>Pointcut</th><th>Problem</th></tr>
<tr><td><code>execution(* com..*.*(..))</code></td><td>Matches every method of every bean, including repositories, converters and getters. Every bean becomes a proxy; hot loops calling a getter a million times pay the interceptor cost a million times.</td></tr>
<tr><td><code>execution(public * *(..))</code></td><td>The same, with no package limit at all. Spring must evaluate this against every candidate method of every bean at startup.</td></tr>
<tr><td>Logging every argument</td><td><code>Arrays.toString(pjp.getArgs())</code> calls <code>toString()</code> on entities. A lazy JPA collection is initialised by the logging - extra queries, or a <code>LazyInitializationException</code> thrown from the <em>logging</em>, which then breaks a request that was working.</td></tr>
<tr><td>Advice writing to a database</td><td>An audit insert on every service call doubles your write load and adds its latency to every request.</td></tr>
</table>
<br>
<div class="border">
<strong>Guidance</strong><br>
Prefer <code>@annotation</code> - narrowest possible match, explicit opt-in.<br>
Otherwise anchor on a specific package and layer: <code>within(com.jsl.service..*) &amp;&amp; execution(public * *(..))</code>.<br>
Put <code>within(...)</code> or <code>@within(...)</code> <em>first</em> in a compound pointcut - they are cheap type-level checks that let AspectJ discard most classes before the expensive <code>execution</code> signature match.<br>
Never advise repositories or entities. Never advise getters.<br>
Guard expensive advice: <code>if (log.isDebugEnabled())</code> before building any log string.<br>
For real production metrics, use Micrometer's <code>@Timed</code> rather than a hand-rolled aspect - it aggregates into histograms instead of writing a line per call.
</div>`,
            codeExamples: [
                `// BAD - matches everything, including framework beans
@Around("execution(* com..*.*(..))")
public Object logEverything(ProceedingJoinPoint pjp) throws Throwable { ... }

// OUTPUT:
// - startup slows measurably (every bean is examined and proxied)
// - a single HTTP request produces 4,000 log lines
// - p99 latency rises, and the aspect itself now dominates your
//   own profiler output - the monitoring is the bottleneck
// - and if it matches a Spring infrastructure bean, you can get
//   BeanCurrentlyInCreationException at startup

// BETTER - explicit layer, public entry points only
@Around("within(com.jsl.service..*) && execution(public * *(..))")

// BEST - opt in
@Around("@annotation(com.jsl.annotation.Timed)")`,
                `// Aspects and testing
//
// 1. A plain unit test with 'new OrderService(...)' has NO proxy, so
//    NO advice, NO transaction and NO cache. That is usually what you
//    want - but never conclude from a passing unit test that an
//    aspect works.
//
// 2. @WebMvcTest does not load service beans, so service aspects do
//    not run either. Use @SpringBootTest to exercise them.
//
// 3. Test the aspect itself against a small target bean:
@SpringBootTest(classes = { AuditAspect.class, DummyService.class })
@EnableAspectJAutoProxy
class AuditAspectTest {

    @Autowired DummyService service;
    @MockBean  AuditRepository auditRepository;

    @Test
    void records_a_failure_and_rethrows() {
        assertThatThrownBy(() -> service.boom())
                .isInstanceOf(IllegalStateException.class);   // NOT swallowed
        verify(auditRepository).save(argThat(e -> "FAILURE".equals(e.getOutcome())));
    }
}
// Asserting the exception still propagates matters: an aspect that
// accidentally swallows exceptions turns every failure into a
// silent success, and nothing else in the system will notice.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a cross-cutting concern?</td><td>A requirement affecting many modules but belonging to none - logging, security, transactions, caching, auditing. Inheritance cannot express it because it runs across the hierarchy rather than down it.</td></tr>
<tr><td>Define aspect, join point, pointcut and advice.</td><td>An aspect is the module holding the concern; a join point is a place where advice could run (in Spring AOP, always a method execution); a pointcut is the expression selecting join points; advice is the code that runs there.</td></tr>
<tr><td>How is Spring AOP implemented?</td><td>By runtime proxies - JDK dynamic proxies or CGLIB subclasses - not by bytecode weaving. Advice runs in the proxy as it forwards the call to the target bean.</td></tr>
<tr><td>Spring AOP vs AspectJ?</td><td>Spring AOP advises only public method executions on Spring beans and needs no build step. AspectJ weaves bytecode and can advise constructors, fields, static and private methods, and non-Spring objects, at the cost of a compile-time or load-time agent.</td></tr>
<tr><td>Why does <code>@Transactional</code> silently do nothing sometimes?</td><td>The call did not cross the proxy: self-invocation within the same bean, a <code>final</code>, <code>private</code> or <code>static</code> method, or an object created with <code>new</code>.</td></tr>
<tr><td>What is self-invocation and how do you fix it?</td><td>One method of a bean calling another through <code>this</code>, bypassing the proxy. Fix by moving the method to a separate bean (preferred), self-injecting with <code>@Lazy</code>, using <code>AopContext.currentProxy()</code>, or switching to AspectJ weaving.</td></tr>
<tr><td>JDK dynamic proxy or CGLIB - how does Spring choose?</td><td>Classically JDK when the bean implements an interface, CGLIB otherwise. Spring Boot sets <code>proxy-target-class=true</code>, so CGLIB is the default either way.</td></tr>
<tr><td>Why can a <code>final</code> method not be advised?</td><td>CGLIB proxies by generating a subclass and overriding methods; a <code>final</code> method cannot be overridden, so the call reaches the inherited original with no interception - and no warning is issued.</td></tr>
<tr><td>Which advice types exist?</td><td><code>@Before</code>, <code>@After</code>, <code>@AfterReturning</code>, <code>@AfterThrowing</code> and <code>@Around</code>. Only <code>@Around</code> can prevent the call, change arguments, or alter the return value.</td></tr>
<tr><td>Difference between <code>@After</code> and <code>@AfterReturning</code>?</td><td><code>@After</code> is a <code>finally</code> block and runs on both the normal and exceptional paths; <code>@AfterReturning</code> runs only on normal completion and can bind the returned value.</td></tr>
<tr><td>What happens if <code>@Around</code> does not return <code>proceed()</code>'s result?</td><td>The target method runs but the caller receives <code>null</code>. It compiles cleanly, which makes it the commonest AOP bug.</td></tr>
<tr><td>What does <code>@Order</code> mean for <code>@Around</code> advice?</td><td>Lower value means higher precedence and an <em>outer</em> position: it runs first entering and last leaving. Ordering between advice inside a single aspect class is not guaranteed - split them into separate aspects.</td></tr>
<tr><td>Which Spring features are built on AOP?</td><td><code>@Transactional</code>, <code>@Cacheable</code>, <code>@Async</code>, <code>@Retryable</code>, method-level Spring Security, and method validation - which is why they all share the same proxy limitations.</td></tr>
<tr><td>Why is <code>execution(* com..*.*(..))</code> a bad pointcut?</td><td>It proxies and intercepts every method of every bean, including getters and repositories in hot loops. It slows startup, floods the logs, and can break startup on infrastructure beans. Prefer <code>@annotation</code> or a package-anchored pointcut on public methods.</td></tr>
<tr><td>Why is <code>@Aspect</code> alone not enough?</td><td><code>@Aspect</code> is an AspectJ annotation and does not create a bean. Without <code>@Component</code> (or an explicit <code>@Bean</code>) Spring never instantiates the class and never reads its advice.</td></tr>
</table>`
        }
    ]
};
