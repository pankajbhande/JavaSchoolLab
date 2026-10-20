// Worked examples (complete mini programs) appended to the JavaFX, Spring Core, Hibernate and Microservices roadmaps.
import type { SubTopic } from './types';
import { blk, topic } from './jsRoadmapKit';

export const javaFxExamples: SubTopic[] = [
  {
    id: 'fx-examples',
    name: 'Worked Examples · Complete JavaFX Mini Programs',
    topics: [
      topic(
        'fx-ex-login-form',
        'Example: Login Form with Validation, Binding and a Background Task',
        [
          blk(`<h3>What you build</h3>
• A login window: username and password fields, a Login button that stays <b>disabled until both fields are filled</b>, an error label bound to the result, and a progress indicator while the (simulated) server call runs in a <b>background Task</b>. It uses layouts, properties/binding, events and concurrency together.`,
            `import javafx.application.Application;
import javafx.concurrent.Task;
import javafx.geometry.*;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;

public class LoginApp extends Application {
    @Override
    public void start(Stage stage) {
        TextField user = new TextField();           user.setPromptText("Username");
        PasswordField pass = new PasswordField();   pass.setPromptText("Password");
        Button login = new Button("Login");         login.setDefaultButton(true);
        Label error = new Label();                  error.setStyle("-fx-text-fill: #dc2626;");
        ProgressIndicator spinner = new ProgressIndicator();
        spinner.setPrefSize(24, 24);
        spinner.setVisible(false);

        // disabled until both fields have text
        login.disableProperty().bind(user.textProperty().isEmpty().or(pass.textProperty().isEmpty()));

        login.setOnAction(e -> {
            Task<Boolean> task = new Task<>() {
                @Override protected Boolean call() throws Exception {
                    Thread.sleep(800);                                   // simulate a server round trip
                    return "admin".equals(user.getText()) && "secret".equals(pass.getText());
                }
            };
            spinner.visibleProperty().bind(task.runningProperty());
            login.disableProperty().unbind();
            login.disableProperty().bind(task.runningProperty());      // no double submit
            task.setOnSucceeded(ev -> {
                login.disableProperty().unbind();
                login.disableProperty().bind(user.textProperty().isEmpty().or(pass.textProperty().isEmpty()));
                error.setText(task.getValue() ? "" : "Invalid username or password");
                if (task.getValue()) stage.setTitle("Welcome, " + user.getText());
            });
            Thread t = new Thread(task, "login"); t.setDaemon(true); t.start();
        });

        VBox form = new VBox(10, new Label("Sign in"), user, pass, new HBox(10, login, spinner), error);
        form.setPadding(new Insets(24));
        form.setAlignment(Pos.CENTER_LEFT);
        stage.setScene(new Scene(form, 320, 260));
        stage.setTitle("Login");
        stage.show();
    }
    public static void main(String[] args) { launch(args); }
}`,
          ),
        ],
        [
          blk(`<h3>Step by step: what each part does</h3>
• <b>Binding</b>: <code>login.disableProperty().bind(...isEmpty().or(...))</code> removes manual enable/disable code. • <b>Task</b>: the sleep runs off the UI thread; <code>runningProperty()</code> drives the spinner and prevents double submits. • <b>Callbacks</b>: <code>setOnSucceeded</code> runs on the FX thread, so touching the UI there is safe. • <b>Daemon thread</b>: the JVM can exit even if the task is still running.`,
            `// Moving the rules out of the UI makes them testable
public final class Credentials {
    public static boolean valid(String user, String pass) { return "admin".equals(user) && "secret".equals(pass); }
}
// JUnit: assertThat(Credentials.valid("admin", "secret")).isTrue();`,
          ),
        ],
        [
          blk(`<h3>Extending the example</h3>
• Add a <b>"Show password"</b> checkbox (bind a visible <code>TextField</code>'s text bidirectionally to the <code>PasswordField</code>), a <b>remember me</b> value stored in <code>Preferences</code>, a <b>shake animation</b> on failure (<code>TranslateTransition</code> with cycle count), and replace the fake check with a <code>RestClient</code> call that returns a token.`,
            `CheckBox show = new CheckBox("Show password");
TextField visible = new TextField();
visible.textProperty().bindBidirectional(pass.textProperty());
visible.visibleProperty().bind(show.selectedProperty());
visible.managedProperty().bind(show.selectedProperty());
pass.visibleProperty().bind(show.selectedProperty().not());
pass.managedProperty().bind(show.selectedProperty().not());

TranslateTransition shake = new TranslateTransition(Duration.millis(60), form);
shake.setByX(10); shake.setCycleCount(6); shake.setAutoReverse(true);
// on failure: shake.playFromStart();`,
          ),
        ],
        [
          ['How do you prevent a user from submitting a form twice?', 'Disable the button while the Task is running by binding its disableProperty to the task\'s runningProperty, and run the request off the FX thread.'],
          ['Why bind instead of enabling the button in listeners?', 'Binding keeps the state derived from the inputs automatically and avoids missed update paths.'],
        ],
      ),
      topic(
        'fx-ex-course-table-app',
        'Example: Course Manager with TableView, Search, Add and Delete',
        [
          blk(`<h3>What you build</h3>
• A table of courses with a <b>search box</b> (FilteredList), <b>sortable columns</b> (SortedList), an <b>Add</b> form below and a <b>Delete</b> button enabled only when a row is selected. It is the typical CRUD screen of a business desktop app.`,
            `import javafx.application.Application;
import javafx.beans.property.*;
import javafx.collections.*;
import javafx.collections.transformation.*;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;

public class CourseManagerApp extends Application {
    public static class Course {
        private final StringProperty title = new SimpleStringProperty();
        private final IntegerProperty lessons = new SimpleIntegerProperty();
        public Course(String t, int l) { title.set(t); lessons.set(l); }
        public StringProperty titleProperty() { return title; }
        public IntegerProperty lessonsProperty() { return lessons; }
        public String getTitle() { return title.get(); }
    }

    @Override
    public void start(Stage stage) {
        ObservableList<Course> data = FXCollections.observableArrayList(new Course("Spring Core", 40), new Course("JavaFX", 35), new Course("Hibernate", 30));

        TableView<Course> table = new TableView<>();
        TableColumn<Course, String> titleCol = new TableColumn<>("Title");
        titleCol.setCellValueFactory(c -> c.getValue().titleProperty());
        TableColumn<Course, Number> lessonsCol = new TableColumn<>("Lessons");
        lessonsCol.setCellValueFactory(c -> c.getValue().lessonsProperty());
        table.getColumns().addAll(titleCol, lessonsCol);
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_FLEX_LAST_COLUMN);

        TextField search = new TextField(); search.setPromptText("Search title...");
        FilteredList<Course> filtered = new FilteredList<>(data, c -> true);
        search.textProperty().addListener((o, a, text) -> filtered.setPredicate(c -> text == null || text.isBlank() || c.getTitle().toLowerCase().contains(text.toLowerCase().trim())));
        SortedList<Course> sorted = new SortedList<>(filtered);
        sorted.comparatorProperty().bind(table.comparatorProperty());
        table.setItems(sorted);

        TextField newTitle = new TextField(); newTitle.setPromptText("Title");
        Spinner<Integer> newLessons = new Spinner<>(1, 200, 10); newLessons.setEditable(true);
        Button add = new Button("Add");
        add.disableProperty().bind(newTitle.textProperty().isEmpty());
        add.setOnAction(e -> { data.add(new Course(newTitle.getText().trim(), newLessons.getValue())); newTitle.clear(); });

        Button delete = new Button("Delete");
        delete.disableProperty().bind(table.getSelectionModel().selectedItemProperty().isNull());
        delete.setOnAction(e -> data.remove(table.getSelectionModel().getSelectedItem()));

        Label count = new Label();
        count.textProperty().bind(javafx.beans.binding.Bindings.size(filtered).asString("%d courses shown"));

        VBox root = new VBox(8, search, table, new HBox(8, newTitle, newLessons, add, delete), count);
        VBox.setVgrow(table, Priority.ALWAYS);
        root.setPadding(new Insets(12));
        stage.setScene(new Scene(root, 560, 420));
        stage.setTitle("Course Manager");
        stage.show();
    }
    public static void main(String[] args) { launch(args); }
}`,
          ),
        ],
        [
          blk(`<h3>Key ideas to notice</h3>
• The <b>source list</b> (<code>data</code>) is the only thing you modify; <code>FilteredList</code> and <code>SortedList</code> are views over it. • The comparator binding keeps header-click sorting working. • <code>Bindings.size(filtered)</code> keeps the counter live. • Properties in <code>Course</code> make cell edits and renames show instantly.`,
            `// make the Title column editable
table.setEditable(true);
titleCol.setCellFactory(javafx.scene.control.cell.TextFieldTableCell.forTableColumn());
titleCol.setOnEditCommit(e -> {
    String v = e.getNewValue().trim();
    if (v.isEmpty()) { table.refresh(); return; }
    e.getRowValue().titleProperty().set(v);
});`,
          ),
        ],
        [
          blk(`<h3>Making it production-ready</h3>
• Load and save through a <b>repository</b> inside a <code>Task</code>; show a placeholder (<code>table.setPlaceholder</code>); confirm deletes with an <code>Alert</code>; persist column widths; add <b>pagination</b> for large data; style rows by state with a <b>row factory</b>.`,
            `table.setPlaceholder(new Label("No courses match your search"));
table.setRowFactory(tv -> new TableRow<>() {
    @Override protected void updateItem(Course c, boolean empty) {
        super.updateItem(c, empty);
        getStyleClass().remove("short");
        if (!empty && c != null && c.lessonsProperty().get() < 20) getStyleClass().add("short");     // .short { -fx-background-color: #fef3c7; }
    }
});
delete.setOnAction(e -> {
    Course sel = table.getSelectionModel().getSelectedItem();
    new Alert(Alert.AlertType.CONFIRMATION, "Delete " + sel.getTitle() + "?").showAndWait().filter(b -> b == ButtonType.OK).ifPresent(b -> data.remove(sel));
});`,
          ),
        ],
        [
          ['How do you combine filtering and sorting in a TableView?', 'Wrap the source list in a FilteredList, wrap that in a SortedList bound to the table comparator and set the SortedList as the table items.'],
          ['Why modify the source list instead of the filtered list?', 'Filtered and sorted lists are read-only views; changes to the source propagate to them automatically.'],
        ],
      ),
      topic(
        'fx-ex-background-import',
        'Example: CSV Import with Progress, Cancel and Error Handling',
        [
          blk(`<h3>What you build</h3>
• A screen that imports a CSV in the background: a <b>FileChooser</b>, a <b>progress bar and status message</b> bound to the Task, a <b>Cancel</b> button and a result list. It shows the correct way to keep the UI responsive while processing thousands of rows.`,
            `import javafx.application.Application;
import javafx.collections.*;
import javafx.concurrent.Task;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.*;
import java.io.File;
import java.nio.file.*;
import java.util.List;

public class ImportApp extends Application {
    @Override
    public void start(Stage stage) {
        Button choose = new Button("Choose CSV..."), cancel = new Button("Cancel");
        ProgressBar bar = new ProgressBar(0); bar.setMaxWidth(Double.MAX_VALUE);
        Label status = new Label("Idle");
        ListView<String> failures = new ListView<>(FXCollections.observableArrayList());
        cancel.setDisable(true);

        choose.setOnAction(e -> {
            File file = new FileChooser().showOpenDialog(stage);
            if (file == null) return;
            Task<Integer> task = new Task<>() {
                @Override protected Integer call() throws Exception {
                    List<String> lines = Files.readAllLines(file.toPath());
                    int ok = 0;
                    for (int i = 0; i < lines.size(); i++) {
                        if (isCancelled()) { updateMessage("Cancelled at row " + i); break; }
                        String[] cols = lines.get(i).split(",");
                        if (cols.length < 2) { final String bad = "Row " + (i + 1) + ": " + lines.get(i); javafx.application.Platform.runLater(() -> failures.getItems().add(bad)); }
                        else ok++;
                        updateProgress(i + 1, lines.size());
                        updateMessage("Processed " + (i + 1) + " of " + lines.size());
                        Thread.sleep(2);                         // simulate work
                    }
                    return ok;
                }
            };
            bar.progressProperty().bind(task.progressProperty());
            status.textProperty().bind(task.messageProperty());
            choose.disableProperty().bind(task.runningProperty());
            cancel.disableProperty().bind(task.runningProperty().not());
            cancel.setOnAction(ev -> task.cancel());
            task.setOnSucceeded(ev -> status.textProperty().unbind());
            task.setOnFailed(ev -> new Alert(Alert.AlertType.ERROR, String.valueOf(task.getException().getMessage())).show());
            Thread t = new Thread(task, "csv-import"); t.setDaemon(true); t.start();
        });

        VBox root = new VBox(8, new HBox(8, choose, cancel), bar, status, new Label("Rejected rows"), failures);
        root.setPadding(new Insets(12));
        VBox.setVgrow(failures, Priority.ALWAYS);
        stage.setScene(new Scene(root, 520, 380));
        stage.setTitle("CSV Import");
        stage.show();
    }
    public static void main(String[] args) { launch(args); }
}`,
          ),
        ],
        [
          blk(`<h3>Design notes</h3>
• <b>updateProgress / updateMessage</b> coalesce updates so thousands of rows do not flood the FX thread. • Rejected rows are posted with <code>Platform.runLater</code>; for very many failures collect them in a list and publish once at the end. • <b>Cancellation is cooperative</b>: the loop checks <code>isCancelled()</code>. • Bindings are released when the task ends so the labels can be reused.`,
            `// collect failures off-thread and publish once
List<String> rejected = new ArrayList<>();
// ... inside call(): rejected.add(bad);
task.setOnSucceeded(ev -> failures.getItems().setAll(rejected));        // single UI update`,
          ),
        ],
        [
          blk(`<h3>Scaling up</h3>
• Stream the file (<code>Files.lines</code> in a try-with-resources) instead of <code>readAllLines</code> for huge files; batch database inserts (500 rows per transaction); return a <b>result object</b> (ok, rejected, duration) instead of an int; offer a <b>drag-and-drop</b> target for the file; make the importer a plain class so it can be unit tested without JavaFX.`,
            `public record ImportResult(int imported, List<String> rejected) {}
public class CsvImporter {
    public ImportResult run(Path file, BiConsumer<Integer, Integer> progress, BooleanSupplier cancelled) throws IOException {
        List<String> rejected = new ArrayList<>(); int ok = 0, row = 0;
        try (var lines = Files.lines(file)) {
            for (String line : (Iterable<String>) lines::iterator) {
                if (cancelled.getAsBoolean()) break;
                row++;
                if (line.split(",").length < 2) rejected.add("Row " + row + ": " + line); else ok++;
                progress.accept(row, -1);
            }
        }
        return new ImportResult(ok, rejected);
    }
}`,
          ),
        ],
        [
          ['How do you let a user cancel a long import?', 'Run it in a Task, bind a Cancel button to the running state and check isCancelled() inside the loop.'],
          ['Why not call Platform.runLater for every row?', 'It floods the FX event queue; use updateProgress/updateMessage (coalesced) or publish results in batches.'],
        ],
      ),
    ],
  },
];

