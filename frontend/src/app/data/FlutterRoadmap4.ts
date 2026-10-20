// Flutter roadmap, part 4: sections 15-18 (testing and debugging, performance optimization, deployment and DevOps, projects).
// Dart string interpolation "${...}" is written as "\${...}" inside these template literals; "$name" needs no escape.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';
import { flutterExamples } from './RoadmapExamples2';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const fl = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('fl', n, title, priority, topics);

const flutterRoadmap4Base: SubTopic[] = [
  fl(15, 'Testing and Debugging', 'Production', [
    topic(
      'fl-unit-widget-tests',
      'Unit Testing and Widget Testing',
      [
        blk(`<h3>Unit tests</h3>
• Flutter has three test levels: <b>unit</b> (a function/class, no UI, milliseconds), <b>widget</b> (one widget or screen in a simulated environment, no device) and <b>integration</b> (the whole app on a device/emulator). Aim for many unit tests, a good number of widget tests, and a few integration tests (the testing pyramid).<br>
• Add <code>flutter_test</code> (included); files end with <code>_test.dart</code> in <code>test/</code>. Use <code>group</code>, <code>test</code>, <code>setUp</code>, <code>tearDown</code>, <code>expect</code> with matchers (<code>equals</code>, <code>isTrue</code>, <code>throwsA</code>, <code>isA&lt;T&gt;()</code>, <code>closeTo</code>, <code>contains</code>, <code>emitsInOrder</code> for streams). Run with <code>flutter test</code> (<code>--coverage</code>, <code>--name</code>, a single file).`,
          `// lib/features/cart/cart.dart
class Cart {
  final _items = <String, int>{};
  void add(String sku, {int qty = 1}) {
    if (qty <= 0) throw ArgumentError.value(qty, 'qty', 'must be positive');
    _items.update(sku, (v) => v + qty, ifAbsent: () => qty);
  }
  int get count => _items.values.fold(0, (a, b) => a + b);
}

// test/cart_test.dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Cart', () {
    late Cart cart;
    setUp(() => cart = Cart());

    test('starts empty', () => expect(cart.count, 0));

    test('adds and accumulates quantities', () {
      cart.add('A', qty: 2);
      cart.add('A');
      cart.add('B');
      expect(cart.count, 4);
    });

    test('rejects non-positive quantity', () {
      expect(() => cart.add('A', qty: 0), throwsArgumentError);
    });
  });

  test('stream emits in order', () {
    expect(Stream.fromIterable([1, 2, 3]).map((x) => x * 2), emitsInOrder([2, 4, 6, emitsDone]));
  });
}`,
        ),
      ],
      [
        blk(`<h3>Widget tests</h3>
• <code>testWidgets('name', (WidgetTester tester) async { ... })</code>: <code>await tester.pumpWidget(MaterialApp(home: MyWidget()))</code> builds the widget; <b>finders</b> (<code>find.text</code>, <code>find.byType</code>, <code>find.byKey</code>, <code>find.byIcon</code>, <code>find.bySemanticsLabel</code>) locate it; <b>interactions</b> (<code>tap</code>, <code>enterText</code>, <code>drag</code>, <code>fling</code>); then <code>pump()</code> (one frame), <code>pump(duration)</code> or <code>pumpAndSettle()</code> (until animations finish); <b>matchers</b> (<code>findsOneWidget</code>, <code>findsNothing</code>, <code>findsNWidgets</code>).<br>
• Wrap the widget in <code>MaterialApp</code> (and <code>ProviderScope</code>/<code>BlocProvider</code>) so <code>Theme</code>, <code>MediaQuery</code> and <code>Navigator</code> exist. Give important widgets <code>Key</code>s. Test <b>behaviour</b> (what the user sees) not widget internals.`,
          `class LoginForm extends StatefulWidget {
  const LoginForm({super.key, required this.onSubmit});
  final void Function(String email, String password) onSubmit;
  @override State<LoginForm> createState() => _LoginFormState();
}
// ... TextFormField(key: Key('email')) TextFormField(key: Key('password')) FilledButton(key: Key('submit'))

void main() {
  testWidgets('shows validation errors and does not submit empty form', (tester) async {
    var submitted = false;
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: LoginForm(onSubmit: (_, __) => submitted = true))));

    await tester.tap(find.byKey(const Key('submit')));
    await tester.pump();                                         // rebuild after setState

    expect(find.text('Enter a valid email'), findsOneWidget);
    expect(submitted, isFalse);
  });

  testWidgets('submits valid credentials', (tester) async {
    String? email;
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: LoginForm(onSubmit: (e, p) => email = e))));

    await tester.enterText(find.byKey(const Key('email')), 'asha@example.com');
    await tester.enterText(find.byKey(const Key('password')), 'secret123');
    await tester.tap(find.byKey(const Key('submit')));
    await tester.pumpAndSettle();

    expect(email, 'asha@example.com');
  });

  testWidgets('counter increments', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: CounterPage()));
    expect(find.text('0'), findsOneWidget);
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();
    expect(find.text('1'), findsOneWidget);
  });
}`,
        ),
      ],
      [
        blk(`<h3>Testing async code, timers and layout sizes</h3>
• Use <code>tester.runAsync</code> for real async work, <code>fakeAsync</code> + <code>async.elapse(Duration)</code> to control timers/debounce deterministically, and <code>pumpAndSettle</code> only when animations terminate (an infinite animation or spinner makes it time out: use <code>pump</code> with durations).<br>
• Test different <b>screen sizes and text scales</b>: <code>tester.view.physicalSize = const Size(400, 800); addTearDown(tester.view.reset);</code>, and <code>tester.platformDispatcher.textScaleFactorTestValue</code>, to catch overflows. Test <b>accessibility</b> with <code>expectLater(tester, meetsGuideline(androidTapTargetGuideline))</code> and <code>labeledTapTargetGuideline</code>.<br>
• Keep tests <b>independent, fast and deterministic</b>; no real network, clock or randomness: inject them.`,
          `testWidgets('search is debounced', (tester) async {
  final calls = <String>[];
  await tester.pumpWidget(MaterialApp(home: Scaffold(body: SearchBox(onSearch: calls.add))));

  await tester.enterText(find.byType(TextField), 'fl');
  await tester.pump(const Duration(milliseconds: 100));
  await tester.enterText(find.byType(TextField), 'flutter');
  await tester.pump(const Duration(milliseconds: 350));            // past the 300 ms debounce

  expect(calls, ['flutter']);                                      // only the last value
});

testWidgets('no overflow on a small phone with large text', (tester) async {
  tester.view.physicalSize = const Size(320, 640);
  tester.view.devicePixelRatio = 1.0;
  tester.platformDispatcher.textScaleFactorTestValue = 2.0;
  addTearDown(() { tester.view.reset(); tester.platformDispatcher.clearAllTestValues(); });

  await tester.pumpWidget(const MaterialApp(home: CourseDetailPage(course: sampleCourse)));
  expect(tester.takeException(), isNull);                          // a RenderFlex overflow would be reported here
});

testWidgets('tap targets are large enough', (tester) async {
  final handle = tester.ensureSemantics();
  await tester.pumpWidget(const MaterialApp(home: HomePage()));
  await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
  handle.dispose();
});`,
        ),
      ],
      [
        ['What is the difference between pump and pumpAndSettle?', 'pump triggers one frame (optionally after a duration); pumpAndSettle keeps pumping until no frames are scheduled (animations finished). With endless animations pumpAndSettle times out; use pump instead.'],
        ['Why wrap widgets in MaterialApp for tests?', 'Many widgets need ancestors such as Theme, MediaQuery, Navigator and Directionality that MaterialApp provides; without them tests throw errors.'],
        ['Unit vs widget vs integration tests?', 'Unit tests check logic without UI (fast); widget tests build widgets in a simulated environment and interact with them; integration tests run the whole app on a device to verify full flows (slow, few).'],
      ],
    ),
    topic(
      'fl-integration-mocking-golden',
      'Integration Testing, Mocking, Golden Tests and Automated Testing',
      [
        blk(`<h3>Mocking</h3>
• Replace real dependencies (API, database, clock, platform plugins) with <b>fakes</b> (simple in-memory implementations) or <b>mocks</b> (record and verify calls). Depend on <b>interfaces</b> (<code>abstract interface class CourseRepository</code>) and inject them (constructor or Riverpod overrides), so tests can swap them.<br>
• Packages: <b>mocktail</b> (no code generation, recommended) or <b>mockito</b> (needs build_runner). <code>when(() =&gt; repo.fetchAll()).thenAnswer((_) async =&gt; courses)</code>, <code>verify(() =&gt; repo.fetch(1)).called(1)</code>, <code>registerFallbackValue</code> for custom argument types.<br>
• Prefer fakes for repositories (simple, readable) and mocks to verify interactions. Mock the <b>network</b> with <code>http_mock_adapter</code> (Dio) or a fake <code>HttpClient</code>.`,
          `import 'package:mocktail/mocktail.dart';

class MockCourseRepository extends Mock implements CourseRepository {}

void main() {
  late MockCourseRepository repo;
  setUp(() => repo = MockCourseRepository());

  test('loads courses into a Loaded state', () async {
    when(() => repo.fetchAll()).thenAnswer((_) async => [const Course(1, 'Flutter', 1999)]);
    final cubit = CoursesCubit(repo);

    await cubit.load();

    expect(cubit.state, isA<CoursesLoaded>());
    verify(() => repo.fetchAll()).called(1);
  });

  test('emits Failure when the API throws', () async {
    when(() => repo.fetchAll()).thenThrow(const NetworkFailure());
    final cubit = CoursesCubit(repo);
    await cubit.load();
    expect(cubit.state, isA<CoursesFailure>());
  });

  testWidgets('screen shows the list (Riverpod override)', (tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [courseRepositoryProvider.overrideWithValue(FakeCourseRepository([const Course(1, 'Flutter', 1999)]))],
      child: const MaterialApp(home: CoursesPage()),
    ));
    await tester.pumpAndSettle();
    expect(find.text('Flutter'), findsOneWidget);
  });
}`,
        ),
      ],
      [
        blk(`<h3>Integration tests</h3>
• <b>integration_test</b> (SDK package) runs the real app on a device/emulator and drives it with the same <code>WidgetTester</code> API: login, browse, enrol, offline behaviour. Create <code>integration_test/app_test.dart</code>, call <code>IntegrationTestWidgetsFlutterBinding.ensureInitialized()</code>, start the app with <code>app.main()</code> (or pump your root widget with fake services for stable tests), run with <code>flutter test integration_test</code>.<br>
• Point at a <b>test backend</b> (a Spring Boot instance with seeded data) or fake the API layer; keep tests independent (clean state, fresh user).<br>
• Run on a device farm (Firebase Test Lab, BrowserStack, Codemagic) for many devices; record performance with <code>IntegrationTestWidgetsFlutterBinding.traceAction</code>. Alternatives: <b>Patrol</b> (native dialogs, permissions) and <b>Maestro</b> (YAML flows).`,
          `// integration_test/login_flow_test.dart
import 'package:integration_test/integration_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:javaschoollab_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('user logs in and sees the courses', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(const Key('email')), 'asha@example.com');
    await tester.enterText(find.byKey(const Key('password')), 'secret123');
    await tester.tap(find.byKey(const Key('submit')));
    await tester.pumpAndSettle(const Duration(seconds: 5));

    expect(find.text('My courses'), findsOneWidget);
    await tester.tap(find.text('Flutter Essentials'));
    await tester.pumpAndSettle();
    expect(find.byType(CourseDetailPage), findsOneWidget);
  });
}
// flutter test integration_test --dart-define=API_URL=http://10.0.2.2:8080
// flutter drive --driver=test_driver/integration_test.dart --target=integration_test/login_flow_test.dart`,
        ),
      ],
      [
        blk(`<h3>Golden tests and test automation</h3>
• <b>Golden tests</b> compare a rendered widget against a stored <b>reference image</b>: <code>await expectLater(find.byType(CourseCard), matchesGoldenFile('goldens/course_card.png'))</code>. They catch unintended visual changes (spacing, colour, font). Generate or update references with <code>flutter test --update-goldens</code>. Rendering differs across OS/fonts: run goldens on <b>one platform (the CI image)</b>, load real fonts (<code>golden_toolkit</code>/<code>alchemist</code>) and keep them small and focused (a component, in light and dark).<br>
• <b>Automation</b>: run <code>dart format --set-exit-if-changed .</code>, <code>flutter analyze</code>, <code>flutter test --coverage</code> and the build on every pull request (GitHub Actions/Codemagic); fail the build on lint errors and coverage drops; upload <code>lcov.info</code> to Codecov. Use coverage as a guide, not a target.`,
          `testWidgets('CourseCard matches the golden (light and dark)', (tester) async {
  for (final brightness in [Brightness.light, Brightness.dark]) {
    await tester.pumpWidget(MaterialApp(
      theme: ThemeData(useMaterial3: true, brightness: brightness, colorSchemeSeed: Colors.deepOrange),
      home: const Scaffold(body: Center(child: SizedBox(width: 320, child: CourseCard(title: 'Flutter Essentials', lessons: 24, price: 1999)))),
    ));
    await expectLater(find.byType(CourseCard), matchesGoldenFile('goldens/course_card_\${brightness.name}.png'));
  }
});
// flutter test --update-goldens test/course_card_golden_test.dart

# .github/workflows/flutter.yml
name: Flutter CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: { channel: stable, cache: true }
      - run: flutter pub get
      - run: dart format --output=none --set-exit-if-changed .
      - run: flutter analyze --fatal-infos
      - run: flutter test --coverage
      - uses: codecov/codecov-action@v4
        with: { files: coverage/lcov.info }`,
        ),
      ],
      [
        ['mocktail vs mockito?', 'Both create mocks to stub and verify calls. mocktail needs no code generation and works with null safety out of the box; mockito requires build_runner generated mocks.'],
        ['What are golden tests and what is their main pitfall?', 'They compare a rendered widget with a saved image to catch visual regressions. Pixel output differs across operating systems and fonts, so generate and run them on one consistent platform (CI).'],
        ['What should run automatically in CI for a Flutter project?', 'Formatting check, flutter analyze, unit and widget tests with coverage, and a build; integration tests on emulators or a device farm for critical flows.'],
      ],
    ),
    topic(
      'fl-devtools-debugging',
      'Flutter DevTools, Debugging, Performance Profiling and Memory Leak Detection',
      [
        blk(`<h3>Debugging</h3>
• Tools: <code>debugPrint</code>/<code>log</code> (<code>dart:developer</code>; use <code>log(name: ...)</code> for filtering), IDE <b>breakpoints</b> (conditional, logpoints), step through code, inspect variables, <b>exception breakpoints</b>, <code>assert</code> (debug only), <code>debugger()</code>, <code>FlutterError</code> messages (read them: they usually name the cause and fix). Always read the first lines of a red-screen error and the <b>first stack frame in your code</b>.<br>
• Layout bugs: <b>Flutter Inspector</b> (select widget on device, Layout Explorer, constraints), <code>debugPaintSizeEnabled</code>, <code>debugPaintBaselinesEnabled</code>, <code>debugRepaintRainbowEnabled</code>, <code>debugDumpApp()</code>, <code>debugDumpRenderTree()</code>. Network: <b>DevTools Network tab</b> or a proxy (Charles, mitmproxy) / Dio <code>LogInterceptor</code> (debug only).`,
          `import 'dart:developer' as dev;

dev.log('loading course', name: 'courses', error: null);
debugPrint('state: $state');                       // not truncated by the platform log like print()
assert(count >= 0, 'count must not be negative');  // active in debug only

// widget tree and layout dumps
debugDumpApp();
debugDumpRenderTree();

// Visual debugging switches
import 'package:flutter/rendering.dart';
debugPaintSizeEnabled = true;          // outlines and padding
debugRepaintRainbowEnabled = true;     // flashes colours on repaint: finds needless repaints

// Dio: log requests only in debug builds
if (kDebugMode) dio.interceptors.add(LogInterceptor(request: true, requestHeader: false, requestBody: true, responseBody: true));

// Common red-screen errors and what they mean
// "RenderFlex overflowed"                -> children too big: Expanded/Flexible/scroll
// "setState() called after dispose()"    -> check mounted / cancel timers & subscriptions in dispose
// "Looking up a deactivated widget's ancestor is unsafe" -> use context only while mounted, not after await
// "Null check operator used on a null value" -> a ! on null: read the stack trace`,
        ),
      ],
      [
        blk(`<h3>Flutter DevTools and performance profiling</h3>
• Open DevTools from the IDE or <code>dart devtools</code> (profile mode for real numbers: <code>flutter run --profile</code>; <b>never profile in debug</b>, it is much slower).<br>
• Tabs: <b>Inspector</b> (widget tree), <b>Performance</b> (frame chart: UI thread and raster thread bars; a frame over 16 ms at 60 fps (8 ms at 120 fps) is janky; look for <b>shader compilation jank</b> and expensive <code>build</code>/layout), <b>CPU Profiler</b> (call tree, flame chart: find hot methods), <b>Memory</b> (heap, allocations, snapshots, GC), <b>Network</b>, <b>Logging</b>, <b>App Size</b> tool, <b>Debugger</b>.<br>
• Flutter <b>performance overlay</b> (<code>showPerformanceOverlay: true</code>) shows two graphs live. <b>Timeline events</b> (<code>Timeline.startSync('parse')</code>) mark your own code. Enable <b>Impeller</b> (default on modern Flutter) for fewer shader compile stutters.`,
          `// show live frame graphs on the device
MaterialApp(showPerformanceOverlay: true, home: const HomePage());

// profile your own code in the DevTools timeline
import 'dart:developer';
Timeline.startSync('parse courses');
final courses = parseCourses(body);
Timeline.finishSync();

final sw = Stopwatch()..start();
await heavyOperation();
debugPrint('took \${sw.elapsedMilliseconds} ms');

// run a profile build
// flutter run --profile
// then open DevTools -> Performance -> record, scroll the list, inspect red frames

// size analysis
// flutter build apk --analyze-size --target-platform android-arm64`,
        ),
      ],
      [
        blk(`<h3>Memory leak detection</h3>
• Typical Flutter leaks: <b>undisposed</b> controllers (<code>TextEditingController</code>, <code>AnimationController</code>, <code>ScrollController</code>, <code>FocusNode</code>), <b>uncancelled</b> <code>StreamSubscription</code>s and <code>Timer</code>s, listeners added to long-lived objects and not removed, closures capturing a <code>State</code>/<code>BuildContext</code>, <b>global lists/caches that only grow</b>, large images kept decoded, widgets retained by singletons.<br>
• Detect: DevTools <b>Memory</b> tab: take a snapshot, navigate to the screen and back several times, force GC, take another snapshot and <b>diff</b> (look for instances of your <code>State</code> classes that should be gone); the <code>leak_tracker</code> package (built into <code>flutter_test</code> via <code>LeakTesting</code>) reports undisposed objects in tests; lint <code>close_sinks</code>, <code>cancel_subscriptions</code>.<br>
• Fix: dispose in <code>dispose()</code>, cancel in <code>dispose()</code>, bound caches (LRU), size images (<code>cacheWidth</code>), avoid capturing contexts in long-lived callbacks, use <code>ref.onDispose</code> in Riverpod.`,
          `// analysis_options.yaml
// linter:
//   rules:
//     - cancel_subscriptions
//     - close_sinks
//     - avoid_print
//     - use_build_context_synchronously

class _LeakyState extends State<LeakyPage> {
  final _controller = TextEditingController();
  late final StreamSubscription<Position> _sub;
  late final Timer _timer;

  @override
  void initState() {
    super.initState();
    _sub = locationStream.listen(_onPosition);
    _timer = Timer.periodic(const Duration(seconds: 5), (_) => _poll());
  }

  @override
  void dispose() {                                  // without these three lines this screen leaks on every visit
    _controller.dispose();
    _sub.cancel();
    _timer.cancel();
    super.dispose();
  }
}

// leak_tracker in widget tests
void main() {
  LeakTesting.enable();
  LeakTesting.settings = LeakTesting.settings.withIgnored(createdByTestHelpers: true);
  testWidgets('does not leak', (tester) async { /* ... */ });
}`,
        ),
      ],
      [
        ['Why profile in profile mode and not debug mode?', 'Debug builds include assertions and JIT compilation and are far slower, so frame timings are misleading. Profile mode uses AOT-like performance with profiling hooks available.'],
        ['How do you find a memory leak in a Flutter app?', 'Use the DevTools Memory tab: snapshot, repeat a navigation flow, force GC, snapshot and diff to find instances (such as a State) that should have been released; also lint for undisposed controllers and uncancelled subscriptions.'],
        ['What does a janky frame mean?', 'A frame that takes longer than the frame budget (about 16 ms at 60 Hz), on the UI or raster thread, causing visible stutter; DevTools shows which thread and which work is expensive.'],
      ],
    ),
  ]),

  fl(16, 'Performance Optimization', 'Production', [
    topic(
      'fl-rebuild-lists-images',
      'Widget Rebuild Optimization, const Constructors, Efficient Lists, Images and Lazy Loading',
      [
        blk(`<h3>Reduce rebuilds</h3>
• A rebuild calls <code>build()</code> again: cheap if small, costly if the subtree is big. Optimise <b>what</b> rebuilds, not how often <code>setState</code> is called.<br>
• Techniques: <b>push state down</b> (a small <code>StatefulWidget</code> around the changing part); <b><code>const</code> constructors</b> (Flutter skips rebuilding identical const instances); extract <b>widget classes</b> (not helper methods); pass a prebuilt <code>child</code> to <code>AnimatedBuilder</code>/<code>ValueListenableBuilder</code>; <b>select</b> only what you need (<code>ref.watch(p.select(...))</code>, <code>context.select</code>, <code>BlocSelector</code>, <code>buildWhen</code>); give widgets stable <b>Keys</b> when reordering; avoid doing work (parsing, sorting, network) in <code>build()</code>.<br>
• Use the DevTools "Track widget rebuilds" and <code>debugPrintRebuildDirtyWidgets</code>. Enable lints <code>prefer_const_constructors</code>, <code>prefer_const_literals_to_create_immutables</code>.`,
          `// BAD: the whole page rebuilds every second to update one clock
class Page extends StatefulWidget { /* setState every second rebuilds BigList and everything else */ }

// GOOD: only the clock rebuilds
class Clock extends StatefulWidget {
  const Clock({super.key});
  @override State<Clock> createState() => _ClockState();
}
class _ClockState extends State<Clock> {
  late final Timer _t = Timer.periodic(const Duration(seconds: 1), (_) => setState(() => _now = DateTime.now()));
  DateTime _now = DateTime.now();
  @override void dispose() { _t.cancel(); super.dispose(); }
  @override Widget build(BuildContext context) => Text(DateFormat.Hms().format(_now));
}

// const: created once, never rebuilt
return const Column(children: [Icon(Icons.school), SizedBox(height: 8), Text('Welcome')]);

// select only what you use
final name = ref.watch(userProvider.select((u) => u.name));         // rebuilds only when the name changes

// the static child is built once
AnimatedBuilder(animation: controller, child: const HeavyStaticContent(), builder: (c, child) => Opacity(opacity: controller.value, child: child));

// BAD: work inside build
final sorted = courses.toList()..sort(compare);                      // re-sorted on every rebuild
// GOOD: compute once (provider, initState or memoised)`,
        ),
      ],
      [
        blk(`<h3>Efficient list rendering</h3>
• Use <b>builder</b> constructors (<code>ListView.builder</code>, <code>GridView.builder</code>, <code>SliverList.builder</code>): only visible items (plus <code>cacheExtent</code>) are built. Never put thousands of items in a plain <code>ListView(children: ...)</code> or a <code>Column</code> inside <code>SingleChildScrollView</code>.<br>
• Give items a <code>key</code> (<code>ValueKey(id)</code>) so state follows the item; set <code>itemExtent</code>/<code>prototypeItem</code> for fixed-height rows (cheaper layout); make item widgets <code>const</code>/small; avoid <code>shrinkWrap: true</code> on long lists; use <code>AutomaticKeepAliveClientMixin</code> only where needed; paginate data (lazy loading) and use <code>RepaintBoundary</code> for complex rows.<br>
• Avoid expensive widgets in rows (<code>Opacity</code>, <code>ClipRRect</code> on large areas, <code>BackdropFilter</code>, shadows with big blur): they trigger <code>saveLayer</code>.`,
          `ListView.builder(
  itemCount: items.length,
  itemExtent: 72,                                                     // fixed height: skips per-item layout measurement
  cacheExtent: 400,                                                   // pre-build a little off-screen
  itemBuilder: (context, i) {
    final c = items[i];
    return CourseRow(key: ValueKey(c.id), course: c);                 // small, const-friendly row widget
  },
);

// BAD for long lists
// SingleChildScrollView(child: Column(children: items.map(CourseRow.new).toList()))   // builds all rows immediately

class CourseRow extends StatelessWidget {
  const CourseRow({super.key, required this.course});
  final Course course;
  @override
  Widget build(BuildContext context) => ListTile(
        leading: SizedBox(width: 48, height: 48, child: CachedNetworkImage(imageUrl: course.thumb, memCacheWidth: 96, fit: BoxFit.cover)),
        title: Text(course.title, maxLines: 1, overflow: TextOverflow.ellipsis),
      );
}`,
        ),
      ],
      [
        blk(`<h3>Image optimisation and lazy loading</h3>
• Images are the biggest memory and bandwidth cost. <b>Decode at display size</b>: <code>Image.network(url, cacheWidth: 300)</code> / <code>ResizeImage</code> / <code>memCacheWidth</code> in <code>cached_network_image</code> so a 4000 px photo is not decoded fully into memory. Serve <b>appropriately sized, compressed</b> images (WebP/AVIF/JPEG, server-side thumbnails), use <code>cached_network_image</code> for disk/memory caching and placeholders, <code>precacheImage</code> for the next hero, <code>gaplessPlayback</code> to avoid flicker, and vector <code>SVG</code> (<code>flutter_svg</code>) for icons.<br>
• <b>Lazy loading</b>: load data and screens when needed: paginate lists, load tab content when first selected, defer heavy initialisation after the first frame (<code>WidgetsBinding.instance.addPostFrameCallback</code>), <b>deferred components</b> (Android dynamic feature modules) and <code>deferred as</code> libraries on the web.<br>
• Provide <b>placeholder/blur-hash</b> and error widgets for good perceived performance.`,
          `CachedNetworkImage(
  imageUrl: course.imageUrl,
  width: 160, height: 90,
  memCacheWidth: (160 * MediaQuery.devicePixelRatioOf(context)).round(),     // decode at the needed size
  fit: BoxFit.cover,
  placeholder: (_, __) => const ColoredBox(color: Color(0xFFEEEEEE)),
  errorWidget: (_, __, ___) => const Icon(Icons.broken_image),
  fadeInDuration: const Duration(milliseconds: 150),
);

Image.asset('assets/images/hero.webp', cacheWidth: 800);

@override
void didChangeDependencies() {
  super.didChangeDependencies();
  precacheImage(NetworkImage(nextCourse.imageUrl), context);                  // warm the cache for the next screen
}

// do heavy start-up work after the first frame
WidgetsBinding.instance.addPostFrameCallback((_) => ref.read(analyticsProvider).init());

// deferred library (web)
import 'package:app/reports.dart' deferred as reports;
Future<void> openReports() async { await reports.loadLibrary(); Navigator.push(context, MaterialPageRoute(builder: (_) => reports.ReportsPage())); }`,
        ),
      ],
      [
        ['Why use const widgets?', 'A const widget is created once at compile time; when its parent rebuilds Flutter sees the identical instance and skips rebuilding that subtree, saving work.'],
        ['How do you keep a very long list fast?', 'Use a builder constructor so only visible items are built, give items keys, use itemExtent for fixed rows, keep item widgets small/const, paginate the data and avoid shrinkWrap.'],
        ['Why use cacheWidth/memCacheWidth for images?', 'It decodes the image at the size it is displayed instead of its full resolution, drastically reducing memory use and decode time.'],
      ],
    ),
    topic(
      'fl-startup-memory-network-battery',
      'Memory Management, Isolate Computation, App Startup, Network and Battery Optimization',
      [
        blk(`<h3>Memory management and isolate-based computation</h3>
• Dart is garbage collected; you manage <b>references</b>, not memory: dispose controllers, cancel subscriptions/timers, clear listeners, use <b>bounded caches</b> (LRU), keep large lists paged, <code>ImageCache</code> limits (<code>PaintingBinding.instance.imageCache.maximumSizeBytes</code>), and avoid holding <code>BuildContext</code> beyond its lifetime. Watch memory in DevTools; on low-memory devices respond to <code>didHaveMemoryPressure</code>.<br>
• Move CPU-heavy work to an <b>isolate</b> (<code>Isolate.run</code>, <code>compute</code>): JSON parsing of large payloads, sorting/filtering tens of thousands of items, image processing, encryption, report generation, database bulk inserts (Drift supports <code>NativeDatabase.createInBackground</code>). Rule: anything over ~8 ms per call is a candidate.`,
          `// limit the in-memory image cache
void configureImageCache() {
  final cache = PaintingBinding.instance.imageCache;
  cache.maximumSize = 200;                       // images
  cache.maximumSizeBytes = 80 << 20;             // 80 MB
}

class WidgetsObserverHook with WidgetsBindingObserver {
  @override
  void didHaveMemoryPressure() => PaintingBinding.instance.imageCache.clear();      // free memory under pressure
}

// background parse + sort of a big catalogue
Future<List<Course>> loadCatalogue(String json) => Isolate.run(() {
      final list = (jsonDecode(json) as List).map((e) => Course.fromJson(e as Map<String, dynamic>)).toList();
      list.sort((a, b) => a.title.compareTo(b.title));
      return list;
    });

// Drift on a background isolate
final db = AppDatabase(NativeDatabase.createInBackground(File(dbPath)));`,
        ),
      ],
      [
        blk(`<h3>App startup optimisation</h3>
• Measure <b>time to first frame</b> and <b>time to interactive</b> (<code>flutter run --profile --trace-startup</code>, Firebase Performance, Play Console vitals). Targets: cold start under ~2 s on mid-range phones.<br>
• Reduce work before <code>runApp</code>: initialise only what the first screen needs; do the rest <b>after the first frame</b> or lazily (analytics, Crashlytics collection, Remote Config fetch, cache warm-up, SDKs); parallelise independent <code>await</code>s with <code>Future.wait</code>; avoid synchronous disk reads and big JSON parsing on start; show a <b>native splash</b> (<code>flutter_native_splash</code>) and a skeleton UI immediately.<br>
• Keep the app <b>small</b>: <code>--split-per-abi</code> / app bundles, tree shaking icons (<code>--tree-shake-icons</code>), remove unused packages and assets, compress images, analyse with <code>--analyze-size</code>; smaller binaries load faster.`,
          `Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // only what the first screen needs, in parallel
  final results = await Future.wait([
    SharedPreferences.getInstance(),
    Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform),
  ]);

  runApp(ProviderScope(overrides: [sharedPrefsProvider.overrideWithValue(results[0] as SharedPreferences)], child: const App()));

  // everything else after the first frame
  WidgetsBinding.instance.addPostFrameCallback((_) async {
    unawaited(FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(!kDebugMode));
    unawaited(initRemoteConfig());
    unawaited(warmUpCaches());
  });
}

// flutter run --profile --trace-startup       -> build/start_up_info.json (timeToFirstFrameMicros)
// flutter build appbundle --release --analyze-size --target-platform android-arm64`,
        ),
      ],
      [
        blk(`<h3>Network and battery optimisation</h3>
• <b>Network</b>: fewer, smaller requests: <b>pagination</b>, request only needed fields, <b>HTTP caching</b> (ETag/<code>If-None-Match</code>, <code>Cache-Control</code>; <code>dio_cache_interceptor</code>), <b>compression</b> (gzip/Brotli on Spring Boot: <code>server.compression.enabled=true</code>), batch calls or combine endpoints (a "home" endpoint), parallel instead of waterfall requests, debounce search, cancel obsolete requests, retry with backoff, offline-first local cache, image CDN with sizes; use HTTP/2.<br>
• <b>Battery</b>: avoid <b>wake locks</b>, continuous <b>GPS</b>/sensors/animations when not visible, polling (use push/FCM or WebSocket instead), frequent background tasks (use WorkManager with constraints and 15+ minute intervals), large uploads on mobile data (prefer Wi-Fi/charging via constraints), unnecessary rebuilds/repaints; pause timers/streams on <code>AppLifecycleState.paused</code>; use dark mode on OLED; reduce animation frame rate where it does not matter (<code>TickerMode</code>, pause off-screen animations).`,
          `// Dio: conditional requests save bandwidth
dio.interceptors.add(DioCacheInterceptor(options: CacheOptions(
  store: MemCacheStore(maxSize: 10 << 20),
  policy: CachePolicy.request,                      // honour Cache-Control/ETag from the server
  maxStale: const Duration(days: 7),                // serve stale on errors/offline
  hitCacheOnErrorExcept: [401, 403],
)));

// Spring Boot (Java)
// server.compression.enabled=true
// server.compression.mime-types=application/json,text/html,text/css
// @GetMapping("/api/v1/courses/{id}") ResponseEntity<CourseDto> get(@PathVariable long id, WebRequest req) {
//   CourseDto dto = service.get(id);
//   return ResponseEntity.ok().eTag('"' + dto.version() + '"').cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES)).body(dto);
// }
// one aggregated call instead of five:  GET /api/v1/home -> { me, continueLearning, recommended, notifications }

// pause expensive work when the screen/app is not visible
TickerMode(enabled: isVisible, child: const AnimatedBackground());
// location only while tracking, with a coarse filter
Geolocator.getPositionStream(locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium, distanceFilter: 25));`,
        ),
      ],
      [
        ['How do you speed up app startup?', 'Initialise only what the first screen needs before runApp, run independent initialisation in parallel, move everything else after the first frame or lazily, show a native splash, keep the binary small and measure with --trace-startup.'],
        ['When should you use an isolate for performance?', 'For CPU-bound work taking more than a few milliseconds (large JSON parsing, sorting, image or crypto work, bulk database writes) so the UI thread keeps rendering at full frame rate.'],
        ['How can you reduce battery drain?', 'Avoid polling and continuous GPS/sensors, use push instead of polling, schedule background work with constraints, pause timers and animations when not visible and batch network requests.'],
      ],
    ),
  ]),

  fl(17, 'Deployment and DevOps', 'Production', [
    topic(
      'fl-android-ios-builds-signing',
      'Android APK and AAB Builds, iOS Builds and App Signing',
      [
        blk(`<h3>Android builds: APK vs AAB</h3>
• <b>APK</b>: installable package (sideloading, testing, direct distribution). <b>AAB</b> (Android App Bundle): the format <b>required by Google Play</b>; Play generates optimised APKs per device (smaller downloads, split by ABI/density/language).<br>
• Commands: <code>flutter build apk --release</code> (or <code>--split-per-abi</code> for per-architecture APKs), <code>flutter build appbundle --release</code> → <code>build/app/outputs/bundle/release/app-release.aab</code>. Add <code>--obfuscate --split-debug-info=build/symbols</code> (keep symbols for crash reports), <code>--dart-define</code> for config, <code>--flavor prod</code>.<br>
• Before release: set the <b>application id</b> (<code>com.javaschoollab.app</code>), <b>name</b> and <b>icon</b> (<code>flutter_launcher_icons</code>), <b>splash</b> (<code>flutter_native_splash</code>), <b>version</b>, <b>permissions</b> (remove unused), <code>minSdk</code>/<code>targetSdk</code> (Play requires a recent target), and test the <b>release</b> build (behaves differently: minify, no debug).`,
          `# builds
flutter build apk --release --split-per-abi
flutter build appbundle --release --obfuscate --split-debug-info=build/symbols --dart-define=API_URL=https://api.javaschoollab.com
flutter build appbundle --release --flavor prod -t lib/main_prod.dart

# install the release APK to test on a device
flutter install --release
adb install build/app/outputs/flutter-apk/app-arm64-v8a-release.apk

# icons and splash
dart run flutter_launcher_icons
dart run flutter_native_splash:create

// android/app/build.gradle.kts
android {
    namespace = "com.javaschoollab.app"
    defaultConfig { applicationId = "com.javaschoollab.app"; minSdk = 24; targetSdk = 35; versionCode = flutter.versionCode; versionName = flutter.versionName }
    buildTypes { release { isMinifyEnabled = true; isShrinkResources = true; signingConfig = signingConfigs.getByName("release") } }
}`,
        ),
      ],
      [
        blk(`<h3>App signing (Android)</h3>
• Every Android app must be <b>signed</b>. Create an <b>upload keystore</b> once: <code>keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload</code>. Reference it from <code>android/key.properties</code> (<b>never commit</b> the keystore or passwords; add to <code>.gitignore</code>; back them up securely).<br>
• <b>Play App Signing</b> (enabled by default for new apps): you sign the AAB with the <b>upload key</b>; Google holds the <b>app signing key</b> and re-signs the APKs delivered to users. If you lose the upload key you can request a reset; with the old model, losing the key meant you could never update the app.<br>
• Register the <b>SHA-1/SHA-256</b> of the debug, upload and Play app-signing keys with Firebase/Google APIs (Google Sign-In, Maps, App Links).`,
          `# android/key.properties   (NOT committed)
storePassword=********
keyPassword=********
keyAlias=upload
storeFile=/secure/path/upload-keystore.jks

// android/app/build.gradle.kts
val keystoreProperties = Properties().apply {
    val f = rootProject.file("key.properties")
    if (f.exists()) load(FileInputStream(f))
}
android {
    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String?
            keyPassword = keystoreProperties["keyPassword"] as String?
            storeFile = keystoreProperties["storeFile"]?.let { file(it) }
            storePassword = keystoreProperties["storePassword"] as String?
        }
    }
}

# show the certificate fingerprints
keytool -list -v -keystore upload-keystore.jks -alias upload

# .gitignore
# android/key.properties
# *.jks`,
        ),
      ],
      [
        blk(`<h3>iOS builds</h3>
• Requires a <b>Mac</b> with Xcode and an <b>Apple Developer Program</b> membership (annual fee). Steps: set the <b>bundle identifier</b>, team and <b>signing</b> in Xcode (automatic signing is easiest), add capabilities (Push Notifications, Sign in with Apple, Associated Domains), fill <code>Info.plist</code> usage descriptions, set version/build (<code>CFBundleShortVersionString</code>/<code>CFBundleVersion</code> come from <code>pubspec.yaml</code>).<br>
• Build: <code>flutter build ipa --release</code> (or Xcode: Product → Archive), then upload with <b>Xcode Organizer</b>, <code>xcrun altool</code>/<b>Transporter</b>, or CI (Codemagic, fastlane, GitHub Actions on macOS runners).<br>
• Certificates/profiles: <b>Development</b> and <b>Distribution</b> certificates, provisioning profiles, APNs key for push. <b>fastlane match</b> shares signing assets across a team. TestFlight distributes builds to testers.`,
          `# iOS
cd ios && pod install --repo-update && cd ..
flutter build ipa --release --obfuscate --split-debug-info=build/symbols --export-options-plist=ios/ExportOptions.plist

# upload (App Store Connect API key)
xcrun altool --upload-app --type ios -f build/ios/ipa/javaschoollab.ipa --apiKey <KEY_ID> --apiIssuer <ISSUER_ID>

<!-- ios/Runner/Info.plist -->
<key>NSCameraUsageDescription</key><string>Scan QR codes and take profile photos</string>
<key>NSPhotoLibraryUsageDescription</key><string>Choose a profile picture</string>
<key>NSFaceIDUsageDescription</key><string>Unlock the app with Face ID</string>
<key>ITSAppUsesNonExemptEncryption</key><false/>`,
        ),
      ],
      [
        ['APK vs AAB?', 'An APK is a directly installable package; an AAB is the publishing format required by Google Play, from which Play generates optimised APKs for each device, reducing download size.'],
        ['What happens if you lose the upload keystore?', 'With Play App Signing you can ask Google to reset the upload key; without it you could never update the app. Always back up the keystore and passwords securely and never commit them.'],
        ['What do you need to build for iOS?', 'A Mac with Xcode, an Apple Developer account, a bundle identifier with signing certificates and provisioning profiles, then flutter build ipa and an upload to App Store Connect/TestFlight.'],
      ],
    ),
    topic(
      'fl-release-stores-env',
      'Release Configuration, Play Store and App Store Deployment, Environment Configuration',
      [
        blk(`<h3>Release configuration and environments</h3>
• Separate <b>dev</b>, <b>staging</b> and <b>prod</b>: different API URLs, Firebase projects, app ids/names (so all can be installed together) and icons. Mechanisms: <b>flavors</b> (Android product flavors / iOS schemes: <code>flutter run --flavor dev -t lib/main_dev.dart</code>, package <code>flutter_flavorizr</code>), <b><code>--dart-define-from-file=config/prod.json</code></b>, and a typed <code>Env</code> class reading <code>String.fromEnvironment</code>.<br>
• <b>Secrets</b>: never commit them; inject from CI secrets. Remember that anything shipped in the app is visible to users; public identifiers are fine, private keys are not.<br>
• Release checklist: version bump, changelog, remove debug banners/logs, test the release build on real devices, enable obfuscation, verify permissions, privacy policy URL, crash reporting enabled, store assets ready.`,
          `// config/prod.json
// { "API_URL": "https://api.javaschoollab.com", "SENTRY_DSN": "https://...", "ENV": "prod" }

// lib/env.dart
class Env {
  static const apiUrl = String.fromEnvironment('API_URL');
  static const name = String.fromEnvironment('ENV', defaultValue: 'dev');
  static bool get isProd => name == 'prod';
}

// run / build
// flutter run --dart-define-from-file=config/dev.json
// flutter build appbundle --release --dart-define-from-file=config/prod.json --flavor prod

// android/app/build.gradle.kts
// flavorDimensions += "env"
// productFlavors {
//   create("dev")  { dimension = "env"; applicationIdSuffix = ".dev"; resValue("string", "app_name", "JSL Dev") }
//   create("prod") { dimension = "env"; resValue("string", "app_name", "JavaSchoolLab") }
// }`,
        ),
      ],
      [
        blk(`<h3>Google Play Store deployment</h3>
• One-time: <b>Google Play Console</b> developer account (one-time fee), identity verification. For new personal accounts, <b>closed testing with 12+ testers for 14 days</b> is currently required before production.<br>
• Create the app → complete the <b>store listing</b> (title, short and full description, icon 512x512, feature graphic 1024x500, phone screenshots), <b>content rating</b> questionnaire, <b>target audience</b>, <b>Data safety</b> form (what data you collect/share), <b>privacy policy</b> URL, app access instructions (a test login for reviewers), ads declaration.<br>
• Upload the signed <b>AAB</b> to a track: <b>internal testing</b> (instant, up to 100 testers) → <b>closed</b> → <b>open</b> → <b>production</b> with a <b>staged rollout</b> (5% → 20% → 100%). Check <b>pre-launch reports</b> and Android vitals (crash and ANR rates). Review takes hours to days. Updates need a higher <code>versionCode</code>.`,
          `# pubspec.yaml: bump for every upload   version: 1.3.0+14   (versionName 1.3.0, versionCode 14)

# publish from CI with fastlane supply (Google Play API service account)
fastlane supply --aab build/app/outputs/bundle/release/app-release.aab --track internal --json_key play-service-account.json
fastlane supply --track_promote_to production --rollout 0.1 --json_key play-service-account.json   # promote with a 10% staged rollout

# Common rejection reasons
# - missing/incorrect Data safety form or privacy policy
# - permissions not justified (SMS, contacts, background location)
# - crashes on launch on reviewer devices (test the RELEASE build)
# - broken login (provide demo credentials in "App access")
# - targetSdk below Google's current requirement`,
        ),
      ],
      [
        blk(`<h3>Apple App Store deployment</h3>
• Prepare in <b>App Store Connect</b>: create the app record (bundle id), listing (name, subtitle, description, keywords, screenshots for required device sizes, optional preview video), <b>age rating</b>, <b>App Privacy</b> nutrition labels, privacy policy and support URLs, review notes with a demo account.<br>
• Upload the build (Xcode/Transporter/CI) → process → <b>TestFlight</b> (internal testers immediately, external after a quick beta review) → select the build → <b>Submit for Review</b>. Review is typically 24-48 hours. Choose <b>phased release</b> for gradual rollout.<br>
• Frequent rejections: crashes, placeholder content, login needed without a demo account, missing account <b>deletion</b> flow (required if you offer sign-up), <b>Sign in with Apple</b> required when offering other social logins, unjustified permissions/tracking (App Tracking Transparency), payments: digital goods must use <b>in-app purchase</b>, incomplete metadata. Respect Apple's Human Interface Guidelines.`,
          `# Release checklist (both stores)
# [ ] version and build number bumped
# [ ] release build tested on real devices (cold start, login, push, deep links, offline)
# [ ] crash reporting (Crashlytics) enabled and symbols uploaded
# [ ] API pointing to PRODUCTION, debug logging off
# [ ] privacy policy, Data safety / App Privacy forms accurate
# [ ] account deletion available (Apple/Google requirement for apps with sign-up)
# [ ] demo credentials in review notes
# [ ] store screenshots, description, icon, age rating done
# [ ] backend ready for load (Spring Boot scaled, rate limits, monitoring)
# [ ] staged rollout planned, rollback plan (previous build) ready`,
        ),
      ],
      [
        ['How do you manage dev, staging and production configuration in Flutter?', 'Use flavors (separate app ids, names, Firebase projects) together with --dart-define or --dart-define-from-file read through a typed Env class, injecting secrets from CI rather than committing them.'],
        ['What is a staged rollout?', 'Releasing an update to a percentage of users first (for example 10%) and increasing it as crash and vitals metrics stay healthy, so a bad release affects fewer people and can be halted.'],
        ['Why do apps with sign-up need an account deletion feature?', 'Both Google Play and the Apple App Store require that users can initiate deletion of their account and data from within the app (and a web link), as part of privacy policy compliance.'],
      ],
    ),
    topic(
      'fl-cicd-versions-crash',
      'CI/CD Pipelines, Version Management and Crash Monitoring',
      [
        blk(`<h3>Version management</h3>
• <code>version: 1.3.0+14</code> in <code>pubspec.yaml</code>: <b>1.3.0</b> is the user-visible <b>version name</b> (semantic versioning MAJOR.MINOR.PATCH); <b>14</b> is the <b>build number</b> (<code>versionCode</code> on Android, <code>CFBundleVersion</code> on iOS), which must <b>increase on every store upload</b>. Override on the command line: <code>--build-name=1.3.0 --build-number=$GITHUB_RUN_NUMBER</code>.<br>
• Tag releases in Git (<code>v1.3.0</code>), keep a <b>CHANGELOG</b> (Conventional Commits help), and plan <b>forced/recommended updates</b> (Remote Config minimum version, <code>in_app_update</code> on Android, App Store link on iOS) because old app versions keep calling your API: <b>version your API</b> (<code>/api/v1</code>) and stay backward compatible.`,
          `# build with a CI-generated build number
flutter build appbundle --release --build-name=1.3.0 --build-number=$GITHUB_RUN_NUMBER

git tag -a v1.3.0 -m "Offline mode and push notifications"
git push origin v1.3.0

// force update using Remote Config
final installed = Version.parse((await PackageInfo.fromPlatform()).version);
final minimum = Version.parse(FirebaseRemoteConfig.instance.getString('min_version'));
if (installed < minimum) showForceUpdateScreen(storeUrl);

// Android in-app update
final info = await InAppUpdate.checkForUpdate();
if (info.updateAvailability == UpdateAvailability.updateAvailable) await InAppUpdate.performImmediateUpdate();`,
        ),
      ],
      [
        blk(`<h3>CI/CD pipelines</h3>
• <b>CI</b>: on every PR run format check, <code>flutter analyze</code>, tests with coverage, and a build. <b>CD</b>: on tags/merge to main build the signed AAB/IPA and upload to <b>Play internal testing</b> and <b>TestFlight</b>, then promote after QA.<br>
• Tools: <b>GitHub Actions</b> (Android on Linux, iOS on macOS runners), <b>Codemagic</b> (Flutter-focused, handles iOS signing and store publishing), <b>fastlane</b> (lanes for build/sign/upload), <b>Bitrise</b>, <b>Jenkins</b> (self-hosted). Store the keystore (base64), passwords and service-account JSON as <b>encrypted secrets</b>; never print them. Cache pub packages; fail fast.`,
          `# .github/workflows/release-android.yml
name: Release Android
on:
  push: { tags: ['v*'] }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 17 }
      - uses: subosito/flutter-action@v2
        with: { channel: stable, cache: true }
      - run: flutter pub get
      - run: flutter analyze --fatal-infos && flutter test
      - name: Restore signing key
        run: |
          echo "\${{ secrets.UPLOAD_KEYSTORE_BASE64 }}" | base64 --decode > android/upload-keystore.jks
          printf 'storePassword=%s\\nkeyPassword=%s\\nkeyAlias=upload\\nstoreFile=../upload-keystore.jks\\n' "\${{ secrets.KEYSTORE_PASSWORD }}" "\${{ secrets.KEY_PASSWORD }}" > android/key.properties
      - run: flutter build appbundle --release --build-number=\${{ github.run_number }} --dart-define-from-file=config/prod.json --obfuscate --split-debug-info=build/symbols
      - uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: \${{ secrets.PLAY_SERVICE_ACCOUNT_JSON }}
          packageName: com.javaschoollab.app
          releaseFiles: build/app/outputs/bundle/release/app-release.aab
          track: internal
      - uses: actions/upload-artifact@v4
        with: { name: symbols, path: build/symbols }`,
        ),
      ],
      [
        blk(`<h3>Crash monitoring and release health</h3>
• Crashlytics/Sentry give <b>crash-free users/sessions</b>, new vs regressed issues, affected versions/devices and breadcrumbs. Upload <b>obfuscation symbols</b> (<code>firebase crashlytics:symbols:upload</code>, <code>sentry_dart_plugin</code>) from CI so stack traces are readable. Add the <b>release version</b> to every report.<br>
• Also watch <b>Play Console Android vitals</b> (crash rate, ANR rate, startup time, battery) and App Store Connect crash reports; set <b>alerts</b> (a regression after a rollout should page someone), and <b>halt the staged rollout</b> when crash-free sessions drop below your threshold (for example 99.5%).<br>
• Close the loop: triage new issues daily, link them to tickets, ship hotfixes (patch versions) quickly, use Remote Config kill switches for broken features, and monitor the <b>Spring Boot</b> side (Actuator, logs with request ids) so mobile and server errors can be correlated.`,
          `# upload symbols after an obfuscated build (Crashlytics)
firebase crashlytics:symbols:upload --app=1:1234567890:android:abcdef build/symbols

// Sentry alternative
await SentryFlutter.init((options) {
  options.dsn = Env.sentryDsn;
  options.environment = Env.name;
  options.release = 'javaschoollab@\${packageInfo.version}+\${packageInfo.buildNumber}';
  options.tracesSampleRate = 0.1;
}, appRunner: () => runApp(const ProviderScope(child: App())));

// correlate with the backend
dio.options.headers['X-Request-Id'] = const Uuid().v4();          // also logged by Spring Boot
// Spring Boot: put the id in MDC so every log line has it`,
        ),
      ],
      [
        ['What is the difference between version name and build number?', 'The version name (1.3.0) is shown to users and follows semantic versioning; the build number (versionCode/CFBundleVersion) is an integer that must increase with every store upload.'],
        ['Why version the backend API when you ship a mobile app?', 'Installed app versions cannot all be updated at once, so older apps keep calling the API; versioned and backward-compatible endpoints prevent breaking them.'],
        ['Why upload debug symbols for obfuscated builds?', 'Obfuscation renames symbols; without the symbol files crash stack traces in Crashlytics/Sentry are unreadable and hard to debug.'],
      ],
    ),
  ]),

  fl(18, 'Important Flutter Projects', 'Practice', [
    topic(
      'fl-projects-small-apps',
      'Projects 1-5: Calculator, To-Do, Weather, Notes and Expense Tracker',
      [
        blk(`<h3>1. Calculator app (beginner)</h3>
• <b>Skills</b>: layout (<code>GridView</code>/<code>Row</code>/<code>Column</code>), <code>setState</code>, string/number logic, expression parsing, responsive buttons, unit tests.<br>
• <b>Features</b>: digits, <code>+ - × ÷</code>, clear, backspace, decimal, percent, divide-by-zero handling, history. Keep the <b>calculation logic in a pure class</b> (testable) separate from the UI.`,
          `class CalculatorEngine {
  String display = '0';
  double? _left;
  String? _op;
  bool _fresh = true;

  void digit(String d) {
    if (_fresh) { display = d == '.' ? '0.' : d; _fresh = false; return; }
    if (d == '.' && display.contains('.')) return;
    display += d;
  }
  void operator(String op) {
    if (_op != null && !_fresh) equals();
    _left = double.parse(display);
    _op = op;
    _fresh = true;
  }
  void equals() {
    if (_op == null || _left == null) return;
    final right = double.parse(display);
    final result = switch (_op) {
      '+' => _left! + right,
      '-' => _left! - right,
      '×' => _left! * right,
      '÷' => right == 0 ? double.nan : _left! / right,
      _ => right,
    };
    display = result.isNaN ? 'Error' : _format(result);
    _op = null; _left = null; _fresh = true;
  }
  void clear() { display = '0'; _left = null; _op = null; _fresh = true; }
  String _format(double v) => v == v.roundToDouble() ? v.toInt().toString() : v.toStringAsFixed(8).replaceFirst(RegExp(r'0+$'), '');
}

test('adds numbers', () {
  final c = CalculatorEngine()..digit('2')..operator('+')..digit('3')..equals();
  expect(c.display, '5');
});
// UI: GridView.count(crossAxisCount: 4, children: [for (final k in keys) CalcButton(label: k, onTap: () => setState(() => onKey(k)))])`,
        ),
      ],
      [
        blk(`<h3>2. To-Do app and 3. Weather app</h3>
• <b>To-Do (state + persistence)</b>: add, edit, complete, delete (swipe with <code>Dismissible</code>), filter (all/active/done), reorder (<code>ReorderableListView</code>), due dates, persistence with <b>Drift/Hive/SharedPreferences</b>, Riverpod <code>AsyncNotifier</code>, undo SnackBar. Optional: sync with a Spring Boot <code>/api/tasks</code>.<br>
• <b>Weather (API + async)</b>: call a public API (Open-Meteo is free without a key), model JSON, show current + 7-day forecast, search city (geocoding), <b>current location</b> (geolocator), loading/error/empty states, pull-to-refresh, cache last result for offline, unit toggle (°C/°F), icons by weather code.`,
          `// To-Do with Riverpod + Dismissible
class TodoList extends ConsumerWidget {
  const TodoList({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final todos = ref.watch(visibleTodosProvider);
    return ListView.builder(
      itemCount: todos.length,
      itemBuilder: (_, i) {
        final t = todos[i];
        return Dismissible(
          key: ValueKey(t.id),
          background: Container(color: Colors.red, alignment: Alignment.centerRight, padding: const EdgeInsets.only(right: 16), child: const Icon(Icons.delete, color: Colors.white)),
          onDismissed: (_) {
            ref.read(todosProvider.notifier).remove(t.id);
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Text('Task deleted'), action: SnackBarAction(label: 'UNDO', onPressed: () => ref.read(todosProvider.notifier).restore(t))));
          },
          child: CheckboxListTile(value: t.done, onChanged: (_) => ref.read(todosProvider.notifier).toggle(t.id), title: Text(t.title, style: TextStyle(decoration: t.done ? TextDecoration.lineThrough : null))),
        );
      },
    );
  }
}

// Weather: Open-Meteo, no API key
Future<Forecast> fetchForecast(double lat, double lon) async {
  final res = await dio.get<Map<String, dynamic>>('https://api.open-meteo.com/v1/forecast', queryParameters: {
    'latitude': lat, 'longitude': lon, 'current': 'temperature_2m,weather_code,wind_speed_10m',
    'daily': 'temperature_2m_max,temperature_2m_min,weather_code', 'timezone': 'auto',
  });
  return Forecast.fromJson(res.data!);
}`,
        ),
      ],
      [
        blk(`<h3>4. Notes app and 5. Expense tracker</h3>
• <b>Notes (database + search)</b>: create/edit/delete notes with title/body/colour/pinned, full-text search (SQLite FTS5 via Drift), tags, auto-save (debounced), trash/restore, markdown preview, share, backup/export, and a simple sync later.<br>
• <b>Expense tracker (data + charts)</b>: add expenses (amount, category, date, note), monthly totals, <b>charts</b> (<code>fl_chart</code>: pie by category, bar by day), budgets with alerts, filters by month/category, CSV export, currency formatting (<code>intl</code>), recurring expenses (WorkManager/local notifications), Drift with aggregation queries.`,
          `// Expense tracker: Drift aggregation + chart data
class Expenses extends Table {
  IntColumn get id => integer().autoIncrement()();
  RealColumn get amount => real()();
  TextColumn get category => text()();
  DateTimeColumn get date => dateTime()();
  TextColumn get note => text().nullable()();
}

Stream<List<CategoryTotal>> watchTotals(DateTime month) {
  final start = DateTime(month.year, month.month);
  final end = DateTime(month.year, month.month + 1);
  final sum = expenses.amount.sum();
  final query = selectOnly(expenses)
    ..addColumns([expenses.category, sum])
    ..where(expenses.date.isBetweenValues(start, end))
    ..groupBy([expenses.category]);
  return query.watch().map((rows) => [for (final r in rows) CategoryTotal(r.read(expenses.category)!, r.read(sum) ?? 0)]);
}

PieChart(PieChartData(sections: [
  for (final t in totals) PieChartSectionData(value: t.total, title: t.category, radius: 70, color: colorFor(t.category)),
]));

// Notes: debounced auto-save
final _save = Debouncer(const Duration(milliseconds: 600));
void onChanged(String text) => _save(() => repo.update(note.copyWith(body: text, updatedAt: DateTime.now())));`,
        ),
      ],
      [
        ['What does a calculator project teach?', 'Layout with grids, state handling, separating pure business logic from UI, edge cases (decimals, division by zero) and unit testing.'],
        ['Which free weather API needs no key?', 'Open-Meteo provides current and forecast data without an API key; it is ideal for practice projects.'],
        ['How do you build charts for an expense tracker?', 'Aggregate data with SQL group-by queries (Drift) and feed the totals into fl_chart widgets such as PieChart and BarChart.'],
      ],
    ),
    topic(
      'fl-projects-auth-ecommerce',
      'Projects 6-7: Login and Registration App, E-Commerce Application',
      [
        blk(`<h3>6. Login and registration app (with Spring Boot)</h3>
• <b>Skills</b>: forms, validation, Dio, Spring Security JWT, secure storage, token refresh, GoRouter guards, error handling, Riverpod.<br>
• <b>Screens</b>: splash (restore session) → login → register → verify email (optional) → forgot password → home/profile → logout. Features: show/hide password, autofill, biometric re-login, remember me, field-level server errors, loading buttons, deep link for password reset.<br>
• <b>Spring Boot endpoints</b>: <code>/api/auth/register</code>, <code>/login</code>, <code>/refresh</code>, <code>/logout</code>, <code>/forgot-password</code>, <code>/reset-password</code>, <code>/me</code>; BCrypt hashing, validation, rate limiting, refresh-token rotation.`,
          `// Project structure
// lib/features/auth/
//   data/auth_api.dart, auth_repository_impl.dart, token_store.dart
//   domain/user.dart, auth_repository.dart
//   presentation/login_page.dart, register_page.dart, auth_controller.dart
// lib/core/router.dart (redirect), lib/core/dio_provider.dart (AuthInterceptor)

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authControllerProvider);
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      if (auth.isLoading) return '/splash';
      final loggedIn = auth.valueOrNull != null;
      final onAuthPage = const ['/login', '/register', '/forgot'].contains(state.matchedLocation);
      if (!loggedIn && !onAuthPage) return '/login';
      if (loggedIn && (onAuthPage || state.matchedLocation == '/splash')) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashPage()),
      GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterPage()),
      GoRoute(path: '/', builder: (_, __) => const HomeShell()),
    ],
  );
});

// Spring Boot register
// @PostMapping("/api/auth/register") ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest r) {
//   if (users.existsByEmail(r.email())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
//   users.save(new User(r.name(), r.email(), encoder.encode(r.password())));
//   return ResponseEntity.status(HttpStatus.CREATED).build();
// }`,
        ),
      ],
      [
        blk(`<h3>7. E-commerce application</h3>
• <b>Skills</b>: product catalogue (grid + search + filters + pagination), product detail (carousel, variants, reviews), <b>cart</b> (state, quantity, persistence), <b>checkout</b> (address form, shipping, payment), <b>orders</b> history/tracking, wishlist, auth, push notifications for order status, offline cache, deep links to products.<br>
• <b>Payments</b>: never handle raw card data; use a gateway SDK (Razorpay, Stripe, PayPal): the <b>server creates an order/PaymentIntent</b>, the app confirms payment with the SDK, the <b>server verifies the result via webhook</b> (the client's "success" is not proof). Make order creation <b>idempotent</b>.<br>
• <b>Backend (Spring Boot)</b>: products, cart/orders, inventory checks in a transaction (<code>@Transactional</code>, optimistic locking), price computed on the server (never trust client prices), order status workflow, webhooks.`,
          `// Cart state (Riverpod Notifier) persisted locally
class CartNotifier extends Notifier<List<CartLine>> {
  @override
  List<CartLine> build() => ref.read(cartStoreProvider).load();
  void add(Product p, {int qty = 1}) {
    final i = state.indexWhere((l) => l.productId == p.id);
    state = i == -1 ? [...state, CartLine(p.id, p.title, p.price, qty)] : [for (var j = 0; j < state.length; j++) j == i ? state[j].copyWith(qty: state[j].qty + qty) : state[j]];
    ref.read(cartStoreProvider).save(state);
  }
  void remove(int productId) { state = state.where((l) => l.productId != productId).toList(); ref.read(cartStoreProvider).save(state); }
  double get total => state.fold(0, (s, l) => s + l.price * l.qty);     // display only: the server recomputes
}

// Checkout: the server decides the amounts
Future<void> pay() async {
  final order = await api.createOrder(cartLines.map((l) => {'productId': l.productId, 'qty': l.qty}).toList(), addressId, idempotencyKey: orderKey);   // server prices the cart
  final result = await razorpay.openCheckout(orderId: order.gatewayOrderId, amount: order.amount);
  if (result.success) ref.read(ordersProvider.notifier).waitForConfirmation(order.id);   // poll/websocket until the webhook marks it PAID
}

// Spring Boot (Java): never trust client prices
// OrderDto create(CreateOrderRequest r, String user) {
//   List<OrderLine> lines = r.items().stream().map(i -> new OrderLine(products.getOrThrow(i.productId()), i.qty())).toList();   // price from DB
//   lines.forEach(l -> inventory.reserve(l.product().getId(), l.qty()));                                                        // transactional
//   return orders.save(new Order(user, lines)).toDto();
// }`,
        ),
      ],
      [
        blk(`<h3>Screens, architecture and extras</h3>
• Navigation: bottom bar (Home, Categories, Cart, Orders, Profile) with <code>StatefulShellRoute</code>; deep links <code>/products/:id</code>; hero transition from list to detail.<br>
• Architecture: feature folders, repositories, Riverpod, Dio with auth interceptor, Drift cache for catalogue and cart, <code>cached_network_image</code>, skeleton loaders (<code>shimmer</code>), error/empty states.<br>
• Production: analytics funnel (view → add to cart → checkout → purchase), crash reporting, remote config for banners/flags, FCM for order updates, accessibility, localisation (<code>intl</code>, ARB files), tests (cart logic unit tests, widget tests for checkout, integration test for purchase with a fake gateway).`,
          `// Product grid with pagination and skeleton loading
class ProductGrid extends ConsumerWidget {
  const ProductGrid({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(pagedProductsProvider);
    return state.when(
      loading: () => GridView.count(crossAxisCount: 2, children: List.generate(6, (_) => const ProductSkeleton())),
      error: (e, _) => ErrorView(message: '$e', onRetry: () => ref.invalidate(pagedProductsProvider)),
      data: (s) => GridView.builder(
        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(maxCrossAxisExtent: 220, childAspectRatio: 0.7, mainAxisSpacing: 8, crossAxisSpacing: 8),
        itemCount: s.items.length + (s.hasMore ? 1 : 0),
        itemBuilder: (_, i) {
          if (i >= s.items.length) { Future.microtask(() => ref.read(pagedProductsProvider.notifier).loadMore()); return const Center(child: CircularProgressIndicator()); }
          return ProductCard(product: s.items[i], onTap: () => context.push('/products/\${s.items[i].id}'));
        },
      ),
    );
  }
}

await FirebaseAnalytics.instance.logPurchase(transactionId: order.id.toString(), value: order.total, currency: 'INR', items: [for (final l in order.lines) AnalyticsEventItem(itemId: '\${l.productId}', quantity: l.qty)]);`,
        ),
      ],
      [
        ['Why must the server compute prices in an e-commerce app?', 'Clients can be modified, so any price, discount or total sent by the app is untrusted. The server must look up prices and compute totals from its own data.'],
        ['How should payments be confirmed?', 'The server creates the payment order, the app completes it with the gateway SDK, and the server confirms the final status through the gateway webhook; the client\'s success callback alone is not proof of payment.'],
        ['What should the login app do on start?', 'Show a splash while restoring the session from secure storage and calling /api/me, then route to home if valid or to login if not, using router redirects.'],
      ],
    ),
    topic(
      'fl-projects-chat-quiz-lms',
      'Projects 8-10: Chat Application, Online Quiz Application and Learning Management System',
      [
        blk(`<h3>8. Chat application</h3>
• <b>Skills</b>: real-time streams, message list UI, optimistic sending, presence/typing, media messages, push notifications, offline queue.<br>
• <b>Backends</b>: <b>Firebase</b> (Firestore listeners + FCM + Storage; quickest) or <b>Spring Boot WebSocket/STOMP</b> (own server; integrates with your user database). Features: 1-1 and group chats, unread counts, read receipts, image sharing, message pagination (older messages on scroll), reconnect, notifications when backgrounded, end-to-end encryption (advanced).<br>
• UI: reversed <code>ListView</code> (<code>reverse: true</code>) so new messages appear at the bottom; message bubbles aligned by sender; auto-scroll when at bottom; date separators.`,
          `// Spring Boot STOMP (Java)
// @Configuration @EnableWebSocketMessageBroker class WsConfig implements WebSocketMessageBrokerConfigurer {
//   public void configureMessageBroker(MessageBrokerRegistry r) { r.enableSimpleBroker("/topic", "/queue"); r.setApplicationDestinationPrefixes("/app"); }
//   public void registerStompEndpoints(StompEndpointRegistry r) { r.addEndpoint("/ws").setAllowedOriginPatterns("*"); }
// }
// @Controller class ChatController {
//   @MessageMapping("/chat.send") void send(ChatMessage m, Principal user) { svc.save(m, user); template.convertAndSend("/topic/rooms." + m.roomId(), m); }
// }

// Flutter (stomp_dart_client)
final client = StompClient(config: StompConfig(
  url: 'wss://api.javaschoollab.com/ws',
  stompConnectHeaders: {'Authorization': 'Bearer $token'},
  onConnect: (frame) => client.subscribe(destination: '/topic/rooms.$roomId', callback: (f) => _messages.add(ChatMessage.fromJson(jsonDecode(f.body!)))),
  reconnectDelay: const Duration(seconds: 3),
));
client.activate();
client.send(destination: '/app/chat.send', body: jsonEncode({'roomId': roomId, 'text': text, 'clientId': const Uuid().v4()}));

// UI: newest at the bottom
ListView.builder(reverse: true, itemCount: messages.length, itemBuilder: (_, i) => Bubble(message: messages[messages.length - 1 - i]));`,
        ),
      ],
      [
        blk(`<h3>9. Online quiz application</h3>
• <b>Skills</b>: state machines, timers, animations, scoring, API + local fallback, charts.<br>
• <b>Flow</b>: choose course/topic → load questions (random N, difficulty) → one question per screen (<code>PageView</code> or state-driven) with a <b>countdown timer</b> (<code>Timer.periodic</code>/<code>TweenAnimationBuilder</code>) → answer feedback → results (score, time, correct/incorrect review, share) → leaderboard and history.<br>
• <b>Design</b>: model quiz state as a <b>sealed class</b> (<code>NotStarted</code>, <code>InProgress(index, answers, remaining)</code>, <code>Finished(score)</code>); keep scoring on the <b>server</b> for fairness (the app sends answers, the server returns the score; never ship correct answers in the payload for graded quizzes); anti-cheating basics (time limit enforced server-side, shuffle options, one attempt).`,
          `sealed class QuizState { const QuizState(); }
class QuizLoading extends QuizState { const QuizLoading(); }
class QuizRunning extends QuizState {
  const QuizRunning({required this.questions, required this.index, required this.answers, required this.secondsLeft});
  final List<Question> questions;
  final int index;
  final Map<int, int> answers;             // questionId -> chosen option index
  final int secondsLeft;
  QuizRunning copyWith({int? index, Map<int, int>? answers, int? secondsLeft}) =>
      QuizRunning(questions: questions, index: index ?? this.index, answers: answers ?? this.answers, secondsLeft: secondsLeft ?? this.secondsLeft);
}
class QuizFinished extends QuizState { const QuizFinished(this.result); final QuizResult result; }

class QuizController extends AutoDisposeNotifier<QuizState> {
  Timer? _timer;
  @override
  QuizState build() { ref.onDispose(() => _timer?.cancel()); return const QuizLoading(); }

  Future<void> start(int quizId) async {
    final questions = await ref.read(quizRepositoryProvider).questions(quizId);
    state = QuizRunning(questions: questions, index: 0, answers: {}, secondsLeft: 30);
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
  }
  void _tick() {
    final s = state as QuizRunning;
    if (s.secondsLeft <= 1) { next(); return; }
    state = s.copyWith(secondsLeft: s.secondsLeft - 1);
  }
  void answer(int option) { final s = state as QuizRunning; state = s.copyWith(answers: {...s.answers, s.questions[s.index].id: option}); }
  Future<void> next() async {
    final s = state as QuizRunning;
    if (s.index + 1 < s.questions.length) { state = s.copyWith(index: s.index + 1, secondsLeft: 30); return; }
    _timer?.cancel();
    state = QuizFinished(await ref.read(quizRepositoryProvider).submit(s.answers));     // scored on the server
  }
}`,
        ),
      ],
      [
        blk(`<h3>10. Learning Management System: the JavaSchoolLab mobile app</h3>
• This is the <b>capstone</b>: a Flutter client for the existing JavaSchoolLab platform, reusing its Spring Boot API, accounts and content.<br>
• <b>Features</b>: login (JWT, biometric unlock), <b>course catalogue</b> and search, <b>course detail</b> with modules/topics, <b>lesson reader</b> (render HTML lessons with <code>flutter_widget_from_html</code>, code blocks with syntax highlighting and copy button, offline downloads), <b>progress tracking</b> (mark topics complete, resume where you left off, sync), <b>quizzes</b> and certificates (PDF download/share), <b>bookmarks and notes</b>, <b>dark mode</b>, <b>offline mode</b> (Drift cache, sync queue), <b>push notifications</b> (new lessons, streak reminders via FCM), <b>deep links</b> (<code>/course/java/topic</code>), analytics, crash reporting, localisation.<br>
• <b>Architecture</b>: Flutter + Riverpod + GoRouter + Dio + Drift + secure storage + FCM; Spring Boot (Java 21) REST API with Spring Security JWT, PostgreSQL/MySQL; CI/CD with GitHub Actions to Play internal testing; Crashlytics + Remote Config.`,
          `// lib/ layout of the LMS app
// core/           dio_provider.dart, router.dart, theme.dart, env.dart, failure.dart
// features/auth/       login, register, biometric lock
// features/courses/    catalogue, detail, search (data/domain/presentation)
// features/lessons/    reader, bookmarks, notes
// features/progress/   progress repository, sync service
// features/quizzes/    quiz flow, results
// features/profile/    settings, certificates
// shared/widgets/      app_scaffold, error_view, skeletons, html_view

// Lesson reader: HTML content from the existing API
class LessonReader extends ConsumerWidget {
  const LessonReader({super.key, required this.courseId, required this.topicId});
  final String courseId, topicId;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lesson = ref.watch(lessonProvider((courseId, topicId)));
    return lesson.when(
      loading: () => const LessonSkeleton(),
      error: (e, _) => ErrorView(message: '$e', onRetry: () => ref.invalidate(lessonProvider((courseId, topicId)))),
      data: (l) => ListView(padding: const EdgeInsets.all(16), children: [
        HtmlWidget(l.html, textStyle: Theme.of(context).textTheme.bodyLarge, customWidgetBuilder: codeBlockBuilder),
        const SizedBox(height: 24),
        FilledButton(onPressed: () => ref.read(progressProvider.notifier).complete(courseId, topicId), child: const Text('Mark as complete')),
      ]),
    );
  }
}

// Progress is local-first and synced
Future<void> complete(String courseId, String topicId) async {
  await db.markTopicDone(courseId, topicId);
  await db.enqueue(PendingActionsCompanion.insert(type: 'progress.complete', payload: jsonEncode({'courseId': courseId, 'topicId': topicId}), clientId: const Uuid().v4(), createdAt: DateTime.now()));
  unawaited(sync.trySync());
}`,
        ),
      ],
      [
        ['How would you design the LMS mobile app\'s offline support?', 'Cache courses and downloaded lessons in a Drift database, read the UI from the database, record progress locally and queue it for sync with idempotent actions, and pull server changes since the last sync.'],
        ['Why score quizzes on the server?', 'The client can be modified, so grading and time limits must be enforced by the backend; the app sends answers and receives the result, and graded questions should not expose correct answers.'],
        ['What technology stack would you use for the JavaSchoolLab Flutter app?', 'Flutter and Dart with Riverpod, GoRouter, Dio, Drift and secure storage, FCM for notifications, talking to the existing Spring Boot REST API with Spring Security JWT and a PostgreSQL/MySQL database, deployed through CI/CD to Google Play.'],
      ],
    ),
  ]),
];

export const flutterRoadmap4: SubTopic[] = [...flutterRoadmap4Base, ...flutterExamples];
