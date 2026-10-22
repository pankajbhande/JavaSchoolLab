import type { TopicExtra } from './courseMerges';
import { blk } from './jsRoadmapKit';

const command: TopicExtra = {
  beginner: [
    blk(`<h4>In one minute</h4>
<p>The <b>Command pattern</b> wraps a request (do this, to that, with these values) inside an object. Because the request is now an object, you can <b>store it, queue it, log it, pass it around, run it later, or undo it</b>. The caller (the <b>invoker</b>) only knows one method, <code>execute()</code>. The <b>receiver</b> does the real work.</p>
<h4>More real-life analogies</h4>
<ul>
<li><b>Restaurant order slip:</b> the waiter does not cook. He writes a slip (the command), the kitchen (receiver) executes it later, and the slip can be cancelled before cooking starts.</li>
<li><b>Railway tatkal ticket queue:</b> every booking request sits in a queue as a self-contained form, and counters process them one by one.</li>
<li><b>Smart-home scene button:</b> one "Good night" button holds many small commands (lights off, fan off, door locked).</li>
</ul>
<h4>Where you see it in Java and Spring</h4>
<ul>
<li><code>java.lang.Runnable</code> and <code>Callable</code>: a task object with one method. <code>ExecutorService.submit(task)</code> is the invoker.</li>
<li><code>javax.swing.Action</code> / <code>ActionListener</code>: a menu item and a toolbar button share one command object.</li>
<li><code>java.util.function.Consumer</code> and lambdas: a lambda is a tiny command.</li>
<li>Spring Batch <code>Tasklet</code>, Spring event handlers, and JDBC <code>PreparedStatement</code> (a command with parameters) follow the same idea.</li>
</ul>`),
    blk(`<h4>Structure as text</h4>
<pre>
Client ----creates----> ConcreteCommand(receiver, args)
                              |
Invoker ---- holds ---->  Command  &lt;&lt;interface&gt;&gt;
 (button, queue,           + execute()
  scheduler)               + undo()   (optional)
                              |
                              v
                          Receiver  (Light, Editor, Bank...)
                          + realAction()
</pre>
<h4>When to use</h4>
<ul>
<li>You need <b>undo / redo</b> or a history of actions.</li>
<li>You want to <b>queue, schedule or log</b> requests (job queue, audit trail, replay).</li>
<li>You want to <b>parameterise</b> a button or menu with an action chosen at run time.</li>
<li>You need to group many steps into one <b>macro</b> action.</li>
</ul>
<h4>When NOT to use</h4>
<ul>
<li>The call is simple and direct, with no undo, queue or log. A plain method call is clearer.</li>
<li>A lambda or method reference already does the job and you need no history. Do not create ten classes for ten one-line actions.</li>
</ul>
<h4>Sample program: a queue of Runnable commands</h4>
<p>The JDK already ships a command interface: <code>Runnable</code>. This program queues work first and runs it later, which is the heart of the pattern.</p>`,
`// Command pattern: Runnable tasks queued now, executed later
import java.util.ArrayDeque;
import java.util.Queue;

public class CmBeginnerQueueDemo {
    public static void main(String[] args) {
        Queue<Runnable> queue = new ArrayDeque<>();

        // Commands are created now but nothing runs yet
        queue.add(new CmPrintTask("Raigad"));
        queue.add(new CmPrintTask("Sinhagad"));
        queue.add(() -> System.out.println("Closing the counter"));

        System.out.println("Queued: " + queue.size());

        // The invoker just calls run(); it does not know the details
        while (!queue.isEmpty()) {
            queue.poll().run();
        }
    }
}

class CmPrintTask implements Runnable {
    private final String fortName;

    CmPrintTask(String fortName) {
        this.fortName = fortName;
    }

    @Override
    public void run() {
        System.out.println("Printing ticket for " + fortName);
    }
}
// OUTPUT:
// Queued: 3
// Printing ticket for Raigad
// Printing ticket for Sinhagad
// Closing the counter
`),
  ],
  intermediate: [
    blk(`<h4>1. Undo and redo with two stacks</h4>
<p><b>What it shows:</b> a text editor whose every edit is a command that knows how to <code>undo()</code> itself. <b>Why:</b> the history is just a stack of command objects; undo pops from one stack and pushes on the other, so redo comes for free.</p>`,
`// Command with undo and redo stacks for a tiny text editor
import java.util.ArrayDeque;
import java.util.Deque;

public class CmUndoRedoDemo {
    public static void main(String[] args) {
        CmDocument doc = new CmDocument();
        CmEditor editor = new CmEditor();

        editor.run(new CmAppendCommand(doc, "Shivneri "));
        editor.run(new CmAppendCommand(doc, "Fort "));
        System.out.println("After edits : " + doc.text);

        editor.undo();
        System.out.println("After undo  : " + doc.text);

        editor.redo();
        System.out.println("After redo  : " + doc.text);

        editor.undo();
        editor.undo();
        System.out.println("After 2 undo: '" + doc.text + "'");
    }
}

interface CmEditCommand {
    void execute();

    void undo();
}

class CmDocument {
    final StringBuilder text = new StringBuilder();
}

class CmAppendCommand implements CmEditCommand {
    private final CmDocument doc;
    private final String added;

    CmAppendCommand(CmDocument doc, String added) {
        this.doc = doc;
        this.added = added;
    }

    @Override
    public void execute() {
        doc.text.append(added);
    }

    @Override
    public void undo() {
        int newLength = doc.text.length() - added.length();
        doc.text.setLength(newLength); // remove what we appended
    }
}

class CmEditor {
    private final Deque<CmEditCommand> undoStack = new ArrayDeque<>();
    private final Deque<CmEditCommand> redoStack = new ArrayDeque<>();

    void run(CmEditCommand command) {
        command.execute();
        undoStack.push(command);
        redoStack.clear(); // a new edit invalidates the redo history
    }

    void undo() {
        if (undoStack.isEmpty()) {
            return;
        }
        CmEditCommand command = undoStack.pop();
        command.undo();
        redoStack.push(command);
    }

    void redo() {
        if (redoStack.isEmpty()) {
            return;
        }
        CmEditCommand command = redoStack.pop();
        command.execute();
        undoStack.push(command);
    }
}
// OUTPUT:
// After edits : Shivneri Fort 
// After undo  : Shivneri 
// After redo  : Shivneri Fort 
// After 2 undo: ''
`),
    blk(`<h4>2. Macro command</h4>
<p><b>What it shows:</b> a command that holds a list of other commands (Composite meets Command). <b>Why:</b> one button runs a whole routine, and the macro can even undo the steps in reverse order.</p>`,
`// Macro command: one button runs many small commands
import java.util.ArrayList;
import java.util.List;

public class CmMacroDemo {
    public static void main(String[] args) {
        CmMacro goodNight = new CmMacro()
            .add(new CmSwitchOff(new CmDevice("Hall light")))
            .add(new CmSwitchOff(new CmDevice("Bedroom fan")))
            .add(new CmSwitchOff(new CmDevice("Geyser")));

        System.out.println("-- Good night --");
        goodNight.execute();

        System.out.println("-- Undo --");
        goodNight.undo();
    }
}

interface CmStep {
    void execute();

    void undo();
}

class CmDevice {
    private final String name;

    CmDevice(String name) {
        this.name = name;
    }

    void switchOn() {
        System.out.println(name + " ON");
    }

    void switchOff() {
        System.out.println(name + " OFF");
    }
}

class CmSwitchOff implements CmStep {
    private final CmDevice device;

    CmSwitchOff(CmDevice device) {
        this.device = device;
    }

    @Override
    public void execute() {
        device.switchOff();
    }

    @Override
    public void undo() {
        device.switchOn();
    }
}

class CmMacro implements CmStep {
    private final List<CmStep> steps = new ArrayList<>();

    CmMacro add(CmStep step) {
        steps.add(step);
        return this;
    }

    @Override
    public void execute() {
        for (CmStep step : steps) {
            step.execute();
        }
    }

    @Override
    public void undo() {
        // undo in reverse order, like unwinding a stack
        for (int i = steps.size() - 1; i >= 0; i--) {
            steps.get(i).undo();
        }
    }
}
// OUTPUT:
// -- Good night --
// Hall light OFF
// Bedroom fan OFF
// Geyser OFF
// -- Undo --
// Geyser ON
// Bedroom fan ON
// Hall light ON
`),
    blk(`<h4>3. Remote control with slots and lambdas</h4>
<p><b>What it shows:</b> a remote with numbered buttons, where each slot holds a command built from a <b>lambda</b>. <b>Why:</b> since <code>Command</code> has a single method, you rarely need one class per action in modern Java. Use classes only when the command needs undo state.</p>`,
`// Remote control: slots filled with lambda commands
import java.util.HashMap;
import java.util.Map;

public class CmRemoteDemo {
    public static void main(String[] args) {
        CmTv tv = new CmTv();
        CmRemote remote = new CmRemote();

        remote.assign(1, tv::next);  // method reference as a command
        remote.assign(2, tv::mute);
        remote.assign(3, () -> System.out.println("Opening Hotstar"));

        remote.press(1);
        remote.press(1);
        remote.press(2);
        remote.press(3);
        remote.press(9);
    }
}

@FunctionalInterface
interface CmAction {
    void execute();
}

class CmTv {
    private int channel = 1;

    void next() {
        channel++;
        System.out.println("TV channel is now " + channel);
    }

    void mute() {
        System.out.println("TV muted");
    }
}

class CmRemote {
    private final Map<Integer, CmAction> slots = new HashMap<>();

    void assign(int button, CmAction action) {
        slots.put(button, action);
    }

    void press(int button) {
        CmAction action = slots.get(button);
        if (action == null) {
            System.out.println("Button " + button + " is not assigned");
            return;
        }
        action.execute();
    }
}
// OUTPUT:
// TV channel is now 2
// TV channel is now 3
// TV muted
// Opening Hotstar
// Button 9 is not assigned
`),
    blk(`<h4>4. Command log and replay</h4>
<p><b>What it shows:</b> commands are stored in a list as they run, then replayed on a fresh object. <b>Why:</b> a log of commands is a cheap audit trail, and replaying it rebuilds state (the idea behind event sourcing and database redo logs).</p>`,
`// Command log: record every command, then replay on a new account
import java.util.ArrayList;
import java.util.List;

public class CmLogReplayDemo {
    public static void main(String[] args) {
        List<CmTxn> log = new ArrayList<>();
        CmAccount live = new CmAccount("Pune branch");

        CmTxn[] today = {new CmDeposit(5000), new CmWithdraw(1200), new CmDeposit(300)};
        for (CmTxn txn : today) {
            txn.applyTo(live);
            log.add(txn);              // keep the command for the audit log
            System.out.println("Logged " + txn.describe());
        }
        System.out.println(live);

        // Rebuild the same state from the log
        CmAccount restored = new CmAccount("Pune branch");
        log.forEach(txn -> txn.applyTo(restored));
        System.out.println("Replay: " + restored);
    }
}

interface CmTxn {
    void applyTo(CmAccount account);

    String describe();
}

class CmAccount {
    private final String owner;
    private int balance;

    CmAccount(String owner) {
        this.owner = owner;
    }

    void change(int amount) {
        balance += amount;
    }

    @Override
    public String toString() {
        return owner + " balance = " + balance;
    }
}

class CmDeposit implements CmTxn {
    private final int amount;

    CmDeposit(int amount) {
        this.amount = amount;
    }

    @Override
    public void applyTo(CmAccount account) {
        account.change(amount);
    }

    @Override
    public String describe() {
        return "DEPOSIT " + amount;
    }
}

class CmWithdraw implements CmTxn {
    private final int amount;

    CmWithdraw(int amount) {
        this.amount = amount;
    }

    @Override
    public void applyTo(CmAccount account) {
        account.change(-amount);
    }

    @Override
    public String describe() {
        return "WITHDRAW " + amount;
    }
}
// OUTPUT:
// Logged DEPOSIT 5000
// Logged WITHDRAW 1200
// Logged DEPOSIT 300
// Pune branch balance = 4100
// Replay: Pune branch balance = 4100
`),
    blk(`<h4>Common mistakes</h4>
<ul>
<li><b>Forgetting to store undo state.</b> A delete command must remember what it deleted (and where) before it runs.</li>
<li><b>Sharing one mutable command object</b> in several stacks. Create a fresh command per action.</li>
<li><b>Not clearing the redo stack</b> after a new action, which makes redo restore a stale future.</li>
<li><b>Putting business logic in the command.</b> The command should delegate to the receiver; otherwise it becomes a god class.</li>
<li><b>Unbounded history.</b> Cap the undo stack (for example 100 items) in long-running apps.</li>
</ul>
<h4>Command vs Strategy vs Memento</h4>
<table>
<tr><th>Aspect</th><th>Command</th><th>Strategy</th><th>Memento undo</th></tr>
<tr><td>Intent</td><td>Package a request as an object</td><td>Swap an algorithm</td><td>Save and restore state</td></tr>
<tr><td>Typical method</td><td>execute() / undo()</td><td>compute(data)</td><td>save() / restore()</td></tr>
<tr><td>Has a receiver?</td><td>Yes, binds receiver and arguments</td><td>No, works on given data</td><td>No</td></tr>
<tr><td>Lifetime</td><td>Often queued or stored</td><td>Chosen once, reused</td><td>Snapshot per step</td></tr>
<tr><td>Undo</td><td>Inverse operation (small)</td><td>Not applicable</td><td>Whole-state copy (large)</td></tr>
</table>`),
  ],
  expert: [
    blk(`<h4>Real-time example 1: transactional batch with rollback</h4>
<p>A fund-transfer batch must be all-or-nothing. Each step is a command with <code>undo()</code>. If step N fails, the runner undoes steps N-1 down to 1. This is a mini saga, and the same shape is used for multi-step order processing.</p>`,
`// Transactional command batch: roll back completed steps on failure
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;

public class CmTransactionBatchDemo {
    public static void main(String[] args) {
        CmLedger ledger = new CmLedger();
        List<CmBankStep> steps = List.of(
            new CmMove(ledger, 3000),
            new CmMove(ledger, 4000),
            new CmMove(ledger, 9000));  // this one fails

        new CmBatchRunner().runAll(steps);
        System.out.println("Mumbai=" + ledger.mumbai + " Nashik=" + ledger.nashik);
    }
}

interface CmBankStep {
    void run();

    void rollback();
}

class CmLedger {
    int mumbai = 10000;
    int nashik = 2000;
}

class CmMove implements CmBankStep {
    private final CmLedger ledger;
    private final int amount;

    CmMove(CmLedger ledger, int amount) {
        this.ledger = ledger;
        this.amount = amount;
    }

    @Override
    public void run() {
        if (ledger.mumbai < amount) {
            throw new IllegalStateException("Insufficient funds for " + amount);
        }
        ledger.mumbai -= amount;
        ledger.nashik += amount;
        System.out.println("Moved " + amount + " Mumbai -> Nashik");
    }

    @Override
    public void rollback() {
        ledger.mumbai += amount;
        ledger.nashik -= amount;
        System.out.println("Rolled back " + amount);
    }
}

class CmBatchRunner {
    void runAll(List<CmBankStep> steps) {
        Deque<CmBankStep> done = new ArrayDeque<>();
        try {
            for (CmBankStep step : steps) {
                step.run();
                done.push(step);
            }
        } catch (IllegalStateException e) {
            System.out.println("FAILED: " + e.getMessage());
            while (!done.isEmpty()) {
                done.pop().rollback(); // newest first
            }
        }
    }
}
// OUTPUT:
// Moved 3000 Mumbai -> Nashik
// Moved 4000 Mumbai -> Nashik
// FAILED: Insufficient funds for 9000
// Rolled back 4000
// Rolled back 3000
// Mumbai=10000 Nashik=2000
`),
    blk(`<h4>Real-time example 2: job scheduler with priorities</h4>
<p>Commands in a <code>PriorityQueue</code> run in priority order, not arrival order. This is how task schedulers, print spoolers and notification dispatchers are built. The invoker never inspects the job; it only compares priorities.</p>`,
`// Priority job queue: commands ordered by priority, then arrival
import java.util.Comparator;
import java.util.PriorityQueue;

public class CmJobSchedulerDemo {
    public static void main(String[] args) {
        Comparator<CmJob> byPriority = Comparator
            .comparingInt((CmJob j) -> j.priority)
            .thenComparingInt(j -> j.order);
        PriorityQueue<CmJob> queue = new PriorityQueue<>(byPriority);

        queue.add(new CmReportJob(5, "Nagpur"));
        queue.add(new CmEmailJob(1, "ops@example.com"));
        queue.add(new CmReportJob(5, "Indore"));
        queue.add(new CmEmailJob(2, "cfo@example.com"));

        while (!queue.isEmpty()) {
            queue.poll().execute(); // lower number = more urgent
        }
    }
}

abstract class CmJob {
    private static int counter = 0;
    final int priority;
    final int order = counter++;

    CmJob(int priority) {
        this.priority = priority;
    }

    abstract void execute();
}

class CmEmailJob extends CmJob {
    private final String to;

    CmEmailJob(int priority, String to) {
        super(priority);
        this.to = to;
    }

    @Override
    void execute() {
        System.out.println("Sending email to " + to);
    }
}

class CmReportJob extends CmJob {
    private final String city;

    CmReportJob(int priority, String city) {
        super(priority);
        this.city = city;
    }

    @Override
    void execute() {
        System.out.println("Building sales report for " + city);
    }
}
// OUTPUT:
// Sending email to ops@example.com
// Sending email to cfo@example.com
// Building sales report for Nagpur
// Building sales report for Indore
`),
    blk(`<h4>Sample mini project: fort ticket counter with undo</h4>
<p>Several small classes work together: a <code>Counter</code> (receiver), a booking command, a <code>History</code> (invoker side) and a main that drives a session. Read it top to bottom and notice that the history knows nothing about tickets.</p>`,
`// Mini project: fort ticket counter with book and undo
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.Map;

public class CmTicketCounterProject {
    public static void main(String[] args) {
        CmCounter counter = new CmCounter();
        CmHistory history = new CmHistory();

        history.run(new CmBook(counter, "Raigad", 2));
        history.run(new CmBook(counter, "Torna", 3));  // not enough seats
        history.run(new CmBook(counter, "Torna", 2));
        counter.show();

        history.undoLast();
        history.undoLast();
        history.undoLast();
        counter.show();
    }
}

class CmCounter {
    private final Map<String, Integer> seats = new LinkedHashMap<>();

    CmCounter() {
        seats.put("Raigad", 3);
        seats.put("Torna", 2);
    }

    boolean take(String fort, int count) {
        int free = seats.get(fort);
        if (free < count) {
            return false;
        }
        seats.put(fort, free - count);
        return true;
    }

    void give(String fort, int count) {
        seats.put(fort, seats.get(fort) + count);
    }

    void show() {
        System.out.println("Seats left: " + seats);
    }
}

interface CmTicketCommand {
    boolean execute();

    void undo();

    String label();
}

class CmBook implements CmTicketCommand {
    private final CmCounter counter;
    private final String fort;
    private final int count;

    CmBook(CmCounter counter, String fort, int count) {
        this.counter = counter;
        this.fort = fort;
        this.count = count;
    }

    @Override
    public boolean execute() {
        return counter.take(fort, count);
    }

    @Override
    public void undo() {
        counter.give(fort, count);
    }

    @Override
    public String label() {
        return "Book " + count + " for " + fort;
    }
}

class CmHistory {
    private final Deque<CmTicketCommand> done = new ArrayDeque<>();

    void run(CmTicketCommand command) {
        if (command.execute()) {
            done.push(command);
            System.out.println("OK    : " + command.label());
        } else {
            System.out.println("DENIED: " + command.label());
        }
    }

    void undoLast() {
        if (done.isEmpty()) {
            System.out.println("Nothing to undo");
            return;
        }
        CmTicketCommand last = done.pop();
        last.undo();
        System.out.println("UNDONE: " + last.label());
    }
}
// OUTPUT:
// OK    : Book 2 for Raigad
// DENIED: Book 3 for Torna
// OK    : Book 2 for Torna
// Seats left: {Raigad=1, Torna=0}
// UNDONE: Book 2 for Torna
// UNDONE: Book 2 for Raigad
// Nothing to undo
// Seats left: {Raigad=3, Torna=2}
`),
    blk(`<h4>Thread safety, testing and Spring integration</h4>
<ul>
<li><b>Thread safety:</b> commands handed to an <code>ExecutorService</code> must be immutable or guard their receiver. Pass values into the constructor and never mutate shared fields without a lock. An undo stack shared by threads needs a concurrent deque or external locking.</li>
<li><b>Idempotency:</b> if a queued command may be retried (message broker, scheduler), design <code>execute()</code> so that running it twice is safe, or carry a unique id and skip duplicates.</li>
<li><b>Testing:</b> test each command with a fake receiver, and test the invoker with a stub command that counts calls. For undo, assert that <code>execute()</code> followed by <code>undo()</code> leaves the receiver as it started.</li>
<li><b>Spring:</b> commands that need services are best created by a factory bean or by <code>ObjectProvider</code>; the invoker can be a singleton. <code>@Async</code> methods, <code>TaskExecutor</code> and Spring Batch steps all act as command invokers. Avoid making every command a singleton bean if it carries per-request data.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Command explosion:</b> one class per trivial call. Use a lambda or a method reference instead.</li>
<li><b>Fat commands</b> that contain the business rules instead of calling the receiver.</li>
<li><b>Undo by hope:</b> expecting undo to work after partial failure without recording what was actually done.</li>
<li><b>Hidden global history</b> as a static field, which breaks tests and multi-user apps.</li>
</ul>`),
  ],
  interviewQA: [
    ['What problem does the Command pattern solve?', 'It decouples the object that triggers an action (invoker) from the object that performs it (receiver) by wrapping the request in an object. That makes it possible to queue, log, schedule, pass around and undo requests.'],
    ['How do you implement undo and redo with Command?', 'Give each command an undo() method that reverses its effect, and keep executed commands on an undo stack. Undo pops a command, calls undo() and pushes it on a redo stack. A new action clears the redo stack.'],
    ['Where does the JDK use the Command pattern?', 'Runnable and Callable are commands, ExecutorService is the invoker, and the worker thread executes them. Swing Action and ActionListener are also commands.'],
    ['What is the difference between Command and Strategy?', 'Strategy swaps an algorithm and usually has no receiver or history. Command packages a specific request with its receiver and arguments, so it can be stored, queued and undone.'],
    ['What is a macro command?', 'A command that contains a list of other commands and executes them in order, so one trigger performs a routine. Its undo() runs the inner undos in reverse order.'],
    ['When is a lambda enough instead of a Command class?', 'When the command has one method, needs no undo state and no extra behaviour. A lambda or method reference is then a lighter command. Use a class when you need undo, a description for logging, or serialization.'],
    ['How does Command relate to Memento for undo?', 'Command undo stores the inverse operation, which is cheap but must be written per command. Memento stores a snapshot of state, which is simple but costs memory. They are often combined: the command keeps a memento taken before it ran.'],
  ],
};