export const springCoreExamples: SubTopic[] = [
  {
    id: 'sc-examples',
    name: 'Worked Examples · Complete Spring Core Mini Programs',
    topics: [
      topic(
        'sc-ex-di-app',
        'Example: A Layered App with DI, Qualifiers, Profiles and Properties',
        [
          blk(`<h3>What you build</h3>
• A small enrolment application using only <b>Spring Core</b> (no Boot): a configuration class with component scanning, a repository, two notifier implementations chosen by <b>profile</b>, values from a <b>properties file</b> and constructor injection throughout.`,
            `// pom: org.springframework:spring-context:6.1.x

// src/main/resources/app.properties
// app.name=JavaSchoolLab
// app.max-seats=3

@Configuration
@ComponentScan("com.jsl.enroll")
@PropertySource("classpath:app.properties")
public class AppConfig {
    @Bean static PropertySourcesPlaceholderConfigurer placeholders() { return new PropertySourcesPlaceholderConfigurer(); }
    @Bean Clock clock() { return Clock.systemUTC(); }
}

public interface Notifier { void send(String to, String message); }

@Component @Profile("!prod")
class ConsoleNotifier implements Notifier { public void send(String to, String m) { System.out.println("[console] " + to + ": " + m); } }

@Component @Profile("prod")
class EmailNotifier implements Notifier { public void send(String to, String m) { /* smtp */ } }

@Repository
class SeatRepository {
    private final Map<String, Integer> taken = new ConcurrentHashMap<>();
    int taken(String course) { return taken.getOrDefault(course, 0); }
    void take(String course) { taken.merge(course, 1, Integer::sum); }
}

@Service
class EnrollmentService {
    private final SeatRepository seats; private final Notifier notifier; private final int maxSeats; private final Clock clock;
    EnrollmentService(SeatRepository seats, Notifier notifier, @Value("\${app.max-seats}") int maxSeats, Clock clock) {
        this.seats = seats; this.notifier = notifier; this.maxSeats = maxSeats; this.clock = clock;
    }
    boolean enroll(String student, String course) {
        if (seats.taken(course) >= maxSeats) { notifier.send(student, course + " is full"); return false; }
        seats.take(course);
        notifier.send(student, "Enrolled in " + course + " at " + clock.instant());
        return true;
    }
}

public class Main {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext()) {
            ctx.getEnvironment().setActiveProfiles("dev");
            ctx.register(AppConfig.class);
            ctx.refresh();
            EnrollmentService service = ctx.getBean(EnrollmentService.class);
            for (int i = 1; i <= 4; i++) service.enroll("student" + i, "Spring Core");      // the 4th is rejected
        }
    }
}`,
          ),
        ],
        [
          blk(`<h3>What to observe</h3>
• Change the active profile to <code>prod</code> and the <code>EmailNotifier</code> is wired with <b>no code change</b>. • The service has <b>one constructor</b>, so <code>@Autowired</code> is not needed. • <code>Clock</code> is injected, so a test can pass a fixed clock. • <code>@Value</code> needs the static placeholder configurer in plain Spring (Boot does it for you).`,
            `// the same service in a plain unit test: no container
@Test void rejectsWhenFull() {
    var notifier = new RecordingNotifier();
    var service = new EnrollmentService(new SeatRepository(), notifier, 1, Clock.fixed(Instant.EPOCH, ZoneOffset.UTC));
    assertThat(service.enroll("a", "Spring")).isTrue();
    assertThat(service.enroll("b", "Spring")).isFalse();
    assertThat(notifier.messages()).contains("Spring is full");
}`,
          ),
        ],
        [
          blk(`<h3>Extending the example</h3>
• Add a <code>@Qualifier("sms")</code> second channel and inject <code>List&lt;Notifier&gt;</code> to fan out; replace <code>@Value</code> with a <code>@ConfigurationProperties</code> record (Boot); publish an <code>EnrolledEvent</code> and move notification to an <code>@EventListener</code>.`,
            `public record EnrolledEvent(String student, String course) {}
// in EnrollmentService: publisher.publishEvent(new EnrolledEvent(student, course));
@Component class NotificationListener {
    private final List<Notifier> channels;
    NotificationListener(List<Notifier> channels) { this.channels = channels; }       // every Notifier bean
    @EventListener void on(EnrolledEvent e) { channels.forEach(n -> n.send(e.student(), "Enrolled in " + e.course())); }
}`,
          ),
        ],
        [
          ['How do you switch implementations per environment?', 'Annotate the beans with @Profile and activate the profile through the Environment, property or @ActiveProfiles; the consumer depends only on the interface.'],
          ['Why inject a Clock?', 'It makes time deterministic in tests and keeps code free of static calls.'],
        ],
      ),
      topic(
        'sc-ex-aop-audit',
        'Example: Custom Annotation + AOP Aspect for Auditing and Timing',
        [
          blk(`<h3>What you build</h3>
• A custom <code>@Audited</code> annotation and an <b>aspect</b> that logs who called what, how long it took and whether it failed, without touching the business code.`,
            `@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD)
public @interface Audited { String action(); }

@Aspect @Component
public class AuditAspect {
    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    @Around("@annotation(audited)")
    public Object audit(ProceedingJoinPoint pjp, Audited audited) throws Throwable {
        long start = System.nanoTime();
        String method = pjp.getSignature().toShortString();
        try {
            Object result = pjp.proceed();
            log.info("AUDIT action={} method={} outcome=OK ms={}", audited.action(), method, (System.nanoTime() - start) / 1_000_000);
            return result;
        } catch (Throwable t) {
            log.warn("AUDIT action={} method={} outcome=FAILED error={}", audited.action(), method, t.toString());
            throw t;                                              // never swallow
        }
    }
}

@Service
public class RefundService {
    @Audited(action = "REFUND")
    public void refund(String orderId, BigDecimal amount) {
        if (amount.signum() <= 0) throw new IllegalArgumentException("amount must be positive");
        // ... call payment gateway
    }
}

@Configuration @EnableAspectJAutoProxy @ComponentScan("com.jsl")
class Cfg {}`,
          ),
        ],
        [
          blk(`<h3>How it works</h3>
• While the context starts, the auto-proxy creator wraps <code>RefundService</code> in a proxy because a pointcut matches one of its methods; callers receive the proxy. • <code>@Around</code> controls the call, so we can time it and rethrow. • The aspect is a normal bean: it can inject other beans (a metrics registry, an audit repository).`,
            `@Test void auditsFailure(@Autowired RefundService service, CapturedOutput out) {
    assertThrows(IllegalArgumentException.class, () -> service.refund("o1", BigDecimal.ZERO));
    assertThat(out).contains("outcome=FAILED");
}
// pitfall: this.refund() inside the same class would NOT be audited (self-invocation)`,
          ),
        ],
        [
          blk(`<h3>Extending the example</h3>
• Put the audit in the <b>database</b> in a separate transaction (<code>REQUIRES_NEW</code>) so failed operations are still recorded. • Capture the <b>authenticated user</b> from <code>SecurityContextHolder</code>. • Use <code>@Order</code> so audit runs outside the transaction aspect.`,
            `@Aspect @Component @Order(Ordered.HIGHEST_PRECEDENCE)
class DbAuditAspect {
    private final AuditWriter writer;
    DbAuditAspect(AuditWriter writer) { this.writer = writer; }
    @Around("@annotation(audited)")
    Object around(ProceedingJoinPoint pjp, Audited audited) throws Throwable {
        String user = Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication()).map(Authentication::getName).orElse("anonymous");
        try { Object r = pjp.proceed(); writer.write(user, audited.action(), "OK"); return r; }
        catch (Throwable t) { writer.write(user, audited.action(), "FAILED: " + t.getMessage()); throw t; }
    }
}
@Component class AuditWriter { @Transactional(propagation = Propagation.REQUIRES_NEW) void write(String user, String action, String outcome) { /* insert row */ } }`,
          ),
        ],
        [
          ['Why does the aspect not run when a method calls another method of the same class?', 'The call does not go through the proxy; move the method to another bean or inject the proxy.'],
          ['How do you ensure audit records survive a rollback?', 'Write them in a separate REQUIRES_NEW transaction from a different bean.'],
        ],
      ),
      topic(
        'sc-ex-transactions-jdbc',
        'Example: Money Transfer with JdbcClient, @Transactional and Rollback',
        [
          blk(`<h3>What you build</h3>
• A transfer between two accounts: <b>debit and credit in one transaction</b>, an <b>insufficient funds</b> check, and a test proving that a failure after the debit rolls everything back. Uses an embedded H2 database and <code>JdbcClient</code>.`,
            `@Configuration @EnableTransactionManagement @ComponentScan("com.jsl.bank")
class BankConfig {
    @Bean DataSource dataSource() {
        return new EmbeddedDatabaseBuilder().setType(EmbeddedDatabaseType.H2).addScript("schema.sql").build();   // create table account(id int primary key, balance decimal(12,2))
    }
    @Bean PlatformTransactionManager tm(DataSource ds) { return new DataSourceTransactionManager(ds); }
    @Bean JdbcClient jdbc(DataSource ds) { return JdbcClient.create(ds); }
}

@Repository
class AccountRepository {
    private final JdbcClient jdbc;
    AccountRepository(JdbcClient jdbc) { this.jdbc = jdbc; }
    int debit(int id, BigDecimal amount) { return jdbc.sql("update account set balance = balance - :a where id = :id and balance >= :a").param("a", amount).param("id", id).update(); }
    void credit(int id, BigDecimal amount) { jdbc.sql("update account set balance = balance + :a where id = :id").param("a", amount).param("id", id).update(); }
    BigDecimal balance(int id) { return jdbc.sql("select balance from account where id = :id").param("id", id).query(BigDecimal.class).single(); }
}

@Service
class TransferService {
    private final AccountRepository accounts;
    TransferService(AccountRepository accounts) { this.accounts = accounts; }

    @Transactional
    public void transfer(int from, int to, BigDecimal amount) {
        if (accounts.debit(from, amount) == 0) throw new IllegalStateException("insufficient funds");
        if (to == 99) throw new IllegalStateException("simulated failure after debit");       // proves rollback
        accounts.credit(to, amount);
    }
}`,
          ),
        ],
        [
          blk(`<h3>Prove the rollback</h3>`,
            `@SpringJUnitConfig(BankConfig.class)
class TransferServiceTest {
    @Autowired TransferService service; @Autowired AccountRepository accounts; @Autowired JdbcClient jdbc;

    @BeforeEach void seed() { jdbc.sql("delete from account").update(); jdbc.sql("insert into account values (1, 100), (2, 0)").update(); }

    @Test void transfersMoney() {
        service.transfer(1, 2, new BigDecimal("40"));
        assertThat(accounts.balance(1)).isEqualByComparingTo("60");
        assertThat(accounts.balance(2)).isEqualByComparingTo("40");
    }
    @Test void rollsBackWhenCreditStepFails() {
        assertThrows(IllegalStateException.class, () -> service.transfer(1, 99, new BigDecimal("40")));
        assertThat(accounts.balance(1)).isEqualByComparingTo("100");               // the debit was rolled back
    }
    @Test void rejectsInsufficientFunds() {
        assertThrows(IllegalStateException.class, () -> service.transfer(1, 2, new BigDecimal("500")));
    }
}`,
          ),
        ],
        [
          blk(`<h3>Concurrency and the checked-exception trap</h3>
• The conditional <code>balance &gt;= :a</code> in the SQL prevents overdrafts <b>atomically</b> even with concurrent transfers. • If you throw a <b>checked</b> exception (<code>InsufficientFundsException extends Exception</code>) the transaction would <b>commit</b> by default: use <code>rollbackFor</code> or an unchecked exception.`,
            `public class InsufficientFundsException extends Exception {}
@Transactional(rollbackFor = InsufficientFundsException.class)
public void transferChecked(int from, int to, BigDecimal amount) throws InsufficientFundsException {
    if (accounts.debit(from, amount) == 0) throw new InsufficientFundsException();
    accounts.credit(to, amount);
}`,
          ),
        ],
        [
          ['How do you prove a transaction rolls back?', 'Make a later step fail and assert that the earlier change (the debit) is not visible afterwards.'],
          ['Why put the balance check in the SQL?', 'A single conditional update is atomic, so concurrent transfers cannot overdraw the account.'],
        ],
      ),
    ],
  },
];

