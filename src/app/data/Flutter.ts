// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const Flutter: Course[] = [
    {
        id: 'flutter',
        name: 'Flutter',
        icon: 'Layout',
        subTopics: [
            {
                id: 'flutter-basics',
                name: 'Flutter Fundamentals',
                topics: [
                    {
                        id: 'flutter-intro',
                        name: 'Introduction to Flutter',
                        beginner: [
                            {
                                content: `<h3>What is Flutter?</h3>
• Flutter is Google's open-source UI toolkit for building natively compiled applications for mobile, web, and desktop from a <strong>single codebase</strong>.<br>
• It uses the <strong>Dart</strong> programming language and renders every pixel itself via the Skia/Impeller graphics engine, instead of relying on native platform widgets - which is why a Flutter app looks and behaves identically on Android and iOS.<br>
• Everything in Flutter is a <strong>Widget</strong> - text, padding, buttons, even the whole app itself. Widgets are composed together to build the UI, and Flutter rebuilds only the parts of the widget tree that actually change.<br><br>

<h4>Why Flutter?</h4>
1. Single Codebase: Write once, deploy to Android, iOS, Web, Windows, macOS, and Linux.<br>
2. Hot Reload: See code changes reflected in the running app in under a second, without losing app state.<br>
3. Native Performance: Compiles to native ARM/Intel machine code (AOT) for release builds - no JavaScript bridge like some cross-platform frameworks.<br>
4. Rich Widget Library: Material Design (Android-style) and Cupertino (iOS-style) widgets ship out of the box.<br>`,
                                codeExamples: [
                                    `// The smallest possible Flutter app
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: Scaffold(
        body: Center(
          child: Text(
            'Hello, Flutter!',
            style: TextStyle(fontSize: 24),
          ),
        ),
      ),
    );
  }
}
// OUTPUT: A screen showing "Hello, Flutter!" centered on a white background`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>StatelessWidget vs StatefulWidget</h4>
• <strong>StatelessWidget</strong>: immutable - once built, it never changes. Use it for UI that doesn't depend on any mutable state (e.g. a static label, an icon).<br>
• <strong>StatefulWidget</strong>: paired with a <code>State</code> object that CAN change over the widget's lifetime. Calling <code>setState()</code> tells Flutter "something changed, rebuild me" - Flutter then efficiently re-renders only the affected subtree.<br>`,
                                codeExamples: [
                                    `import 'package:flutter/material.dart';

class CounterPage extends StatefulWidget {
  const CounterPage({super.key});

  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _count = 0;

  void _increment() {
    setState(() {
      _count++; // triggers a rebuild of this widget's subtree
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(child: Text('Count: \$_count', style: const TextStyle(fontSize: 28))),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
// OUTPUT: Tapping the + button increments the on-screen count by 1 each time`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'flutter-widgets',
                        name: 'Widgets & Layout Basics',
                        beginner: [
                            {
                                content: `<h3>Building Layouts with Widgets</h3>
Flutter layout is built by composing widgets. The two most fundamental layout widgets are:<br>
• <code>Row</code> - arranges children horizontally.<br>
• <code>Column</code> - arranges children vertically.<br><br>
Other common layout widgets: <code>Container</code> (box model - padding, margin, decoration), <code>Stack</code> (overlapping children), <code>Expanded</code>/<code>Flexible</code> (share available space), <code>ListView</code> (scrollable list).<br>`,
                                codeExamples: [
                                    `import 'package:flutter/material.dart';

class ProfileCard extends StatelessWidget {
  const ProfileCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.orange.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const CircleAvatar(radius: 24, child: Icon(Icons.person)),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('Pankaj', style: TextStyle(fontWeight: FontWeight.bold)),
              Text('Flutter Developer'),
            ],
          ),
        ],
      ),
    );
  }
}
// OUTPUT: An avatar with a name and role laid out side by side in a card`
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'flutter-state',
                name: 'State Management',
                topics: [
                    {
                        id: 'flutter-provider',
                        name: 'State Management with Provider',
                        beginner: [
                            {
                                content: `<h3>Why State Management?</h3>
setState() works fine for small, local state, but it doesn't scale: it can't share state between distant widgets without passing data down through many constructors ("prop drilling"). <strong>Provider</strong> is one of the most common Flutter state-management packages - it makes an object available to any widget below it in the tree, and rebuilds only the widgets that actually read that object.<br>`,
                                codeExamples: [
                                    `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// 1. The state, as a plain Dart class using ChangeNotifier
class CartModel extends ChangeNotifier {
  int _itemCount = 0;
  int get itemCount => _itemCount;

  void addItem() {
    _itemCount++;
    notifyListeners(); // tells listening widgets to rebuild
  }
}

// 2. Provide it above the widgets that need it
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => CartModel(),
      child: const MyApp(),
    ),
  );
}

// 3. Read it anywhere below, without passing it through constructors
class CartBadge extends StatelessWidget {
  const CartBadge({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartModel>(); // rebuilds when notifyListeners() fires
    return Text('Items: \${cart.itemCount}');
  }
}
// OUTPUT: "Items: 0" initially; increments whenever cart.addItem() is called anywhere in the app`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>context.watch() vs context.read()</h4>
• <code>context.watch&lt;T&gt;()</code>: subscribes this widget to rebuilds whenever T changes - use it inside build().<br>
• <code>context.read&lt;T&gt;()</code>: reads the value once without subscribing to rebuilds - use it inside callbacks (onPressed, etc.) where you don't need the widget itself to rebuild.<br>`,
                                codeExamples: [
                                    `ElevatedButton(
  // read(): we're calling a method, not displaying a value - no rebuild needed here
  onPressed: () => context.read<CartModel>().addItem(),
  child: const Text('Add to cart'),
)`
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'flutter-advanced',
                name: 'Navigation & Networking',
                topics: [
                    {
                        id: 'flutter-navigation',
                        name: 'Navigation & Routing',
                        beginner: [
                            {
                                content: `<h3>Navigating Between Screens</h3>
Flutter manages screens with a <strong>stack of routes</strong> via the <code>Navigator</code> widget. <code>Navigator.push()</code> adds a new screen on top of the stack; <code>Navigator.pop()</code> removes the current screen and returns to the previous one.<br>`,
                                codeExamples: [
                                    `import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const DetailScreen()),
            );
          },
          child: const Text('Go to Detail'),
        ),
      ),
    );
  }
}

class DetailScreen extends StatelessWidget {
  const DetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detail')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => Navigator.pop(context), // go back
          child: const Text('Back'),
        ),
      ),
    );
  }
}
// OUTPUT: Tapping "Go to Detail" pushes a new screen; tapping "Back" pops it off the stack`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'flutter-networking',
                        name: 'Working with APIs (http + FutureBuilder)',
                        beginner: [
                            {
                                content: `<h3>Calling a REST API</h3>
The <code>http</code> package makes network requests, which are inherently asynchronous (they return a <code>Future</code>). <code>FutureBuilder</code> is a widget that rebuilds itself based on the state of a Future - loading, error, or data.<br>`,
                                codeExamples: [
                                    `import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

Future<List<String>> fetchUserNames() async {
  final response = await http.get(Uri.parse('https://api.example.com/users'));
  if (response.statusCode == 200) {
    final List data = jsonDecode(response.body);
    return data.map((u) => u['name'] as String).toList();
  }
  throw Exception('Failed to load users');
}

class UsersScreen extends StatelessWidget {
  const UsersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Users')),
      body: FutureBuilder<List<String>>(
        future: fetchUserNames(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: \${snapshot.error}'));
          }
          final names = snapshot.data!;
          return ListView.builder(
            itemCount: names.length,
            itemBuilder: (context, index) => ListTile(title: Text(names[index])),
          );
        },
      ),
    );
  }
}
// OUTPUT: Shows a spinner while loading, then a scrollable list of user names once the API responds`
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        cheatNotes: [
            'Widget - The basic building block of every Flutter UI element',
            'StatelessWidget - Immutable widget with no internal mutable state',
            'StatefulWidget - Widget backed by a State object that can change via setState()',
            'setState() - Notifies Flutter to rebuild a StatefulWidget subtree',
            'BuildContext - Handle to a widget\'s location in the widget tree',
            'Scaffold - Provides the basic Material Design visual layout (AppBar, body, FAB)',
            'Row / Column - Arrange children horizontally / vertically',
            'Container - Box-model widget for padding, margin, decoration, sizing',
            'Expanded / Flexible - Make a child fill or share available space in a Row/Column',
            'ListView.builder - Efficiently builds a long/infinite scrollable list on demand',
            'Hot Reload - Injects updated code into a running app in under a second',
            'Hot Restart - Restarts the app fresh, resetting all state',
            'pubspec.yaml - Declares dependencies, assets, and fonts for a Flutter project',
            'MaterialApp / CupertinoApp - Root widget providing Android / iOS style theming',
            'Navigator.push() / pop() - Push a new route onto / pop the top route off the stack',
            'Provider - Popular package for sharing and rebuilding on state changes',
            'ChangeNotifier - Class that can notify listeners when its data changes',
            'context.watch<T>() - Subscribes to rebuilds when T changes (used in build())',
            'context.read<T>() - Reads T once without subscribing (used in callbacks)',
            'Future / async / await - Dart\'s building blocks for asynchronous code',
            'FutureBuilder - Rebuilds UI based on a Future\'s loading/error/data state',
            'StreamBuilder - Rebuilds UI based on events from a Stream',
            'const constructor - Marks a widget as compile-time constant for better performance',
            'Key - Identifies widgets across rebuilds, important for list item state',
        ],
        interviewQuestions: [
            {
                company: 'General Flutter Interview',
                questions: [
                    'What is Flutter and how is it different from React Native?',
                    'Explain the difference between StatelessWidget and StatefulWidget.',
                    'What does setState() actually do internally?',
                    'What is the widget tree, and how does Flutter\'s rendering pipeline work?',
                    'How does Hot Reload differ from Hot Restart?',
                    'What state management approaches have you used, and why choose Provider/Bloc/Riverpod?',
                    'How do you make a network call and display the result in Flutter?',
                    'What is the purpose of a Key in Flutter widgets?'
                ]
            }
        ]
    }
];
