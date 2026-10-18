import { Topic } from '../coreJava';

export const commandPattern: Topic = {
    id: 'command-pattern',
    name: 'Command Pattern',
    beginner: [
        {
            content: `
Command Pattern encapsulates a <b>request as an object</b>, allowing you to parameterize clients, queue requests, and support undoable operations.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>Restaurant order slip - waiter writes down your order (encapsulates the request) and hands it to the chef, who executes it. The waiter doesn't need to know how the chef cooks.</li>
<li>TV remote control - each button press is a command object that knows how to turn the TV on/off, change channel, etc.</li>
</ul>

<h4>Why do we need Command Pattern?</h4>
<ul>
<li>To decouple the object that invokes an action (invoker) from the object that performs it (receiver)</li>
<li>To support undo/redo operations</li>
<li>To queue, log, or schedule requests for later execution</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li><code>Command</code> - interface with an execute() method</li>
<li>Concrete Command - binds a Receiver to an action</li>
<li>Receiver - knows how to actually perform the operation</li>
<li>Invoker - holds a command and triggers it, without knowing the details</li>
</ul>
`,
            codeExamples: [
                `package com.javaschoollab.demo;

// Step 1: Command Interface
interface Command {
    void execute();
}

// Step 2: Receiver
class Light {
    public void on() {
        System.out.println("Light is ON");
    }

    public void off() {
        System.out.println("Light is OFF");
    }
}

// Step 3: Concrete Commands
class LightOnCommand implements Command {

    private Light light;

    public LightOnCommand(Light light) {
        this.light = light;
    }

    public void execute() {
        light.on();
    }
}

class LightOffCommand implements Command {

    private Light light;

    public LightOffCommand(Light light) {
        this.light = light;
    }

    public void execute() {
        light.off();
    }
}

// Step 4: Invoker
class RemoteControl {

    private Command command;

    public void setCommand(Command command) {
        this.command = command;
    }

    public void pressButton() {
        command.execute();
    }
}

// Step 5: Client Code
public class Test {
    public static void main(String[] args) {
        Light livingRoomLight = new Light();

        Command lightOn = new LightOnCommand(livingRoomLight);
        Command lightOff = new LightOffCommand(livingRoomLight);

        RemoteControl remote = new RemoteControl();

        remote.setCommand(lightOn);
        remote.pressButton();

        remote.setCommand(lightOff);
        remote.pressButton();
    }
}`
            ]
        }
    ],

    expert: [
        {
            content: `
<h3>Undo / Redo Functionality</h3>
<p>
Because a Command object encapsulates everything needed to perform an action, it can also encapsulate
how to <b>undo</b> that action. This is why text editors, IDEs, and drawing apps rely heavily on Command.
</p>
`,
            codeExamples: [
                `package com.javaschoollab.demo;

import java.util.Stack;

interface Command {
    void execute();
    void undo();
}

class Light {
    private boolean isOn = false;

    public void on() {
        isOn = true;
        System.out.println("Light is ON");
    }

    public void off() {
        isOn = false;
        System.out.println("Light is OFF");
    }
}

class LightOnCommand implements Command {

    private Light light;

    public LightOnCommand(Light light) {
        this.light = light;
    }

    public void execute() {
        light.on();
    }

    public void undo() {
        light.off();
    }
}

class RemoteControlWithUndo {

    private Command lastCommand;
    private Stack<Command> history = new Stack<>();

    public void executeCommand(Command command) {
        command.execute();
        history.push(command);
    }

    public void undoLastCommand() {
        if (!history.isEmpty()) {
            Command last = history.pop();
            last.undo();
        }
    }
}

public class Test {
    public static void main(String[] args) {
        Light light = new Light();
        RemoteControlWithUndo remote = new RemoteControlWithUndo();

        remote.executeCommand(new LightOnCommand(light));
        remote.undoLastCommand(); // Turns light back off
    }
}`
            ]
        },
        {
            content: `
<h3><code>Runnable</code> as a Simple Command</h3>
<p>
<code>java.lang.Runnable</code> is essentially a minimal Command pattern built into the JDK -
it encapsulates a request (the <code>run()</code> method body) as an object that can be passed around,
queued, and executed later by another thread, without the caller knowing what it does internally.
</p>
`,
            codeExamples: [
                `Runnable printTask = () -> System.out.println("Task executed by another thread");

Thread worker = new Thread(printTask);
worker.start();

// Same idea used with ExecutorService
ExecutorService executor = Executors.newFixedThreadPool(2);
executor.submit(printTask);
executor.shutdown();`
            ]
        },
        {
            content: `
<h3>Command Queue for Job Scheduling</h3>
<p>
Command objects are naturally queueable since they are just objects. This makes Command a common
choice for background job systems, task schedulers, and thread pools - each job is wrapped as a
Command and pushed onto a queue for a worker to pick up and execute later.
</p>
`,
            codeExamples: [
                `import java.util.LinkedList;
import java.util.Queue;

interface Command {
    void execute();
}

class JobQueue {

    private Queue<Command> queue = new LinkedList<>();

    public void addJob(Command command) {
        queue.add(command);
    }

    public void processJobs() {
        while (!queue.isEmpty()) {
            Command job = queue.poll();
            job.execute();
        }
    }
}

public class Test {
    public static void main(String[] args) {
        JobQueue jobQueue = new JobQueue();

        jobQueue.addJob(() -> System.out.println("Sending Email"));
        jobQueue.addJob(() -> System.out.println("Generating Report"));
        jobQueue.addJob(() -> System.out.println("Backing up Database"));

        jobQueue.processJobs();
    }
}`
            ]
        },
        {
            content: `
<h4>Common Mistakes</h4>
<ul>
<li>Putting business logic inside the Command instead of delegating to the Receiver</li>
<li>Forgetting to maintain command history, making undo impossible</li>
<li>Not making commands immutable/stateless when reused across threads (job queues)</li>
<li>Overusing Command for trivial actions where a direct method call is simpler</li>
</ul>

<h4>Command vs Strategy</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Command</th>
<th>Strategy</th>
</tr>
<tr>
<td>Intent</td>
<td>Encapsulate a request/action to execute later, undo, or queue</td>
<td>Encapsulate an interchangeable algorithm</td>
</tr>
<tr>
<td>Focus</td>
<td>What to do and when/how to undo it</td>
<td>How to do something</td>
</tr>
<tr>
<td>Example</td>
<td>Remote control button, job queue task</td>
<td>Comparator, PaymentStrategy</td>
</tr>
</table>

<h4>When NOT to use Command?</h4>
<ul>
<li>When you don't need undo, queueing, or logging - a direct method call is simpler</li>
<li>When the number of possible actions is small and fixed with no need for extensibility</li>
</ul>
`
        }
    ]
};
