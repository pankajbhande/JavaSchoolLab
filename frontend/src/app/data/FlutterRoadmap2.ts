// Flutter roadmap, part 2: sections 5-9 (state management, navigation, forms, API integration, asynchronous programming).
// Dart string interpolation "${...}" is written as "\${...}" inside these template literals; "$name" needs no escape.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const fl = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('fl', n, title, priority, topics);

export const flutterRoadmap2: SubTopic[] = [
  fl(5, 'State Management', 'Essential', [
    topic(
      'fl-state-basics',
      'setState, InheritedWidget, ChangeNotifier and ValueNotifier',
      [
        blk(`<h3>What is state?</h3>
• <b>State</b> is any data that can change while the app runs and affects what the UI shows. Flutter is <b>declarative</b>: UI = f(state). You change the state and Flutter rebuilds the UI.<br>
• <b>Ephemeral (local) state</b> belongs to one widget (current tab, a toggle, text field content, animation progress): use <code>StatefulWidget</code> + <code>setState</code>. <b>App state</b> is shared by many screens or survives them (logged-in user, cart, settings, fetched data): use a state-management solution.<br>
• <code>setState(() { ... })</code> marks the widget dirty and schedules a rebuild of <b>that widget and its subtree</b>; keep the rebuilt subtree small.`,
          `class CounterPage extends StatefulWidget {
  const CounterPage({super.key});
  @override State<CounterPage> createState() => _CounterPageState();
}
class _CounterPageState extends State<CounterPage> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('$_count', style: Theme.of(context).textTheme.displayMedium)),
      floatingActionButton: FloatingActionButton(
        onPressed: () => setState(() => _count++),                  // rebuilds this State's build()
        child: const Icon(Icons.add),
      ),
    );
  }
}`,
        ),
      ],
      [
        blk(`<h3>InheritedWidget: the foundation</h3>
• An <b>InheritedWidget</b> exposes data to <b>all descendants</b> without passing it through constructors. Descendants call <code>context.dependOnInheritedWidgetOfExactType&lt;T&gt;()</code> (usually wrapped in <code>T.of(context)</code>) and are <b>rebuilt automatically</b> when the widget's data changes (<code>updateShouldNotify</code>).<br>
• <code>Theme</code>, <code>MediaQuery</code>, <code>Navigator</code> and <b>Provider/Riverpod</b> are built on this idea. You rarely write one by hand, but it explains how <code>Theme.of(context)</code> works.`,
          `class AppConfig extends InheritedWidget {
  const AppConfig({super.key, required this.apiBaseUrl, required super.child});
  final String apiBaseUrl;

  static AppConfig of(BuildContext context) {
    final result = context.dependOnInheritedWidgetOfExactType<AppConfig>();
    assert(result != null, 'No AppConfig found in context');
    return result!;
  }
  @override
  bool updateShouldNotify(AppConfig old) => apiBaseUrl != old.apiBaseUrl;   // rebuild dependents only if it changed
}

void main() => runApp(const AppConfig(apiBaseUrl: 'https://api.javaschoollab.com', child: MyApp()));

// anywhere below:
final url = AppConfig.of(context).apiBaseUrl;`,
        ),
      ],
      [
        blk(`<h3>ChangeNotifier and ValueNotifier</h3>
• <b>ChangeNotifier</b> is a plain Dart class with <code>notifyListeners()</code>: a simple observable model. Listen with <code>ListenableBuilder</code>/<code>AnimatedBuilder</code> (built in) or via Provider's <code>ChangeNotifierProvider</code>.<br>
• <b>ValueNotifier&lt;T&gt;</b> is a ChangeNotifier holding one value (<code>value = x</code> notifies); rebuild just the part that cares with <code>ValueListenableBuilder</code>: excellent for small, local reactive values without a package.<br>
• Always <code>dispose()</code> notifiers you create; keep notifiers free of <code>BuildContext</code> and UI code so they are testable.`,
          `class CartModel extends ChangeNotifier {
  final List<CartItem> _items = [];
  List<CartItem> get items => List.unmodifiable(_items);
  double get total => _items.fold(0, (sum, i) => sum + i.price * i.qty);

  void add(CartItem item) {
    _items.add(item);
    notifyListeners();                                   // tell listeners to rebuild
  }
  void remove(int id) {
    _items.removeWhere((i) => i.id == id);
    notifyListeners();
  }
}

final cart = CartModel();

Widget cartBadge() => ListenableBuilder(                // rebuilds only this subtree
      listenable: cart,
      builder: (context, _) => Badge(label: Text('\${cart.items.length}'), child: const Icon(Icons.shopping_cart)),
    );

final ValueNotifier<int> unread = ValueNotifier(0);
Widget unreadText() => ValueListenableBuilder<int>(
      valueListenable: unread,
      builder: (context, value, child) => Text('$value unread'),
    );
// unread.value++;     // rebuilds just the Text`,
        ),
      ],
      [
        ['What is the difference between ephemeral and app state?', 'Ephemeral state is local to one widget (a toggle, current tab) and fits StatefulWidget/setState. App state is shared across screens or must persist (user, cart, settings) and belongs in a state-management solution.'],
        ['What is InheritedWidget?', 'A widget that makes data available to all descendants and rebuilds those that depend on it when the data changes. Theme, MediaQuery and Provider are built on it.'],
        ['ChangeNotifier vs ValueNotifier?', 'ChangeNotifier is a general observable class that calls notifyListeners() after changes; ValueNotifier is a ChangeNotifier that holds a single value and notifies when it is assigned.'],
      ],
    ),
    topic(
      'fl-provider-riverpod',
      'Provider and Riverpod',
      [
        blk(`<h3>Provider</h3>
• <b>Provider</b> (package <code>provider</code>) wraps InheritedWidget with a simple API: <code>ChangeNotifierProvider</code> at the top of the tree, then <code>context.watch&lt;T&gt;()</code> (rebuild on change), <code>context.read&lt;T&gt;()</code> (one-off access, use in callbacks), <code>context.select</code> (rebuild only when a selected field changes), <code>Consumer&lt;T&gt;</code>.<br>
• Good for small/medium apps. Limits: dependency on <code>BuildContext</code>, runtime (not compile-time) errors for missing providers, awkward for async data and combining providers.`,
          `void main() => runApp(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => CartModel()),
          Provider(create: (_) => ApiClient()),
        ],
        child: const App(),
      ),
    );

class CartButton extends StatelessWidget {
  const CartButton({super.key, required this.course});
  final Course course;
  @override
  Widget build(BuildContext context) {
    final count = context.select<CartModel, int>((c) => c.items.length);        // rebuild only when the count changes
    return FilledButton(
      onPressed: () => context.read<CartModel>().add(CartItem.from(course)),    // read in callbacks, not watch
      child: Text('Add ($count in cart)'),
    );
  }
}`,
        ),
      ],
      [
        blk(`<h3>Riverpod</h3>
• <b>Riverpod</b> (by the author of Provider) is <b>compile-safe, context-independent and testable</b>. State lives in <b>providers</b> declared as global (but immutable) variables inside a <code>ProviderScope</code>. Widgets become <code>ConsumerWidget</code>/<code>ConsumerStatefulWidget</code> and use <code>ref.watch</code> (rebuild), <code>ref.read</code> (callbacks), <code>ref.listen</code> (side effects like snackbars).<br>
• Provider types: <code>Provider</code> (computed/read-only), <code>StateProvider</code> (simple value), <code>NotifierProvider</code>/<code>AsyncNotifierProvider</code> (state + methods; modern), <code>FutureProvider</code>/<code>StreamProvider</code> (async data with built-in loading/error states), <code>.family</code> (parameters), <code>.autoDispose</code> (free state when unused), <code>riverpod_generator</code> annotations.`,
          `// providers.dart
final dioProvider = Provider<Dio>((ref) => Dio(BaseOptions(baseUrl: 'https://api.javaschoollab.com')));

final courseRepositoryProvider = Provider((ref) => CourseRepository(ref.watch(dioProvider)));

final coursesProvider = FutureProvider.autoDispose<List<Course>>((ref) {
  return ref.watch(courseRepositoryProvider).fetchAll();               // loading / data / error handled by AsyncValue
});

final courseProvider = FutureProvider.autoDispose.family<Course, int>((ref, id) {
  return ref.watch(courseRepositoryProvider).fetch(id);
});

class CounterNotifier extends Notifier<int> {
  @override
  int build() => 0;
  void increment() => state++;                                         // assigning state notifies listeners
}
final counterProvider = NotifierProvider<CounterNotifier, int>(CounterNotifier.new);

// ui
void main() => runApp(const ProviderScope(child: App()));

class CourseListPage extends ConsumerWidget {
  const CourseListPage({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courses = ref.watch(coursesProvider);
    return courses.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, st) => Center(child: Text('Failed: $e')),
      data: (list) => RefreshIndicator(
        onRefresh: () => ref.refresh(coursesProvider.future),
        child: ListView(children: [for (final c in list) ListTile(title: Text(c.title))]),
      ),
    );
  }
}`,
        ),
      ],
      [
        blk(`<h3>Riverpod in a real feature: AsyncNotifier and testing</h3>
• <b>AsyncNotifier</b> loads data in <code>build()</code> and exposes mutation methods (<code>add</code>, <code>remove</code>) that update <code>state</code> with <code>AsyncValue.guard</code>, giving loading/error handling for free; combine with optimistic updates.<br>
• <b>Overrides</b> make testing trivial: <code>ProviderScope(overrides: [courseRepositoryProvider.overrideWithValue(fake)])</code> in widget tests, or <code>ProviderContainer</code> for unit tests without widgets.<br>
• Rules: do not <code>ref.watch</code> inside callbacks (use <code>read</code>); do not store providers' state in widgets; keep UI dumb.`,
          `class TasksNotifier extends AsyncNotifier<List<Task>> {
  @override
  Future<List<Task>> build() => ref.watch(taskRepositoryProvider).fetchAll();

  Future<void> add(String title) async {
    state = const AsyncLoading<List<Task>>().copyWithPrevious(state);      // keep showing old data while saving
    state = await AsyncValue.guard(() async {
      final created = await ref.read(taskRepositoryProvider).create(title);
      return [...?state.valueOrNull, created];
    });
  }

  Future<void> toggle(Task task) async {
    final previous = state.valueOrNull ?? [];
    state = AsyncData([for (final t in previous) t.id == task.id ? t.copyWith(done: !t.done) : t]);   // optimistic
    try {
      await ref.read(taskRepositoryProvider).update(task.id, done: !task.done);
    } catch (_) {
      state = AsyncData(previous);                                                                     // roll back
    }
  }
}
final tasksProvider = AsyncNotifierProvider<TasksNotifier, List<Task>>(TasksNotifier.new);

// widget test with a fake repository
testWidgets('shows tasks', (tester) async {
  await tester.pumpWidget(ProviderScope(
    overrides: [taskRepositoryProvider.overrideWithValue(FakeTaskRepository([Task(1, 'Learn Riverpod')]))],
    child: const MaterialApp(home: TasksPage()),
  ));
  await tester.pumpAndSettle();
  expect(find.text('Learn Riverpod'), findsOneWidget);
});`,
        ),
      ],
      [
        ['Provider vs Riverpod?', 'Riverpod is the successor by the same author: providers are global and compile-safe, independent of BuildContext, support async (FutureProvider/AsyncNotifier), autoDispose, families and easy overrides for tests, so it avoids Provider\'s runtime errors.'],
        ['ref.watch vs ref.read vs ref.listen?', 'watch rebuilds the widget when the provider changes (use in build); read gets the current value once (use in callbacks); listen runs a side effect (navigation, snackbar) on change without rebuilding.'],
        ['What is AsyncValue?', 'A Riverpod type representing loading, data or error for async providers, consumed with when/switch so the UI handles all three states explicitly.'],
      ],
    ),
    topic(
      'fl-bloc-getx-choosing',
      'BLoC, Cubit, GetX, Best Practices and Choosing a Solution',
      [
        blk(`<h3>Cubit</h3>
• <b>BLoC</b> (Business Logic Component) separates UI from logic with <b>streams</b>: the UI sends <b>events</b>/calls methods, the logic emits <b>states</b>, the UI rebuilds from them. Package: <code>flutter_bloc</code> (+ <code>bloc</code>, <code>equatable</code>).<br>
• <b>Cubit</b> is the simple form: a class extending <code>Cubit&lt;State&gt;</code> with methods that call <code>emit(newState)</code>. Use it for most features.<br>
• Model the state as an immutable class or a <b>sealed class hierarchy</b> (<code>Initial</code>, <code>Loading</code>, <code>Loaded</code>, <code>Failure</code>) and switch over it exhaustively. UI: <code>BlocProvider</code> (create), <code>BlocBuilder</code> (rebuild), <code>BlocListener</code> (side effects), <code>BlocConsumer</code>, <code>context.read</code>.`,
          `sealed class CoursesState extends Equatable {
  const CoursesState();
  @override List<Object?> get props => [];
}
class CoursesInitial extends CoursesState { const CoursesInitial(); }
class CoursesLoading extends CoursesState { const CoursesLoading(); }
class CoursesLoaded extends CoursesState {
  const CoursesLoaded(this.courses);
  final List<Course> courses;
  @override List<Object?> get props => [courses];
}
class CoursesFailure extends CoursesState {
  const CoursesFailure(this.message);
  final String message;
  @override List<Object?> get props => [message];
}

class CoursesCubit extends Cubit<CoursesState> {
  CoursesCubit(this._repo) : super(const CoursesInitial());
  final CourseRepository _repo;

  Future<void> load() async {
    emit(const CoursesLoading());
    try {
      emit(CoursesLoaded(await _repo.fetchAll()));
    } on ApiException catch (e) {
      emit(CoursesFailure(e.message));
    }
  }
}

class CoursesPage extends StatelessWidget {
  const CoursesPage({super.key});
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (ctx) => CoursesCubit(ctx.read<CourseRepository>())..load(),
      child: BlocBuilder<CoursesCubit, CoursesState>(
        builder: (context, state) => switch (state) {
          CoursesInitial() || CoursesLoading() => const Center(child: CircularProgressIndicator()),
          CoursesLoaded(:final courses) => ListView(children: [for (final c in courses) ListTile(title: Text(c.title))]),
          CoursesFailure(:final message) => Center(child: Text(message)),
        },
      ),
    );
  }
}`,
        ),
      ],
      [
        blk(`<h3>BLoC with events, and GetX</h3>
• A full <b>Bloc</b> receives <b>events</b> (<code>on&lt;LoadCourses&gt;(handler)</code>) and emits states; it gives traceability (every event is logged by <code>BlocObserver</code>), event transformers (<code>debounce</code>, <code>droppable</code>, <code>restartable</code> via <code>bloc_concurrency</code>) and is common in large teams. More boilerplate than Cubit.<br>
• <b>GetX</b> bundles state management (<code>.obs</code>, <code>Obx</code>, <code>GetxController</code>), navigation without context (<code>Get.to</code>) and dependency injection (<code>Get.put</code>). It is quick to write, but mixes concerns, hides dependencies, uses a lot of "magic" and has had maintenance concerns: prefer Riverpod or BLoC for serious apps; know GetX because you will meet it in existing projects.`,
          `// Bloc with events and a debounced search
sealed class SearchEvent {}
class QueryChanged extends SearchEvent { QueryChanged(this.query); final String query; }

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc(this._repo) : super(const SearchState.initial()) {
    on<QueryChanged>(_onQuery, transformer: restartable());                     // newer events cancel older work
  }
  final CourseRepository _repo;

  Future<void> _onQuery(QueryChanged e, Emitter<SearchState> emit) async {
    if (e.query.length < 2) { emit(const SearchState.initial()); return; }
    emit(const SearchState.loading());
    await Future<void>.delayed(const Duration(milliseconds: 300));              // debounce
    try { emit(SearchState.results(await _repo.search(e.query))); }
    catch (err) { emit(SearchState.error('$err')); }
  }
}
// context.read<SearchBloc>().add(QueryChanged(text));

// GetX style (for recognition)
class CounterController extends GetxController {
  final count = 0.obs;
  void increment() => count.value++;
}
// Obx(() => Text('\${Get.find<CounterController>().count}'))`,
        ),
      ],
      [
        blk(`<h3>Best practices and choosing the right solution</h3>
• <b>Best practices</b>: keep UI free of business logic; one source of truth; immutable state (<code>copyWith</code>, <code>freezed</code>, records); rebuild as little as possible (<code>select</code>, small widgets); handle loading/error/empty explicitly; dispose resources; inject repositories (testable); do not use global mutable singletons; do not put <code>BuildContext</code> in state classes; separate <b>UI state</b> from <b>server state/cache</b>.<br>
• A layered structure: <b>presentation</b> (widgets + controllers/notifiers/cubits) → <b>domain</b> (entities, use cases/repository interfaces) → <b>data</b> (API, database, DTOs).
<table ${TABLE}>
<tr><th>Solution</th><th>Strength</th><th>Weakness</th><th>Choose when</th></tr>
<tr><td><code>setState</code></td><td>Built in, trivial</td><td>Local only</td><td>One widget's state</td></tr>
<tr><td>Provider</td><td>Simple, official-ish</td><td>Context-bound, runtime errors</td><td>Small/medium apps, existing codebases</td></tr>
<tr><td>Riverpod</td><td>Compile-safe, async, testable, flexible</td><td>New concepts (refs, families)</td><td>Most new apps; recommended</td></tr>
<tr><td>BLoC/Cubit</td><td>Strict structure, traceable events, great for big teams</td><td>More boilerplate</td><td>Large teams, complex flows, strict architecture</td></tr>
<tr><td>GetX</td><td>Very little code</td><td>Magic, mixes concerns, maintenance risk</td><td>Prototypes; legacy projects</td></tr>
</table>
• <b>For JavaSchoolLab: Riverpod (or BLoC).</b> Pick one, use it consistently, and write the repository layer so the choice stays replaceable.`,
          `// Layered structure
// lib/features/courses/
//   data/       course_dto.dart, course_api.dart, course_repository_impl.dart
//   domain/     course.dart (entity), course_repository.dart (interface)
//   presentation/ courses_page.dart, courses_notifier.dart, widgets/

abstract interface class CourseRepository {
  Future<List<Course>> fetchAll();
}
class CourseRepositoryImpl implements CourseRepository {
  CourseRepositoryImpl(this._api, this._db);
  final CourseApi _api;
  final CourseDao _db;
  @override
  Future<List<Course>> fetchAll() async {
    try {
      final dtos = await _api.list();
      await _db.replaceAll(dtos);
      return dtos.map((d) => d.toDomain()).toList();
    } on DioException {
      return (await _db.all()).map((d) => d.toDomain()).toList();      // offline fallback
    }
  }
}

// immutable state with copyWith (or the freezed package)
class FilterState {
  const FilterState({this.query = '', this.level});
  final String query;
  final Level? level;
  FilterState copyWith({String? query, Level? level}) => FilterState(query: query ?? this.query, level: level ?? this.level);
}`,
        ),
      ],
      [
        ['Cubit vs Bloc?', 'A Cubit exposes methods that call emit(state) and is simpler. A Bloc receives events and maps them to states through event handlers, which adds traceability and event transformers (debounce, restartable) at the cost of more boilerplate.'],
        ['Why is GetX often discouraged for large apps?', 'It mixes state, navigation and DI in a global, implicit way that hides dependencies and hinders testing and maintenance; Riverpod or BLoC give clearer structure.'],
        ['How do you choose a state-management solution?', 'Use setState for local state; for app state choose Riverpod (flexible, testable, async-friendly) or BLoC/Cubit (strict structure for big teams); keep the choice behind repositories and be consistent across the app.'],
      ],
    ),
  ]),

  fl(6, 'Navigation and Routing', 'Core', [
    topic(
      'fl-navigator-routes',
      'Navigator, Named Routes, Passing and Returning Data',
      [
        blk(`<h3>Navigator 1.0: the route stack</h3>
• <b>Navigator</b> manages a <b>stack of routes</b> (screens). <code>Navigator.push(context, route)</code> adds a screen; <code>Navigator.pop(context)</code> removes the top one (the Android back button and iOS swipe do the same). <code>pushReplacement</code>, <code>pushAndRemoveUntil</code> (clear history after login), <code>popUntil</code>, <code>maybePop</code>.<br>
• <code>MaterialPageRoute</code> builds the platform-appropriate transition. Each screen is a normal widget (usually a <code>Scaffold</code>).`,
          `// go to a screen
Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CourseDetailPage()));

// go back
Navigator.of(context).pop();

// after login: replace the whole stack so Back does not return to the login screen
Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const HomePage()), (route) => false);

// replace the current screen
Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const OnboardingDone()));`,
        ),
      ],
      [
        blk(`<h3>Named routes and passing data</h3>
• <b>Named routes</b>: <code>MaterialApp(routes: {'/': ..., '/course': ...})</code> or <code>onGenerateRoute</code> (needed for arguments and unknown routes); navigate with <code>Navigator.pushNamed(context, '/course', arguments: ...)</code>. Named routes are simple for small apps but lack type safety and web/deep-link support: <b>GoRouter</b> is recommended for real apps.<br>
• <b>Pass data</b> by constructor: <code>CourseDetailPage(course: course)</code> (type-safe, preferred), or via route <code>arguments</code> read with <code>ModalRoute.of(context)!.settings.arguments</code>.<br>
• Pass an <b>id</b> (and reload from the repository) rather than a large object when the screen can be opened by URL or notification.`,
          `class CourseDetailPage extends StatelessWidget {
  const CourseDetailPage({super.key, required this.course});
  final Course course;                                           // data via the constructor: type-safe
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: Text(course.title)), body: const Placeholder());
}
// Navigator.push(context, MaterialPageRoute(builder: (_) => CourseDetailPage(course: course)));

MaterialApp(
  initialRoute: '/',
  routes: {'/': (_) => const HomePage(), '/settings': (_) => const SettingsPage()},
  onGenerateRoute: (settings) {
    if (settings.name == '/course') {
      final id = settings.arguments as int;
      return MaterialPageRoute(builder: (_) => CourseDetailLoader(id: id), settings: settings);
    }
    return null;
  },
  onUnknownRoute: (_) => MaterialPageRoute(builder: (_) => const NotFoundPage()),
);
// Navigator.pushNamed(context, '/course', arguments: 42);`,
        ),
      ],
      [
        blk(`<h3>Returning data from a screen</h3>
• <code>Navigator.push</code> returns a <b>Future</b> that completes when the pushed route is popped; <code>Navigator.pop(context, result)</code> supplies the result. Use it for pickers, confirmations and edit screens.<br>
• Check <code>context.mounted</code> after <code>await</code>. Intercept the back gesture with <code>PopScope</code> (replaces <code>WillPopScope</code>) to warn about unsaved changes.`,
          `Future<void> pickLevel(BuildContext context) async {
  final level = await Navigator.of(context).push<Level>(
    MaterialPageRoute(builder: (_) => const LevelPickerPage()),
  );
  if (level != null && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Selected \${level.name}')));
  }
}

class LevelPickerPage extends StatelessWidget {
  const LevelPickerPage({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Choose level')),
        body: ListView(children: [
          for (final l in Level.values) ListTile(title: Text(l.name), onTap: () => Navigator.of(context).pop(l)),   // return a result
        ]),
      );
}

// Warn about unsaved changes on back
PopScope(
  canPop: !hasUnsavedChanges,
  onPopInvokedWithResult: (didPop, result) async {
    if (didPop) return;
    final leave = await confirmDiscard(context);
    if (leave == true && context.mounted) Navigator.of(context).pop();
  },
  child: const EditorPage(),
);`,
        ),
      ],
      [
        ['How do you return data from a screen?', 'Await Navigator.push<T>(...), which completes with the value passed to Navigator.pop(context, value) on the second screen (null if closed without a result).'],
        ['Why are named routes not enough for big apps?', 'They are string-based, lack type safety and typed parameters, and handle deep links and web URLs poorly. GoRouter or Router 2.0 solve this declaratively.'],
        ['How do you prevent going back with unsaved changes?', 'Wrap the screen in PopScope with canPop false when dirty, handle onPopInvokedWithResult, ask the user to confirm, then pop manually.'],
      ],
    ),
    topic(
      'fl-gorouter-deeplinks',
      'GoRouter, Route Guards, Deep Linking and Nested Navigation',
      [
        blk(`<h3>GoRouter basics</h3>
• <b>GoRouter</b> (<code>go_router</code>, maintained by the Flutter team) is a <b>declarative, URL-based</b> router built on Navigator 2.0: routes have paths with parameters, the stack is derived from the URL, and it supports deep links, web URLs, redirects, nested navigation and typed routes.<br>
• <code>context.go('/courses/5')</code> navigates (replaces the stack to match the URL); <code>context.push('/courses/5')</code> pushes on top; <code>context.pop()</code>. Path parameters <code>:id</code> via <code>state.pathParameters</code>; query parameters via <code>state.uri.queryParameters</code>; <code>extra</code> passes an object (not restored on web/deep link).`,
          `final router = GoRouter(
  initialLocation: '/',
  debugLogDiagnostics: true,
  routes: [
    GoRoute(path: '/', name: 'home', builder: (_, __) => const HomePage()),
    GoRoute(
      path: '/courses',
      builder: (_, __) => const CoursesPage(),
      routes: [
        GoRoute(
          path: ':id',                                           // /courses/5
          name: 'course',
          builder: (_, state) => CourseDetailPage(id: int.parse(state.pathParameters['id']!), tab: state.uri.queryParameters['tab']),
        ),
      ],
    ),
    GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
  ],
  errorBuilder: (_, state) => NotFoundPage(location: state.uri.toString()),
);

MaterialApp.router(routerConfig: router, theme: buildTheme(Brightness.light));

// navigation
context.go('/courses');
context.push('/courses/5?tab=reviews');
context.goNamed('course', pathParameters: {'id': '5'}, queryParameters: {'tab': 'reviews'});
context.pop();`,
        ),
      ],
      [
        blk(`<h3>Route guards with redirect</h3>
• A <b>redirect</b> runs before navigation and returns a new location (or <code>null</code> to continue). Use it as a <b>route guard</b>: send unauthenticated users to <code>/login</code> and authenticated users away from it. Rebuild the router when auth changes with <code>refreshListenable</code> (a <code>ChangeNotifier</code>/stream adapter) or by watching an auth provider.<br>
• Remember the intended destination (<code>?from=/courses/5</code>) and return after login. Role checks (<code>/admin</code>) belong in redirects, but <b>the server must enforce them</b>; client guards are only usability.`,
          `final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authStateProvider);                      // rebuilds the router when auth changes

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final loggedIn = auth.valueOrNull != null;
      final goingToLogin = state.matchedLocation == '/login';
      if (!loggedIn && !goingToLogin) return '/login?from=\${Uri.encodeComponent(state.uri.toString())}';
      if (loggedIn && goingToLogin) return state.uri.queryParameters['from'] ?? '/';
      if (state.matchedLocation.startsWith('/admin') && auth.valueOrNull?.role != 'ADMIN') return '/forbidden';
      return null;                                                // no redirect
    },
    routes: [ /* ... */ ],
  );
});
// MaterialApp.router(routerConfig: ref.watch(routerProvider))`,
        ),
      ],
      [
        blk(`<h3>Deep linking and nested navigation (ShellRoute)</h3>
• <b>Deep links</b> open the app at a specific screen from a URL: <b>Android App Links</b> (<code>https://app.javaschoollab.com/courses/5</code> verified through <code>assetlinks.json</code>, <code>android:autoVerify="true"</code> intent filter), <b>iOS Universal Links</b> (<code>apple-app-site-association</code>), custom schemes (<code>javaschoollab://</code>). With GoRouter the path simply matches a route; notifications can carry the same path.<br>
• <b>Nested navigation</b>: <code>ShellRoute</code> / <code>StatefulShellRoute.indexedStack</code> keeps a persistent shell (bottom bar) while each tab keeps its <b>own navigation stack and state</b>.<br>
• Test links: <code>adb shell am start -a android.intent.action.VIEW -d "https://app.javaschoollab.com/courses/5"</code>.`,
          `final router = GoRouter(
  routes: [
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) => ScaffoldWithNavBar(navigationShell: navigationShell),
      branches: [
        StatefulShellBranch(routes: [GoRoute(path: '/home', builder: (_, __) => const HomeTab())]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/courses', builder: (_, __) => const CoursesTab(), routes: [
            GoRoute(path: ':id', builder: (_, s) => CourseDetailPage(id: int.parse(s.pathParameters['id']!))),
          ]),
        ]),
        StatefulShellBranch(routes: [GoRoute(path: '/profile', builder: (_, __) => const ProfileTab())]),
      ],
    ),
  ],
);

class ScaffoldWithNavBar extends StatelessWidget {
  const ScaffoldWithNavBar({super.key, required this.navigationShell});
  final StatefulNavigationShell navigationShell;
  @override
  Widget build(BuildContext context) => Scaffold(
        body: navigationShell,                                    // each branch keeps its own stack
        bottomNavigationBar: NavigationBar(
          selectedIndex: navigationShell.currentIndex,
          onDestinationSelected: (i) => navigationShell.goBranch(i, initialLocation: i == navigationShell.currentIndex),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.menu_book_outlined), label: 'Courses'),
            NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
          ],
        ),
      );
}

<!-- android/app/src/main/AndroidManifest.xml -->
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW"/>
  <category android:name="android.intent.category.DEFAULT"/>
  <category android:name="android.intent.category.BROWSABLE"/>
  <data android:scheme="https" android:host="app.javaschoollab.com" android:pathPrefix="/courses"/>
</intent-filter>`,
        ),
      ],
      [
        ['What does GoRouter add over Navigator.push?', 'Declarative URL-based routing: typed path/query parameters, deep links and web URLs, redirects (guards), nested navigation with shell routes and a consistent back stack derived from the URL.'],
        ['How do you protect routes in GoRouter?', 'Use the redirect callback (with refreshListenable or an auth provider) to send unauthenticated users to /login and return them afterwards; the server still enforces authorisation.'],
        ['What is a StatefulShellRoute?', 'A shell (such as a bottom navigation bar) around several branches, each preserving its own navigation stack and state when you switch tabs.'],
      ],
    ),
    topic(
      'fl-bottom-tab-navigation',
      'Bottom Navigation and Tab Navigation',
      [
        blk(`<h3>Bottom navigation</h3>
• Material 3 uses <b><code>NavigationBar</code></b> with <b><code>NavigationDestination</code></b> items (3-5 top-level destinations); older apps use <code>BottomNavigationBar</code>. Keep tab state with <code>IndexedStack</code> (all tabs stay alive) or <code>PageStorageKey</code>/<code>AutomaticKeepAliveClientMixin</code>.<br>
• Each tab often needs its <b>own navigator stack</b> so Back stays inside the tab: use <code>StatefulShellRoute</code> in GoRouter or nested <code>Navigator</code>s.<br>
• On wide screens switch to <code>NavigationRail</code>.`,
          `class MainShell extends StatefulWidget {
  const MainShell({super.key});
  @override State<MainShell> createState() => _MainShellState();
}
class _MainShellState extends State<MainShell> {
  int _index = 0;
  final _pages = const [HomeTab(), CoursesTab(), ProfileTab()];

  @override
  Widget build(BuildContext context) => Scaffold(
        body: IndexedStack(index: _index, children: _pages),       // keeps scroll positions and state
        bottomNavigationBar: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: (i) => setState(() => _index = i),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.menu_book_outlined), selectedIcon: Icon(Icons.menu_book), label: 'Courses'),
            NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
          ],
        ),
      );
}`,
        ),
      ],
      [
        blk(`<h3>Tab navigation</h3>
• <b>TabBar + TabBarView</b> inside a <code>DefaultTabController</code> (or a <code>TabController</code> with <code>SingleTickerProviderStateMixin</code>) gives swipeable tabs below an AppBar: for sections within one screen (Overview, Lessons, Reviews).<br>
• Preserve a tab's scroll position with <code>AutomaticKeepAliveClientMixin</code> (<code>wantKeepAlive =&gt; true</code>) or <code>PageStorageKey</code>.<br>
• Lazy-load heavy tab content; tabs are built when first shown.`,
          `class CourseDetailTabs extends StatelessWidget {
  const CourseDetailTabs({super.key});
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Flutter Essentials'),
          bottom: const TabBar(tabs: [Tab(text: 'Overview'), Tab(text: 'Lessons'), Tab(text: 'Reviews')]),
        ),
        body: const TabBarView(children: [OverviewTab(), LessonsTab(), ReviewsTab()]),
      ),
    );
  }
}

class LessonsTab extends StatefulWidget {
  const LessonsTab({super.key});
  @override State<LessonsTab> createState() => _LessonsTabState();
}
class _LessonsTabState extends State<LessonsTab> with AutomaticKeepAliveClientMixin {
  @override bool get wantKeepAlive => true;                       // keep scroll position when switching tabs
  @override
  Widget build(BuildContext context) {
    super.build(context);                                         // required by the mixin
    return ListView.builder(itemCount: 40, itemBuilder: (_, i) => ListTile(title: Text('Lesson \${i + 1}')));
  }
}`,
        ),
      ],
      [
        blk(`<h3>Combining navigation patterns</h3>
• Typical app: <b>bottom bar</b> for top-level areas → inside a tab a <b>stack</b> (list → detail) → inside a detail screen <b>TabBar</b> sections; modal flows (login, checkout) pushed above the shell with <code>parentNavigatorKey: rootNavigatorKey</code>.<br>
• Handle Android <b>back</b>: from a tab's first screen the back button should go to the first tab, then exit (<code>PopScope</code>).<br>
• Show badges (<code>Badge</code>) for unread counts and set <code>labelBehavior</code> for compact bars.`,
          `// Show a full-screen flow above the bottom bar
GoRoute(
  path: '/checkout',
  parentNavigatorKey: rootNavigatorKey,                           // covers the shell, hides the bottom bar
  builder: (_, __) => const CheckoutPage(),
);

PopScope(
  canPop: _index == 0,
  onPopInvokedWithResult: (didPop, _) { if (!didPop) setState(() => _index = 0); },   // back goes to the first tab, then exits
  child: Scaffold(/* ... */),
);

NavigationDestination(
  icon: Badge(label: Text('3'), child: Icon(Icons.notifications_outlined)),
  label: 'Alerts',
);`,
        ),
      ],
      [
        ['IndexedStack vs creating pages on demand for tabs?', 'IndexedStack keeps all tab widgets (and their state/scroll) alive at the cost of memory and upfront build; building on demand saves resources but loses state unless you use keep-alive mixins or storage keys.'],
        ['How do you keep a separate navigation stack per bottom tab?', 'Use StatefulShellRoute.indexedStack in GoRouter (each branch has its own stack) or nested Navigator widgets with their own keys.'],
        ['TabBar vs NavigationBar?', 'NavigationBar (bottom) switches between top-level destinations of the app; TabBar (usually under the AppBar) switches between sections of one screen.'],
      ],
    ),
  ]),

  fl(7, 'Forms and Validation', 'Core', [
    topic(
      'fl-form-basics',
      'TextField, TextEditingController, Form, GlobalKey and FocusNode',
      [
        blk(`<h3>TextField and TextFormField</h3>
• <b>TextField</b> is the basic text input; <b>TextFormField</b> is a TextField that integrates with a <b><code>Form</code></b> (validation, save, reset). Configure with <code>InputDecoration</code> (label, hint, prefix/suffix icons, errorText, border), <code>keyboardType</code>, <code>textInputAction</code>, <code>obscureText</code> (password), <code>maxLength</code>, <code>inputFormatters</code>, <code>autofillHints</code>, <code>autocorrect</code>.<br>
• Callbacks: <code>onChanged</code>, <code>onSubmitted</code>, <code>onEditingComplete</code>, <code>onTap</code>.`,
          `TextField(
  decoration: const InputDecoration(
    labelText: 'Email',
    hintText: 'you@example.com',
    prefixIcon: Icon(Icons.email_outlined),
    border: OutlineInputBorder(),
  ),
  keyboardType: TextInputType.emailAddress,
  textInputAction: TextInputAction.next,                   // keyboard "next" button
  autofillHints: const [AutofillHints.email],
  onChanged: (value) => print(value),
);

TextField(
  obscureText: true,
  enableSuggestions: false,
  autocorrect: false,
  decoration: InputDecoration(labelText: 'Password', suffixIcon: IconButton(icon: const Icon(Icons.visibility), onPressed: () {})),
);

TextField(
  keyboardType: TextInputType.number,
  inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(6)],
  decoration: const InputDecoration(labelText: 'PIN code'),
);`,
        ),
      ],
      [
        blk(`<h3>TextEditingController and FocusNode</h3>
• A <b>TextEditingController</b> reads and sets the text (<code>controller.text</code>), selection and listens to changes. Create it in <code>initState</code> (or as a field) and <b>always <code>dispose()</code></b> it. Do not create controllers in <code>build()</code>.<br>
• A <b>FocusNode</b> controls and observes keyboard focus: <code>requestFocus()</code>, <code>unfocus()</code>, listen for focus changes (validate on blur), move focus between fields (<code>FocusScope.of(context).nextFocus()</code>, <code>textInputAction</code> + <code>onFieldSubmitted</code>). Dispose it too.<br>
• Dismiss the keyboard on outside tap with <code>GestureDetector(onTap: () =&gt; FocusScope.of(context).unfocus())</code>.`,
          `class SearchBox extends StatefulWidget {
  const SearchBox({super.key, required this.onSearch});
  final ValueChanged<String> onSearch;
  @override State<SearchBox> createState() => _SearchBoxState();
}
class _SearchBoxState extends State<SearchBox> {
  final _controller = TextEditingController();
  final _focus = FocusNode();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      _debounce?.cancel();
      _debounce = Timer(const Duration(milliseconds: 300), () => widget.onSearch(_controller.text.trim()));
    });
    _focus.addListener(() { if (!_focus.hasFocus) debugPrint('left the field'); });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => TextField(
        controller: _controller,
        focusNode: _focus,
        decoration: InputDecoration(
          hintText: 'Search courses',
          suffixIcon: IconButton(icon: const Icon(Icons.clear), onPressed: () { _controller.clear(); _focus.requestFocus(); }),
        ),
      );
}`,
        ),
      ],
      [
        blk(`<h3>Form widget and GlobalKey</h3>
• <b><code>Form</code></b> groups several <code>TextFormField</code>s (and other <code>FormField</code>s such as <code>DropdownButtonFormField</code>). A <b><code>GlobalKey&lt;FormState&gt;</code></b> gives access to the form's state from outside: <code>validate()</code> runs every field's validator and returns <code>true</code> if all pass, <code>save()</code> calls each <code>onSaved</code>, <code>reset()</code> restores initial values.<br>
• <code>autovalidateMode</code>: <code>disabled</code> (default), <code>always</code>, <code>onUserInteraction</code> (best UX: validate after the user touches a field).<br>
• A GlobalKey must be created once per form (keep it in the State, not in <code>build</code>).`,
          `class RegisterForm extends StatefulWidget {
  const RegisterForm({super.key});
  @override State<RegisterForm> createState() => _RegisterFormState();
}
class _RegisterFormState extends State<RegisterForm> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _passwordFocus = FocusNode();
  bool _submitting = false;

  @override
  void dispose() { _email.dispose(); _password.dispose(); _passwordFocus.dispose(); super.dispose(); }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;           // runs all validators, shows errors
    setState(() => _submitting = true);
    try {
      await context.read<AuthRepository>().register(_email.text.trim(), _password.text);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => Form(
        key: _formKey,
        autovalidateMode: AutovalidateMode.onUserInteraction,
        child: Column(children: [
          TextFormField(
            controller: _email,
            decoration: const InputDecoration(labelText: 'Email'),
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            onFieldSubmitted: (_) => _passwordFocus.requestFocus(),
            validator: (v) => (v == null || !v.contains('@')) ? 'Enter a valid email' : null,
          ),
          TextFormField(
            controller: _password,
            focusNode: _passwordFocus,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Password'),
            validator: (v) => (v == null || v.length < 8) ? 'At least 8 characters' : null,
            onFieldSubmitted: (_) => _submit(),
          ),
          const SizedBox(height: 16),
          FilledButton(onPressed: _submitting ? null : _submit, child: Text(_submitting ? 'Saving...' : 'Register')),
        ]),
      );
}`,
        ),
      ],
      [
        ['TextField vs TextFormField?', 'TextFormField wraps a TextField as a FormField so it takes part in a Form: validator, onSaved, autovalidateMode and form.validate()/save()/reset(). Plain TextField has no validation integration.'],
        ['Why must you dispose a TextEditingController?', 'It holds listeners and resources; if not disposed it leaks memory. Create it in initState (not build) and dispose it in dispose().'],
        ['What does the GlobalKey<FormState> do?', 'Gives access to the Form\'s state from anywhere, so you can call validate(), save() and reset() (for example in a submit button handler).'],
      ],
    ),
    topic(
      'fl-form-validation-inputs',
      'Validation, Dropdowns, Checkboxes, Radio Buttons and Pickers',
      [
        blk(`<h3>Validation</h3>
• A <b>validator</b> is a function <code>String? Function(String?)</code>: return <code>null</code> when valid or the error message. Put rules in reusable functions and compose them. Match the UX: validate on interaction, show specific messages, focus the first invalid field.<br>
• Also validate <b>on the server</b> and map server errors (400/422) back to fields with <code>InputDecoration.errorText</code> or a form-level message.<br>
• Packages: <code>form_builder_validators</code>, <code>formz</code>; keep simple rules inline.`,
          `typedef Validator = String? Function(String?);

Validator required([String message = 'Required']) => (v) => (v == null || v.trim().isEmpty) ? message : null;
Validator minLength(int n) => (v) => (v != null && v.length < n) ? 'At least $n characters' : null;
Validator email() => (v) => RegExp(r'^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$').hasMatch(v ?? '') ? null : 'Enter a valid email';
Validator compose(List<Validator> rules) => (v) {
      for (final rule in rules) {
        final error = rule(v);
        if (error != null) return error;                           // first failing rule wins
      }
      return null;
    };

TextFormField(validator: compose([required(), email()]));
TextFormField(validator: compose([required(), minLength(8)]), obscureText: true);

// confirm password needs the other field
TextFormField(
  validator: (v) => v != _password.text ? 'Passwords do not match' : null,
);

// server-side error shown on the field
String? _serverEmailError;
TextFormField(decoration: InputDecoration(labelText: 'Email', errorText: _serverEmailError));`,
        ),
      ],
      [
        blk(`<h3>Dropdowns, checkboxes, radio buttons and switches</h3>
• <b>DropdownButtonFormField&lt;T&gt;</b> (or Material 3 <code>DropdownMenu&lt;T&gt;</code>): <code>items</code>, <code>value</code>, <code>onChanged</code>, <code>validator</code>. Use an <code>enum</code> or model as <code>T</code>.<br>
• <b>Checkbox</b>/<b>CheckboxListTile</b>: <code>value</code> (<code>bool?</code>), <code>onChanged</code>. <b>Switch</b>/<b>SwitchListTile</b> for on/off settings. <b>Radio</b>/<b>RadioListTile</b> (group with <code>groupValue</code>), or the newer <code>RadioGroup</code>; <b>SegmentedButton</b> for small option sets; <b>FilterChip</b>/<b>ChoiceChip</b> for tags.<br>
• To validate a checkbox (terms accepted) wrap it in a <code>FormField&lt;bool&gt;</code>.`,
          `enum Level { beginner, intermediate, advanced }

class PreferencesForm extends StatefulWidget {
  const PreferencesForm({super.key});
  @override State<PreferencesForm> createState() => _PreferencesFormState();
}
class _PreferencesFormState extends State<PreferencesForm> {
  Level? _level;
  bool _newsletter = true;
  String _plan = 'free';
  bool _terms = false;

  @override
  Widget build(BuildContext context) => Column(children: [
        DropdownButtonFormField<Level>(
          value: _level,
          decoration: const InputDecoration(labelText: 'Level'),
          items: [for (final l in Level.values) DropdownMenuItem(value: l, child: Text(l.name))],
          onChanged: (v) => setState(() => _level = v),
          validator: (v) => v == null ? 'Choose a level' : null,
        ),
        SwitchListTile(title: const Text('Email newsletter'), value: _newsletter, onChanged: (v) => setState(() => _newsletter = v)),
        RadioGroup<String>(
          groupValue: _plan,
          onChanged: (v) => setState(() => _plan = v ?? 'free'),
          child: const Column(children: [
            RadioListTile<String>(title: Text('Free'), value: 'free'),
            RadioListTile<String>(title: Text('Pro'), value: 'pro'),
          ]),
        ),
        FormField<bool>(
          initialValue: _terms,
          validator: (v) => v == true ? null : 'You must accept the terms',
          builder: (state) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            CheckboxListTile(title: const Text('I accept the terms'), value: state.value, onChanged: (v) => state.didChange(v)),
            if (state.hasError) Padding(padding: const EdgeInsets.only(left: 16), child: Text(state.errorText!, style: TextStyle(color: Theme.of(context).colorScheme.error))),
          ]),
        ),
      ]);
}`,
        ),
      ],
      [
        blk(`<h3>Date and time pickers</h3>
• <code>showDatePicker</code>, <code>showTimePicker</code>, <code>showDateRangePicker</code> return a <code>Future</code> with the chosen value (or <code>null</code> if cancelled). Format with the <code>intl</code> package (<code>DateFormat('dd MMM yyyy').format(date)</code>).<br>
• Make a read-only <code>TextFormField</code> that opens the picker on tap so it fits the form and validation.<br>
• Store dates as <b>UTC ISO-8601 strings</b> in JSON and convert to local time for display.`,
          `class DateField extends StatefulWidget {
  const DateField({super.key, required this.onChanged});
  final ValueChanged<DateTime> onChanged;
  @override State<DateField> createState() => _DateFieldState();
}
class _DateFieldState extends State<DateField> {
  final _controller = TextEditingController();
  DateTime? _date;

  Future<void> _pick() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _date ?? now,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 2),
    );
    if (picked == null) return;
    setState(() => _date = picked);
    _controller.text = DateFormat('dd MMM yyyy').format(picked);
    widget.onChanged(picked);
  }

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) => TextFormField(
        controller: _controller,
        readOnly: true,
        onTap: _pick,
        decoration: const InputDecoration(labelText: 'Start date', suffixIcon: Icon(Icons.calendar_today)),
        validator: (_) => _date == null ? 'Pick a date' : null,
      );
}

final time = await showTimePicker(context: context, initialTime: TimeOfDay.now());
final range = await showDateRangePicker(context: context, firstDate: DateTime(2026), lastDate: DateTime(2027));
final iso = DateTime.now().toUtc().toIso8601String();            // send to the API`,
        ),
      ],
      [
        ['How do you validate a checkbox in a Form?', 'Wrap it in a FormField<bool> with a validator and a builder that shows the checkbox and the error text; the form\'s validate() then includes it.'],
        ['When should validation run?', 'AutovalidateMode.onUserInteraction gives good UX: each field validates after the user touches it, and the whole form validates on submit; always validate again on the server.'],
        ['How do you handle dates between Flutter and Spring Boot?', 'Send and receive ISO-8601 strings (UTC), parse with DateTime.parse and format for display with intl; Spring serialises java.time types as ISO strings when configured.'],
      ],
    ),
    topic(
      'fl-form-file-upload',
      'File Upload Forms',
      [
        blk(`<h3>Picking a file or image</h3>
• Pick documents with <code>file_picker</code> (<code>FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['pdf'])</code>) and photos with <code>image_picker</code> (gallery or camera). They return a path/bytes plus name and size.<br>
• Validate before uploading: allowed type, <b>maximum size</b>, count; show a preview (<code>Image.file</code>, file name and size).<br>
• Permissions: gallery access on recent Android/iOS needs the system photo picker or scoped permissions (see Device Features).`,
          `Future<PlatformFile?> pickPdf() async {
  final result = await FilePicker.platform.pickFiles(
    type: FileType.custom,
    allowedExtensions: ['pdf', 'png', 'jpg'],
    withData: false,
  );
  final file = result?.files.single;
  if (file == null) return null;
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) throw const FormatException('File must be under 5 MB');
  return file;                                                  // file.path, file.name, file.size
}

final picker = ImagePicker();
final XFile? photo = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1600, imageQuality: 85);`,
        ),
      ],
      [
        blk(`<h3>Uploading with multipart and progress</h3>
• Send files as <b><code>multipart/form-data</code></b>: with Dio use <code>FormData</code> and <code>MultipartFile.fromFile</code> (streams from disk, so large files do not fill memory); <code>onSendProgress</code> gives progress for a <code>LinearProgressIndicator</code>; <code>CancelToken</code> allows cancel.<br>
• Include other form fields in the same <code>FormData</code>. The Spring Boot side uses <code>@RequestPart MultipartFile file</code>; set <code>spring.servlet.multipart.max-file-size</code>.<br>
• Handle failure and retry; for big uploads consider chunked/resumable uploads or pre-signed URLs to object storage.`,
          `Future<AvatarDto> uploadAvatar(File file, {required void Function(double) onProgress, CancelToken? cancel}) async {
  final form = FormData.fromMap({
    'description': 'Profile photo',
    'file': await MultipartFile.fromFile(file.path, filename: 'avatar.jpg', contentType: DioMediaType('image', 'jpeg')),
  });
  final res = await dio.post<Map<String, dynamic>>(
    '/api/users/me/avatar',
    data: form,
    cancelToken: cancel,
    onSendProgress: (sent, total) => onProgress(total <= 0 ? 0 : sent / total),
  );
  return AvatarDto.fromJson(res.data!);
}

// Spring Boot (Java)
// @PostMapping(value = "/api/users/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
// AvatarDto upload(@RequestPart("file") MultipartFile file, @RequestParam String description, Authentication auth) {
//   if (file.getSize() > 5_000_000 || !List.of("image/jpeg", "image/png").contains(file.getContentType())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
//   return service.saveAvatar(auth.getName(), file);
// }
// application.properties: spring.servlet.multipart.max-file-size=5MB`,
        ),
      ],
      [
        blk(`<h3>The upload form UI</h3>
• Combine preview, progress, error and a disabled submit button while uploading. Keep the picked file in state; compress images (<code>imageQuality</code>, <code>flutter_image_compress</code>) before upload to save data.<br>
• Do not trust the file name or MIME type on the server; scan and re-validate. Store uploads outside the web root with generated names.`,
          `class AvatarUploader extends StatefulWidget {
  const AvatarUploader({super.key});
  @override State<AvatarUploader> createState() => _AvatarUploaderState();
}
class _AvatarUploaderState extends State<AvatarUploader> {
  File? _file;
  double _progress = 0;
  bool _uploading = false;
  String? _error;
  CancelToken? _cancel;

  Future<void> _pick() async {
    final x = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85, maxWidth: 1200);
    if (x != null) setState(() { _file = File(x.path); _error = null; });
  }

  Future<void> _upload() async {
    setState(() { _uploading = true; _progress = 0; _error = null; });
    _cancel = CancelToken();
    try {
      await context.read<UserApi>().uploadAvatar(_file!, cancel: _cancel, onProgress: (p) => setState(() => _progress = p));
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Uploaded')));
    } on DioException catch (e) {
      setState(() => _error = CancelToken.isCancel(e) ? 'Cancelled' : 'Upload failed. Try again.');
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) => Column(children: [
        if (_file != null) CircleAvatar(radius: 48, backgroundImage: FileImage(_file!)),
        TextButton.icon(onPressed: _uploading ? null : _pick, icon: const Icon(Icons.photo), label: const Text('Choose photo')),
        if (_uploading) LinearProgressIndicator(value: _progress),
        if (_error != null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
        FilledButton(onPressed: _file == null || _uploading ? null : _upload, child: const Text('Upload')),
        if (_uploading) TextButton(onPressed: () => _cancel?.cancel(), child: const Text('Cancel')),
      ]);
}`,
        ),
      ],
      [
        ['How do you upload a file to a Spring Boot API from Flutter?', 'Send multipart/form-data using Dio FormData with MultipartFile.fromFile; on Spring use @RequestPart MultipartFile (and set max-file-size). Show progress with onSendProgress and allow cancel with CancelToken.'],
        ['Why validate file size and type on the client and server?', 'The client gives instant feedback and saves bandwidth; the server must still validate because clients can be bypassed and MIME types or names can be forged.'],
        ['Why use MultipartFile.fromFile instead of reading bytes?', 'It streams the file from disk, so large files do not have to be loaded fully into memory.'],
      ],
    ),
  ]),

  fl(8, 'API and Backend Integration', 'Essential', [
    topic(
      'fl-http-json',
      'HTTP Requests, CRUD and JSON Serialization',
      [
        blk(`<h3>HTTP requests with the http package</h3>
• Add <code>http</code> (<code>flutter pub add http</code>). <code>http.get(Uri.parse(url))</code>, <code>post</code>, <code>put</code>, <code>patch</code>, <code>delete</code> return a <code>Future&lt;http.Response&gt;</code> with <code>statusCode</code>, <code>body</code>, <code>headers</code>.<br>
• Build URIs safely: <code>Uri.https(host, path, queryParameters)</code> (encodes values). Always set <code>Content-Type: application/json</code> and <code>Accept</code>, and <b>check the status code</b>: the Future completes normally for 4xx/5xx.<br>
• <b>Android emulator</b> reaches your PC's localhost at <code>10.0.2.2</code>; iOS simulator at <code>localhost</code>; a real phone needs your LAN IP or a deployed server. Plain HTTP on Android 9+ needs <code>usesCleartextTraffic</code> (debug only); Android needs the <code>INTERNET</code> permission in release manifests.`,
          `import 'dart:convert';
import 'package:http/http.dart' as http;

const baseUrl = 'http://10.0.2.2:8080';        // Android emulator -> host machine

Future<List<Course>> fetchCourses({String q = '', int page = 0}) async {
  final uri = Uri.parse(baseUrl).replace(path: '/api/courses', queryParameters: {'q': q, 'page': '$page', 'size': '10'});
  final res = await http.get(uri, headers: {'Accept': 'application/json'}).timeout(const Duration(seconds: 10));
  if (res.statusCode != 200) throw ApiException('Server returned \${res.statusCode}', statusCode: res.statusCode);
  final json = jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;       // utf8 for non-ASCII text
  return (json['content'] as List).map((e) => Course.fromJson(e as Map<String, dynamic>)).toList();
}

Future<Course> createCourse(CourseRequest r) async {
  final res = await http.post(
    Uri.parse('$baseUrl/api/courses'),
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    body: jsonEncode(r.toJson()),
  );
  if (res.statusCode != 201) throw ApiException('Could not create', statusCode: res.statusCode);
  return Course.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
}`,
        ),
      ],
      [
        blk(`<h3>CRUD: GET, POST, PUT, PATCH, DELETE</h3>
<table ${TABLE}>
<tr><th>Operation</th><th>HTTP</th><th>Spring Boot</th><th>Expected status</th></tr>
<tr><td>Read list / one</td><td>GET /api/courses, /api/courses/5</td><td><code>@GetMapping</code></td><td>200, 404</td></tr>
<tr><td>Create</td><td>POST /api/courses</td><td><code>@PostMapping</code></td><td>201 + Location</td></tr>
<tr><td>Replace</td><td>PUT /api/courses/5</td><td><code>@PutMapping</code></td><td>200</td></tr>
<tr><td>Partial update</td><td>PATCH /api/courses/5</td><td><code>@PatchMapping</code></td><td>200</td></tr>
<tr><td>Delete</td><td>DELETE /api/courses/5</td><td><code>@DeleteMapping</code></td><td>204</td></tr>
</table>
• Put each resource's calls in one <b>API/repository class</b>, return domain models (not raw JSON) and throw typed exceptions.`,
          `class CourseApi {
  CourseApi(this._client, this._base);
  final http.Client _client;
  final String _base;

  Map<String, String> get _json => {'Content-Type': 'application/json', 'Accept': 'application/json'};

  Future<Course> get(int id) async => Course.fromJson(_decode(await _client.get(Uri.parse('$_base/api/courses/$id'), headers: _json)));
  Future<Course> create(CourseRequest r) async => Course.fromJson(_decode(await _client.post(Uri.parse('$_base/api/courses'), headers: _json, body: jsonEncode(r.toJson())), expect: 201));
  Future<Course> replace(int id, CourseRequest r) async => Course.fromJson(_decode(await _client.put(Uri.parse('$_base/api/courses/$id'), headers: _json, body: jsonEncode(r.toJson()))));
  Future<Course> patch(int id, Map<String, Object?> changes) async => Course.fromJson(_decode(await _client.patch(Uri.parse('$_base/api/courses/$id'), headers: _json, body: jsonEncode(changes))));
  Future<void> delete(int id) async { _decode(await _client.delete(Uri.parse('$_base/api/courses/$id'), headers: _json), expect: 204); }

  dynamic _decode(http.Response res, {int expect = 200}) {
    if (res.statusCode != expect) {
      final body = res.body.isEmpty ? null : jsonDecode(utf8.decode(res.bodyBytes));
      throw ApiException(body is Map ? (body['message'] as String? ?? 'Request failed') : 'Request failed', statusCode: res.statusCode);
    }
    return res.body.isEmpty ? null : jsonDecode(utf8.decode(res.bodyBytes));
  }
}`,
        ),
      ],
      [
        blk(`<h3>JSON serialization and deserialization</h3>
• <b>Manual</b>: <code>jsonDecode</code> gives <code>dynamic</code> (<code>Map&lt;String, dynamic&gt;</code>/<code>List</code>); write <code>fromJson</code> factory and <code>toJson</code> methods. Fine for small apps; cast carefully (<code>as String?</code>, <code>(x as num).toDouble()</code>), handle missing/null fields, and parse dates with <code>DateTime.parse</code>.<br>
• <b>Code generation</b>: <code>json_serializable</code> + <code>json_annotation</code> (annotate the class, run <code>dart run build_runner build</code>); <b><code>freezed</code></b> adds immutable models, <code>copyWith</code>, equality and unions; <code>dart_mappable</code> is an alternative. Use <code>@JsonKey(name: 'course_id')</code> for naming differences; Spring's Jackson uses camelCase by default.<br>
• Parse large JSON off the UI thread with <code>compute()</code>/<code>Isolate.run</code>.`,
          `// manual
class Course {
  const Course({required this.id, required this.title, required this.price, this.tags = const [], this.createdAt});
  final int id;
  final String title;
  final double price;
  final List<String> tags;
  final DateTime? createdAt;

  factory Course.fromJson(Map<String, dynamic> json) => Course(
        id: json['id'] as int,
        title: json['title'] as String,
        price: (json['price'] as num).toDouble(),                      // int or double from the server
        tags: (json['tags'] as List<dynamic>? ?? []).cast<String>(),
        createdAt: json['createdAt'] == null ? null : DateTime.parse(json['createdAt'] as String),
      );

  Map<String, dynamic> toJson() => {'id': id, 'title': title, 'price': price, 'tags': tags, 'createdAt': createdAt?.toUtc().toIso8601String()};
}

// generated with json_serializable
// part 'course.g.dart';
// @JsonSerializable(explicitToJson: true)
// class Course {
//   Course({required this.id, required this.title});
//   final int id;
//   @JsonKey(name: 'title') final String title;
//   factory Course.fromJson(Map<String, dynamic> json) => _$CourseFromJson(json);
//   Map<String, dynamic> toJson() => _$CourseToJson(this);
// }
// dart run build_runner build --delete-conflicting-outputs

// off the UI thread for big payloads
final courses = await compute(parseCourses, res.body);
List<Course> parseCourses(String body) => (jsonDecode(body) as List).map((e) => Course.fromJson(e as Map<String, dynamic>)).toList();`,
        ),
      ],
      [
        ['Why must you check statusCode with the http package?', 'The Future completes successfully for any HTTP response, including 404 and 500; only network failures throw. You must inspect statusCode and convert errors to exceptions yourself.'],
        ['How do you reach a localhost Spring Boot server from the Android emulator?', 'Use http://10.0.2.2:8080 (the emulator\'s alias for the host machine); a real device needs the computer\'s LAN IP or a deployed HTTPS server.'],
        ['Manual JSON parsing vs json_serializable?', 'Manual code is fine for small models but error-prone as they grow. json_serializable/freezed generate fromJson/toJson (and immutability, copyWith, equality), reducing boilerplate and typos.'],
      ],
    ),
    topic(
      'fl-dio-errors-pagination',
      'Dio, Error Handling, Loading States and Pagination',
      [
        blk(`<h3>Dio vs http</h3>
• <b>Dio</b> is a powerful HTTP client: base options (<code>baseUrl</code>, timeouts, headers), <b>interceptors</b>, automatic JSON encoding/decoding, <code>FormData</code>/multipart with progress, cancellation (<code>CancelToken</code>), retries (via interceptors), certificate pinning hooks and a typed <code>DioException</code>. The <code>http</code> package is smaller and enough for simple needs.<br>
• Create <b>one configured Dio instance</b> (provided through Riverpod/Provider/get_it) and reuse it. Set <code>validateStatus</code> if you want non-2xx to return instead of throw (default: non-2xx throws a <code>DioException</code> of type <code>badResponse</code>).`,
          `final dio = Dio(BaseOptions(
  baseUrl: const String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:8080'),
  connectTimeout: const Duration(seconds: 10),
  receiveTimeout: const Duration(seconds: 20),
  headers: {'Accept': 'application/json'},
));

final res = await dio.get<Map<String, dynamic>>('/api/courses', queryParameters: {'q': 'flutter', 'page': 0});
print(res.statusCode);
final courses = (res.data!['content'] as List).map((e) => Course.fromJson(e)).toList();

await dio.post('/api/courses', data: {'title': 'Flutter', 'price': 1999});          // JSON encoded automatically
await dio.patch('/api/courses/5', data: {'price': 1499});
await dio.delete('/api/courses/5');`,
        ),
      ],
      [
        blk(`<h3>Error handling</h3>
• <code>DioException.type</code>: <code>connectionTimeout</code>, <code>sendTimeout</code>, <code>receiveTimeout</code>, <code>badResponse</code> (has <code>response.statusCode</code> and body), <code>cancel</code>, <code>connectionError</code> (offline/DNS), <code>badCertificate</code>, <code>unknown</code>.<br>
• Convert them <b>once</b> in the data layer (interceptor or repository) to your own <b>sealed failure types</b> (<code>NetworkFailure</code>, <code>Unauthorized</code>, <code>Validation(fields)</code>, <code>ServerFailure</code>, <code>NotFound</code>) so the UI never sees Dio. Show friendly messages; log technical details.<br>
• <b>Retry</b> idempotent GETs on timeouts/5xx with exponential backoff (<code>dio_smart_retry</code> or a small interceptor).`,
          `sealed class Failure implements Exception {
  const Failure(this.message);
  final String message;
}
class NetworkFailure extends Failure { const NetworkFailure() : super('No connection. Check your internet.'); }
class UnauthorizedFailure extends Failure { const UnauthorizedFailure() : super('Please sign in again.'); }
class NotFoundFailure extends Failure { const NotFoundFailure() : super('Not found.'); }
class ValidationFailure extends Failure {
  const ValidationFailure(this.fields) : super('Please fix the highlighted fields.');
  final Map<String, String> fields;
}
class ServerFailure extends Failure { const ServerFailure() : super('Server problem. Please try again later.'); }

Failure toFailure(DioException e) {
  switch (e.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.receiveTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.connectionError:
      return const NetworkFailure();
    case DioExceptionType.badResponse:
      final code = e.response?.statusCode ?? 0;
      final body = e.response?.data;
      if (code == 401) return const UnauthorizedFailure();
      if (code == 404) return const NotFoundFailure();
      if ((code == 400 || code == 422) && body is Map && body['errors'] is Map) {
        return ValidationFailure(Map<String, String>.from(body['errors'] as Map));
      }
      return const ServerFailure();
    default:
      return const ServerFailure();
  }
}

Future<T> guard<T>(Future<T> Function() call) async {
  try { return await call(); } on DioException catch (e) { throw toFailure(e); }
}`,
        ),
      ],
      [
        blk(`<h3>Loading states and pagination</h3>
• Every request screen has four states: <b>loading</b>, <b>success</b>, <b>empty</b>, <b>error</b> (with a retry button). Use <code>AsyncValue</code> (Riverpod), a sealed state (BLoC) or <code>FutureBuilder</code>. Show skeletons/shimmer instead of blank screens; pull-to-refresh with <code>RefreshIndicator</code>.<br>
• <b>Pagination</b>: use page/size (or cursor) parameters (<code>?page=2&amp;size=20</code>; Spring <code>Pageable</code> returns <code>content</code>, <code>totalPages</code>, <code>last</code>). Load the next page when the user scrolls near the end (<code>ScrollController</code> listener or <code>ListView.builder</code> <code>itemBuilder</code> index check); show a bottom loader; guard against duplicate requests and stop when <code>last</code> is true. The <code>infinite_scroll_pagination</code> package wraps this pattern.`,
          `class PagedCourses extends AsyncNotifier<PagedState> {
  @override
  Future<PagedState> build() async {
    final first = await ref.watch(courseApiProvider).list(page: 0);
    return PagedState(items: first.content, page: 0, hasMore: !first.last);
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || !current.hasMore || current.loadingMore) return;           // no duplicate requests
    state = AsyncData(current.copyWith(loadingMore: true));
    try {
      final next = await ref.read(courseApiProvider).list(page: current.page + 1);
      state = AsyncData(PagedState(items: [...current.items, ...next.content], page: current.page + 1, hasMore: !next.last));
    } catch (e) {
      state = AsyncData(current.copyWith(loadingMore: false, loadMoreError: true));
    }
  }
}

class CourseListView extends ConsumerWidget {
  const CourseListView({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(pagedCoursesProvider);
    return async.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => ErrorView(message: '$e', onRetry: () => ref.invalidate(pagedCoursesProvider)),
      data: (s) => s.items.isEmpty
          ? const Center(child: Text('No courses yet'))
          : RefreshIndicator(
              onRefresh: () => ref.refresh(pagedCoursesProvider.future),
              child: ListView.builder(
                itemCount: s.items.length + (s.hasMore ? 1 : 0),
                itemBuilder: (context, i) {
                  if (i >= s.items.length - 3) Future.microtask(() => ref.read(pagedCoursesProvider.notifier).loadMore());   // near the end
                  if (i == s.items.length) return const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator()));
                  return ListTile(title: Text(s.items[i].title));
                },
              ),
            ),
    );
  }
}`,
        ),
      ],
      [
        ['Dio vs http package?', 'Dio adds interceptors, base options, timeouts, multipart with progress, cancellation and typed exceptions; http is a minimal client. Use Dio for real apps that need auth headers, retries and logging.'],
        ['Where should DioException be converted to user-facing errors?', 'In the data layer (an interceptor or repository wrapper) into your own failure types, so the UI shows friendly messages and never depends on Dio.'],
        ['How do you implement infinite scroll?', 'Track page, hasMore and loading flags; when the list nears its end request the next page, append items, show a bottom loader, prevent duplicate requests and stop when the server says last.'],
      ],
    ),
    topic(
      'fl-spring-boot-integration',
      'Spring Boot REST API Integration and Authentication',
      [
        blk(`<h3>One backend for web and mobile</h3>
• Reuse the existing JavaSchoolLab Spring Boot API: same endpoints, DTOs and Spring Security. Add mobile-specific needs only where required (device token registration for push, versioned endpoints, mobile-friendly pagination).<br>
• <b>Contract</b>: generate an <b>OpenAPI</b> document with <code>springdoc-openapi</code> and generate Dart clients/models (<code>openapi-generator</code> with the <code>dart-dio</code> generator, or <code>chopper</code>/<code>retrofit</code>) to avoid hand-written drift.<br>
• Use consistent JSON: <code>camelCase</code>, ISO-8601 dates, <code>{ status, message, errors }</code> error bodies, and API versioning (<code>/api/v1</code>) because installed apps cannot be updated instantly.`,
          `// Spring Boot (Java): mobile-friendly controller
// @RestController @RequestMapping("/api/v1/courses") @RequiredArgsConstructor
// class CourseController {
//   private final CourseService service;
//   @GetMapping Page<CourseDto> list(@RequestParam(defaultValue = "") String q, @PageableDefault(size = 20) Pageable pageable) { return service.search(q, pageable); }
//   @GetMapping("/{id}") CourseDto get(@PathVariable long id) { return service.get(id); }
// }
// @RestControllerAdvice class ApiErrors {
//   @ExceptionHandler(MethodArgumentNotValidException.class)
//   ResponseEntity<Map<String,Object>> invalid(MethodArgumentNotValidException e) { ... 422 with field errors ... }
// }

// Dart: the matching repository
class CourseRepository {
  CourseRepository(this._dio);
  final Dio _dio;
  Future<Page<Course>> search({String q = '', int page = 0}) => guard(() async {
        final res = await _dio.get<Map<String, dynamic>>('/api/v1/courses', queryParameters: {'q': q, 'page': page, 'size': 20});
        return Page.fromJson(res.data!, Course.fromJson);
      });
}`,
        ),
      ],
      [
        blk(`<h3>Authentication flow with Spring Security</h3>
• Typical mobile flow: <code>POST /api/auth/login</code> with credentials → server returns a short-lived <b>access token</b> (JWT) and a <b>refresh token</b> → the app stores them in <b>secure storage</b> → a Dio <b>interceptor</b> attaches <code>Authorization: Bearer ...</code> → on <code>401</code> the interceptor calls <code>/api/auth/refresh</code> once, retries the original request, otherwise logs out.<br>
• Expose <code>AuthState</code> (unknown, authenticated(user), unauthenticated) from an <b>auth provider</b>; GoRouter redirects use it. On start the app restores the session from storage and calls <code>/api/me</code>.<br>
• Never log tokens or passwords; use HTTPS everywhere.`,
          `class AuthInterceptor extends QueuedInterceptor {
  AuthInterceptor(this._tokens, this._dio, this._onLoggedOut);
  final TokenStore _tokens;
  final Dio _dio;
  final VoidCallback _onLoggedOut;

  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _tokens.accessToken();
    if (token != null && !options.path.startsWith('/api/auth/')) options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final unauthorized = err.response?.statusCode == 401 && !err.requestOptions.path.startsWith('/api/auth/');
    if (!unauthorized) return handler.next(err);
    try {
      final refresh = await _tokens.refreshToken();
      if (refresh == null) throw StateError('no refresh token');
      final res = await _dio.post<Map<String, dynamic>>('/api/auth/refresh', data: {'refreshToken': refresh});
      await _tokens.save(access: res.data!['accessToken'] as String, refresh: res.data!['refreshToken'] as String);
      final retry = await _dio.fetch<dynamic>(err.requestOptions..headers['Authorization'] = 'Bearer \${res.data!['accessToken']}');
      handler.resolve(retry);                                    // the original call succeeds transparently
    } catch (_) {
      await _tokens.clear();
      _onLoggedOut();
      handler.next(err);
    }
  }
}

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(baseUrl: Env.apiUrl));
  dio.interceptors.add(AuthInterceptor(ref.read(tokenStoreProvider), dio, () => ref.invalidate(authProvider)));
  return dio;
});`,
        ),
      ],
      [
        blk(`<h3>Environment, networking details and testing against Spring</h3>
• Pass the base URL with <code>--dart-define=API_URL=https://api.javaschoollab.com</code> and read it with <code>String.fromEnvironment</code>; use flavours (dev/staging/prod) for different backends.<br>
• <b>CORS does not apply to mobile apps</b> (it is a browser rule); it matters only for Flutter Web. Android needs HTTPS in production (cleartext blocked) and the <code>INTERNET</code> permission.<br>
• Test the integration with the Spring Boot server running locally (<code>10.0.2.2</code>), use MockWebServer-style fakes (<code>http_mock_adapter</code>) in tests, and run contract checks against the OpenAPI spec in CI.`,
          `class Env {
  static const apiUrl = String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:8080');
  static const isProd = bool.fromEnvironment('dart.vm.product');
}
// flutter run --dart-define=API_URL=http://192.168.1.20:8080
// flutter build appbundle --dart-define=API_URL=https://api.javaschoollab.com

// android/app/src/main/AndroidManifest.xml
// <uses-permission android:name="android.permission.INTERNET"/>
// <application android:usesCleartextTraffic="true"> ... </application>        <!-- DEBUG ONLY: use src/debug/AndroidManifest.xml -->

// test with a fake adapter
test('maps 422 to ValidationFailure', () async {
  final dio = Dio(BaseOptions(baseUrl: 'http://x'));
  final adapter = DioAdapter(dio: dio)..onPost('/api/auth/register', (s) => s.reply(422, {'errors': {'email': 'Already used'}}));
  expect(() => guard(() => dio.post('/api/auth/register', data: {})), throwsA(isA<ValidationFailure>()));
});`,
        ),
      ],
      [
        ['How does the Flutter app authenticate with Spring Security?', 'Log in to receive a short-lived access token and a refresh token, store them in secure storage, attach the access token with an interceptor, refresh once on 401, and log out if refresh fails; Spring validates tokens and enforces roles.'],
        ['Does CORS affect Flutter mobile apps?', 'No. CORS is enforced by browsers, so it affects only Flutter Web. Mobile apps call the API directly, but still need HTTPS and the INTERNET permission.'],
        ['How do you point the app at different environments?', 'Use --dart-define values (String.fromEnvironment) or flavours to set the API base URL per build, never hard-coding URLs or secrets in source.'],
      ],
    ),
  ]),

  fl(9, 'Asynchronous Programming', 'Core', [
    topic(
      'fl-futures-builders',
      'Futures, async/await, FutureBuilder and Error Handling',
      [
        blk(`<h3>Futures in Flutter</h3>
• Flutter UI runs on one thread; anything slow (network, disk, database) must be async so frames keep rendering at 60/120 fps. A <code>Future&lt;T&gt;</code> completes later with a value or an error; <code>await</code> pauses the <b>function</b>, not the UI.<br>
• <code>Future.wait</code> runs several in parallel; <code>Future.delayed</code> for delays; <code>.timeout()</code>; <code>Completer</code> bridges callback APIs to Futures; <code>unawaited()</code> marks fire-and-forget.<br>
• Do not call async work inside <code>build()</code>: it would restart on every rebuild.`,
          `Future<UserProfile> loadProfile() async {
  final results = await Future.wait([api.me(), api.progress(), api.badges()]);        // parallel
  return UserProfile(user: results[0] as User, progress: results[1] as Progress, badges: results[2] as List<Badge>);
}

Future<String> withRetry(Future<String> Function() call, {int tries = 3}) async {
  for (var attempt = 1; ; attempt++) {
    try {
      return await call().timeout(const Duration(seconds: 8));
    } on TimeoutException {
      if (attempt >= tries) rethrow;
      await Future<void>.delayed(Duration(milliseconds: 300 * attempt * attempt));     // backoff
    }
  }
}

// bridging a callback API
Future<Location> currentLocation() {
  final completer = Completer<Location>();
  locator.onLocation((loc) => completer.complete(loc), onError: completer.completeError);
  return completer.future;
}`,
        ),
      ],
      [
        blk(`<h3>FutureBuilder</h3>
• <code>FutureBuilder&lt;T&gt;</code> builds UI from a Future's <code>AsyncSnapshot</code> (<code>connectionState</code>, <code>hasData</code>, <code>hasError</code>, <code>data</code>, <code>error</code>). <b>Create the Future once</b> (in <code>initState</code> or a field), never inline in <code>build</code>, or each rebuild restarts the request.<br>
• Handle all branches: waiting, error, data, empty. For app-wide data prefer a state-management solution (Riverpod <code>FutureProvider</code>), which also caches and shares results.`,
          `class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});
  @override State<ProfilePage> createState() => _ProfilePageState();
}
class _ProfilePageState extends State<ProfilePage> {
  late Future<UserProfile> _future;

  @override
  void initState() {
    super.initState();
    _future = loadProfile();                                   // created ONCE
  }

  void _retry() => setState(() => _future = loadProfile());

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<UserProfile>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) return const Center(child: CircularProgressIndicator());
        if (snapshot.hasError) return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Text('Error: \${snapshot.error}'), TextButton(onPressed: _retry, child: const Text('Retry'))]));
        final profile = snapshot.data!;
        return ListTile(title: Text(profile.user.name), subtitle: Text('\${profile.badges.length} badges'));
      },
    );
  }
}

// WRONG: a new Future on every rebuild
// FutureBuilder(future: loadProfile(), builder: ...)`,
        ),
      ],
      [
        blk(`<h3>Error handling in async code</h3>
• <code>try/catch</code> around <code>await</code>; <code>on SpecificException</code>; always use <code>finally</code> to reset loading flags. A Future error that nobody handles is reported as an <b>unhandled exception</b>.<br>
• <b>Global handlers</b>: <code>FlutterError.onError</code> (framework errors in build/layout) and <code>PlatformDispatcher.instance.onError</code> (async errors) feed a crash reporter (Crashlytics/Sentry); <code>runZonedGuarded</code> was the older way.<br>
• Do not swallow errors silently; log with context and show a user-friendly message. Check <code>mounted</code> before using <code>setState</code>/<code>context</code> after await.`,
          `Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  FlutterError.onError = (details) {                           // errors thrown by widgets
    FlutterError.presentError(details);
    reportError(details.exception, details.stack);
  };
  PlatformDispatcher.instance.onError = (error, stack) {       // uncaught async errors
    reportError(error, stack);
    return true;                                               // handled
  };
  runApp(const ProviderScope(child: App()));
}

Future<void> save() async {
  setState(() => _saving = true);
  try {
    await repo.save(draft);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Saved')));
  } on ValidationFailure catch (e) {
    setState(() => _fieldErrors = e.fields);
  } on Failure catch (e) {
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
  } finally {
    if (mounted) setState(() => _saving = false);
  }
}`,
        ),
      ],
      [
        ['Why must the Future for FutureBuilder not be created inside build?', 'build runs on every rebuild, so a Future created inline would restart the request each time, causing repeated calls and flicker. Create it once in initState or a provider.'],
        ['What does await do to the UI?', 'Nothing blocking: it suspends only the async function; the event loop keeps rendering frames and handling input, then resumes the function when the Future completes.'],
        ['How do you catch uncaught async errors globally?', 'Set FlutterError.onError for framework errors and PlatformDispatcher.instance.onError for async errors, and send them to a crash reporting service.'],
      ],
    ),
    topic(
      'fl-streams-realtime',
      'Streams, StreamBuilder, StreamController and Real-Time Data',
      [
        blk(`<h3>Streams and StreamBuilder</h3>
• A <b><code>Stream&lt;T&gt;</code></b> emits a sequence of values over time. Sources: <code>Stream.periodic</code>, generators (<code>async*</code>/<code>yield</code>), <code>StreamController</code>, plugin APIs (connectivity, location, Firebase snapshots, WebSocket).<br>
• <b><code>StreamBuilder&lt;T&gt;</code></b> rebuilds on each event from an <code>AsyncSnapshot</code>; it subscribes and unsubscribes automatically. Provide <code>initialData</code> to avoid a loading flash. Like FutureBuilder, create or hold the stream once.<br>
• Stream methods: <code>map</code>, <code>where</code>, <code>asyncMap</code>, <code>distinct</code>, <code>take</code>, <code>transform</code>, <code>debounceTime</code> (<code>rxdart</code>).`,
          `Stream<int> ticker() => Stream.periodic(const Duration(seconds: 1), (i) => i);

class ClockPage extends StatelessWidget {
  const ClockPage({super.key});
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<DateTime>(
      stream: Stream.periodic(const Duration(seconds: 1), (_) => DateTime.now()),
      initialData: DateTime.now(),
      builder: (context, snapshot) {
        if (snapshot.hasError) return Text('Error \${snapshot.error}');
        final now = snapshot.data!;
        return Text(DateFormat.Hms().format(now), style: Theme.of(context).textTheme.displaySmall);
      },
    );
  }
}`,
        ),
      ],
      [
        blk(`<h3>StreamController</h3>
• <b>StreamController</b> lets <i>you</i> push values: <code>controller.add(value)</code>, <code>addError</code>, <code>close()</code>. <b>Single-subscription</b> (default) allows one listener; <b>broadcast</b> (<code>StreamController.broadcast()</code>) allows many but drops events with no listeners. <code>rxdart</code>'s <code>BehaviorSubject</code> replays the latest value to new listeners.<br>
• Expose only <code>controller.stream</code> from a class, keep the controller private, and <b>close it in <code>dispose</code></b>. <b>Cancel</b> every <code>StreamSubscription</code> you create with <code>listen</code>.`,
          `class SearchService {
  final _controller = StreamController<List<Course>>.broadcast();
  Stream<List<Course>> get results => _controller.stream;            // expose read-only
  Timer? _debounce;

  void query(String text) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () async {
      try { _controller.add(await api.search(text)); }
      catch (e, st) { _controller.addError(e, st); }
    });
  }

  void dispose() { _debounce?.cancel(); _controller.close(); }
}

class _PageState extends State<Page> {
  StreamSubscription<ConnectivityResult>? _sub;
  @override
  void initState() {
    super.initState();
    _sub = Connectivity().onConnectivityChanged.listen((r) => setState(() => _online = !r.contains(ConnectivityResult.none)));
  }
  @override
  void dispose() { _sub?.cancel(); super.dispose(); }                 // never forget
}`,
        ),
      ],
      [
        blk(`<h3>Real-time data handling</h3>
• <b>WebSocket</b> (<code>web_socket_channel</code>): <code>channel.stream</code> for incoming messages and <code>channel.sink.add</code> to send. Spring Boot supports <b>WebSocket/STOMP</b> or <b>Server-Sent Events</b> (<code>SseEmitter</code>, <code>Flux</code>) for live progress, chat and notifications.<br>
• Real-world needs: <b>reconnect with backoff</b>, heartbeat/ping, authentication (token in the connection request), message parsing with typed events, handling background/foreground and offline, de-duplicating events, and merging live updates into cached state (Riverpod <code>StreamProvider</code>).<br>
• Firestore/Realtime Database offer streams out of the box (see Firebase section).`,
          `class LiveChannel {
  LiveChannel(this._url, this._tokenProvider);
  final Uri _url;
  final Future<String?> Function() _tokenProvider;
  final _events = StreamController<Map<String, dynamic>>.broadcast();
  WebSocketChannel? _channel;
  int _attempt = 0;
  bool _closed = false;

  Stream<Map<String, dynamic>> get events => _events.stream;

  Future<void> connect() async {
    if (_closed) return;
    final token = await _tokenProvider();
    _channel = WebSocketChannel.connect(_url.replace(queryParameters: {'token': token ?? ''}));
    _channel!.stream.listen(
      (raw) { _attempt = 0; _events.add(jsonDecode(raw as String) as Map<String, dynamic>); },
      onError: (_) => _reconnect(),
      onDone: _reconnect,
    );
  }

  void send(Map<String, dynamic> message) => _channel?.sink.add(jsonEncode(message));

  Future<void> _reconnect() async {
    if (_closed) return;
    _attempt++;
    await Future<void>.delayed(Duration(seconds: min(30, 1 << _attempt)));           // exponential backoff, max 30 s
    await connect();
  }

  Future<void> dispose() async { _closed = true; await _channel?.sink.close(); await _events.close(); }
}

final notificationsProvider = StreamProvider.autoDispose<AppNotification>((ref) {
  final channel = ref.watch(liveChannelProvider);
  return channel.events.where((e) => e['type'] == 'notification').map(AppNotification.fromJson);
});

// Spring Boot (Java): Server-Sent Events
// @GetMapping(path = "/api/progress/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
// Flux<ServerSentEvent<ProgressDto>> stream(Authentication auth) { return progressService.updates(auth.getName()).map(p -> ServerSentEvent.builder(p).build()); }`,
        ),
      ],
      [
        ['Future vs Stream in Flutter UI?', 'FutureBuilder renders a single async result; StreamBuilder rebuilds on every value of a stream (live data, sensors, WebSocket). Both need the Future/Stream created once and outside build.'],
        ['Single-subscription vs broadcast stream?', 'A single-subscription stream allows one listener and buffers events until it listens; a broadcast stream allows many listeners but events are lost when nobody is listening.'],
        ['What must a real-time client handle besides receiving messages?', 'Reconnection with backoff, authentication, heartbeats, parsing and de-duplicating events, offline/background transitions and cleaning up subscriptions and controllers.'],
      ],
    ),
    topic(
      'fl-isolates-cancellation',
      'Concurrency with Isolates and Cancellation Strategies',
      [
        blk(`<h3>Isolates for heavy work</h3>
• All Dart code runs in an <b>isolate</b> with its own heap and event loop; the UI isolate must stay free. Move CPU-heavy work (parsing a multi-MB JSON, image processing, encryption, sorting huge lists, database migrations) to another isolate so frames are not dropped (jank).<br>
• <code>Isolate.run(() =&gt; ...)</code> (Dart 3) runs a function and returns its result; <code>compute(fn, arg)</code> is the Flutter equivalent. Arguments and results are <b>copied</b> (or transferred as <code>TransferableTypedData</code>); closures can capture only sendable values; plugins/platform channels may be unavailable in background isolates (use <code>RootIsolateToken</code>/<code>BackgroundIsolateBinaryMessenger</code>).<br>
• Do not isolate trivial work: spawning costs a few milliseconds.`,
          `Future<List<Course>> parseInBackground(String body) {
  return Isolate.run(() {
    final list = jsonDecode(body) as List<dynamic>;               // heavy parse happens off the UI thread
    return list.map((e) => Course.fromJson(e as Map<String, dynamic>)).toList();
  });
}

// Flutter's helper (top-level or static function)
List<Course> _parse(String body) => (jsonDecode(body) as List).map((e) => Course.fromJson(e as Map<String, dynamic>)).toList();
final courses = await compute(_parse, response.body);

// Show the benefit: this blocks the UI for seconds on the main isolate
int fib(int n) => n < 2 ? n : fib(n - 1) + fib(n - 2);
final result = await Isolate.run(() => fib(42));                // UI stays at 60 fps`,
        ),
      ],
      [
        blk(`<h3>Long-lived isolates and message passing</h3>
• For ongoing work (a background indexer, a worker pool) spawn an isolate with <code>Isolate.spawn</code> and talk through <code>SendPort</code>/<code>ReceivePort</code>. Send plain data (numbers, strings, lists, maps, records, <code>SendPort</code>); share nothing.<br>
• Packages: <code>flutter_isolate</code> (plugins in isolates), <code>squadron</code>, <code>worker_manager</code> (pools), <code>workmanager</code> (OS background tasks, different mechanism).`,
          `class Worker {
  late final SendPort _toWorker;
  final _ready = Completer<void>();
  final _results = StreamController<int>.broadcast();

  Future<void> start() async {
    final fromWorker = ReceivePort();
    await Isolate.spawn(_entry, fromWorker.sendPort);
    fromWorker.listen((message) {
      if (message is SendPort) { _toWorker = message; _ready.complete(); }
      else if (message is int) { _results.add(message); }
    });
    await _ready.future;
  }

  void process(int n) => _toWorker.send(n);
  Stream<int> get results => _results.stream;

  static void _entry(SendPort toMain) {
    final fromMain = ReceivePort();
    toMain.send(fromMain.sendPort);                               // hand back our port
    fromMain.listen((message) { if (message is int) toMain.send(message * message); });
  }
}`,
        ),
      ],
      [
        blk(`<h3>Cancellation strategies</h3>
• Dart Futures <b>cannot be cancelled</b> natively. Strategies: <b>ignore stale results</b> (compare a request id/version before applying), <b>Dio <code>CancelToken</code></b> (aborts the HTTP request), <b><code>StreamSubscription.cancel()</code></b>, <code>Timer.cancel()</code>, <code>CancelableOperation</code>/<code>CancelableCompleter</code> (<code>async</code> package), Riverpod's <code>ref.onDispose</code> + <code>ref.cancel</code> pattern (cancel in-flight work when the provider is disposed), <code>rxdart</code>'s <code>switchMap</code> (latest wins), and killing isolates (<code>isolate.kill</code>).<br>
• Cancel work when the user leaves the screen or types a new query; avoid updating disposed widgets (<code>mounted</code>).`,
          `// 1. Dio: cancel the HTTP request
final token = CancelToken();
dio.get('/api/search', queryParameters: {'q': q}, cancelToken: token);
token.cancel('user typed something new');

// 2. Latest wins: ignore stale responses
int _requestId = 0;
Future<void> search(String q) async {
  final id = ++_requestId;
  final results = await api.search(q);
  if (id != _requestId || !mounted) return;                      // a newer search started; drop this one
  setState(() => _results = results);
}

// 3. Riverpod: cancel when no longer watched
final searchProvider = FutureProvider.autoDispose.family<List<Course>, String>((ref, q) async {
  final token = CancelToken();
  ref.onDispose(token.cancel);                                   // provider disposed -> request cancelled
  final res = await ref.watch(dioProvider).get<List<dynamic>>('/api/search', queryParameters: {'q': q}, cancelToken: token);
  return res.data!.map((e) => Course.fromJson(e as Map<String, dynamic>)).toList();
});

// 4. async package
final operation = CancelableOperation.fromFuture(slowCall(), onCancel: () => debugPrint('cancelled'));
operation.cancel();

// 5. rxdart: switchMap cancels the previous inner stream
searchText$.debounceTime(const Duration(milliseconds: 300)).switchMap((q) => Stream.fromFuture(api.search(q)));`,
        ),
      ],
      [
        ['When should you use an isolate?', 'For CPU-bound work that would block the UI thread, such as parsing large JSON, image processing or encryption. Use Isolate.run or compute; do not use them for I/O, which is already asynchronous.'],
        ['Can a Dart Future be cancelled?', 'Not directly. Cancel the underlying operation (Dio CancelToken, subscription.cancel, Timer.cancel), use CancelableOperation, or ignore stale results with a request id.'],
        ['Do isolates share memory?', 'No. Each has its own heap; they communicate by passing messages through ports, with data copied (or transferred) between them.'],
      ],
    ),
  ]),
];
