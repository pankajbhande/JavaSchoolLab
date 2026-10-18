import { Topic } from '../coreJava';

export const mediatorPattern: Topic = {
    id: 'mediator-pattern',
    name: 'Mediator Pattern',
    beginner: [
        {
            content: `
Mediator Pattern defines an object that <b>coordinates communication</b> between a group of other objects, so they don't talk to each other directly.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>Air Traffic Control Tower — planes don't talk to each other directly, tower coordinates them</li>
<li>Chat Room — users send messages through a mediator, not directly to every other user</li>
<li>Airport Ground Staff Coordination</li>
</ul>

<h4>Why do we need it?</h4>
<ul>
<li>Without a mediator, every object needs a reference to every other object (many-to-many mess)</li>
<li>Mediator centralizes communication logic in one place</li>
<li>Reduces tight coupling between components</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li>Step 1: Create a <code>Mediator</code> interface</li>
<li>Step 2: Create a concrete mediator implementing coordination logic</li>
<li>Step 3: Colleague objects (e.g., <code>User</code>) hold a reference to the mediator only</li>
<li>Step 4: Colleagues communicate via the mediator, never directly</li>
</ul>
`,
            codeExamples: [
                `package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.List;

// Step 1: Mediator Interface
interface ChatMediator {
    void sendMessage(String message, User sender);
    void addUser(User user);
}

// Step 3: Colleague class
abstract class User {
    protected ChatMediator mediator;
    protected String name;

    public User(ChatMediator mediator, String name) {
        this.mediator = mediator;
        this.name = name;
    }

    public abstract void send(String message);
    public abstract void receive(String message);
}

class ChatUser extends User {
    public ChatUser(ChatMediator mediator, String name) {
        super(mediator, name);
    }

    public void send(String message) {
        System.out.println(this.name + " sends: " + message);
        mediator.sendMessage(message, this);
    }

    public void receive(String message) {
        System.out.println(this.name + " received: " + message);
    }
}

// Step 2: Concrete Mediator
class ChatRoom implements ChatMediator {
    private List<User> users = new ArrayList<>();

    public void addUser(User user) {
        users.add(user);
    }

    public void sendMessage(String message, User sender) {
        for (User user : users) {
            // Step 4: users never talk to each other directly
            if (user != sender) {
                user.receive(message);
            }
        }
    }
}

public class Test {
    public static void main(String[] args) {
        ChatMediator chatRoom = new ChatRoom();

        User anaji = new ChatUser(chatRoom, "Anaji");
        User baji = new ChatUser(chatRoom, "Baji");
        User charlie = new ChatUser(chatRoom, "Chimnaji");

        chatRoom.addUser(anaji);
        chatRoom.addUser(baji);
        chatRoom.addUser(charlie);

        anaji.send("Hi everyone!");
    }
}`
            ]
        }
    ],
    expert: [
        {
            content: `
<h3>How Mediator Reduces Coupling</h3>
<p>
Without Mediator, N objects that need to talk to each other require up to
<code>N*(N-1)</code> direct references — a many-to-many mesh of dependencies.
With Mediator, every object needs only ONE reference — to the mediator — turning
the relationship into many-to-one.
</p>
`,
            codeExamples: [
                `Without Mediator:                With Mediator:

  A --- B                           A
  | \\ / |                          |
  |  X  |                          M --- B
  | / \\ |                          |
  C --- D                           C, D`
            ]
        },
        {
            content: `
<h3>Mediator vs Facade</h3>
<p>
Both patterns introduce an intermediary object, but their purpose is different.
</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Mediator</th>
<th>Facade</th>
</tr>
<tr>
<td>Intent</td>
<td>Coordinates two-way communication between colleague objects</td>
<td>Provides a simplified one-way entry point to a subsystem</td>
</tr>
<tr>
<td>Colleagues aware of it?</td>
<td>Yes — colleagues explicitly call the mediator</td>
<td>No — subsystem classes don't know Facade exists</td>
</tr>
<tr>
<td>New behavior</td>
<td>Mediator can add new coordination logic</td>
<td>Facade typically just forwards / simplifies calls</td>
</tr>
<tr>
<td>Example</td>
<td>Chat room, Air traffic control</td>
<td>Simplified API over multiple complex services</td>
</tr>
</table>
`
        },
        {
            content: `
<h3>Real-World Use — GUI Frameworks & Event Buses</h3>
<ul>
<li><b>GUI frameworks</b> — a Dialog acts as mediator between buttons, textboxes, checkboxes, so widgets don't reference each other directly</li>
<li><b>Event Bus / Message Bus</b> (e.g., Spring's <code>ApplicationEventPublisher</code>) — publishers and subscribers don't know each other, the bus mediates</li>
<li><b>java.util.concurrent.ExecutorService</b> — mediates between tasks and worker threads</li>
<li><b>MVC Controllers</b> — often act as mediators between View and Model components</li>
</ul>

<h4>Common Mistakes</h4>
<ul>
<li>Letting the mediator grow into a "God Object" containing all business logic</li>
<li>Colleague objects still holding direct references to each other "just in case"</li>
<li>Not splitting mediator responsibilities when it becomes too large — consider multiple smaller mediators</li>
</ul>

<h4>When NOT to use Mediator?</h4>
<ul>
<li>When there are only 2 objects interacting — direct communication is simpler</li>
<li>When coordination logic is trivial and unlikely to grow</li>
</ul>
`
        }
    ]
};