const template: TopicExtra = {
  beginner: [
    blk(`<h4>In one minute</h4>
<p>The <b>Template Method pattern</b> puts the <b>fixed skeleton of an algorithm</b> in a base class and lets subclasses fill in only the steps that differ. The base class owns the order ("first A, then B, then C"). Subclasses cannot reorder it; they only override the steps. A good rule of thumb: <b>the base class calls the subclass</b>, not the other way round. This is often called the <b>Hollywood principle</b>: "Do not call us, we will call you."</p>
<h4>More real-life analogies</h4>
<ul>
<li><b>Exam paper format:</b> every university paper has the same flow (instructions, sections, marks, submission). Only the questions change.</li>
<li><b>Building a house:</b> foundation, walls, roof, finishing is the fixed order. A bungalow and a flat differ in the details of each step.</li>
<li><b>A bank loan process:</b> apply, verify documents, assess risk, sanction, disburse. Home loan and car loan override only the verification and risk steps.</li>
</ul>
<h4>Where you see it in Java and Spring</h4>
<ul>
<li><code>HttpServlet.service()</code> is the template. It decides between <code>doGet()</code>, <code>doPost()</code> and others, and you override only those.</li>
<li><code>java.io.InputStream.read(byte[], int, int)</code> is built on top of the single abstract <code>read()</code>.</li>
<li><code>AbstractList</code>, <code>AbstractMap</code> and <code>AbstractSet</code> implement most methods using a few abstract ones such as <code>get(int)</code> and <code>size()</code>.</li>
<li><code>java.util.Comparator.compare</code> usage inside <code>Collections.sort</code> and <code>TimerTask.run()</code> are small variations.</li>
<li>Spring: <code>JdbcTemplate</code>, <code>RestTemplate</code>, <code>TransactionTemplate</code> (callback style), and <code>AbstractApplicationContext.refresh()</code> with its hook methods <code>onRefresh()</code> and <code>postProcessBeanFactory()</code>.</li>
</ul>`),
    blk(`<h4>Structure as text</h4>
<pre>
AbstractClass
  + templateMethod()  [final]   &lt;-- fixed order
        step1()                  (concrete, shared)
        step2()                  (abstract, must override)
        step3()                  (hook, may override)
        step4()                  (concrete, shared)

ConcreteA extends AbstractClass   overrides step2, step3
ConcreteB extends AbstractClass   overrides step2
</pre>
<p>Three kinds of steps: <b>concrete steps</b> (shared code), <b>abstract steps</b> (must be implemented) and <b>hook methods</b> (empty or default body that subclasses may override).</p>
<h4>When to use</h4>
<ul>
<li>Several classes share the <b>same sequence</b> but differ in a few steps.</li>
<li>You want to <b>avoid duplicate code</b> by pulling the common flow up.</li>
<li>You need to <b>control extension points</b> so subclasses cannot break the order.</li>
</ul>
<h4>When NOT to use</h4>
<ul>
<li>Variations need to change <b>at run time</b>. Template Method is fixed at compile time by inheritance; use Strategy.</li>
<li>There is only one implementation. Extra abstraction adds noise.</li>
<li>Almost every step differs; then the skeleton is not really shared.</li>
</ul>
<h4>Sample program: exporting a visitor list</h4>
<p>The base class fixes the order open, header, rows, footer. Subclasses decide only how a row and a header look. The <code>final</code> keyword protects the sequence.</p>`,
`// Template Method: fixed export flow, subclasses format the rows
import java.util.List;

public class TmBeginnerExportDemo {
    public static void main(String[] args) {
        List<String> forts = List.of("Raigad", "Pratapgad", "Lohagad");

        new TmCsvExporter().export(forts);
        System.out.println("----");
        new TmHtmlExporter().export(forts);
    }
}

abstract class TmExporter {
    public final void export(List<String> forts) {
        System.out.println(header());
        for (String fort : forts) {
            System.out.println(formatRow(fort));
        }
        System.out.println(footer(forts.size()));
    }

    protected abstract String header();

    protected abstract String formatRow(String fort);

    protected String footer(int count) {
        return "Total: " + count; // default hook, can be overridden
    }
}

class TmCsvExporter extends TmExporter {
    @Override
    protected String header() {
        return "name";
    }

    @Override
    protected String formatRow(String fort) {
        return fort + ",open";
    }
}

class TmHtmlExporter extends TmExporter {
    @Override
    protected String header() {
        return "<ul>";
    }

    @Override
    protected String formatRow(String fort) {
        return "  <li>" + fort + "</li>";
    }

    @Override
    protected String footer(int count) {
        return "</ul> <!-- " + count + " items -->";
    }
}
// OUTPUT:
// name
// Raigad,open
// Pratapgad,open
// Lohagad,open
// Total: 3
// ----
// <ul>
//   <li>Raigad</li>
//   <li>Pratapgad</li>
//   <li>Lohagad</li>
// </ul> <!-- 3 items -->
`),
  ],
  intermediate: [
    blk(`<h4>1. Data import pipeline</h4>
<p><b>What it shows:</b> a fixed import flow (read, validate, save) where only the reading step differs between sources. <b>Why:</b> the validation and saving logic is written once, so every new source (CSV, JSON, Excel) is only one small class.</p>`,
`// Template Method: data import flow with a per-source read step
import java.util.ArrayList;
import java.util.List;

public class TmDataImportDemo {
    public static void main(String[] args) {
        new TmCsvImporter().importAll("pune, nashik, ,nagpur");
        new TmPipeImporter().importAll("pune|goa|nashik|sur");
    }
}

abstract class TmImporter {
    private final List<String> saved = new ArrayList<>();

    public final int importAll(String source) {
        List<String> rows = readRows(source);       // varies
        int rejected = 0;
        for (String row : rows) {
            if (isValid(row)) {
                saved.add(row.trim().toUpperCase()); // shared save step
            } else {
                rejected++;
            }
        }
        System.out.println(name() + ": saved=" + saved + " rejected=" + rejected);
        return saved.size();
    }

    protected abstract String name();

    protected abstract List<String> readRows(String source);

    protected boolean isValid(String row) {
        return !row.isBlank();
    }
}

class TmCsvImporter extends TmImporter {
    @Override
    protected String name() {
        return "CSV";
    }

    @Override
    protected List<String> readRows(String source) {
        return List.of(source.split(","));
    }
}

class TmPipeImporter extends TmImporter {
    @Override
    protected String name() {
        return "PIPE";
    }

    @Override
    protected List<String> readRows(String source) {
        return List.of(source.split("[|]"));
    }

    @Override
    protected boolean isValid(String row) {
        return row.trim().length() >= 4; // stricter rule for this source
    }
}
// OUTPUT:
// CSV: saved=[PUNE, NASHIK, NAGPUR] rejected=1
// PIPE: saved=[PUNE, NASHIK] rejected=2
`),
    blk(`<h4>2. Hook methods</h4>
<p><b>What it shows:</b> optional steps with default behaviour. <b>Why:</b> hooks let a subclass add logging, skip a step or react to events without being forced to implement something. The abstract steps are the "must", the hooks are the "may".</p>`,
`// Template Method with hook methods that have default bodies

public class TmHookDemo {
    public static void main(String[] args) {
        new TmDailyReport().generate("Kolhapur");
        System.out.println();
        new TmQuietReport().generate("Satara");
    }
}

abstract class TmReport {
    public final void generate(String branch) {
        if (wantsHeader()) {                 // hook controls a step
            System.out.println("== Sales report: " + branch + " ==");
        }
        System.out.println(body(branch));
        afterBody();                         // hook with an empty default
        System.out.println("(end)");
    }

    protected abstract String body(String branch);

    protected boolean wantsHeader() {
        return true;
    }

    protected void afterBody() {
        // nothing by default
    }
}

class TmDailyReport extends TmReport {
    @Override
    protected String body(String branch) {
        return "Today: 42 orders in " + branch;
    }
}

class TmQuietReport extends TmReport {
    @Override
    protected String body(String branch) {
        return "Only the numbers: 42 / " + branch;
    }

    @Override
    protected boolean wantsHeader() {
        return false;
    }

    @Override
    protected void afterBody() {
        System.out.println("[audit] quiet report produced");
    }
}
// OUTPUT:
// == Sales report: Kolhapur ==
// Today: 42 orders in Kolhapur
// (end)
// 
// Only the numbers: 42 / Satara
// [audit] quiet report produced
// (end)
`),
    blk(`<h4>3. A game turn</h4>
<p><b>What it shows:</b> the turn order of a board game is fixed; each game decides what "move" and "win" mean. <b>Why:</b> game frameworks use exactly this idea. The engine owns the loop and the game plugs in its rules.</p>`,
`// Template Method: a fixed game turn, rules supplied by subclasses

public class TmGameTurnDemo {
    public static void main(String[] args) {
        new TmRaceGame().play(new int[] {4, 3, 5});
        System.out.println();
        new TmCollectGame().play(new int[] {3, 2, 5, 4});
    }
}

abstract class TmGame {
    public final void play(int[] dice) {
        start();
        for (int turn = 0; turn < dice.length; turn++) {
            System.out.println("Turn " + (turn + 1) + ", dice " + dice[turn]);
            move(dice[turn]);
            if (hasWon()) {
                System.out.println(name() + ": winner on turn " + (turn + 1));
                return;
            }
        }
        System.out.println(name() + ": nobody won yet");
    }

    protected abstract String name();

    protected abstract void start();

    protected abstract void move(int steps);

    protected abstract boolean hasWon();
}

class TmRaceGame extends TmGame {
    private int position;

    @Override
    protected String name() {
        return "Race to 10";
    }

    @Override
    protected void start() {
        position = 0;
    }

    @Override
    protected void move(int steps) {
        position += steps;
        System.out.println("  position = " + position);
    }

    @Override
    protected boolean hasWon() {
        return position >= 10;
    }
}

class TmCollectGame extends TmGame {
    private int coins;

    @Override
    protected String name() {
        return "Collect 6 coins";
    }

    @Override
    protected void start() {
        coins = 0;
    }

    @Override
    protected void move(int steps) {
        if (steps % 2 == 0) {
            coins += steps; // only even throws earn coins
        }
        System.out.println("  coins = " + coins);
    }

    @Override
    protected boolean hasWon() {
        return coins >= 6;
    }
}
// OUTPUT:
// Turn 1, dice 4
//   position = 4
// Turn 2, dice 3
//   position = 7
// Turn 3, dice 5
//   position = 12
// Race to 10: winner on turn 3
// 
// Turn 1, dice 3
//   coins = 0
// Turn 2, dice 2
//   coins = 2
// Turn 3, dice 5
//   coins = 2
// Turn 4, dice 4
//   coins = 6
// Collect 6 coins: winner on turn 4
`),
    blk(`<h4>4. Template Method with callbacks (the JdbcTemplate style)</h4>
<p><b>What it shows:</b> instead of inheritance, the template is a normal class that takes the varying step as a lambda. <b>Why:</b> it keeps the boilerplate (open, close, error handling) in one place and avoids a subclass per query. This is how <code>JdbcTemplate.query</code> and <code>TransactionTemplate.execute</code> work.</p>`,
`// Template Method via callbacks: resource handling written once
import java.util.function.Function;

public class TmCallbackDemo {
    public static void main(String[] args) {
        TmDbTemplate template = new TmDbTemplate();

        String result = template.execute(c -> c.query("select * from forts"));
        System.out.println(result);

        int length = template.execute(c -> c.query("select 1").length());
        System.out.println("Length = " + length);
    }
}

class TmConnection implements AutoCloseable {
    TmConnection() {
        System.out.println("open connection");
    }

    String query(String sql) {
        return "rows for [" + sql + "]";
    }

    @Override
    public void close() {
        System.out.println("close connection");
    }
}

class TmDbTemplate {
    public <T> T execute(Function<TmConnection, T> callback) {
        try (TmConnection connection = new TmConnection()) {
            return callback.apply(connection); // only this step varies
        }
    }
}
// OUTPUT:
// open connection
// close connection
// rows for [select * from forts]
// open connection
// close connection
// Length = 19
`),
    blk(`<h4>Common mistakes</h4>
<ul>
<li><b>Forgetting <code>final</code></b> on the template method, so a subclass quietly changes the order.</li>
<li><b>Calling an overridable method from a constructor.</b> The subclass fields are not initialised yet, which causes null pointer surprises.</li>
<li><b>Too many abstract steps.</b> If subclasses must implement ten methods, the skeleton is too thin. Merge steps or use hooks with defaults.</li>
<li><b>Deep hierarchies.</b> Three levels of template subclasses are very hard to follow. Prefer callbacks or Strategy.</li>
<li><b>Mixing state into the base class</b> that is shared across calls, which breaks reuse and thread safety.</li>
</ul>
<h4>Template Method vs Strategy vs Factory Method</h4>
<table>
<tr><th>Aspect</th><th>Template Method</th><th>Strategy</th><th>Factory Method</th></tr>
<tr><td>Mechanism</td><td>Inheritance</td><td>Composition</td><td>Inheritance</td></tr>
<tr><td>What varies</td><td>Some steps of one algorithm</td><td>The whole algorithm</td><td>Which object is created</td></tr>
<tr><td>Chosen when</td><td>Compile time (subclass)</td><td>Run time (swap object)</td><td>Compile time (subclass)</td></tr>
<tr><td>Who holds control</td><td>Base class calls subclass</td><td>Context calls strategy</td><td>Creator calls factory step</td></tr>
<tr><td>Typical example</td><td>HttpServlet.service</td><td>Comparator</td><td>Calendar.getInstance</td></tr>
</table>
<p>Factory Method is often one step inside a Template Method.</p>`),
  ],
  expert: [
    blk(`<h4>Real-time example 1: servlet-style request dispatch</h4>
<p>A web framework receives a request, picks the method, handles errors and writes a response. Application code overrides only <code>doGet</code> and <code>doPost</code>. This mirrors <code>HttpServlet</code> and Spring's <code>FrameworkServlet</code>, including the default "405 not allowed" behaviour of unimplemented hooks.</p>`,
`// Real-time: mini HttpServlet with a final service() template

public class TmServletDemo {
    public static void main(String[] args) {
        TmServlet orders = new TmOrderServlet();
        System.out.println(orders.service("GET", "/orders/17"));
        System.out.println(orders.service("POST", "/orders"));
        System.out.println(orders.service("GET", "/orders/0"));

        TmServlet health = new TmHealthServlet();
        System.out.println(health.service("POST", "/health"));
        System.out.println(health.service("DELETE", "/health"));
    }
}

abstract class TmServlet {
    public final String service(String method, String path) {
        System.out.println("-> " + method + " " + path);
        try {
            switch (method) {
                case "GET":
                    return doGet(path);
                case "POST":
                    return doPost(path);
                default:
                    return "501 Not Implemented";
            }
        } catch (RuntimeException e) {
            return "500 " + e.getMessage();     // error handling lives in the template
        } finally {
            System.out.println("<- done " + path);
        }
    }

    protected String doGet(String path) {
        return "405 Method Not Allowed";        // default hook
    }

    protected String doPost(String path) {
        return "405 Method Not Allowed";
    }
}

class TmOrderServlet extends TmServlet {
    @Override
    protected String doGet(String path) {
        if (path.endsWith("/0")) {
            throw new IllegalArgumentException("order 0 does not exist");
        }
        return "200 order details for " + path;
    }

    @Override
    protected String doPost(String path) {
        return "201 created under " + path;
    }
}

class TmHealthServlet extends TmServlet {
    @Override
    protected String doGet(String path) {
        return "200 UP";
    }
}
// OUTPUT:
// -> GET /orders/17
// <- done /orders/17
// 200 order details for /orders/17
// -> POST /orders
// <- done /orders
// 201 created under /orders
// -> GET /orders/0
// <- done /orders/0
// 500 order 0 does not exist
// -> POST /health
// <- done /health
// 405 Method Not Allowed
// -> DELETE /health
// <- done /health
// 501 Not Implemented
`),
    blk(`<h4>Real-time example 2: batch job with retry and audit hooks</h4>
<p>Nightly batch jobs share a lifecycle: before, process each item, count failures, after. The template guarantees that the audit line is always printed, while concrete jobs only decide how to process one item and optionally how to react to failure.</p>`,
`// Real-time: batch job template with failure hook and summary
import java.util.List;

public class TmBatchJobDemo {
    public static void main(String[] args) {
        new TmSalaryJob().run(List.of("Asha:42000", "Ravi:abc", "Meera:38000"));
        new TmEmailJob().run(List.of("asha@example.com", "ravi.example.com"));
    }
}

abstract class TmBatchJob {
    public final void run(List<String> items) {
        int ok = 0;
        int failed = 0;
        before();
        for (String item : items) {
            try {
                process(item);
                ok++;
            } catch (RuntimeException e) {
                failed++;
                onFailure(item, e);
            }
        }
        System.out.println("[" + jobName() + "] ok=" + ok + " failed=" + failed);
    }

    protected abstract String jobName();

    protected abstract void process(String item);

    protected void before() {
        System.out.println("[" + jobName() + "] starting");
    }

    protected void onFailure(String item, RuntimeException e) {
        System.out.println("  skipped " + item + ": " + e.getMessage());
    }
}

class TmSalaryJob extends TmBatchJob {
    @Override
    protected String jobName() {
        return "salary";
    }

    @Override
    protected void process(String item) {
        String[] parts = item.split(":");
        int amount = Integer.parseInt(parts[1]);   // may throw NumberFormatException
        System.out.println("  paid " + amount + " to " + parts[0]);
    }
}

class TmEmailJob extends TmBatchJob {
    @Override
    protected String jobName() {
        return "email";
    }

    @Override
    protected void process(String item) {
        if (!item.contains("@")) {
            throw new IllegalArgumentException("bad address");
        }
        System.out.println("  mailed " + item);
    }

    @Override
    protected void onFailure(String item, RuntimeException e) {
        System.out.println("  QUEUED FOR RETRY: " + item);  // custom reaction
    }
}
// OUTPUT:
// [salary] starting
//   paid 42000 to Asha
//   skipped Ravi:abc: For input string: "abc"
//   paid 38000 to Meera
// [salary] ok=2 failed=1
// [email] starting
//   mailed asha@example.com
//   QUEUED FOR RETRY: ravi.example.com
// [email] ok=1 failed=1
`),
    blk(`<h4>Sample mini project: order processing for two channels</h4>
<p>An online shop and a walk-in store both follow the same order flow. The template validates, prices, charges, ships and notifies. Each channel supplies its own shipping and notification, and the store channel turns off the delivery fee with a hook.</p>`,
`// Mini project: order processing template for web and store orders
import java.util.ArrayList;
import java.util.List;

public class TmOrderProject {
    public static void main(String[] args) {
        TmOrderProcessor web = new TmWebOrderProcessor();
        TmOrderProcessor store = new TmStoreOrderProcessor();

        System.out.println(web.process(new TmOrder("Asha", "Pune", 1200)));
        System.out.println(store.process(new TmOrder("Ravi", "Pune", 800)));
        System.out.println(web.process(new TmOrder("Meera", "Nashik", 0)));
    }
}

class TmOrder {
    final String customer;
    final String city;
    final int amount;

    TmOrder(String customer, String city, int amount) {
        this.customer = customer;
        this.city = city;
        this.amount = amount;
    }
}

abstract class TmOrderProcessor {
    private final List<String> log = new ArrayList<>();

    public final List<String> process(TmOrder order) {
        log.clear();
        if (!validate(order)) {
            log.add("REJECTED " + order.customer);
            return log;
        }
        int total = order.amount + deliveryFee(order);
        log.add("PRICED " + total);
        log.add("CHARGED " + total);
        log.add(ship(order));
        log.add(notifyCustomer(order));
        return log;
    }

    protected boolean validate(TmOrder order) {
        return order.amount > 0;
    }

    protected int deliveryFee(TmOrder order) {
        return 50;
    }

    protected abstract String ship(TmOrder order);

    protected abstract String notifyCustomer(TmOrder order);
}

class TmWebOrderProcessor extends TmOrderProcessor {
    @Override
    protected String ship(TmOrder order) {
        return "COURIER to " + order.city;
    }

    @Override
    protected String notifyCustomer(TmOrder order) {
        return "EMAIL sent to " + order.customer;
    }
}

class TmStoreOrderProcessor extends TmOrderProcessor {
    @Override
    protected int deliveryFee(TmOrder order) {
        return 0; // customer carries the goods home
    }

    @Override
    protected String ship(TmOrder order) {
        return "HANDED OVER at counter";
    }

    @Override
    protected String notifyCustomer(TmOrder order) {
        return "PRINTED receipt for " + order.customer;
    }
}
// OUTPUT:
// [PRICED 1250, CHARGED 1250, COURIER to Pune, EMAIL sent to Asha]
// [PRICED 800, CHARGED 800, HANDED OVER at counter, PRINTED receipt for Ravi]
// [REJECTED Meera]
`),
    blk(`<h4>Thread safety, testing and Spring integration</h4>
<ul>
<li><b>Thread safety:</b> a template object is shared by many callers only if it holds <b>no per-call state</b>. In the order example the <code>log</code> field makes the processor unsafe for concurrent use; in production return a local list instead of storing it in a field.</li>
<li><b>Testing:</b> test the skeleton once with a tiny test subclass that records the order of calls. Then test each concrete step on its own. Hook defaults deserve one test each.</li>
<li><b>Spring:</b> prefer the callback templates (<code>JdbcTemplate</code>, <code>RestTemplate</code>, <code>TransactionTemplate</code>, <code>KafkaTemplate</code>) over writing your own inheritance hierarchy. When you do subclass, mark the template <code>final</code> and register the concrete classes as beans; a service can then receive them as a <code>Map&lt;String, Processor&gt;</code> keyed by bean name.</li>
<li><b>Spring proxies:</b> a <code>final</code> template method on a bean that needs a CGLIB proxy cannot be intercepted (for example by <code>@Transactional</code>). Put the annotation on the concrete steps or on a separate service.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Inheritance for code reuse only:</b> extending a class just to reuse a helper, with no real shared algorithm.</li>
<li><b>Fragile base class:</b> changing the order in the base class silently breaks every subclass.</li>
<li><b>Steps that call each other in a hidden order</b> so subclasses must know the template's internals.</li>
<li><b>Empty overrides everywhere,</b> a sign that the steps should be hooks or that Strategy is a better fit.</li>
</ul>`),
  ],
  interviewQA: [
    ['What is the Template Method pattern?', 'It defines the skeleton of an algorithm in a base class method and defers some steps to subclasses. The template method is usually final, so subclasses can change the steps but not the order.'],
    ['What is the difference between an abstract step and a hook method?', 'An abstract step has no body and every subclass must implement it. A hook has a default body (often empty or returning true) and a subclass may override it to customise or extend behaviour.'],
    ['What is the Hollywood principle?', 'High-level code calls low-level code, not the reverse: "Do not call us, we will call you." In Template Method the base class calls the subclass steps. Frameworks use it for lifecycle callbacks.'],
    ['Template Method or Strategy: how do you choose?', 'Template Method uses inheritance and varies parts of an algorithm at compile time. Strategy uses composition and swaps the whole algorithm at run time. If you need to change behaviour dynamically or avoid deep hierarchies, use Strategy.'],
    ['Give JDK or Spring examples of Template Method.', 'HttpServlet.service calling doGet and doPost, InputStream.read(byte[]) built on read(), AbstractList and AbstractMap, and in Spring JdbcTemplate, RestTemplate and TransactionTemplate, which handle the boilerplate and call your callback.'],
    ['Why should the template method be final?', 'To guarantee the algorithm order. Without final, a subclass can override the template itself and defeat the purpose, which is to control the skeleton and expose only specific extension points.'],
    ['What is the danger of calling an overridable method in a constructor?', 'The superclass constructor runs before the subclass fields are initialised, so the overridden method may see null or default values. Do not call overridable steps from constructors; start the algorithm from an explicit method instead.'],
  ],
};