export const hibernateExamples: SubTopic[] = [
  {
    id: 'hb-examples',
    name: 'Worked Examples · Complete Hibernate Mini Programs',
    topics: [
      topic(
        'hb-ex-blog-mapping',
        'Example: Course, Lesson and Tag Mapping with Fetching and N+1 Fix',
        [
          blk(`<h3>What you build</h3>
• A mapped domain: <b>Course 1—* Lesson</b> (parent owns the collection, orphans removed), <b>Course *—* Tag</b>, a query that triggers the <b>N+1 problem</b> and the same query fixed with <b>join fetch</b>.`,
            `@Entity
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String title;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position")
    private List<Lesson> lessons = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "course_tag", joinColumns = @JoinColumn(name = "course_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags = new HashSet<>();

    public void addLesson(Lesson l) { lessons.add(l); l.setCourse(this); }          // keep both sides in sync
    public void removeLesson(Lesson l) { lessons.remove(l); l.setCourse(null); }
    // getters / setters
}

@Entity
public class Lesson {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String title; private int position;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "course_id") private Course course;
    // getters / setters
}

@Entity public class Tag { @Id @GeneratedValue private Long id; @Column(unique = true) private String name; }`,
          ),
        ],
        [
          blk(`<h3>The N+1 problem, seen and fixed</h3>
• Listing 50 courses and printing their lessons runs <b>1 query for courses + 50 queries for lessons</b>. Turn on <code>hibernate.show_sql</code> and count them. The fixes: <b>join fetch</b>, <code>@EntityGraph</code>, or <code>@BatchSize</code>/<code>default_batch_fetch_size</code>.`,
            `// N+1: one select for courses, then one select per course when lessons are touched
List<Course> courses = em.createQuery("select c from Course c", Course.class).getResultList();
courses.forEach(c -> System.out.println(c.getTitle() + ": " + c.getLessons().size()));       // 1 + N queries

// fix 1: join fetch (one query)
List<Course> fixed = em.createQuery("select distinct c from Course c left join fetch c.lessons where c.title like :t", Course.class)
        .setParameter("t", "Spring%").getResultList();

// fix 2: entity graph in Spring Data
@EntityGraph(attributePaths = "lessons") List<Course> findByTitleStartingWith(String prefix);

// fix 3: batch fetching (N+1 becomes 1 + N/32)
// spring.jpa.properties.hibernate.default_batch_fetch_size=32

// pagination + collection fetch: fetch ids first, then load with a join fetch to avoid in-memory pagination (HHH000104)`,
          ),
        ],
        [
          blk(`<h3>Checking it in a test</h3>
• Assert the <b>number of SQL statements</b> in a test with Hibernate Statistics so a future change cannot reintroduce N+1 silently.`,
            `@DataJpaTest
@Import(StatisticsConfig.class)
class CourseQueryTest {
    @Autowired EntityManager em; @Autowired CourseRepository repo;
    @Test void loadsLessonsInOneQuery() {
        Statistics stats = em.getEntityManagerFactory().unwrap(SessionFactory.class).getStatistics();
        stats.setStatisticsEnabled(true); stats.clear();
        repo.findByTitleStartingWith("Spring").forEach(c -> c.getLessons().size());
        assertThat(stats.getPrepareStatementCount()).isEqualTo(1);
    }
}`,
          ),
        ],
        [
          ['How do you detect and fix N+1 in Hibernate?', 'Log or count SQL statements, then use join fetch, entity graphs or batch fetching; guard with statistics assertions in tests.'],
          ['Why keep both sides of a bidirectional association in sync?', 'Hibernate persists the owning side only; the in-memory graph must be consistent, so use helper methods like addLesson.'],
        ],
      ),
      topic(
        'hb-ex-optimistic-locking',
        'Example: Optimistic Locking and Retry for Concurrent Updates',
        [
          blk(`<h3>What you build</h3>
• Two users edit the same course at the same time. With <code>@Version</code> the second save fails with an <b>OptimisticLockException</b> instead of silently overwriting the first (lost update). A service retries or reports a clear conflict.`,
            `@Entity
public class Course {
    @Id @GeneratedValue private Long id;
    private String title;
    @Version private long version;                          // incremented on every update
}

@Service
public class CourseEditService {
    private final CourseRepository repo;
    public CourseEditService(CourseRepository repo) { this.repo = repo; }

    @Transactional
    public void rename(Long id, long expectedVersion, String title) {
        Course c = repo.findById(id).orElseThrow();
        if (c.getVersion() != expectedVersion) throw new ConflictException("Course was changed by someone else");
        c.setTitle(title);                                    // update ... where id=? and version=?
    }
}`,
          ),
        ],
        [
          blk(`<h3>Reproducing the conflict</h3>`,
            `@Test void secondWriterLoses() {
    Long id = repo.save(new Course("Hibernate")).getId();

    EntityManager a = emf.createEntityManager(), b = emf.createEntityManager();
    a.getTransaction().begin(); b.getTransaction().begin();
    Course ca = a.find(Course.class, id), cb = b.find(Course.class, id);
    ca.setTitle("Hibernate A"); a.getTransaction().commit();                         // version 0 -> 1
    cb.setTitle("Hibernate B");
    assertThrows(RollbackException.class, () -> b.getTransaction().commit());       // OptimisticLockException: version mismatch
}`,
          ),
        ],
        [
          blk(`<h3>Retrying and pessimistic alternatives</h3>
• For short, idempotent operations <b>retry</b> (Spring Retry <code>@Retryable(retryFor = ObjectOptimisticLockingFailureException.class)</code>, outside the transaction). For hot rows or inventory counters use <b>pessimistic locking</b> (<code>@Lock(PESSIMISTIC_WRITE)</code>, <code>select ... for update</code>) or an atomic update (<code>update stock set qty = qty - 1 where qty &gt; 0</code>). Choose optimistic locking when conflicts are rare.`,
            `@Retryable(retryFor = ObjectOptimisticLockingFailureException.class, maxAttempts = 3, backoff = @Backoff(delay = 100))
public void incrementViews(Long id) { service.doIncrement(id); }         // separate bean: new transaction per attempt

public interface StockRepository extends JpaRepository<Stock, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select s from Stock s where s.id = :id") Optional<Stock> lockById(Long id);
    @Modifying @Query("update Stock s set s.qty = s.qty - :n where s.id = :id and s.qty >= :n") int reserve(Long id, int n);
}`,
          ),
        ],
        [
          ['What problem does @Version solve?', 'Lost updates: it adds a version check to updates so a stale write fails instead of overwriting newer data.'],
          ['Optimistic vs pessimistic locking?', 'Optimistic detects conflicts at commit via a version column and suits rare conflicts; pessimistic locks rows up front and suits high contention.'],
        ],
      ),
    ],
  },
];

