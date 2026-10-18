import { Topic } from '../coreJava';

export const springBootSchedulingAsync: Topic = {
    id: 'spring-boot-scheduling-async',
    name: 'Scheduling & Async Processing',
    beginner: [
        {
            content: `<h3>Two Different Problems</h3>
Both of these are about work that does not happen inside a request, and they are routinely confused.<br><br>

<table>
<tr><th>Mechanism</th><th>Purpose</th></tr>
<tr><td><strong>Scheduling</strong> (<code>@Scheduled</code>)</td><td>Work that runs on a clock, with nobody asking for it. Nightly reports, expiring old sessions, polling an inbox.</td></tr>
<tr><td><strong>Async</strong> (<code>@Async</code>)</td><td>Work triggered by a caller who should not wait for it. Sending an email after signup, generating a PDF, calling three services at once.</td></tr>
</table>
<br>
They are separate features with separate switches - <code>@EnableScheduling</code> and <code>@EnableAsync</code> - and separate thread pools. Turning on one does not turn on the other.<br>`,
            codeExamples: [
                `// Why it matters, from the caller's point of view:

// Synchronous signup - the user waits for the email server
POST /api/signup
  save user            120 ms
  send welcome email  2400 ms   <-- SMTP is slow today
  ---------------------------
  response            2520 ms

// Asynchronous signup - the email is handed to another thread
POST /api/signup
  save user            120 ms
  submit email task      1 ms
  ---------------------------
  response             121 ms
  (the email is sent on a pool thread a moment later)`
            ]
        },
        {
            content: `<h3>A First Scheduled Job</h3>
<code>@EnableScheduling</code> on a configuration class, then <code>@Scheduled</code> on a method of any Spring bean. Boot scans the beans at startup and registers the methods with a <code>TaskScheduler</code>.<br>`,
            codeExamples: [
                `@SpringBootApplication
@EnableScheduling                   // without this, nothing ever fires
public class ReportingApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReportingApplication.class, args);
    }
}`,
                `@Component
public class SessionCleanupJob {

    private static final Logger log =
            LoggerFactory.getLogger(SessionCleanupJob.class);

    private final SessionRepository repository;

    public SessionCleanupJob(SessionRepository repository) {
        this.repository = repository;
    }

    @Scheduled(fixedDelay = 60_000)          // 60 s after the last finish
    public void purgeExpiredSessions() {
        int removed = repository.deleteExpiredBefore(Instant.now());
        log.info("purged {} expired sessions", removed);
    }
}

// OUTPUT:
// 10:00:03.114  INFO [scheduling-1] purged 0 expired sessions
// 10:01:03.121  INFO [scheduling-1] purged 4 expired sessions
// 10:02:03.129  INFO [scheduling-1] purged 1 expired sessions
//
// Note the thread name: scheduling-1. There is only one - see the
// Expert tab, because that single thread is a real constraint.`
            ]
        },
        {
            content: `<h3><code>fixedRate</code> vs <code>fixedDelay</code> vs <code>cron</code></h3>
Three ways to say when. They agree while the task is quick and diverge the moment it is not.<br><br>

<table>
<tr><th>Attribute</th><th>Meaning</th></tr>
<tr><td>fixedDelay</td><td>Wait N ms after the previous run <strong>finished</strong>. The gap between runs is constant; the start times drift.</td></tr>
<tr><td>fixedRate</td><td>Start every N ms measured from the previous <strong>start</strong>. Start times are regular - if the task can keep up.</td></tr>
<tr><td>cron</td><td>Fire at wall-clock times described by an expression. The only option that can express "03:00 every weekday".</td></tr>
<tr><td>initialDelay</td><td>Milliseconds to wait after startup before the first run. Combines with the first two.</td></tr>
</table>
<br>
Here is the difference drawn out, for a task that sometimes takes longer than its interval:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Interval 5s.  Run A takes 2s, run B takes 8s (slow), run C takes 2s.
Time ->   0    2    4    6    8   10   12   14   16   18   20   22
          |....|....|....|....|....|....|....|....|....|....|....|

fixedDelay = 5000     (5s AFTER the previous run ENDS)
   A [==]              start 0, end 2
        .....          wait 5
             B [========]      start 7,  end 15
                       .....   wait 5
                            C [==]  start 20, end 22
   Gap between runs: always exactly 5s. Start times drift later.

fixedRate = 5000      (every 5s from the previous START)
   A [==]              start 0, end 2
        B [========]   start 5, end 13      <-- overran its slot
                  C [==]  start 13, NOT 10
   The 10s tick is MISSED, then C runs immediately at 13.
   By default one thread runs one task at a time, so a slow run
   does not overlap the next - it delays it.

cron = "*/5 * * * * *"  (at 0,5,10,15,20 seconds)
   A [==]              fires 0
        B [========]   fires 5, still running at 10 and 15
                  C [==]  fires at 20 (the next tick after B ends)
   Ticks that arrive while the task is running are dropped.</pre>`,
            codeExamples: [
                `@Component
public class TimingDemo {

    // Steady gap between runs. The safe default: a slow run can
    // never queue up behind itself.
    @Scheduled(fixedDelay = 5000)
    public void withFixedDelay() { ... }

    // Steady start times, with initialDelay so it does not fire
    // while the application context is still warming up.
    @Scheduled(fixedRate = 5000, initialDelay = 10_000)
    public void withFixedRate() { ... }

    // Since Spring 6 / Boot 3, durations are clearer as strings:
    @Scheduled(fixedDelayString = "PT30S")     // ISO-8601
    public void iso() { ... }

    // Externalised so it can be changed per environment
    @Scheduled(fixedDelayString = "\${cleanup.interval.ms:60000}")
    public void configurable() { ... }
}`,
                `// Which to choose:
//
// fixedDelay  - the task's duration varies, or overlapping runs
//               would be harmful. Almost always the right default
//               for polling and cleanup.
//
// fixedRate   - the cadence matters more than the spacing, e.g.
//               publishing a metric every 10 s. Be aware that a
//               run overrunning the period means missed ticks -
//               they are dropped, not queued up and replayed.
//
// cron        - the requirement is expressed in wall-clock terms:
//               "01:00 every day", "every Monday at 06:30".
//               A fixedRate of 86_400_000 is NOT the same as
//               "daily at 01:00": it drifts with every restart.`
            ]
        },
        {
            content: `<h3>Cron: Spring Uses SIX Fields, Not Five</h3>
This is the classic mistake. Unix crontab has five fields starting at minutes. <strong>Spring's cron has six, and the first one is SECONDS.</strong> Paste a working crontab line into <code>@Scheduled</code> and it is interpreted one field to the left.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Spring (6 fields)
  ┌───────────── second        0-59
  │ ┌─────────── minute        0-59
  │ │ ┌───────── hour          0-23
  │ │ │ ┌─────── day of month  1-31
  │ │ │ │ ┌───── month         1-12  or JAN-DEC
  │ │ │ │ │ ┌─── day of week   0-7   or SUN-SAT (0 and 7 are Sunday)
  │ │ │ │ │ │
  *  *  *  *  *  *

Unix crontab (5 fields) - NO seconds field
  minute hour day-of-month month day-of-week

  "0 3 * * *"  in crontab  =  03:00 every day
  "0 3 * * *"  in Spring   =  INVALID - only 5 fields
                              IllegalArgumentException at startup

  "0 0 3 * * *" is the Spring equivalent: second 0, minute 0, hour 3.</pre>
<br>
Getting it wrong usually fails loudly at startup, which is a mercy. The dangerous case is an expression that is valid in both and means different things.<br>`,
            codeExamples: [
                `@Scheduled(cron = "0 0 3 * * *")        // 03:00 every day
@Scheduled(cron = "0 */15 * * * *")     // every 15 minutes, on the quarter
@Scheduled(cron = "0 0 9-17 * * MON-FRI")  // hourly, 09:00-17:00, weekdays
@Scheduled(cron = "0 30 6 1 * *")       // 06:30 on the 1st of each month
@Scheduled(cron = "0 0 0 L * *")        // last day of the month at midnight
@Scheduled(cron = "0 0 12 * * SUN")     // Sunday noon

// Macros, which read better than the numbers:
@Scheduled(cron = "@hourly")            // = 0 0 * * * *
@Scheduled(cron = "@daily")             // = 0 0 0 * * *
@Scheduled(cron = "@weekly")            // = 0 0 0 * * 0
@Scheduled(cron = "@monthly")           // = 0 0 0 1 * *

// Disable a job by configuration - a real and useful trick:
@Scheduled(cron = "\${report.cron:-}")   // "-" means never run
public void nightlyReport() { ... }`,
                `// THE SILENT ONE. Valid as both 5-field and 6-field, and the
// meanings are wildly different.
@Scheduled(cron = "0 0 * * *")
// Only 4 fields -> IllegalArgumentException, caught immediately.

@Scheduled(cron = "*/5 * * * * *")
// Spring: every 5 SECONDS.
// A developer expecting crontab semantics reads "every 5 minutes"
// and the job runs 60x more often than intended. On a job that
// sends email or calls a paid API, that is discovered by the bill.

// OUTPUT of a wrong 6-field expression at startup:
// java.lang.IllegalStateException: Encountered invalid @Scheduled
//   method 'nightly': For input string: "0 3 * * *"
// Caused by: java.lang.IllegalArgumentException:
//   Cron expression must consist of 6 fields (found 5 in "0 3 * * *")`,
                `// Time zones. The default is the SERVER's default zone, which is
// often UTC in a container and local on a laptop - so "runs at
// 03:00" means different things in the two places.
@Scheduled(cron = "0 0 3 * * *", zone = "Asia/Kolkata")
public void nightlyReport() { ... }

// State the zone explicitly for anything a business cares about.
// And remember DST: in a zone that observes it, a job at 02:30
// runs twice on one day of the year and not at all on another.
// A job that must run exactly once per day should be scheduled
// outside the 01:00-03:00 window.`
            ]
        },
        {
            content: `<h3>Async: <code>@EnableAsync</code> and <code>@Async</code></h3>
<code>@Async</code> makes a method return to its caller immediately while the body runs on another thread. The switch is <code>@EnableAsync</code>, and as with scheduling, without it the annotation is ignored and every call is an ordinary synchronous one.<br>`,
            codeExamples: [
                `@SpringBootApplication
@EnableAsync                        // without this, @Async is ignored
public class SignupApplication { ... }`,
                `@Service
public class NotificationService {

    @Async
    public void sendWelcomeEmail(String address) {
        log.info("sending to {}", address);
        mailSender.send(buildWelcome(address));     // ~2.4 seconds
        log.info("sent to {}", address);
    }
}

@Service
public class SignupService {

    public User signup(SignupRequest request) {
        User user = repository.save(new User(request));
        notifications.sendWelcomeEmail(user.getEmail());  // returns at once
        return user;
    }
}

// OUTPUT:
// 10:00:00.120 [http-nio-8080-exec-1] user 91 saved
// 10:00:00.121 [http-nio-8080-exec-1] responding 201
// 10:00:00.122 [task-1] sending to ajay@example.com
// 10:00:02.530 [task-1] sent to ajay@example.com
//
// The thread names tell the story: the HTTP thread finished the
// response before the email had started. If a thread name shows
// http-nio-... doing the mail work, @Async is not taking effect.`
            ]
        },
        {
            content: `<h3>Getting a Result Back: <code>CompletableFuture</code></h3>
A <code>void</code> async method is fire-and-forget. When the caller does need the answer - just not right now - return <code>CompletableFuture&lt;T&gt;</code>. Spring unwraps the value your method returns and completes the future for the caller.<br><br>

This is what makes independent remote calls run in parallel instead of one after another.<br>`,
            codeExamples: [
                `@Service
public class ProfileService {

    @Async
    public CompletableFuture<Profile> loadProfile(Long userId) {
        Profile p = profileClient.fetch(userId);        // ~300 ms
        return CompletableFuture.completedFuture(p);
    }

    @Async
    public CompletableFuture<List<Order>> loadOrders(Long userId) {
        return CompletableFuture.completedFuture(
                orderClient.fetch(userId));             // ~450 ms
    }

    @Async
    public CompletableFuture<Preferences> loadPreferences(Long userId) {
        return CompletableFuture.completedFuture(
                prefsClient.fetch(userId));             // ~200 ms
    }
}`,
                `@RestController
public class DashboardController {

    @GetMapping("/api/dashboard/{userId}")
    public Dashboard dashboard(@PathVariable Long userId) throws Exception {

        // All three start immediately - nothing blocks yet
        CompletableFuture<Profile> profile  = service.loadProfile(userId);
        CompletableFuture<List<Order>> orders = service.loadOrders(userId);
        CompletableFuture<Preferences> prefs = service.loadPreferences(userId);

        // Now wait for all of them, with a timeout
        CompletableFuture.allOf(profile, orders, prefs)
                         .get(2, TimeUnit.SECONDS);

        return new Dashboard(profile.join(), orders.join(), prefs.join());
    }
}

// OUTPUT sequential:  300 + 450 + 200 = 950 ms
// OUTPUT parallel:    max(300, 450, 200) = ~460 ms
//
// ALWAYS use the timed get(). A plain get() or join() waits
// forever, so one hung downstream service pins the HTTP thread
// until the container runs out of them.`,
                `// Composing without blocking at all - each stage runs on the
// pool as its input completes.
service.loadProfile(userId)
       .thenApply(Profile::getManagerId)
       .thenCompose(service::loadProfile)
       .thenAccept(manager -> log.info("manager: {}", manager.getName()))
       .exceptionally(ex -> {
           log.error("profile chain failed", ex);   // handle it HERE
           return null;
       });

// Without the exceptionally() block, a failure inside the chain is
// captured in the future and, if nobody joins it, disappears
// entirely. No stack trace, no log line - the work just never
// happened.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Default Scheduler Is One Thread</h3>
Spring's scheduling support, when nothing else is configured, uses a <code>ThreadPoolTaskScheduler</code> with a pool size of <strong>one</strong>. Every <code>@Scheduled</code> method in the application shares it. One slow job therefore blocks every other job in the application - including jobs it has nothing to do with.<br><br>

The symptom is a scheduled task that "sometimes does not run", or runs minutes after its cron time, and the cause is a different job entirely.<br>`,
            codeExamples: [
                `@Component
public class Jobs {

    @Scheduled(cron = "0 0 * * * *")        // hourly
    public void rebuildSearchIndex() {
        Thread.sleep(25 * 60 * 1000);        // takes 25 minutes
    }

    @Scheduled(fixedRate = 60_000)          // expected: every minute
    public void publishHeartbeat() {
        monitoring.ping();
    }
}

// OUTPUT:
// 10:00:00 [scheduling-1] rebuildSearchIndex started
// 10:00:00 (heartbeat tick missed - the single thread is busy)
// 10:01:00 (missed) ... 10:24:00 (missed)
// 10:25:00 [scheduling-1] rebuildSearchIndex finished
// 10:25:00 [scheduling-1] publishHeartbeat        <-- 25 min late
//
// Monitoring declares the service dead for 25 minutes every hour,
// and the heartbeat code is completely innocent.`,
                `// FIX - give the scheduler a pool.
# application.properties
spring.task.scheduling.pool.size=5
spring.task.scheduling.thread-name-prefix=sched-
# Boot 3.2+: let in-flight jobs finish on shutdown
spring.task.scheduling.shutdown.await-termination=true
spring.task.scheduling.shutdown.await-termination-period=30s`,
                `// Or build it, when the defaults are not enough.
@Configuration
@EnableScheduling
public class SchedulingConfig implements SchedulingConfigurer {

    @Override
    public void configureTasks(ScheduledTaskRegistrar registrar) {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5);
        scheduler.setThreadNamePrefix("sched-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(30);
        // Never let a job's exception kill the thread silently
        scheduler.setErrorHandler(t ->
                log.error("scheduled task failed", t));
        scheduler.initialize();
        registrar.setTaskScheduler(scheduler);
    }
}

// A pool of N still runs each individual job one at a time - a
// long run of job A delays the NEXT run of job A, but no longer
// delays jobs B and C. That is exactly the isolation you want.
//
// Size it to the number of jobs that can plausibly overlap, not
// to the total number of @Scheduled methods.`
            ]
        },
        {
            content: `<h3>The Rules a <code>@Scheduled</code> Method Must Obey</h3>
The scheduler calls the method with no arguments and ignores whatever it returns. There is no mechanism to supply a parameter, and nowhere for a return value to go.<br><br>

<table>
<tr><th>Rule</th><th>What happens if broken</th></tr>
<tr><td>No arguments</td><td><code>IllegalStateException</code> at startup: "Only no-arg methods may be annotated with @Scheduled".</td></tr>
<tr><td>Return <code>void</code></td><td>A non-void return is accepted and discarded. Returning <code>CompletableFuture</code> from a scheduled method fools nobody - it is never joined, so a failure inside it is swallowed.</td></tr>
<tr><td>Public, on a Spring bean</td><td>The proxy cannot see a private method, and a non-bean is never scanned. Fails silently - nothing is registered, nothing warns.</td></tr>
<tr><td>Handle its own exceptions</td><td>An uncaught exception is logged by the error handler, and for <code>fixedRate</code>/<code>fixedDelay</code> the task is <strong>cancelled</strong> - it never runs again until restart.</td></tr>
</table>`,
            codeExamples: [
                `// WRONG
@Scheduled(fixedRate = 60_000)
public void process(String batchId) { ... }
// OUTPUT at startup:
// java.lang.IllegalStateException: Encountered invalid @Scheduled
//   method 'process': Only no-arg methods may be annotated with
//   @Scheduled

// RIGHT - the method resolves its own inputs
@Scheduled(fixedRate = 60_000)
public void process() {
    for (String batchId : repository.findPendingBatchIds()) {
        processOne(batchId);
    }
}`,
                `// The cancellation trap - worth internalising.
@Scheduled(fixedDelay = 60_000)
public void poll() {
    List<Message> messages = queueClient.receive();   // may throw
    messages.forEach(this::handle);
}

// OUTPUT the first time the queue is briefly unreachable:
// 10:04:00 ERROR Unexpected error occurred in scheduled task
//   java.net.SocketTimeoutException: Read timed out
// ... and then nothing. Ever. The task is gone from the scheduler.
// The queue recovers at 10:05 and the poller never notices.

// RIGHT - the job's own try/catch is not optional
@Scheduled(fixedDelay = 60_000)
public void poll() {
    try {
        queueClient.receive().forEach(this::handle);
    } catch (Exception e) {
        log.error("poll failed, will retry next cycle", e);
    }
}
// The next cycle runs normally. A transient outage stays transient.`
            ]
        },
        {
            content: `<h3><code>@Async</code> Is a Proxy Too</h3>
Everything true of <code>@Cacheable</code> and <code>@Transactional</code> is true here. <code>@Async</code> is implemented by a proxy that submits the invocation to an executor. A call that does not cross the proxy runs on the caller's thread, synchronously, and the annotation may as well not be there.<br>`,
            codeExamples: [
                `@Service
public class ReportService {

    public void generateAll(List<Long> ids) {
        for (Long id : ids) {
            generateOne(id);          // 'this' - NOT the proxy
        }
    }

    @Async
    public void generateOne(Long id) {
        heavyWork(id);                // 4 seconds each
    }
}

// generateAll with 10 ids
// OUTPUT:
// [http-nio-8080-exec-1] report 1 ... report 10
// Response after 40 seconds. Every call ran on the HTTP thread.
// Expected: [task-1] .. [task-8], response immediate.
//
// The thread name in the log is the diagnostic. If async work
// appears on http-nio-* or scheduling-*, it is not async.

// FIX - put the async method on a different bean
@Service
public class ReportOrchestrator {
    private final ReportWorker worker;      // injected proxy
    public void generateAll(List<Long> ids) {
        ids.forEach(worker::generateOne);   // crosses the proxy
    }
}`,
                `// The other silent one: @Async on a method returning a plain value.
@Async
public Report generate(Long id) {           // WRONG return type
    return buildReport(id);
}

Report r = service.generate(42L);
// OUTPUT:
// r == null
// Exception in thread "main" java.lang.NullPointerException
//
// The proxy submits the task and must return IMMEDIATELY, before
// the real value exists. It has nothing to hand back, so it
// returns null (or 0 / false for primitives). The report is still
// built, on a pool thread - the caller just never sees it.

// Legal @Async return types:
//   void                       fire and forget
//   CompletableFuture<T>       the usual choice
//   Future<T>                  older, no composition
//   ListenableFuture<T>        deprecated in Spring 6
//   Mono / Flux                reactive types, if you are using them`
            ]
        },
        {
            content: `<h3>The Default Executor Is Unbounded</h3>
When <code>@EnableAsync</code> finds no <code>Executor</code> bean, older Spring versions fall back to <code>SimpleAsyncTaskExecutor</code>. It is not a pool. It creates a <strong>new thread for every task</strong> and never reuses one.<br><br>

Under normal load this is merely wasteful. Under a burst it is fatal: a thousand queued tasks become a thousand OS threads, each with a stack of around 1 MB.<br>`,
            codeExamples: [
                `// What SimpleAsyncTaskExecutor does under load:
// 10:00:00 [task-1]    ...
// 10:00:00 [task-2]    ...
// 10:00:01 [task-1847] ...
// 10:00:01 [task-4192] ...
// OUTPUT:
// java.lang.OutOfMemoryError: unable to create new native thread
//
// The whole JVM dies, not only the async work. And it degrades
// long before that: thousands of runnable threads mean the OS
// spends its time context-switching rather than doing work.
//
// Spring Boot's own auto-configuration supplies a bounded
// ThreadPoolTaskExecutor (the 'applicationTaskExecutor' bean), so
// a plain Boot app is usually safe. Define your own anyway: the
// defaults are queueCapacity = Integer.MAX_VALUE, which trades
// thread exhaustion for unbounded memory growth in the queue.`,
                `@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("emailExecutor")
    public Executor emailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);        // always alive
        executor.setMaxPoolSize(16);        // ceiling
        executor.setQueueCapacity(100);     // BOUNDED - the key setting
        executor.setThreadNamePrefix("email-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        // Queue full: run the task on the CALLING thread. This
        // applies natural back-pressure instead of dropping work.
        executor.setRejectedExecutionHandler(
                new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

@Async("emailExecutor")                     // name the pool
public void sendWelcomeEmail(String to) { ... }`,
                `// A ThreadPoolExecutor's growth order surprises people:
//
//   1. Threads are created up to CORE size.
//   2. Then tasks go into the QUEUE.
//   3. Only when the queue is FULL are threads added, up to MAX.
//
// So corePoolSize=4, maxPoolSize=100, queueCapacity=10000 means
// the pool almost never exceeds 4 threads - 10 000 tasks queue up
// first. The max looks generous and is unreachable.
//
// For latency-sensitive work: a small queue and a higher max.
// For throughput work: a larger queue and a modest max.
//
// Separate pools per concern. One shared pool lets a slow email
// server starve PDF generation of every thread it has.`
            ]
        },
        {
            content: `<h3>Exceptions in <code>@Async void</code> Methods Vanish</h3>
There is no caller waiting, so there is nowhere to throw. A <code>CompletableFuture</code> return type captures the exception for whoever joins it. A <code>void</code> async method has no such channel: without an <code>AsyncUncaughtExceptionHandler</code> the failure is lost.<br>`,
            codeExamples: [
                `@Async
public void reconcile(Long accountId) {
    throw new IllegalStateException("ledger mismatch on " + accountId);
}

// OUTPUT with no handler configured:
// (Spring logs it at ERROR from SimpleAsyncUncaughtExceptionHandler,
//  but with no business context - and in many setups the log line
//  is at a level nobody watches. Nothing propagates to the caller,
//  nothing increments a metric, no alert fires. The reconciliation
//  simply did not happen and everything looks healthy.)`,
                `@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        return taskExecutor();
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, params) -> {
            log.error("async {} failed, args={}",
                      method.getName(), Arrays.toString(params), throwable);
            metrics.counter("async.failures",
                            "method", method.getName()).increment();
        };
    }
}
// OUTPUT:
// ERROR async reconcile failed, args=[91427]
//   java.lang.IllegalStateException: ledger mismatch on 91427
//   at com.example.LedgerService.reconcile(...)
// ... and the async.failures counter is now visible to alerting.
//
// This handler applies ONLY to void methods. A method returning
// CompletableFuture stores the exception in the future instead -
// which is invisible in a different way if nobody ever joins it.`
            ]
        },
        {
            content: `<h3>Multi-Instance: Every Replica Fires the Job</h3>
<code>@Scheduled</code> is a property of the JVM, not of the system. Deploy four replicas behind a load balancer and each one has its own scheduler with the same cron expression. At 03:00, <strong>four</strong> nightly jobs start.<br><br>

Depending on the job that means four copies of every invoice email, four charges on a card, or four workers fighting over the same rows.<br>`,
            codeExamples: [
                `// OUTPUT at 03:00 with four pods:
// pod-a  03:00:00 sending 12 480 invoice emails
// pod-b  03:00:00 sending 12 480 invoice emails
// pod-c  03:00:00 sending 12 480 invoice emails
// pod-d  03:00:00 sending 12 480 invoice emails
//
// 49 920 emails. Every customer receives four copies.
//
// This never appears in development, where there is one instance.
// It appears the day the deployment is scaled to two.`,
                `// FIX 1 - ShedLock. A distributed lock held in a store the
// instances share (JDBC, Redis, Mongo). The usual answer.
<dependency>
    <groupId>net.javacrumbs.shedlock</groupId>
    <artifactId>shedlock-spring</artifactId>
</dependency>

@Configuration
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "PT30M")
public class SchedulerLockConfig {
    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(dataSource);
    }
}

@Scheduled(cron = "0 0 3 * * *")
@SchedulerLock(name = "nightlyInvoices",
               lockAtLeastFor = "PT5M",     // guards against clock skew
               lockAtMostFor = "PT30M")     // released if the pod dies
public void sendInvoices() { ... }

// OUTPUT:
// pod-a 03:00:00 acquired lock 'nightlyInvoices', sending 12 480
// pod-b 03:00:00 could not acquire lock, skipping
// pod-c 03:00:00 could not acquire lock, skipping
// pod-d 03:00:00 could not acquire lock, skipping
//
// lockAtMostFor matters: if pod-a is killed mid-run the lock is
// released after 30 minutes, so the job is not blocked forever.
// Set it comfortably above the longest plausible run.`,
                `// FIX 2 - claim work with the database, so concurrency is fine.
// Each instance takes a disjoint slice; N runners are a feature.
@Modifying
@Query(value = """
    UPDATE invoice SET status = 'SENDING', claimed_by = :instance
    WHERE id IN (
        SELECT id FROM invoice WHERE status = 'PENDING'
        ORDER BY id LIMIT 100
        FOR UPDATE SKIP LOCKED)
    """, nativeQuery = true)
int claimBatch(@Param("instance") String instanceId);
// FOR UPDATE SKIP LOCKED is the important part - concurrent
// claimers step over each other's rows instead of blocking.

// FIX 3 - leader election (Spring Integration's LeaderInitiator,
// a Kubernetes lease, ZooKeeper). One instance is the leader and
// runs all schedules. Correct, but heavier than ShedLock and it
// concentrates every job on one pod.

// FIX 4 - do not schedule inside the application at all. A
// Kubernetes CronJob or an external scheduler calls a secured
// endpoint. The job runs once by construction, and it is visible
// and re-runnable from outside the application.`
            ]
        },
        {
            content: `<h3>Shutdown, and What Does Not Cross the Thread Boundary</h3>
Two things bite in production once the mechanics work. Tasks in flight when the process is asked to stop, and the invisible per-thread state that async work silently loses.<br><br>

<strong>Graceful shutdown.</strong> By default a pool's <code>shutdown()</code> stops accepting work but does not wait. The JVM exits and a half-written report, a partly sent batch, or an uncommitted transaction is simply gone.<br>`,
            codeExamples: [
                `executor.setWaitForTasksToCompleteOnShutdown(true);
executor.setAwaitTerminationSeconds(30);

// Together these mean: on shutdown, stop accepting new tasks, let
// the running ones finish, and wait up to 30 seconds before
// killing them. Without the second line the first waits FOREVER -
// one stuck task prevents the process from ever exiting, and the
// orchestrator eventually SIGKILLs it, which is what you were
// trying to avoid.

# The properties equivalent (Boot 2.6+ for task.execution)
spring.task.execution.shutdown.await-termination=true
spring.task.execution.shutdown.await-termination-period=30s
spring.task.scheduling.shutdown.await-termination=true
spring.task.scheduling.shutdown.await-termination-period=30s
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s

// Set the container's termination grace period ABOVE these
// numbers, or the platform kills the pod while it is still
// draining. In Kubernetes:
//   terminationGracePeriodSeconds: 45`,
                `// What does NOT propagate to an @Async thread by default:
//
//   SecurityContextHolder   the principal - it is a ThreadLocal
//   RequestContextHolder    request-scoped beans, the HttpServletRequest
//   MDC                     the logging correlation/trace id
//   TransactionSynchronizationManager
//                           the caller's transaction and EntityManager

@Async
public void audit(Long orderId) {
    String user = SecurityContextHolder.getContext()
            .getAuthentication().getName();
    // OUTPUT:
    // java.lang.NullPointerException: Cannot invoke
    //   "Authentication.getName()" because the return value of
    //   "SecurityContext.getAuthentication()" is null
}

// FIX - pass what you need as an argument. Explicit, and it works
// everywhere.
@Async
public void audit(Long orderId, String username) { ... }`,
                `// Or propagate the context deliberately.

// Security: a delegating strategy copies the context into the pool
// thread and clears it afterwards.
SecurityContextHolder.setStrategyName(
        SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
// or wrap the executor:
executor = new DelegatingSecurityContextAsyncTaskExecutor(executor);

// MDC / trace ids: wrap the task decorator.
executor.setTaskDecorator(runnable -> {
    Map<String, String> context = MDC.getCopyOfContextMap();
    return () -> {
        if (context != null) MDC.setContextMap(context);
        try { runnable.run(); }
        finally { MDC.clear(); }        // pooled threads are REUSED -
    };                                  // not clearing leaks one
});                                     // request's ids into the next`,
                `// Transactions do not cross either, and the direction of the
// mistake matters.
@Transactional
public Order place(OrderRequest request) {
    Order order = repository.save(request.toOrder());
    notifications.notifyWarehouse(order.getId());   // @Async
    return order;
}

@Async
@Transactional
public void notifyWarehouse(Long orderId) {
    // A NEW transaction on a different thread. It may start and
    // query BEFORE the caller commits.
    Order order = repository.findById(orderId).orElseThrow();
    // OUTPUT (a genuine race, intermittent under load):
    // OrderNotFoundException: 91427
}

// FIX - fire the async work only after the commit.
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
@Async
public void onOrderPlaced(OrderPlacedEvent event) {
    warehouseClient.notify(event.orderId());
}
// The row is committed and visible before the async thread looks
// for it, and the notification cannot fire for an order that was
// rolled back.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Difference between <code>fixedRate</code> and <code>fixedDelay</code>?</td><td><code>fixedDelay</code> measures from the end of the previous run, so the gap is constant; <code>fixedRate</code> measures from its start, so start times are regular and a slow run causes missed ticks.</td></tr>
<tr><td>How many fields does a Spring cron expression have?</td><td>Six. The first is <strong>seconds</strong>, unlike Unix crontab's five fields which begin at minutes. Pasting a crontab line in fails at startup, or means something different.</td></tr>
<tr><td>How big is the default scheduler pool?</td><td>One thread, shared by every <code>@Scheduled</code> method. A single long job delays all the others; set <code>spring.task.scheduling.pool.size</code>.</td></tr>
<tr><td>What are the signature rules for a <code>@Scheduled</code> method?</td><td>No arguments and <code>void</code> return, public, on a Spring bean. An argument throws <code>IllegalStateException</code> at startup.</td></tr>
<tr><td>What happens if a scheduled method throws?</td><td>The error handler logs it, and for fixed-rate and fixed-delay tasks the schedule is <strong>cancelled</strong> - it never runs again until restart. Catch exceptions inside the job.</td></tr>
<tr><td>Why does <code>@Async</code> do nothing when called from the same class?</td><td>It is proxy-based; a <code>this</code> call bypasses the proxy and runs synchronously. Move the method to another bean or self-inject with <code>@Lazy</code>.</td></tr>
<tr><td>What does an <code>@Async</code> method returning a plain object give the caller?</td><td><code>null</code> - the proxy must return before the value exists. Return <code>void</code> or <code>CompletableFuture&lt;T&gt;</code>.</td></tr>
<tr><td>Why is <code>SimpleAsyncTaskExecutor</code> unsuitable for production?</td><td>It creates a new thread per task and never reuses one, so a burst becomes thousands of OS threads and an <code>OutOfMemoryError</code>. Define a bounded <code>ThreadPoolTaskExecutor</code>.</td></tr>
<tr><td>When does a <code>ThreadPoolTaskExecutor</code> create threads beyond the core size?</td><td>Only once the queue is full. A large <code>queueCapacity</code> means <code>maxPoolSize</code> is effectively never reached.</td></tr>
<tr><td>Where do exceptions from an <code>@Async void</code> method go?</td><td>Nowhere useful unless you configure an <code>AsyncUncaughtExceptionHandler</code> via <code>AsyncConfigurer</code>. With a <code>CompletableFuture</code> return the exception is stored in the future instead.</td></tr>
<tr><td>What happens to <code>@Scheduled</code> jobs when the service runs several instances?</td><td>Every instance fires the job, so it runs N times. Fix it with a distributed lock (ShedLock), leader election, database row claiming with <code>SKIP LOCKED</code>, or an external scheduler.</td></tr>
<tr><td>How do you stop in-flight async work being lost on shutdown?</td><td><code>setWaitForTasksToCompleteOnShutdown(true)</code> with <code>setAwaitTerminationSeconds(n)</code>. Without the timeout the wait is unbounded; keep the platform's grace period above n.</td></tr>
<tr><td>Does the security context reach an <code>@Async</code> thread?</td><td>No. <code>SecurityContextHolder</code>, request-scoped beans, MDC and the caller's transaction are all thread-bound. Pass what you need as an argument, or use a delegating executor and a <code>TaskDecorator</code>.</td></tr>
<tr><td>Why can an <code>@Async</code> method fail to find a row the caller just saved?</td><td>The async thread runs in its own transaction and may query before the caller commits. Trigger the work from a <code>@TransactionalEventListener</code> with <code>AFTER_COMMIT</code>.</td></tr>
</table>`
        }
    ]
};