const memento: TopicExtra = {
  beginner: [
    blk(`<h4>In one minute</h4>
<p>The <b>Memento pattern</b> lets an object save a <b>snapshot of its own state</b> and restore it later, without exposing its internals. Three roles work together: the <b>Originator</b> (the object whose state is saved), the <b>Memento</b> (an opaque, ideally immutable snapshot) and the <b>Caretaker</b> (keeps the snapshots but never looks inside them). The key idea is <b>encapsulation</b>: only the originator can read or write the memento's content.</p>
<h4>More real-life analogies</h4>
<ul>
<li><b>Video game checkpoint:</b> the game saves your level, health and inventory. Loading the save puts everything back exactly.</li>
<li><b>Bank passbook entry:</b> a printed balance line is a snapshot of the account at that moment; it does not change when the account changes later.</li>
<li><b>Photograph of your desk before cleaning:</b> if you cannot remember where things were, you restore from the photo.</li>
</ul>
<h4>Where you see it in Java and Spring</h4>
<ul>
<li><code>java.io.Serializable</code> with <code>ObjectOutputStream</code>: the byte array is a memento of the object graph, and <code>ObjectInputStream</code> restores it.</li>
<li><code>java.util.Date.clone()</code>, <code>Object.clone()</code> and copy constructors produce snapshots for defensive copies.</li>
<li><code>javax.swing.undo.UndoManager</code> and <code>StateEdit</code> in Swing text components.</li>
<li><code>HttpSession</code> attribute persistence, and Hibernate's "loaded state" array that it keeps to detect dirty fields (a memento of each entity).</li>
<li>Spring Web Flow snapshots, and database transaction savepoints (<code>Connection.setSavepoint</code>) are memento-like.</li>
</ul>`),
    blk(`<h4>Structure as text</h4>
<pre>
Caretaker  ----holds list of---->  Memento (immutable data)
    |                                  ^
    | save() / restore()               | created by / read by
    v                                  |
Originator  ---- createMemento() ------+
            ---- restore(memento)
</pre>
<h4>When to use</h4>
<ul>
<li>You need <b>undo, rollback or checkpoints</b> and the state is easy to copy.</li>
<li>You must save state without breaking <b>encapsulation</b> (no public getters for every field).</li>
<li>You want <b>named save points</b> a user can return to.</li>
</ul>
<h4>When NOT to use</h4>
<ul>
<li>The state is huge and changes often; storing many full snapshots wastes memory (use Command with inverse operations or store only diffs).</li>
<li>The object holds resources that cannot be copied, such as open sockets or threads.</li>
<li>State is already persisted elsewhere (a database with history); a memento adds nothing.</li>
</ul>
<h4>Sample program: save and restore a volume setting</h4>
<p>A small, complete example using a Java <code>record</code> as an immutable memento. The caretaker only stores it.</p>`,
`// Memento: a record as an immutable snapshot of a music player
import java.util.ArrayDeque;
import java.util.Deque;

public class MmBeginnerPlayerDemo {
    public static void main(String[] args) {
        MmPlayer player = new MmPlayer();
        Deque<MmPlayer.Snapshot> saved = new ArrayDeque<>();

        player.set("Apna Time Aayega", 6);
        saved.push(player.save());          // caretaker stores the snapshot
        System.out.println("Now    : " + player);

        player.set("Lavani Mix", 10);
        System.out.println("Changed: " + player);

        player.restore(saved.pop());        // go back
        System.out.println("Restored: " + player);
    }
}

class MmPlayer {
    private String song = "none";
    private int volume = 5;

    void set(String song, int volume) {
        this.song = song;
        this.volume = volume;
    }

    // The memento is a nested record: only data, no behaviour
    record Snapshot(String song, int volume) {
    }

    Snapshot save() {
        return new Snapshot(song, volume);
    }

    void restore(Snapshot snapshot) {
        this.song = snapshot.song();
        this.volume = snapshot.volume();
    }

    @Override
    public String toString() {
        return song + " at volume " + volume;
    }
}
// OUTPUT:
// Now    : Apna Time Aayega at volume 6
// Changed: Lavani Mix at volume 10
// Restored: Apna Time Aayega at volume 6
`),
  ],
  intermediate: [
    blk(`<h4>1. Game save slots</h4>
<p><b>What it shows:</b> a caretaker that keeps <b>named</b> save points in a map. <b>Why:</b> unlike a simple undo stack, the player can jump to any earlier checkpoint, and the game class stays unaware of how saves are stored.</p>`,
`// Memento: named save slots for a small adventure game
import java.util.LinkedHashMap;
import java.util.Map;

public class MmGameSaveDemo {
    public static void main(String[] args) {
        MmGame game = new MmGame();
        MmSaveSlots slots = new MmSaveSlots();

        game.travel("Lonavala", 10, 25);
        slots.put("before-fort", game.save());

        game.travel("Rajgad", 40, 60);
        slots.put("after-fort", game.save());

        game.travel("Torna", 70, 0);   // a bad trip
        System.out.println("Now        : " + game);

        game.load(slots.get("after-fort"));
        System.out.println("after-fort : " + game);

        game.load(slots.get("before-fort"));
        System.out.println("before-fort: " + game);
        System.out.println(slots);
    }
}

class MmGame {
    private String location = "Pune";
    private int health = 100;
    private int coins = 0;

    void travel(String place, int healthLoss, int coinsFound) {
        location = place;
        health -= healthLoss;
        coins += coinsFound;
    }

    record Save(String location, int health, int coins) {
    }

    Save save() {
        return new Save(location, health, coins);
    }

    void load(Save save) {
        location = save.location();
        health = save.health();
        coins = save.coins();
    }

    @Override
    public String toString() {
        return location + " | health " + health + " | coins " + coins;
    }
}

class MmSaveSlots {
    private final Map<String, MmGame.Save> slots = new LinkedHashMap<>();

    void put(String name, MmGame.Save save) {
        slots.put(name, save);
    }

    MmGame.Save get(String name) {
        return slots.get(name);
    }

    @Override
    public String toString() {
        return "slots " + slots.keySet();
    }
}
// OUTPUT:
// Now        : Torna | health -20 | coins 85
// after-fort : Rajgad | health 50 | coins 85
// before-fort: Lonavala | health 90 | coins 25
// slots [before-fort, after-fort]
`),
    blk(`<h4>2. Undo and redo with a bounded history</h4>
<p><b>What it shows:</b> a history that keeps at most N snapshots and supports redo. <b>Why:</b> snapshots cost memory, so real editors cap the history. The pointer-in-a-list design also makes redo trivial.</p>`,
`// Memento: bounded undo/redo history using a list and a cursor
import java.util.ArrayList;
import java.util.List;

public class MmUndoRedoDemo {
    public static void main(String[] args) {
        MmNote note = new MmNote();
        MmHistory history = new MmHistory(3);   // keeps only 3 states
        history.record(note.save());

        for (String word : new String[] {"Jai ", "Bhavani ", "Jai ", "Shivaji"}) {
            note.type(word);
            history.record(note.save());
        }
        System.out.println("Current: " + note);

        note.restore(history.undo());
        System.out.println("Undo 1 : " + note);
        note.restore(history.undo());
        System.out.println("Undo 2 : " + note);
        note.restore(history.undo());
        System.out.println("Undo 3 : " + note + "  (oldest kept state)");

        note.restore(history.redo());
        System.out.println("Redo   : " + note);
    }
}

class MmNote {
    private String text = "";

    void type(String more) {
        text = text + more;
    }

    String save() {
        return text;          // String is immutable, so it is a safe memento
    }

    void restore(String snapshot) {
        text = snapshot;
    }

    @Override
    public String toString() {
        return "'" + text + "'";
    }
}

class MmHistory {
    private final List<String> states = new ArrayList<>();
    private final int limit;
    private int cursor = -1;

    MmHistory(int limit) {
        this.limit = limit;
    }

    void record(String state) {
        while (states.size() > cursor + 1) {
            states.remove(states.size() - 1); // drop the redo branch
        }
        states.add(state);
        if (states.size() > limit) {
            states.remove(0);                 // forget the oldest
        }
        cursor = states.size() - 1;
    }

    String undo() {
        if (cursor > 0) {
            cursor--;
        }
        return states.get(cursor);
    }

    String redo() {
        if (cursor < states.size() - 1) {
            cursor++;
        }
        return states.get(cursor);
    }
}
// OUTPUT:
// Current: 'Jai Bhavani Jai Shivaji'
// Undo 1 : 'Jai Bhavani Jai '
// Undo 2 : 'Jai Bhavani '
// Undo 3 : 'Jai Bhavani '  (oldest kept state)
// Redo   : 'Jai Bhavani Jai '
`),
    blk(`<h4>3. Memento through serialization</h4>
<p><b>What it shows:</b> the originator writes itself into a byte array and reads it back. <b>Why:</b> this gives a <b>deep copy</b> of a whole object graph with almost no code, and the bytes can be saved to a file or sent over a network. Fields marked <code>transient</code> are skipped.</p>`,
`// Memento via Java serialization: snapshot to bytes and back
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class MmSerializationDemo {
    public static void main(String[] args) throws Exception {
        MmCart cart = new MmCart();
        cart.items.add("Paithani saree");
        cart.items.add("Kolhapuri chappal");

        byte[] memento = MmCart.snapshot(cart);
        System.out.println("Snapshot taken, bytes > 0: " + (memento.length > 0));

        cart.items.clear();
        System.out.println("Cart after clearing: " + cart.items);

        MmCart restored = MmCart.restore(memento);
        System.out.println("Restored items     : " + restored.items);
        System.out.println("Transient token    : " + restored.sessionToken);
    }
}

class MmCart implements Serializable {
    private static final long serialVersionUID = 1L;

    final List<String> items = new ArrayList<>();
    transient String sessionToken = "abc-123";   // not saved on purpose

    static byte[] snapshot(MmCart cart) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(cart);
        }
        return bytes.toByteArray();
    }

    static MmCart restore(byte[] data) throws IOException, ClassNotFoundException {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(data))) {
            return (MmCart) in.readObject();
        }
    }
}
// OUTPUT:
// Snapshot taken, bytes > 0: true
// Cart after clearing: []
// Restored items     : [Paithani saree, Kolhapuri chappal]
// Transient token    : null
`),
    blk(`<h4>4. The shallow copy trap</h4>
<p><b>What it shows:</b> the most common memento bug. A snapshot that copies only the reference to a mutable list is not a snapshot at all. <b>Why it matters:</b> the "saved" state changes together with the live one, and restore appears to do nothing. The fix is a <b>defensive deep copy</b> when saving.</p>`,
`// Memento pitfall: shallow versus deep copy of a mutable list
import java.util.ArrayList;
import java.util.List;

public class MmShallowCopyDemo {
    public static void main(String[] args) {
        MmPlaylist playlist = new MmPlaylist();
        playlist.add("Malhari");

        List<String> shallow = playlist.shallowSnapshot();
        List<String> deep = playlist.deepSnapshot();

        playlist.add("Deva Shree Ganesha");

        System.out.println("Live playlist : " + playlist);
        System.out.println("Shallow saved : " + shallow + "  <- changed by mistake");
        System.out.println("Deep saved    : " + deep + "  <- still the old state");
    }
}

class MmPlaylist {
    private final List<String> songs = new ArrayList<>();

    void add(String song) {
        songs.add(song);
    }

    List<String> shallowSnapshot() {
        return songs;                    // BUG: same list object
    }

    List<String> deepSnapshot() {
        return new ArrayList<>(songs);   // correct: independent copy
    }

    @Override
    public String toString() {
        return songs.toString();
    }
}
// OUTPUT:
// Live playlist : [Malhari, Deva Shree Ganesha]
// Shallow saved : [Malhari, Deva Shree Ganesha]  <- changed by mistake
// Deep saved    : [Malhari]  <- still the old state
`),
    blk(`<h4>Common mistakes</h4>
<ul>
<li><b>Mutable mementos.</b> If the caretaker or anyone else can change a snapshot, restore is unreliable. Use records, immutable classes or defensive copies.</li>
<li><b>Shallow copies</b> of collections and nested objects (see sample 4).</li>
<li><b>Unlimited history.</b> One full snapshot per keystroke will exhaust memory. Cap the size or store diffs.</li>
<li><b>Exposing the originator's fields</b> through a public memento getter, which defeats the encapsulation that is the whole point.</li>
<li><b>Forgetting to snapshot all state,</b> for example saving the text but not the cursor position.</li>
</ul>
<h4>Memento vs Command vs Prototype</h4>
<table>
<tr><th>Aspect</th><th>Memento</th><th>Command undo</th><th>Prototype</th></tr>
<tr><td>Stores</td><td>A copy of the state</td><td>The inverse operation</td><td>A template object to clone</td></tr>
<tr><td>Memory cost</td><td>High (full state each time)</td><td>Low</td><td>Per clone</td></tr>
<tr><td>Effort per feature</td><td>Low, generic</td><td>Must write undo for every command</td><td>Low</td></tr>
<tr><td>Best for</td><td>Checkpoints, rollback</td><td>Fine-grained editing history</td><td>Creating many similar objects</td></tr>
<tr><td>Encapsulation</td><td>Originator-only access</td><td>Command knows the receiver API</td><td>Clone method</td></tr>
</table>`),
  ],
  expert: [
    blk(`<h4>Real-time example 1: shopping cart checkpoint and rollback</h4>
<p>Before a risky multi-step operation (applying coupons, then payment), the cart takes a checkpoint. If any step fails, the cart is restored so the customer never sees a half-updated total. This is the same shape as transaction savepoints.</p>`,
`// Real-time: checkpoint before a risky checkout, rollback on failure
import java.util.LinkedHashMap;
import java.util.Map;

public class MmCheckoutDemo {
    public static void main(String[] args) {
        MmShop cart = new MmShop();
        cart.add("Pen drive", 700);
        cart.add("Mouse", 300);
        System.out.println("Before : " + cart);

        MmShop.Checkpoint checkpoint = cart.checkpoint();
        try {
            cart.applyDiscount(20);
            cart.add("Gift wrap", 50);
            System.out.println("Midway : " + cart);
            throw new IllegalStateException("payment gateway timeout");
        } catch (IllegalStateException e) {
            System.out.println("Failed : " + e.getMessage());
            cart.rollback(checkpoint);
        }
        System.out.println("After  : " + cart);
    }
}

class MmShop {
    private final Map<String, Integer> prices = new LinkedHashMap<>();
    private int discountPercent = 0;

    void add(String item, int price) {
        prices.put(item, price);
    }

    void applyDiscount(int percent) {
        this.discountPercent = percent;
    }

    int total() {
        int sum = 0;
        for (int price : prices.values()) {
            sum += price;
        }
        return sum - sum * discountPercent / 100;
    }

    record Checkpoint(Map<String, Integer> prices, int discountPercent) {
    }

    Checkpoint checkpoint() {
        return new Checkpoint(new LinkedHashMap<>(prices), discountPercent); // deep copy
    }

    void rollback(Checkpoint checkpoint) {
        prices.clear();
        prices.putAll(checkpoint.prices());
        discountPercent = checkpoint.discountPercent();
    }

    @Override
    public String toString() {
        return prices + " discount " + discountPercent + "% total " + total();
    }
}
// OUTPUT:
// Before : {Pen drive=700, Mouse=300} discount 0% total 1000
// Midway : {Pen drive=700, Mouse=300, Gift wrap=50} discount 20% total 840
// Failed : payment gateway timeout
// After  : {Pen drive=700, Mouse=300} discount 0% total 1000
`),
    blk(`<h4>Real-time example 2: spreadsheet cell history with a memory budget</h4>
<p>A spreadsheet stores a snapshot per edit but only for the last few edits. Instead of copying the whole sheet, each memento stores just the changed cell (a small <b>delta memento</b>). This is the practical compromise for large documents.</p>`,
`// Real-time: delta mementos keep undo cheap for a large sheet
import java.util.ArrayDeque;
import java.util.Deque;

public class MmSheetDemo {
    public static void main(String[] args) {
        MmSheetEditor editor = new MmSheetEditor(2);
        editor.edit(7, 100);
        editor.edit(7, 250);
        editor.edit(7, 999);
        System.out.println("Cell 7 = " + editor.value(7) + ", history = " + editor.historySize());

        editor.undo();
        System.out.println("After undo 1: " + editor.value(7));
        editor.undo();
        System.out.println("After undo 2: " + editor.value(7));
        System.out.println("More undo possible? " + editor.undo());
    }
}

class MmSheet {
    private final int[] cells = new int[1000];   // pretend it is huge

    void set(int index, int value) {
        cells[index] = value;
    }

    int get(int index) {
        return cells[index];
    }
}

record MmCellEdit(int index, int oldValue) {
}

class MmSheetEditor {
    private final MmSheet sheet = new MmSheet();
    private final Deque<MmCellEdit> history = new ArrayDeque<>();
    private final int maxHistory;

    MmSheetEditor(int maxHistory) {
        this.maxHistory = maxHistory;
    }

    void edit(int index, int value) {
        history.push(new MmCellEdit(index, sheet.get(index))); // store only the delta
        if (history.size() > maxHistory) {
            history.removeLast();                              // drop the oldest
        }
        sheet.set(index, value);
    }

    boolean undo() {
        if (history.isEmpty()) {
            return false;
        }
        MmCellEdit last = history.pop();
        sheet.set(last.index(), last.oldValue());
        return true;
    }

    int value(int index) {
        return sheet.get(index);
    }

    int historySize() {
        return history.size();
    }
}
// OUTPUT:
// Cell 7 = 999, history = 2
// After undo 1: 250
// After undo 2: 100
// More undo possible? false
`),
    blk(`<h4>Sample mini project: drawing canvas with undo, redo and named versions</h4>
<p>A canvas stores shapes as immutable text records. The <code>Canvas</code> is the originator, <code>Version</code> the memento and <code>VersionManager</code> the caretaker with undo, redo and named versions. The program prints a readable story of a design session.</p>`,
`// Mini project: canvas with undo, redo and named versions
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MmCanvasProject {
    public static void main(String[] args) {
        MmCanvas canvas = new MmCanvas();
        MmVersionManager manager = new MmVersionManager(canvas);

        manager.draw("circle(Raigad)");
        manager.draw("square(Sinhagad)");
        manager.saveAs("v1");
        System.out.println("Drawn   : " + canvas);

        manager.draw("line(Pune-Mumbai)");
        System.out.println("Added   : " + canvas);

        manager.undo();
        System.out.println("Undo    : " + canvas);

        manager.redo();
        System.out.println("Redo    : " + canvas);

        manager.load("v1");
        System.out.println("Load v1 : " + canvas);

        manager.undo();
        System.out.println("Undo it : " + canvas);
    }
}

class MmCanvas {
    private final List<String> shapes = new ArrayList<>();

    void draw(String shape) {
        shapes.add(shape);
    }

    record Version(List<String> shapes) {
        Version {
            shapes = List.copyOf(shapes);   // immutable deep copy
        }
    }

    Version snapshot() {
        return new Version(shapes);
    }

    void restore(Version version) {
        shapes.clear();
        shapes.addAll(version.shapes());
    }

    @Override
    public String toString() {
        return shapes.toString();
    }
}

class MmVersionManager {
    private final MmCanvas canvas;
    private final Deque<MmCanvas.Version> undo = new ArrayDeque<>();
    private final Deque<MmCanvas.Version> redo = new ArrayDeque<>();
    private final Map<String, MmCanvas.Version> named = new HashMap<>();

    MmVersionManager(MmCanvas canvas) {
        this.canvas = canvas;
    }

    void draw(String shape) {
        undo.push(canvas.snapshot());   // state BEFORE the change
        redo.clear();
        canvas.draw(shape);
    }

    void undo() {
        if (undo.isEmpty()) {
            return;
        }
        redo.push(canvas.snapshot());
        canvas.restore(undo.pop());
    }

    void redo() {
        if (redo.isEmpty()) {
            return;
        }
        undo.push(canvas.snapshot());
        canvas.restore(redo.pop());
    }

    void saveAs(String name) {
        named.put(name, canvas.snapshot());
    }

    void load(String name) {
        undo.push(canvas.snapshot());
        canvas.restore(named.get(name));
    }
}
// OUTPUT:
// Drawn   : [circle(Raigad), square(Sinhagad)]
// Added   : [circle(Raigad), square(Sinhagad), line(Pune-Mumbai)]
// Undo    : [circle(Raigad), square(Sinhagad)]
// Redo    : [circle(Raigad), square(Sinhagad), line(Pune-Mumbai)]
// Load v1 : [circle(Raigad), square(Sinhagad)]
// Undo it : [circle(Raigad), square(Sinhagad), line(Pune-Mumbai)]
`),
    blk(`<h4>Thread safety, testing and Spring integration</h4>
<ul>
<li><b>Thread safety:</b> take the snapshot while holding the same lock that guards mutation, otherwise you may capture a half-updated state. Immutable mementos (records with defensive copies) can then be shared freely between threads.</li>
<li><b>Testing:</b> the key property is the round trip: <code>save(); change(); restore();</code> must equal the original state. Add a test that mutates the object after saving to catch shallow-copy bugs, and a test that the history limit is respected.</li>
<li><b>Security and compatibility:</b> serialized mementos should not be read from untrusted sources (deserialization attacks). Keep a <code>serialVersionUID</code>, and prefer a JSON or record based format for long-term storage.</li>
<li><b>Spring and persistence:</b> an audit table or the <b>Envers</b> library for Hibernate keeps entity history in the database, which is a durable, queryable memento. In-memory <code>HttpSession</code> state should be small and serializable so it can be replicated across nodes.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Snapshot per keystroke of a huge object:</b> store deltas or use Command.</li>
<li><b>Memento that holds live references</b> to services, threads or connections.</li>
<li><b>Caretaker that edits the memento</b> or reads private fields via reflection.</li>
<li><b>Using mementos as a database:</b> long-lived history belongs in persistent storage with versioning, not in a static list.</li>
</ul>`),
  ],
  interviewQA: [
    ['What are the three roles in the Memento pattern?', 'The Originator creates a memento of its own state and restores from one. The Memento is an opaque snapshot, ideally immutable. The Caretaker stores mementos and hands them back but never inspects or changes them.'],
    ['How does Memento preserve encapsulation?', 'Only the originator can read the memento content. The caretaker sees an opaque object (often a nested private or package-private class or record), so no extra public getters are added to the originator.'],
    ['What is the difference between Memento and Command for undo?', 'Memento restores a saved copy of state, which is simple but memory heavy. Command stores the inverse operation, which is light but requires an undo method per command. Many editors combine them or use delta mementos.'],
    ['What is the shallow copy problem in Memento?', 'If the snapshot stores references to mutable objects such as lists, later changes to the live object also change the snapshot. Take a defensive deep copy, or use immutable collections like List.copyOf.'],
    ['How can you reduce the memory cost of many mementos?', 'Cap the history size, store only the changed fields (delta mementos), share unchanged immutable parts between snapshots, or snapshot only at meaningful checkpoints instead of every edit.'],
    ['How does Java serialization relate to Memento?', 'Writing an object to bytes with ObjectOutputStream is a ready-made memento of its whole object graph, and reading it back restores a deep copy. Mark sensitive or runtime-only fields transient, and never deserialize untrusted data.'],
    ['Where would you use Memento in a real backend system?', 'Savepoints inside a transaction, checkpointing a long batch job so it can resume, wizard or draft state before the final submit, and rollback of in-memory configuration when a reload fails validation.'],
  ],
};

