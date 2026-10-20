// JavaFX roadmap, part 3: sections 11-16 (database, Spring Boot, advanced JavaFX, testing, packaging, interview questions).
// Examples use JavaFX 21, Java 21 and Spring Boot 3. "${...}" placeholders are written "\${...}" in these template literals.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';
import { javaFxExamplesFull } from './RoadmapExamples2';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const fx = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('fx', n, title, priority, topics);

const javaFxRoadmap3Base: SubTopic[] = [
  fx(11, 'Database Integration', 'Core', [
    topic(
      'fx-db-jdbc-crud',
      'JDBC Integration, MySQL/PostgreSQL, CRUD, Prepared Statements and Connection Pooling',
      [
        blk(`<h3>JDBC in a JavaFX application</h3>
• Desktop apps talk to databases with <b>JDBC</b> (MySQL <code>mysql-connector-j</code>, PostgreSQL <code>org.postgresql:postgresql</code>, or embedded SQLite/H2). Connection URL examples: <code>jdbc:postgresql://localhost:5432/tracker</code>, <code>jdbc:mysql://localhost:3306/tracker?useSSL=true</code>. <b>Rules</b>: never run JDBC on the FX thread (use <code>Task</code>/<code>Service</code>), always use <b>PreparedStatement</b> with parameters (prevents SQL injection), close resources with try-with-resources, do not hard-code credentials (environment variables/config file; a desktop app cannot keep a database password secret: prefer an API in front of the database for distributed clients).`,
          `public class CourseDao {
    private final DataSource ds;
    public CourseDao(DataSource ds) { this.ds = ds; }

    public List<Course> findByLevel(Level level) throws SQLException {
        String sql = "select id, title, lessons from course where level = ? order by title";
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, level.name());
            try (ResultSet rs = ps.executeQuery()) {
                List<Course> out = new ArrayList<>();
                while (rs.next()) out.add(new Course(rs.getLong("id"), rs.getString("title"), rs.getInt("lessons"), level));
                return out;
            }
        }
    }
}`,
        ),
      ],
      [
        blk(`<h3>CRUD operations and prepared statements</h3>`,
          `public long insert(Course c) throws SQLException {
    String sql = "insert into course(title, lessons, level) values (?, ?, ?)";
    try (Connection con = ds.getConnection(); PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
        ps.setString(1, c.title()); ps.setInt(2, c.lessons()); ps.setString(3, c.level().name());
        ps.executeUpdate();
        try (ResultSet keys = ps.getGeneratedKeys()) { keys.next(); return keys.getLong(1); }
    }
}
public boolean update(Course c) throws SQLException {
    try (Connection con = ds.getConnection(); PreparedStatement ps = con.prepareStatement("update course set title = ?, lessons = ? where id = ?")) {
        ps.setString(1, c.title()); ps.setInt(2, c.lessons()); ps.setLong(3, c.id());
        return ps.executeUpdate() == 1;
    }
}
public boolean delete(long id) throws SQLException {
    try (Connection con = ds.getConnection(); PreparedStatement ps = con.prepareStatement("delete from course where id = ?")) { ps.setLong(1, id); return ps.executeUpdate() == 1; }
}

// SQL injection: NEVER do this
// stmt.executeQuery("select * from course where title = '" + userInput + "'");          // userInput = "x' OR '1'='1"`,
        ),
      ],
      [
        blk(`<h3>Connection pooling with HikariCP</h3>
• Opening a connection is expensive; use a <b>pool</b> (<b>HikariCP</b>) created once at startup and closed in <code>Application.stop()</code>. Desktop apps need small pools (2-5). Handle <b>offline/connection errors</b> gracefully (retry, message, read-only mode).`,
          `HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl(System.getenv().getOrDefault("TRACKER_DB_URL", "jdbc:postgresql://localhost:5432/tracker"));
cfg.setUsername(System.getenv("TRACKER_DB_USER")); cfg.setPassword(System.getenv("TRACKER_DB_PASSWORD"));
cfg.setMaximumPoolSize(4); cfg.setConnectionTimeout(5_000); cfg.setPoolName("tracker");
HikariDataSource ds = new HikariDataSource(cfg);

@Override public void stop() { ds.close(); }`,
        ),
      ],
      [
        ['Why use PreparedStatement?', 'It sends parameters separately from the SQL text, preventing SQL injection and allowing statement reuse and caching.'],
        ['Why use a connection pool in a desktop app?', 'It avoids the cost of opening a connection per operation and bounds concurrent connections; create it once and close it in stop().'],
        ['Why must JDBC calls run off the FX thread?', 'They block; running them on the FX thread freezes the UI, so use Task/Service and update the UI on completion.'],
      ],
    ),
    topic(
      'fx-db-patterns-transactions',
      'DAO and Repository Patterns, Transactions and Database Error Handling',
      [
        blk(`<h3>DAO and Repository patterns</h3>
• <b>DAO</b>: an interface per entity hiding SQL (<code>CourseDao</code> with <code>findAll/findById/save/delete</code>); <b>Repository</b>: a domain-oriented collection abstraction (<code>CourseRepository.findPublished()</code>) possibly composing several DAOs. Controllers depend on the <b>interface</b>, not JDBC: you can swap implementations (JDBC, JPA, REST client, in-memory fake for tests). Add a <b>service layer</b> for business rules and transactions; map rows to <b>immutable records</b>, and convert to observable <b>view models</b> in the UI layer.`,
          `public interface CourseRepository {
    List<Course> findAll();
    Optional<Course> findById(long id);
    Course save(Course course);
    void delete(long id);
}
public class JdbcCourseRepository implements CourseRepository { /* JDBC implementation */ }
public class InMemoryCourseRepository implements CourseRepository { /* for tests and demos */ }

public class CourseService {
    private final CourseRepository repo;
    public CourseService(CourseRepository repo) { this.repo = repo; }
    public Course create(String title, Level level) {
        if (title == null || title.isBlank()) throw new IllegalArgumentException("Title is required");
        return repo.save(new Course(0, title.trim(), 0, level));
    }
}`,
        ),
      ],
      [
        blk(`<h3>Transaction management</h3>
• Group several statements into one atomic unit: <code>con.setAutoCommit(false)</code>, run statements on the <b>same connection</b>, <code>commit()</code>, <code>rollback()</code> in the catch, restore auto-commit, close. Wrap in a small helper so services do not repeat the boilerplate. Use <b>batching</b> (<code>addBatch/executeBatch</code>) for imports. Choose isolation if needed (<code>setTransactionIsolation</code>). With JPA/Hibernate or Spring use <code>@Transactional</code>.`,
          `public <T> T inTransaction(SqlFunction<Connection, T> work) throws SQLException {
    try (Connection con = ds.getConnection()) {
        boolean old = con.getAutoCommit();
        con.setAutoCommit(false);
        try { T result = work.apply(con); con.commit(); return result; }
        catch (Exception e) { con.rollback(); throw e instanceof SQLException se ? se : new SQLException(e); }
        finally { con.setAutoCommit(old); }
    }
}
@FunctionalInterface interface SqlFunction<A, R> { R apply(A a) throws Exception; }

// transfer enrollments atomically
tx.inTransaction(con -> { enrollments.moveAll(con, fromCourse, toCourse); courses.updateCounts(con, fromCourse, toCourse); return null; });

// bulk import with batching
try (PreparedStatement ps = con.prepareStatement("insert into course(title, lessons) values (?, ?)")) {
    for (Course c : courses) { ps.setString(1, c.title()); ps.setInt(2, c.lessons()); ps.addBatch(); }
    ps.executeBatch();
}`,
        ),
      ],
      [
        blk(`<h3>Database error handling in the UI</h3>
• Catch <code>SQLException</code> at the service/task boundary and translate it into <b>domain exceptions</b> (<code>DuplicateCourseException</code> for SQLState <code>23505</code> (PostgreSQL) / error 1062 (MySQL), <code>DatabaseUnavailableException</code> for connection failures <code>08xxx</code>). Show <b>friendly messages</b> (not stack traces) via an <code>Alert</code>, log details, offer <b>retry</b>; keep the UI responsive with a progress indicator; never swallow exceptions silently; mind that a <code>Task</code> failure is silent unless observed.`,
          `try { return dao.insert(course); }
catch (SQLException e) {
    switch (e.getSQLState() == null ? "" : e.getSQLState()) {
        case "23505" -> throw new DuplicateCourseException(course.title(), e);                 // unique violation (PostgreSQL)
        case "08001", "08006" -> throw new DatabaseUnavailableException("Cannot reach the database", e);
        default -> throw new DataAccessFailure(e);
    }
}

// central helper to run DB work with consistent error UI
<T> void runDb(Callable<T> work, Consumer<T> onSuccess) {
    Task<T> task = new Task<>() { protected T call() throws Exception { return work.call(); } };
    task.setOnSucceeded(e -> onSuccess.accept(task.getValue()));
    task.setOnFailed(e -> { log.error("db failure", task.getException()); showError(friendly(task.getException())); });
    executor.execute(task);
}`,
        ),
      ],
      [
        ['DAO vs Repository?', 'A DAO wraps access to a table/data source; a Repository models a domain collection of aggregates with domain-oriented queries; both hide persistence behind an interface.'],
        ['How do you perform several statements atomically in JDBC?', 'Turn off auto-commit, execute on one connection, commit on success and rollback on failure, then restore auto-commit.'],
        ['How should database errors be shown to users?', 'Translate SQLExceptions to domain exceptions and show friendly messages with retry options while logging technical details.'],
      ],
    ),
  ]),

  fx(12, 'JavaFX with Spring Boot', 'Core', [
    topic(
      'fx-spring-integration',
      'JavaFX with Spring Context: Dependency Injection, FXML Controller Factory and Bean Integration',
      [
        blk(`<h3>Why combine JavaFX and Spring Boot?</h3>
• JavaFX creates <code>Application</code> and FXML controllers itself, so Spring does not manage them by default. Integrating Spring gives <b>dependency injection</b>, <b>Spring Data JPA</b>, <b>transactions</b>, <b>configuration properties</b>, <b>RestClient/WebClient</b> and <b>Spring Security</b> for a desktop client. The recipe: start the Spring <b>ApplicationContext</b> in <code>init()</code> (off the UI thread), register the <b>FXML controller factory</b> so controllers are Spring beans, and close the context in <code>stop()</code>. <b>Two classes</b>: a Spring Boot application class (<code>@SpringBootApplication</code>) and a JavaFX <code>Application</code> subclass; start JavaFX from <code>main</code>.`,
          `// pom: spring-boot-starter + spring-boot-starter-data-jpa + javafx-controls/fxml (no spring-boot-starter-web needed)

@SpringBootApplication
public class TrackerBootApplication {                      // Spring Boot configuration
    public static void main(String[] args) { Application.launch(TrackerFxApplication.class, args); }
}

public class TrackerFxApplication extends Application {
    private ConfigurableApplicationContext context;

    @Override public void init() {                                                    // launcher thread: start Spring here
        context = new SpringApplicationBuilder(TrackerBootApplication.class)
                .headless(false)                                                       // required: JavaFX is a GUI app
                .web(WebApplicationType.NONE)
                .run(getParameters().getRaw().toArray(new String[0]));
    }
    @Override public void start(Stage stage) throws IOException {
        context.publishEvent(new StageReadyEvent(stage));                              // Spring takes over the UI creation
    }
    @Override public void stop() { context.close(); Platform.exit(); }
}

public class StageReadyEvent extends ApplicationEvent { public StageReadyEvent(Stage stage) { super(stage); } public Stage getStage() { return (Stage) getSource(); } }`,
        ),
      ],
      [
        blk(`<h3>FXML controller factory and Spring beans</h3>
• Make controllers <b>Spring-managed prototypes</b> (<code>@Component @Scope("prototype")</code>, a fresh instance per FXML load) and tell the loader to ask Spring: <code>loader.setControllerFactory(context::getBean)</code>. Controllers then use <b>constructor injection</b> of services. A <code>StageInitializer</code> listens for <code>StageReadyEvent</code> and loads the main FXML. A reusable <b>FxmlLoader/ViewLoader</b> bean (<code>ApplicationContext</code> + factory) keeps loading code in one place.`,
          `@Component
public class StageInitializer implements ApplicationListener<StageReadyEvent> {
    private final ApplicationContext context;
    private final String title;
    public StageInitializer(ApplicationContext context, @Value("\${app.title:Course Tracker}") String title) { this.context = context; this.title = title; }

    @Override public void onApplicationEvent(StageReadyEvent event) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/main.fxml"));
            loader.setControllerFactory(context::getBean);                              // controllers are Spring beans
            Stage stage = event.getStage();
            stage.setScene(new Scene(loader.load(), 960, 640));
            stage.setTitle(title);
            stage.show();
        } catch (IOException e) { throw new UncheckedIOException(e); }
    }
}

@Component @Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)                              // new controller instance per load
public class CourseListController {
    private final CourseService service;                                                // constructor injection
    @FXML private TableView<CourseModel> table;
    public CourseListController(CourseService service) { this.service = service; }
    @FXML private void initialize() { refresh(); }
    private void refresh() { Task<List<CourseModel>> t = new Task<>() { protected List<CourseModel> call() { return service.findAll(); } };
        t.setOnSucceeded(e -> table.getItems().setAll(t.getValue())); new Thread(t).start(); }
}`,
        ),
        blk(`<h3>Service layer, Spring Data JPA and Hibernate</h3>
• Put business logic in <code>@Service</code> classes with <code>@Transactional</code> (called from <code>Task</code>s, never on the FX thread). <b>Spring Data JPA</b> repositories (<code>interface CourseRepository extends JpaRepository&lt;CourseEntity, Long&gt;</code>) and <b>Hibernate</b> need no extra JavaFX code: set <code>spring.datasource.*</code>, <code>spring.jpa.open-in-view</code> is irrelevant (no web). <b>Map entities to view models/DTOs</b> before the UI: lazy associations accessed after the transaction cause <code>LazyInitializationException</code>, and JPA entities are not JavaFX properties. Use <b>Flyway</b> for schema versions and <b>H2/SQLite</b> for offline desktop use.`,
          `@Service
public class CourseService {
    private final CourseRepository repo;
    public CourseService(CourseRepository repo) { this.repo = repo; }

    @Transactional(readOnly = true)
    public List<CourseModel> findAll() { return repo.findAll(Sort.by("title")).stream().map(CourseModel::from).toList(); }       // map inside the transaction

    @Transactional
    public CourseModel create(String title, Level level) { return CourseModel.from(repo.save(new CourseEntity(title, level))); }
}
// application.properties
// spring.main.web-application-type=none
// spring.datasource.url=jdbc:h2:file:./data/tracker
// spring.jpa.hibernate.ddl-auto=validate
// spring.flyway.enabled=true`,
        ),
      ],
      [
        blk(`<h3>REST API integration and Spring Security</h3>
• A desktop client often calls a backend: use <b><code>RestClient</code></b> (Spring 6.1) or <code>WebClient</code>/<code>HttpClient</code> inside <code>Task</code>s with timeouts and error mapping. Authenticate with <b>OAuth2/JWT</b>: obtain a token (login screen or device flow), keep it in memory, attach it with an interceptor, refresh on 401, and store refresh tokens in the OS keychain (not plain files). <b>Spring Security</b> (method security, <code>SecurityContext</code>) can protect services; store the current <code>Authentication</code> in a session object and <b>remember the security context is thread-bound</b>: propagate it to background threads (<code>DelegatingSecurityContextExecutor</code>).`,
          `@Configuration
class ApiConfig {
    @Bean RestClient restClient(@Value("\${api.base-url}") String baseUrl, TokenStore tokens) {
        return RestClient.builder().baseUrl(baseUrl)
                .requestInterceptor((req, body, exec) -> { tokens.current().ifPresent(t -> req.getHeaders().setBearerAuth(t)); return exec.execute(req, body); })
                .defaultStatusHandler(HttpStatusCode::is5xxServerError, (req, res) -> { throw new BackendUnavailableException(res.getStatusCode()); })
                .build();
    }
}
@Service class CatalogueClient {
    private final RestClient http; CatalogueClient(RestClient http) { this.http = http; }
    List<CourseDto> courses() { return http.get().uri("/api/courses").retrieve().body(new ParameterizedTypeReference<>() {}); }
}

// propagate security context to background tasks
Executor secured = new DelegatingSecurityContextExecutor(Executors.newFixedThreadPool(4));`,
        ),
        blk(`<h3>Application configuration</h3>
• Use <code>@ConfigurationProperties</code> for settings (API URL, theme, window defaults), profiles for dev/prod (<code>application-dev.yml</code>), and a per-user settings file/<code>Preferences</code> for UI state. Fail fast on invalid configuration, log startup details, and keep secrets out of the jar. Startup time matters for desktop apps: avoid web auto-configuration, lazy-init heavy beans and show a <b>splash/preloader</b> while Spring starts in <code>init()</code>. Test controllers with Spring by using <code>@SpringBootTest</code> and <b>TestFX</b> or by unit-testing services only.`,
          `@ConfigurationProperties(prefix = "app")
public record AppProperties(@DefaultValue("Course Tracker") String title, @NotBlank String apiBaseUrl, @DefaultValue("light") String theme) {}

spring:
  main: { web-application-type: none, lazy-initialization: true }
app:
  title: Course Tracker
  api-base-url: https://api.javaschoollab.com`,
        ),
      ],
      [
        ['How do you integrate JavaFX with Spring Boot?', 'Start the Spring context in Application.init(), publish a stage-ready event from start() and use an FXMLLoader controller factory (context::getBean) so controllers are Spring beans; close the context in stop().'],
        ['Why make FXML controllers prototype-scoped?', 'FXMLLoader needs a new controller instance per loaded view; a singleton would share UI state across views.'],
        ['What problem occurs when passing JPA entities to the UI?', 'Lazy associations accessed after the transaction end throw LazyInitializationException and entities are not observable; map to view models inside the transaction.'],
      ],
    ),
  ]),

  fx(13, 'Advanced JavaFX', 'Advanced', [
    topic(
      'fx-advanced-custom-controls-canvas',
      'Custom Controls and Components, Canvas API and GraphicsContext',
      [
        blk(`<h3>Custom controls and components</h3>
• <b>Levels of customisation</b>: (1) <b>compose</b> existing nodes into a reusable <code>Region</code>/<code>VBox</code> subclass or an FXML <code>fx:root</code> component (most common); (2) <b>style</b> a control with CSS and cell factories; (3) a full <b>custom control</b> = <code>Control</code> subclass + <code>Skin</code> (<code>SkinBase</code>) + CSS (behaviour/skin separation; for libraries); (4) draw yourself on a <code>Canvas</code> or <code>Region</code> with shapes. Expose <b>properties</b> (<code>StyleableProperty</code> for CSS), events and a sensible default size (<code>computePrefWidth</code>).`,
          `public class RatingBar extends HBox {
    private final IntegerProperty rating = new SimpleIntegerProperty(this, "rating", 0);
    private final List<Label> stars = new ArrayList<>();

    public RatingBar(int max) {
        getStyleClass().add("rating-bar"); setSpacing(2);
        for (int i = 1; i <= max; i++) {
            int value = i;
            Label star = new Label("★");
            star.getStyleClass().add("star");
            star.setOnMouseClicked(e -> rating.set(value));
            stars.add(star); getChildren().add(star);
        }
        rating.addListener((o, a, r) -> refresh());
        refresh();
    }
    private void refresh() { for (int i = 0; i < stars.size(); i++) stars.get(i).pseudoClassStateChanged(PseudoClass.getPseudoClass("filled"), i < rating.get()); }
    public IntegerProperty ratingProperty() { return rating; }
}
/* .star { -fx-text-fill: #cbd5e1; -fx-font-size: 20; -fx-cursor: hand; }  .star:filled { -fx-text-fill: #f59e0b; } */`,
        ),
      ],
      [
        blk(`<h3>Canvas API and GraphicsContext</h3>
• <code>Canvas</code> is an <b>immediate-mode</b> drawing surface (a single node, fast for many shapes: games, charts, signal plots, whiteboards). Get <code>GraphicsContext gc = canvas.getGraphicsContext2D()</code>: <code>setFill/setStroke</code>, <code>fillRect</code>, <code>strokeLine</code>, <code>fillOval</code>, <code>fillText</code>, paths (<code>beginPath/moveTo/lineTo/stroke</code>), <code>drawImage</code>, transforms (<code>save/translate/rotate/scale/restore</code>), clipping, blend modes. The canvas <b>does not retain shapes</b>: redraw everything when needed; resize by listening to the parent size. For animation use <code>AnimationTimer</code>.`,
          `Canvas canvas = new Canvas(600, 300);
GraphicsContext gc = canvas.getGraphicsContext2D();

void draw(List<Double> data) {
    gc.setFill(Color.web("#0f172a")); gc.fillRect(0, 0, canvas.getWidth(), canvas.getHeight());
    gc.setStroke(Color.LIMEGREEN); gc.setLineWidth(2);
    gc.beginPath();
    double step = canvas.getWidth() / (data.size() - 1);
    for (int i = 0; i < data.size(); i++) {
        double x = i * step, y = canvas.getHeight() - data.get(i) * canvas.getHeight();
        if (i == 0) gc.moveTo(x, y); else gc.lineTo(x, y);
    }
    gc.stroke();
}
// responsive canvas
StackPane holder = new StackPane(canvas);
canvas.widthProperty().bind(holder.widthProperty()); canvas.heightProperty().bind(holder.heightProperty());
canvas.widthProperty().addListener(o -> draw(latest)); canvas.heightProperty().addListener(o -> draw(latest));

// simple game loop
new AnimationTimer() { @Override public void handle(long now) { update(now); render(gc); } }.start();`,
        ),
      ],
      [
        blk(`<h3>When to choose which</h3>
<table ${TABLE}>
<tr><th>Need</th><th>Use</th></tr>
<tr><td>Reusable form/card widget</td><td>Composite node or <code>fx:root</code> FXML component</td></tr>
<tr><td>Library-quality control with theming and behaviour separation</td><td><code>Control</code> + <code>Skin</code></td></tr>
<tr><td>Thousands of animated primitives</td><td><code>Canvas</code> (immediate mode)</td></tr>
<tr><td>A few interactive shapes (hit-testing, events, CSS)</td><td>Scene graph shapes (<code>Rectangle</code>, <code>Circle</code>, <code>Path</code>)</td></tr>
</table>`),
      ],
      [
        ['Canvas vs scene graph shapes?', 'Canvas is immediate-mode drawing on one node, fast for many primitives but with no retained objects or hit-testing; scene graph shapes are retained nodes with events and CSS but heavier in large numbers.'],
        ['How do you create a reusable component?', 'Compose existing nodes in a Region/VBox subclass (or fx:root FXML) exposing properties and events; use Control+Skin for library-grade controls.'],
      ],
    ),
    topic(
      'fx-advanced-charts-animation-media',
      'Charts, Animations, Transitions, Timeline and Media Playback',
      [
        blk(`<h3>Charts</h3>
• <code>javafx.scene.chart</code>: <code>LineChart</code>, <code>BarChart</code>, <code>PieChart</code>, <code>AreaChart</code>, <code>ScatterChart</code>, <code>BubbleChart</code>, <code>StackedBarChart</code>. Axes: <code>CategoryAxis</code>, <code>NumberAxis</code>. Data: <code>XYChart.Series&lt;X,Y&gt;</code> with <code>XYChart.Data</code> (observable: updates animate). Style via CSS (<code>.chart-series-line</code>, <code>.default-color0.chart-bar</code>); add tooltips to data nodes; for dense data downsample or use a Canvas chart library (ChartFX, FXGraphs).`,
          `CategoryAxis x = new CategoryAxis(); NumberAxis y = new NumberAxis();
x.setLabel("Month"); y.setLabel("Enrollments");
BarChart<String, Number> chart = new BarChart<>(x, y);
chart.setTitle("Enrollments per month"); chart.setLegendVisible(false); chart.setAnimated(true);

XYChart.Series<String, Number> series = new XYChart.Series<>();
series.setName("2026");
for (var e : stats.entrySet()) series.getData().add(new XYChart.Data<>(e.getKey(), e.getValue()));
chart.getData().add(series);
series.getData().forEach(d -> Tooltip.install(d.getNode(), new Tooltip(d.getXValue() + ": " + d.getYValue())));

PieChart pie = new PieChart(FXCollections.observableArrayList(new PieChart.Data("Beginner", 40), new PieChart.Data("Expert", 15)));`,
        ),
      ],
      [
        blk(`<h3>Animations, transitions and Timeline</h3>
• <b>Transitions</b> animate one aspect with a duration: <code>FadeTransition</code>, <code>TranslateTransition</code>, <code>ScaleTransition</code>, <code>RotateTransition</code>, <code>FillTransition</code>, <code>PathTransition</code>, combined with <code>SequentialTransition</code>/<code>ParallelTransition</code>, <code>PauseTransition</code> (delay). <b><code>Timeline</code></b> animates <b>any property</b> with <code>KeyFrame</code>s and <code>KeyValue</code>s (and <code>Interpolator.EASE_BOTH</code>), supports <code>setCycleCount(INDEFINITE)</code>, <code>setAutoReverse</code>, or runs code at intervals (a clock). <code>AnimationTimer</code> is a per-frame callback for games. Animations run on the FX thread; stop them when the view closes.`,
          `FadeTransition fade = new FadeTransition(Duration.millis(300), card); fade.setFromValue(0); fade.setToValue(1);
TranslateTransition slide = new TranslateTransition(Duration.millis(300), card); slide.setFromY(20); slide.setToY(0);
new ParallelTransition(fade, slide).play();

// animate any property with a Timeline
Timeline progress = new Timeline(
    new KeyFrame(Duration.ZERO, new KeyValue(bar.progressProperty(), 0)),
    new KeyFrame(Duration.seconds(2), new KeyValue(bar.progressProperty(), 1, Interpolator.EASE_BOTH)));
progress.setOnFinished(e -> status.setText("done")); progress.play();

// a clock: run every second on the FX thread
Timeline clock = new Timeline(new KeyFrame(Duration.seconds(1), e -> time.setText(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")))));
clock.setCycleCount(Animation.INDEFINITE); clock.play();

button.setOnMouseEntered(e -> { ScaleTransition s = new ScaleTransition(Duration.millis(120), button); s.setToX(1.05); s.setToY(1.05); s.play(); });`,
        ),
      ],
      [
        blk(`<h3>Media playback</h3>
• <code>javafx-media</code>: <code>Media</code> (URL: file/http; supported formats: MP3, AAC, WAV, MP4/H.264 with AAC, HLS), <code>MediaPlayer</code> (<code>play/pause/stop/seek</code>, <code>volumeProperty</code>, <code>currentTimeProperty</code>, <code>setOnReady/OnEndOfMedia/OnError</code>), <code>MediaView</code> (video surface). <code>AudioClip</code> is for short sound effects (low latency). Keep a <b>strong reference</b> to the player (it can be garbage-collected and stop playing). Codec support is limited: check errors.`,
          `Media media = new Media(getClass().getResource("/media/intro.mp4").toExternalForm());
MediaPlayer player = new MediaPlayer(media);
MediaView view = new MediaView(player); view.setFitWidth(640); view.setPreserveRatio(true);

Slider seek = new Slider();
player.setOnReady(() -> seek.setMax(player.getTotalDuration().toSeconds()));
player.currentTimeProperty().addListener((o, a, t) -> { if (!seek.isValueChanging()) seek.setValue(t.toSeconds()); });
seek.valueChangingProperty().addListener((o, was, is) -> { if (!is) player.seek(Duration.seconds(seek.getValue())); });
player.setOnError(() -> showError(player.getError().getMessage()));
playButton.setOnAction(e -> { if (player.getStatus() == MediaPlayer.Status.PLAYING) player.pause(); else player.play(); });

AudioClip click = new AudioClip(getClass().getResource("/sounds/click.wav").toExternalForm());
click.play();`,
        ),
      ],
      [
        ['Transition vs Timeline?', 'Transitions animate a specific node aspect with a fixed duration and compose well; a Timeline animates arbitrary properties or runs code at keyframes and supports cycles and easing.'],
        ['Why might a MediaPlayer stop unexpectedly?', 'It was garbage-collected because no strong reference was kept; store it in a field.'],
        ['How do you add tooltips to chart data?', 'After adding data, install a Tooltip on each XYChart.Data node (d.getNode()).'],
      ],
    ),
    topic(
      'fx-advanced-integration',
      'Drag and Drop, Clipboard, File and Directory Choosers, Printing and WebView',
      [
        blk(`<h3>Drag and drop</h3>
• <b>Source</b>: <code>setOnDragDetected</code> → <code>startDragAndDrop(TransferMode.COPY/MOVE/LINK)</code>, put data in a <code>ClipboardContent</code>. <b>Target</b>: <code>setOnDragOver</code> (call <code>acceptTransferModes</code> if the dragboard has the expected content), <code>setOnDragDropped</code> (read the dragboard, <code>setDropCompleted(true)</code>), <code>setOnDragDone</code> on the source. Works for text, files, images and custom <code>DataFormat</code>s; the classic use is <b>dropping files onto the window</b> and reordering list cells.`,
          `dropZone.setOnDragOver(e -> { if (e.getDragboard().hasFiles()) e.acceptTransferModes(TransferMode.COPY); e.consume(); });
dropZone.setOnDragDropped(e -> {
    Dragboard db = e.getDragboard();
    boolean ok = false;
    if (db.hasFiles()) { db.getFiles().forEach(importer::importFile); ok = true; }
    e.setDropCompleted(ok); e.consume();
});

listCell.setOnDragDetected(e -> {
    Dragboard db = listCell.startDragAndDrop(TransferMode.MOVE);
    ClipboardContent content = new ClipboardContent(); content.putString(String.valueOf(listCell.getIndex()));
    db.setContent(content); e.consume();
});`,
        ),
      ],
      [
        blk(`<h3>Clipboard, FileChooser and DirectoryChooser</h3>
• <code>Clipboard.getSystemClipboard()</code>: <code>setContent(ClipboardContent)</code>, <code>getString()</code>, <code>hasImage()</code>, <code>getFiles()</code>. <code>FileChooser</code> (<code>setTitle</code>, <code>setInitialDirectory</code>, <code>getExtensionFilters().add(new ExtensionFilter("CSV", "*.csv"))</code>, <code>showOpenDialog</code> / <code>showOpenMultipleDialog</code> / <code>showSaveDialog(window)</code> returns <code>null</code> if cancelled) and <code>DirectoryChooser</code> (<code>showDialog</code>). Do file I/O off the FX thread; remember the last directory in <code>Preferences</code>.`,
          `FileChooser chooser = new FileChooser();
chooser.setTitle("Import courses");
chooser.setInitialDirectory(new File(prefs.get("lastDir", System.getProperty("user.home"))));
chooser.getExtensionFilters().addAll(new FileChooser.ExtensionFilter("CSV files", "*.csv"), new FileChooser.ExtensionFilter("All files", "*.*"));
File file = chooser.showOpenDialog(stage);
if (file != null) { prefs.put("lastDir", file.getParent()); runInBackground(() -> importer.importCsv(file.toPath())); }

DirectoryChooser dirs = new DirectoryChooser(); File exportDir = dirs.showDialog(stage);

ClipboardContent cc = new ClipboardContent(); cc.putString(selectedCourse.title());
Clipboard.getSystemClipboard().setContent(cc);`,
        ),
      ],
      [
        blk(`<h3>Printing and WebView</h3>
• <b>Printing</b>: <code>PrinterJob job = PrinterJob.createPrinterJob()</code>, <code>job.showPrintDialog(window)</code>, <code>job.printPage(node)</code>, <code>job.endJob()</code>; scale to the page via <code>Printer.getDefaultPrinter().getDefaultPageLayout()</code>; for reports, generate a <b>PDF</b> (Apache PDFBox, OpenPDF, JasperReports) rather than printing nodes. <b>WebView</b> (<code>javafx-web</code>) embeds a WebKit browser: <code>getEngine().load(url)</code> / <code>loadContent(html)</code>, <code>executeScript("...")</code>, Java ↔ JavaScript bridge (<code>JSObject.setMember("app", javaObject)</code> with a public class), <code>getLoadWorker().stateProperty()</code>. Treat loaded content as <b>untrusted</b> (do not expose powerful Java objects to remote pages), keep it up to date, and mind the extra memory/size.`,
          `PrinterJob job = PrinterJob.createPrinterJob();
if (job != null && job.showPrintDialog(stage)) {
    PageLayout layout = job.getJobSettings().getPageLayout();
    double scale = Math.min(layout.getPrintableWidth() / report.getBoundsInParent().getWidth(), 1.0);
    report.getTransforms().add(new Scale(scale, scale));
    if (job.printPage(report)) job.endJob();
    report.getTransforms().clear();
}

WebView web = new WebView(); WebEngine engine = web.getEngine();
engine.load("https://openjfx.io");
engine.getLoadWorker().stateProperty().addListener((o, a, s) -> {
    if (s == Worker.State.SUCCEEDED) {
        JSObject window = (JSObject) engine.executeScript("window");
        window.setMember("app", new Bridge());                                   // public class Bridge { public void openCourse(String id) {...} }
    }
});
engine.loadContent("<h1>Offline help</h1><button onclick='app.openCourse(\\"42\\")'>Open</button>");`,
        ),
      ],
      [
        ['How do you accept files dropped on a window?', 'Handle setOnDragOver to accept TransferMode.COPY when the dragboard has files and setOnDragDropped to read db.getFiles() and call setDropCompleted(true).'],
        ['What does FileChooser.showOpenDialog return when cancelled?', 'null, so always null-check the result.'],
        ['What are the risks of exposing Java objects to WebView pages?', 'Remote or injected scripts could call them; only expose minimal bridges to trusted local content.'],
      ],
    ),
  ]),

  fx(14, 'Testing and Debugging', 'Core', [
    topic(
      'fx-testing-unit-ui',
      'JUnit 5, Mockito, Controller Testing, TestFX UI and Event Testing',
      [
        blk(`<h3>Test strategy for JavaFX</h3>
• Keep logic <b>out of controllers</b> (MVVM/MVP: a <b>view model</b> with properties and commands) so most tests are <b>plain JUnit 5 + Mockito</b> without the toolkit. Test properties and bindings directly (they are plain Java objects). Test <b>controllers</b> by injecting mocked services and calling handlers; test <b>UI behaviour</b> end-to-end with <b>TestFX</b>. UI tests are slower and flakier: keep them few and stable.`,
          `class CourseFormViewModelTest {
    CourseService service = mock(CourseService.class);
    CourseFormViewModel vm = new CourseFormViewModel(service);

    @Test void saveDisabledUntilTitleEntered() {
        assertThat(vm.saveDisabledProperty().get()).isTrue();
        vm.titleProperty().set("JavaFX");
        assertThat(vm.saveDisabledProperty().get()).isFalse();
    }
    @Test void saveCallsService() {
        vm.titleProperty().set("JavaFX"); vm.levelProperty().set(Level.BEGINNER);
        vm.save();
        verify(service).create("JavaFX", Level.BEGINNER);
    }
}`,
        ),
      ],
      [
        blk(`<h3>Controller testing and TestFX</h3>
• <b>TestFX</b> (<code>org.testfx:testfx-junit5</code>) starts the toolkit, shows your stage and lets a <code>FxRobot</code> <b>click, type, drag</b> and <b>query nodes</b> by CSS selector or text: <code>clickOn("#saveButton")</code>, <code>write("JavaFX")</code>, <code>lookup(".table-row-cell").queryAll()</code>, <code>verifyThat("#status", hasText("Saved"))</code> (<code>TestFX</code> matchers via Hamcrest or <code>FxAssert</code>). Use <code>@Start</code> to build the UI, give nodes stable <b>IDs</b>, and wait for async work with <code>WaitForAsyncUtils.waitForFxEvents()</code> or <code>Awaitility</code>. For <b>CI</b> run headless with Monocle (<code>-Dtestfx.headless=true -Dglass.platform=Monocle -Dmonocle.platform=Headless -Dprism.order=sw</code>) or xvfb on Linux.`,
          `@ExtendWith(ApplicationExtension.class)
class CourseFormUiTest {
    CourseService service = mock(CourseService.class);

    @Start
    void start(Stage stage) throws IOException {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/course-form.fxml"));
        loader.setControllerFactory(type -> new CourseFormController(service));
        stage.setScene(new Scene(loader.load())); stage.show();
    }

    @Test
    void savesCourse(FxRobot robot) {
        robot.clickOn("#titleField").write("JavaFX Basics");
        robot.clickOn("#levelCombo").clickOn("BEGINNER");
        robot.clickOn("#saveButton");
        verify(service).create("JavaFX Basics", Level.BEGINNER);
    }
    @Test
    void saveIsDisabledWhenTitleEmpty(FxRobot robot) {
        FxAssert.verifyThat("#saveButton", Node::isDisabled);
    }
}`,
        ),
      ],
      [
        blk(`<h3>Event, threading and background-task tests</h3>
• Fire events programmatically (<code>button.fire()</code>, <code>node.fireEvent(new MouseEvent(...))</code>) in a test running on the FX thread (<code>Platform.runLater</code> + <code>CountDownLatch</code> or TestFX helpers). Test <code>Task</code>/<code>Service</code> logic by extracting the work into a plain method and testing it; if you must test the Task, start the toolkit once (<code>Platform.startup</code>) and wait for completion. Make time injectable (<code>Clock</code>) and avoid <code>Thread.sleep</code> in tests.`,
          `// toolkit start for tests that need the FX thread
@BeforeAll static void initToolkit() { try { Platform.startup(() -> {}); } catch (IllegalStateException alreadyStarted) {} }

@Test void buttonFiresHandler() throws Exception {
    AtomicInteger clicks = new AtomicInteger(); CountDownLatch done = new CountDownLatch(1);
    Platform.runLater(() -> { Button b = new Button(); b.setOnAction(e -> clicks.incrementAndGet()); b.fire(); done.countDown(); });
    assertThat(done.await(2, TimeUnit.SECONDS)).isTrue();
    assertThat(clicks).hasValue(1);
}`,
        ),
      ],
      [
        ['How do you make JavaFX code testable?', 'Move logic into view models/services (plain objects with properties), inject dependencies, keep controllers thin and use TestFX only for a few end-to-end UI tests.'],
        ['How do you run TestFX tests in CI?', 'Headless with Monocle (or xvfb on Linux) and software rendering flags.'],
        ['How do you wait for async UI work in tests?', 'WaitForAsyncUtils.waitForFxEvents, Awaitility or latches instead of Thread.sleep.'],
      ],
    ),
    topic(
      'fx-debugging-performance',
      'Debugging FXML, Threading Issues, Memory Leaks and Performance Profiling',
      [
        blk(`<h3>Debugging FXML and the scene graph</h3>
• Common FXML errors: <code>LoadException: Location is not set</code> (wrong resource path), <code>... is not a valid type</code> (missing <code>&lt;?import?&gt;</code>), <code>fx:controller not found</code>/<code>Can not set ... field to null</code> (id mismatch, missing <code>@FXML</code>, package not <code>opens</code>ed to <code>javafx.fxml</code>), <code>Controller value already specified</code>, handler method not found (name or signature). Read the <b>root cause</b> at the bottom of the stack trace and the line number inside the FXML. Inspect a running UI with <b>ScenicView</b> (node tree, bounds, CSS, properties) and <code>-Djavafx.verbose</code>/<code>-Dprism.verbose=true</code>.`,
          `module com.javaschoollab.tracker {
    requires javafx.controls; requires javafx.fxml;
    opens com.javaschoollab.tracker.ui to javafx.fxml;        // fixes: "Unable to make field private ... accessible" / injection failures
    opens com.javaschoollab.tracker.model to javafx.base;     // needed for PropertyValueFactory
}
// start with Scenic View attached: scenicview <pid>   (or the IDE plugin)`,
        ),
      ],
      [
        blk(`<h3>Threading issues</h3>
• <b>Frozen UI</b> → long work on the FX thread (take a thread dump: <code>jstack</code>/<code>jcmd Thread.print</code>, look at "JavaFX Application Thread"). <b>Not on FX application thread</b> → UI updated from a worker. <b>Deadlock</b> → waiting on the FX thread for a result that needs the FX thread (<code>runLater().get()</code>). <b>Lost exceptions</b> → Tasks/futures failing silently: observe failures and set a default uncaught-exception handler. <b>Race conditions</b> → mutating the same <code>ObservableList</code> from several threads (mutate only on the FX thread).`,
          `Thread.setDefaultUncaughtExceptionHandler((t, e) -> {
    log.error("Uncaught in " + t.getName(), e);
    if (Platform.isFxApplicationThread()) showErrorDialog(e); else Platform.runLater(() -> showErrorDialog(e));
});
// jcmd <pid> Thread.print | findstr /i "JavaFX Application Thread" -A 15      // what is the UI thread doing?`,
        ),
      ],
      [
        blk(`<h3>Memory leaks and performance profiling</h3>
• <b>Leak sources</b>: listeners/bindings on long-lived properties (<code>model.xProperty().addListener(...)</code> from a closed view), static references to controllers/stages, unstopped <code>Timeline</code>/<code>AnimationTimer</code>/executors, event handlers on the scene, cached images, un-disposed WebView/MediaPlayer, <b>growing lists</b>. Detect: heap histogram (<code>jcmd GC.class_histogram</code>), heap dump + Eclipse MAT/VisualVM (find who retains a closed <code>Controller</code>), watch memory after opening/closing a view repeatedly. Fix: remove listeners, use weak listeners, bind instead of copying, null references, stop animations in <code>dispose()</code>.<br>
• <b>Performance</b>: keep the <b>scene graph small</b> (avoid thousands of nodes: use virtualised <code>ListView/TableView</code> or Canvas), avoid heavy effects (<code>DropShadow</code> on many nodes, large blurs), cache static nodes (<code>setCache(true)</code>, <code>CacheHint.SPEED</code>), batch list updates (<code>setAll</code>), debounce listeners, avoid expensive work in <code>updateItem</code>, run work off the FX thread, load big images in the background (<code>new Image(url, w, h, true, true, true)</code>), use <code>-Dprism.verbose</code>, pulse logger <code>-Djavafx.pulseLogger=true</code>, VisualVM/JFR for CPU and allocation profiling.`,
          `public class CourseListController {
    private final ChangeListener<Course> selectionListener = (o, a, c) -> show(c);
    @FXML void initialize() { state.selectedProperty().addListener(selectionListener); }
    public void dispose() {                                              // called by the navigator when the view is removed
        state.selectedProperty().removeListener(selectionListener);
        clockTimeline.stop(); refreshService.cancel();
    }
}

ImageView thumb = new ImageView(new Image(url, 160, 90, true, true, true));        // scaled, smooth, loaded in the background
card.setCache(true); card.setCacheHint(CacheHint.SPEED);

// record a JFR profile of a running app
// jcmd <pid> JFR.start duration=60s filename=tracker.jfr`,
        ),
      ],
      [
        ['How do you find a memory leak in a JavaFX app?', 'Open and close a view repeatedly, take a heap dump and inspect who retains old controllers/nodes, typically listeners, static references, timelines or executors, then remove or weakly reference them.'],
        ['What causes "Unable to make field private ... accessible" with FXML?', 'In a modular app the controller package is not opened to javafx.fxml; add opens ... to javafx.fxml in module-info.java.'],
        ['How do you diagnose a frozen JavaFX UI?', 'Take a thread dump and look at what the JavaFX Application Thread is executing; move that work to a background task.'],
      ],
    ),
  ]),

  fx(15, 'Packaging and Deployment', 'Core', [
    topic(
      'fx-packaging-build',
      'Maven and Gradle Packaging, Java Modules, module-info.java and JavaFX Module Configuration',
      [
        blk(`<h3>Packaging options</h3>
• <b>Classpath fat jar</b> (maven-shade/Gradle shadow): simple but JavaFX needs a <b>non-<code>Application</code> launcher class</b> as <code>Main-Class</code> and platform-specific JavaFX jars. <b>Modular app</b> (<code>module-info.java</code>): run with the module path; enables <code>jlink</code> custom runtimes and <code>jpackage</code> installers. <b>Native installers</b>: <code>jpackage</code>. The JavaFX jars are <b>platform-classified</b> (win/linux/mac): the Maven plugin picks the right one for the build machine; for cross-platform fat jars include all classifiers or build on each OS (CI matrix).`,
          `<!-- Maven: build a runnable fat jar (classpath mode) -->
<plugin>
  <groupId>org.apache.maven.plugins</groupId><artifactId>maven-shade-plugin</artifactId><version>3.5.1</version>
  <executions><execution><phase>package</phase><goals><goal>shade</goal></goals>
    <configuration><transformers><transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
      <mainClass>com.javaschoollab.tracker.Launcher</mainClass></transformer></transformers></configuration>
  </execution></executions>
</plugin>`,
          `// Gradle
plugins { id 'application'; id 'org.openjfx.javafxplugin' version '0.1.0'; id 'org.beryx.jlink' version '3.0.1' }
javafx { version = '21.0.2'; modules = ['javafx.controls', 'javafx.fxml'] }
application { mainModule = 'com.javaschoollab.tracker'; mainClass = 'com.javaschoollab.tracker.App' }
jlink { launcher { name = 'tracker' } ; jpackage { installerType = 'msi' } }`,
        ),
      ],
      [
        blk(`<h3>Java modules and module-info.java</h3>
• A <b>module</b> declares what it <code>requires</code> and what it <code>exports</code>/<code>opens</code>. For JavaFX: <code>requires javafx.controls; requires javafx.fxml;</code>, <code>exports</code> the package containing the <code>Application</code> class (the launcher accesses it), and <code>opens</code> packages to <code>javafx.fxml</code> (controllers) and <code>javafx.base</code> (<code>PropertyValueFactory</code>/reflection). Other typical <code>requires</code>: <code>java.sql</code>, <code>java.prefs</code>, <code>java.logging</code>, <code>javafx.web</code>, <code>javafx.media</code>, <code>javafx.swing</code>. Non-modular libraries become <b>automatic modules</b> (name from the jar/<code>Automatic-Module-Name</code>); some libraries (Spring, Hibernate) do not play well with strict modules: many JavaFX+Spring apps run on the <b>classpath</b> instead.`,
          `module com.javaschoollab.tracker {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.sql;
    requires java.prefs;
    requires org.kordamp.ikonli.javafx;

    exports com.javaschoollab.tracker;                      // contains the Application subclass
    opens com.javaschoollab.tracker.ui to javafx.fxml;      // FXML controllers
    opens com.javaschoollab.tracker.model to javafx.base;   // PropertyValueFactory
}
// compile/run with the module path:  java --module-path mods:libs -m com.javaschoollab.tracker/com.javaschoollab.tracker.App`,
        ),
      ],
      [
        blk(`<h3>JavaFX module configuration and common pitfalls</h3>
<table ${TABLE}>
<tr><th>Error</th><th>Cause and fix</th></tr>
<tr><td><code>Error: JavaFX runtime components are missing</code></td><td>Launching a classpath app whose main class extends <code>Application</code>: add a separate <code>Launcher</code> class or use the module path/<code>--add-modules</code></td></tr>
<tr><td><code>Module javafx.controls not found</code></td><td>Dependency missing or module path wrong</td></tr>
<tr><td><code>InaccessibleObjectException</code> for FXML fields</td><td><code>opens ... to javafx.fxml</code></td></tr>
<tr><td><code>Location is not set</code> in a jar</td><td>Resource path/package wrong; resources must be on the module's package path and <code>opens</code>ed if loaded reflectively from another module</td></tr>
<tr><td>Works on Windows, fails on Linux/Mac in a fat jar</td><td>Platform-specific JavaFX native libraries missing from the jar</td></tr>
</table>`),
      ],
      [
        ['What should module-info.java contain for a JavaFX FXML app?', 'requires javafx.controls and javafx.fxml, exports the package with the Application class and opens controller (and model) packages to javafx.fxml/javafx.base.'],
        ['Why do fat jars need a separate Launcher class?', 'If the main class extends Application the JVM checks for JavaFX modules before the classpath is set up and reports "runtime components are missing"; a plain launcher class avoids that.'],
      ],
    ),
    topic(
      'fx-jlink-jpackage',
      'jlink, jpackage, Native Installers, Application Signing and Cross-Platform Deployment',
      [
        blk(`<h3>jlink: a custom runtime</h3>
• <code>jlink</code> builds a <b>minimal JRE</b> containing only the modules your app needs (plus the JavaFX modules): a 40-80 MB runtime instead of a full JDK, no separate Java installation for users. Requires a <b>modular</b> app (or <code>jdeps --ignore-missing-deps</code> to find modules and a plugin like badass-jlink for non-modular). Options: <code>--add-modules</code>, <code>--compress=zip-6</code>, <code>--strip-debug</code>, <code>--no-header-files</code>, <code>--no-man-pages</code>, <code>--launcher tracker=com.javaschoollab.tracker/com.javaschoollab.tracker.App</code>.`,
          `jdeps --module-path libs --print-module-deps --ignore-missing-deps target/app.jar
jlink --module-path "$JAVA_HOME/jmods:libs" --add-modules com.javaschoollab.tracker --output build/runtime \\
      --strip-debug --compress=zip-6 --no-header-files --no-man-pages \\
      --launcher tracker=com.javaschoollab.tracker/com.javaschoollab.tracker.App
build/runtime/bin/tracker`,
        ),
      ],
      [
        blk(`<h3>jpackage and native installers</h3>
• <code>jpackage</code> (JDK 14+, stable in 16) creates a <b>native installer or app image</b> bundling your jar and a runtime: <b>Windows</b> <code>exe</code>/<code>msi</code> (needs WiX Toolset), <b>macOS</b> <code>dmg</code>/<code>pkg</code>/<code>app-image</code>, <b>Linux</b> <code>deb</code>/<code>rpm</code>. Common options: <code>--name</code>, <code>--app-version</code>, <code>--vendor</code>, <code>--icon</code> (.ico/.icns/.png), <code>--input</code>, <code>--main-jar</code>/<code>--module</code>, <code>--main-class</code>, <code>--runtime-image</code> (from jlink), <code>--java-options "-Xmx512m"</code>, <code>--win-menu</code>, <code>--win-shortcut</code>, <code>--win-dir-chooser</code>, <code>--win-upgrade-uuid</code> (stable across versions so upgrades replace old installs), <code>--file-associations</code>, <code>--resource-dir</code> (custom installer resources). <b>jpackage builds for the OS it runs on</b>: use CI runners per platform.`,
          `jpackage --type msi --name "Course Tracker" --app-version 1.2.0 --vendor "JavaSchoolLab" --icon src/main/resources/icons/app.ico \\
         --module-path "libs;mods" --module com.javaschoollab.tracker/com.javaschoollab.tracker.App \\
         --runtime-image build/runtime --dest dist --win-menu --win-shortcut --win-dir-chooser \\
         --win-upgrade-uuid 6f9a2a3c-1d55-4a3e-9a6b-3c1f1a2b3c4d --java-options "-Xmx512m"

# macOS
jpackage --type dmg --name "Course Tracker" --input target/libs --main-jar tracker.jar --main-class com.javaschoollab.tracker.Launcher --icon app.icns --mac-package-identifier com.javaschoollab.tracker
# Linux
jpackage --type deb --name course-tracker --input target/libs --main-jar tracker.jar --main-class com.javaschoollab.tracker.Launcher --linux-shortcut`,
        ),
      ],
      [
        blk(`<h3>Application signing and cross-platform deployment</h3>
• <b>Signing</b> proves who built the installer and avoids "unknown publisher" warnings: <b>Windows</b> code-signing certificate with <code>signtool</code> (EV certificates remove SmartScreen warnings faster), <b>macOS</b> Developer ID certificate + <code>--mac-sign</code> + <b>notarisation</b> (<code>notarytool</code>) required to open on current macOS, <b>Linux</b> package signing (GPG for repos). Keep certificates in CI secrets, never in the repo. <b>Cross-platform</b>: build per OS in a CI matrix (GitHub Actions: windows-latest, macos-latest, ubuntu-latest), choose the right JavaFX classifier, test installers on clean VMs, provide <b>auto-update</b> (e.g. a version check + download, or tools such as Conveyor, install4j, update4j), handle per-user data directories (<code>%APPDATA%</code>, <code>~/Library/Application Support</code>, <code>~/.config</code>), log to a user-writable location, and test HiDPI and different fonts. <b>Versioning</b>: semantic versions, a changelog and stable upgrade IDs.`,
          `# GitHub Actions: build installers on each OS
strategy:
  matrix: { os: [windows-latest, macos-latest, ubuntu-latest] }
runs-on: \${{ matrix.os }}
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-java@v4
    with: { distribution: temurin, java-version: 21 }
  - run: mvn -B package
  - run: ./scripts/package.sh      # jlink + jpackage for this OS
  - uses: actions/upload-artifact@v4
    with: { name: installer-\${{ matrix.os }}, path: dist/* }`,
        ),
      ],
      [
        ['What are jlink and jpackage?', 'jlink creates a minimal custom Java runtime with only the required modules; jpackage bundles the app and a runtime into a native installer (exe/msi, dmg/pkg, deb/rpm).'],
        ['Can you build a Windows installer on Linux with jpackage?', 'No, jpackage creates installers for the operating system it runs on, so use CI runners per platform.'],
        ['Why sign and notarise desktop applications?', 'To prove publisher identity and avoid OS security warnings; macOS additionally requires notarisation for Gatekeeper to allow the app.'],
      ],
    ),
  ]),

  fx(16, 'JavaFX Interview Questions', 'Interview', [
    topic(
      'fx-iq-core',
      'Interview Questions: JavaFX Basics, Stage and Scene, FXML, Scene Builder, Binding and ObservableList',
      [
        blk(`<h3>How to answer</h3>
• Give a short definition, name the <b>mechanism</b> (scene graph, properties, FX thread), show a tiny code example, then state a <b>pitfall</b> (blocking the FX thread, listener leaks, null @FXML fields). Interviewers want to see that you build <b>responsive, testable</b> UIs.`),
      ],
      [
        blk(`<h3>Rapid-fire recap</h3>
<table ${TABLE}>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>JavaFX vs Swing</td><td>Scene graph + CSS + FXML + binding, GPU rendering, actively developed</td></tr>
<tr><td>Stage / Scene</td><td>Window / its content (root node)</td></tr>
<tr><td>FXML</td><td>XML view description separate from controller logic</td></tr>
<tr><td>Scene Builder</td><td>Visual FXML editor</td></tr>
<tr><td>Binding</td><td>Property follows another (uni) or both sync (bi)</td></tr>
<tr><td>ObservableList</td><td>List that notifies listeners; backbone of ListView/TableView</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Follow-up questions to prepare</h3>
• "Why is my @FXML field null?" (id mismatch, missing @FXML, controller created with new, accessed in the constructor.) • "Unidirectional vs bidirectional binding, and what happens if you set a bound property?" (it throws.) • "How do you avoid listener leaks?" (remove or weak listeners, prefer bindings.) • "How do you structure a JavaFX app?" (MVVM: view in FXML, controller thin, view model with properties, services behind interfaces.)`),
      ],
      [
        ['What is JavaFX?', 'A Java framework for building rich desktop and embedded client applications using a scene graph, controls, CSS, FXML, animation, charts and media; distributed as OpenJFX.'],
        ['JavaFX vs Swing?', 'JavaFX offers a GPU-accelerated scene graph, CSS styling, FXML, built-in properties/binding, animation and charts and is actively developed; Swing is a mature but maintenance-mode toolkit.'],
        ['What are Stage and Scene?', 'A Stage is a top-level window; a Scene is the container for the scene graph displayed in a stage, holding the root node.'],
        ['What is FXML?', 'An XML-based markup language for declaring the scene graph, loaded by FXMLLoader and wired to a controller using fx:id and event handler attributes.'],
        ['What is Scene Builder?', 'A drag-and-drop visual designer that edits FXML files and can generate a controller skeleton.'],
        ['What is property binding?', 'A mechanism where a property automatically follows another observable value (unidirectional) or two properties stay in sync (bidirectional), reducing manual listener code.'],
        ['What is ObservableList?', 'A List that can be observed for changes (add/remove/update); UI controls such as ListView and TableView update automatically when it changes.'],
        ['How do controllers communicate?', 'Through shared model objects with properties, parent-child controller references, callbacks or an event bus, instead of static references.'],
        ['What happens in initialize() vs the constructor of an FXML controller?', 'The constructor runs before @FXML injection; initialize() runs afterwards when the nodes are available.'],
        ['How do you style a JavaFX app?', 'With JavaFX CSS (-fx- properties) using style classes, IDs and pseudo-classes in external stylesheets applied to the Scene.'],
      ],
    ),
    topic(
      'fx-iq-threading-integration',
      'Interview Questions: FX Thread, Task vs Service, TableView, Spring Boot Integration, Packaging and Background API Calls',
      [
        blk(`<h3>Scenario answers</h3>
• <b>"The UI freezes when loading data"</b> → the load runs on the FX thread: move it to a <code>Task</code>, bind a progress indicator, update the table in <code>setOnSucceeded</code>.<br>
• <b>"How do you call a REST API without freezing?"</b> → <code>Task</code>/<code>CompletableFuture</code> on a background executor, error handling via <code>setOnFailed</code>, <code>Platform.runLater</code> or <code>thenAcceptAsync(..., Platform::runLater)</code> to update the UI.<br>
• <b>"How do you ship it?"</b> → modular build, <code>jlink</code> runtime, <code>jpackage</code> installer per OS in CI, signed and notarised.`),
      ],
      [
        blk(`<h3>Cheat sheet</h3>
<table ${TABLE}>
<tr><th>Topic</th><th>Remember</th></tr>
<tr><td>FX thread</td><td>One thread for UI; never block it; update UI only there</td></tr>
<tr><td>Task</td><td>One-shot; updateProgress/updateMessage; cancel cooperatively</td></tr>
<tr><td>Service</td><td>Reusable; restart(); createTask()</td></tr>
<tr><td>runLater</td><td>Queue work on the FX thread; don't flood it</td></tr>
<tr><td>TableView</td><td>FilteredList → SortedList → table; lambda cell value factories</td></tr>
<tr><td>Spring integration</td><td>Context in init(), controller factory, prototype controllers</td></tr>
<tr><td>Packaging</td><td>jlink runtime + jpackage installer; sign and notarise</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Deep-dive questions</h3>
• "How does Task.updateProgress avoid flooding the UI?" (it coalesces updates and posts one pending runLater.) • "What happens if you call Platform.runLater(...).get-style waits on the FX thread?" (deadlock.) • "How do you cancel a search-as-you-type request?" (Service.restart or cancel the previous Task/Future.) • "How do you get the Spring SecurityContext inside a Task?" (use DelegatingSecurityContextExecutor.)`),
      ],
      [
        ['What is the JavaFX Application Thread?', 'The single thread that processes UI events and renders pulses and is the only one allowed to modify the live scene graph.'],
        ['Why should long-running tasks not execute on the UI thread?', 'They block event processing and rendering, freezing the entire application; run them in background threads and update the UI via Platform.runLater or Task callbacks.'],
        ['What is the difference between Task and Service?', 'Task is a single-use background job; Service is a reusable factory that creates a new Task for each start/restart and manages its execution, suited to repeatable operations like refresh or search.'],
        ['How does TableView work?', 'It shows an ObservableList of items; each TableColumn has a cell value factory to extract values and a cell factory to render them; rows are virtualised and reused while scrolling.'],
        ['How do you filter and sort a TableView?', 'Use FilteredList with a predicate, wrap it in a SortedList bound to the table comparator and set it as the table items.'],
        ['How do you integrate JavaFX with Spring Boot?', 'Start the Spring context in Application.init(), use the FXMLLoader controller factory to obtain controllers as Spring prototype beans, publish a stage-ready event from start() and close the context in stop().'],
        ['How do you package a JavaFX application?', 'Build a modular or fat-jar app, create a minimal runtime with jlink and a native installer with jpackage per operating system, then sign (and notarise on macOS).'],
        ['How do you handle background API calls?', 'Run them in a Task or CompletableFuture with timeouts and error handling on an executor, show progress, and apply results on the FX thread; cancel obsolete requests when the user navigates away.'],
        ['How do you avoid memory leaks in JavaFX?', 'Remove listeners from long-lived properties, use weak listeners or bindings, stop animations and executors and avoid static references to controllers.'],
        ['How do you test a JavaFX application?', 'Unit-test view models and services with JUnit 5/Mockito and write a few end-to-end UI tests with TestFX, headless on CI using Monocle.'],
      ],
    ),
  ]),
];

export const javaFxRoadmap3: SubTopic[] = [...javaFxRoadmap3Base, ...javaFxExamplesFull];
