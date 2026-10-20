// Flutter roadmap, part 3: sections 10-14 (local storage, authentication and security, advanced Flutter, device features, Firebase).
// Dart string interpolation "${...}" is written as "\${...}" inside these template literals; "$name" needs no escape.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const fl = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('fl', n, title, priority, topics);

export const flutterRoadmap3: SubTopic[] = [
  fl(10, 'Local Storage and Databases', 'Core', [
    topic(
      'fl-prefs-secure-files',
      'SharedPreferences, Secure Storage and File Storage',
      [
        blk(`<h3>SharedPreferences</h3>
• <code>shared_preferences</code> stores small <b>key-value</b> pairs (bool, int, double, String, List&lt;String&gt;) in platform storage (Android <code>SharedPreferences</code>, iOS <code>NSUserDefaults</code>). Perfect for settings: theme mode, language, onboarding done, last tab.<br>
• Not encrypted and not for large or relational data, secrets or tokens. Use the async API (<code>SharedPreferencesAsync</code>/<code>SharedPreferencesWithCache</code> in newer versions) and wrap it in a small repository so storage can change.`,
          `class SettingsStore {
  SettingsStore(this._prefs);
  final SharedPreferences _prefs;

  static Future<SettingsStore> create() async => SettingsStore(await SharedPreferences.getInstance());

  ThemeMode get themeMode => ThemeMode.values.byName(_prefs.getString('themeMode') ?? 'system');
  Future<void> setThemeMode(ThemeMode m) => _prefs.setString('themeMode', m.name);

  bool get onboardingDone => _prefs.getBool('onboardingDone') ?? false;
  Future<void> setOnboardingDone() => _prefs.setBool('onboardingDone', true);

  List<String> get recentSearches => _prefs.getStringList('recent') ?? const [];
  Future<void> addRecentSearch(String q) {
    final list = [q, ...recentSearches.where((x) => x != q)].take(10).toList();
    return _prefs.setStringList('recent', list);
  }
}`,
        ),
      ],
      [
        blk(`<h3>Secure storage</h3>
• <b><code>flutter_secure_storage</code></b> keeps secrets in the platform's secure store: <b>Android Keystore</b> (EncryptedSharedPreferences) and <b>iOS Keychain</b>. Use it for access/refresh tokens, API keys the user entered, encryption keys for local databases.<br>
• Options: <code>AndroidOptions(encryptedSharedPreferences: true)</code>, <code>IOSOptions(accessibility: KeychainAccessibility.first_unlock)</code>. Remember iOS Keychain items can survive app uninstall; clear on first launch if needed. Values are strings; small data only.<br>
• Never put tokens in <code>SharedPreferences</code>, logs or source code.`,
          `class TokenStore {
  TokenStore([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage(aOptions: AndroidOptions(encryptedSharedPreferences: true));
  final FlutterSecureStorage _storage;

  Future<void> save({required String access, required String refresh}) async {
    await _storage.write(key: 'access', value: access);
    await _storage.write(key: 'refresh', value: refresh);
  }
  Future<String?> accessToken() => _storage.read(key: 'access');
  Future<String?> refreshToken() => _storage.read(key: 'refresh');
  Future<void> clear() => _storage.deleteAll();
}`,
        ),
      ],
      [
        blk(`<h3>File storage</h3>
• <code>path_provider</code> gives directories: <code>getApplicationDocumentsDirectory()</code> (user data, backed up), <code>getApplicationSupportDirectory()</code> (app files), <code>getTemporaryDirectory()</code> (cache, may be cleared), <code>getExternalStorageDirectory()</code> (Android).<br>
• Read/write with <code>dart:io</code> <code>File</code>: <code>writeAsString</code>, <code>readAsString</code>, <code>writeAsBytes</code>, <code>openWrite</code> (streams); use <code>jsonEncode</code> for structured data. Keep large media on disk and store paths in the database.<br>
• On Android 10+ scoped storage limits access outside the app's folders; use the system pickers/MediaStore (<code>gal</code>, <code>saver_gallery</code>) to save to the gallery. Not available on Flutter Web (<code>dart:io</code>).`,
          `Future<File> _file(String name) async {
  final dir = await getApplicationDocumentsDirectory();
  return File('\${dir.path}/$name');
}

Future<void> saveDraft(Draft draft) async {
  final file = await _file('draft.json');
  await file.writeAsString(jsonEncode(draft.toJson()), flush: true);
}
Future<Draft?> loadDraft() async {
  final file = await _file('draft.json');
  if (!await file.exists()) return null;
  return Draft.fromJson(jsonDecode(await file.readAsString()) as Map<String, dynamic>);
}

Future<File> downloadTo(String url, String name, {void Function(double)? onProgress}) async {
  final file = await _file(name);
  await Dio().download(url, file.path, onReceiveProgress: (r, t) => onProgress?.call(t <= 0 ? 0 : r / t));
  return file;
}`,
        ),
      ],
      [
        ['SharedPreferences vs secure storage?', 'SharedPreferences stores plain key-value settings, unencrypted, for non-sensitive data. Secure storage uses the Android Keystore/iOS Keychain to protect secrets such as tokens.'],
        ['Where should you store a downloaded file?', 'In the application documents (persistent) or temporary/cache directory from path_provider, depending on whether it must survive; use the system pickers or MediaStore to save to shared storage on Android 10+.'],
        ['Why wrap storage in a repository class?', 'It hides the plugin, centralises keys and types, and makes it easy to test and replace the storage mechanism later.'],
      ],
    ),
    topic(
      'fl-sqlite-drift-hive-isar',
      'SQLite, Drift, Hive and Isar',
      [
        blk(`<h3>SQLite with sqflite</h3>
• <b>SQLite</b> is a relational database in a single file on the device: tables, SQL, indexes, transactions, joins. Package <code>sqflite</code> (Android/iOS/macOS) or <code>sqlite3</code> + <code>sqlite3_flutter_libs</code>. Create tables in <code>onCreate</code>, migrate in <code>onUpgrade</code> with a <b>version number</b>.<br>
• Use <b>parameterised queries</b> (<code>?</code> placeholders, <code>whereArgs</code>) to avoid injection and quoting bugs; wrap multi-step writes in <code>transaction</code> or <code>batch</code>; add indexes for searched columns; keep DB work off the UI path (it is already async).`,
          `class LocalDb {
  static Future<Database> open() async {
    final path = join(await getDatabasesPath(), 'javaschoollab.db');
    return openDatabase(
      path,
      version: 2,
      onCreate: (db, v) async {
        await db.execute('''
          CREATE TABLE courses(
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            price REAL NOT NULL,
            updated_at TEXT NOT NULL
          )''');
        await db.execute('CREATE INDEX idx_courses_title ON courses(title)');
      },
      onUpgrade: (db, oldV, newV) async {
        if (oldV < 2) await db.execute('ALTER TABLE courses ADD COLUMN tags TEXT');     // migration
      },
    );
  }
}

Future<void> upsertAll(Database db, List<Course> courses) => db.transaction((txn) async {
      final batch = txn.batch();
      for (final c in courses) {
        batch.insert('courses', {'id': c.id, 'title': c.title, 'price': c.price, 'updated_at': DateTime.now().toIso8601String()},
            conflictAlgorithm: ConflictAlgorithm.replace);
      }
      await batch.commit(noResult: true);
    });

Future<List<Map<String, Object?>>> search(Database db, String q) =>
    db.query('courses', where: 'title LIKE ?', whereArgs: ['%$q%'], orderBy: 'title', limit: 50);`,
        ),
      ],
      [
        blk(`<h3>Drift (type-safe SQLite)</h3>
• <b>Drift</b> (formerly Moor) is a reactive, <b>type-safe persistence library on top of SQLite</b>: you declare tables in Dart, it <b>generates</b> data classes and a query API, supports SQL and a Dart query builder, <b>compile-time checked</b> SQL, joins, transactions, <b>schema migrations with verification</b>, DAOs, and <b>reactive streams</b> (<code>watch()</code> emits when data changes), plus web support. Recommended for JavaSchoolLab's offline cache (Java developers will feel at home: tables ≈ JPA entities, DAOs ≈ repositories).`,
          `// database.dart
part 'database.g.dart';

class Courses extends Table {
  IntColumn get id => integer()();
  TextColumn get title => text().withLength(min: 1, max: 200)();
  RealColumn get price => real()();
  BoolColumn get favourite => boolean().withDefault(const Constant(false))();
  DateTimeColumn get updatedAt => dateTime()();
  @override Set<Column> get primaryKey => {id};
}
class Lessons extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get courseId => integer().references(Courses, #id, onDelete: KeyAction.cascade)();
  TextColumn get title => text()();
}

@DriftDatabase(tables: [Courses, Lessons])
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.e);
  @override int get schemaVersion => 2;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onUpgrade: (m, from, to) async { if (from < 2) await m.addColumn(courses, courses.favourite); },
        beforeOpen: (details) async => await customStatement('PRAGMA foreign_keys = ON'),
      );

  Stream<List<Course>> watchCourses(String q) =>
      (select(courses)..where((c) => c.title.like('%$q%'))..orderBy([(c) => OrderingTerm.asc(c.title)])).watch();   // reactive
  Future<void> upsertCourses(List<CoursesCompanion> rows) => batch((b) => b.insertAllOnConflictUpdate(courses, rows));
  Future<int> toggleFavourite(int id, bool value) => (update(courses)..where((c) => c.id.equals(id))).write(CoursesCompanion(favourite: Value(value)));
}
// dart run build_runner build`,
        ),
      ],
      [
        blk(`<h3>Hive, Isar and choosing a store</h3>
• <b>Hive</b>: fast, pure-Dart key-value/NoSQL boxes; simple objects with type adapters; good for caches and small collections. The original is in maintenance; <code>hive_ce</code> is a maintained fork.<br>
• <b>Isar</b>: fast embedded NoSQL database with typed collections, indexes, queries and reactive watchers; check the package's maintenance status before committing (the original author has slowed down; forks such as <code>isar_community</code> exist).
<table ${TABLE}>
<tr><th>Option</th><th>Model</th><th>Best for</th><th>Notes</th></tr>
<tr><td>SharedPreferences</td><td>Key-value</td><td>Settings</td><td>Small, plain</td></tr>
<tr><td>Secure storage</td><td>Key-value (encrypted)</td><td>Tokens, keys</td><td>Small</td></tr>
<tr><td>sqflite / Drift</td><td>Relational SQL</td><td>Structured, related, queried data; offline cache; sync</td><td>Drift adds type safety, streams, migrations</td></tr>
<tr><td>Hive</td><td>NoSQL boxes</td><td>Simple fast caches</td><td>No relations; check maintenance</td></tr>
<tr><td>Isar</td><td>NoSQL objects</td><td>Fast object queries, large datasets</td><td>Check maintenance</td></tr>
<tr><td>Files</td><td>Raw</td><td>Media, exports, JSON drafts</td><td>Store paths in the DB</td></tr>
</table>
• <b>Recommendation for JavaSchoolLab</b>: Drift (SQLite) for courses/lessons/progress, secure storage for tokens, SharedPreferences for settings.`,
          `// Hive: a quick cache
await Hive.initFlutter();
final box = await Hive.openBox<String>('cache');
await box.put('courses', jsonEncode(courses.map((c) => c.toJson()).toList()));
final cached = box.get('courses');

// Isar: typed collection
@collection
class Note {
  Id id = Isar.autoIncrement;
  @Index() late String title;
  late String body;
  late DateTime createdAt;
}
final isar = await Isar.open([NoteSchema], directory: (await getApplicationDocumentsDirectory()).path);
await isar.writeTxn(() => isar.notes.put(Note()..title = 'Hello'..body = '...'..createdAt = DateTime.now()));
final results = await isar.notes.filter().titleContains('hel', caseSensitive: false).findAll();
isar.notes.watchLazy().listen((_) => debugPrint('notes changed'));`,
        ),
      ],
      [
        ['Why choose Drift over raw sqflite?', 'Drift is type-safe and generates code, offers compile-time checked queries, reactive streams (watch), DAOs and verified schema migrations, reducing runtime SQL mistakes.'],
        ['What is a database migration?', 'A versioned change to the schema (adding a column or table) that runs when the installed database is older than the app\'s schemaVersion, so existing user data is preserved.'],
        ['Which local store should hold auth tokens?', 'Neither a database nor SharedPreferences; use flutter_secure_storage (Keystore/Keychain) so tokens are encrypted by the platform.'],
      ],
    ),
    topic(
      'fl-cache-offline-sync',
      'Caching, Offline Support and Local Database Synchronization',
      [
        blk(`<h3>Caching strategies</h3>
• A <b>cache</b> keeps data close to the UI so screens open instantly and work with a bad network. Common policies: <b>cache-first</b> (show cached data, refresh in the background: stale-while-revalidate), <b>network-first</b> (try the network, fall back to cache), <b>cache-then-network</b> (emit cache, then fresh), with a <b>TTL</b> and a <b>max size</b>.<br>
• <b>Single source of truth</b>: the UI observes the <b>local database</b>; the repository refreshes it from the API. The UI never reads the network directly. Images: <code>cached_network_image</code>; HTTP: <code>dio_cache_interceptor</code>.`,
          `class CourseRepository {
  CourseRepository(this._api, this._db);
  final CourseApi _api;
  final AppDatabase _db;

  // The UI watches the database: always up to date, works offline
  Stream<List<Course>> watchAll() => _db.watchCourses('').map((rows) => rows.map((r) => r.toDomain()).toList());

  // Refresh from the network into the database (stale-while-revalidate)
  Future<void> refresh() async {
    try {
      final remote = await _api.list();
      await _db.upsertCourses([for (final c in remote) c.toCompanion()]);
      await _prefs.setString('coursesFetchedAt', DateTime.now().toIso8601String());
    } on Failure catch (e) {
      if (e is! NetworkFailure) rethrow;                          // offline is fine, we still have the cache
    }
  }

  bool get isStale {
    final at = DateTime.tryParse(_prefs.getString('coursesFetchedAt') ?? '');
    return at == null || DateTime.now().difference(at) > const Duration(minutes: 10);
  }
}`,
        ),
      ],
      [
        blk(`<h3>Offline support</h3>
• Detect connectivity with <code>connectivity_plus</code> (a hint only: "connected" does not mean the server is reachable; real errors are the truth) and show an <b>offline banner</b>.<br>
• <b>Offline reads</b>: from the local database. <b>Offline writes</b>: apply to the database immediately (optimistic), add the action to an <b>outbox queue</b> table (<code>pending_actions</code>: id, type, payload JSON, createdAt, attempts), and show a "pending sync" indicator. Make actions <b>idempotent</b> (client-generated UUIDs) so a retry never duplicates.<br>
• Decide per feature what works offline: lessons already downloaded, notes, progress; not payments or live chat.`,
          `class PendingActions extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get type => text()();                                 // 'progress.update', 'note.create'
  TextColumn get payload => text()();                              // JSON
  TextColumn get clientId => text()();                             // UUID: lets the server de-duplicate retries
  IntColumn get attempts => integer().withDefault(const Constant(0))();
  DateTimeColumn get createdAt => dateTime()();
}

Future<void> completeLesson(int lessonId) async {
  await _db.markLessonDone(lessonId);                              // local first: instant UI
  await _db.enqueue(PendingActionsCompanion.insert(
    type: 'progress.update', payload: jsonEncode({'lessonId': lessonId, 'done': true}),
    clientId: const Uuid().v4(), createdAt: DateTime.now(),
  ));
  unawaited(_sync.trySync());                                      // sync now if online
}

final connectivityProvider = StreamProvider<bool>((ref) =>
    Connectivity().onConnectivityChanged.map((r) => !r.contains(ConnectivityResult.none)));`,
        ),
      ],
      [
        blk(`<h3>Local database synchronization</h3>
• <b>Push</b>: process the outbox oldest-first, send each action (with <code>Idempotency-Key: clientId</code>), delete on success, increment attempts and back off on failure, drop or flag after N failures; stop on <code>401</code> (refresh/login). Run when connectivity returns, on app resume and periodically (WorkManager on Android for background sync).<br>
• <b>Pull</b>: fetch changes since the last sync (<code>GET /api/sync?since=2026-10-20T10:00:00Z</code> or an incrementing <b>version/ETag</b>), merge into the database in one transaction, store the new <code>lastSyncedAt</code>. Use <b>soft deletes</b> (<code>deleted</code> flag) so deletions propagate.<br>
• <b>Conflicts</b>: choose a policy: <b>last-write-wins</b> (timestamp), <b>server-wins</b>, <b>field-level merge</b>, or ask the user. Add a <code>version</code> column (Spring <code>@Version</code>) so the server can reject stale updates with <code>409</code>.`,
          `class SyncService {
  SyncService(this._db, this._api, this._prefs);
  bool _running = false;

  Future<void> trySync() async {
    if (_running) return;                                          // one sync at a time
    _running = true;
    try {
      await _push();
      await _pull();
    } finally {
      _running = false;
    }
  }

  Future<void> _push() async {
    for (final action in await _db.pendingActions()) {             // oldest first
      try {
        await _api.send(action.type, jsonDecode(action.payload), idempotencyKey: action.clientId);
        await _db.deleteAction(action.id);
      } on ConflictFailure {
        await _db.deleteAction(action.id);                         // server already has a newer version: drop (or surface to the user)
      } on NetworkFailure {
        return;                                                    // still offline: try again later
      } on Failure {
        await _db.bumpAttempts(action.id);
        if (action.attempts >= 5) await _db.deleteAction(action.id);
      }
    }
  }

  Future<void> _pull() async {
    final since = _prefs.getString('lastSyncedAt');
    final changes = await _api.changes(since: since);               // { items: [...], deletedIds: [...], serverTime: "..." }
    await _db.transaction(() async {
      await _db.upsertCourses(changes.items.map((c) => c.toCompanion()).toList());
      await _db.deleteCourses(changes.deletedIds);
    });
    await _prefs.setString('lastSyncedAt', changes.serverTime);
  }
}

// Spring Boot (Java): changes endpoint
// @GetMapping("/api/sync") SyncResponse changes(@RequestParam(required = false) Instant since, Authentication auth) {
//   return service.changesFor(auth.getName(), since);      // rows with updated_at > since, plus soft-deleted ids
// }
// @Version private long version;                             // optimistic locking -> 409 on stale update`,
        ),
      ],
      [
        ['What is the single source of truth pattern?', 'The UI reads only from the local database; the repository refreshes the database from the network. Data flows network → database → UI, which gives instant screens and offline behaviour.'],
        ['How do you make offline writes safe to retry?', 'Queue each action with a client-generated UUID and send it as an idempotency key, so the server can detect and ignore duplicates when the same action is retried.'],
        ['How can sync conflicts be resolved?', 'With a policy such as last-write-wins, server-wins or field-level merge, using version numbers/timestamps (optimistic locking, HTTP 409) to detect conflicting edits, or by asking the user.'],
      ],
    ),
  ]),

  fl(11, 'Authentication and Security', 'Core', [
    topic(
      'fl-auth-login-jwt-refresh',
      'Login, Registration, JWT, Token Refresh and Secure Token Storage',
      [
        blk(`<h3>Login and registration screens</h3>
• Build login/registration with a <code>Form</code>, proper keyboard types, <code>autofillHints</code> (password managers), show/hide password, loading state, server-error mapping and "forgot password". Disable the button while submitting; never reveal whether an email exists on login failures ("Invalid email or password").<br>
• Spring Security side: <code>POST /api/auth/register</code> (hash passwords with BCrypt/Argon2), <code>POST /api/auth/login</code> → <code>{ accessToken, refreshToken, user }</code>, <code>POST /api/auth/refresh</code>, <code>POST /api/auth/logout</code>, <code>GET /api/me</code>.`,
          `class AuthRepository {
  AuthRepository(this._dio, this._tokens);
  final Dio _dio;
  final TokenStore _tokens;

  Future<User> login(String email, String password) => guard(() async {
        final res = await _dio.post<Map<String, dynamic>>('/api/auth/login', data: {'email': email, 'password': password});
        await _tokens.save(access: res.data!['accessToken'] as String, refresh: res.data!['refreshToken'] as String);
        return User.fromJson(res.data!['user'] as Map<String, dynamic>);
      });

  Future<void> register(String name, String email, String password) =>
      guard(() => _dio.post('/api/auth/register', data: {'name': name, 'email': email, 'password': password}));

  Future<void> logout() async {
    try { await _dio.post('/api/auth/logout', data: {'refreshToken': await _tokens.refreshToken()}); } catch (_) {}
    await _tokens.clear();                                                         // always clear locally
  }
}

class AuthController extends AsyncNotifier<User?> {
  @override
  Future<User?> build() async {                                                    // restore the session at start-up
    if (await ref.read(tokenStoreProvider).accessToken() == null) return null;
    try { return await ref.read(authRepositoryProvider).me(); } on UnauthorizedFailure { return null; }
  }
  Future<void> signIn(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(authRepositoryProvider).login(email, password));
  }
  Future<void> signOut() async { await ref.read(authRepositoryProvider).logout(); state = const AsyncData(null); }
}`,
        ),
      ],
      [
        blk(`<h3>JWT and token refresh</h3>
• A <b>JWT</b> (<code>header.payload.signature</code>) carries claims (<code>sub</code>, <code>roles</code>, <code>exp</code>). It is <b>signed, not encrypted</b>: never put secrets in it; the <b>server verifies</b> it. The app may decode the payload (<code>jwt_decoder</code>) to read <code>exp</code> and roles for UI decisions only.<br>
• Use <b>short-lived access tokens</b> (5-15 min) and a <b>refresh token</b> (days/weeks), <b>rotated on every use</b> with reuse detection on the server; revoke on logout and password change.<br>
• Refresh <b>proactively</b> (shortly before <code>exp</code>) or <b>reactively</b> on <code>401</code>; make sure <b>only one refresh runs at a time</b> (queue concurrent requests with a <code>QueuedInterceptor</code> or a shared Future) and retry the failed request once. If refresh fails: clear tokens and route to login.`,
          `bool isExpiringSoon(String jwt, {Duration skew = const Duration(seconds: 30)}) {
  final expiry = JwtDecoder.getExpirationDate(jwt);
  return DateTime.now().isAfter(expiry.subtract(skew));
}

class TokenRefresher {
  TokenRefresher(this._tokens, this._plainDio);                    // a Dio WITHOUT the auth interceptor
  final TokenStore _tokens;
  final Dio _plainDio;
  Future<String>? _inFlight;                                       // one refresh shared by all callers

  Future<String> refresh() => _inFlight ??= _doRefresh().whenComplete(() => _inFlight = null);

  Future<String> _doRefresh() async {
    final refresh = await _tokens.refreshToken();
    if (refresh == null) throw const UnauthorizedFailure();
    try {
      final res = await _plainDio.post<Map<String, dynamic>>('/api/auth/refresh', data: {'refreshToken': refresh});
      await _tokens.save(access: res.data!['accessToken'] as String, refresh: res.data!['refreshToken'] as String);   // rotated pair
      return res.data!['accessToken'] as String;
    } on DioException {
      await _tokens.clear();
      throw const UnauthorizedFailure();
    }
  }
}`,
        ),
      ],
      [
        blk(`<h3>Secure token storage and Spring Security integration</h3>
• Store tokens in <b>flutter_secure_storage</b> only (Keystore/Keychain). Keep the access token also in memory to avoid reading storage on every request. Clear everything on logout. Never log tokens.<br>
• Spring Security (Java): stateless resource server validating the JWT (<code>oauth2ResourceServer(jwt)</code> or a custom filter), CORS not required for mobile, password hashing with <code>BCryptPasswordEncoder</code>, rate limiting for login, account lockout, optional MFA. Return <code>401</code> for missing/invalid tokens and <code>403</code> for insufficient rights.<br>
• Consider <b>OAuth2/OIDC with PKCE</b> (<code>flutter_appauth</code>) for social login (Google) or a corporate IdP instead of building credentials handling yourself.`,
          `// Spring Boot (Java)
// @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception {
//   return http.csrf(c -> c.disable())
//     .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//     .authorizeHttpRequests(a -> a
//         .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
//         .requestMatchers("/api/admin/**").hasRole("ADMIN")
//         .anyRequest().authenticated())
//     .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
//     .build();
// }
// @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
//
// refresh endpoint: verify the refresh token hash in the DB, issue a NEW pair, mark the old one used (reuse = revoke the whole family)

// Flutter: OIDC login with PKCE
final result = await FlutterAppAuth().authorizeAndExchangeCode(AuthorizationTokenRequest(
  'javaschoollab-mobile', 'com.javaschoollab.app:/oauthredirect',
  discoveryUrl: 'https://auth.javaschoollab.com/.well-known/openid-configuration', scopes: ['openid', 'profile', 'email', 'offline_access'],
));
await tokens.save(access: result.accessToken!, refresh: result.refreshToken!);`,
        ),
      ],
      [
        ['Why use short-lived access tokens with refresh tokens?', 'If an access token leaks it is useful only briefly; the long-lived refresh token is stored more carefully, rotated on each use and can be revoked, giving both security and a smooth user experience.'],
        ['Why must only one token refresh run at a time?', 'Several requests failing with 401 together would each try to refresh; with rotating refresh tokens the second attempt would use an already-used token and trigger revocation. Share one in-flight refresh and retry the others.'],
        ['Is a JWT encrypted?', 'No. It is signed, so it can be verified, but its payload is only base64url-encoded and readable. Never put secrets in it and always verify it on the server.'],
      ],
    ),
    topic(
      'fl-biometrics-network-security',
      'Biometric Authentication, Certificate Validation and Network Security',
      [
        blk(`<h3>Biometric authentication</h3>
• <code>local_auth</code> shows the system fingerprint/face/PIN prompt: <code>canCheckBiometrics</code>, <code>isDeviceSupported</code>, <code>authenticate(localizedReason: ..., options: AuthenticationOptions(biometricOnly: false, stickyAuth: true))</code>. It answers "is this the device owner?"; it does <b>not</b> replace server login.<br>
• Typical use: protect re-opening the app, show sensitive screens, or <b>unlock stored tokens</b> (store the refresh token in secure storage with biometric protection; or require biometrics before using it). Fall back to the device PIN, handle "no biometrics enrolled" and lockouts.<br>
• Android needs <code>USE_BIOMETRIC</code> and the activity must extend <code>FlutterFragmentActivity</code>; iOS needs <code>NSFaceIDUsageDescription</code>.`,
          `final auth = LocalAuthentication();

Future<bool> unlockWithBiometrics() async {
  try {
    final supported = await auth.isDeviceSupported();
    if (!supported) return true;                                    // no secure lock screen: policy decision (allow or block)
    return await auth.authenticate(
      localizedReason: 'Unlock JavaSchoolLab',
      options: const AuthenticationOptions(biometricOnly: false, stickyAuth: true, useErrorDialogs: true),
    );
  } on PlatformException catch (e) {
    debugPrint('biometric error \${e.code}');
    return false;
  }
}

// gate the app on resume
class AppLockGate extends StatefulWidget {
  const AppLockGate({super.key, required this.child});
  final Widget child;
  @override State<AppLockGate> createState() => _AppLockGateState();
}
class _AppLockGateState extends State<AppLockGate> with WidgetsBindingObserver {
  bool _unlocked = false;
  DateTime? _pausedAt;
  @override void initState() { super.initState(); WidgetsBinding.instance.addObserver(this); _unlock(); }
  @override void dispose() { WidgetsBinding.instance.removeObserver(this); super.dispose(); }
  Future<void> _unlock() async { final ok = await unlockWithBiometrics(); if (mounted) setState(() => _unlocked = ok); }
  @override
  void didChangeAppLifecycleState(AppLifecycleState s) {
    if (s == AppLifecycleState.paused) _pausedAt = DateTime.now();
    if (s == AppLifecycleState.resumed && _pausedAt != null && DateTime.now().difference(_pausedAt!) > const Duration(minutes: 2)) {
      setState(() => _unlocked = false); _unlock();                 // re-lock after 2 minutes in the background
    }
  }
  @override
  Widget build(BuildContext context) => _unlocked ? widget.child : const Scaffold(body: Center(child: Icon(Icons.lock, size: 64)));
}`,
        ),
      ],
      [
        blk(`<h3>Certificate validation and pinning</h3>
• Always use <b>HTTPS</b> and never disable certificate validation (<code>badCertificateCallback = (cert, host, port) =&gt; true</code> is a serious vulnerability that makes man-in-the-middle attacks trivial). Fix certificate problems on the server (a complete chain, valid hostname, not expired).<br>
• <b>Certificate pinning</b> makes the app accept only your server's certificate/public key (or its CA), even if a device trusts a rogue CA: pin the <b>public key hash (SPKI)</b> with a backup pin and a rotation plan (pinning to an expiring leaf breaks the app when the certificate renews). Implement with Dio's <code>IOHttpClientAdapter.createHttpClient</code> + <code>SecurityContext</code>, or packages (<code>http_certificate_pinning</code>, <code>dio_http2_adapter</code>).<br>
• Android's <b>Network Security Config</b> (<code>res/xml/network_security_config.xml</code>) can disable cleartext and pin domains declaratively.`,
          `// Dio: only trust a bundled certificate (pinning)
final dio = Dio();
(dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
  final context = SecurityContext(withTrustedRoots: false)
    ..setTrustedCertificatesBytes(pinnedCertBytes);                 // loaded from assets
  final client = HttpClient(context: context);
  client.badCertificateCallback = (cert, host, port) => false;      // NEVER return true
  return client;
};

<!-- android/app/src/main/res/xml/network_security_config.xml -->
<network-security-config>
  <base-config cleartextTrafficPermitted="false"/>
  <domain-config>
    <domain includeSubdomains="true">api.javaschoollab.com</domain>
    <pin-set expiration="2027-12-31">
      <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
      <pin digest="SHA-256">BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</pin>   <!-- backup pin -->
    </pin-set>
  </domain-config>
</network-security-config>
<!-- AndroidManifest: android:networkSecurityConfig="@xml/network_security_config" -->`,
        ),
      ],
      [
        blk(`<h3>Network and app security checklist</h3>
• <b>Secure API communication</b>: HTTPS/TLS 1.2+, short timeouts, validate responses, send tokens only to your API host (not third parties), no secrets in URLs/query strings, no sensitive data in logs (strip in release), avoid <code>print</code> in release.<br>
• <b>Do not embed secrets</b> in the app: API keys with write power, signing keys, DB passwords are extractable from the binary. Anything shipped is public; use server-side secrets and restrict keys (package name + SHA-1, per-API restrictions).<br>
• <b>Hardening</b>: <code>--obfuscate --split-debug-info</code> for release builds (slows reverse engineering, not security); detect rooted/jailbroken devices (<code>flutter_jailbreak_detection</code>) for high-risk apps; <code>FLAG_SECURE</code> to block screenshots on sensitive screens (<code>flutter_windowmanager</code>/<code>no_screenshot</code>); clear clipboard; disable Android backup of sensitive data (<code>android:allowBackup="false"</code>).<br>
• Keep dependencies updated (<code>flutter pub outdated</code>, advisories), and follow OWASP MASVS.`,
          `# release build with obfuscation
flutter build appbundle --release --obfuscate --split-debug-info=build/symbols

// strip logs in release
void log(String message) { if (kDebugMode) debugPrint(message); }

// keep Dio logging out of release builds
if (kDebugMode) dio.interceptors.add(LogInterceptor(requestBody: false, responseBody: false));

// Android manifest
// <application android:allowBackup="false" android:usesCleartextTraffic="false" ...>

// Never do this
// final apiKey = 'sk_live_...';           // extractable from the APK in minutes`,
        ),
      ],
      [
        ['Does biometric authentication replace server-side login?', 'No. It proves the device owner is present; it is used to unlock the app or stored credentials after a normal login, while the server still authenticates via tokens.'],
        ['What is certificate pinning?', 'Configuring the app to accept only a known server certificate or public key, so connections intercepted with a rogue but device-trusted certificate authority are rejected. It needs backup pins and a rotation plan.'],
        ['Why shouldn\'t you embed API secrets in a mobile app?', 'The binary can be decompiled and strings extracted easily; any secret shipped in the app is effectively public. Keep secrets on the server and issue short-lived, restricted tokens.'],
      ],
    ),
    topic(
      'fl-rbac',
      'Role-Based Access Control',
      [
        blk(`<h3>Roles and permissions</h3>
• <b>RBAC</b>: users have <b>roles</b> (<code>STUDENT</code>, <code>INSTRUCTOR</code>, <code>ADMIN</code>) that grant <b>permissions</b> (<code>course:create</code>, <code>user:ban</code>). Put roles/permissions in the user object (from <code>/api/me</code>) or the JWT claims, and model them as an <code>enum</code>/set in Dart.<br>
• In Flutter use roles to <b>shape the UI</b>: hide admin menus, disable edit buttons, route guards for <code>/admin</code>. This is <b>usability, not security</b>: the Spring Boot API must enforce every rule with <code>@PreAuthorize</code> and ownership checks.`,
          `enum Role { student, instructor, admin }

class User {
  const User({required this.id, required this.name, required this.roles, this.permissions = const {}});
  final int id;
  final String name;
  final Set<Role> roles;
  final Set<String> permissions;

  bool hasRole(Role r) => roles.contains(r);
  bool can(String permission) => permissions.contains(permission) || roles.contains(Role.admin);
}

// Widget that shows its child only if the user may see it
class Can extends ConsumerWidget {
  const Can({super.key, required this.permission, required this.child, this.fallback = const SizedBox.shrink()});
  final String permission;
  final Widget child;
  final Widget fallback;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).valueOrNull;
    return (user?.can(permission) ?? false) ? child : fallback;
  }
}
// Can(permission: 'course:delete', child: IconButton(icon: const Icon(Icons.delete), onPressed: remove))`,
        ),
      ],
      [
        blk(`<h3>Route guards by role and the server as the authority</h3>
• Add a role check to the GoRouter <code>redirect</code> for protected areas and show a "403" page; keep menus consistent with the routes.<br>
• Server: <code>@PreAuthorize("hasRole('ADMIN')")</code>, method security, and <b>ownership checks</b> (a student may read only their own progress; never trust an id sent by the client). Return <code>401</code> (not authenticated) or <code>403</code> (not allowed) and let the app react centrally (logout on 401, "no access" on 403).<br>
• Re-fetch the user (roles) after login, on app resume and after a 403, since roles may change on the server.`,
          `// go_router
GoRoute(
  path: '/admin',
  redirect: (context, state) {
    final user = ProviderScope.containerOf(context).read(authProvider).valueOrNull;
    return user?.hasRole(Role.admin) == true ? null : '/forbidden';
  },
  builder: (_, __) => const AdminDashboard(),
);

// Dio: react to 403 centrally
onError: (err, handler) {
  if (err.response?.statusCode == 403) ref.read(messengerProvider).show('You do not have access to this.');
  handler.next(err);
}

// Spring Boot (Java): the real enforcement
// @PreAuthorize("hasRole('ADMIN') or @courseSecurity.isInstructorOf(#id, authentication)")
// @DeleteMapping("/api/v1/courses/{id}") void delete(@PathVariable long id) { service.delete(id); }`,
        ),
      ],
      [
        blk(`<h3>Testing and designing permissions</h3>
• Unit-test the permission logic (<code>user.can(...)</code>) and widget-test that restricted widgets do not appear for the wrong role (<code>ProviderScope</code> overrides with a fake user).<br>
• Prefer <b>permissions over role names</b> in UI checks (<code>can('course:delete')</code>) so roles can be reshuffled on the server without app updates.<br>
• Default deny: show nothing until the user is loaded; treat unknown roles as no access.`,
          `testWidgets('delete button is hidden for students', (tester) async {
  await tester.pumpWidget(ProviderScope(
    overrides: [authProvider.overrideWith(() => FakeAuth(const User(id: 1, name: 'Asha', roles: {Role.student})))],
    child: const MaterialApp(home: Scaffold(body: Can(permission: 'course:delete', child: Text('Delete')))),
  ));
  await tester.pump();
  expect(find.text('Delete'), findsNothing);
});

test('admin can do everything', () {
  const admin = User(id: 2, name: 'Root', roles: {Role.admin});
  expect(admin.can('anything'), isTrue);
});`,
        ),
      ],
      [
        ['Are role checks in the Flutter app a security measure?', 'No. They only tailor the UI. The server must authenticate and authorise every request, because client code can be modified or bypassed.'],
        ['Why prefer permissions to role names in the UI?', 'Permissions describe capabilities (course:delete), so roles can change on the server without changing app code; role names couple the app to the role design.'],
        ['What do 401 and 403 mean?', '401: not authenticated (missing or invalid token); 403: authenticated but not allowed. The app logs out or refreshes on 401 and shows a no-access message on 403.'],
      ],
    ),
  ]),

  fl(12, 'Advanced Flutter', 'Essential', [
    topic(
      'fl-custompainter-animations',
      'CustomPainter and Animations: Implicit, Explicit, AnimationController and Hero',
      [
        blk(`<h3>CustomPainter</h3>
• <code>CustomPaint</code> + <b><code>CustomPainter</code></b> draw directly on a <code>Canvas</code>: lines, paths, arcs, shapes, text, images, gradients. Override <code>paint(Canvas canvas, Size size)</code> and <code>shouldRepaint(old)</code> (return true only when inputs change). Use for charts, progress rings, signatures, game-like visuals.<br>
• <code>Paint</code> configures colour, stroke width, style (fill/stroke), <code>StrokeCap</code>, shader. Wrap in <code>RepaintBoundary</code> to isolate repaints; keep <code>paint</code> cheap and allocation-free.`,
          `class ProgressRing extends CustomPainter {
  ProgressRing({required this.progress, required this.color});
  final double progress;            // 0..1
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final radius = min(size.width, size.height) / 2 - 8;
    final track = Paint()..color = Colors.grey.shade300..style = PaintingStyle.stroke..strokeWidth = 10;
    final arc = Paint()..color = color..style = PaintingStyle.stroke..strokeWidth = 10..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, track);
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), -pi / 2, 2 * pi * progress, false, arc);

    final tp = TextPainter(
      text: TextSpan(text: '\${(progress * 100).round()}%', style: TextStyle(color: color, fontSize: 24, fontWeight: FontWeight.bold)),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, center - Offset(tp.width / 2, tp.height / 2));
  }

  @override
  bool shouldRepaint(ProgressRing old) => old.progress != progress || old.color != color;
}

CustomPaint(size: const Size(140, 140), painter: ProgressRing(progress: 0.65, color: Colors.deepOrange));`,
        ),
      ],
      [
        blk(`<h3>Implicit and explicit animations</h3>
• <b>Implicit</b> (easy): <code>AnimatedContainer</code>, <code>AnimatedOpacity</code>, <code>AnimatedAlign</code>, <code>AnimatedPositioned</code>, <code>AnimatedSwitcher</code>, <code>TweenAnimationBuilder</code>: change a value and Flutter animates to it (<code>duration</code>, <code>curve</code>).<br>
• <b>Explicit</b> (full control): an <b><code>AnimationController</code></b> (needs a <code>vsync</code> ticker: <code>with SingleTickerProviderStateMixin</code>; always <code>dispose</code>) produces a value 0.0 to 1.0 over a duration; <b><code>Tween</code></b> maps it to any range/type, <b><code>CurvedAnimation</code></b> adds a curve; drive widgets with <code>AnimatedBuilder</code> or ready-made transitions (<code>FadeTransition</code>, <code>ScaleTransition</code>, <code>SlideTransition</code>, <code>RotationTransition</code>). Control: <code>forward()</code>, <code>reverse()</code>, <code>repeat()</code>, <code>stop()</code>, <code>animateTo()</code>.<br>
• <b>Staggered</b> animations use <code>Interval</code> curves on one controller.`,
          `class PulsingHeart extends StatefulWidget {
  const PulsingHeart({super.key});
  @override State<PulsingHeart> createState() => _PulsingHeartState();
}
class _PulsingHeartState extends State<PulsingHeart> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 800))..repeat(reverse: true);
  late final Animation<double> _scale = Tween(begin: 0.9, end: 1.2).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  late final Animation<Color?> _color = ColorTween(begin: Colors.pink.shade200, end: Colors.red).animate(_controller);

  @override
  void dispose() { _controller.dispose(); super.dispose(); }                       // required

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: _controller,
        child: const Icon(Icons.favorite, size: 64),                              // not rebuilt every frame
        builder: (context, child) => Transform.scale(scale: _scale.value, child: ColorFiltered(colorFilter: ColorFilter.mode(_color.value!, BlendMode.srcIn), child: child)),
      );
}

// staggered: slide then fade within one controller
final slide = Tween(begin: const Offset(0, 0.3), end: Offset.zero).animate(CurvedAnimation(parent: _controller, curve: const Interval(0, 0.6, curve: Curves.easeOut)));
final fade = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _controller, curve: const Interval(0.4, 1, curve: Curves.easeIn)));

TweenAnimationBuilder<double>(                                                      // implicit, custom tween
  tween: Tween(begin: 0, end: targetProgress),
  duration: const Duration(milliseconds: 600),
  builder: (_, value, __) => LinearProgressIndicator(value: value),
);`,
        ),
      ],
      [
        blk(`<h3>Hero animations and performance</h3>
• A <b>Hero</b> flies a shared widget between two routes: wrap the widget on both screens in <code>Hero(tag: sameTag, child: ...)</code> (tags must be unique per screen and equal across them). Use for thumbnails that expand into a detail image; customise with <code>flightShuttleBuilder</code>.<br>
• Animation performance: animate <code>Transform</code>/<code>Opacity</code> (cheap, no re-layout) rather than size/padding where possible; use <code>AnimatedBuilder</code>'s <code>child</code> to avoid rebuilding static parts; <code>RepaintBoundary</code> around heavy animated areas; avoid <code>saveLayer</code> (<code>Opacity</code> on big trees); profile with DevTools. Consider <b>Lottie</b> (<code>lottie</code>) or <b>Rive</b> for designer-made animations.<br>
• Respect <code>MediaQuery.disableAnimationsOf(context)</code> for users who reduce motion.`,
          `// list screen
GestureDetector(
  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CourseDetail(course: course))),
  child: Hero(tag: 'course-\${course.id}', child: ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.network(course.imageUrl, height: 80))),
);

// detail screen
Hero(tag: 'course-\${course.id}', child: Image.network(course.imageUrl, height: 240, width: double.infinity, fit: BoxFit.cover));

final reduceMotion = MediaQuery.disableAnimationsOf(context);
final duration = reduceMotion ? Duration.zero : const Duration(milliseconds: 300);

// Lottie
Lottie.asset('assets/animations/success.json', repeat: false, width: 160);`,
        ),
      ],
      [
        ['Implicit vs explicit animations?', 'Implicit animations (AnimatedContainer etc.) animate automatically when a property changes; explicit animations use an AnimationController (with a vsync ticker) and tweens for full control: repeat, reverse, sequencing and syncing several animations.'],
        ['Why must an AnimationController be disposed?', 'It holds a Ticker that fires every frame; if not disposed it leaks and throws errors after the widget is removed.'],
        ['How does a Hero animation work?', 'Two widgets on different routes share the same Hero tag; during the route transition Flutter flies the widget from its old position and size to the new one.'],
      ],
    ),
    topic(
      'fl-slivers',
      'Slivers and CustomScrollView',
      [
        blk(`<h3>What are slivers?</h3>
• A <b>sliver</b> is a portion of a scrollable area that builds and lays out lazily. <b><code>CustomScrollView</code></b> composes several slivers into one scroll: collapsing app bars, headers that pin, lists and grids in the same scroll, parallax effects. <code>ListView</code> and <code>GridView</code> are just convenient wrappers around slivers.<br>
• Slivers: <code>SliverAppBar</code> (<code>pinned</code>, <code>floating</code>, <code>expandedHeight</code>, <code>flexibleSpace</code>), <code>SliverList</code>/<code>SliverList.builder</code>, <code>SliverGrid</code>, <code>SliverToBoxAdapter</code> (any normal widget), <code>SliverPadding</code>, <code>SliverFillRemaining</code>, <code>SliverPersistentHeader</code> (custom sticky header), <code>SliverFixedExtentList</code>, <code>SliverMainAxisGroup</code>.`,
          `CustomScrollView(
  slivers: [
    SliverAppBar(
      pinned: true,
      expandedHeight: 220,
      flexibleSpace: FlexibleSpaceBar(
        title: const Text('Flutter Essentials'),
        background: Image.network(course.imageUrl, fit: BoxFit.cover),
      ),
    ),
    SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.all(16), child: Text(course.description))),
    SliverPadding(
      padding: const EdgeInsets.all(12),
      sliver: SliverGrid.builder(
        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(maxCrossAxisExtent: 180, mainAxisSpacing: 8, crossAxisSpacing: 8),
        itemCount: course.badges.length,
        itemBuilder: (_, i) => Card(child: Center(child: Text(course.badges[i]))),
      ),
    ),
    SliverList.builder(
      itemCount: course.lessons.length,
      itemBuilder: (_, i) => ListTile(leading: CircleAvatar(child: Text('\${i + 1}')), title: Text(course.lessons[i].title)),
    ),
    const SliverToBoxAdapter(child: SizedBox(height: 80)),
  ],
);`,
        ),
      ],
      [
        blk(`<h3>Sticky headers and nested scrolling</h3>
• <b>SliverPersistentHeader</b> with a <code>SliverPersistentHeaderDelegate</code> creates pinned section headers or a search bar that sticks (<code>pinned: true</code>); the delegate defines <code>minExtent</code>, <code>maxExtent</code> and <code>build(context, shrinkOffset, overlapsContent)</code>.<br>
• <b>NestedScrollView</b> + <code>TabBarView</code> keeps a collapsing header above tabs that each scroll (use <code>SliverOverlapAbsorber</code>/<code>NestedScrollView.sliverOverlapAbsorberHandleFor</code>). <code>ScrollController</code> reads offset (parallax, "back to top" button, pagination triggers). <code>RefreshIndicator</code> works with slivers via <code>CustomScrollView</code> physics; Cupertino: <code>CupertinoSliverRefreshControl</code>.<br>
• Do not nest a <code>ListView</code> with <code>shrinkWrap: true</code> inside another scroll view for long content (it builds everything): use slivers instead.`,
          `class StickyHeader extends SliverPersistentHeaderDelegate {
  StickyHeader(this.title);
  final String title;
  @override double get minExtent => 48;
  @override double get maxExtent => 48;
  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) => Container(
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        child: Text(title, style: Theme.of(context).textTheme.titleSmall),
      );
  @override bool shouldRebuild(StickyHeader old) => old.title != title;
}

CustomScrollView(slivers: [
  SliverPersistentHeader(pinned: true, delegate: StickyHeader('Module 1')),
  SliverList.builder(itemCount: 6, itemBuilder: (_, i) => ListTile(title: Text('Lesson \${i + 1}'))),
  SliverPersistentHeader(pinned: true, delegate: StickyHeader('Module 2')),
  SliverList.builder(itemCount: 8, itemBuilder: (_, i) => ListTile(title: Text('Lesson \${i + 7}'))),
]);

// "scroll to top" button
final controller = ScrollController();
controller.addListener(() => setState(() => _showTop = controller.offset > 600));
FloatingActionButton(onPressed: () => controller.animateTo(0, duration: const Duration(milliseconds: 400), curve: Curves.easeOut), child: const Icon(Icons.arrow_upward));`,
        ),
      ],
      [
        blk(`<h3>Sliver pitfalls and performance</h3>
• <b>Unbounded errors</b>: a <code>RenderBox</code> (a normal widget) cannot be placed directly in <code>CustomScrollView.slivers</code>: wrap it in <code>SliverToBoxAdapter</code>; conversely a sliver outside a scroll view fails. Use <code>SliverFillRemaining(hasScrollBody: false)</code> for an empty/footer state that fills the leftover space.<br>
• <b>Laziness</b>: prefer <code>SliverList.builder</code>/<code>SliverGrid.builder</code> and avoid <code>shrinkWrap</code>; give items <code>Key</code>s; set <code>itemExtent</code>/<code>prototypeItem</code> where heights are fixed. Put expensive headers in <code>SliverPersistentHeader</code> with a cheap <code>shouldRebuild</code>.<br>
• <b>Pull-to-refresh and pagination</b>: wrap the <code>CustomScrollView</code> in <code>RefreshIndicator</code>, add a <code>SliverToBoxAdapter</code> loader at the end and trigger the next page from a <code>NotificationListener&lt;ScrollNotification&gt;</code> or a <code>ScrollController</code> near <code>maxScrollExtent</code>.`,
          `CustomScrollView(
  physics: const AlwaysScrollableScrollPhysics(),           // allow pull-to-refresh even with few items
  slivers: [
    const SliverAppBar(pinned: true, title: Text('Courses')),
    SliverList.builder(itemCount: items.length, itemBuilder: (_, i) => ListTile(title: Text(items[i].title))),
    if (items.isEmpty)
      const SliverFillRemaining(hasScrollBody: false, child: Center(child: Text('No courses yet'))),   // fills leftover space
    if (hasMore) const SliverToBoxAdapter(child: Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator()))),
  ],
);

NotificationListener<ScrollNotification>(
  onNotification: (n) {
    if (n.metrics.pixels > n.metrics.maxScrollExtent - 300) loadMore();     // near the end: fetch the next page
    return false;
  },
  child: RefreshIndicator(onRefresh: refresh, child: scrollView),
);`,
        ),
      ],
      [
        ['What is a sliver?', 'A lazily built portion of a scrollable area. CustomScrollView combines slivers (app bars, lists, grids, headers) into one coordinated scroll, enabling collapsing and sticky effects that a single ListView cannot do.'],
        ['SliverList vs ListView?', 'ListView is a convenience widget that wraps a single SliverList in a scroll view; use SliverList inside CustomScrollView when you need to mix it with other slivers in one scroll.'],
        ['Why avoid shrinkWrap ListViews inside scroll views?', 'shrinkWrap forces the list to compute the size of all its children, losing lazy building and hurting performance; slivers keep everything lazy.'],
      ],
    ),
    topic(
      'fl-platform-channels-ffi',
      'Platform Channels and FFI',
      [
        blk(`<h3>Platform channels</h3>
• Flutter cannot call Android (Kotlin/Java) or iOS (Swift) APIs directly. A <b>platform channel</b> passes <b>asynchronous messages</b> between Dart and the host app: <b><code>MethodChannel</code></b> (call a method, get a result), <b><code>EventChannel</code></b> (a stream of events from native to Dart, e.g. sensors), <code>BasicMessageChannel</code>. Both sides use the same <b>channel name</b>. Data types are serialised with the standard codec (null, bool, int, double, String, Uint8List, List, Map).<br>
• Use it when no plugin exists. Prefer an existing plugin; to share your channel code, create a <b>plugin package</b> (<code>flutter create --template=plugin</code>). Use <b>Pigeon</b> to generate type-safe channel code.`,
          `// Dart
class BatteryService {
  static const _channel = MethodChannel('com.javaschoollab.app/battery');
  static const _events = EventChannel('com.javaschoollab.app/battery_events');

  Future<int> level() async {
    try {
      return await _channel.invokeMethod<int>('getBatteryLevel') ?? -1;
    } on PlatformException catch (e) {
      throw Exception('Battery unavailable: \${e.message}');
    }
  }
  Stream<int> get levelChanges => _events.receiveBroadcastStream().cast<int>();
}

// Android (Kotlin): MainActivity.kt
// class MainActivity : FlutterActivity() {
//   override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
//     super.configureFlutterEngine(flutterEngine)
//     MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.javaschoollab.app/battery").setMethodCallHandler { call, result ->
//       when (call.method) {
//         "getBatteryLevel" -> {
//           val bm = getSystemService(BATTERY_SERVICE) as BatteryManager
//           result.success(bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY))
//         }
//         else -> result.notImplemented()
//       }
//     }
//   }
// }`,
        ),
      ],
      [
        blk(`<h3>FFI (Foreign Function Interface)</h3>
• <b><code>dart:ffi</code></b> calls <b>C/C++ (and Rust, via C ABI)</b> libraries <b>directly and synchronously</b> from Dart, without a message-passing layer: good for performance-critical code, existing native libraries (image codecs, crypto, ML, SQLite) and sharing one implementation across platforms.<br>
• Steps: write/obtain the native library, expose a <b>C interface</b>, load it (<code>DynamicLibrary.open</code> / <code>DynamicLibrary.process</code>), look up functions (<code>lookupFunction</code>), convert types with <code>ffi</code> (<code>Pointer</code>, <code>Utf8</code>, <code>calloc</code>/<code>malloc</code> and <b>free what you allocate</b>). <code>ffigen</code> generates bindings from C headers; <code>flutter_rust_bridge</code> for Rust; native assets/hooks (<code>package:native_assets_cli</code>) for building.<br>
• FFI calls block the calling isolate: run long ones in a background isolate.`,
          `import 'dart:ffi';
import 'package:ffi/ffi.dart';

// C: int add(int a, int b);   char* greet(const char* name);   void free_string(char* s);
typedef AddNative = Int32 Function(Int32, Int32);
typedef AddDart = int Function(int, int);
typedef GreetNative = Pointer<Utf8> Function(Pointer<Utf8>);
typedef GreetDart = Pointer<Utf8> Function(Pointer<Utf8>);
typedef FreeNative = Void Function(Pointer<Utf8>);
typedef FreeDart = void Function(Pointer<Utf8>);

final DynamicLibrary lib = Platform.isAndroid ? DynamicLibrary.open('libnative_add.so') : DynamicLibrary.process();
final AddDart add = lib.lookupFunction<AddNative, AddDart>('add');
final GreetDart _greet = lib.lookupFunction<GreetNative, GreetDart>('greet');
final FreeDart _free = lib.lookupFunction<FreeNative, FreeDart>('free_string');

String greet(String name) {
  final input = name.toNativeUtf8();                         // allocate
  final output = _greet(input);
  try {
    return output.toDartString();
  } finally {
    malloc.free(input);                                      // release what we allocated
    _free(output);                                           // and what native code allocated for us
  }
}
print(add(2, 3));                                            // 5`,
        ),
      ],
      [
        blk(`<h3>Channels vs FFI, and plugin/package guidance</h3>
<table ${TABLE}>
<tr><th></th><th>Platform channel</th><th>FFI</th></tr>
<tr><td>Target</td><td>Platform SDK (Kotlin/Swift): permissions, system services</td><td>C/C++/Rust libraries</td></tr>
<tr><td>Calls</td><td>Asynchronous messages (serialised)</td><td>Direct, synchronous calls</td></tr>
<tr><td>Overhead</td><td>Higher per call</td><td>Very low</td></tr>
<tr><td>Typical use</td><td>Bluetooth, biometrics, custom OS integrations</td><td>Algorithms, codecs, crypto, existing native libs</td></tr>
<tr><td>Cross-platform reuse</td><td>Write per platform</td><td>One native implementation</td></tr>
</table>
• Before writing either, search <b>pub.dev</b> (likes, pub points, maintenance, platform support, null safety). Wrap third-party plugins behind your own interface so you can swap or mock them.<br>
• Test channel code with <code>TestDefaultBinaryMessengerBinding</code> / <code>setMockMethodCallHandler</code>; keep native handlers small and well-typed (Pigeon).`,
          `// Mock a channel in a test
TestWidgetsFlutterBinding.ensureInitialized();
TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
  const MethodChannel('com.javaschoollab.app/battery'),
  (call) async => call.method == 'getBatteryLevel' ? 87 : null,
);
expect(await BatteryService().level(), 87);

// Wrap a plugin so features depend on your interface, not the package
abstract interface class ShareService { Future<void> shareText(String text); }
class SharePlusService implements ShareService {
  @override Future<void> shareText(String text) => Share.share(text);
}`,
        ),
      ],
      [
        ['MethodChannel vs EventChannel?', 'MethodChannel performs a request/response call to native code and returns a Future; EventChannel exposes a stream of events from native to Dart (sensors, battery changes).'],
        ['When would you choose FFI over a platform channel?', 'When calling C/C++/Rust code for performance or reuse across platforms. FFI is direct and synchronous; channels are asynchronous message passing to platform SDKs.'],
        ['Why wrap a plugin behind an interface?', 'So features depend on your abstraction, making the plugin replaceable and the code testable with fakes.'],
      ],
    ),
    topic(
      'fl-background-notifications-lifecycle',
      'Background Processing, Notifications, Deep Linking and App Lifecycle',
      [
        blk(`<h3>App lifecycle management</h3>
• The app moves through states: <code>resumed</code> (foreground, interactive), <code>inactive</code> (transition/incoming call), <code>hidden</code>, <code>paused</code> (background), <code>detached</code>. Observe them with <code>WidgetsBindingObserver.didChangeAppLifecycleState</code> or <code>AppLifecycleListener</code>.<br>
• Use it to: pause timers/streams/camera/video when backgrounded, save drafts, refresh data and token on resume, lock the app (biometrics), reconnect sockets, stop location updates. The OS may <b>kill</b> a background app at any time: persist important state (<code>RestorationMixin</code>, database).`,
          `class _HomeState extends State<Home> with WidgetsBindingObserver {
  late final AppLifecycleListener _listener;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _listener = AppLifecycleListener(
      onResume: () => ref.invalidate(coursesProvider),               // refresh when returning to the app
      onPause: () => _saveDraft(),
      onExitRequested: () async => AppExitResponse.exit,
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused: liveChannel.pause(); break;
      case AppLifecycleState.resumed: liveChannel.resume(); break;
      default: break;
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _listener.dispose();
    super.dispose();
  }
}`,
        ),
      ],
      [
        blk(`<h3>Background processing</h3>
• The OS limits background work to save battery. Options: <b>WorkManager</b> (<code>workmanager</code> package): deferrable, guaranteed periodic/one-off tasks (sync every 15+ minutes, upload when on Wi-Fi) using Android WorkManager and iOS <code>BGTaskScheduler</code>; <b>foreground service</b> with a persistent notification (music, tracking, long uploads: <code>flutter_foreground_task</code>); <b>push notifications</b> (data messages) to wake the app for fresh content; <b>isolates</b> only while the app is alive.<br>
• Background callbacks run in a <b>separate isolate without UI</b>: initialise plugins and storage inside the callback (<code>@pragma('vm:entry-point')</code> top-level function). Keep tasks short, idempotent, and respect battery constraints (<code>Constraints(networkType: NetworkType.connected)</code>).`,
          `@pragma('vm:entry-point')                                          // keep the function from being tree-shaken
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    WidgetsFlutterBinding.ensureInitialized();                        // plugins in a background isolate
    final db = AppDatabase(openConnection());
    final api = createApi(await TokenStore().accessToken());
    await SyncService(db, api).trySync();
    return true;                                                      // false/throw: retry with backoff
  });
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Workmanager().initialize(callbackDispatcher, isInDebugMode: false);
  await Workmanager().registerPeriodicTask(
    'sync-courses', 'syncCourses',
    frequency: const Duration(hours: 1),
    constraints: Constraints(networkType: NetworkType.connected, requiresBatteryNotLow: true),
    existingWorkPolicy: ExistingWorkPolicy.keep,
  );
  runApp(const ProviderScope(child: App()));
}`,
        ),
      ],
      [
        blk(`<h3>Local notifications and deep links from notifications</h3>
• <b>flutter_local_notifications</b> shows notifications generated by the app (reminders: "Study time!", download complete): initialise with platform settings, create an <b>Android notification channel</b> (importance, sound), request the <b>POST_NOTIFICATIONS</b> permission on Android 13+ and iOS, schedule with <code>zonedSchedule</code> (timezone package) and handle taps (<code>onDidReceiveNotificationResponse</code>) to <b>navigate to a screen</b> using the payload (a route like <code>/courses/5</code>).<br>
• Remote push is covered in Device Features/Firebase. Both should feed the same <code>navigateFromPayload(path)</code> function that calls <code>router.go(path)</code>: also the entry for <b>deep links</b>.<br>
• Handle three entry states for taps: app <b>terminated</b> (get the launch details), <b>background</b>, <b>foreground</b>.`,
          `final notifications = FlutterLocalNotificationsPlugin();

Future<void> initNotifications(GoRouter router) async {
  tz.initializeTimeZones();
  await notifications.initialize(
    const InitializationSettings(android: AndroidInitializationSettings('@mipmap/ic_launcher'), iOS: DarwinInitializationSettings()),
    onDidReceiveNotificationResponse: (response) {
      final path = response.payload;                                  // e.g. "/courses/5"
      if (path != null) router.go(path);
    },
  );
  await notifications.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()?.requestNotificationsPermission();

  final launch = await notifications.getNotificationAppLaunchDetails();   // tapped while the app was terminated
  if (launch?.didNotificationLaunchApp == true && launch!.notificationResponse?.payload != null) {
    router.go(launch.notificationResponse!.payload!);
  }
}

Future<void> scheduleStudyReminder() => notifications.zonedSchedule(
      1, 'Time to learn', 'Continue your Flutter course',
      tz.TZDateTime.now(tz.local).add(const Duration(hours: 24)),
      const NotificationDetails(android: AndroidNotificationDetails('study', 'Study reminders', importance: Importance.defaultImportance)),
      payload: '/courses/5',
      androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
    );`,
        ),
      ],
      [
        ['How do you run work in the background in Flutter?', 'With WorkManager for deferrable periodic tasks, a foreground service for long visible work, or push notifications to wake the app; callbacks run in a separate isolate without UI and must initialise what they need.'],
        ['Why observe the app lifecycle?', 'To pause or release resources when backgrounded, save state before the OS kills the app, refresh data and tokens when it resumes and re-lock sensitive screens.'],
        ['How do you open a screen from a notification tap?', 'Put a route or id in the notification payload and, in the tap handler (and launch details for the terminated case), call the router (router.go(path)).'],
      ],
    ),
  ]),

  fl(13, 'Device Features', 'Core', [
    topic(
      'fl-camera-gallery-files',
      'Camera, Gallery, Image Picker, File Downloads and Uploads',
      [
        blk(`<h3>Permissions: the common pattern</h3>
• Sensitive features (camera, location, microphone, contacts, notifications, Bluetooth) need <b>runtime permission</b> and a <b>manifest/Info.plist entry</b>. Use <code>permission_handler</code>: <code>Permission.camera.request()</code> returns <code>granted</code>, <code>denied</code>, <code>permanentlyDenied</code>, <code>restricted</code>, <code>limited</code>.<br>
• Best practice: ask <b>in context</b> (when the user taps "Take photo"), explain <b>why</b> first (rationale dialog), handle denial gracefully, and send the user to <b>Settings</b> (<code>openAppSettings()</code>) when permanently denied.`,
          `Future<bool> ensurePermission(Permission permission, BuildContext context, String reason) async {
  var status = await permission.status;
  if (status.isGranted) return true;
  if (status.isDenied) {
    final proceed = await showDialog<bool>(context: context, builder: (c) => AlertDialog(
      title: const Text('Permission needed'), content: Text(reason),
      actions: [TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Not now')), FilledButton(onPressed: () => Navigator.pop(c, true), child: const Text('Continue'))],
    ));
    if (proceed != true) return false;
    status = await permission.request();
    return status.isGranted;
  }
  if (status.isPermanentlyDenied && context.mounted) {
    final open = await showDialog<bool>(context: context, builder: (c) => AlertDialog(
      title: const Text('Enable in Settings'), content: Text(reason),
      actions: [TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Cancel')), FilledButton(onPressed: () => Navigator.pop(c, true), child: const Text('Open settings'))],
    ));
    if (open == true) await openAppSettings();
  }
  return false;
}

// android/app/src/main/AndroidManifest.xml:  <uses-permission android:name="android.permission.CAMERA"/>
// ios/Runner/Info.plist:  <key>NSCameraUsageDescription</key><string>Scan QR codes and take profile photos</string>`,
        ),
      ],
      [
        blk(`<h3>Camera and gallery</h3>
• <b>image_picker</b>: <code>pickImage(source: ImageSource.camera|gallery)</code>, <code>pickMultiImage</code>, <code>pickVideo</code> - uses the system camera/photo picker (no camera permission needed on modern Android for the picker; the camera intent may need it). <b>camera</b> package: live preview (<code>CameraController</code>, <code>CameraPreview</code>, <code>takePicture</code>, <code>startVideoRecording</code>) for custom camera UIs, QR/document scanning (<code>mobile_scanner</code>).<br>
• Reduce size at pick time (<code>maxWidth</code>, <code>imageQuality</code>); show a preview; handle <code>null</code> (cancelled); dispose <code>CameraController</code> and manage <b>lifecycle</b> (pause on background).`,
          `final picker = ImagePicker();

Future<File?> takePhoto() async {
  final x = await picker.pickImage(source: ImageSource.camera, maxWidth: 1600, imageQuality: 85, preferredCameraDevice: CameraDevice.rear);
  return x == null ? null : File(x.path);
}
Future<List<File>> pickMany() async =>
    (await picker.pickMultiImage(limit: 5, imageQuality: 80)).map((x) => File(x.path)).toList();

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});
  @override State<CameraScreen> createState() => _CameraScreenState();
}
class _CameraScreenState extends State<CameraScreen> with WidgetsBindingObserver {
  CameraController? _controller;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _init();
  }
  Future<void> _init() async {
    final cameras = await availableCameras();
    final controller = CameraController(cameras.first, ResolutionPreset.high, enableAudio: false);
    await controller.initialize();
    if (mounted) setState(() => _controller = controller);
  }
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.inactive) { _controller?.dispose(); _controller = null; }
    if (state == AppLifecycleState.resumed && _controller == null) _init();
  }
  @override
  void dispose() { WidgetsBinding.instance.removeObserver(this); _controller?.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final c = _controller;
    if (c == null || !c.value.isInitialized) return const Center(child: CircularProgressIndicator());
    return Stack(children: [
      CameraPreview(c),
      Positioned(bottom: 24, left: 0, right: 0, child: Center(child: FloatingActionButton(onPressed: () async {
        final shot = await c.takePicture();
        if (context.mounted) Navigator.pop(context, File(shot.path));
      }, child: const Icon(Icons.camera_alt)))),
    ]);
  }
}`,
        ),
      ],
      [
        blk(`<h3>File downloads and uploads</h3>
• <b>Downloads</b>: <code>Dio().download(url, savePath, onReceiveProgress: ...)</code> streams to disk (resume with <code>Range</code> headers); save to the app documents directory, then <b>open</b> with <code>open_filex</code>/<code>open_file</code> or share. For public downloads on Android 10+ use the <b>MediaStore</b> API (<code>gal</code>, <code>saver_gallery</code>, <code>media_store_plus</code>). Show a notification and progress; large/background downloads: <code>background_downloader</code>.<br>
• <b>Uploads</b>: multipart with Dio (see the upload form lesson), progress, cancel, retry, compress before sending; on Spring Boot store with generated names and validate size/type.<br>
• Verify integrity (checksum) for important files; handle low storage and network drops.`,
          `Future<File> downloadCertificate(int courseId, {required void Function(double) onProgress, CancelToken? cancel}) async {
  final dir = await getApplicationDocumentsDirectory();
  final path = '\${dir.path}/certificate-$courseId.pdf';
  await dio.download(
    '/api/certificates/$courseId',
    path,
    cancelToken: cancel,
    onReceiveProgress: (received, total) => onProgress(total <= 0 ? 0 : received / total),
    options: Options(headers: {'Accept': 'application/pdf'}),
  );
  return File(path);
}

final file = await downloadCertificate(5, onProgress: (p) => setState(() => _progress = p));
await OpenFilex.open(file.path);                                    // open in a PDF viewer
await Share.shareXFiles([XFile(file.path)], text: 'My certificate');

await Gal.putImage(file.path, album: 'JavaSchoolLab');              // save an image to the gallery (MediaStore on Android 10+)`,
        ),
      ],
      [
        ['How should you ask for a runtime permission?', 'In context when the feature is used, with a short explanation first; handle denial gracefully, and when it is permanently denied direct the user to app settings with openAppSettings().'],
        ['image_picker vs camera package?', 'image_picker launches the system camera or photo picker and returns a file (simple). The camera package gives a live preview and full control for custom camera UIs, scanners and video recording.'],
        ['How do you save a downloaded image to the gallery on Android 10+?', 'Use MediaStore through a plugin such as gal or saver_gallery instead of writing to arbitrary external paths, because scoped storage restricts direct file access.'],
      ],
    ),
    topic(
      'fl-location-permissions-sensors',
      'Location, GPS, Bluetooth and Sensors',
      [
        blk(`<h3>Location services and GPS</h3>
• <code>geolocator</code> reads the position: <code>Geolocator.isLocationServiceEnabled()</code>, <code>checkPermission()/requestPermission()</code>, <code>getCurrentPosition(locationSettings: LocationSettings(accuracy: LocationAccuracy.high))</code>, <code>getLastKnownPosition()</code> (fast), <code>getPositionStream()</code> (tracking with <code>distanceFilter</code>). <code>geocoding</code> converts coordinates to addresses.<br>
• Manifest: <code>ACCESS_COARSE_LOCATION</code>/<code>ACCESS_FINE_LOCATION</code> (Android); <code>NSLocationWhenInUseUsageDescription</code> (iOS). <b>Background location</b> needs extra permission and a foreground service, and heavy store review: avoid unless essential. Choose <b>lowest accuracy</b> that works to save battery.`,
          `Future<Position> currentPosition() async {
  if (!await Geolocator.isLocationServiceEnabled()) throw const LocationDisabled();
  var permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) permission = await Geolocator.requestPermission();
  if (permission == LocationPermission.denied) throw const PermissionDenied();
  if (permission == LocationPermission.deniedForever) { await Geolocator.openAppSettings(); throw const PermissionDenied(permanent: true); }
  return Geolocator.getCurrentPosition(locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium, timeLimit: Duration(seconds: 10)));
}

Stream<Position> trackRun() => Geolocator.getPositionStream(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 10),   // only every 10 metres
    );

final distanceM = Geolocator.distanceBetween(startLat, startLng, endLat, endLng);
final places = await placemarkFromCoordinates(pos.latitude, pos.longitude);`,
        ),
      ],
      [
        blk(`<h3>Bluetooth (BLE)</h3>
• <code>flutter_blue_plus</code> (BLE central role): scan (<code>FlutterBluePlus.startScan</code>), connect (<code>device.connect()</code>), discover services, read/write/subscribe to <b>characteristics</b> (GATT), listen to <code>connectionState</code>. Needs Bluetooth permissions (Android 12+: <code>BLUETOOTH_SCAN</code>, <code>BLUETOOTH_CONNECT</code>; location on older versions; iOS <code>NSBluetoothAlwaysUsageDescription</code>).<br>
• Handle: adapter off, permission denied, device out of range, reconnect, MTU, timeouts; always <b>stop scanning</b> and <b>disconnect</b> when done. Classic Bluetooth (SPP) needs other packages. Not available on iOS simulators.`,
          `Future<void> scanAndConnect() async {
  if (await FlutterBluePlus.adapterState.first != BluetoothAdapterState.on) throw const BluetoothOff();

  final sub = FlutterBluePlus.scanResults.listen((results) async {
    for (final r in results) {
      if (r.device.platformName.startsWith('JSL-')) {
        await FlutterBluePlus.stopScan();
        await r.device.connect(timeout: const Duration(seconds: 10));
        final services = await r.device.discoverServices();
        for (final s in services) {
          for (final c in s.characteristics) {
            if (c.properties.notify) { await c.setNotifyValue(true); c.onValueReceived.listen((bytes) => debugPrint('data: $bytes')); }
          }
        }
      }
    }
  });
  await FlutterBluePlus.startScan(timeout: const Duration(seconds: 8), withNames: const []);
  await Future<void>.delayed(const Duration(seconds: 9));
  await sub.cancel();
}`,
        ),
      ],
      [
        blk(`<h3>Sensors</h3>
• <code>sensors_plus</code> streams <b>accelerometer</b>, <b>user accelerometer</b>, <b>gyroscope</b>, <b>magnetometer</b>: <code>accelerometerEventStream(samplingPeriod: SensorInterval.normalInterval)</code>. Use for shake detection, step-like motion, tilt UI, compass (with <code>flutter_compass</code>); <code>pedometer</code>, <code>light</code>, <code>proximity</code> via other plugins.<br>
• Sensors drain battery: choose a coarse sampling interval, <b>cancel subscriptions</b> when the screen is hidden, and throttle processing. Always handle devices without a given sensor (errors on the stream).`,
          `StreamSubscription<UserAccelerometerEvent>? _shake;

void startShakeDetection(VoidCallback onShake) {
  var last = DateTime.fromMillisecondsSinceEpoch(0);
  _shake = userAccelerometerEventStream(samplingPeriod: SensorInterval.gameInterval).listen((e) {
    final force = sqrt(e.x * e.x + e.y * e.y + e.z * e.z);
    final now = DateTime.now();
    if (force > 15 && now.difference(last) > const Duration(seconds: 1)) {     // debounce
      last = now;
      onShake();
    }
  }, onError: (_) {/* no sensor on this device */});
}
void stopShakeDetection() { _shake?.cancel(); _shake = null; }

// tilt-controlled UI
accelerometerEventStream().listen((e) => setState(() => _tilt = e.x / 9.8));`,
        ),
      ],
      [
        ['How do you save battery when using GPS?', 'Use the lowest accuracy that satisfies the feature, a distanceFilter for streams, getLastKnownPosition when possible, stop streams when not needed and avoid background location unless essential.'],
        ['What is a BLE characteristic?', 'A GATT data point exposed by a Bluetooth Low Energy device inside a service. You can read, write or subscribe to notifications on it to exchange data.'],
        ['Why cancel sensor subscriptions in dispose?', 'Sensor streams run continuously and consume battery and CPU; leaving them subscribed after the screen is gone wastes resources and may call setState on a disposed widget.'],
      ],
    ),
    topic(
      'fl-share-clipboard-connectivity-contacts',
      'Share, Clipboard, Connectivity Monitoring and Contacts',
      [
        blk(`<h3>Share and Clipboard</h3>
• <b>share_plus</b> opens the native share sheet: <code>Share.share(text, subject: ...)</code>, <code>Share.shareXFiles([XFile(path)])</code> (e.g. a certificate PDF). Share a <b>deep link</b> (<code>https://app.javaschoollab.com/courses/5</code>) so recipients open the right screen.<br>
• <b>Clipboard</b> (built in): <code>Clipboard.setData(ClipboardData(text: ...))</code>, <code>Clipboard.getData(Clipboard.kTextPlain)</code>. Show a confirmation SnackBar. Do not read the clipboard silently (privacy; Android 12+/iOS show a toast); avoid copying secrets and clear sensitive clipboard content.`,
          `Future<void> shareCourse(Course c) =>
    Share.share('Check out "\${c.title}" on JavaSchoolLab: https://app.javaschoollab.com/courses/\${c.id}', subject: c.title);

Future<void> shareCertificate(File pdf) => Share.shareXFiles([XFile(pdf.path, mimeType: 'application/pdf')], text: 'My JavaSchoolLab certificate');

Future<void> copyReferral(BuildContext context, String code) async {
  await Clipboard.setData(ClipboardData(text: code));
  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Referral code copied')));
}
Future<String?> pasteCode() async => (await Clipboard.getData(Clipboard.kTextPlain))?.text?.trim();`,
        ),
      ],
      [
        blk(`<h3>Connectivity monitoring</h3>
• <code>connectivity_plus</code>: <code>Connectivity().checkConnectivity()</code> and <code>onConnectivityChanged</code> (a <code>List&lt;ConnectivityResult&gt;</code>: wifi, mobile, ethernet, vpn, bluetooth, none). It reports the <b>interface</b>, not real internet access: use <code>internet_connection_checker_plus</code> (pings) or treat request failures as the truth.<br>
• Show an <b>offline banner</b>, pause/queue syncing while offline, retry when back online, and let users keep using cached content. Provide the status app-wide via a Riverpod <code>StreamProvider</code>.`,
          `final onlineProvider = StreamProvider<bool>((ref) async* {
  final c = Connectivity();
  bool isOnline(List<ConnectivityResult> r) => !r.contains(ConnectivityResult.none);
  yield isOnline(await c.checkConnectivity());
  yield* c.onConnectivityChanged.map(isOnline).distinct();
});

class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final online = ref.watch(onlineProvider).valueOrNull ?? true;
    return AnimatedSize(
      duration: const Duration(milliseconds: 200),
      child: online ? const SizedBox(width: double.infinity) : Container(
        width: double.infinity, color: Colors.orange.shade800, padding: const EdgeInsets.all(8),
        child: const Text('You are offline. Showing saved content.', style: TextStyle(color: Colors.white), textAlign: TextAlign.center),
      ),
    );
  }
}

// resume syncing when we come back online
ref.listen(onlineProvider, (prev, next) { if (next.valueOrNull == true) ref.read(syncServiceProvider).trySync(); });`,
        ),
      ],
      [
        blk(`<h3>Contacts integration</h3>
• <code>flutter_contacts</code> (or <code>contacts_service</code> successors): request <code>READ_CONTACTS</code> (Android) / <code>NSContactsUsageDescription</code> (iOS), then <code>FlutterContacts.getContacts(withProperties: true)</code> or the <b>system contact picker</b> (<code>FlutterContacts.openExternalPick()</code>) which needs <b>no permission</b> and returns only the chosen contact (preferred: privacy-friendly).<br>
• Typical use: invite friends, referral. Treat contacts as sensitive personal data: ask only when needed, hash phone numbers before sending to your server, state the purpose, and comply with privacy rules (GDPR/DPDP); Play Store requires a clear declaration.`,
          `Future<Contact?> pickContact() async {
  // The system picker returns just one contact and needs no READ_CONTACTS permission
  return FlutterContacts.openExternalPick();
}

Future<List<String>> inviteCandidates() async {
  if (!await FlutterContacts.requestPermission(readonly: true)) return const [];
  final contacts = await FlutterContacts.getContacts(withProperties: true);
  return [for (final c in contacts) if (c.phones.isNotEmpty) normalize(c.phones.first.number)];
}

// privacy: send hashes, not raw numbers
String hashNumber(String e164) => sha256.convert(utf8.encode(e164)).toString();`,
        ),
      ],
      [
        ['Does connectivity_plus tell you that the internet works?', 'No. It reports the active network interface (wifi, mobile, none), not real internet reachability; verify with an actual request or an internet checker and treat request failures as the truth.'],
        ['Why prefer the system contact picker?', 'It returns only the contact the user chooses without requiring the READ_CONTACTS permission, which is more privacy-friendly and easier to get through store review.'],
        ['How do you share a link that opens a specific screen?', 'Share an HTTPS deep link (https://app.javaschoollab.com/courses/5) configured with Android App Links/iOS Universal Links, handled by the router.'],
      ],
    ),
    topic(
      'fl-push-notifications',
      'Push Notifications and Firebase Cloud Messaging',
      [
        blk(`<h3>How push notifications work</h3>
• <b>Firebase Cloud Messaging (FCM)</b> delivers push messages to Android (and iOS via APNs). Flow: the app gets an <b>FCM registration token</b> → sends it to <b>your Spring Boot server</b> (<code>POST /api/devices</code>, linked to the user) → the server (Firebase Admin SDK for Java) sends a message to a token, a <b>topic</b> (<code>course-updates</code>) or a condition → FCM delivers it → the app shows it and handles the tap.<br>
• Message types: <b>notification messages</b> (FCM displays them automatically when the app is in the background), <b>data messages</b> (custom key-values handled by your code, can wake the app briefly), or both.<br>
• Setup: Firebase project, <code>flutterfire configure</code>, <code>firebase_core</code> + <code>firebase_messaging</code>, Android notification permission (13+), iOS: APNs key in Firebase, capabilities (Push, Background Modes).`,
          `Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);       // top-level function
  runApp(const ProviderScope(child: App()));
}

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint('background message \${message.messageId}');
}

class PushService {
  final _fcm = FirebaseMessaging.instance;

  Future<void> init(GoRouter router, DeviceApi api) async {
    final settings = await _fcm.requestPermission(alert: true, badge: true, sound: true);       // Android 13+ and iOS prompt
    if (settings.authorizationStatus == AuthorizationStatus.denied) return;

    final token = await _fcm.getToken();
    if (token != null) await api.register(token);                                   // POST /api/devices
    _fcm.onTokenRefresh.listen(api.register);                                       // tokens change: keep the server in sync

    FirebaseMessaging.onMessage.listen((m) => showLocalNotification(m));            // foreground: FCM does not show UI by itself
    FirebaseMessaging.onMessageOpenedApp.listen((m) => _open(router, m));           // tapped while in background

    final initial = await _fcm.getInitialMessage();                                 // tapped while terminated
    if (initial != null) _open(router, initial);

    await _fcm.subscribeToTopic('course-updates');
  }

  void _open(GoRouter router, RemoteMessage m) {
    final path = m.data['path'] as String?;                                         // e.g. "/courses/5"
    if (path != null && path.startsWith('/')) router.go(path);                      // validate before navigating
  }
}`,
        ),
      ],
      [
        blk(`<h3>Sending from Spring Boot</h3>
• Add the <b>Firebase Admin SDK</b> (<code>com.google.firebase:firebase-admin</code>), load the service-account credentials from a secret file/environment (never commit it), and keep a <code>device_tokens</code> table (userId, token, platform, lastSeen). Remove tokens that return <code>UNREGISTERED</code>.<br>
• Send by token (personal notifications), by topic (broadcast) or multicast. Put the navigation <b>path</b> in <code>data</code>. Respect user notification settings (store preferences per category) and quiet hours; rate-limit.`,
          `// Spring Boot (Java)
// @Service
// class PushService {
//   void notifyUser(long userId, String title, String body, String path) throws FirebaseMessagingException {
//     for (DeviceToken t : tokens.findByUserId(userId)) {
//       Message msg = Message.builder()
//           .setToken(t.getToken())
//           .setNotification(Notification.builder().setTitle(title).setBody(body).build())
//           .putData("path", path)
//           .setAndroidConfig(AndroidConfig.builder().setPriority(AndroidConfig.Priority.HIGH).build())
//           .build();
//       try { FirebaseMessaging.getInstance().send(msg); }
//       catch (FirebaseMessagingException e) {
//         if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) tokens.delete(t);   // clean stale tokens
//         else throw e;
//       }
//     }
//   }
// }
//
// @PostMapping("/api/devices") void register(@RequestBody DeviceRequest r, Authentication auth) { tokens.upsert(userId(auth), r.token(), r.platform()); }`,
        ),
      ],
      [
        blk(`<h3>Notification UX and reliability</h3>
• <b>Android channels</b> let users control categories (create them: "Course updates", "Reminders"); show a rationale before the permission prompt and let users manage preferences in-app. <b>Foreground messages</b> are not shown automatically: display with <code>flutter_local_notifications</code>.<br>
• Reliability: delivery is best-effort; do not rely on push for critical state; keep <b>token registration</b> fresh (on login, token refresh, app start), unregister on logout, and use <b>data + deep link</b> payloads; test on real devices; background handler must be a top-level function.<br>
• Privacy: no sensitive data in the payload; fetch details after the tap.`,
          `const channel = AndroidNotificationChannel('course_updates', 'Course updates', description: 'New lessons and announcements', importance: Importance.high);

Future<void> showLocalNotification(RemoteMessage m) async {
  final n = m.notification;
  if (n == null) return;
  await notifications.show(
    m.hashCode, n.title, n.body,
    NotificationDetails(android: AndroidNotificationDetails(channel.id, channel.name, channelDescription: channel.description, importance: Importance.high)),
    payload: m.data['path'] as String?,
  );
}

// logout: remove this device from the user
await api.unregister(await FirebaseMessaging.instance.getToken());
await FirebaseMessaging.instance.deleteToken();`,
        ),
      ],
      [
        ['What is an FCM registration token?', 'A unique identifier for an app instance on a device that FCM uses to deliver messages. The app sends it to your server, which then targets it (or a topic) when sending notifications; it can change, so listen for refresh.'],
        ['Why are foreground FCM notifications not shown automatically?', 'When the app is in the foreground FCM delivers the message to your code (onMessage) instead of the system tray, so you must display it yourself, typically with flutter_local_notifications.'],
        ['How do you open the right screen from a push?', 'Send a path in the data payload, and handle getInitialMessage (terminated), onMessageOpenedApp (background) and local notification taps by validating the path and calling the router.'],
      ],
    ),
  ]),

  fl(14, 'Firebase Integration', 'Core', [
    topic(
      'fl-firebase-setup-auth',
      'Firebase Setup and Firebase Authentication',
      [
        blk(`<h3>Set up Firebase in Flutter</h3>
• <b>Firebase</b> is Google's backend-as-a-service: authentication, databases (Firestore, Realtime DB), storage, messaging, analytics, crash reporting, remote config, hosting. Use it <b>next to</b> your Spring Boot backend for what it does best (push, analytics, crash reports, optionally auth), not as a second source of truth for the same data.<br>
• Steps: create a project in the Firebase console → install the CLIs (<code>npm i -g firebase-tools</code>, <code>dart pub global activate flutterfire_cli</code>) → <code>flutterfire configure</code> generates <code>firebase_options.dart</code> (and platform files <code>google-services.json</code>/<code>GoogleService-Info.plist</code>) → <code>flutter pub add firebase_core</code> → <code>await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform)</code> in <code>main()</code>. Use separate Firebase projects for dev and prod.`,
          `# terminal
npm install -g firebase-tools
firebase login
dart pub global activate flutterfire_cli
flutterfire configure --project=javaschoollab-dev --platforms=android,ios
flutter pub add firebase_core firebase_auth cloud_firestore firebase_storage firebase_messaging firebase_crashlytics firebase_analytics firebase_remote_config

// main.dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const ProviderScope(child: App()));
}

// android/app/build.gradle.kts: plugins { id("com.google.gms.google-services") }   (added by the CLI)`,
        ),
      ],
      [
        blk(`<h3>Firebase Authentication</h3>
• <code>firebase_auth</code> supports email/password, phone (SMS OTP), anonymous, and <b>federated providers</b> (Google via <code>google_sign_in</code>, Apple, Facebook, GitHub). Enable providers in the console; for Google add the <b>SHA-1/SHA-256</b> fingerprints of your debug and release keys in project settings.<br>
• API: <code>createUserWithEmailAndPassword</code>, <code>signInWithEmailAndPassword</code>, <code>signInWithCredential</code>, <code>sendPasswordResetEmail</code>, <code>signOut</code>; observe with <code>authStateChanges()</code>/<code>idTokenChanges()</code>; <code>user.getIdToken()</code> returns a <b>JWT</b> you can send to Spring Boot.`,
          `final _auth = FirebaseAuth.instance;

Stream<User?> get authChanges => _auth.authStateChanges();

Future<UserCredential> register(String email, String password) =>
    _auth.createUserWithEmailAndPassword(email: email, password: password);

Future<UserCredential> signIn(String email, String password) async {
  try {
    return await _auth.signInWithEmailAndPassword(email: email, password: password);
  } on FirebaseAuthException catch (e) {
    throw switch (e.code) {
      'invalid-credential' || 'wrong-password' || 'user-not-found' => const Failure('Invalid email or password'),
      'too-many-requests' => const Failure('Too many attempts. Try again later.'),
      'network-request-failed' => const NetworkFailure(),
      _ => Failure(e.message ?? 'Sign-in failed'),
    };
  }
}

Future<UserCredential> signInWithGoogle() async {
  final google = await GoogleSignIn().signIn();
  if (google == null) throw const Failure('Cancelled');
  final auth = await google.authentication;
  return _auth.signInWithCredential(GoogleAuthProvider.credential(accessToken: auth.accessToken, idToken: auth.idToken));
}

await _auth.sendPasswordResetEmail(email: email);
await _auth.signOut();`,
        ),
      ],
      [
        blk(`<h3>Firebase Auth with a Spring Boot backend</h3>
• Two designs: (1) <b>Firebase as the identity provider</b>: the app signs in with Firebase, sends <code>await user.getIdToken()</code> as <code>Authorization: Bearer</code>, and Spring Boot <b>verifies the Firebase ID token</b> (Firebase Admin SDK <code>FirebaseAuth.getInstance().verifyIdToken</code>, or configure the JWT resource server with Google's JWKS/issuer <code>https://securetoken.google.com/&lt;project-id&gt;</code>) and maps <code>uid</code>/email to your user; roles live in <b>custom claims</b> or your database. (2) Keep <b>Spring Security's own login</b> (JWT) and use Firebase only for push/analytics: simpler when the web app already uses it.<br>
• Do not trust client-side claims; always verify the token on the server. Refresh: <code>getIdToken()</code> returns a fresh token (cached ~1 h); the Firebase SDK handles refresh.`,
          `// Dio interceptor adding a fresh Firebase ID token
class FirebaseTokenInterceptor extends Interceptor {
  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await FirebaseAuth.instance.currentUser?.getIdToken();       // refreshed automatically when needed
    if (token != null) options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  }
}

// Spring Boot (Java): verify the Firebase ID token
// @Component class FirebaseTokenFilter extends OncePerRequestFilter {
//   protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws IOException, ServletException {
//     String header = req.getHeader("Authorization");
//     if (header != null && header.startsWith("Bearer ")) {
//       try {
//         FirebaseToken t = FirebaseAuth.getInstance().verifyIdToken(header.substring(7));
//         var auth = new UsernamePasswordAuthenticationToken(t.getUid(), null, authoritiesFor(t));    // roles from custom claims
//         SecurityContextHolder.getContext().setAuthentication(auth);
//       } catch (FirebaseAuthException e) { res.sendError(HttpServletResponse.SC_UNAUTHORIZED); return; }
//     }
//     chain.doFilter(req, res);
//   }
// }`,
        ),
      ],
      [
        ['Why add SHA-1 fingerprints for Google sign-in?', 'Firebase/Google verify that the sign-in request comes from your signed app by matching the app\'s signing certificate fingerprint; without the debug and release SHA-1/SHA-256 keys sign-in fails.'],
        ['How can Spring Boot trust a Firebase user?', 'The app sends the Firebase ID token; Spring verifies its signature, issuer and audience (Firebase Admin SDK or JWT resource server) and maps the uid/claims to a local user; it must never trust unverified client claims.'],
        ['authStateChanges vs idTokenChanges?', 'authStateChanges fires on sign-in and sign-out; idTokenChanges also fires when the ID token is refreshed, useful when you keep the token in memory.'],
      ],
    ),
    topic(
      'fl-firestore-rtdb-storage',
      'Cloud Firestore, Realtime Database, Storage and Security Rules',
      [
        blk(`<h3>Cloud Firestore</h3>
• <b>Firestore</b> is a serverless NoSQL <b>document database</b>: <b>collections</b> contain <b>documents</b> (JSON-like maps) that can have <b>subcollections</b>. It supports <b>real-time listeners</b> (<code>snapshots()</code>), queries (<code>where</code>, <code>orderBy</code>, <code>limit</code>, cursors), composite indexes, transactions, batched writes, offline persistence (built in) and security rules.<br>
• Model for your queries (denormalise): no joins. Use typed access with <code>withConverter&lt;T&gt;(fromFirestore, toFirestore)</code>. Pricing is per read/write/delete: avoid listening to huge collections; paginate with <code>startAfterDocument</code>.<br>
• Use it for features needing realtime/offline with little backend (chat, live comments, presence); keep core relational data (users, courses, payments) in your Spring Boot + SQL database.`,
          `final db = FirebaseFirestore.instance;

final messages = db.collection('chats').doc(chatId).collection('messages').withConverter<Message>(
      fromFirestore: (snap, _) => Message.fromJson({...snap.data()!, 'id': snap.id}),
      toFirestore: (m, _) => m.toJson(),
    );

Future<void> send(String text, String uid) => messages.add(Message(text: text, senderId: uid, createdAt: DateTime.now()));

Stream<List<Message>> watchMessages() =>
    messages.orderBy('createdAt', descending: true).limit(50).snapshots().map((s) => s.docs.map((d) => d.data()).toList());

Future<List<Message>> older(DocumentSnapshot last) async =>
    (await messages.orderBy('createdAt', descending: true).startAfterDocument(last).limit(50).get()).docs.map((d) => d.data()).toList();

await db.runTransaction((tx) async {
  final ref = db.collection('courses').doc('c1');
  final snap = await tx.get(ref);
  tx.update(ref, {'enrolled': (snap.data()!['enrolled'] as int) + 1});
});

await db.collection('users').doc(uid).set({'name': 'Asha', 'updatedAt': FieldValue.serverTimestamp()}, SetOptions(merge: true));`,
        ),
      ],
      [
        blk(`<h3>Realtime Database and Cloud Storage</h3>
• <b>Realtime Database</b> is Firebase's original JSON-tree database with very low-latency listeners (<code>ref.onValue</code>), simple data and presence (<code>.info/connected</code>, <code>onDisconnect</code>). Firestore is usually preferred for richer queries; choose Realtime DB for high-frequency small updates and presence.<br>
• <b>Cloud Storage for Firebase</b> stores user files (images, videos, documents) in Google Cloud Storage buckets: <code>FirebaseStorage.instance.ref('avatars/$uid.jpg').putFile(file)</code> returns an <code>UploadTask</code> with a progress stream; <code>getDownloadURL()</code> gives a tokenised URL. Organise paths per user, set <b>metadata</b> (content type), compress images before upload, and secure with <b>Storage rules</b>.`,
          `// Realtime Database: online presence
final ref = FirebaseDatabase.instance.ref('presence/$uid');
FirebaseDatabase.instance.ref('.info/connected').onValue.listen((event) async {
  if (event.snapshot.value == true) {
    await ref.onDisconnect().set({'online': false, 'lastSeen': ServerValue.timestamp});
    await ref.set({'online': true, 'lastSeen': ServerValue.timestamp});
  }
});
FirebaseDatabase.instance.ref('presence').onValue.listen((e) => debugPrint('\${e.snapshot.children.length} users'));

// Storage upload with progress
Future<String> uploadAvatar(File file, String uid, void Function(double) onProgress) async {
  final ref = FirebaseStorage.instance.ref('users/$uid/avatar.jpg');
  final task = ref.putFile(file, SettableMetadata(contentType: 'image/jpeg'));
  task.snapshotEvents.listen((s) => onProgress(s.totalBytes == 0 ? 0 : s.bytesTransferred / s.totalBytes));
  await task;
  return ref.getDownloadURL();
}
await FirebaseStorage.instance.ref('users/$uid/avatar.jpg').delete();`,
        ),
      ],
      [
        blk(`<h3>Firebase Security Rules</h3>
• <b>Security rules</b> run on Google's servers and decide who can read/write each document or file: this is your <b>authorisation layer</b> because the app talks to Firebase directly. The default "test mode" (open for 30 days) is <b>dangerous</b>: lock rules before launch.<br>
• Rules see <code>request.auth</code> (uid, token claims), <code>request.resource.data</code> (incoming data), <code>resource.data</code> (existing data). Validate ownership, types, sizes and allowed fields; deny by default; test with the <b>Emulator Suite</b> and <code>@firebase/rules-unit-testing</code>. Use custom claims for roles (<code>request.auth.token.admin == true</code>).`,
          `// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isOwner(uid) { return signedIn() && request.auth.uid == uid; }
    function isAdmin() { return signedIn() && request.auth.token.admin == true; }

    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow create, update: if isOwner(uid)
        && request.resource.data.keys().hasOnly(['name', 'bio', 'updatedAt'])          // only these fields
        && request.resource.data.name is string && request.resource.data.name.size() <= 80;
      allow delete: if isAdmin();
    }
    match /chats/{chatId}/messages/{msgId} {
      allow read: if signedIn() && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.members;
      allow create: if signedIn() && request.resource.data.senderId == request.auth.uid
        && request.resource.data.text is string && request.resource.data.text.size() <= 2000;
      allow update, delete: if false;
    }
    match /{document=**} { allow read, write: if false; }                              // default deny
  }
}

// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{uid}/{file} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid && request.resource.size < 5 * 1024 * 1024 && request.resource.contentType.matches('image/.*');
    }
  }
}`,
        ),
      ],
      [
        ['Firestore vs Realtime Database?', 'Firestore is a document database with richer queries, indexing, scaling and offline support; Realtime Database is a single JSON tree with very low latency, suited to presence and high-frequency small updates.'],
        ['Why are Firebase security rules critical?', 'The app accesses Firebase directly, so the rules are the only authorisation layer. Open rules let anyone read or modify your data; use deny-by-default rules that check auth, ownership and data shape.'],
        ['Should Firestore replace your Spring Boot database?', 'Not for core relational data. Use it for realtime/offline features (chat, presence) while Spring Boot with SQL remains the source of truth for users, courses and payments.'],
      ],
    ),
    topic(
      'fl-firebase-cloud-services',
      'Cloud Messaging, Crashlytics, Analytics and Remote Config',
      [
        blk(`<h3>Crashlytics</h3>
• <b>Crashlytics</b> collects crashes and non-fatal errors with stack traces, device and OS info, breadcrumb logs and custom keys, grouped and alerted in the Firebase console. Set up: <code>firebase_crashlytics</code>, Gradle plugin, then forward Flutter errors; upload <b>symbol files</b> for obfuscated builds (<code>--split-debug-info</code>).<br>
• Set the user id (not email) and custom keys (screen, plan), log breadcrumbs (<code>log</code>), record non-fatal exceptions you handle (<code>recordError(..., fatal: false)</code>), and disable collection in debug.`,
          `Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(!kDebugMode);

  FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;       // framework errors
  PlatformDispatcher.instance.onError = (error, stack) {                              // async errors
    FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    return true;
  };
  runApp(const ProviderScope(child: App()));
}

await FirebaseCrashlytics.instance.setUserIdentifier(user.id.toString());
await FirebaseCrashlytics.instance.setCustomKey('plan', user.plan);
FirebaseCrashlytics.instance.log('opened course \${course.id}');
try { await risky(); } catch (e, st) { FirebaseCrashlytics.instance.recordError(e, st, reason: 'checkout failed', fatal: false); }`,
        ),
      ],
      [
        blk(`<h3>Analytics</h3>
• <b>Google Analytics for Firebase</b> (<code>firebase_analytics</code>) logs events and user properties: automatic events (first_open, session_start, screen_view with a navigator observer) and custom events (<code>course_enrolled</code>, <code>lesson_completed</code>). Define an <b>event plan</b> (names, parameters) first; limit to 500 distinct events; use snake_case; <b>never log personal data</b> (email, name, phone).<br>
• Get consent where required (GDPR/DPDP): disable collection until accepted (<code>setAnalyticsCollectionEnabled</code>). Use <b>funnels</b> (sign-up → enrol → complete) and <b>audiences</b> in the console; debug with DebugView.`,
          `final analytics = FirebaseAnalytics.instance;

await analytics.logEvent(name: 'course_enrolled', parameters: {'course_id': course.id, 'price': course.price, 'currency': 'INR'});
await analytics.logLogin(loginMethod: 'email');
await analytics.setUserProperty(name: 'plan', value: user.plan);
await analytics.setUserId(id: user.id.toString());
await analytics.logScreenView(screenName: 'CourseDetail');

// automatic screen tracking with GoRouter
GoRouter(observers: [FirebaseAnalyticsObserver(analytics: analytics)], routes: [/* ... */]);

// consent
await analytics.setAnalyticsCollectionEnabled(userConsented);

// debug on a device
// adb shell setprop debug.firebase.analytics.app com.javaschoollab.app`,
        ),
      ],
      [
        blk(`<h3>Remote Config and FCM roles</h3>
• <b>Remote Config</b> (<code>firebase_remote_config</code>) changes app behaviour and look <b>without a release</b>: feature flags, A/B tests, minimum supported version ("force update"), maintenance mode, promo banners, API base URLs, copy text. Set <b>in-app defaults</b>, <code>fetchAndActivate()</code> with a sensible <code>minimumFetchInterval</code> (12 h in production, 0 in debug), and use <b>conditions</b> (country, app version, user property) and rollouts.<br>
• <b>Cloud Messaging</b> (see the push lesson) delivers notifications; combine: Analytics audiences + FCM topics for targeted campaigns, Remote Config for flags.<br>
• Never put secrets in Remote Config values (they are readable by the app).`,
          `final rc = FirebaseRemoteConfig.instance;

Future<void> initRemoteConfig() async {
  await rc.setConfigSettings(RemoteConfigSettings(
    fetchTimeout: const Duration(seconds: 10),
    minimumFetchInterval: kDebugMode ? Duration.zero : const Duration(hours: 12),
  ));
  await rc.setDefaults(const {'new_dashboard': false, 'min_version': '1.0.0', 'maintenance': false, 'promo_text': ''});
  try { await rc.fetchAndActivate(); } catch (_) {/* use cached/defaults */}
  rc.onConfigUpdated.listen((_) => rc.activate());                       // real-time updates
}

bool get newDashboard => rc.getBool('new_dashboard');
String get promo => rc.getString('promo_text');

bool needsUpdate(String installed) {
  final min = Version.parse(rc.getString('min_version'));
  return Version.parse(installed) < min;
}
// show a blocking "Please update" screen when needsUpdate(packageInfo.version) is true`,
        ),
      ],
      [
        ['What is Crashlytics for?', 'Real-time crash and non-fatal error reporting with stack traces, device info, custom keys and logs, grouped by issue, so you can find and fix problems users hit in production.'],
        ['What is Remote Config used for?', 'Changing app behaviour or content without publishing an update: feature flags, A/B tests, force-update thresholds, maintenance mode and text, with conditions and gradual rollouts.'],
        ['What should you avoid logging to Analytics?', 'Personally identifiable information such as email, name or phone number; use anonymous ids and non-personal event parameters, and respect user consent.'],
      ],
    ),
  ]),
];