const state: TopicExtra = {
  beginner: [
    blk(`<h4>In one minute</h4>
<p>The <b>State pattern</b> lets an object change its behaviour when its <b>internal state</b> changes, so it looks as if the object changed its class. Instead of giant <code>if / else</code> or <code>switch</code> blocks that test a status field in every method, each state becomes its own object (or enum constant) that knows <b>what to do</b> and <b>what the next state is</b>. The object that owns the state is the <b>Context</b>; it simply forwards calls to the current state.</p>
<h4>More real-life analogies</h4>
<ul>
<li><b>Traffic signal:</b> red, green and yellow each behave differently, and each knows which colour follows.</li>
<li><b>Mobile phone profile:</b> in silent mode an incoming call vibrates, in normal mode it rings. The same event gives different behaviour.</li>
<li><b>Courier parcel:</b> booked, in transit, out for delivery, delivered. "Cancel" is allowed only in the first states.</li>
</ul>
<h4>Where you see it in Java and Spring</h4>
<ul>
<li><code>java.lang.Thread.State</code> (NEW, RUNNABLE, BLOCKED, WAITING, TERMINATED) is an enum that models a state machine.</li>
<li><code>java.util.concurrent.Future</code> behaves differently before and after completion; <code>CompletableFuture</code> has pending, completed and failed states.</li>
<li>Enum constants with their own method bodies (<code>TimeUnit</code>, <code>RoundingMode</code>-style design) are the modern, compact way to write State.</li>
<li>Spring: <b>Spring Statemachine</b>, Spring Batch <code>BatchStatus</code> and <code>ExitStatus</code>, and JPA entity lifecycle (transient, managed, detached, removed).</li>
</ul>`),
    blk(`<h4>Structure as text</h4>
<pre>
Context (TrafficLight)
   - state : State          ---- delegates ---->  State  &lt;&lt;interface&gt;&gt;
   + request()                                     + handle(Context)
                                                       ^
                          +----------------------------+-----------------+
                       RedState                    GreenState        YellowState
                      handle(): ... setState(Green) ...
</pre>
<h4>When to use</h4>
<ul>
<li>An object has <b>many modes</b> and its methods are full of <code>if (status == ...)</code> checks.</li>
<li>The <b>allowed actions</b> depend on the current state (cancel only before shipping).</li>
<li>State <b>transitions</b> form a clear diagram that you want to see in the code.</li>
</ul>
<h4>When NOT to use</h4>
<ul>
<li>There are only two states and one or two conditions; a boolean is clearer.</li>
<li>The state is just data that does not change behaviour.</li>
<li>Transitions are driven by a large external rule set; a table or a workflow engine fits better than many classes.</li>
</ul>
<h4>Sample program: a traffic light using an enum</h4>
<p>A compact beginner version. Each enum constant knows its own message and its next constant. No <code>if</code> chains appear anywhere.</p>`,
`// State pattern with an enum: traffic light that knows its next state

public class StBeginnerTrafficDemo {
    public static void main(String[] args) {
        StSignal signal = StSignal.RED;     // the context only holds the state

        for (int i = 0; i < 5; i++) {
            System.out.println(signal + ": " + signal.message());
            signal = signal.next();         // transition
        }
    }
}

enum StSignal {
    RED("Stop") {
        @Override
        StSignal next() {
            return GREEN;
        }
    },
    GREEN("Go") {
        @Override
        StSignal next() {
            return YELLOW;
        }
    },
    YELLOW("Get ready to stop") {
        @Override
        StSignal next() {
            return RED;
        }
    };

    private final String message;

    StSignal(String message) {
        this.message = message;
    }

    abstract StSignal next();

    String message() {
        return message;
    }
}
// OUTPUT:
// RED: Stop
// GREEN: Go
// YELLOW: Get ready to stop
// RED: Stop
// GREEN: Go
`),
  ],
  intermediate: [
    blk(`<h4>1. Vending machine with state classes</h4>
<p><b>What it shows:</b> the classic State layout: one class per state, a context that delegates, and states that trigger transitions. <b>Why:</b> invalid actions (pressing "dispense" with no money) are handled inside the state that owns that rule, so the machine class has zero conditionals.</p>`,
`// State pattern: vending machine with one class per state

public class StVendingDemo {
    public static void main(String[] args) {
        StVendingMachine machine = new StVendingMachine(1);

        machine.pressButton();
        machine.insertCoin();
        machine.insertCoin();
        machine.pressButton();
        machine.insertCoin();
        machine.pressButton();
    }
}

interface StVendingState {
    void insertCoin(StVendingMachine machine);

    void pressButton(StVendingMachine machine);
}

class StIdle implements StVendingState {
    @Override
    public void insertCoin(StVendingMachine machine) {
        System.out.println("Coin accepted");
        machine.setState(new StHasCoin());
    }

    @Override
    public void pressButton(StVendingMachine machine) {
        System.out.println("Insert a coin first");
    }
}

class StHasCoin implements StVendingState {
    @Override
    public void insertCoin(StVendingMachine machine) {
        System.out.println("Coin already inserted");
    }

    @Override
    public void pressButton(StVendingMachine machine) {
        System.out.println("Dispensing a snack");
        machine.useOneSnack();
        if (machine.snacks() == 0) {
            machine.setState(new StSoldOut());
        } else {
            machine.setState(new StIdle());
        }
    }
}

class StSoldOut implements StVendingState {
    @Override
    public void insertCoin(StVendingMachine machine) {
        System.out.println("Sold out, coin returned");
    }

    @Override
    public void pressButton(StVendingMachine machine) {
        System.out.println("Sold out");
    }
}

class StVendingMachine {
    private StVendingState state = new StIdle();
    private int snacks;

    StVendingMachine(int snacks) {
        this.snacks = snacks;
    }

    void setState(StVendingState state) {
        this.state = state;
    }

    void useOneSnack() {
        snacks--;
    }

    int snacks() {
        return snacks;
    }

    void insertCoin() {
        state.insertCoin(this);
    }

    void pressButton() {
        state.pressButton(this);
    }
}
// OUTPUT:
// Insert a coin first
// Coin accepted
// Coin already inserted
// Dispensing a snack
// Sold out, coin returned
// Sold out
`),
    blk(`<h4>2. Order lifecycle with a transition table</h4>
<p><b>What it shows:</b> an enum for the status and an <code>EnumMap</code> that lists which transitions are legal. <b>Why:</b> when states carry little behaviour but the <b>rules of movement</b> matter, a table is shorter than a class per state and is easy to review.</p>`,
`// State machine with an enum and a legal-transition table
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public class StOrderLifecycleDemo {
    public static void main(String[] args) {
        StOrder order = new StOrder();

        order.moveTo(StOrderStatus.SHIPPED);    // cannot ship before payment
        order.moveTo(StOrderStatus.PAID);
        order.moveTo(StOrderStatus.SHIPPED);
        order.moveTo(StOrderStatus.CANCELLED);  // too late to cancel
        order.moveTo(StOrderStatus.DELIVERED);
    }
}

enum StOrderStatus {
    NEW, PAID, SHIPPED, DELIVERED, CANCELLED
}

class StOrder {
    private static final Map<StOrderStatus, Set<StOrderStatus>> ALLOWED =
        new EnumMap<>(StOrderStatus.class);

    static {
        ALLOWED.put(StOrderStatus.NEW, EnumSet.of(StOrderStatus.PAID, StOrderStatus.CANCELLED));
        ALLOWED.put(StOrderStatus.PAID,
            EnumSet.of(StOrderStatus.SHIPPED, StOrderStatus.CANCELLED));
        ALLOWED.put(StOrderStatus.SHIPPED, EnumSet.of(StOrderStatus.DELIVERED));
        ALLOWED.put(StOrderStatus.DELIVERED, EnumSet.noneOf(StOrderStatus.class));
        ALLOWED.put(StOrderStatus.CANCELLED, EnumSet.noneOf(StOrderStatus.class));
    }

    private StOrderStatus status = StOrderStatus.NEW;

    void moveTo(StOrderStatus target) {
        if (!ALLOWED.get(status).contains(target)) {
            System.out.println("Illegal: " + status + " -> " + target);
            return;
        }
        System.out.println("OK     : " + status + " -> " + target);
        status = target;
    }
}
// OUTPUT:
// Illegal: NEW -> SHIPPED
// OK     : NEW -> PAID
// OK     : PAID -> SHIPPED
// Illegal: SHIPPED -> CANCELLED
// OK     : SHIPPED -> DELIVERED
`),
    blk(`<h4>3. Enum states with behaviour</h4>
<p><b>What it shows:</b> each enum constant implements the behaviour of its state (who can edit, what happens on "approve"). <b>Why:</b> you get the clarity of the State pattern without a separate interface and classes, and <code>switch</code> statements disappear. This is the form most used in modern Java.</p>`,
`// Enum-based State: document workflow with behaviour per constant

public class StDocumentDemo {
    public static void main(String[] args) {
        StDocument doc = new StDocument();

        doc.edit("Fort guide, first draft");
        doc.approve();
        doc.edit("Sneaky change");
        doc.approve();
        doc.approve();
    }
}

enum StDocState {
    DRAFT {
        @Override
        StDocState approve() {
            return REVIEW;
        }

        @Override
        boolean canEdit() {
            return true;
        }
    },
    REVIEW {
        @Override
        StDocState approve() {
            return PUBLISHED;
        }

        @Override
        boolean canEdit() {
            return false;
        }
    },
    PUBLISHED {
        @Override
        StDocState approve() {
            return this; // nothing more to approve
        }

        @Override
        boolean canEdit() {
            return false;
        }
    };

    abstract StDocState approve();

    abstract boolean canEdit();
}

class StDocument {
    private StDocState state = StDocState.DRAFT;
    private String text = "v1";

    void edit(String newText) {
        if (!state.canEdit()) {
            System.out.println("Cannot edit in " + state);
            return;
        }
        text = newText;
        System.out.println("Edited in " + state + ": " + text);
    }

    void approve() {
        state = state.approve();
        System.out.println("Now " + state);
    }
}
// OUTPUT:
// Edited in DRAFT: Fort guide, first draft
// Now REVIEW
// Cannot edit in REVIEW
// Now PUBLISHED
// Now PUBLISHED
`),
    blk(`<h4>4. States that return the next state</h4>
<p><b>What it shows:</b> a media player where every state handles an event and <b>returns</b> the next state, so the context never calls <code>setState</code> from inside the states. <b>Why:</b> transitions become pure functions that are easy to unit test and to print as a table.</p>`,
`// State pattern: each state returns the next state (pure transitions)

public class StMediaPlayerDemo {
    public static void main(String[] args) {
        StPlayerState state = StPlayerState.STOPPED;
        StEvent[] events = {
            StEvent.PAUSE, StEvent.PLAY, StEvent.PAUSE, StEvent.PLAY, StEvent.STOP
        };

        for (StEvent event : events) {
            StPlayerState next = state.on(event);
            System.out.println(state + " + " + event + " -> " + next);
            state = next;
        }
    }
}

enum StEvent {
    PLAY, PAUSE, STOP
}

enum StPlayerState {
    STOPPED {
        @Override
        StPlayerState on(StEvent event) {
            return event == StEvent.PLAY ? PLAYING : this;
        }
    },
    PLAYING {
        @Override
        StPlayerState on(StEvent event) {
            switch (event) {
                case PAUSE:
                    return PAUSED;
                case STOP:
                    return STOPPED;
                default:
                    return this;
            }
        }
    },
    PAUSED {
        @Override
        StPlayerState on(StEvent event) {
            switch (event) {
                case PLAY:
                    return PLAYING;
                case STOP:
                    return STOPPED;
                default:
                    return this;
            }
        }
    };

    abstract StPlayerState on(StEvent event);
}
// OUTPUT:
// STOPPED + PAUSE -> STOPPED
// STOPPED + PLAY -> PLAYING
// PLAYING + PAUSE -> PAUSED
// PAUSED + PLAY -> PLAYING
// PLAYING + STOP -> STOPPED
`),
    blk(`<h4>Common mistakes</h4>
<ul>
<li><b>Keeping the old if/else</b> inside the context as well as the states, so the logic lives in two places.</li>
<li><b>Allowing every transition.</b> If any state can jump to any other, you only built a status field; write the legal-transition rules down.</li>
<li><b>Creating a new state object on every transition</b> when states have no fields. Share them as singletons or use enums.</li>
<li><b>Hidden transitions</b> scattered through business code that bypass the state objects.</li>
<li><b>State explosion:</b> mixing two independent dimensions (payment status and shipping status) in one machine. Use two small machines instead.</li>
</ul>
<h4>State vs Strategy vs Command</h4>
<table>
<tr><th>Aspect</th><th>State</th><th>Strategy</th><th>Command</th></tr>
<tr><td>Who changes it?</td><td>The object itself or its states, as events happen</td><td>The client, usually once</td><td>The client creates one per request</td></tr>
<tr><td>Do variants know each other?</td><td>Yes, states know the next states</td><td>No, they are independent</td><td>No</td></tr>
<tr><td>Question answered</td><td>"What mode am I in?"</td><td>"Which algorithm should I use?"</td><td>"What should be done?"</td></tr>
<tr><td>Typical use</td><td>Order status, connection, vending machine</td><td>Sorting rule, discount rule</td><td>Undo, queue, macro</td></tr>
<tr><td>Class structure</td><td>Same shape as Strategy</td><td>Same shape as State</td><td>Adds a receiver and arguments</td></tr>
</table>`),
  ],
  expert: [
    blk(`<h4>Real-time example 1: circuit breaker</h4>
<p>A circuit breaker protects a service from calling a failing dependency again and again. It has three states: CLOSED (calls pass), OPEN (calls are rejected fast), HALF_OPEN (one trial call decides). This is the idea behind Resilience4j and Hystrix. The sample uses a fixed list of call results so the output is deterministic.</p>`,
`// Real-time: circuit breaker as a state machine
import java.util.List;

public class StCircuitBreakerDemo {
    public static void main(String[] args) {
        StCircuitBreaker breaker = new StCircuitBreaker(2);
        List<Boolean> health = List.of(true, false, false, true, true, true, true);

        for (boolean healthy : health) {
            String result = breaker.call(healthy);
            System.out.println("service=" + healthy + " -> " + result
                + " [" + breaker.state() + "]");
        }
    }
}

enum StBreakerState {
    CLOSED, OPEN, HALF_OPEN
}

class StCircuitBreaker {
    private StBreakerState state = StBreakerState.CLOSED;
    private int failures = 0;
    private int skipped = 0;
    private final int threshold;

    StCircuitBreaker(int threshold) {
        this.threshold = threshold;
    }

    String call(boolean serviceHealthy) {
        switch (state) {
            case OPEN:
                skipped++;
                if (skipped >= 2) {
                    state = StBreakerState.HALF_OPEN;   // allow one trial next time
                }
                return "REJECTED (fast fail)";
            case HALF_OPEN:
                if (serviceHealthy) {
                    reset();
                    return "TRIAL OK -> closed";
                }
                state = StBreakerState.OPEN;
                skipped = 0;
                return "TRIAL FAILED -> open";
            default:
                if (serviceHealthy) {
                    failures = 0;
                    return "OK";
                }
                failures++;
                if (failures >= threshold) {
                    state = StBreakerState.OPEN;
                    skipped = 0;
                }
                return "FAILED (" + failures + ")";
        }
    }

    private void reset() {
        state = StBreakerState.CLOSED;
        failures = 0;
    }

    StBreakerState state() {
        return state;
    }
}
// OUTPUT:
// service=true -> OK [CLOSED]
// service=false -> FAILED (1) [CLOSED]
// service=false -> FAILED (2) [OPEN]
// service=true -> REJECTED (fast fail) [OPEN]
// service=true -> REJECTED (fast fail) [HALF_OPEN]
// service=true -> TRIAL OK -> closed [CLOSED]
// service=true -> OK [CLOSED]
`),
    blk(`<h4>Real-time example 2: support ticket with audit trail</h4>
<p>A help-desk ticket moves through states, and every legal move is recorded with who did it. Illegal moves are rejected with a clear message. Business rules (only an agent can resolve, only the customer can reopen) are attached to transitions, which is how real workflow tools behave.</p>`,
`// Real-time: ticket workflow with role-based transitions and audit
import java.util.ArrayList;
import java.util.List;

public class StTicketDemo {
    public static void main(String[] args) {
        StTicket ticket = new StTicket();

        ticket.act("Asha", "CUSTOMER", "start");
        ticket.act("Ravi", "AGENT", "start");
        ticket.act("Ravi", "AGENT", "resolve");
        ticket.act("Asha", "CUSTOMER", "reopen");
        ticket.act("Ravi", "AGENT", "resolve");
        ticket.act("Asha", "CUSTOMER", "close");

        ticket.audit().forEach(System.out::println);
    }
}

enum StTicketState {
    OPEN, IN_PROGRESS, RESOLVED, CLOSED
}

class StTicket {
    private StTicketState state = StTicketState.OPEN;
    private final List<String> audit = new ArrayList<>();

    void act(String who, String role, String action) {
        StTicketState target = null;
        if (state == StTicketState.OPEN && action.equals("start") && role.equals("AGENT")) {
            target = StTicketState.IN_PROGRESS;
        } else if (state == StTicketState.IN_PROGRESS && action.equals("resolve")
                && role.equals("AGENT")) {
            target = StTicketState.RESOLVED;
        } else if (state == StTicketState.RESOLVED && action.equals("reopen")
                && role.equals("CUSTOMER")) {
            target = StTicketState.IN_PROGRESS;
        } else if (state == StTicketState.RESOLVED && action.equals("close")) {
            target = StTicketState.CLOSED;
        }

        if (target == null) {
            audit.add(who + " tried '" + action + "' in " + state + ": DENIED");
            return;
        }
        audit.add(who + ": " + state + " -> " + target);
        state = target;
    }

    List<String> audit() {
        return audit;
    }
}
// OUTPUT:
// Asha tried 'start' in OPEN: DENIED
// Ravi: OPEN -> IN_PROGRESS
// Ravi: IN_PROGRESS -> RESOLVED
// Asha: RESOLVED -> IN_PROGRESS
// Ravi: IN_PROGRESS -> RESOLVED
// Asha: RESOLVED -> CLOSED
`),
    blk(`<h4>Sample mini project: train seat booking with waiting list</h4>
<p>Each booking is an object with a state (WAITING, CONFIRMED, CANCELLED). A small <code>Train</code> class owns the seat count and promotes the first waiting passenger whenever a confirmed booking is cancelled. The states decide what "cancel" means for them.</p>`,
`// Mini project: train booking with confirmed, waiting and cancelled states
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class StTrainBookingProject {
    public static void main(String[] args) {
        StTrain express = new StTrain(2);   // Pune - Mumbai, only 2 seats

        StBooking asha = express.book("Asha");
        express.book("Ravi");
        StBooking meera = express.book("Meera");
        express.book("Kiran");
        System.out.println("Booked   : " + express.all());

        express.cancel(asha);
        System.out.println("After #1 : " + express.all());

        express.cancel(meera);
        express.cancel(asha);
        System.out.println("After #2 : " + express.all());
    }
}

enum StBookingState {
    WAITING, CONFIRMED, CANCELLED
}

class StBooking {
    final String passenger;
    StBookingState state;

    StBooking(String passenger) {
        this.passenger = passenger;
    }

    @Override
    public String toString() {
        return passenger + "=" + state;
    }
}

class StTrain {
    private final int seats;
    private int confirmed = 0;
    private final Deque<StBooking> waiting = new ArrayDeque<>();
    private final List<StBooking> all = new ArrayList<>();

    StTrain(int seats) {
        this.seats = seats;
    }

    StBooking book(String passenger) {
        StBooking booking = new StBooking(passenger);
        all.add(booking);
        if (confirmed < seats) {
            booking.state = StBookingState.CONFIRMED;
            confirmed++;
        } else {
            booking.state = StBookingState.WAITING;
            waiting.add(booking);
        }
        return booking;
    }

    void cancel(StBooking booking) {
        switch (booking.state) {
            case CONFIRMED:
                booking.state = StBookingState.CANCELLED;
                confirmed--;
                promoteNext();
                break;
            case WAITING:
                booking.state = StBookingState.CANCELLED;
                waiting.remove(booking);
                break;
            default:
                System.out.println(booking.passenger + " is already cancelled");
        }
    }

    private void promoteNext() {
        StBooking next = waiting.poll();
        if (next != null) {
            next.state = StBookingState.CONFIRMED;
            confirmed++;
            System.out.println("Promoted " + next.passenger + " from waiting list");
        }
    }

    List<StBooking> all() {
        return all;
    }
}
// OUTPUT:
// Booked   : [Asha=CONFIRMED, Ravi=CONFIRMED, Meera=WAITING, Kiran=WAITING]
// Promoted Meera from waiting list
// After #1 : [Asha=CANCELLED, Ravi=CONFIRMED, Meera=CONFIRMED, Kiran=WAITING]
// Promoted Kiran from waiting list
// Asha is already cancelled
// After #2 : [Asha=CANCELLED, Ravi=CONFIRMED, Meera=CANCELLED, Kiran=CONFIRMED]
`),
    blk(`<h4>Thread safety, testing and Spring integration</h4>
<ul>
<li><b>Thread safety:</b> a transition is a read-modify-write on shared state. Guard it with <code>synchronized</code>, a lock, or an <code>AtomicReference</code> with <code>compareAndSet(expected, next)</code>. State objects without fields can be shared singletons and are naturally thread-safe.</li>
<li><b>Persistence:</b> store the state as an enum (<code>@Enumerated(EnumType.STRING)</code>) and use optimistic locking (<code>@Version</code>) so two users cannot both move the same order.</li>
<li><b>Testing:</b> test the transition table exhaustively: for every state and event, assert the expected next state or the rejection. A parameterised test over the full matrix is short and catches missing rules.</li>
<li><b>Spring:</b> for non-trivial flows use <b>Spring Statemachine</b>, which supports guards, actions, hierarchical states and persistence. For simple lifecycles an enum with a transition table inside the domain class is enough and avoids a framework.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Boolean flag soup:</b> <code>isPaid</code>, <code>isShipped</code>, <code>isCancelled</code> that allow impossible combinations such as shipped and cancelled.</li>
<li><b>God state class</b> that handles every event for every status with a <code>switch</code>, which is the problem State was meant to remove.</li>
<li><b>States that call back into many context internals,</b> creating tight coupling. Pass only what the state needs.</li>
<li><b>Skipping the audit trail</b> for business workflows where "who moved it and when" matters.</li>
</ul>`),
  ],
  interviewQA: [
    ['What is the State pattern?', 'It lets an object alter its behaviour when its internal state changes by delegating to a state object. The object appears to change its class, and conditional logic on a status field is replaced by polymorphism.'],
    ['How is State different from Strategy?', 'The structure is almost identical, but the intent differs. Strategy is chosen by the client and strategies do not know each other. In State the object changes its own state over time, and the states usually know which state comes next.'],
    ['Who is responsible for the transitions: the context or the states?', 'Both designs are valid. Letting states set the next state keeps the rules local to each state; letting the context or a transition table decide keeps all rules in one place and is easier to review. Pick one and be consistent.'],
    ['When would you use an enum instead of separate state classes?', 'When states have no fields, little behaviour and are known at compile time. Enum constants can have their own method bodies, are singletons, serialise safely and work well with switch and EnumMap.'],
    ['How do you keep a state machine safe with multiple threads?', 'Make transitions atomic: synchronise them, use a lock, or AtomicReference.compareAndSet. For persisted entities add optimistic locking with a version column so concurrent updates fail instead of corrupting the status.'],
    ['What is wrong with boolean flags for status?', 'Several flags allow combinations that should be impossible and spread the rules over many if statements. A single state field with explicit legal transitions makes illegal states unrepresentable.'],
    ['Give a real-world use of State in a Java backend.', 'Order lifecycle (new, paid, shipped, delivered, cancelled), payment status, circuit breakers, connection or session states, and Spring Batch job status. Thread.State in the JDK is a built-in example.'],
  ],
};

