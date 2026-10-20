// Flutter roadmap, part 1: the roadmap overview and sections 1-4 (fundamentals, Dart, widgets and UI, layout and styling).
// Dart string interpolation "${...}" is written as "\${...}" inside these template literals; "$name" needs no escape.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const fl = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('fl', n, title, priority, topics);

export const flutterRoadmap1: SubTopic[] = [
  {
    id: 'fl-roadmap',
    name: 'Flutter Roadmap (18 Sections, 200 Topics)',
    topics: [
      topic(
        'fl-roadmap-overview',
        'Flutter Important Topics Checklist (200 Topics)',
        [
          blk(`<h3>How the roadmap is organised</h3>
• The 200 important Flutter topics are grouped into <b>18 sections</b>, each a module of this course with worked Dart examples and interview questions. Sections marked <b>Essential</b> (Dart, Widgets and UI, State Management, API and Backend Integration, Advanced Flutter) carry the most weight.<br>
• Code uses <b>modern Flutter</b>: Material 3, null-safe Dart 3 (records, patterns, sealed classes), Riverpod/BLoC, GoRouter, Dio.<br>
<table ${TABLE}>
<tr><th>Section</th><th>Topics</th><th>Items</th><th>Priority</th></tr>
<tr><td>1</td><td>Flutter Fundamentals</td><td>1-10</td><td>Core</td></tr>
<tr><td>2</td><td>Dart Programming</td><td>11-25</td><td>Essential</td></tr>
<tr><td>3</td><td>Widgets and UI Development</td><td>26-40</td><td>Essential</td></tr>
<tr><td>4</td><td>Layout and Styling</td><td>41-50</td><td>Core</td></tr>
<tr><td>5</td><td>State Management</td><td>51-60</td><td>Essential</td></tr>
<tr><td>6</td><td>Navigation and Routing</td><td>61-70</td><td>Core</td></tr>
<tr><td>7</td><td>Forms and Validation</td><td>71-80</td><td>Core</td></tr>
<tr><td>8</td><td>API and Backend Integration</td><td>81-90</td><td>Essential</td></tr>
<tr><td>9</td><td>Asynchronous Programming</td><td>91-100</td><td>Core</td></tr>
<tr><td>10</td><td>Local Storage and Databases</td><td>101-110</td><td>Core</td></tr>
<tr><td>11</td><td>Authentication and Security</td><td>111-120</td><td>Core</td></tr>
<tr><td>12</td><td>Advanced Flutter</td><td>121-135</td><td>Essential</td></tr>
<tr><td>13</td><td>Device Features</td><td>136-150</td><td>Core</td></tr>
<tr><td>14</td><td>Firebase Integration</td><td>151-160</td><td>Core</td></tr>
<tr><td>15</td><td>Testing and Debugging</td><td>161-170</td><td>Production</td></tr>
<tr><td>16</td><td>Performance Optimization</td><td>171-180</td><td>Production</td></tr>
<tr><td>17</td><td>Deployment and DevOps</td><td>181-190</td><td>Production</td></tr>
<tr><td>18</td><td>Important Flutter Projects</td><td>191-200</td><td>Practice</td></tr>
</table>`),
        ],
        [
          blk(`<h3>Most important topics for a JavaSchoolLab mobile app</h3>
1. Dart fundamentals<br>
2. Widgets and layouts<br>
3. StatelessWidget vs StatefulWidget<br>
4. State management<br>
5. Navigation and routing<br>
6. Forms and validation<br>
7. REST API integration<br>
8. JSON serialization<br>
9. Spring Boot integration<br>
10. Authentication and secure storage<br>
11. Local database and offline support<br>
12. Push notifications<br>
13. Testing and performance<br>
14. Android deployment<br>
<br>
<b>Recommended technology stack</b>
<table ${TABLE}>
<tr><th>Layer</th><th>Technology</th></tr>
<tr><td>Mobile application</td><td>Flutter</td></tr>
<tr><td>Programming language</td><td>Dart</td></tr>
<tr><td>State management</td><td>Riverpod or BLoC</td></tr>
<tr><td>Backend</td><td>Java 21 + Spring Boot</td></tr>
<tr><td>API</td><td>REST APIs</td></tr>
<tr><td>Database</td><td>PostgreSQL / MySQL</td></tr>
<tr><td>Authentication</td><td>Spring Security</td></tr>
<tr><td>Local storage</td><td>SQLite or Drift</td></tr>
<tr><td>Notifications</td><td>Firebase Cloud Messaging</td></tr>
<tr><td>Deployment</td><td>Google Play Store</td></tr>
</table>
Official documentation: docs.flutter.dev.`),
        ],
        [
          blk(`<h3>Recommended path and the Java advantage</h3>
• Learn Dart fundamentals first, then Flutter widgets, state management, navigation and REST API integration. <b>Reuse your existing Spring Boot backend</b> instead of building a second one for mobile: the same REST endpoints, DTOs and Spring Security rules serve the web app and the Flutter app.<br>
• Java developers adapt quickly: Dart is class-based, statically typed and null-safe, with generics, interfaces, <code>async/await</code> and a familiar syntax. The new ideas are the <b>widget tree</b> (UI as nested constructor calls), <b>immutability of widgets</b>, and <b>state management</b>.<br>
• Build one real app as you progress: a JavaSchoolLab learner app with login, course list, lesson view, progress sync and push notifications.`),
        ],
        [
          ['What is the best order to learn Flutter for a Spring Boot backend?', 'Dart fundamentals, widgets and layouts, stateless vs stateful widgets, state management (Riverpod or BLoC), navigation, forms, REST and JSON with Dio, authentication with secure storage, local database for offline use, notifications, testing/performance and finally Android deployment.'],
          ['Do you need a separate backend for the Flutter app?', 'No. A Spring Boot REST API with JWT/session authentication can serve the web, Flutter and any other client. Only mobile-specific endpoints (device tokens, push registration) need to be added.'],
        ],
      ),
    ],
  },

  fl(1, 'Flutter Fundamentals', 'Core', [
    topic(
      'fl-intro-architecture',
      'Introduction, Architecture and Comparisons',
      [
        blk(`<h3>What Flutter is</h3>
• <b>Flutter</b> is Google's open-source UI toolkit for building <b>natively compiled</b> apps for mobile (Android, iOS), web, desktop (Windows, macOS, Linux) and embedded devices from <b>one Dart codebase</b>.<br>
• It does not use the platform's native widgets. Flutter <b>draws every pixel itself</b> with its own rendering engine (Impeller, previously Skia), so an app looks and behaves the same on every device and runs at 60/120 fps.<br>
• Apps are built from <b>widgets</b>: small, immutable descriptions of part of the UI, composed into a tree. Dart is compiled <b>AOT</b> (ahead of time) to native ARM code for release builds and <b>JIT</b> for the fast development loop (hot reload).`,
          `import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JavaSchoolLab',
      theme: ThemeData(colorSchemeSeed: Colors.deepOrange, useMaterial3: true),
      home: Scaffold(
        appBar: AppBar(title: const Text('Hello Flutter')),
        body: const Center(child: Text('Welcome to JavaSchoolLab')),
      ),
    );
  }
}`,
        ),
      ],
      [
        blk(`<h3>Flutter architecture: three layers</h3>
<table ${TABLE}>
<tr><th>Layer</th><th>Contents</th><th>Language</th></tr>
<tr><td>Framework</td><td>Widgets, Material/Cupertino, rendering, animation, gestures, foundation</td><td>Dart</td></tr>
<tr><td>Engine</td><td>Impeller/Skia graphics, Dart runtime, text layout, platform channels</td><td>C/C++</td></tr>
<tr><td>Embedder</td><td>Platform-specific host (Android, iOS, Windows...): window, input, event loop</td><td>Java/Kotlin, ObjC/Swift, C++</td></tr>
</table>
• Three trees: the <b>Widget tree</b> (immutable configuration you write), the <b>Element tree</b> (the live instances, managing lifecycle and state) and the <b>RenderObject tree</b> (layout and painting). When state changes, Flutter rebuilds the affected widgets, diffs them against the element tree and updates only what changed.`,
          `// Everything is a widget: a tree of constructor calls
Scaffold(
  appBar: AppBar(title: const Text('Courses')),
  body: Column(
    children: [
      const Text('Welcome'),
      ElevatedButton(onPressed: () {}, child: const Text('Start')),
    ],
  ),
);
// Widget tree  -> describes the UI (cheap, immutable, rebuilt often)
// Element tree -> stays alive, holds State, decides whether to update or replace
// Render tree  -> does the layout (constraints down, sizes up) and paints`,
        ),
      ],
      [
        blk(`<h3>Flutter vs React Native vs native Android</h3>
<table ${TABLE}>
<tr><th>Aspect</th><th>Flutter</th><th>React Native</th><th>Native Android (Kotlin/Java)</th></tr>
<tr><td>Language</td><td>Dart</td><td>JavaScript/TypeScript</td><td>Kotlin / Java</td></tr>
<tr><td>UI approach</td><td>Own engine draws all pixels</td><td>Native widgets via a bridge/JSI</td><td>Native views (Compose/XML)</td></tr>
<tr><td>Consistency across platforms</td><td>Identical</td><td>Platform-native look, may differ</td><td>One platform only</td></tr>
<tr><td>Performance</td><td>Near native (AOT)</td><td>Good; JS runtime</td><td>Best, full platform access</td></tr>
<tr><td>Code sharing</td><td>~95% (mobile, web, desktop)</td><td>~85-90%</td><td>None across platforms</td></tr>
<tr><td>Dev speed</td><td>Hot reload, one codebase</td><td>Fast refresh, web skills reuse</td><td>Slower: two apps for two platforms</td></tr>
<tr><td>New platform API</td><td>Plugin or platform channel</td><td>Native module</td><td>Immediate</td></tr>
<tr><td>Best for</td><td>Branded, custom-UI apps; small teams</td><td>Teams strong in React/JS</td><td>Platform-specific, hardware-heavy apps</td></tr>
</table>
• For a learning platform with one backend and a small team, Flutter gives Android and iOS (and later web) from one codebase.`),
      ],
      [
        ['What is Flutter and how is it different from React Native?', 'Flutter is Google\'s UI toolkit using Dart; it ships its own rendering engine and draws every widget itself, so UI is identical on all platforms. React Native uses JavaScript and renders through native platform widgets.'],
        ['What are the three trees in Flutter?', 'The Widget tree (immutable UI description), the Element tree (live instances that hold state and manage updates) and the RenderObject tree (layout and painting).'],
        ['What is AOT vs JIT compilation in Flutter?', 'During development Dart runs JIT, enabling hot reload; release builds are compiled AOT to native machine code for fast startup and performance.'],
      ],
    ),
    topic(
      'fl-setup-dart-cli',
      'Dart, Flutter SDK Installation, CLI and Project Structure',
      [
        blk(`<h3>Install the Flutter SDK</h3>
• Dart is bundled with Flutter. Requirements: Windows/macOS/Linux, Git, an IDE (<b>Android Studio</b> or <b>VS Code</b> with the Flutter and Dart plugins), the Android SDK (via Android Studio) and, for iOS, a Mac with Xcode.<br>
• Steps: download the SDK from docs.flutter.dev, extract it, add <code>flutter/bin</code> to <code>PATH</code>, run <code>flutter doctor</code> and fix every item it lists (Android licences: <code>flutter doctor --android-licenses</code>).<br>
• Test on an Android emulator (AVD Manager), the Windows/Chrome targets, or a real phone with USB debugging.`,
          `# verify the installation
flutter --version
flutter doctor -v                      # checks SDK, Android toolchain, IDE plugins, connected devices
flutter doctor --android-licenses      # accept SDK licences

# devices
flutter devices
flutter emulators
flutter emulators --launch Pixel_8_API_35

# create and run
flutter create --org com.javaschoollab --platforms=android,ios javaschoollab_app
cd javaschoollab_app
flutter run                            # picks the connected device/emulator
flutter run -d chrome                  # run as a web app`,
        ),
      ],
      [
        blk(`<h3>Flutter CLI essentials</h3>
<table ${TABLE}>
<tr><th>Command</th><th>Purpose</th></tr>
<tr><td><code>flutter create app</code></td><td>New project</td></tr>
<tr><td><code>flutter run</code></td><td>Run on a device (hot reload with <code>r</code>, restart with <code>R</code>, quit with <code>q</code>)</td></tr>
<tr><td><code>flutter pub add package</code></td><td>Add a dependency to pubspec.yaml</td></tr>
<tr><td><code>flutter pub get</code> / <code>upgrade</code> / <code>outdated</code></td><td>Resolve, upgrade, inspect dependencies</td></tr>
<tr><td><code>flutter analyze</code></td><td>Static analysis (lints)</td></tr>
<tr><td><code>dart format .</code></td><td>Format code</td></tr>
<tr><td><code>flutter test</code></td><td>Run tests</td></tr>
<tr><td><code>flutter build apk|appbundle|ios|web</code></td><td>Release builds</td></tr>
<tr><td><code>flutter clean</code></td><td>Delete build artefacts (fixes odd build problems)</td></tr>
<tr><td><code>flutter upgrade</code> / <code>flutter channel</code></td><td>Update the SDK / switch channels (stable, beta)</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Project structure and pubspec.yaml</h3>
• <code>lib/main.dart</code> is the entry point (<code>main()</code> calls <code>runApp</code>). <code>pubspec.yaml</code> declares the app metadata, dependencies, assets and fonts. <code>android/</code>, <code>ios/</code>, <code>web/</code> hold platform hosts; <code>test/</code> unit and widget tests; <code>integration_test/</code> device tests; <code>analysis_options.yaml</code> lint rules.<br>
• Organise <code>lib/</code> by <b>feature</b>, not by type: each feature has its own data, domain and presentation folders.`,
          `javaschoollab_app/
├─ pubspec.yaml
├─ analysis_options.yaml
├─ lib/
│  ├─ main.dart                       # runApp(...)
│  ├─ app.dart                        # MaterialApp.router, theme
│  ├─ core/                           # theme, router, http client, constants, utils
│  └─ features/
│     ├─ auth/        {data, domain, presentation}
│     ├─ courses/     {data, domain, presentation}
│     └─ profile/
├─ test/                              # unit and widget tests
├─ integration_test/
├─ assets/ images/ fonts/
├─ android/  ios/  web/

# pubspec.yaml
name: javaschoollab_app
description: JavaSchoolLab learner app
version: 1.0.0+1                      # name 1.0.0, build number 1
environment:
  sdk: ^3.5.0
dependencies:
  flutter: { sdk: flutter }
  dio: ^5.7.0
  flutter_riverpod: ^2.5.1
  go_router: ^14.2.0
dev_dependencies:
  flutter_test: { sdk: flutter }
  flutter_lints: ^4.0.0
flutter:
  uses-material-design: true
  assets: [assets/images/]`,
        ),
      ],
      [
        ['What does flutter doctor do?', 'It checks your installation: Flutter SDK, Android toolchain and licences, Xcode, IDE plugins and connected devices, and reports what needs fixing.'],
        ['What is pubspec.yaml?', 'The project manifest: name, version, SDK constraints, dependencies, dev dependencies, assets and fonts. flutter pub get resolves it into pubspec.lock.'],
        ['Why organise code by feature?', 'Keeping each feature\'s data, domain and UI together makes the app easier to navigate, test and scale than grouping all screens, models and services by type.'],
      ],
    ),
    topic(
      'fl-widgets-hotreload',
      'Widgets, the Widget Tree and Hot Reload vs Hot Restart',
      [
        blk(`<h3>Everything is a widget</h3>
• A <b>widget</b> is an immutable description of part of the UI: structure (<code>Row</code>, <code>Column</code>), visuals (<code>Text</code>, <code>Image</code>), layout helpers (<code>Padding</code>, <code>Center</code>), interaction (<code>GestureDetector</code>, <code>ElevatedButton</code>) and even app-wide data (<code>Theme</code>, <code>MediaQuery</code>).<br>
• You compose UI by <b>nesting</b> widgets. A widget with one child uses <code>child:</code>; one with several uses <code>children: [...]</code>.<br>
• Two kinds: <b>StatelessWidget</b> (depends only on its constructor arguments) and <b>StatefulWidget</b> (owns mutable <code>State</code>).`,
          `class WelcomeCard extends StatelessWidget {
  const WelcomeCard({super.key, required this.name});
  final String name;                         // widget fields are final: widgets are immutable

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Welcome, $name!', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            const Text('Pick up where you left off.'),
          ],
        ),
      ),
    );
  }
}`,
        ),
      ],
      [
        blk(`<h3>Hot reload vs hot restart vs full restart</h3>
<table ${TABLE}>
<tr><th></th><th>Hot reload</th><th>Hot restart</th><th>Full restart (stop/run)</th></tr>
<tr><td>Speed</td><td>Sub-second</td><td>Seconds</td><td>Slowest</td></tr>
<tr><td>App state</td><td><b>Kept</b></td><td><b>Lost</b> (back to initial)</td><td>Lost</td></tr>
<tr><td>What it does</td><td>Injects changed code into the running VM and rebuilds the widget tree</td><td>Reloads all code and re-runs <code>main()</code></td><td>Rebuilds and reinstalls the app</td></tr>
<tr><td>Shortcut (terminal)</td><td><code>r</code></td><td><code>R</code></td><td>quit and <code>flutter run</code></td></tr>
<tr><td>Use for</td><td>UI tweaks, build() changes</td><td>Changes to <code>main()</code>, global variables, <code>initState</code>, enums, static fields</td><td>Native code, new plugins, pubspec assets/permissions</td></tr>
</table>
• Hot reload does not re-run <code>initState</code> or global initialisers, so a change to them needs a hot restart. Adding a package or editing <code>AndroidManifest.xml</code>/<code>Info.plist</code> needs a full restart.`),
      ],
      [
        blk(`<h3>Reading the widget tree and DevTools</h3>
• <code>BuildContext</code> is a handle to a widget's position in the tree. <code>Theme.of(context)</code>, <code>Navigator.of(context)</code> and <code>MediaQuery.of(context)</code> look <b>up</b> the tree from that position.<br>
• The <b>Flutter Inspector</b> in DevTools shows the widget tree, lets you select widgets on the device and shows layout constraints and sizes; <code>debugPaintSizeEnabled</code> draws layout bounds.<br>
• Use <code>const</code> widgets wherever possible: Flutter reuses them and skips rebuilding.`,
          `import 'package:flutter/rendering.dart';

void main() {
  debugPaintSizeEnabled = false;   // true draws every widget's bounds while debugging layout
  runApp(const MyApp());
}

// const means: created once at compile time, never rebuilt
const SizedBox(height: 16);
const Text('Static text');
const Icon(Icons.school, size: 32);

// BuildContext: looks up the tree for the nearest ancestor of a type
final primary = Theme.of(context).colorScheme.primary;
final width = MediaQuery.sizeOf(context).width;
Navigator.of(context).pop();`,
        ),
      ],
      [
        ['What is a widget?', 'An immutable description of part of the user interface. Widgets are composed into a tree; Flutter turns them into elements and render objects to lay out and paint the screen.'],
        ['Hot reload vs hot restart?', 'Hot reload injects changed code and rebuilds widgets while keeping app state; hot restart reloads all code and re-runs main(), losing state. Use restart for changes to main, initState or global/static initialisers.'],
        ['What is BuildContext?', 'A reference to a widget\'s location in the widget tree, used to look up inherited data (Theme, MediaQuery, Navigator, providers) from ancestors.'],
      ],
    ),
  ]),

  fl(2, 'Dart Programming', 'Essential', [
    topic(
      'dart-basics',
      'Dart Basics: Variables, final vs const, Operators, Control Flow and Functions',
      [
        blk(`<h3>Variables and types</h3>
• Dart is <b>statically typed, null-safe</b> and class-based. Core types: <code>int</code>, <code>double</code>, <code>num</code>, <code>String</code>, <code>bool</code>, <code>List</code>, <code>Set</code>, <code>Map</code>, <code>Runes</code>, <code>Symbol</code>, <code>Object</code>, <code>dynamic</code> (avoid), and records <code>(int, String)</code>. <code>Null</code> is its own type.<br>
• <code>var</code> infers the type; <code>String name = 'Asha'</code> declares it explicitly; <code>late</code> delays initialisation; <b>everything is an object</b>, even numbers and functions.<br>
• Strings use single or double quotes; <b>interpolation</b> <code>'$name'</code> or <code>'\${a + b}'</code>; multi-line with triple quotes; raw strings <code>r'\\n'</code>.`,
          `void main() {
  var city = 'Pune';                 // inferred String
  String title = "Flutter";
  int students = 120;
  double price = 1999.5;
  bool published = true;
  num anything = 5;                  // int or double
  late String token;                 // assigned later, before first use

  print('$title costs \${price.toStringAsFixed(0)} for $students students in $city');

  (int, String) pair = (1, 'one');   // record (Dart 3)
  var (id, label) = pair;            // destructuring
  print('$id $label');

  var text = '''
  multi-line
  string''';
  print(text.length);
}`,
        ),
      ],
      [
        blk(`<h3>final vs const</h3>
• <b><code>final</code></b>: assigned <b>once at runtime</b>; the value may be computed when the program runs (<code>final now = DateTime.now();</code>). The variable cannot be reassigned, but a <code>final</code> list's contents can still change.<br>
• <b><code>const</code></b>: a <b>compile-time constant</b>; the value must be known at compile time. <code>const</code> objects are <b>canonicalised</b> (one shared instance) and deeply immutable: <code>const [1, 2]</code> cannot be modified.<br>
• In Flutter use <code>const</code> constructors for widgets: they are created once and never rebuilt, a key performance tool.<br>
• <code>static const</code> for class constants; <code>late final</code> for lazily initialised values.`,
          `final now = DateTime.now();            // OK: computed at runtime
// const now2 = DateTime.now();        // ERROR: not a compile-time constant
const pi = 3.14159;                    // compile-time constant
const names = ['Asha', 'Ravi'];        // deeply immutable
// names.add('Sita');                  // runtime error: Cannot add to an unmodifiable list

final items = <String>[];
items.add('ok');                       // allowed: the variable is final, the list is not frozen
// items = [];                         // ERROR: a final variable can be assigned only once

class Config {
  static const apiVersion = 'v1';
  final String baseUrl;
  const Config(this.baseUrl);          // const constructor
}
const prod = Config('https://api.javaschoollab.com');
const same = Config('https://api.javaschoollab.com');
print(identical(prod, same));          // true: canonicalised`,
        ),
      ],
      [
        blk(`<h3>Operators, control statements and functions</h3>
• Operators: arithmetic (<code>+ - * / ~/ %</code>; <code>/</code> always gives a <code>double</code>, <code>~/</code> integer division), comparison, logical, bitwise, cascade <code>..</code>, null-aware <code>?? ??= ?.</code>, spread <code>...</code>, type tests <code>is</code>, <code>is!</code>, <code>as</code>.<br>
• Control: <code>if/else</code>, ternary, <code>for</code>, <code>for-in</code>, <code>while</code>, <code>do-while</code>, <code>break/continue</code>, <code>switch</code> (Dart 3 <b>switch expressions and patterns</b>), collection <code>if</code>/<code>for</code> inside list literals.<br>
• Functions are objects: <b>named parameters</b> <code>{required String x, int y = 1}</code>, <b>positional optional</b> <code>[int z = 0]</code>, <b>arrow</b> <code>=&gt;</code> for one expression, closures, higher-order functions, <code>typedef</code>.`,
          `int add(int a, int b) => a + b;                              // arrow function
String greet({required String name, String greeting = 'Hello'}) => '$greeting, $name!';
int sum(int a, [int b = 0, int c = 0]) => a + b + c;           // optional positional

void main() {
  print(greet(name: 'Asha'));                                 // Hello, Asha!
  print(7 ~/ 2);                                              // 3
  var maybe = null as String?;
  print(maybe ?? 'default');                                  // default
  maybe ??= 'set once';
  print(maybe?.length);                                       // 8

  final sb = StringBuffer()..write('a')..write('b')..writeln('c');   // cascade
  print(sb);

  final level = 3;
  final label = switch (level) {                              // switch expression
    1 => 'Beginner',
    2 || 3 => 'Intermediate',
    _ => 'Advanced',
  };
  final menu = ['Home', if (level > 2) 'Admin', for (var i = 1; i <= 2; i++) 'Tab $i'];   // collection if/for
  print('$label $menu');

  final doubler = (int x) => x * 2;                           // closure
  print([1, 2, 3].map(doubler).toList());
}`,
        ),
      ],
      [
        ['final vs const in Dart?', 'final is assigned once at runtime; const is a compile-time constant that is deeply immutable and canonicalised. Use const for known values and const widget constructors; final for values computed at runtime.'],
        ['What are named parameters?', 'Parameters declared in braces that callers pass by name, optionally marked required, with defaults. They make calls readable: greet(name: "Asha", greeting: "Hi").'],
        ['What is the cascade operator?', '.. calls several methods or sets fields on the same object and returns that object, e.g. StringBuffer()..write("a")..write("b").'],
      ],
    ),
    topic(
      'dart-collections-null-safety',
      'Lists, Sets, Maps and Null Safety',
      [
        blk(`<h3>Collections</h3>
• <b>List</b> (ordered, indexed, duplicates allowed): <code>[1, 2, 3]</code>; <b>Set</b> (unique, unordered): <code>{1, 2}</code>; <b>Map</b> (key to value): <code>{'a': 1}</code>. Give element types: <code>&lt;String&gt;[]</code>, <code>&lt;int, String&gt;{}</code>.<br>
• Functional methods: <code>map</code>, <code>where</code> (filter), <code>reduce</code>, <code>fold</code>, <code>any</code>, <code>every</code>, <code>firstWhere</code>, <code>expand</code>, <code>take/skip</code>, <code>sort</code>, <code>toList()</code>. <code>map</code>/<code>where</code> are <b>lazy</b> iterables: call <code>toList()</code>.<br>
• Spread <code>...</code> and <code>...?</code>, collection <code>if</code>/<code>for</code>, and immutable <code>List.unmodifiable</code>/<code>const</code>.`,
          `void main() {
  final names = <String>['Asha', 'Ravi', 'Sita'];
  names.add('Om');
  final upper = names.map((n) => n.toUpperCase()).toList();
  final long = names.where((n) => n.length > 3).toList();
  print(names.first + ' ' + names.last + ' ' + upper.toString() + ' ' + long.toString());

  final unique = {1, 2, 2, 3};                       // Set: {1, 2, 3}
  print(unique.contains(2));
  print({1, 2}.union({2, 3}));                        // {1, 2, 3}

  final scores = <String, int>{'Asha': 90, 'Ravi': 72};
  scores['Sita'] = 85;
  scores.update('Ravi', (v) => v + 10);
  for (final e in scores.entries) {
    print(e.key + ': ' + e.value.toString());
  }
  final total = scores.values.reduce((a, b) => a + b);
  final best = scores.entries.reduce((a, b) => a.value >= b.value ? a : b).key;
  print('$total $best');

  final sorted = [...names]..sort((a, b) => a.length.compareTo(b.length));   // copy, then sort
  print(sorted);
}`,
        ),
      ],
      [
        blk(`<h3>Null safety</h3>
• Since Dart 2.12 types are <b>non-nullable by default</b>: <code>String name</code> can never be <code>null</code>; <code>String? name</code> can. The compiler proves that nullable values are checked before use, eliminating most null-pointer errors.<br>
• Tools: <b><code>?.</code></b> (safe call), <b><code>??</code></b> (default), <b><code>??=</code></b> (assign if null), <b><code>!</code></b> (assert non-null: throws if wrong, use sparingly), <b>type promotion</b> after a null check, <code>late</code> (promise to initialise before use), <code>required</code> named parameters.<br>
• For fields, a null check promotes only <b>local variables</b>, not mutable fields: copy to a local first.`,
          `String? nickname;                                   // may be null
String name = 'Asha';                                // can never be null

void main() {
  print(nickname?.length);                           // null (safe call)
  print(nickname ?? 'no nickname');                  // default
  nickname ??= 'Ash';

  if (nickname != null) {
    print(nickname.length);                          // promoted to String inside the check
  }

  String? maybe = DateTime.now().second > 100 ? 'x' : null;
  // print(maybe.length);                            // ERROR: property 'length' can't be accessed on 'String?'
  print(maybe!.length);                              // compiles; throws at runtime if maybe is null

  final list = <int?>[1, null, 3];
  final nonNull = list.whereType<int>().toList();    // [1, 3]
  print(nonNull);
}

class User {
  final String name;
  final String? phone;                               // optional
  User({required this.name, this.phone});
  String get contact => phone ?? 'no phone';
}`,
        ),
      ],
      [
        blk(`<h3>late, patterns and defensive habits</h3>
• <code>late</code> variables are initialised on first access (lazy) or before use; reading an unset <code>late</code> throws <code>LateInitializationError</code>. Use for expensive values (<code>late final x = compute();</code>) and for values set in <code>initState</code>.<br>
• Dart 3 <b>patterns</b> test and destructure in one step: <code>if (value case String s) ...</code>, <code>if (json case {'name': String n})</code>, <code>switch</code> on sealed types.<br>
• Habits: avoid <code>!</code> when you can restructure; model absence in the type (<code>User?</code>) instead of sentinel values; use <code>Optional</code>-like sealed classes for results; validate JSON at the boundary.`,
          `late final String apiKey = _loadKey();                // computed lazily, once
String _loadKey() => 'secret';

Object? parse(dynamic json) {
  if (json case {'name': String name, 'age': int age}) {   // pattern: map with typed fields
    return '$name ($age)';
  }
  return null;
}

sealed class Result<T> {}
class Ok<T> extends Result<T> { final T value; Ok(this.value); }
class Err<T> extends Result<T> { final String message; Err(this.message); }

String describe(Result<int> r) => switch (r) {            // exhaustive: compiler checks every subclass
  Ok(:final value) => 'value $value',
  Err(:final message) => 'error $message',
};`,
        ),
      ],
      [
        ['What is null safety in Dart?', 'Types are non-nullable by default (String) and become nullable only with ? (String?). The compiler enforces null checks, so most null-reference errors are caught at compile time.'],
        ['What does the ! operator do?', 'The null assertion operator tells the compiler a nullable expression is not null; at runtime it throws if the value actually is null, so it should be used sparingly.'],
        ['What is late used for?', 'Declaring a non-nullable variable that is initialised after its declaration, or lazily on first access; reading it before it is set throws LateInitializationError.'],
      ],
    ),
    topic(
      'dart-oop',
      'Classes, Inheritance, Abstract Classes, Interfaces, Mixins, Extensions and Generics',
      [
        blk(`<h3>Classes and objects</h3>
• Dart classes have fields, constructors, methods, getters/setters, <code>static</code> members. <b>Constructor shorthand</b>: <code>Point(this.x, this.y)</code>. Variants: <b>named</b> constructors (<code>Point.origin()</code>), <b>factory</b> constructors (may return cached/subclass instances, e.g. <code>fromJson</code>), <b>const</b> constructors, <b>redirecting</b> constructors and initialiser lists.<br>
• Privacy is per <b>library</b> (file), not per class: a name starting with <code>_</code> is private to its file.<br>
• Override <code>toString</code>, <code>==</code> and <code>hashCode</code> together; or use records / the <code>equatable</code> package.`,
          `class Course {
  final int id;
  final String title;
  final double _price;                           // private to this file

  const Course(this.id, this.title, this._price);                  // const constructor
  Course.free(int id, String title) : this(id, title, 0);          // named + redirecting
  factory Course.fromJson(Map<String, dynamic> json) =>
      Course(json['id'] as int, json['title'] as String, (json['price'] as num).toDouble());

  double get price => _price;
  bool get isFree => _price == 0;
  Course copyWith({String? title}) => Course(id, title ?? this.title, _price);

  @override
  bool operator ==(Object other) => other is Course && other.id == id;
  @override
  int get hashCode => id.hashCode;
  @override
  String toString() => 'Course($id, $title)';
}

void main() {
  final c = Course.fromJson({'id': 1, 'title': 'Flutter', 'price': 1999});
  print(c.copyWith(title: 'Flutter Pro'));
  print(Course.free(2, 'Intro').isFree);
}`,
        ),
      ],
      [
        blk(`<h3>Inheritance, abstract classes and interfaces</h3>
• <code>extends</code> inherits from one class; <code>super</code> calls the parent; <code>@override</code> redefines members; <b>polymorphism</b>: a parent-typed variable calls the subclass method.<br>
• <b>Abstract class</b>: cannot be instantiated; may declare abstract methods and share concrete code.<br>
• <b>Every class defines an implicit interface</b>: <code>implements</code> a class (or abstract class) to promise all its members, with no inherited code; a class can implement many interfaces. Dart 3 adds class modifiers: <code>sealed</code> (exhaustive switch), <code>final</code>, <code>base</code>, <code>interface</code>, <code>mixin class</code>.`,
          `abstract class Notifier {
  void send(String message);                    // abstract
  void describe() => print('A notifier');       // shared code
}
class EmailNotifier extends Notifier {
  @override void send(String message) => print('EMAIL: $message');
}
class SmsNotifier extends Notifier {
  @override void send(String message) => print('SMS: $message');
  @override void describe() { super.describe(); print('...via SMS'); }
}

abstract interface class Repository<T> {        // Dart 3: a pure interface
  Future<List<T>> findAll();
  Future<void> save(T item);
}
class InMemoryRepo implements Repository<String> {
  final _items = <String>[];
  @override Future<List<String>> findAll() async => List.unmodifiable(_items);
  @override Future<void> save(String item) async => _items.add(item);
}

sealed class Shape {}
class Circle extends Shape { final double r; Circle(this.r); }
class Rect extends Shape { final double w, h; Rect(this.w, this.h); }
double area(Shape s) => switch (s) {            // compile error if a subtype is missing
  Circle(:final r) => 3.14159 * r * r,
  Rect(:final w, :final h) => w * h,
};

void main() {
  for (final n in <Notifier>[EmailNotifier(), SmsNotifier()]) n.send('Course starts today');   // polymorphism
}`,
        ),
      ],
      [
        blk(`<h3>Mixins, extensions and generics</h3>
• A <b>mixin</b> adds reusable behaviour to a class without inheritance: <code>mixin Logger { void log(String m) =&gt; print(m); }</code> and <code>class Service with Logger</code>; restrict with <code>on</code>. Flutter uses mixins heavily (<code>SingleTickerProviderStateMixin</code>, <code>AutomaticKeepAliveClientMixin</code>).<br>
• <b>Extension methods</b> add methods to existing types without modifying them: <code>extension on String { ... }</code>.<br>
• <b>Generics</b> make code reusable and type-safe: <code>List&lt;T&gt;</code>, <code>Future&lt;T&gt;</code>, <code>class Box&lt;T extends num&gt;</code>, generic functions <code>T first&lt;T&gt;(List&lt;T&gt; xs)</code>. Dart generics are <b>reified</b> (kept at runtime), unlike Java's erasure.`,
          `mixin Logger {
  void log(String message) => print('[\${runtimeType}] $message');
}
mixin Timestamped {
  final DateTime createdAt = DateTime.now();
}
class OrderService with Logger, Timestamped {
  void place() => log('order placed at $createdAt');
}

extension StringX on String {
  String get initials => split(' ').where((p) => p.isNotEmpty).map((p) => p[0].toUpperCase()).join();
  bool get isEmail => RegExp(r'^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$').hasMatch(this);
}
extension DurationX on int {
  Duration get seconds => Duration(seconds: this);
}

class Box<T extends Comparable<T>> {
  final List<T> items;
  Box(this.items);
  T max() => items.reduce((a, b) => a.compareTo(b) >= 0 ? a : b);
}
T? firstOrNull<T>(List<T> xs) => xs.isEmpty ? null : xs.first;

void main() {
  print('Asha Kumar'.initials);                        // AK
  print('a@b.com'.isEmail);                            // true
  print(5.seconds);                                     // 0:00:05.000000
  print(Box<int>([3, 9, 4]).max());                     // 9
  print(firstOrNull<String>([]));                       // null
  print(<int>[] is List<int>);                          // true: generics exist at runtime
}`,
        ),
      ],
      [
        ['abstract class vs interface in Dart?', 'An abstract class cannot be instantiated and can mix abstract members with shared code; classes extend it. Every class also defines an implicit interface that other classes implement, providing only the contract. A class can extend one class and implement many.'],
        ['What is a mixin?', 'A reusable block of members that a class adds with the with keyword, enabling code reuse without single-inheritance limits. Flutter uses them for tickers, keep-alive and more.'],
        ['How do Dart generics differ from Java generics?', 'Dart generics are reified: type arguments exist at runtime (List<int> is distinguishable from List<String>), whereas Java erases them.'],
      ],
    ),
    topic(
      'dart-async',
      'Exceptions, Futures, async/await, Streams and Isolates',
      [
        blk(`<h3>Exception handling</h3>
• Dart has <code>Exception</code> (recoverable, application-level) and <code>Error</code> (programming bugs: <code>StateError</code>, <code>RangeError</code>, <code>TypeError</code>; do not catch). You can throw <b>any object</b>, but throw <code>Exception</code> subclasses.<br>
• <code>try / on Type catch (e, stackTrace) / finally</code>; <code>rethrow</code> keeps the stack trace; <code>on</code> filters by type. There are <b>no checked exceptions</b>.<br>
• Define custom exceptions and prefer returning typed results (sealed <code>Result</code>) for expected failures.`,
          `class ApiException implements Exception {
  final int? statusCode;
  final String message;
  ApiException(this.message, {this.statusCode});
  @override String toString() => 'ApiException($statusCode): $message';
}

int parseAge(String input) {
  try {
    final age = int.parse(input);
    if (age < 0) throw ArgumentError.value(age, 'age', 'must be positive');
    return age;
  } on FormatException {
    throw ApiException('Not a number: $input');
  } on ArgumentError catch (e) {
    print('bad argument: \${e.message}');
    rethrow;                                           // keep the original stack trace
  } finally {
    print('parse attempted');
  }
}`,
        ),
      ],
      [
        blk(`<h3>Futures and async/await</h3>
• A <b><code>Future&lt;T&gt;</code></b> represents a value that will be available later (network, file, database, timer). Mark a function <code>async</code> to return a Future and use <code>await</code> to wait without blocking the UI.<br>
• Errors: <code>try/catch</code> around <code>await</code>, or <code>.catchError</code>. Combine futures with <code>Future.wait([...])</code> (parallel, like <code>Promise.all</code>), <code>Future.any</code>, <code>.timeout(Duration)</code>, <code>.then</code>, <code>.whenComplete</code>.<br>
• Dart is <b>single-threaded with an event loop</b>: futures are scheduled on it; they do not create threads. CPU-heavy work needs an <b>isolate</b>.`,
          `Future<String> fetchName() async {
  await Future.delayed(const Duration(seconds: 1));
  return 'Asha';
}

Future<void> main() async {
  print('start');
  final name = await fetchName();                        // does not block the event loop
  print(name);

  final results = await Future.wait([                    // run in parallel
    fetchName(),
    Future.delayed(const Duration(milliseconds: 300), () => 42),
  ]);
  print(results);

  try {
    await fetchName().timeout(const Duration(milliseconds: 100));
  } on TimeoutException {
    print('too slow');
  }
}`,
        ),
      ],
      [
        blk(`<h3>Streams and isolates</h3>
• A <b><code>Stream&lt;T&gt;</code></b> delivers <b>many</b> values over time (user input, WebSocket messages, sensor data, file chunks). Consume with <code>await for</code> or <code>listen</code> (returns a <code>StreamSubscription</code> you must <code>cancel</code>). Producers: <code>async*</code> generators with <code>yield</code>, <code>StreamController</code>, <code>Stream.periodic</code>. <b>Single-subscription</b> streams allow one listener; <b>broadcast</b> streams allow many.<br>
• An <b>isolate</b> is an independent worker with its <b>own memory and event loop</b>; isolates share nothing and communicate by <b>message passing</b>. Use <code>Isolate.run()</code> (or Flutter's <code>compute</code>) for heavy work such as parsing a large JSON, image processing or encryption, so the UI never janks.`,
          `Stream<int> countdown(int from) async* {                // generator
  for (var i = from; i >= 0; i--) {
    await Future.delayed(const Duration(seconds: 1));
    yield i;
  }
}

Future<void> main() async {
  await for (final n in countdown(3)) {
    print(n);
  }

  final controller = StreamController<String>.broadcast();
  final sub = controller.stream.where((m) => m.isNotEmpty).listen((m) => print('got $m'));
  controller.add('hello');
  await sub.cancel();                                      // always cancel
  await controller.close();

  // CPU-heavy work on another isolate
  final primes = await Isolate.run(() {
    var count = 0;
    for (var n = 2; n < 200000; n++) {
      var isPrime = true;
      for (var d = 2; d * d <= n; d++) { if (n % d == 0) { isPrime = false; break; } }
      if (isPrime) count++;
    }
    return count;
  });
  print('primes: $primes');
}`,
        ),
      ],
      [
        ['Future vs Stream?', 'A Future completes once with a single value (or error). A Stream emits zero or more values over time and can be listened to, transformed and cancelled.'],
        ['Does async/await create threads in Dart?', 'No. Dart runs on a single-threaded event loop; async functions are scheduled on it. True parallelism requires isolates, which have separate memory and communicate via messages.'],
        ['When should you use an isolate?', 'For CPU-heavy work (parsing big JSON, image/crypto processing, complex calculations) that would otherwise block the UI thread; use Isolate.run or compute.'],
      ],
    ),
  ]),

  fl(3, 'Widgets and UI Development', 'Essential', [
    topic(
      'fl-stateless-stateful-lifecycle',
      'StatelessWidget, StatefulWidget and the Widget Lifecycle',
      [
        blk(`<h3>StatelessWidget</h3>
• A <b>StatelessWidget</b> has no mutable state: its output depends only on constructor arguments and inherited data. Override <code>build(BuildContext)</code> to return the UI. Fields are <code>final</code>; use a <code>const</code> constructor.<br>
• Use it for static/derived UI: labels, cards, list items, screens that only display data supplied by a state manager.`,
          `class CourseTile extends StatelessWidget {
  const CourseTile({super.key, required this.title, required this.lessons, this.onTap});
  final String title;
  final int lessons;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: const CircleAvatar(child: Icon(Icons.school)),
      title: Text(title),
      subtitle: Text('$lessons lessons'),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}`,
        ),
      ],
      [
        blk(`<h3>StatefulWidget and State</h3>
• A <b>StatefulWidget</b> is an immutable widget plus a separate, long-lived <b><code>State</code></b> object that holds mutable data. Change state inside <b><code>setState(() { ... })</code></b>, which marks the widget dirty and schedules a rebuild.<br>
• Two classes: <code>class Counter extends StatefulWidget</code> with <code>createState()</code>, and <code>class _CounterState extends State&lt;Counter&gt;</code>. The widget's fields are reachable as <code>widget.field</code>.<br>
• Local UI state (a toggle, current tab, text field focus, animation) belongs in a StatefulWidget; shared app state belongs in a state-management solution.`,
          `class LikeButton extends StatefulWidget {
  const LikeButton({super.key, this.initialLikes = 0});
  final int initialLikes;
  @override
  State<LikeButton> createState() => _LikeButtonState();
}

class _LikeButtonState extends State<LikeButton> {
  late int _likes = widget.initialLikes;
  bool _liked = false;

  void _toggle() {
    setState(() {                       // mutate inside setState so Flutter rebuilds
      _liked = !_liked;
      _likes += _liked ? 1 : -1;
    });
  }

  @override
  Widget build(BuildContext context) {
    return TextButton.icon(
      onPressed: _toggle,
      icon: Icon(_liked ? Icons.favorite : Icons.favorite_border, color: _liked ? Colors.red : null),
      label: Text('$_likes'),
    );
  }
}`,
        ),
      ],
      [
        blk(`<h3>The State lifecycle</h3>
<table ${TABLE}>
<tr><th>Method</th><th>When</th><th>Typical use</th></tr>
<tr><td><code>createState</code></td><td>Widget inserted into the tree</td><td>Create the State object</td></tr>
<tr><td><code>initState</code></td><td>Once, before the first build</td><td>Create controllers, subscribe to streams, start requests (call <code>super.initState()</code> first)</td></tr>
<tr><td><code>didChangeDependencies</code></td><td>After initState and when an inherited widget it depends on changes</td><td>Read <code>Theme.of</code>, <code>MediaQuery</code>, providers</td></tr>
<tr><td><code>build</code></td><td>Every rebuild</td><td>Return the UI (keep it pure and fast)</td></tr>
<tr><td><code>didUpdateWidget</code></td><td>Parent rebuilt with new configuration</td><td>Compare old and new widget, update controllers</td></tr>
<tr><td><code>deactivate</code></td><td>Removed from the tree (maybe temporarily)</td><td>Rarely used</td></tr>
<tr><td><code>dispose</code></td><td>Permanently removed</td><td><b>Dispose controllers, cancel subscriptions and timers</b></td></tr>
</table>
• Use <code>mounted</code> before calling <code>setState</code> after an <code>await</code>.`,
          `class _TimerState extends State<TimerPage> with SingleTickerProviderStateMixin {
  late final TextEditingController _name;
  late final AnimationController _anim;
  StreamSubscription<int>? _sub;
  Timer? _timer;
  int _seconds = 0;

  @override
  void initState() {
    super.initState();                                   // first
    _name = TextEditingController();
    _anim = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => setState(() => _seconds++));
  }

  @override
  void didUpdateWidget(covariant TimerPage old) {
    super.didUpdateWidget(old);
    if (old.title != widget.title) { /* react to the new configuration */ }
  }

  Future<void> _load() async {
    final data = await api.fetch();
    if (!mounted) return;                                // the page may be gone after the await
    setState(() => _data = data);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _sub?.cancel();
    _name.dispose();
    _anim.dispose();
    super.dispose();                                      // last
  }
}`,
        ),
      ],
      [
        ['StatelessWidget vs StatefulWidget?', 'A StatelessWidget has no mutable state and rebuilds only when its parent gives it new data. A StatefulWidget pairs an immutable widget with a State object that holds mutable data and rebuilds via setState.'],
        ['Why must you call dispose()?', 'To release controllers, animation tickers, timers and stream subscriptions owned by the State; otherwise they leak and may call setState on a destroyed widget.'],
        ['What is the mounted property for?', 'It tells whether the State is still in the tree. After an await the widget may have been removed, so check mounted before calling setState or using context.'],
      ],
    ),
    topic(
      'fl-material-layout-widgets',
      'MaterialApp, Scaffold, Container, SizedBox, Row, Column, Stack and Expanded',
      [
        blk(`<h3>MaterialApp and Scaffold</h3>
• <b>MaterialApp</b> is the root of a Material Design app: it provides theme, routing (<code>home</code>, <code>routes</code>, or <code>MaterialApp.router</code>), localisation and the Navigator. <b>CupertinoApp</b> is the iOS-style equivalent.<br>
• <b>Scaffold</b> is the basic screen layout: <code>appBar</code>, <code>body</code>, <code>floatingActionButton</code>, <code>drawer</code>, <code>bottomNavigationBar</code>, <code>snackBar</code> (via <code>ScaffoldMessenger</code>). Almost every screen is a Scaffold.`,
          `class App extends StatelessWidget {
  const App({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'JavaSchoolLab',
        theme: ThemeData(colorSchemeSeed: Colors.deepOrange, useMaterial3: true),
        darkTheme: ThemeData(colorSchemeSeed: Colors.deepOrange, brightness: Brightness.dark, useMaterial3: true),
        themeMode: ThemeMode.system,
        home: const HomeScreen(),
      );
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Courses'), actions: [IconButton(icon: const Icon(Icons.search), onPressed: () {})]),
        drawer: const Drawer(child: Center(child: Text('Menu'))),
        body: const Center(child: Text('Home')),
        floatingActionButton: FloatingActionButton(
          onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Added'))),
          child: const Icon(Icons.add),
        ),
      );
}`,
        ),
      ],
      [
        blk(`<h3>Container, SizedBox, Row and Column</h3>
• <b>Container</b> combines padding, margin, decoration, size, alignment and transform in one widget; prefer the specific widget (<code>Padding</code>, <code>SizedBox</code>, <code>DecoratedBox</code>, <code>ColoredBox</code>, <code>Align</code>) when you need only one thing (cheaper, clearer).<br>
• <b>SizedBox</b>: fixed width/height or a spacer (<code>SizedBox(height: 16)</code>); <code>SizedBox.expand()</code>, <code>SizedBox.shrink()</code>.<br>
• <b>Row</b> (horizontal) and <b>Column</b> (vertical) lay out <code>children</code> along the <b>main axis</b> (<code>mainAxisAlignment</code>, <code>mainAxisSize</code>) and the <b>cross axis</b> (<code>crossAxisAlignment</code>). The <b>RenderFlex overflowed</b> error means children exceed the available space: fix with <code>Expanded</code>/<code>Flexible</code>, scrolling, or <code>Wrap</code>.`,
          `Widget header() => Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(12)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const CircleAvatar(radius: 24, child: Icon(Icons.person)),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: const [
              Text('Asha Kumar', style: TextStyle(fontWeight: FontWeight.bold)),
              Text('Level 3 learner'),
            ],
          ),
        ],
      ),
    );`,
        ),
      ],
      [
        blk(`<h3>Stack, Positioned, Expanded and Flexible</h3>
• <b>Stack</b> layers children on top of each other; <b>Positioned</b> places a child by <code>top/left/right/bottom</code> relative to the Stack (non-positioned children align by <code>alignment</code>). Use for badges, overlays, image captions, floating buttons.<br>
• <b>Expanded</b> makes a child of a Row/Column/Flex <b>fill the remaining main-axis space</b>; several Expanded children share it by <code>flex</code> ratio. <b>Flexible</b> lets a child be <i>up to</i> the available space (<code>fit: FlexFit.loose</code>) without forcing it to fill. <code>Spacer()</code> is an empty Expanded.<br>
• Never put an unbounded child (a <code>ListView</code>, another <code>Column</code> with <code>Expanded</code>) directly inside a Column without bounding its height: wrap in <code>Expanded</code> or give it a size.`,
          `Widget courseBanner() => Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.asset('assets/images/flutter.png', height: 180, width: double.infinity, fit: BoxFit.cover),
        ),
        Positioned(
          top: 8, right: 8,
          child: Chip(label: const Text('NEW'), backgroundColor: Colors.red.shade400),
        ),
        const Positioned(
          left: 12, right: 12, bottom: 12,
          child: Text('Flutter for Java Developers', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
        ),
      ],
    );

Widget toolbar() => Row(
      children: [
        const Icon(Icons.search),
        const SizedBox(width: 8),
        Expanded(child: TextField(decoration: const InputDecoration(hintText: 'Search courses'))),   // takes the remaining width
        const SizedBox(width: 8),
        const Flexible(child: Text('A long label that may shrink instead of overflowing', overflow: TextOverflow.ellipsis)),
      ],
    );

Widget scrollingScreen() => Column(
      children: [
        const Text('Header'),
        Expanded(child: ListView.builder(itemCount: 50, itemBuilder: (_, i) => ListTile(title: Text('Item $i')))),   // bounded by Expanded
      ],
    );`,
        ),
      ],
      [
        ['Row vs Column and the two axes?', 'Row lays children horizontally and Column vertically. The main axis is the direction of layout (mainAxisAlignment); the cross axis is perpendicular (crossAxisAlignment).'],
        ['Expanded vs Flexible?', 'Expanded forces a child to fill the remaining main-axis space (shared by flex ratio). Flexible lets the child be at most that big and by default does not force it to fill.'],
        ['What causes "RenderFlex overflowed by N pixels"?', 'Children of a Row/Column need more space than available. Fix with Expanded/Flexible, a scrollable parent (ListView, SingleChildScrollView), Wrap, or smaller content.'],
      ],
    ),
    topic(
      'fl-lists-text-buttons',
      'ListView, GridView, Text, Image, Buttons, Cards, Dialogs, AppBar and NavigationBar',
      [
        blk(`<h3>ListView and GridView</h3>
• <b>ListView</b> is a scrollable list. <code>ListView(children: [...])</code> builds everything at once (small lists); <b><code>ListView.builder</code></b> builds items <b>lazily</b> as they scroll into view (long or infinite lists); <code>ListView.separated</code> adds dividers.<br>
• <b>GridView</b>: <code>GridView.count(crossAxisCount: 2)</code> and <code>GridView.builder</code> with a <code>gridDelegate</code> (<code>SliverGridDelegateWithFixedCrossAxisCount</code> / <code>...MaxCrossAxisExtent</code>).<br>
• Use stable <code>key</code>s for items that reorder/delete. Nest a list inside a <code>Column</code> only with <code>Expanded</code> or <code>shrinkWrap: true</code> (slow for long lists).`,
          `class CourseList extends StatelessWidget {
  const CourseList({super.key, required this.courses});
  final List<Course> courses;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: courses.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final c = courses[index];
        return ListTile(
          key: ValueKey(c.id),
          title: Text(c.title),
          subtitle: Text('₹\${c.price}'),
          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => CourseDetail(course: c))),
        );
      },
    );
  }
}

Widget catalogue(List<Course> courses) => GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(maxCrossAxisExtent: 200, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.8),
      itemCount: courses.length,
      itemBuilder: (_, i) => Card(clipBehavior: Clip.antiAlias, child: Center(child: Text(courses[i].title))),
    );`,
        ),
      ],
      [
        blk(`<h3>Text, images, buttons and icons</h3>
• <b>Text</b>: <code>style: TextStyle(...)</code> or <code>Theme.of(context).textTheme.headlineSmall</code>, <code>maxLines</code>, <code>overflow: TextOverflow.ellipsis</code>, <code>Text.rich(TextSpan(...))</code> for mixed styles.<br>
• <b>Image</b>: <code>Image.asset</code> (declare in <code>pubspec.yaml</code>), <code>Image.network</code> (use <code>cached_network_image</code> in real apps; set <code>loadingBuilder</code>/<code>errorBuilder</code>), <code>fit: BoxFit.cover</code>.<br>
• <b>Buttons (Material 3)</b>: <code>FilledButton</code>, <code>ElevatedButton</code>, <code>OutlinedButton</code>, <code>TextButton</code>, <code>IconButton</code>, <code>FloatingActionButton</code>; <code>onPressed: null</code> disables a button. <b>Icons</b>: <code>Icon(Icons.home)</code>.`,
          `Widget buttons(BuildContext context) => Wrap(
      spacing: 8,
      children: [
        FilledButton(onPressed: () {}, child: const Text('Enroll')),
        ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.play_arrow), label: const Text('Start')),
        OutlinedButton(onPressed: () {}, child: const Text('Preview')),
        const TextButton(onPressed: null, child: Text('Disabled')),
        IconButton(onPressed: () {}, icon: const Icon(Icons.bookmark_border), tooltip: 'Save'),
      ],
    );

Widget avatar(String url) => Image.network(
      url,
      width: 80, height: 80, fit: BoxFit.cover,
      loadingBuilder: (c, child, progress) => progress == null ? child : const Center(child: CircularProgressIndicator()),
      errorBuilder: (c, e, s) => const Icon(Icons.broken_image),
    );

Widget richText() => Text.rich(TextSpan(children: [
      const TextSpan(text: 'Price: '),
      TextSpan(text: '₹1999', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
      const TextSpan(text: '  ₹2999', style: TextStyle(decoration: TextDecoration.lineThrough, color: Colors.grey)),
    ]));`,
        ),
      ],
      [
        blk(`<h3>Cards, dialogs, AppBar and NavigationBar</h3>
• <b>Card</b>: elevated, rounded surface (<code>Card.filled</code>, <code>Card.outlined</code> in Material 3). <b>Dialogs</b>: <code>showDialog</code> + <code>AlertDialog</code>, <code>showModalBottomSheet</code>, <code>showDatePicker</code>; they return a <code>Future</code> with the result. <b>SnackBar</b> for brief messages.<br>
• <b>AppBar</b> (title, leading, actions, bottom: TabBar), <b>SliverAppBar</b> for collapsing bars. <b>NavigationBar</b> (Material 3 bottom bar with <code>NavigationDestination</code>s), <b>NavigationRail</b> (tablets/desktop), <b>Drawer</b>.<br>
• Do not use <code>BuildContext</code> across async gaps without checking <code>context.mounted</code>.`,
          `Future<void> confirmDelete(BuildContext context) async {
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Delete course?'),
      content: const Text('This cannot be undone.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete')),
      ],
    ),
  );
  if (ok == true && context.mounted) {                       // check mounted after the await
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Deleted')));
  }
}

class Shell extends StatefulWidget {
  const Shell({super.key});
  @override State<Shell> createState() => _ShellState();
}
class _ShellState extends State<Shell> {
  int _index = 0;
  static const _pages = [HomeTab(), CoursesTab(), ProfileTab()];
  @override
  Widget build(BuildContext context) => Scaffold(
        body: IndexedStack(index: _index, children: _pages),          // keeps each tab's state alive
        bottomNavigationBar: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: (i) => setState(() => _index = i),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.menu_book_outlined), label: 'Courses'),
            NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
          ],
        ),
      );
}`,
        ),
      ],
      [
        ['Why use ListView.builder?', 'It builds only the items currently visible (and a small cache) as the user scrolls, so long or unlimited lists stay fast and memory-light; the plain ListView builds all children immediately.'],
        ['How do you show a dialog and get a result?', 'Call showDialog<T> with an AlertDialog; Navigator.pop(context, value) closes it and the awaited Future returns value (null if dismissed).'],
        ['Why check context.mounted after await?', 'The widget may have been removed while waiting; using its BuildContext afterwards can throw or act on a stale tree.'],
      ],
    ),
    topic(
      'fl-custom-responsive-widgets',
      'Custom Widgets and Responsive UI',
      [
        blk(`<h3>Building reusable widgets</h3>
• Extract UI into your <b>own widgets</b> (classes, not helper methods that return widgets) to get <code>const</code> optimisation, separate rebuilds, a testable unit and clear names. Design them with a small, typed API: required named parameters, sensible defaults, callbacks (<code>VoidCallback</code>, <code>ValueChanged&lt;T&gt;</code>), and a <code>child</code>/<code>builder</code> for flexibility.<br>
• Use <b>composition over inheritance</b>: build a <code>PrimaryButton</code> from a <code>FilledButton</code>, not by subclassing.`,
          `class PrimaryButton extends StatelessWidget {
  const PrimaryButton({super.key, required this.label, required this.onPressed, this.loading = false, this.icon});
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: loading ? null : onPressed,
      child: loading
          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
          : Row(mainAxisSize: MainAxisSize.min, children: [
              if (icon != null) ...[Icon(icon, size: 18), const SizedBox(width: 8)],
              Text(label),
            ]),
    );
  }
}

class SectionCard extends StatelessWidget {
  const SectionCard({super.key, required this.title, required this.child, this.trailing});
  final String title;
  final Widget child;
  final Widget? trailing;
  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [Expanded(child: Text(title, style: Theme.of(context).textTheme.titleMedium)), if (trailing != null) trailing!]),
            const SizedBox(height: 12),
            child,
          ]),
        ),
      );
}

// usage
PrimaryButton(label: 'Enroll', icon: Icons.school, loading: isSaving, onPressed: enroll);`,
        ),
      ],
      [
        blk(`<h3>Responsive UI basics</h3>
• Phones, tablets, foldables and the web have very different sizes. Design <b>responsively</b>: use flexible layouts (<code>Expanded</code>, <code>Wrap</code>, <code>GridView</code> with max extent), avoid fixed pixel sizes, and switch layouts at <b>breakpoints</b> (compact below 600 dp, medium 600-840, expanded above 840).<br>
• Tools: <code>MediaQuery.sizeOf(context)</code>, <code>LayoutBuilder</code> (parent constraints), <code>OrientationBuilder</code>, <code>FractionallySizedBox</code>, <code>AspectRatio</code>, <code>FittedBox</code>, text scaling (<code>textScaler</code>).<br>
• Test with different devices, orientations, large font sizes and in split-screen.`,
          `class ResponsiveScaffold extends StatelessWidget {
  const ResponsiveScaffold({super.key, required this.list, required this.detail});
  final Widget list;
  final Widget detail;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      if (constraints.maxWidth >= 840) {                      // tablet/desktop: master-detail side by side
        return Row(children: [SizedBox(width: 320, child: list), const VerticalDivider(width: 1), Expanded(child: detail)]);
      }
      return list;                                            // phone: list only (detail on a new route)
    });
  }
}

int columnsFor(double width) => width >= 1200 ? 4 : width >= 840 ? 3 : width >= 600 ? 2 : 1;

Widget responsiveGrid(List<Widget> cards) => LayoutBuilder(
      builder: (context, c) => GridView.count(crossAxisCount: columnsFor(c.maxWidth), childAspectRatio: 1.4, children: cards),
    );`,
        ),
      ],
      [
        blk(`<h3>Accessibility and keeping widgets small</h3>
• <b>Accessibility</b>: add <code>Semantics</code> labels to icons/images, use <code>tooltip</code> on icon buttons, minimum 48x48 dp tap targets, sufficient contrast, support large text (avoid fixed heights for text) and screen readers (TalkBack/VoiceOver).<br>
• Keep <code>build()</code> small: split big widgets into smaller <b>classes</b>; keep logic out of <code>build</code>; pass only the data a widget needs so unrelated changes do not rebuild it.<br>
• Prefer <code>const</code>, avoid creating controllers or doing work in <code>build</code>, and use <code>ListView.builder</code> for long lists.`,
          `IconButton(
  onPressed: onShare,
  icon: const Icon(Icons.share),
  tooltip: 'Share course',                                   // screen-reader label and long-press hint
)

Semantics(
  label: 'Course progress 65 percent',
  child: LinearProgressIndicator(value: 0.65),
)

// scale with the user's font size; do not lock heights
ConstrainedBox(constraints: const BoxConstraints(minHeight: 48), child: Text(title, maxLines: 2, overflow: TextOverflow.ellipsis));

final scale = MediaQuery.textScalerOf(context).scale(16);`,
        ),
      ],
      [
        ['Why create widget classes instead of helper methods?', 'Classes can be const, get their own element/State, rebuild independently, are testable and show up in DevTools; methods that return widgets rebuild with their parent and prevent these optimisations.'],
        ['LayoutBuilder vs MediaQuery?', 'MediaQuery gives the size of the whole screen/window; LayoutBuilder gives the constraints of the widget\'s parent, which is more accurate for components inside panes or split screens.'],
        ['What is a good minimum touch target size?', 'About 48x48 dp (Material guideline), so buttons and icons are easy to tap for all users.'],
      ],
    ),
  ]),

  fl(4, 'Layout and Styling', 'Core', [
    topic(
      'fl-layout-constraints',
      'Padding, Margin, Alignment and Constraints-Based Layout',
      [
        blk(`<h3>Padding, margin and alignment</h3>
• <b>Padding</b> adds space <i>inside</i> a widget's box; <b>margin</b> is space <i>outside</i> (a Container's <code>margin</code>, or wrap with <code>Padding</code>). Use <code>EdgeInsets.all</code>, <code>.symmetric(horizontal, vertical)</code>, <code>.only</code>, <code>.fromLTRB</code>, and <code>EdgeInsetsDirectional</code> for right-to-left languages.<br>
• <b>Alignment</b>: <code>Center</code>, <code>Align(alignment: Alignment.bottomRight)</code>, <code>mainAxisAlignment</code>/<code>crossAxisAlignment</code> in Row/Column, <code>AlignmentDirectional</code>, <code>Text(textAlign: ...)</code>. Use an <b>8-dp spacing scale</b> (4, 8, 16, 24, 32) for consistency.`,
          `Widget card() => Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 8),            // outside
      padding: const EdgeInsets.all(16),                          // inside
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
      child: const Text('Hello'),
    );

Widget aligned() => Container(
      height: 120,
      color: Colors.grey.shade200,
      child: const Align(alignment: Alignment.bottomRight, child: Padding(padding: EdgeInsets.all(8), child: Text('bottom right'))),
    );

abstract final class Gap {                                        // spacing constants
  static const xs = SizedBox(height: 4, width: 4);
  static const sm = SizedBox(height: 8, width: 8);
  static const md = SizedBox(height: 16, width: 16);
  static const lg = SizedBox(height: 24, width: 24);
}`,
        ),
      ],
      [
        blk(`<h3>The layout algorithm: constraints go down, sizes go up</h3>
• Flutter layout rule: <b>"Constraints go down. Sizes go up. Parent sets position."</b> A parent passes <code>BoxConstraints</code> (min/max width and height) to each child; the child picks a size within them and reports it; the parent positions the child.<br>
• <b>Tight</b> constraints force an exact size (min = max); <b>loose</b> constraints allow any size up to max; <b>unbounded</b> means max is infinity (inside a scroll view or a Row/Column main axis).<br>
• Consequences: a child cannot choose its own size or position; a widget with a fixed size ignored inside a tight parent (<code>SizedBox(width: 50)</code> inside a <code>SizedBox.expand</code> still fills). Use <code>Center</code>/<code>Align</code> to loosen constraints, <code>ConstrainedBox</code>/<code>SizedBox</code> to set them.`,
          `// A Container with no child and no size fills the parent (tight to loose).
// A Container with a child wraps it (shrinks to fit).

Container(color: Colors.red);                                      // expands to the available space
Center(child: Container(width: 100, height: 100, color: Colors.red)); // Center loosens, so 100x100 is respected
Container(width: 100, height: 100, color: Colors.red);             // directly under a tight parent: IGNORED, fills

ConstrainedBox(
  constraints: const BoxConstraints(minWidth: 120, maxWidth: 400, minHeight: 48),
  child: const Text('Adaptive width'),
);
UnconstrainedBox(child: const SizedBox(width: 500, height: 20));    // can overflow its parent
FractionallySizedBox(widthFactor: 0.8, child: const Text('80% of parent width'));
AspectRatio(aspectRatio: 16 / 9, child: Image.network('https://example.com/banner.png', fit: BoxFit.cover));
FittedBox(fit: BoxFit.scaleDown, child: const Text('Long title scales down to fit'));`,
        ),
      ],
      [
        blk(`<h3>Common constraint errors and how to fix them</h3>
<table ${TABLE}>
<tr><th>Error</th><th>Cause</th><th>Fix</th></tr>
<tr><td>RenderFlex overflowed</td><td>Row/Column children larger than available space</td><td><code>Expanded</code>/<code>Flexible</code>, <code>Wrap</code>, scrolling, shorter content</td></tr>
<tr><td>Vertical viewport was given unbounded height</td><td>ListView inside Column (infinite height)</td><td>Wrap the ListView in <code>Expanded</code> or give it a <code>SizedBox</code>/<code>shrinkWrap</code></td></tr>
<tr><td>BoxConstraints forces an infinite width</td><td><code>Expanded</code>/<code>TextField</code> inside an unbounded Row/Column</td><td>Bound the parent, wrap with <code>SizedBox</code>/<code>Expanded</code></td></tr>
<tr><td>Incorrect use of ParentDataWidget</td><td><code>Expanded</code> outside Row/Column/Flex, <code>Positioned</code> outside Stack</td><td>Place it as a direct child of the right parent</td></tr>
<tr><td>A widget ignores its size</td><td>Parent passes tight constraints</td><td>Wrap in <code>Center</code>/<code>Align</code></td></tr>
</table>
• Debug layouts with the <b>Flutter Inspector</b> ("Layout Explorer") and <code>debugPaintSizeEnabled</code>.`,
          `// Error: a ListView in a Column has unbounded height
Column(children: [
  const Text('Header'),
  // ListView(children: [...]),                         // BAD: Vertical viewport was given unbounded height
  Expanded(child: ListView(children: const [Text('a'), Text('b')])),   // GOOD
]);

// TextField in a Row needs a bounded width
Row(children: [
  const Text('Name:'),
  const SizedBox(width: 8),
  const Expanded(child: TextField()),                    // GOOD (without Expanded: infinite width error)
]);

// Use a Wrap when items may not fit on one line
Wrap(spacing: 8, runSpacing: 8, children: List.generate(10, (i) => Chip(label: Text('Tag $i'))));`,
        ),
      ],
      [
        ['What is the main Flutter layout rule?', 'Constraints go down, sizes go up, and the parent sets the position: a parent gives each child min/max constraints, the child chooses a size within them, and the parent places it.'],
        ['Why does a ListView inside a Column throw an unbounded height error?', 'A Column gives its children unbounded height, and a ListView tries to be as tall as its content, which cannot be computed. Wrap it in Expanded or give it a fixed size (or shrinkWrap for short lists).'],
        ['Why is my Container size ignored?', 'Its parent passed tight constraints that force a size. Wrap the Container in Center or Align so the constraints become loose and your size can apply.'],
      ],
    ),
    topic(
      'fl-styling-themes',
      'BoxDecoration, Themes, Dark Mode and Custom Fonts',
      [
        blk(`<h3>BoxDecoration</h3>
• <code>BoxDecoration</code> (in <code>Container</code> or <code>DecoratedBox</code>) paints background and border: <code>color</code>, <code>gradient</code> (<code>LinearGradient</code>, <code>RadialGradient</code>), <code>border</code> (<code>Border.all</code>), <code>borderRadius</code>, <code>boxShadow</code>, <code>image</code> (<code>DecorationImage</code>), <code>shape: BoxShape.circle</code>.<br>
• Do not set both <code>color</code> on the Container and <code>decoration</code> (error): put the color inside the decoration.`,
          `Widget gradientCard() => Container(
      height: 140,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFFFF7A18), Color(0xFFFFB347)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: Color(0x33000000), blurRadius: 12, offset: Offset(0, 6))],
        border: Border.all(color: Colors.white24),
      ),
      alignment: Alignment.center,
      child: const Text('Flutter Course', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
    );

Widget avatar(String url) => Container(
      width: 64, height: 64,
      decoration: BoxDecoration(shape: BoxShape.circle, image: DecorationImage(image: NetworkImage(url), fit: BoxFit.cover)),
    );`,
        ),
      ],
      [
        blk(`<h3>Themes and dark mode</h3>
• A <b>ThemeData</b> defines the app's look: <code>colorScheme</code> (generate from a seed: <code>ColorScheme.fromSeed(seedColor: ...)</code>), <code>textTheme</code>, component themes (<code>appBarTheme</code>, <code>elevatedButtonTheme</code>, <code>cardTheme</code>, <code>inputDecorationTheme</code>), <code>useMaterial3: true</code>.<br>
• Read it with <code>Theme.of(context)</code>: <code>colorScheme.primary</code>, <code>textTheme.titleLarge</code>. <b>Never hard-code colours</b> in widgets; use the scheme so dark mode works.<br>
• <b>Dark mode</b>: give <code>MaterialApp</code> both <code>theme</code> and <code>darkTheme</code> and a <code>themeMode</code> (<code>system</code>, <code>light</code>, <code>dark</code>); let users choose and <b>persist</b> the choice (SharedPreferences) in a provider.`,
          `ThemeData buildTheme(Brightness brightness) {
  final scheme = ColorScheme.fromSeed(seedColor: const Color(0xFFEA580C), brightness: brightness);
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    textTheme: const TextTheme(headlineMedium: TextStyle(fontWeight: FontWeight.w700)),
    appBarTheme: AppBarTheme(backgroundColor: scheme.surface, foregroundColor: scheme.onSurface, elevation: 0),
    inputDecorationTheme: const InputDecorationTheme(border: OutlineInputBorder(), isDense: true),
    cardTheme: CardTheme(elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
  );
}

class ThemeModeNotifier extends StateNotifier<ThemeMode> {          // Riverpod
  ThemeModeNotifier(this._prefs) : super(ThemeMode.values.byName(_prefs.getString('theme') ?? 'system'));
  final SharedPreferences _prefs;
  void set(ThemeMode mode) { state = mode; _prefs.setString('theme', mode.name); }
}

MaterialApp(theme: buildTheme(Brightness.light), darkTheme: buildTheme(Brightness.dark), themeMode: ref.watch(themeModeProvider));

// in a widget: colours from the theme, not hard-coded
Container(color: Theme.of(context).colorScheme.surfaceContainerHighest, child: Text('Hi', style: Theme.of(context).textTheme.bodyLarge));`,
        ),
      ],
      [
        blk(`<h3>Custom fonts and ThemeExtensions</h3>
• <b>Custom fonts</b>: place font files in <code>assets/fonts/</code>, declare them under <code>flutter: fonts:</code> in <code>pubspec.yaml</code>, then set <code>fontFamily</code> in the theme. Or use the <code>google_fonts</code> package (downloads at runtime; bundle fonts for offline apps and for privacy).<br>
• <b>ThemeExtension</b> adds your own design tokens (brand colours, spacing, radii) to the theme with <code>lerp</code> support for animated theme changes.<br>
• Keep a small design system: colours, typography, spacing, radii in one place.`,
          `# pubspec.yaml
flutter:
  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
        - asset: assets/fonts/Inter-Bold.ttf
          weight: 700
        - asset: assets/fonts/Inter-Italic.ttf
          style: italic

// theme
ThemeData(fontFamily: 'Inter', textTheme: GoogleFonts.interTextTheme());

@immutable
class BrandColors extends ThemeExtension<BrandColors> {
  const BrandColors({required this.success, required this.warning});
  final Color success;
  final Color warning;
  @override
  BrandColors copyWith({Color? success, Color? warning}) => BrandColors(success: success ?? this.success, warning: warning ?? this.warning);
  @override
  BrandColors lerp(ThemeExtension<BrandColors>? other, double t) =>
      other is! BrandColors ? this : BrandColors(success: Color.lerp(success, other.success, t)!, warning: Color.lerp(warning, other.warning, t)!);
}
// ThemeData(extensions: const [BrandColors(success: Color(0xFF16A34A), warning: Color(0xFFF59E0B))])
// final colors = Theme.of(context).extension<BrandColors>()!;`,
        ),
      ],
      [
        ['How do you support dark mode in Flutter?', 'Provide theme and darkTheme to MaterialApp with a themeMode, build both from a ColorScheme, and read colours from Theme.of(context) instead of hard-coding them; persist the user\'s choice.'],
        ['Why use ColorScheme.fromSeed?', 'It generates a harmonious, accessible Material 3 palette (primary, secondary, surface, containers) from one seed colour for both light and dark brightness.'],
        ['How do you add a custom font?', 'Add the font files to assets, declare them under flutter: fonts: in pubspec.yaml, and set fontFamily in ThemeData or TextStyle (or use the google_fonts package).'],
      ],
    ),
    topic(
      'fl-responsive-adaptive-animation',
      'MediaQuery, LayoutBuilder, Adaptive UI and Animations Basics',
      [
        blk(`<h3>MediaQuery and LayoutBuilder in practice</h3>
• <code>MediaQuery.sizeOf(context)</code> (screen size), <code>.orientationOf</code>, <code>.paddingOf</code> (safe-area insets: notch, status bar), <code>.viewInsetsOf</code> (keyboard height), <code>.textScalerOf</code>, <code>.platformBrightnessOf</code>. Use the specific methods (<code>sizeOf</code>) so the widget rebuilds only when that value changes.<br>
• <code>SafeArea</code> keeps content out of notches and system bars. <code>LayoutBuilder</code> reacts to the <b>parent</b>'s constraints.`,
          `class Home extends StatelessWidget {
  const Home({super.key});
  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final isLandscape = MediaQuery.orientationOf(context) == Orientation.landscape;
    final keyboard = MediaQuery.viewInsetsOf(context).bottom;
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(bottom: keyboard),                // lift content above the keyboard
        child: Text('\${size.width.round()} x \${size.height.round()} landscape=$isLandscape'),
      ),
    );
  }
}`,
        ),
      ],
      [
        blk(`<h3>Adaptive UI</h3>
• <b>Responsive</b> = adjust to <i>size</i>; <b>adaptive</b> = adjust to <i>platform</i> and input too: bottom bar on phones vs <code>NavigationRail</code> on tablets/desktop; Cupertino look on iOS (<code>Switch.adaptive</code>, <code>CircularProgressIndicator.adaptive</code>, <code>showAdaptiveDialog</code>); mouse hover and keyboard shortcuts on desktop/web; touch targets on mobile.<br>
• Detect the platform with <code>Theme.of(context).platform</code> (not <code>dart:io</code>, which fails on web) and <code>kIsWeb</code>.<br>
• The <code>flutter_adaptive_scaffold</code> package switches between bottom navigation, rail and drawer automatically.`,
          `Widget adaptiveNav(BuildContext context, int index, ValueChanged<int> onSelect, Widget body) {
  final wide = MediaQuery.sizeOf(context).width >= 840;
  const items = [
    (Icons.home_outlined, Icons.home, 'Home'),
    (Icons.menu_book_outlined, Icons.menu_book, 'Courses'),
    (Icons.person_outline, Icons.person, 'Profile'),
  ];
  if (wide) {
    return Row(children: [
      NavigationRail(
        selectedIndex: index, onDestinationSelected: onSelect, labelType: NavigationRailLabelType.all,
        destinations: [for (final i in items) NavigationRailDestination(icon: Icon(i.$1), selectedIcon: Icon(i.$2), label: Text(i.$3))],
      ),
      const VerticalDivider(width: 1),
      Expanded(child: body),
    ]);
  }
  return Scaffold(
    body: body,
    bottomNavigationBar: NavigationBar(
      selectedIndex: index, onDestinationSelected: onSelect,
      destinations: [for (final i in items) NavigationDestination(icon: Icon(i.$1), selectedIcon: Icon(i.$2), label: i.$3)],
    ),
  );
}

final isIOS = Theme.of(context).platform == TargetPlatform.iOS;
Switch.adaptive(value: on, onChanged: (v) => setState(() => on = v));   // looks native on each platform`,
        ),
      ],
      [
        blk(`<h3>Animations and transitions: the basics</h3>
• <b>Implicit animations</b> animate automatically when a property changes: <code>AnimatedContainer</code>, <code>AnimatedOpacity</code>, <code>AnimatedAlign</code>, <code>AnimatedPositioned</code>, <code>AnimatedSwitcher</code>, <code>AnimatedCrossFade</code>, <code>TweenAnimationBuilder</code>. Set <code>duration</code> and <code>curve</code>; no controller needed.<br>
• <b>Page transitions</b>: <code>MaterialPageRoute</code> by default; custom with <code>PageRouteBuilder</code> or <code>GoRouter</code>'s <code>CustomTransitionPage</code>; <b>Hero</b> animates a shared element between screens.<br>
• Keep animations short (150-400 ms), respect "reduce motion" (<code>MediaQuery.disableAnimationsOf</code>) and avoid animating layout-heavy widgets (animate <code>Transform</code>/<code>Opacity</code> instead).`,
          `class ExpandableCard extends StatefulWidget {
  const ExpandableCard({super.key});
  @override State<ExpandableCard> createState() => _ExpandableCardState();
}
class _ExpandableCardState extends State<ExpandableCard> {
  bool _open = false;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _open = !_open),
      child: AnimatedContainer(                                   // implicit: animates between the old and new values
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        height: _open ? 160 : 72,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: _open ? Colors.orange.shade100 : Colors.grey.shade200, borderRadius: BorderRadius.circular(_open ? 24 : 12)),
        child: const Text('Tap to expand'),
      ),
    );
  }
}

Widget fadeSwitch(String text) => AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      transitionBuilder: (child, anim) => FadeTransition(opacity: anim, child: child),
      child: Text(text, key: ValueKey(text)),                     // a new key triggers the transition
    );

Navigator.push(context, PageRouteBuilder(
  pageBuilder: (_, __, ___) => const DetailPage(),
  transitionsBuilder: (_, anim, __, child) => SlideTransition(position: Tween(begin: const Offset(1, 0), end: Offset.zero).animate(anim), child: child),
));`,
        ),
      ],
      [
        ['Responsive vs adaptive design?', 'Responsive adapts layout to available size (breakpoints, flexible widgets). Adaptive also adapts to platform and input: native-looking controls on iOS/Android, navigation rail vs bottom bar, keyboard and mouse support on desktop.'],
        ['Why use MediaQuery.sizeOf instead of MediaQuery.of(context).size?', 'sizeOf subscribes the widget only to size changes, so it does not rebuild for unrelated MediaQuery changes such as the keyboard or text scale.'],
        ['What is an implicit animation?', 'A widget like AnimatedContainer that automatically animates from the old to the new value when its properties change, using a duration and curve, without an AnimationController.'],
      ],
    ),
  ]),
];
