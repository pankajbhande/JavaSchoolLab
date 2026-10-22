"""Stack lesson: last in, first out. Every method has a runnable sample.
Data uses only fort names and Indian city names. Run build.py to compile and run every sample."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

BEGINNER = [
    section(
        'What is a Stack?',
        'A <strong>stack</strong> is a pile where you only touch the <strong>top</strong>. The last item you put on is the first item you take off: <strong>LIFO</strong> (Last In, First Out). '
        'Think of a pile of plates, or the Back button of a browser: the page you visited most recently is the first one you go back to.',
        [
            'The class <code>java.util.Stack</code> extends <code>Vector</code>, so it is a growable array in which the <strong>end</strong> of the array is the <strong>top</strong> of the stack.',
            'Only five methods are special: <code>push</code>, <code>pop</code>, <code>peek</code>, <code>empty</code> and <code>search</code>.',
            'Because it extends Vector, it is <strong>synchronized</strong> (thread-safe, slower) and also exposes all Vector/List methods (<code>get(i)</code>, <code>add(i, e)</code>, ...), which can break the LIFO discipline.',
            'Allows duplicates and <code>null</code>. Starts with capacity 10 and doubles when full.',
            '<strong>Modern advice:</strong> the Java documentation itself recommends <code>Deque&lt;E&gt; stack = new ArrayDeque&lt;&gt;()</code> for new code. Learn <code>Stack</code> for interviews and to read old code.',
        ],
    ),
    (
        '<h3>Where Stack sits in the Collection Framework</h3>\n'
        + hierarchy([
            ('Collection', 'I', True, None, G), ('List', 'I', True, 'extends', G), ('AbstractList', 'c', False, 'implements', B),
            ('Vector', 'c', False, 'extends', G), ('Stack', 'c', False, 'extends', G),
        ])
        + '\n<p>(I) = interface, (c) = class.</p>',
        [],
    ),
    (
        '<h3>The five Stack methods at a glance</h3>\n'
        + table(['Method', 'What it does', 'On an empty stack', 'Time'], [
            ['<strong>push(e)</strong>', 'Puts e on top and returns it', '-', 'O(1) amortised'],
            ['<strong>pop()</strong>', 'Removes and returns the top element', 'throws <code>EmptyStackException</code>', 'O(1)'],
            ['<strong>peek()</strong>', 'Returns the top element without removing it', 'throws <code>EmptyStackException</code>', 'O(1)'],
            ['<strong>empty()</strong>', '<code>true</code> if there are no elements', '<code>true</code>', 'O(1)'],
            ['<strong>search(o)</strong>', 'Position of o counted from the <strong>top</strong> (1 = top), or -1', '-1', 'O(n)'],
        ]),
        [],
    ),
    (
        '<h3>Your first Stack program</h3>\n'
        + ul([
            'Items go on top with <code>push</code>; the printed list shows the <strong>bottom first</strong> and the top last.',
            '<code>pop</code> takes the top item off, so the order of removal is the reverse of the order of adding.',
        ]),
        [r'''// First Stack program: push, peek, pop
import java.util.Stack;

public class StackFirstDemo {
    public static void main(String[] args) {
        Stack<String> forts = new Stack<>();

        forts.push("Raigad");       // bottom
        forts.push("Sinhagad");
        forts.push("Torna");        // top

        System.out.println("Stack (bottom to top): " + forts);
        System.out.println("peek -> " + forts.peek() + "   (not removed)");
        System.out.println("pop  -> " + forts.pop());
        System.out.println("pop  -> " + forts.pop());
        System.out.println("Left: " + forts);
    }
}
''' + OUT],
    ),
]

INTERMEDIATE = [
    section('The Stack methods', 'Each method with a runnable example.'),
    method(
        'push(E item)', 'E push(E item)', 'the item that was pushed', 'O(1) amortised',
        'Puts the item on the <strong>top</strong> of the stack. It also returns the item, which is handy in expressions.',
        'Internally it calls <code>addElement(item)</code>, so the "top" is the <strong>last index</strong> of the underlying array (the opposite of <code>Deque.push</code>, which adds at the <em>front</em>). The vector grows by doubling when it is full.',
        r'''// Stack push(E item): add on top
import java.util.Stack;

public class StackPushDemo {
    public static void main(String[] args) {
        Stack<String> plates = new Stack<>();

        plates.push("Plate 1");   // goes on the bottom
        plates.push("Plate 2");   // goes on top of Plate 1

        System.out.println(plates);
    }
}
''' + OUT),
    method(
        'pop()', 'E pop()', 'the removed top element', 'O(1)',
        'Removes the <strong>top</strong> element and returns it. If the stack is empty it throws <code>EmptyStackException</code>, so check <code>empty()</code> first when the stack might be empty.',
        'Implemented as <code>peek()</code> then <code>removeElementAt(size - 1)</code>: no shifting because the top is the last slot. <code>EmptyStackException</code> is an unchecked <code>RuntimeException</code>.',
        r'''// Stack pop(): remove from the top, and the empty-stack error
import java.util.EmptyStackException;
import java.util.Stack;

public class StackPopDemo {
    public static void main(String[] args) {
        Stack<String> plates = new Stack<>();
        plates.push("Plate 1");
        plates.push("Plate 2");

        System.out.println(plates.pop());   // Plate 2: the top one comes out first
        System.out.println(plates.pop());   // Plate 1

        try {
            plates.pop();                   // nothing left to pop
        } catch (EmptyStackException e) {
            System.out.println("Stack is empty");
        }
    }
}
''' + OUT),
    method(
        'peek()', 'E peek()', 'the top element (not removed)', 'O(1)',
        'Look at the top element without removing it. Use it to decide <em>whether</em> to pop. Throws <code>EmptyStackException</code> when empty.',
        'Unlike <code>Deque.peek()</code>, which returns <code>null</code> for an empty deque, <code>Stack.peek()</code> throws. Do not assume the two behave alike when you migrate.',
        r'''// Stack peek(): look at the top without removing it
import java.util.Stack;

public class StackPeekDemo {
    public static void main(String[] args) {
        Stack<String> plates = new Stack<>();
        plates.push("Plate 1");
        plates.push("Plate 2");

        System.out.println(plates.peek());   // Plate 2: only looks
        System.out.println(plates.size());   // still 2: nothing removed
    }
}
''' + OUT),
    method(
        'empty()', 'boolean empty()', '<code>true</code> if the stack has no elements', 'O(1)',
        'Tells whether the stack is empty. It is the classic Stack name; <code>isEmpty()</code> (inherited from Vector) does exactly the same.',
        'The two names exist for historical reasons. Prefer <code>isEmpty()</code> in new code so the call works with any collection.',
        r'''// Stack empty(): is the stack empty?
import java.util.Stack;

public class StackEmptyDemo {
    public static void main(String[] args) {
        Stack<String> plates = new Stack<>();

        System.out.println(plates.empty());   // true
        plates.push("Plate 1");
        System.out.println(plates.empty());   // false
    }
}
''' + OUT, extra_codes=(r'''// Stack isEmpty(): same as empty() (from Vector)
import java.util.Stack;

public class StackIsEmptyDemo {
    public static void main(String[] args) {
        Stack<String> plates = new Stack<>();

        System.out.println(plates.isEmpty());   // true
    }
}
''' + OUT,)),
    method(
        'search(Object o)', 'int search(Object o)', 'the 1-based distance from the top, or <code>-1</code>', 'O(n)',
        'Finds an element and tells how far it is from the <strong>top</strong>: the top element is at position <strong>1</strong>, the next at 2, and so on. If the element is not there you get <strong>-1</strong>. If it appears several times, the one <strong>closest to the top</strong> is reported.',
        'It is <code>size() - lastIndexOf(o)</code>. Note the two quirks: positions are <strong>1-based</strong> and counted <strong>from the top</strong>, unlike <code>indexOf</code> which is 0-based from the bottom.',
        r'''// Stack search(Object): position counted from the top, starting at 1
import java.util.Stack;

public class StackSearchDemo {
    public static void main(String[] args) {
        Stack<String> plates = new Stack<>();
        plates.push("Plate 1");
        plates.push("Plate 2");
        plates.push("Plate 3");

        System.out.println(plates.search("Plate 3"));   // 1: it is on top
        System.out.println(plates.search("Plate 1"));   // 3: third from the top
        System.out.println(plates.search("Plate 9"));   // -1: not found
    }
}
''' + OUT),

    section('Inherited Vector methods', 'A Stack <em>is a</em> Vector, so every Vector method works. Be careful: the ones that touch the middle break the "only the top" rule.'),
    method(
        'Walking a Stack', 'for-each, iterator(), listIterator(), forEach(), stream(), get(i)', 'elements from the <strong>bottom to the top</strong>', 'O(n)',
        'Iterating a Stack visits the elements from the <strong>bottom</strong> up (insertion order), which is the opposite of the order <code>pop</code> would return them. To print "top first" iterate backwards or use a <code>ListIterator</code>.',
        'This surprises people who switch to <code>ArrayDeque</code> or <code>LinkedList</code> used as a stack, where iteration goes from the <strong>top</strong> down. Do not rely on iteration order when you change the class.',
        r'''// Iterating a Stack goes bottom to top; popping goes top to bottom
import java.util.Stack;

public class StackIterateDemo {
    public static void main(String[] args) {
        Stack<String> plates = new Stack<>();
        plates.push("Plate 1");
        plates.push("Plate 2");
        plates.push("Plate 3");

        for (String plate : plates) {          // loop starts from the bottom
            System.out.println(plate);
        }

        while (!plates.isEmpty()) {            // popping starts from the top
            System.out.println(plates.pop());
        }
    }
}
''' + OUT),
    method(
        'Methods that break the LIFO rule', 'get(i), add(i, e), remove(i), set(i, e), insertElementAt(e, i)', 'work on any position', 'O(1) / O(n)',
        'Because Stack inherits the Vector (List) methods, nothing stops you from reading or removing in the <strong>middle</strong>. That is legal, but then it is no longer a true stack.',
        'This is a design flaw of <code>java.util.Stack</code> (inheritance instead of composition) and a main reason that <code>Deque</code>/<code>ArrayDeque</code> is recommended: it exposes only the end operations.',
        r'''// Stack also has List methods
import java.util.Stack;

public class StackListMethodsDemo {
    public static void main(String[] args) {
        Stack<String> plates = new Stack<>();
        plates.push("Plate 1");
        plates.push("Plate 2");
        plates.push("Plate 3");

        System.out.println(plates.get(0));   // List method: reads the bottom plate
        System.out.println(plates.size());   // 3 plates
    }
}
''' + OUT),
    method(
        'Stack as the modern Deque', 'Deque<E> stack = new ArrayDeque<>();  push, pop, peek', 'LIFO with a clean API', 'O(1)',
        'The recommended replacement is <code>ArrayDeque</code> used through the <code>Deque</code> interface. It has the same <code>push</code>, <code>pop</code> and <code>peek</code> names but offers only end operations, is not synchronized (so faster) and returns <code>null</code> from <code>peek()</code> on an empty stack.',
        'Differences to remember: <code>Deque.pop()</code> throws <code>NoSuchElementException</code> (not <code>EmptyStackException</code>), <code>peek()</code> returns <code>null</code>, <code>ArrayDeque</code> forbids <code>null</code> elements, and iteration goes from the <strong>top</strong> down.',
        r'''// The modern stack: Deque with ArrayDeque
import java.util.ArrayDeque;
import java.util.Deque;

public class ModernStackDemo {
    public static void main(String[] args) {
        Deque<String> plates = new ArrayDeque<>();

        plates.push("Plate 1");               // add on top
        plates.push("Plate 2");

        System.out.println(plates.peek());    // Plate 2: look at the top
        System.out.println(plates.pop());     // Plate 2: remove the top
    }
}
''' + OUT),
    (
        '<h3>Master program: every Stack method in one place</h3>\n'
        '<p>One single program that uses all the Stack methods you learned above, step by step. Read the numbered comments from top to bottom, run it, and match each output line with its step.</p>',
        [r'''// MASTER PROGRAM: all important Stack methods in one program
import java.util.EmptyStackException;
import java.util.Stack;

public class StackMasterDemo {
    public static void main(String[] args) {
        // 1. Create an empty stack
        Stack<String> plates = new Stack<>();
        System.out.println("1. empty()   : " + plates.empty());   // true

        // 2. push: add on top
        plates.push("Plate 1");
        plates.push("Plate 2");
        plates.push("Plate 3");
        System.out.println("2. After push: " + plates);

        // 3. peek: look at the top, nothing is removed
        System.out.println("3. peek      : " + plates.peek());

        // 4. search: position from the top, starting at 1
        System.out.println("4. search    : " + plates.search("Plate 3") + " and " + plates.search("Plate 1"));

        // 5. List methods also work: size, get, isEmpty, contains
        System.out.println("5. size/get  : " + plates.size() + " / " + plates.get(0));
        System.out.println("   isEmpty   : " + plates.isEmpty());
        System.out.println("   contains  : " + plates.contains("Plate 2"));

        // 6. Loop: for-each starts from the bottom
        for (String plate : plates) {
            System.out.print(plate + " | ");
        }
        System.out.println();

        // 7. pop: remove from the top until the stack is empty
        while (!plates.empty()) {
            System.out.println("7. pop       : " + plates.pop());
        }

        // 8. pop on an empty stack throws an exception
        try {
            plates.pop();
        } catch (EmptyStackException e) {
            System.out.println("8. Stack is empty, cannot pop");
        }
    }
}
''' + OUT],
    ),
]

EXPERT = [
    section(
        'Where stacks are used',
        'LIFO order appears all over programming. Four classic jobs, each with a program:',
        [
            '<strong>Matching brackets</strong> in a compiler or editor.',
            '<strong>Reversing</strong> a sequence.',
            '<strong>Undo / Back</strong> history in applications and browsers.',
            '<strong>Evaluating expressions</strong> (postfix notation) and the <strong>call stack</strong> of method calls, including recursion.',
        ],
    ),
    (
        '<h3>Example 1: checking balanced brackets</h3>\n<p>Push every opening bracket; when a closing bracket arrives, the top of the stack must be its partner.</p>',
        [r'''// Balanced brackets with a Stack
import java.util.Stack;

public class StackBracketsDemo {
    static boolean isBalanced(String text) {
        Stack<Character> open = new Stack<>();
        for (char c : text.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                open.push(c);                          // remember the opener
            } else if (c == ')' || c == ']' || c == '}') {
                if (open.empty()) {
                    return false;                      // a closer with nothing open
                }
                char top = open.pop();                 // the most recent opener must match
                boolean ok = (c == ')' && top == '(') || (c == ']' && top == '[') || (c == '}' && top == '{');
                if (!ok) {
                    return false;
                }
            }
        }
        return open.empty();                           // anything still open is an error
    }

    public static void main(String[] args) {
        System.out.println("{[()]}  -> " + isBalanced("{[()]}"));
        System.out.println("{[(])}  -> " + isBalanced("{[(])}"));
        System.out.println("((      -> " + isBalanced("(("));
        System.out.println("Pune)   -> " + isBalanced("Pune)"));
    }
}
''' + OUT],
    ),
    (
        '<h3>Example 2: reversing and the browser Back button</h3>\n<p>Pushing then popping reverses the order. A Back button keeps visited pages on a stack.</p>',
        [r'''// Reverse a word and model a browser Back button with a Stack
import java.util.Stack;

public class StackReverseBackDemo {
    public static void main(String[] args) {
        Stack<Character> letters = new Stack<>();
        for (char c : "Sinhagad".toCharArray()) {
            letters.push(c);                           // push in order ...
        }
        StringBuilder reversed = new StringBuilder();
        while (!letters.empty()) {
            reversed.append(letters.pop());            // ... pop returns the reverse order
        }
        System.out.println("Reversed: " + reversed);

        Stack<String> history = new Stack<>();         // the pages we have visited
        history.push("Pune");
        history.push("Nashik");
        history.push("Nagpur");
        System.out.println("On page : " + history.peek());
        history.pop();                                 // press Back
        System.out.println("Back to : " + history.peek());
    }
}
''' + OUT],
    ),
    (
        '<h3>Example 3: evaluating a postfix expression</h3>\n<p>In postfix notation the operator comes after its operands: <code>6 2 3 + *</code> means <code>6 * (2 + 3)</code>. A stack evaluates it in one pass.</p>',
        [r'''// Evaluate a postfix expression with a Stack
import java.util.Stack;

public class StackPostfixDemo {
    static int evaluate(String expression) {
        Stack<Integer> numbers = new Stack<>();
        for (String token : expression.split(" ")) {
            switch (token) {
                case "+" -> numbers.push(numbers.pop() + numbers.pop());
                case "*" -> numbers.push(numbers.pop() * numbers.pop());
                case "-" -> { int b = numbers.pop(); int a = numbers.pop(); numbers.push(a - b); }   // order matters
                case "/" -> { int b = numbers.pop(); int a = numbers.pop(); numbers.push(a / b); }
                default -> numbers.push(Integer.parseInt(token));         // a number goes on the stack
            }
        }
        return numbers.pop();                                              // the single result is left
    }

    public static void main(String[] args) {
        System.out.println("6 2 3 + *   = " + evaluate("6 2 3 + *"));
        System.out.println("10 2 8 * + 3 - = " + evaluate("10 2 8 * + 3 -"));
        System.out.println("20 4 /      = " + evaluate("20 4 /"));
    }
}
''' + OUT],
    ),
    (
        '<h3>Example 4: recursion is a stack</h3>\n<p>Every method call is pushed onto the JVM\'s <strong>call stack</strong>; returning pops it. Very deep recursion overflows that stack and throws <code>StackOverflowError</code>. You can replace recursion by your own <code>Stack</code> object.</p>',
        [r'''// Recursion uses the call stack; an explicit Stack does the same job safely
import java.util.Stack;

public class StackRecursionDemo {
    static int depthRecursive(int n) {                 // each call waits on the call stack
        return n == 0 ? 0 : 1 + depthRecursive(n - 1);
    }

    static int depthWithStack(int n) {                 // the same counting with our own Stack
        Stack<Integer> pending = new Stack<>();
        while (n > 0) {
            pending.push(n);
            n--;
        }
        int depth = 0;
        while (!pending.empty()) {
            pending.pop();
            depth++;
        }
        return depth;
    }

    public static void main(String[] args) {
        System.out.println("recursive, n=1000     : " + depthRecursive(1000));
        System.out.println("explicit stack, n=1000000: " + depthWithStack(1_000_000));
        try {
            depthRecursive(10_000_000);                // far too deep for the call stack
        } catch (StackOverflowError e) {
            System.out.println("recursive, n=10000000 : StackOverflowError");
        }
    }
}
''' + OUT],
    ),
    (
        '<h3>Stack versus ArrayDeque versus LinkedList as a stack</h3>\n'
        + table(['', 'Stack', 'ArrayDeque', 'LinkedList (as Deque)'], [
            ['Thread-safe', 'Yes (synchronized)', 'No', 'No'],
            ['Speed', 'Slowest (locks)', '<strong>Fastest</strong>', 'Fast, more memory'],
            ['Allows null', 'Yes', 'No', 'Yes'],
            ['pop() on empty', '<code>EmptyStackException</code>', '<code>NoSuchElementException</code>', '<code>NoSuchElementException</code>'],
            ['peek() on empty', '<code>EmptyStackException</code>', 'returns <code>null</code>', 'returns <code>null</code>'],
            ['Iteration order', 'Bottom to top', 'Top to bottom', 'Top to bottom'],
            ['Exposes middle operations', 'Yes (it is a Vector)', 'No', 'Yes (it is a List)'],
            ['Recommended', 'Legacy', '<strong>Yes</strong>', 'Only when you need List too'],
        ]),
        [],
    ),
    section(
        'Best practices',
        'Keep stacks correct and easy to maintain.',
        [
            'For new code use <code>Deque&lt;T&gt; stack = new ArrayDeque&lt;&gt;()</code>.',
            'Check <code>empty()</code> (or <code>isEmpty()</code>) before <code>pop()</code>/<code>peek()</code> unless an empty stack is a real bug.',
            'Do not call <code>get</code>, <code>add(i, e)</code> or <code>remove(i)</code> on a stack; if you need them you want a List.',
            'Replace deep recursion by an explicit stack when the depth can be large.',
            'Declare the variable with the interface type (<code>Deque</code>) so you can change the class later.',
        ],
    ),
]

QA = [
    ('What is a Stack and which principle does it follow?',
     'A Stack is a LIFO structure: the last element pushed is the first one popped. In Java, java.util.Stack extends Vector and offers push, pop, peek, empty and search.'),
    ('What is the difference between peek() and pop()?',
     'Both return the top element; peek() leaves it on the stack, pop() removes it. Both throw EmptyStackException on an empty Stack.'),
    ('What does search() return?',
     'The 1-based position of the element counted from the top of the stack (top = 1), the closest occurrence if there are duplicates, or -1 if absent.'),
    ('Why is java.util.Stack discouraged?',
     'It extends Vector, so it is synchronized (slow) and exposes List methods that break LIFO. ArrayDeque used through Deque is faster, has a clean end-only API and is recommended by the Javadoc.'),
    ('Which exception is thrown by pop() on an empty Stack?',
     'EmptyStackException (unchecked). A Deque throws NoSuchElementException for pop() and returns null for peek().'),
    ('In which order does a for-each loop visit a Stack?',
     'From the bottom to the top (insertion order), the reverse of the pop order. An ArrayDeque used as a stack iterates top first.'),
    ('How do you check for balanced brackets?',
     'Push each opening bracket; on a closing bracket pop and verify it is the matching opener; at the end the stack must be empty.'),
    ('What is the call stack?',
     'The JVM keeps a stack of frames for method calls: calling a method pushes a frame and returning pops it. Too deep a recursion throws StackOverflowError.'),
    ('Is Stack thread-safe?',
     'Its individual methods are synchronized (inherited from Vector), but compound actions such as peek-then-pop are not atomic.'),
    ('How do you get a stack\'s elements top first?',
     'Iterate with a ListIterator from the end, or use ArrayDeque, whose iterator already starts at the top.'),
]

TOPIC = dict(id='stack', name='Stack', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