const visitor: TopicExtra = {
  beginner: [
    blk(`<h4>In one minute</h4>
<p>The <b>Visitor pattern</b> separates an <b>operation</b> from the <b>objects it works on</b>. The object structure (shapes, files, tax items) stays stable. Each new operation (area, price, export, print) becomes a new <b>Visitor</b> class with one <code>visit</code> method per element type. Each element has an <code>accept(visitor)</code> method that calls back <code>visitor.visit(this)</code>. This two-step call is called <b>double dispatch</b>: the code that runs depends on the type of the visitor <b>and</b> the type of the element.</p>
<h4>More real-life analogies</h4>
<ul>
<li><b>Tourist guide at a fort:</b> the guide (visitor) treats a gate, a temple and a cannon differently, but the fort never changes when a new guide arrives.</li>
<li><b>Insurance agent:</b> visits a house, a car and a shop and quotes a different premium for each, using one set of rules per visit.</li>
<li><b>Health inspector:</b> checks restaurants, bakeries and sweet shops with the same visit, but looks at different things.</li>
</ul>
<h4>Where you see it in Java and Spring</h4>
<ul>
<li><code>java.nio.file.FileVisitor</code> and <code>SimpleFileVisitor</code> used with <code>Files.walkFileTree</code>: the walker is the structure, your visitor decides what to do with each file or folder.</li>
<li><code>javax.lang.model.element.ElementVisitor</code> and <code>javax.tools</code> / annotation processing; compilers and parsers (ANTLR, JavaParser, ASM <code>ClassVisitor</code>) use visitors over syntax trees.</li>
<li>Spring: <code>BeanDefinitionVisitor</code> (resolves placeholders in bean definitions), <code>ASM ClassVisitor</code> used by classpath scanning.</li>
<li>Java 21 offers <b>sealed types with pattern matching for switch</b> as a lighter alternative when all element types are in one place.</li>
</ul>`),
    blk(`<h4>Structure as text</h4>
<pre>
Visitor  &lt;&lt;interface&gt;&gt;                 Element &lt;&lt;interface&gt;&gt;
  + visit(Fort)                        + accept(Visitor v)
  + visit(Temple)                           ^            ^
       ^                                    |            |
  FeeVisitor, GuideVisitor               Fort         Temple
                                     accept(v) { v.visit(this); }
</pre>
<p>Call flow: <code>element.accept(visitor)</code> then <code>visitor.visit(element)</code>. The first call picks the element class at run time; the second picks the visitor method.</p>
<h4>When to use</h4>
<ul>
<li>The object structure is <b>stable</b> but you keep adding <b>new operations</b>.</li>
<li>The operation behaves differently for each class and you want the related code in <b>one place</b>.</li>
<li>You want to accumulate state while walking a tree (totals, reports).</li>
</ul>
<h4>When NOT to use</h4>
<ul>
<li>New element classes appear often: every visitor must then change. The pattern is good for adding operations, bad for adding types.</li>
<li>Elements are few and the operation is tiny; a simple method or a Java 21 <code>switch</code> is enough.</li>
<li>The visitor needs private data of elements, which pushes you to widen their public API.</li>
</ul>
<h4>Sample program: entry fees for places in a city tour</h4>
<p>Two element types and one visitor. Notice that <code>Fort</code> and <code>Temple</code> know nothing about fees. A new visitor (opening hours, say) could be added without touching them.</p>`,
`// Visitor pattern: fee calculation over different tourist places
import java.util.List;

public class VsBeginnerTourDemo {
    public static void main(String[] args) {
        List<VsPlace> tour = List.of(
            new VsFort("Raigad", 25),
            new VsTemple("Tulja Bhavani"),
            new VsFort("Sinhagad", 15));

        VsFeeVisitor fees = new VsFeeVisitor();
        for (VsPlace place : tour) {
            place.accept(fees);           // double dispatch happens here
        }
        System.out.println("Total fee: " + fees.total());
    }
}

interface VsPlaceVisitor {
    void visit(VsFort fort);

    void visit(VsTemple temple);
}

interface VsPlace {
    void accept(VsPlaceVisitor visitor);
}

class VsFort implements VsPlace {
    final String name;
    final int ticket;

    VsFort(String name, int ticket) {
        this.name = name;
        this.ticket = ticket;
    }

    @Override
    public void accept(VsPlaceVisitor visitor) {
        visitor.visit(this);
    }
}

class VsTemple implements VsPlace {
    final String name;

    VsTemple(String name) {
        this.name = name;
    }

    @Override
    public void accept(VsPlaceVisitor visitor) {
        visitor.visit(this);
    }
}

class VsFeeVisitor implements VsPlaceVisitor {
    private int total = 0;

    @Override
    public void visit(VsFort fort) {
        System.out.println(fort.name + ": ticket " + fort.ticket);
        total += fort.ticket;
    }

    @Override
    public void visit(VsTemple temple) {
        System.out.println(temple.name + ": free entry");
    }

    int total() {
        return total;
    }
}

// OUTPUT:
// Raigad: ticket 25
// Tulja Bhavani: free entry
// Sinhagad: ticket 15
// Total fee: 40
`),
  ],
  intermediate: [
    blk(`<h4>1. Shapes with two visitors</h4>
<p><b>What it shows:</b> one set of elements and two independent operations (area and perimeter) implemented as visitors. <b>Why:</b> the shape classes stay small and never change when you add "draw", "export" or "scale" later. It also introduces a generic <code>Visitor&lt;R&gt;</code> that <b>returns</b> a value instead of printing.</p>`,
`// Visitor with a generic return type: area and perimeter of shapes
import java.util.List;

public class VsShapeDemo {
    public static void main(String[] args) {
        List<VsShape> shapes = List.of(new VsCircle(2), new VsRectangle(3, 4));
        VsAreaVisitor area = new VsAreaVisitor();
        VsPerimeterVisitor perimeter = new VsPerimeterVisitor();

        for (VsShape shape : shapes) {
            String name = shape.getClass().getSimpleName();
            System.out.printf("%s area=%.2f perimeter=%.2f%n",
                name, shape.accept(area), shape.accept(perimeter));
        }
    }
}

interface VsShapeVisitor<R> {
    R visitCircle(VsCircle circle);

    R visitRectangle(VsRectangle rectangle);
}

interface VsShape {
    <R> R accept(VsShapeVisitor<R> visitor);
}

class VsCircle implements VsShape {
    final double radius;

    VsCircle(double radius) {
        this.radius = radius;
    }

    @Override
    public <R> R accept(VsShapeVisitor<R> visitor) {
        return visitor.visitCircle(this);
    }
}

class VsRectangle implements VsShape {
    final double width;
    final double height;

    VsRectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public <R> R accept(VsShapeVisitor<R> visitor) {
        return visitor.visitRectangle(this);
    }
}

class VsAreaVisitor implements VsShapeVisitor<Double> {
    @Override
    public Double visitCircle(VsCircle circle) {
        return Math.PI * circle.radius * circle.radius;
    }

    @Override
    public Double visitRectangle(VsRectangle rectangle) {
        return rectangle.width * rectangle.height;
    }
}

class VsPerimeterVisitor implements VsShapeVisitor<Double> {
    @Override
    public Double visitCircle(VsCircle circle) {
        return 2 * Math.PI * circle.radius;
    }

    @Override
    public Double visitRectangle(VsRectangle rectangle) {
        return 2 * (rectangle.width + rectangle.height);
    }
}
// OUTPUT:
// VsCircle area=12.57 perimeter=12.57
// VsRectangle area=12.00 perimeter=14.00
`),
    blk(`<h4>2. Double dispatch explained</h4>
<p><b>What it shows:</b> why <code>accept()</code> is needed at all. Java picks <b>overloaded</b> methods by the <b>compile-time</b> type of the argument, but picks <b>overridden</b> methods by the <b>run-time</b> type of the receiver. Calling <code>visitor.visit(item)</code> directly with an <code>Animal</code> variable always chooses <code>visit(Animal)</code>. Calling <code>item.accept(visitor)</code> first resolves the real class, and inside it <code>this</code> has the exact type.</p>`,
`// Why accept() exists: overload resolution versus double dispatch
import java.util.List;

public class VsDoubleDispatchDemo {
    public static void main(String[] args) {
        VsAnimalVisitor visitor = new VsAnimalVisitor();
        List<VsAnimal> animals = List.of(new VsDog(), new VsCat());

        System.out.println("Direct call (single dispatch):");
        for (VsAnimal animal : animals) {
            visitor.visit(animal);      // static type is VsAnimal
        }

        System.out.println("Through accept (double dispatch):");
        for (VsAnimal animal : animals) {
            animal.accept(visitor);     // run-time type chooses the overload
        }
    }
}

interface VsAnimal {
    void accept(VsAnimalVisitor visitor);
}

class VsDog implements VsAnimal {
    @Override
    public void accept(VsAnimalVisitor visitor) {
        visitor.visit(this);   // here 'this' is statically a VsDog
    }
}

class VsCat implements VsAnimal {
    @Override
    public void accept(VsAnimalVisitor visitor) {
        visitor.visit(this);   // here 'this' is statically a VsCat
    }
}

class VsAnimalVisitor {
    void visit(VsAnimal animal) {
        System.out.println("  visit(VsAnimal)");
    }

    void visit(VsDog dog) {
        System.out.println("  visit(VsDog)");
    }

    void visit(VsCat cat) {
        System.out.println("  visit(VsCat)");
    }
}
// OUTPUT:
// Direct call (single dispatch):
//   visit(VsAnimal)
//   visit(VsAnimal)
// Through accept (double dispatch):
//   visit(VsDog)
//   visit(VsCat)
`),
    blk(`<h4>3. Tax calculation that accumulates state</h4>
<p><b>What it shows:</b> a visitor with fields, walking a mixed shopping basket and building a tax summary. <b>Why:</b> the tax rules (5 percent on groceries, 18 percent on electronics, 28 percent on luxury goods) live in one class, and when the law changes only this class is edited.</p>`,
`// Visitor with state: GST summary over a shopping basket
import java.util.List;

public class VsGstDemo {
    public static void main(String[] args) {
        List<VsItem> basket = List.of(
            new VsGrocery("Basmati rice", 600),
            new VsGadget("Earphones", 2000),
            new VsLuxury("Silk saree", 10000));

        VsGstVisitor gst = new VsGstVisitor();
        basket.forEach(item -> item.accept(gst));
        gst.summary();
    }
}

interface VsItemVisitor {
    void visit(VsGrocery grocery);

    void visit(VsGadget gadget);

    void visit(VsLuxury luxury);
}

interface VsItem {
    void accept(VsItemVisitor visitor);
}

class VsGrocery implements VsItem {
    final String name;
    final int price;

    VsGrocery(String name, int price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public void accept(VsItemVisitor visitor) {
        visitor.visit(this);
    }
}

class VsGadget implements VsItem {
    final String name;
    final int price;

    VsGadget(String name, int price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public void accept(VsItemVisitor visitor) {
        visitor.visit(this);
    }
}

class VsLuxury implements VsItem {
    final String name;
    final int price;

    VsLuxury(String name, int price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public void accept(VsItemVisitor visitor) {
        visitor.visit(this);
    }
}

class VsGstVisitor implements VsItemVisitor {
    private double totalTax = 0;
    private int totalPrice = 0;

    @Override
    public void visit(VsGrocery grocery) {
        add(grocery.name, grocery.price, 5);
    }

    @Override
    public void visit(VsGadget gadget) {
        add(gadget.name, gadget.price, 18);
    }

    @Override
    public void visit(VsLuxury luxury) {
        add(luxury.name, luxury.price, 28);
    }

    private void add(String name, int price, int percent) {
        double tax = price * percent / 100.0;
        System.out.println(name + ": " + price + " + " + tax + " tax (" + percent + "%)");
        totalPrice += price;
        totalTax += tax;
    }

    void summary() {
        System.out.println("Basket " + totalPrice + ", tax " + totalTax
            + ", payable " + (totalPrice + totalTax));
    }
}
// OUTPUT:
// Basmati rice: 600 + 30.0 tax (5%)
// Earphones: 2000 + 360.0 tax (18%)
// Silk saree: 10000 + 2800.0 tax (28%)
// Basket 12600, tax 3190.0, payable 15790.0
`),
    blk(`<h4>4. Expression tree with evaluate and print visitors</h4>
<p><b>What it shows:</b> the pattern used on a recursive structure (Composite), the way compilers and calculators do it. <b>Why:</b> evaluation and printing are two separate operations over the same tree; each element's <code>accept</code> simply passes the visitor to its children through the visitor methods.</p>`,
`// Visitor over a Composite: evaluate and print an expression tree

public class VsExpressionDemo {
    public static void main(String[] args) {
        // 2 * (3 + 4)
        VsExpr tree = new VsMultiply(
            new VsNumber(2),
            new VsAdd(new VsNumber(3), new VsNumber(4)));

        System.out.println("Printed  : " + tree.accept(new VsPrinter()));
        System.out.println("Evaluated: " + tree.accept(new VsEvaluator()));
    }
}

interface VsExprVisitor<R> {
    R visitNumber(VsNumber number);

    R visitAdd(VsAdd add);

    R visitMultiply(VsMultiply multiply);
}

interface VsExpr {
    <R> R accept(VsExprVisitor<R> visitor);
}

class VsNumber implements VsExpr {
    final int value;

    VsNumber(int value) {
        this.value = value;
    }

    @Override
    public <R> R accept(VsExprVisitor<R> visitor) {
        return visitor.visitNumber(this);
    }
}

class VsAdd implements VsExpr {
    final VsExpr left;
    final VsExpr right;

    VsAdd(VsExpr left, VsExpr right) {
        this.left = left;
        this.right = right;
    }

    @Override
    public <R> R accept(VsExprVisitor<R> visitor) {
        return visitor.visitAdd(this);
    }
}

class VsMultiply implements VsExpr {
    final VsExpr left;
    final VsExpr right;

    VsMultiply(VsExpr left, VsExpr right) {
        this.left = left;
        this.right = right;
    }

    @Override
    public <R> R accept(VsExprVisitor<R> visitor) {
        return visitor.visitMultiply(this);
    }
}

class VsEvaluator implements VsExprVisitor<Integer> {
    @Override
    public Integer visitNumber(VsNumber number) {
        return number.value;
    }

    @Override
    public Integer visitAdd(VsAdd add) {
        return add.left.accept(this) + add.right.accept(this);
    }

    @Override
    public Integer visitMultiply(VsMultiply multiply) {
        return multiply.left.accept(this) * multiply.right.accept(this);
    }
}

class VsPrinter implements VsExprVisitor<String> {
    @Override
    public String visitNumber(VsNumber number) {
        return String.valueOf(number.value);
    }

    @Override
    public String visitAdd(VsAdd add) {
        return "(" + add.left.accept(this) + " + " + add.right.accept(this) + ")";
    }

    @Override
    public String visitMultiply(VsMultiply multiply) {
        return multiply.left.accept(this) + " * " + multiply.right.accept(this);
    }
}
// OUTPUT:
// Printed  : 2 * (3 + 4)
// Evaluated: 14
`),
    blk(`<h4>5. The modern alternative: sealed types and pattern matching</h4>
<p><b>What it shows:</b> Java 21 can do the same job with a <code>sealed interface</code>, records and a <code>switch</code> that has no default. <b>Why:</b> when all element types live together, this is much shorter, and the compiler reports an error if you forget a case. Visitor remains better when the operations must be added by other modules or when you need the classic double-dispatch structure.</p>`,
`// Java 21 alternative to Visitor: sealed records and a pattern switch
import java.util.List;

public class VsSealedDemo {
    static int fee(VsPayment payment) {
        return switch (payment) {
            case VsUpi upi -> 0;                          // UPI is free
            case VsCard card -> card.amount() * 2 / 100;  // 2 percent
            case VsCash cash -> 0;
        };
    }

    public static void main(String[] args) {
        List<VsPayment> payments = List.of(
            new VsUpi("asha@upi", 500),
            new VsCard("4242", 2000),
            new VsCash(300));

        for (VsPayment payment : payments) {
            System.out.println(payment + " -> fee " + fee(payment));
        }
    }
}

sealed interface VsPayment permits VsUpi, VsCard, VsCash {
}

record VsUpi(String id, int amount) implements VsPayment {
}

record VsCard(String last4, int amount) implements VsPayment {
}

record VsCash(int amount) implements VsPayment {
}
// OUTPUT:
// VsUpi[id=asha@upi, amount=500] -> fee 0
// VsCard[last4=4242, amount=2000] -> fee 40
// VsCash[amount=300] -> fee 0
`),
    blk(`<h4>Common mistakes</h4>
<ul>
<li><b>Adding elements often.</b> Every new element type forces a new <code>visit</code> method in every visitor. If types change more than operations, choose polymorphic methods instead.</li>
<li><b>Calling <code>visitor.visit(x)</code> directly</b> instead of <code>x.accept(visitor)</code>, which silently picks the wrong overload (see sample 2).</li>
<li><b>Breaking encapsulation</b> by making element fields public only so visitors can read them. Expose a minimal read API.</li>
<li><b>Forgetting to traverse children.</b> For composites, decide who traverses: the element's <code>accept</code> or the visitor. Be consistent.</li>
<li><b>Visitors that keep state but are reused,</b> so totals leak between runs. Create a fresh visitor per run.</li>
</ul>
<h4>Visitor vs Iterator vs Strategy vs plain polymorphism</h4>
<table>
<tr><th>Aspect</th><th>Visitor</th><th>Iterator</th><th>Strategy</th><th>Polymorphic method</th></tr>
<tr><td>Purpose</td><td>New operations over a structure</td><td>Walk through elements</td><td>Swap an algorithm</td><td>Behaviour inside the class</td></tr>
<tr><td>Easy to add</td><td>Operations</td><td>Traversal orders</td><td>Algorithms</td><td>Element types</td></tr>
<tr><td>Hard to add</td><td>Element types</td><td>-</td><td>-</td><td>Operations</td></tr>
<tr><td>Knows concrete types?</td><td>Yes, one method each</td><td>No</td><td>No</td><td>Itself</td></tr>
<tr><td>Dispatch</td><td>Double</td><td>Single</td><td>Single</td><td>Single</td></tr>
</table>`),
  ],
  expert: [
    blk(`<h4>Real-time example 1: file system tree with size and search visitors</h4>
<p>Files and folders form a Composite. A <code>SizeVisitor</code> totals bytes and a <code>SearchVisitor</code> collects paths that match an extension. This is the same idea as <code>Files.walkFileTree</code>, with in-memory data so the output is stable. Folders pass the visitor to their children, so the traversal logic is written once.</p>`,
`// Real-time: file tree with size and search visitors
import java.util.ArrayList;
import java.util.List;

public class VsFileSystemDemo {
    public static void main(String[] args) {
        VsFolder root = new VsFolder("project")
            .add(new VsFile("pom.xml", 1200))
            .add(new VsFolder("src")
                .add(new VsFile("App.java", 3400))
                .add(new VsFile("Util.java", 800)))
            .add(new VsFolder("docs").add(new VsFile("notes.txt", 500)));

        VsSizeVisitor size = new VsSizeVisitor();
        root.accept(size, "");
        System.out.println("Total bytes: " + size.total);

        VsSearchVisitor search = new VsSearchVisitor(".java");
        root.accept(search, "");
        System.out.println("Java files : " + search.found);
    }
}

interface VsFsVisitor {
    void visitFile(VsFile file, String path);

    void enterFolder(VsFolder folder, String path);
}

interface VsFsNode {
    void accept(VsFsVisitor visitor, String parentPath);
}

class VsFile implements VsFsNode {
    final String name;
    final int bytes;

    VsFile(String name, int bytes) {
        this.name = name;
        this.bytes = bytes;
    }

    @Override
    public void accept(VsFsVisitor visitor, String parentPath) {
        visitor.visitFile(this, parentPath + "/" + name);
    }
}

class VsFolder implements VsFsNode {
    final String name;
    final List<VsFsNode> children = new ArrayList<>();

    VsFolder(String name) {
        this.name = name;
    }

    VsFolder add(VsFsNode node) {
        children.add(node);
        return this;
    }

    @Override
    public void accept(VsFsVisitor visitor, String parentPath) {
        String path = parentPath + "/" + name;
        visitor.enterFolder(this, path);
        for (VsFsNode child : children) {
            child.accept(visitor, path);   // traversal lives in the element
        }
    }
}

class VsSizeVisitor implements VsFsVisitor {
    int total = 0;

    @Override
    public void visitFile(VsFile file, String path) {
        total += file.bytes;
    }

    @Override
    public void enterFolder(VsFolder folder, String path) {
        // folders have no size of their own
    }
}

class VsSearchVisitor implements VsFsVisitor {
    private final String extension;
    final List<String> found = new ArrayList<>();

    VsSearchVisitor(String extension) {
        this.extension = extension;
    }

    @Override
    public void visitFile(VsFile file, String path) {
        if (file.name.endsWith(extension)) {
            found.add(path);
        }
    }

    @Override
    public void enterFolder(VsFolder folder, String path) {
        // nothing to do when entering
    }
}
// OUTPUT:
// Total bytes: 5900
// Java files : [/project/src/App.java, /project/src/Util.java]
`),
    blk(`<h4>Real-time example 2: one invoice, two export formats</h4>
<p>An invoice has line items and a discount. Exports to a text summary and to XML are separate visitors that return a <code>String</code>. Adding a CSV or XML exporter later touches no invoice class. This is exactly how serializers and report engines are organised.</p>`,
`// Real-time: exporting an invoice structure with two visitors
import java.util.List;

public class VsInvoiceExportDemo {
    static void export(String title, List<VsInvoicePart> parts, VsInvoiceVisitor<String> v) {
        System.out.println("-- " + title + " --");
        for (VsInvoicePart part : parts) {
            System.out.println(part.accept(v));
        }
    }

    public static void main(String[] args) {
        List<VsInvoicePart> invoice = List.of(
            new VsLine("Alphonso mango box", 2, 900),
            new VsLine("Jaggery", 5, 80),
            new VsDiscount("festival offer", 150));

        export("text", invoice, new VsTextExporter());
        export("xml", invoice, new VsXmlExporter());
    }
}

interface VsInvoiceVisitor<R> {
    R visitLine(VsLine line);

    R visitDiscount(VsDiscount discount);
}

interface VsInvoicePart {
    <R> R accept(VsInvoiceVisitor<R> visitor);
}

class VsLine implements VsInvoicePart {
    final String product;
    final int quantity;
    final int unitPrice;

    VsLine(String product, int quantity, int unitPrice) {
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    @Override
    public <R> R accept(VsInvoiceVisitor<R> visitor) {
        return visitor.visitLine(this);
    }
}

class VsDiscount implements VsInvoicePart {
    final String reason;
    final int amount;

    VsDiscount(String reason, int amount) {
        this.reason = reason;
        this.amount = amount;
    }

    @Override
    public <R> R accept(VsInvoiceVisitor<R> visitor) {
        return visitor.visitDiscount(this);
    }
}

class VsTextExporter implements VsInvoiceVisitor<String> {
    @Override
    public String visitLine(VsLine line) {
        return line.quantity + " x " + line.product + " = " + (line.quantity * line.unitPrice);
    }

    @Override
    public String visitDiscount(VsDiscount discount) {
        return "Discount (" + discount.reason + ") = -" + discount.amount;
    }
}

class VsXmlExporter implements VsInvoiceVisitor<String> {
    @Override
    public String visitLine(VsLine line) {
        return "<line item='" + line.product + "' qty='" + line.quantity + "'/>";
    }

    @Override
    public String visitDiscount(VsDiscount discount) {
        return "<discount amount='" + discount.amount + "'/>";
    }
}
// OUTPUT:
// -- text --
// 2 x Alphonso mango box = 1800
// 5 x Jaggery = 400
// Discount (festival offer) = -150
// -- xml --
// <line item='Alphonso mango box' qty='2'/>
// <line item='Jaggery' qty='5'/>
// <discount amount='150'/>
`),
    blk(`<h4>Sample mini project: payroll with several visitors</h4>
<p>Three employee types and three visitors (monthly pay, yearly bonus, a text report). The employee classes carry data only. The report visitor also shows how to combine a visitor result into a readable table. Add a fourth visitor (for example "leave balance") without touching any employee class.</p>`,
`// Mini project: payroll visitors over different employee types
import java.util.List;

public class VsPayrollProject {
    public static void main(String[] args) {
        List<VsEmployee> staff = List.of(
            new VsManager("Asha", 90000, 4),
            new VsEngineer("Ravi", 60000, 10),
            new VsIntern("Meera", 15000));

        VsMonthlyPay monthly = new VsMonthlyPay();
        VsYearlyBonus bonus = new VsYearlyBonus();
        int monthlyTotal = 0;

        System.out.println("Name    Monthly   Bonus");
        for (VsEmployee employee : staff) {
            int pay = employee.accept(monthly);
            int extra = employee.accept(bonus);
            monthlyTotal += pay;
            System.out.printf("%-7s %7d %7d%n", employee.name(), pay, extra);
        }
        System.out.println("Monthly payroll total: " + monthlyTotal);
    }
}

interface VsPayVisitor<R> {
    R visitManager(VsManager manager);

    R visitEngineer(VsEngineer engineer);

    R visitIntern(VsIntern intern);
}

interface VsEmployee {
    String name();

    <R> R accept(VsPayVisitor<R> visitor);
}

record VsManager(String name, int base, int teamSize) implements VsEmployee {
    @Override
    public <R> R accept(VsPayVisitor<R> visitor) {
        return visitor.visitManager(this);
    }
}

record VsEngineer(String name, int base, int overtimeHours) implements VsEmployee {
    @Override
    public <R> R accept(VsPayVisitor<R> visitor) {
        return visitor.visitEngineer(this);
    }
}

record VsIntern(String name, int stipend) implements VsEmployee {
    @Override
    public <R> R accept(VsPayVisitor<R> visitor) {
        return visitor.visitIntern(this);
    }
}

class VsMonthlyPay implements VsPayVisitor<Integer> {
    @Override
    public Integer visitManager(VsManager manager) {
        return manager.base() + manager.teamSize() * 1000;  // allowance per report
    }

    @Override
    public Integer visitEngineer(VsEngineer engineer) {
        return engineer.base() + engineer.overtimeHours() * 400;
    }

    @Override
    public Integer visitIntern(VsIntern intern) {
        return intern.stipend();
    }
}

class VsYearlyBonus implements VsPayVisitor<Integer> {
    @Override
    public Integer visitManager(VsManager manager) {
        return manager.base() * 2;
    }

    @Override
    public Integer visitEngineer(VsEngineer engineer) {
        return engineer.base();
    }

    @Override
    public Integer visitIntern(VsIntern intern) {
        return 0;
    }
}
// OUTPUT:
// Name    Monthly   Bonus
// Asha      94000  180000
// Ravi      64000   60000
// Meera     15000       0
// Monthly payroll total: 173000
`),
    blk(`<h4>Thread safety, testing and Spring integration</h4>
<ul>
<li><b>Thread safety:</b> stateless visitors (area, export to String) are safe to share. A visitor that accumulates totals is <b>not</b>; create one per traversal or per thread. If elements are mutated while visited, you need external locking or an immutable structure (records are ideal).</li>
<li><b>Testing:</b> test each visitor with one small element of each type, and add a "recording visitor" that logs the visit order to test the traversal of composites. For sealed hierarchies the compiler already proves exhaustiveness.</li>
<li><b>Spring:</b> visitors that need services can be registered as beans. A common idiom is to inject a <code>List&lt;Visitor&gt;</code> and run them all over a document (each visitor is one validation rule or exporter). Keep traversal in the domain model, not in a controller.</li>
<li><b>Evolution:</b> expose visitor interfaces as a published API only if you can accept that adding an element type will break implementers. Default methods on the visitor interface (for example a <code>visitUnknown</code>) soften that.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Visitor for two classes and one operation:</b> far more code than a plain method.</li>
<li><b>instanceof chains inside a visitor</b> that defeat the dispatch the pattern provides.</li>
<li><b>Visitors that mutate elements</b> in surprising ways during a read-only looking traversal.</li>
<li><b>Huge visitor interfaces</b> with 30 methods that every implementer must fill. Split by sub-hierarchy or use an adapter base class with empty defaults.</li>
</ul>`),
  ],
  interviewQA: [
    ['What problem does the Visitor pattern solve?', 'It lets you add new operations to a stable class hierarchy without modifying the classes. Each operation lives in a visitor with one method per element type, so related logic stays together.'],
    ['What is double dispatch and why does Visitor need it?', 'Java chooses overloads by compile-time argument type, so visitor.visit(element) with a base-type variable picks the base overload. By calling element.accept(visitor), the first dispatch selects the element class at run time and the second call selects the visitor method for that exact class.'],
    ['What is the main drawback of Visitor?', 'Adding a new element class forces every visitor to change, because each needs a new visit method. The pattern is good when operations change often and element types are stable.'],
    ['How does Visitor differ from Strategy?', 'Strategy swaps one algorithm on a single context object. Visitor applies an operation across a structure of different element types and chooses behaviour per element type through double dispatch.'],
    ['Can Java 21 features replace Visitor?', 'Often yes. A sealed interface with records and a pattern-matching switch gives exhaustive, compiler-checked dispatch in one place. Visitor is still useful when operations are added by separate modules or when you want the classic extensible API.'],
    ['Where is Visitor used in the JDK and tools?', 'Files.walkFileTree with FileVisitor and SimpleFileVisitor, javax.lang.model ElementVisitor in annotation processing, and syntax tree libraries such as ASM, JavaParser and ANTLR.'],
    ['How do you handle a composite structure with Visitor?', 'Decide who traverses. Either the composite element calls accept on each child inside its own accept, or the visitor recurses itself. Pass the visitor to children consistently and keep per-run state in a fresh visitor instance.'],
  ],
};

export const designPatternExtras4: Record<string, TopicExtra> = {
  'command-pattern': command,
  'template-method-pattern': template,
  'memento-pattern': memento,
  'state-pattern': state,
  'visitor-pattern': visitor,
};