export const microservicesExamples: SubTopic[] = [
  {
    id: 'ms-examples',
    name: 'Worked Examples · Complete Microservices Mini Programs',
    topics: [
      topic(
        'ms-ex-resilient-client',
        'Example: Resilient Service Call with Timeout, Retry, Circuit Breaker and Fallback',
        [
          blk(`<h3>What you build</h3>
• An <b>order-service</b> calling an <b>inventory-service</b> over HTTP with a <b>timeout</b>, <b>retry with backoff</b>, a <b>circuit breaker</b> and a <b>fallback</b>, using Spring Boot 3 and Resilience4j.`,
            `# application.yml
resilience4j:
  circuitbreaker:
    instances:
      inventory: { sliding-window-size: 10, failure-rate-threshold: 50, wait-duration-in-open-state: 10s, permitted-number-of-calls-in-half-open-state: 3 }
  retry:
    instances:
      inventory: { max-attempts: 3, wait-duration: 200ms, enable-exponential-backoff: true, exponential-backoff-multiplier: 2 }
  timelimiter:
    instances:
      inventory: { timeout-duration: 800ms }

@Configuration
class ClientConfig {
    @Bean RestClient inventoryClient(RestClient.Builder b) {
        var f = new JdkClientHttpRequestFactory(); f.setReadTimeout(Duration.ofMillis(800));
        return b.baseUrl("http://inventory-service").requestFactory(f).build();
    }
}

@Service
public class InventoryGateway {
    private final RestClient http;
    public InventoryGateway(RestClient inventoryClient) { this.http = inventoryClient; }

    @CircuitBreaker(name = "inventory", fallbackMethod = "unknown")
    @Retry(name = "inventory")
    public StockLevel stock(String sku) {
        return http.get().uri("/stock/{sku}", sku).retrieve().body(StockLevel.class);
    }
    StockLevel unknown(String sku, Throwable cause) {                     // fallback: degrade gracefully
        return StockLevel.unknown(sku);                                  // "availability unknown", order can be accepted as pending
    }
}`,
          ),
        ],
        [
          blk(`<h3>Rules that make it safe</h3>
• Retry only <b>idempotent</b> calls (GET, or POST with an idempotency key). • Timeouts must be shorter than the caller's own timeout, and retries multiply load: use <b>backoff + jitter</b>. • The <b>fallback</b> must be a real business decision (cached value, default, queue for later), not an empty value that hides failures. • Expose breaker state through <b>Actuator</b> (<code>/actuator/circuitbreakers</code>).`,
            `# watch the breaker
management.endpoints.web.exposure.include: health,circuitbreakers,metrics
management.health.circuitbreakers.enabled: true
# metrics: resilience4j_circuitbreaker_state, resilience4j_circuitbreaker_failure_rate`,
          ),
        ],
        [
          blk(`<h3>Testing the failure path</h3>`,
            `@SpringBootTest
class InventoryGatewayTest {
    @RegisterExtension static WireMockExtension wm = WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();
    @Autowired InventoryGateway gateway; @Autowired CircuitBreakerRegistry registry;

    @Test void fallsBackAndOpensAfterRepeatedFailures() {
        wm.stubFor(get(urlPathMatching("/stock/.*")).willReturn(serverError()));
        for (int i = 0; i < 10; i++) assertThat(gateway.stock("sku-1").known()).isFalse();           // fallback each time
        assertThat(registry.circuitBreaker("inventory").getState()).isEqualTo(CircuitBreaker.State.OPEN);
    }
    @Test void retriesTransientFailure() {
        wm.stubFor(get("/stock/sku-2").inScenario("flaky").whenScenarioStateIs(STARTED).willReturn(serverError()).willSetStateTo("ok"));
        wm.stubFor(get("/stock/sku-2").inScenario("flaky").whenScenarioStateIs("ok").willReturn(okJson("{\\"sku\\":\\"sku-2\\",\\"qty\\":5}")));
        assertThat(gateway.stock("sku-2").qty()).isEqualTo(5);
    }
}`,
          ),
        ],
        [
          ['What are the dangers of naive retries?', 'Retrying non-idempotent calls duplicates side effects and synchronised retries amplify load; use idempotency keys, exponential backoff with jitter and limits.'],
          ['What makes a good fallback?', 'A deliberate degraded behaviour such as a cached value or deferred processing, not a silent default that hides the outage.'],
        ],
      ),
      topic(
        'ms-ex-outbox-saga',
        'Example: Order Placement with Transactional Outbox and Idempotent Consumer',
        [
          blk(`<h3>What you build</h3>
• Order-service saves an order <b>and an outbox row in one local transaction</b>; a relay publishes the event to Kafka; payment-service consumes it <b>idempotently</b>. This is the building block of sagas without distributed transactions.`,
            `// order-service
@Entity class OutboxEvent {
    @Id UUID id = UUID.randomUUID();
    String aggregateId; String type; @Column(columnDefinition = "text") String payload;
    Instant createdAt = Instant.now(); boolean published;
}

@Service
class OrderService {
    private final OrderRepository orders; private final OutboxRepository outbox; private final ObjectMapper json;
    @Transactional
    public UUID place(NewOrder cmd) throws JsonProcessingException {
        Order order = orders.save(Order.from(cmd));
        outbox.save(new OutboxEvent(order.getId().toString(), "OrderPlaced", json.writeValueAsString(new OrderPlaced(order.getId(), cmd.total()))));
        return order.getId();                       // both rows commit together, or neither does
    }
}

@Component
class OutboxRelay {
    private final OutboxRepository outbox; private final KafkaTemplate<String, String> kafka;
    @Scheduled(fixedDelay = 500)
    @Transactional
    void publish() {
        for (OutboxEvent e : outbox.findTop100ByPublishedFalseOrderByCreatedAt()) {
            kafka.send("orders", e.getAggregateId(), e.getPayload()).join();          // key = aggregate id keeps per-order ordering
            e.setPublished(true);
        }
    }
}`,
          ),
        ],
        [
          blk(`<h3>Idempotent consumer</h3>
• Delivery is <b>at least once</b>, so the consumer must handle duplicates: record processed event ids in a table with a <b>unique constraint</b> in the same transaction as the business change.`,
            `// payment-service
@Entity @Table(name = "processed_event") class ProcessedEvent { @Id UUID eventId; }

@Component
class OrderPlacedListener {
    private final ProcessedEventRepository processed; private final PaymentService payments;

    @KafkaListener(topics = "orders", groupId = "payment")
    @Transactional
    public void on(ConsumerRecord<String, String> rec, @Header("eventId") String eventId) {
        UUID id = UUID.fromString(eventId);
        if (processed.existsById(id)) return;                      // duplicate delivery: ignore
        processed.save(new ProcessedEvent(id));                    // unique key also protects concurrent duplicates
        payments.authorize(parse(rec.value()));
    }
}`,
          ),
        ],
        [
          blk(`<h3>Compensation and failure handling</h3>
• If payment fails, payment-service emits <code>PaymentFailed</code> and order-service <b>compensates</b> (cancels the order): that is a <b>choreographed saga</b>. Add a <b>dead-letter topic</b> for poison messages, <b>retry with backoff</b> before the DLT, and monitor consumer lag and outbox backlog. Alternatives to a polling relay: <b>CDC with Debezium</b> reading the outbox table.`,
            `@Bean DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
    var recoverer = new DeadLetterPublishingRecoverer(template);                      // orders.DLT
    return new DefaultErrorHandler(recoverer, new ExponentialBackOffWithMaxRetries(5) {{ setInitialInterval(500); setMultiplier(2); }});
}

@KafkaListener(topics = "payments", groupId = "orders")
@Transactional
void onPayment(PaymentResult r) {
    Order o = orders.findById(r.orderId()).orElseThrow();
    if (r.success()) o.markPaid(); else o.cancel("payment failed");                 // compensating action
}`,
          ),
        ],
        [
          ['Why is the transactional outbox needed?', 'Writing to the database and publishing to a broker are two operations that cannot be atomic; the outbox stores the event in the same local transaction and a relay publishes it reliably.'],
          ['How do you handle duplicate messages?', 'Make consumers idempotent by recording processed event ids with a unique constraint in the same transaction as the business update.'],
        ],
      ),
    ],
  },
];
