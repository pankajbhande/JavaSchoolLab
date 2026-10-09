import { Topic } from '../coreJava';

export const completableFutureInJava: Topic = {
    id: 'completable-future',
    name: 'CompletableFuture in Java',

    beginner: [
        {
            content: `<h4>The Problem With Plain Future&lt;T&gt;</h4>
The <code>Future</code> returned by <code>ExecutorService.submit()</code> is very limited:
<ul>
<li><code>get()</code> <b>blocks</b>. You cannot say "run this callback when the result arrives".</li>
<li>Futures cannot be <b>chained</b>. You cannot say "when this finishes, feed its result into another async step".</li>
<li>Futures cannot be <b>combined</b>. There is no built-in way to wait for two independent futures and merge their results.</li>
<li>A plain <code>Future</code> cannot be <b>manually completed</b> from outside the task that created it.</li>
</ul>
<p><code>CompletableFuture&lt;T&gt;</code> (Java 8+) fixes all of this. It implements <code>Future&lt;T&gt;</code> and adds many composition methods.</p>`
        },
        {
            content: `<h4>Starting an Async Computation — supplyAsync / runAsync</h4>
<ul>
<li><code>CompletableFuture.supplyAsync(Supplier&lt;T&gt;)</code> runs a task asynchronously and completes with a <b>result</b>.</li>
<li><code>CompletableFuture.runAsync(Runnable)</code> runs a task asynchronously with <b>no result</b>.</li>
</ul>
<p>Both use the common <code>ForkJoinPool</code> by default. You can pass your own <code>Executor</code> as a second argument.</p>`,
            codeExamples: [
                `import java.util.concurrent.CompletableFuture;

public class SupplyAsyncDemo {
    public static void main(String[] args) throws Exception {
        CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
            return 10 * 10;
        });

        System.out.println("Doing other work while it computes...");
        System.out.println("Result: " + future.get());
    }
}
// OUTPUT:
// Doing other work while it computes...
// Result: 100`
            ]
        },
        {
            content: `<h4>Chaining With thenApply / thenAccept / thenRun</h4>
<ul>
<li><code>thenApply(Function)</code> transforms the result into a new value and returns a new <code>CompletableFuture</code>.</li>
<li><code>thenAccept(Consumer)</code> consumes the result and returns nothing (<code>CompletableFuture&lt;Void&gt;</code>).</li>
<li><code>thenRun(Runnable)</code> runs after completion and ignores the result.</li>
</ul>`,
            codeExamples: [
                `import java.util.concurrent.CompletableFuture;

public class ChainingDemo {
    public static void main(String[] args) throws Exception {
        CompletableFuture<Void> pipeline = CompletableFuture
            .supplyAsync(() -> 5)
            .thenApply(n -> n * 2)          // 5 -> 10
            .thenApply(n -> n + 1)          // 10 -> 11
            .thenAccept(n -> System.out.println("Final value: " + n));

        pipeline.get(); // wait for the whole chain to finish
    }
}
// OUTPUT:
// Final value: 11`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Combining Two Independent Futures — thenCombine</h3>
<code>thenCombine(otherFuture, BiFunction)</code> waits for <b>both</b> futures to complete (they can run concurrently) and merges their results with the given function.`,
            codeExamples: [
                `import java.util.concurrent.CompletableFuture;

public class CombineDemo {
    public static void main(String[] args) throws Exception {
        CompletableFuture<Integer> priceFuture = CompletableFuture.supplyAsync(() -> {
            return 500; // e.g. price lookup
        });

        CompletableFuture<Double> taxRateFuture = CompletableFuture.supplyAsync(() -> {
            return 0.18; // e.g. tax rate lookup
        });

        CompletableFuture<Double> totalFuture = priceFuture.thenCombine(
            taxRateFuture,
            (price, taxRate) -> price + (price * taxRate)
        );

        System.out.println("Total with tax: " + totalFuture.get());
    }
}
// OUTPUT:
// Total with tax: 590.0`
            ]
        },
        {
            content: `<h3>Exception Handling — exceptionally() and handle()</h3>
<ul>
<li><code>exceptionally(Function&lt;Throwable,T&gt;)</code> supplies a fallback value <b>only</b> if the pipeline failed. It is skipped on success.</li>
<li><code>handle(BiFunction&lt;T,Throwable,R&gt;)</code> runs on <b>both</b> success and failure. It gets the result and the exception, and one of them is <code>null</code>.</li>
</ul>`,
            codeExamples: [
                `import java.util.concurrent.CompletableFuture;

public class ExceptionallyDemo {
    public static void main(String[] args) throws Exception {
        CompletableFuture<Integer> risky = CompletableFuture.supplyAsync(() -> {
            if (true) throw new RuntimeException("service unavailable");
            return 42;
        });

        CompletableFuture<Integer> safe = risky.exceptionally(ex -> {
            System.out.println("Recovered from: " + ex.getMessage());
            return -1; // fallback value
        });

        System.out.println("Result: " + safe.get());
    }
}
// OUTPUT:
// Recovered from: java.lang.RuntimeException: service unavailable
// Result: -1`
            ]
        },
        {
            content: `<h3>Waiting on Many Futures — allOf() and anyOf()</h3>
<ul>
<li><code>CompletableFuture.allOf(f1, f2, f3, ...)</code> completes only when <b>every</b> given future completes. It returns <code>CompletableFuture&lt;Void&gt;</code>, so read the results from the original futures.</li>
<li><code>CompletableFuture.anyOf(f1, f2, f3, ...)</code> completes as soon as <b>any one</b> of them completes, with that result.</li>
</ul>`,
            codeExamples: [
                `import java.util.concurrent.CompletableFuture;
import java.util.List;
import java.util.stream.Collectors;

public class AllOfDemo {
    public static void main(String[] args) throws Exception {
        CompletableFuture<Integer> f1 = CompletableFuture.supplyAsync(() -> 1);
        CompletableFuture<Integer> f2 = CompletableFuture.supplyAsync(() -> 2);
        CompletableFuture<Integer> f3 = CompletableFuture.supplyAsync(() -> 3);

        CompletableFuture<Void> all = CompletableFuture.allOf(f1, f2, f3);
        all.get(); // waits until all three are done

        List<Integer> results = List.of(f1, f2, f3).stream()
            .map(CompletableFuture::join) // safe here - all are already complete
            .collect(Collectors.toList());

        System.out.println("All results: " + results);
    }
}
// OUTPUT:
// All results: [1, 2, 3]`
            ]
        },
        {
            content: `<h3>join() vs get() — the Unchecked-Exception Difference</h3>
<p>Both block until the result is ready. <code>get()</code> throws the checked <code>ExecutionException</code> and <code>InterruptedException</code>. <code>join()</code> throws an <b>unchecked</b> <code>CompletionException</code> instead.</p>
<p>That makes <code>join()</code> easier inside lambdas and streams (like the <code>allOf</code> example above), where checked exceptions cannot be thrown.</p>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does CompletableFuture solve over plain Future?</td><td>It adds non-blocking chaining, combining, exception handling, and manual completion - things plain Future can't do</td></tr>
<tr class='text-center'><td>supplyAsync vs runAsync?</td><td>supplyAsync runs a Supplier and produces a result; runAsync runs a Runnable and produces no result</td></tr>
<tr class='text-center'><td>thenApply vs thenAccept vs thenRun?</td><td>thenApply transforms and returns a value; thenAccept consumes the value and returns nothing; thenRun ignores the value entirely</td></tr>
<tr class='text-center'><td>How do you combine two independent async results?</td><td>thenCombine(other, BiFunction) - waits for both, merges their results</td></tr>
<tr class='text-center'><td>exceptionally() vs handle()?</td><td>exceptionally() only runs on failure to supply a fallback; handle() runs on both success and failure</td></tr>
<tr class='text-center'><td>get() vs join()?</td><td>get() throws checked ExecutionException/InterruptedException; join() throws an unchecked CompletionException, making it lambda-friendly</td></tr>
</table>`
        }
    ]
};
