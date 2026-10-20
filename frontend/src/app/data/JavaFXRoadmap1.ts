// JavaFX roadmap, part 1: the roadmap overview and sections 1-5 (fundamentals, UI controls, layouts, event handling, properties and binding).
// Examples use JavaFX 21 and Java 21.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const fx = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('fx', n, title, priority, topics);

export const javaFxRoadmap1: SubTopic[] = [
  {
    id: 'fx-roadmap',
    name: 'JavaFX Roadmap (16 Sections, 185 Topics)',
    topics: [
      topic(
        'fx-roadmap-overview',
        'JavaFX Important Topics Checklist (185 Topics)',
        [
          blk(`<h3>How the roadmap is organised</h3>
• The 185 JavaFX topics, from beginner to advanced, are grouped into <b>16 sections</b>, each a module of this course with worked Java examples and interview questions. Starred sections (UI components, event handling, properties and binding, TableView and data handling, concurrency) are the ones every JavaFX developer uses daily and that interviews focus on.
<table ${TABLE}>
<tr><th>Section</th><th>Topics</th><th>Items</th></tr>
<tr><td>1</td><td>JavaFX Fundamentals</td><td>1-10</td></tr>
<tr><td>2</td><td>JavaFX UI Components ⭐</td><td>11-30</td></tr>
<tr><td>3</td><td>Layout Management</td><td>31-40</td></tr>
<tr><td>4</td><td>Event Handling ⭐</td><td>41-50</td></tr>
<tr><td>5</td><td>JavaFX Properties and Binding ⭐</td><td>51-62</td></tr>
<tr><td>6</td><td>FXML and Scene Builder</td><td>63-74</td></tr>
<tr><td>7</td><td>CSS and Styling</td><td>75-84</td></tr>
<tr><td>8</td><td>TableView and Data Handling ⭐</td><td>85-95</td></tr>
<tr><td>9</td><td>Navigation and Windows</td><td>96-104</td></tr>
<tr><td>10</td><td>Concurrency and Background Tasks ⭐</td><td>105-114</td></tr>
<tr><td>11</td><td>Database Integration</td><td>115-124</td></tr>
<tr><td>12</td><td>JavaFX with Spring Boot</td><td>125-134</td></tr>
<tr><td>13</td><td>Advanced JavaFX</td><td>135-150</td></tr>
<tr><td>14</td><td>Testing and Debugging</td><td>151-160</td></tr>
<tr><td>15</td><td>Packaging and Deployment</td><td>161-170</td></tr>
<tr><td>16</td><td>JavaFX Interview Questions</td><td>171-185</td></tr>
</table>`),
        ],
        [
          blk(`<h3>Top 15 topics to master first (Java developer)</h3>
1. JavaFX application lifecycle<br>
2. Stage and Scene<br>
3. UI controls<br>
4. Layout panes<br>
5. Event handling<br>
6. Properties and binding<br>
7. FXML and Scene Builder<br>
8. JavaFX CSS<br>
9. TableView and ObservableList<br>
10. Scene navigation<br>
11. JavaFX concurrency (<code>Task</code> and <code>Service</code>)<br>
12. JDBC and database integration<br>
13. JavaFX with Spring Boot<br>
14. Testing with JUnit and TestFX<br>
15. Packaging with <code>jpackage</code>`),
        ],
        [
          blk(`<h3>How to study JavaFX</h3>
• JavaFX has three ideas that explain everything: a <b>scene graph</b> (a tree of <code>Node</code>s inside a <code>Scene</code> inside a <code>Stage</code>), <b>observable properties</b> (UI state is data you bind to) and a <b>single UI thread</b> (the JavaFX Application Thread; long work goes to background tasks). Build a small desktop app (a course tracker with a table, a form, a database and a background import) while you work through the sections: each concept then has a place to live.`),
        ],
        [
          ['Which JavaFX topics matter most for interviews?', 'The application lifecycle, Stage/Scene, layouts, event handling, properties and binding, FXML controllers, TableView with ObservableList, and concurrency with Task/Service and Platform.runLater, plus packaging with jpackage.'],
          ['What three ideas explain JavaFX?', 'A scene graph of nodes, observable properties with binding, and a single JavaFX Application Thread that must not be blocked.'],
        ],
      ),
    ],
  },

  fx(1, 'JavaFX Fundamentals', 'Core', [
    topic(
      'fx-intro-architecture',
      'Introduction, Architecture, JavaFX vs Swing vs AWT',
      [
        blk(`<h3>What is JavaFX?</h3>
• <b>JavaFX</b> is a modern Java framework for <b>rich desktop (and embedded/mobile via Gluon) client applications</b>: a hardware-accelerated scene graph, a large control library, CSS styling, FXML markup, animation, charts, media and web content. Since Java 11 it is <b>not bundled with the JDK</b>; it ships as the OpenJFX project (<code>org.openjfx</code>) as separate modules.<br>
• <b>Hello JavaFX</b>: one class extending <code>Application</code>.`,
          `import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

public class HelloApp extends Application {
    @Override
    public void start(Stage stage) {
        Label label = new Label("Hello, JavaFX " + System.getProperty("javafx.version"));
        stage.setScene(new Scene(new StackPane(label), 420, 240));
        stage.setTitle("Hello");
        stage.show();
    }
    public static void main(String[] args) { launch(args); }
}`,
        ),
      ],
      [
        blk(`<h3>Architecture</h3>
• <b>Layers (top to bottom)</b>: your application → <b>Public API</b> (<code>javafx.scene</code>, <code>javafx.controls</code>, <code>javafx.fxml</code>, <code>javafx.graphics</code>, <code>javafx.media</code>, <code>javafx.web</code>) → <b>Quantum Toolkit</b> (threading and rendering coordination) → <b>Prism</b> (rendering: GPU via Direct3D/OpenGL/Metal, software fallback) + <b>Glass</b> (windowing toolkit, native OS integration) + <b>Media Engine</b> + <b>Web Engine</b> (WebKit) → JVM. The <b>JavaFX Application Thread</b> processes events and pulses; Prism rendering runs on a separate render thread.<br>
• <b>Modules</b>: <code>javafx.base</code> (properties, collections), <code>javafx.graphics</code> (scene graph, stage), <code>javafx.controls</code>, <code>javafx.fxml</code>, <code>javafx.media</code>, <code>javafx.web</code>, <code>javafx.swing</code> (Swing interop).`,
          `// module-info.java for a modular app
module com.javaschoollab.tracker {
    requires javafx.controls;
    requires javafx.fxml;
    exports com.javaschoollab.tracker;
    opens com.javaschoollab.tracker.ui to javafx.fxml;          // FXML needs reflective access to controllers
}`,
        ),
      ],
      [
        blk(`<h3>JavaFX vs Swing vs AWT</h3>
<table ${TABLE}>
<tr><th></th><th>AWT</th><th>Swing</th><th>JavaFX</th></tr>
<tr><td>Introduced</td><td>Java 1.0</td><td>Java 1.2</td><td>2008 (JavaFX 2: 2011; OpenJFX since Java 11)</td></tr>
<tr><td>Components</td><td>Heavyweight, native peers</td><td>Lightweight, Java-drawn</td><td>Scene graph of nodes, GPU rendering</td></tr>
<tr><td>Look and feel</td><td>Native</td><td>Pluggable (Metal, Nimbus)</td><td><b>CSS-styled</b> (Modena, Caspian)</td></tr>
<tr><td>Layout</td><td>Layout managers</td><td>Layout managers (BorderLayout, GridBagLayout)</td><td>Layout panes (VBox, GridPane ...)</td></tr>
<tr><td>Data binding</td><td>No</td><td>Limited</td><td><b>Built-in properties and binding</b></td></tr>
<tr><td>UI markup</td><td>No</td><td>No</td><td><b>FXML</b> + Scene Builder</td></tr>
<tr><td>Animation, effects, charts, media</td><td>No</td><td>Limited</td><td><b>Built in</b></td></tr>
<tr><td>Status</td><td>Legacy</td><td>Maintained, no new features</td><td><b>Actively developed</b></td></tr>
</table>
• Interop: <code>SwingNode</code> embeds Swing in JavaFX; <code>JFXPanel</code> embeds JavaFX in Swing.`,
          `// JavaFX in an existing Swing app
JFXPanel panel = new JFXPanel();
Platform.runLater(() -> panel.setScene(new Scene(new Button("JavaFX inside Swing"))));
frame.add(panel);

// Swing inside JavaFX
SwingNode node = new SwingNode();
SwingUtilities.invokeLater(() -> node.setContent(new JButton("Swing inside JavaFX")));`,
        ),
      ],
      [
        ['What is JavaFX?', 'A Java framework for rich desktop and embedded client applications with a scene graph, controls, CSS, FXML, animation, charts and media, distributed as OpenJFX modules separate from the JDK since Java 11.'],
        ['JavaFX vs Swing?', 'JavaFX uses a GPU-accelerated scene graph, CSS styling, FXML and built-in binding and is actively developed; Swing is lightweight component based, mature but in maintenance.'],
        ['What are Prism and Glass?', 'Prism is JavaFX\'s rendering pipeline (GPU/software) and Glass is the windowing and native OS integration layer; Quantum coordinates them.'],
      ],
    ),
    topic(
      'fx-setup-structure',
      'SDK Setup, Maven/Gradle, Project Structure and the Application Class',
      [
        blk(`<h3>Setting up JavaFX</h3>
• Install a JDK (21 LTS) and add JavaFX as <b>dependencies</b> (recommended: Maven/Gradle downloads the platform-specific modules) or install the <b>JavaFX SDK</b> from openjfx.io and pass <code>--module-path /path/javafx-sdk/lib --add-modules javafx.controls,javafx.fxml</code> when running. Typical IDE issue: <i>"JavaFX runtime components are missing"</i> means the module path/--add-modules is missing or your main class extends <code>Application</code> in a non-modular launch: use a separate <code>Launcher</code> class with <code>main</code> for fat jars.`,
          `# run with a downloaded SDK
javac --module-path "C:\\javafx-sdk-21\\lib" --add-modules javafx.controls -d out HelloApp.java
java  --module-path "C:\\javafx-sdk-21\\lib" --add-modules javafx.controls -cp out HelloApp`,
        ),
      ],
      [
        blk(`<h3>Maven and Gradle</h3>`,
          `<!-- pom.xml -->
<properties><maven.compiler.release>21</maven.compiler.release><javafx.version>21.0.2</javafx.version></properties>
<dependencies>
  <dependency><groupId>org.openjfx</groupId><artifactId>javafx-controls</artifactId><version>\${javafx.version}</version></dependency>
  <dependency><groupId>org.openjfx</groupId><artifactId>javafx-fxml</artifactId><version>\${javafx.version}</version></dependency>
</dependencies>
<build><plugins>
  <plugin><groupId>org.openjfx</groupId><artifactId>javafx-maven-plugin</artifactId><version>0.0.8</version>
    <configuration><mainClass>com.javaschoollab.tracker/com.javaschoollab.tracker.App</mainClass></configuration></plugin>
</plugins></build>
<!-- run with: mvn javafx:run -->`,
          `// build.gradle (Gradle)
plugins { id 'application'; id 'org.openjfx.javafxplugin' version '0.1.0' }
javafx { version = '21.0.2'; modules = ['javafx.controls', 'javafx.fxml'] }
application { mainClass = 'com.javaschoollab.tracker.App' }
// run with: gradle run`,
        ),
      ],
      [
        blk(`<h3>Project structure</h3>
<table ${TABLE}>
<tr><th>Path</th><th>Contents</th></tr>
<tr><td><code>src/main/java/.../App.java</code></td><td><code>Application</code> subclass (entry point)</td></tr>
<tr><td><code>src/main/java/.../Launcher.java</code></td><td>Plain <code>main</code> that calls <code>App.main</code> (fat-jar friendly)</td></tr>
<tr><td><code>.../ui/*Controller.java</code></td><td>FXML controllers</td></tr>
<tr><td><code>.../model/</code>, <code>.../service/</code>, <code>.../repository/</code></td><td>Domain, business logic, data access</td></tr>
<tr><td><code>src/main/resources/.../view/*.fxml</code></td><td>Views</td></tr>
<tr><td><code>src/main/resources/.../css/*.css</code>, <code>images/</code>, <code>fonts/</code></td><td>Styling and assets</td></tr>
<tr><td><code>module-info.java</code></td><td>Module descriptor (optional)</td></tr>
</table>
• Keep UI (<b>view + controller</b>) separate from <b>model/service</b> so the logic can be unit-tested without starting JavaFX (MVC/MVVM). Load resources with <code>getClass().getResource("/com/.../view/main.fxml")</code> (never relative file paths).`,
          `// Launcher.java: avoids "JavaFX runtime components are missing" when running a shaded jar
public class Launcher { public static void main(String[] args) { App.main(args); } }

// App.java
public class App extends Application {
    @Override public void start(Stage stage) throws IOException {
        FXMLLoader loader = new FXMLLoader(App.class.getResource("/com/javaschoollab/tracker/view/main.fxml"));
        stage.setScene(new Scene(loader.load(), 900, 600));
        stage.setTitle("Course Tracker");
        stage.show();
    }
    public static void main(String[] args) { launch(args); }
}`,
        ),
      ],
      [
        ['Why does "JavaFX runtime components are missing" appear?', 'The JavaFX modules are not on the module path or not added with --add-modules, or the main class extends Application in a classpath launch; add the modules or use a separate launcher class.'],
        ['How do you add JavaFX to a Maven project?', 'Add org.openjfx javafx-controls/javafx-fxml dependencies and the javafx-maven-plugin, then run mvn javafx:run.'],
        ['Why separate model/service from controllers?', 'So business logic can be tested without the JavaFX toolkit and the UI can change independently (MVC/MVVM).'],
      ],
    ),
    topic(
      'fx-lifecycle-stage-scene',
      'Application Lifecycle, Application Class, Stage and Scene Graph',
      [
        blk(`<h3>The Application lifecycle</h3>
• <code>Application.launch(args)</code> starts the toolkit and calls, in order: <b><code>init()</code></b> (on the <b>launcher thread</b>, <b>no UI creation</b>, a good place for loading configuration), <b><code>start(Stage primaryStage)</code></b> (on the <b>JavaFX Application Thread</b>: build and show the UI) and, after the last window closes (when <code>Platform.isImplicitExit()</code>) or <code>Platform.exit()</code>, <b><code>stop()</code></b> (release resources, close pools and DB connections). <code>launch</code> blocks until the application exits and can be called <b>only once</b> per JVM. <code>getParameters()</code> gives command-line arguments.`,
          `public class TrackerApp extends Application {
    private ExecutorService background;

    @Override public void init() {                          // launcher thread: no Stage/Scene/Node creation here
        System.out.println("init on " + Thread.currentThread().getName());
        background = Executors.newFixedThreadPool(4);
    }
    @Override public void start(Stage stage) {              // JavaFX Application Thread
        System.out.println("start on " + Thread.currentThread().getName());       // JavaFX Application Thread
        stage.setScene(new Scene(new Label("ready"), 300, 120));
        stage.show();
    }
    @Override public void stop() {                          // JavaFX Application Thread, on exit
        background.shutdownNow();
        System.out.println("stop: cleaned up");
    }
    public static void main(String[] args) { launch(args); }
}`,
        ),
      ],
      [
        blk(`<h3>Stage, Scene and the scene graph</h3>
• <b><code>Stage</code></b> = a window (the <b>primary stage</b> is given to <code>start</code>; create more for dialogs). <b><code>Scene</code></b> = the content of a stage: holds one <b>root node</b> and optional width/height, fill, stylesheets. <b>Scene graph</b> = a tree of <code>Node</code>s: <code>Parent</code> nodes (<code>Group</code>, <code>Region</code> → panes, controls) have children; <code>Shape</code>, <code>ImageView</code>, <code>Canvas</code> are leaves. A node can have <b>only one parent</b> and can be in only one scene. Stage styles: <code>DECORATED</code>, <code>UNDECORATED</code>, <code>TRANSPARENT</code>, <code>UTILITY</code>; modality <code>NONE</code>, <code>WINDOW_MODAL</code>, <code>APPLICATION_MODAL</code>.`,
          `@Override public void start(Stage stage) {
    Label title = new Label("Course Tracker");
    Button add = new Button("Add course");
    VBox root = new VBox(12, title, add);                  // root node: a layout pane
    root.setPadding(new Insets(16));

    Scene scene = new Scene(root, 480, 320);
    scene.getStylesheets().add(getClass().getResource("/css/app.css").toExternalForm());

    stage.setScene(scene);
    stage.setTitle("Tracker");
    stage.setMinWidth(360); stage.setMinHeight(240);
    stage.getIcons().add(new Image(getClass().getResourceAsStream("/images/icon.png")));
    stage.setOnCloseRequest(e -> { if (!confirmExit()) e.consume(); });          // veto closing
    stage.show();

    System.out.println(root.getChildren());                 // the ObservableList of children
}`,
        ),
      ],
      [
        blk(`<h3>Application thread, parameters and quitting</h3>
• <code>Platform.runLater</code> schedules code on the JavaFX Application Thread; <code>Platform.exit()</code> ends the app (calls <code>stop</code>); <code>Platform.setImplicitExit(false)</code> keeps the app alive with no windows (system tray apps). Command line: <code>getParameters().getNamed()/getRaw()</code>. Host services: <code>getHostServices().showDocument(url)</code> opens the browser. <b>Splash screens</b>: <code>Preloader</code> (or an early undecorated stage). Scene graph changes of a <b>live</b> scene must happen on the Application Thread.`,
          `@Override public void start(Stage stage) {
    Parameters p = getParameters();
    String profile = p.getNamed().getOrDefault("profile", "dev");           // java App --profile=prod
    Hyperlink help = new Hyperlink("Documentation");
    help.setOnAction(e -> getHostServices().showDocument("https://openjfx.io"));
    Button quit = new Button("Quit"); quit.setOnAction(e -> Platform.exit());
    stage.setScene(new Scene(new VBox(8, new Label("profile: " + profile), help, quit), 320, 160));
    stage.show();
}`,
        ),
      ],
      [
        ['What is the JavaFX application lifecycle?', 'launch() starts the toolkit; init() runs on the launcher thread, start(Stage) on the JavaFX Application Thread to build the UI, and stop() runs when the application exits to release resources.'],
        ['Stage vs Scene?', 'A Stage is a window; a Scene is the content of a stage and holds the root node of the scene graph.'],
        ['Why create UI in start() rather than init()?', 'init() runs on the launcher thread, not the JavaFX Application Thread; UI objects such as Stage must be created on the Application Thread.'],
      ],
    ),
  ]),

  fx(2, 'JavaFX UI Components', 'Essential', [
    topic(
      'fx-controls-basic',
      'Label, Button, TextField, PasswordField, TextArea, CheckBox, RadioButton and ToggleGroup',
      [
        blk(`<h3>Text and button controls</h3>
• <code>Label</code> (non-editable text, optional graphic, <code>wrapText</code>, <code>labelFor</code> mnemonic), <code>Button</code> (<code>setOnAction</code>, <code>setDefaultButton(true)</code> reacts to Enter, <code>setCancelButton(true)</code> to Esc, <code>setGraphic</code>), <code>TextField</code> (single line: <code>getText</code>, <code>setPromptText</code>, <code>textProperty()</code>), <code>PasswordField</code> (masked; do not keep the password string longer than needed), <code>TextArea</code> (multi-line, <code>setWrapText</code>, <code>setPrefRowCount</code>).`,
          `Label name = new Label("Course title:");
TextField title = new TextField();
title.setPromptText("e.g. Spring Core");
name.setLabelFor(title);

PasswordField pass = new PasswordField();
TextArea notes = new TextArea();
notes.setWrapText(true); notes.setPrefRowCount(4);

Button save = new Button("Save");
save.setDefaultButton(true);                                   // Enter triggers it
save.disableProperty().bind(title.textProperty().isEmpty());   // disabled until a title is typed
save.setOnAction(e -> System.out.println("saving " + title.getText().trim()));

// limit input length with a TextFormatter
title.setTextFormatter(new TextFormatter<String>(c -> c.getControlNewText().length() <= 60 ? c : null));`,
        ),
      ],
      [
        blk(`<h3>CheckBox, RadioButton and ToggleGroup</h3>
• <code>CheckBox</code> (selected/unselected, optional <b>indeterminate</b> with <code>setAllowIndeterminate(true)</code>); <code>RadioButton</code> belongs to a <b><code>ToggleGroup</code></b> so only one is selected: use <code>setUserData</code> to attach a value, and listen to <code>selectedToggleProperty()</code>. <code>ToggleButton</code> is the push-style equivalent.`,
          `CheckBox newsletter = new CheckBox("Send me updates");
newsletter.selectedProperty().addListener((obs, was, is) -> System.out.println("newsletter=" + is));

ToggleGroup level = new ToggleGroup();
RadioButton beginner = new RadioButton("Beginner");   beginner.setToggleGroup(level);  beginner.setUserData(Level.BEGINNER);
RadioButton expert   = new RadioButton("Expert");     expert.setToggleGroup(level);    expert.setUserData(Level.EXPERT);
beginner.setSelected(true);

level.selectedToggleProperty().addListener((obs, old, now) -> {
    if (now != null) System.out.println("level=" + now.getUserData());
});
Level chosen = (Level) level.getSelectedToggle().getUserData();`,
        ),
      ],
      [
        blk(`<h3>Form validation pattern</h3>
• Build forms with binding rather than manual enable/disable code: <code>Bindings.createBooleanBinding</code> over several inputs gives one "valid" property; show inline error labels via <code>visibleProperty().bind(...)</code>; validate on focus loss and on submit. For serious forms use a validation library (ControlsFX, Validatorfx) or your own small validator.`,
          `BooleanBinding valid = Bindings.createBooleanBinding(
    () -> !title.getText().isBlank() && pass.getText().length() >= 8 && level.getSelectedToggle() != null,
    title.textProperty(), pass.textProperty(), level.selectedToggleProperty());
save.disableProperty().bind(valid.not());

Label error = new Label("Password must be at least 8 characters");
error.getStyleClass().add("error");
error.visibleProperty().bind(pass.textProperty().length().lessThan(8).and(pass.focusedProperty().not()).and(pass.textProperty().isNotEmpty()));
error.managedProperty().bind(error.visibleProperty());              // take no space when hidden`,
        ),
      ],
      [
        ['How do RadioButtons work together?', 'They share a ToggleGroup so only one can be selected; read selectedToggleProperty() or getSelectedToggle().getUserData().'],
        ['How do you disable a Save button until the form is valid?', 'Bind its disableProperty to the negation of a boolean binding created from the input properties.'],
        ['Why use PasswordField instead of TextField?', 'It masks the characters and prevents cut/copy of the text; still avoid keeping the password in memory or logs longer than needed.'],
      ],
    ),
    topic(
      'fx-controls-selection-lists',
      'ComboBox, ChoiceBox, ListView, TreeView, DatePicker, ProgressBar and Slider',
      [
        blk(`<h3>Selection controls</h3>
• <code>ComboBox&lt;T&gt;</code> (drop-down; optionally <b>editable</b>; <code>setItems(ObservableList)</code>, <code>valueProperty()</code>, <code>setCellFactory</code> and <code>setConverter(StringConverter)</code> to show objects nicely), <code>ChoiceBox&lt;T&gt;</code> (simpler, short lists), <code>ListView&lt;T&gt;</code> (scrollable list; <code>SelectionMode.MULTIPLE</code>, <code>setCellFactory</code> for custom rows), <code>TreeView&lt;T&gt;</code> (hierarchical: <code>TreeItem</code> with children, <code>setShowRoot(false)</code>), <code>DatePicker</code> (<code>LocalDate</code>), <code>ProgressBar</code>/<code>ProgressIndicator</code> (0..1 or indeterminate <code>-1</code>), <code>Slider</code> (min, max, value, ticks, <code>valueChanging</code>).`,
          `ComboBox<Course> courses = new ComboBox<>(FXCollections.observableArrayList(catalogue.all()));
courses.setConverter(new StringConverter<>() {
    public String toString(Course c) { return c == null ? "" : c.title(); }
    public Course fromString(String s) { return null; }
});
courses.valueProperty().addListener((o, a, b) -> System.out.println("picked " + b));

ListView<String> topics = new ListView<>(FXCollections.observableArrayList("IoC", "AOP", "Transactions"));
topics.getSelectionModel().setSelectionMode(SelectionMode.MULTIPLE);
ObservableList<String> chosen = topics.getSelectionModel().getSelectedItems();

DatePicker start = new DatePicker(LocalDate.now());
start.setDayCellFactory(p -> new DateCell() { @Override public void updateItem(LocalDate d, boolean empty) {
    super.updateItem(d, empty); setDisable(empty || d.isBefore(LocalDate.now()));          // no past dates
}});

Slider volume = new Slider(0, 100, 50);
volume.setShowTickLabels(true); volume.setMajorTickUnit(25); volume.setBlockIncrement(5);
ProgressBar bar = new ProgressBar();
bar.progressProperty().bind(volume.valueProperty().divide(100));`,
        ),
      ],
      [
        blk(`<h3>TreeView</h3>
• A <code>TreeView</code> shows <code>TreeItem&lt;T&gt;</code>s with <code>expanded</code> state; build lazily by overriding <code>isLeaf()</code>/<code>getChildren()</code> in a custom <code>TreeItem</code> for big trees (file systems). Use <code>setCellFactory</code> for icons, and <code>getSelectionModel().selectedItemProperty()</code> for navigation menus or module outlines.`,
          `TreeItem<String> root = new TreeItem<>("Courses");
TreeItem<String> spring = new TreeItem<>("Spring Core");
spring.getChildren().addAll(new TreeItem<>("IoC"), new TreeItem<>("AOP"), new TreeItem<>("Transactions"));
root.getChildren().addAll(spring, new TreeItem<>("JavaFX"));
root.setExpanded(true);

TreeView<String> tree = new TreeView<>(root);
tree.setShowRoot(false);
tree.getSelectionModel().selectedItemProperty().addListener((o, a, item) -> { if (item != null && item.isLeaf()) open(item.getValue()); });`,
        ),
      ],
      [
        blk(`<h3>Custom cells with cell factories</h3>
• Lists, combo boxes, tables and trees render items through <b>cells</b>, reused as you scroll (virtualised). A <code>cellFactory</code> returns a <code>ListCell</code> whose <code>updateItem(item, empty)</code> must <b>always set or clear</b> text and graphic (cells are recycled: forgetting the <code>empty</code> branch shows stale content).`,
          `listView.setCellFactory(lv -> new ListCell<Course>() {
    private final Label title = new Label(); private final Label meta = new Label(); private final VBox box = new VBox(2, title, meta);
    @Override protected void updateItem(Course c, boolean empty) {
        super.updateItem(c, empty);
        if (empty || c == null) { setGraphic(null); setText(null); return; }       // clear recycled cell
        title.setText(c.title()); meta.setText(c.lessons() + " lessons");
        meta.getStyleClass().add("muted");
        setGraphic(box);
    }
});`,
        ),
      ],
      [
        ['ComboBox vs ChoiceBox?', 'ComboBox is richer (editable, custom cells, converters, more items); ChoiceBox is a simple selection of a few items.'],
        ['Why must updateItem handle the empty case?', 'Cells are reused while scrolling, so you must clear text and graphic when the cell is empty, otherwise stale content from another item appears.'],
        ['How do you display objects in a ComboBox?', 'Provide a StringConverter (and/or a cellFactory/buttonCell) that maps the object to the text shown.'],
      ],
    ),
    topic(
      'fx-controls-menus-dialogs-tables',
      'MenuBar, ToolBar, TabPane, TableView Introduction, Dialog and Alert',
      [
        blk(`<h3>MenuBar, ToolBar and TabPane</h3>
• <code>MenuBar</code> contains <code>Menu</code>s of <code>MenuItem</code>/<code>CheckMenuItem</code>/<code>RadioMenuItem</code>/<code>SeparatorMenuItem</code> with <code>accelerator</code> (<code>KeyCombination.keyCombination("Shortcut+S")</code>; on macOS <code>setUseSystemMenuBar(true)</code>). <code>ToolBar</code> holds buttons/separators and overflows into a chevron. <code>TabPane</code> hosts <code>Tab</code>s (<code>setClosable</code>, <code>TabClosingPolicy</code>, <code>selectionModelProperty()</code>, lazy content).`,
          `MenuItem open = new MenuItem("Open...");
open.setAccelerator(KeyCombination.keyCombination("Shortcut+O"));
open.setOnAction(e -> chooseFile());
MenuItem exit = new MenuItem("Exit"); exit.setOnAction(e -> Platform.exit());
Menu file = new Menu("File", null, open, new SeparatorMenuItem(), exit);
MenuBar menuBar = new MenuBar(file, new Menu("Help"));
menuBar.setUseSystemMenuBar(true);

ToolBar tools = new ToolBar(new Button("New"), new Separator(), new Button("Save"));

TabPane tabs = new TabPane(new Tab("Overview", overviewPane), new Tab("Lessons", lessonsPane));
tabs.setTabClosingPolicy(TabPane.TabClosingPolicy.UNAVAILABLE);

BorderPane root = new BorderPane(tabs);
root.setTop(new VBox(menuBar, tools));`,
        ),
      ],
      [
        blk(`<h3>Dialog and Alert</h3>
• <code>Alert</code> (<code>AlertType.INFORMATION/WARNING/ERROR/CONFIRMATION</code>) and the generic <code>Dialog&lt;R&gt;</code> are <b>modal</b> windows: <code>showAndWait()</code> returns an <code>Optional</code> of the pressed <code>ButtonType</code> (or custom result). <code>TextInputDialog</code> and <code>ChoiceDialog</code> collect a value. Set the <b>owner</b> (<code>initOwner(stage)</code>) so the dialog centres on the window. Do not block long operations inside the handler.`,
          `Alert confirm = new Alert(Alert.AlertType.CONFIRMATION, "Delete course 'Spring Core'?", ButtonType.YES, ButtonType.NO);
confirm.setHeaderText("Confirm delete");
confirm.initOwner(stage);
Optional<ButtonType> result = confirm.showAndWait();
if (result.filter(b -> b == ButtonType.YES).isPresent()) delete();

TextInputDialog ask = new TextInputDialog("New course");
ask.setHeaderText("Course name");
ask.showAndWait().ifPresent(this::create);

// custom dialog returning a value
Dialog<Course> dialog = new Dialog<>();
dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
TextField titleField = new TextField();
dialog.getDialogPane().setContent(new VBox(8, new Label("Title"), titleField));
dialog.setResultConverter(bt -> bt == ButtonType.OK ? new Course(titleField.getText()) : null);
dialog.showAndWait().ifPresent(this::add);`,
        ),
      ],
      [
        blk(`<h3>TableView at a glance and picking controls</h3>
• <code>TableView&lt;S&gt;</code> shows tabular data with <code>TableColumn&lt;S,T&gt;</code>s fed by an <code>ObservableList&lt;S&gt;</code> (covered in depth in section 8). <b>Choosing controls</b>: few fixed options → radio buttons/choice box; many options → combo box; large collections → list/table (virtualised); hierarchy → tree; dates → <code>DatePicker</code>; numbers in a range → <code>Slider</code>/<code>Spinner</code>; long operations → <code>ProgressBar</code> bound to a <code>Task</code>. Remember accessibility: labels, mnemonics, tab order (<code>focusTraversable</code>), tooltips (<code>Tooltip.install</code>).`,
          `Spinner<Integer> seats = new Spinner<>(1, 50, 10);
seats.setEditable(true);
Tooltip.install(seats, new Tooltip("Maximum learners"));
Button save = new Button("_Save");                        // underscore = mnemonic (Alt+S)
save.setMnemonicParsing(true);`,
        ),
      ],
      [
        ['What does Alert.showAndWait() return?', 'An Optional<ButtonType> holding the button the user pressed (empty if closed without choosing); it blocks while keeping the event loop running.'],
        ['How do you add a keyboard shortcut to a menu item?', 'Set its accelerator, e.g. KeyCombination.keyCombination("Shortcut+S"), where Shortcut maps to Ctrl or Cmd per platform.'],
        ['TabPane closing policies?', 'UNAVAILABLE (no close buttons), SELECTED_TAB (only the selected tab can be closed) and ALL_TABS.'],
      ],
    ),
  ]),

  fx(3, 'Layout Management', 'Core', [
    topic(
      'fx-layout-panes-basic',
      'HBox, VBox, BorderPane, FlowPane, TilePane and StackPane',
      [
        blk(`<h3>How layout works</h3>
• A <b>layout pane</b> (a <code>Region</code> subclass) positions and sizes its children using each child's <b>min / pref / max</b> sizes and the pane's rules; resizable nodes can grow (<code>Priority.ALWAYS/SOMETIMES</code>). Layout is recomputed whenever sizes or children change (a <b>layout pass</b> per pulse). <b>Never set absolute positions</b> unless you use <code>Pane</code>/<code>Group</code> deliberately: let panes do the work so the UI adapts to window size, fonts and DPI.`,
          `// HBox: horizontal row. VBox: vertical column. spacing + padding + alignment.
HBox row = new HBox(8, new Button("Back"), new Region(), new Button("Next"));
HBox.setHgrow(row.getChildren().get(1), Priority.ALWAYS);               // spacer pushes buttons apart
row.setAlignment(Pos.CENTER_LEFT);
row.setPadding(new Insets(8));

VBox column = new VBox(10, new Label("Title"), new TextField(), new Button("Save"));
column.setFillWidth(true);
VBox.setVgrow(textArea, Priority.ALWAYS);`,
        ),
      ],
      [
        blk(`<h3>BorderPane, FlowPane, TilePane and StackPane</h3>
<table ${TABLE}>
<tr><th>Pane</th><th>Behaviour</th><th>Use for</th></tr>
<tr><td><code>BorderPane</code></td><td>Top, bottom, left, right, centre (centre takes the rest)</td><td>Application shell: menu top, navigation left, content centre, status bottom</td></tr>
<tr><td><code>FlowPane</code></td><td>Wraps children like text when width runs out</td><td>Tag lists, button groups, thumbnails</td></tr>
<tr><td><code>TilePane</code></td><td>Equal-sized cells wrapping in rows/columns</td><td>Image galleries, dashboards of cards</td></tr>
<tr><td><code>StackPane</code></td><td>Children layered on top of each other (z-order = child order), centred by default</td><td>Overlays, badges, loading spinner over content, custom controls</td></tr>
</table>`,
          `BorderPane shell = new BorderPane();
shell.setTop(menuBar);
shell.setLeft(navigationTree);
shell.setCenter(contentTabs);
shell.setBottom(new Label("Ready"));
BorderPane.setMargin(shell.getBottom(), new Insets(4, 8, 4, 8));

FlowPane tags = new FlowPane(6, 6);                      // hgap, vgap
tags.setPrefWrapLength(300);
for (String t : List.of("java", "spring", "javafx", "sql")) tags.getChildren().add(new Label("#" + t));

TilePane gallery = new TilePane(8, 8);
gallery.setPrefColumns(3); gallery.setTileAlignment(Pos.CENTER);

StackPane loading = new StackPane(contentPane, new ProgressIndicator());   // spinner overlay on top of content`,
        ),
      ],
      [
        blk(`<h3>Spacing, margin, padding and alignment</h3>
• <b>Padding</b> = space inside a pane around its children; <b>margin</b> = space around a child set via the pane's static method (<code>VBox.setMargin(node, insets)</code>); <b>spacing</b>/<code>hgap</code>/<code>vgap</code> = gaps between children; <b>alignment</b> = where children sit inside the pane (<code>Pos</code>). Use CSS (<code>-fx-padding</code>, <code>-fx-spacing</code>) to keep spacing in the stylesheet.`,
          `VBox form = new VBox(12);
form.setPadding(new Insets(16, 24, 16, 24));
form.setAlignment(Pos.TOP_CENTER);
VBox.setMargin(saveButton, new Insets(16, 0, 0, 0));
// equivalent CSS: .form { -fx-padding: 16 24; -fx-spacing: 12; -fx-alignment: top-center; }`,
        ),
      ],
      [
        ['HBox vs VBox vs StackPane?', 'HBox lays out children in a row, VBox in a column, StackPane layers children on top of each other.'],
        ['What is BorderPane good for?', 'The classic application shell with top, left, right, bottom and a centre region that takes the remaining space.'],
        ['Padding vs margin?', 'Padding is space inside a container around all its children; margin is space around a single child, set through the parent pane.'],
      ],
    ),
    topic(
      'fx-layout-grid-anchor-responsive',
      'GridPane, AnchorPane, Layout Constraints and Responsive Layouts',
      [
        blk(`<h3>GridPane</h3>
• <code>GridPane</code> arranges children in rows and columns: <code>add(node, col, row, colSpan, rowSpan)</code>, <code>hgap/vgap</code>, and per-column/row <b>constraints</b>: <code>ColumnConstraints</code> (<code>percentWidth</code>, <code>hgrow</code>, <code>minWidth/prefWidth/maxWidth</code>) and <code>RowConstraints</code>. Ideal for <b>forms</b> (labels left, fields right).`,
          `GridPane form = new GridPane();
form.setHgap(10); form.setVgap(10); form.setPadding(new Insets(16));

ColumnConstraints labels = new ColumnConstraints(); labels.setHalignment(HPos.RIGHT);
ColumnConstraints fields = new ColumnConstraints(); fields.setHgrow(Priority.ALWAYS); fields.setFillWidth(true);
form.getColumnConstraints().addAll(labels, fields);

form.add(new Label("Title"), 0, 0);       form.add(titleField, 1, 0);
form.add(new Label("Level"), 0, 1);       form.add(levelCombo, 1, 1);
form.add(new Label("Description"), 0, 2); form.add(descriptionArea, 1, 2);
form.add(new HBox(8, cancelButton, saveButton), 1, 3);          // buttons in the field column
GridPane.setColumnSpan(banner, 2);`,
        ),
      ],
      [
        blk(`<h3>AnchorPane and constraints</h3>
• <code>AnchorPane</code> anchors children to edges with distances (<code>setTopAnchor</code>, <code>setLeftAnchor</code> ...); anchoring two opposite edges stretches the child: good for <b>FXML designs from Scene Builder</b> and for pinning toolbars/status bars. Prefer container panes for new layouts; use <code>AnchorPane</code> for an overlay or when drawing precisely. <b>Layout constraints</b> (static setters: <code>GridPane.setConstraints</code>, <code>HBox.setHgrow</code>, <code>BorderPane.setAlignment</code>, <code>VBox.setMargin</code>) are stored in the child's properties and read by the parent.`,
          `AnchorPane page = new AnchorPane(content, statusBar);
AnchorPane.setTopAnchor(content, 0.0); AnchorPane.setLeftAnchor(content, 0.0); AnchorPane.setRightAnchor(content, 0.0); AnchorPane.setBottomAnchor(content, 28.0);
AnchorPane.setBottomAnchor(statusBar, 0.0); AnchorPane.setLeftAnchor(statusBar, 0.0); AnchorPane.setRightAnchor(statusBar, 0.0);

button.setMaxWidth(Double.MAX_VALUE);                           // allow a button to fill its column
GridPane.setHgrow(button, Priority.ALWAYS);
GridPane.setFillWidth(button, true);`,
        ),
      ],
      [
        blk(`<h3>Responsive layouts</h3>
• Make the UI adapt to window size: use <b>grow priorities</b> instead of fixed sizes; wrap content with <code>FlowPane</code>/<code>TilePane</code>; bind sizes to the scene (<code>pane.prefWidthProperty().bind(scene.widthProperty().multiply(0.3))</code>); <b>switch layouts by width</b> with a listener (<code>scene.widthProperty()</code> → show/hide the sidebar, change a <code>GridPane</code> column count, toggle a style class like <code>compact</code>); use <code>SplitPane</code> for user-resizable areas and <code>ScrollPane</code> (<code>fitToWidth</code>) for overflow; set <b>minimum stage size</b>. Test with different DPI scaling and fonts.`,
          `scene.widthProperty().addListener((obs, old, w) -> {
    boolean compact = w.doubleValue() < 700;
    sidebar.setVisible(!compact); sidebar.setManaged(!compact);                 // managed=false: take no layout space
    root.getStyleClass().removeAll("compact", "wide");
    root.getStyleClass().add(compact ? "compact" : "wide");
});

SplitPane split = new SplitPane(navigation, content);
split.setDividerPositions(0.25);
SplitPane.setResizableWithParent(navigation, false);

ScrollPane scroll = new ScrollPane(longForm);
scroll.setFitToWidth(true);`,
        ),
      ],
      [
        ['Why use GridPane for forms?', 'Rows and columns keep labels and fields aligned, and column constraints let the field column grow while the label column stays compact.'],
        ['What does setManaged(false) do?', 'The node is ignored by its parent\'s layout (takes no space), usually combined with setVisible(false) to hide it completely.'],
        ['How do you make a layout responsive?', 'Use grow priorities and wrapping panes, bind sizes to the scene, switch layouts or style classes from width listeners and set sensible minimum sizes.'],
      ],
    ),
  ]),

  fx(4, 'Event Handling', 'Essential', [
    topic(
      'fx-events-basics',
      'Event Handling Fundamentals: Handlers, Lambdas, Action, Mouse and Keyboard Events',
      [
        blk(`<h3>The event model</h3>
• An <b><code>Event</code></b> has a <b>source</b>, a <b>target</b> (the node it happened to), a <b>type</b> (<code>MouseEvent.MOUSE_CLICKED</code>, <code>KeyEvent.KEY_PRESSED</code>, <code>ActionEvent.ACTION</code> ...) and can be <b>consumed</b>. Register <code>EventHandler&lt;T&gt;</code> with <code>setOnXxx(...)</code> (one handler per property: <code>setOnAction</code>, <code>setOnMouseClicked</code>) or <code>addEventHandler(type, handler)</code> (several). Handlers are <b>functional interfaces</b>, so use <b>lambdas or method references</b>.`,
          `Button save = new Button("Save");
save.setOnAction(event -> System.out.println("clicked: " + event.getSource()));        // lambda

save.addEventHandler(ActionEvent.ACTION, this::onSave);                                 // method reference
private void onSave(ActionEvent e) { service.save(form.toCourse()); }

// anonymous class (older style)
save.setOnAction(new EventHandler<ActionEvent>() { @Override public void handle(ActionEvent e) { } });

TextField search = new TextField();
search.setOnAction(e -> runSearch(search.getText()));                 // Enter key in a TextField fires ActionEvent`,
        ),
      ],
      [
        blk(`<h3>Mouse and keyboard events</h3>
• <b>Mouse</b>: <code>MOUSE_PRESSED/RELEASED/CLICKED</code> (<code>getClickCount()</code>, <code>getButton()</code>), <code>MOUSE_MOVED/DRAGGED</code>, <code>MOUSE_ENTERED/EXITED</code> (hover), <code>getX()/getSceneX()/getScreenX()</code> coordinates, <code>ScrollEvent</code>, <code>ContextMenuEvent</code>. <b>Keyboard</b>: <code>KEY_PRESSED/RELEASED</code> (<code>getCode()</code> → <code>KeyCode</code>, modifiers <code>isControlDown()</code>, <code>isShortcutDown()</code>) and <code>KEY_TYPED</code> (<code>getCharacter()</code>). The node must be <b>focused</b> to receive key events: install shortcuts on the <b><code>Scene</code></b> or with <code>scene.getAccelerators()</code>.`,
          `row.setOnMouseClicked(e -> {
    if (e.getButton() == MouseButton.PRIMARY && e.getClickCount() == 2) open(row.getItem());       // double click
    else if (e.getButton() == MouseButton.SECONDARY) contextMenu.show(row, e.getScreenX(), e.getScreenY());
});
card.setOnMouseEntered(e -> card.setStyle("-fx-background-color: #eef;"));
card.setOnMouseExited(e -> card.setStyle(""));

scene.setOnKeyPressed(e -> {
    if (e.isShortcutDown() && e.getCode() == KeyCode.S) { save(); e.consume(); }
    if (e.getCode() == KeyCode.ESCAPE) closeDialog();
});
scene.getAccelerators().put(new KeyCodeCombination(KeyCode.N, KeyCombination.SHORTCUT_DOWN), this::newCourse);

numberField.addEventFilter(KeyEvent.KEY_TYPED, e -> { if (!e.getCharacter().matches("\\\\d")) e.consume(); });   // only digits`,
        ),
      ],
      [
        blk(`<h3>Handling best practices</h3>
• Keep handlers <b>short</b>: delegate to controller/service methods; <b>never block</b> the Application Thread inside a handler (network, database, sleep) - start a <code>Task</code> instead; <b>remove listeners/handlers</b> from long-lived sources to avoid leaks; use <b>weak listeners</b> (<code>WeakEventHandler</code>, <code>WeakChangeListener</code>) when needed; prefer <b>binding</b> to wiring events that copy values; centralise shortcuts.`,
          `// BAD: freezes the UI for seconds
button.setOnAction(e -> repo.importAll(file));
// GOOD: run in the background, update UI via Task callbacks
button.setOnAction(e -> {
    Task<Integer> task = new Task<>() { @Override protected Integer call() { return repo.importAll(file); } };
    task.setOnSucceeded(ev -> status.setText("imported " + task.getValue()));
    new Thread(task, "import").start();
});`,
        ),
      ],
      [
        ['setOnAction vs addEventHandler?', 'setOnXxx holds a single convenience handler per event property; addEventHandler registers any number of handlers for an event type.'],
        ['Why do key events sometimes not arrive?', 'Key events go to the focused node; if nothing relevant is focused register the handler on the Scene (or use accelerators).'],
        ['Why shouldn\'t a handler perform a long operation?', 'Handlers run on the JavaFX Application Thread; blocking it freezes the whole UI, so use a background Task.'],
      ],
    ),
    topic(
      'fx-events-propagation-custom',
      'Event Filters, Bubbling, Capturing and Custom Events',
      [
        blk(`<h3>Event delivery: capturing then bubbling</h3>
• When an event occurs, JavaFX builds the <b>event dispatch chain</b> from the <b>Stage down to the target node</b> (root → ... → target). Delivery has two phases: <b>capturing</b> (event travels from the root <b>down</b> to the target; <b>event filters</b> run) then <b>bubbling</b> (back <b>up</b> from the target to the root; <b>event handlers</b> run). Calling <code>event.consume()</code> stops further propagation. This lets a parent intercept (filter) or react to (handler) events of its children.`,
          `VBox root = new VBox(new Button("OK"));
root.addEventFilter(MouseEvent.MOUSE_CLICKED, e -> System.out.println("1. filter on root (capturing, going down)"));
root.addEventHandler(MouseEvent.MOUSE_CLICKED, e -> System.out.println("4. handler on root (bubbling, going up)"));
Button ok = (Button) root.getChildren().get(0);
ok.addEventFilter(MouseEvent.MOUSE_CLICKED, e -> System.out.println("2. filter on button"));
ok.addEventHandler(MouseEvent.MOUSE_CLICKED, e -> System.out.println("3. handler on button"));
// output order: 1, 2, 3, 4`,
        ),
      ],
      [
        blk(`<h3>Filters vs handlers, consuming events</h3>
<table ${TABLE}>
<tr><th></th><th>Event filter</th><th>Event handler</th></tr>
<tr><td>Phase</td><td>Capturing (parent before child)</td><td>Bubbling (child before parent)</td></tr>
<tr><td>Register</td><td><code>addEventFilter(type, h)</code></td><td><code>addEventHandler(type, h)</code> / <code>setOnXxx</code></td></tr>
<tr><td>Typical use</td><td>Intercept/block events before the target sees them (disable input while loading, restrict characters)</td><td>React to events, optionally centralising child events at a parent</td></tr>
<tr><td>Consume</td><td>Child never receives the event</td><td>Parents above do not receive it</td></tr>
</table>`,
          `// block all mouse input while a long operation runs
Node glass = rootPane;
EventHandler<InputEvent> blocker = Event::consume;
glass.addEventFilter(InputEvent.ANY, blocker);
// ... later
glass.removeEventFilter(InputEvent.ANY, blocker);

// one handler for many buttons (event delegation)
buttonBar.addEventHandler(ActionEvent.ACTION, e -> {
    Button b = (Button) e.getTarget();
    System.out.println("pressed " + b.getText());
});`,
        ),
      ],
      [
        blk(`<h3>Custom events</h3>
• Subclass <code>Event</code>, define an <code>EventType</code> (child of <code>Event.ANY</code>), then <code>node.fireEvent(new CourseSelectedEvent(course))</code> and listen with <code>addEventHandler</code>. Good for <b>custom controls</b> that expose their own events and for decoupling controllers; for application-wide messaging prefer an <b>event bus</b> or shared model/properties. Cast carefully: handlers receive the specific event type.`,
          `public class CourseSelectedEvent extends Event {
    public static final EventType<CourseSelectedEvent> COURSE_SELECTED = new EventType<>(Event.ANY, "COURSE_SELECTED");
    private final Course course;
    public CourseSelectedEvent(Course course) { super(COURSE_SELECTED); this.course = course; }
    public Course getCourse() { return course; }
}

// in a custom control
courseList.setOnMouseClicked(e -> fireEvent(new CourseSelectedEvent(courseList.getSelectionModel().getSelectedItem())));
public final void setOnCourseSelected(EventHandler<CourseSelectedEvent> h) { addEventHandler(CourseSelectedEvent.COURSE_SELECTED, h); }

// user of the control
catalogue.setOnCourseSelected(e -> detail.show(e.getCourse()));`,
        ),
      ],
      [
        ['Explain event capturing and bubbling in JavaFX.', 'Events travel down the dispatch chain from the stage to the target during capturing (filters run) and back up during bubbling (handlers run); consume() stops propagation.'],
        ['Event filter vs event handler?', 'Filters run during capturing and can intercept events before the target sees them; handlers run during bubbling for reacting to events.'],
        ['How do you define a custom event?', 'Extend Event with a static EventType, fire it with node.fireEvent and register handlers with addEventHandler for that type.'],
      ],
    ),
  ]),

  fx(5, 'JavaFX Properties and Binding', 'Essential', [
    topic(
      'fx-properties-observable',
      'JavaFX Properties, Observable Values and Property Types',
      [
        blk(`<h3>Why properties?</h3>
• A JavaFX <b>property</b> is an <b>observable wrapper</b> of a value: it notifies listeners when the value changes and can be <b>bound</b> to other properties. Almost every UI attribute is a property (<code>textProperty</code>, <code>selectedProperty</code>, <code>widthProperty</code>, <code>disableProperty</code>). Domain models can expose properties so tables and forms update automatically. Naming convention: <code>getX()</code>/<code>setX()</code> + <code>xProperty()</code>.<br>
• <b>Hierarchy</b>: <code>Observable</code> (invalidation) → <code>ObservableValue&lt;T&gt;</code> (<code>getValue</code>, change listeners) → <code>ReadOnlyProperty</code> → <code>Property&lt;T&gt;</code> (<code>bind</code>, <code>setValue</code>, <code>bindBidirectional</code>) → implementations <code>SimpleStringProperty</code>, <code>SimpleIntegerProperty</code>, <code>SimpleDoubleProperty</code>, <code>SimpleBooleanProperty</code>, <code>SimpleObjectProperty&lt;T&gt;</code>, <code>SimpleListProperty</code>, <code>SimpleMapProperty</code>, plus <code>ReadOnlyXxxWrapper</code> for read-only exposure.`,
          `StringProperty name = new SimpleStringProperty("Spring Core");
IntegerProperty lessons = new SimpleIntegerProperty(12);
BooleanProperty published = new SimpleBooleanProperty(false);
ObjectProperty<Level> level = new SimpleObjectProperty<>(Level.BEGINNER);

name.set("Spring Core 6");                         // setValue
System.out.println(name.get() + " " + lessons.get() + " " + published.get());

name.addListener((obs, oldValue, newValue) -> System.out.println(oldValue + " -> " + newValue));
name.set("Spring Framework");                      // prints: Spring Core 6 -> Spring Framework`,
        ),
      ],
      [
        blk(`<h3>A property-based model class</h3>
• Expose the property accessor, and also plain getter/setter for convenience and for frameworks. Keep <b>the model free of UI types</b>. For tables you need <code>xProperty()</code> methods (or <code>PropertyValueFactory</code> reflection via getters).`,
          `public class CourseModel {
    private final StringProperty title = new SimpleStringProperty(this, "title", "");
    private final IntegerProperty lessons = new SimpleIntegerProperty(this, "lessons", 0);
    private final ReadOnlyBooleanWrapper complete = new ReadOnlyBooleanWrapper(this, "complete", false);

    public String getTitle() { return title.get(); }
    public void setTitle(String v) { title.set(v); }
    public StringProperty titleProperty() { return title; }

    public int getLessons() { return lessons.get(); }
    public void setLessons(int v) { lessons.set(v); }
    public IntegerProperty lessonsProperty() { return lessons; }

    public boolean isComplete() { return complete.get(); }
    public ReadOnlyBooleanProperty completeProperty() { return complete.getReadOnlyProperty(); }       // read-only to callers

    public CourseModel() { complete.bind(lessons.greaterThanOrEqualTo(10)); }
}`,
        ),
      ],
      [
        blk(`<h3>ObservableList, ObservableMap and extractors</h3>
• <code>FXCollections.observableArrayList()</code> returns an <b><code>ObservableList</code></b> that notifies <code>ListChangeListener</code>s about additions, removals, replacements, permutations and updates (<code>change.next()</code> loop). <code>ObservableMap</code>/<code>ObservableSet</code> exist too. <b>Extractors</b> make the list fire <b>update</b> events when a property of an element changes (needed for filtered/sorted lists reacting to property changes). <code>FilteredList</code> and <code>SortedList</code> are views over a source list.`,
          `ObservableList<CourseModel> courses = FXCollections.observableArrayList(c -> new Observable[] { c.titleProperty(), c.lessonsProperty() });   // extractor
courses.addListener((ListChangeListener<CourseModel>) change -> {
    while (change.next()) {
        if (change.wasAdded())   System.out.println("added " + change.getAddedSubList());
        if (change.wasRemoved()) System.out.println("removed " + change.getRemoved());
        if (change.wasUpdated()) System.out.println("updated " + change.getFrom() + ".." + change.getTo());
    }
});
courses.add(new CourseModel());
courses.get(0).setTitle("Renamed");                          // fires an update thanks to the extractor

FilteredList<CourseModel> published = new FilteredList<>(courses, CourseModel::isComplete);
SortedList<CourseModel> sorted = new SortedList<>(published, Comparator.comparing(CourseModel::getTitle));`,
        ),
      ],
      [
        ['What is a JavaFX property?', 'An observable wrapper around a value that notifies listeners on change and supports binding; UI attributes and model fields are exposed as properties.'],
        ['What is an extractor in an ObservableList?', 'A function returning the Observables of an element whose changes should trigger update events of the list, so FilteredList/SortedList and cells react to property changes.'],
        ['Why use ReadOnlyBooleanWrapper?', 'It lets the class modify the value internally while exposing only a read-only property to clients.'],
      ],
    ),
    topic(
      'fx-binding-listeners',
      'Property Binding: Unidirectional, Bidirectional, Bindings API, Change and Invalidation Listeners',
      [
        blk(`<h3>Unidirectional and bidirectional binding</h3>
• <b>Unidirectional</b> <code>target.bind(source)</code>: the target always follows the source and <b>cannot be set manually</b> while bound (<code>RuntimeException</code>); <code>unbind()</code> releases it. <b>Bidirectional</b> <code>a.bindBidirectional(b)</code>: both stay in sync (form fields ↔ model). Types must match, or convert with <code>bindBidirectional(stringProp, numberProp, new NumberStringConverter())</code>.`,
          `TextField titleField = new TextField();
Label preview = new Label();
preview.textProperty().bind(titleField.textProperty());                          // one-way: label follows the text field
preview.textProperty().bind(Bindings.concat("Title: ", titleField.textProperty()));

CourseModel model = new CourseModel();
titleField.textProperty().bindBidirectional(model.titleProperty());              // field <-> model

Spinner<Integer> spinner = new Spinner<>(0, 100, 5);
TextField lessonsField = new TextField();
lessonsField.textProperty().bindBidirectional(model.lessonsProperty(), new NumberStringConverter());

// release when leaving the screen to avoid leaks
titleField.textProperty().unbindBidirectional(model.titleProperty());`,
        ),
      ],
      [
        blk(`<h3>High-level and low-level Bindings API</h3>
• <b>Fluent API</b> on properties: <code>text.length().greaterThan(3)</code>, <code>a.add(b)</code>, <code>price.multiply(quantity)</code>, <code>name.isEmpty()</code>, <code>flag.and(other).not()</code>, <code>when(cond).then(x).otherwise(y)</code>. <b><code>Bindings</code> utility</b>: <code>Bindings.format("%.2f", total)</code>, <code>Bindings.concat</code>, <code>Bindings.when</code>, <code>Bindings.createStringBinding(Callable, dependencies...)</code> for <b>custom computed values</b>, <code>Bindings.size(list)</code>, <code>Bindings.isEmpty(list)</code>, <code>Bindings.selectString</code> for nested paths. Bindings are <b>lazy</b>: recomputed when read after being invalidated.`,
          `DoubleProperty price = new SimpleDoubleProperty(499);
IntegerProperty qty = new SimpleIntegerProperty(2);
DoubleBinding total = price.multiply(qty).multiply(1.18);                         // +18% tax
Label totalLabel = new Label();
totalLabel.textProperty().bind(Bindings.format("Total: ₹%.2f", total));

Label status = new Label();
status.textProperty().bind(Bindings.when(courses.emptyProperty()).then("No courses yet").otherwise(Bindings.size(courses).asString("%d courses")));

StringBinding fullName = Bindings.createStringBinding(() -> first.get().trim() + " " + last.get().trim(), first, last);

okButton.disableProperty().bind(titleField.textProperty().isEmpty().or(levelCombo.valueProperty().isNull()));`,
        ),
      ],
      [
        blk(`<h3>Change listeners vs invalidation listeners</h3>
<table ${TABLE}>
<tr><th></th><th><code>ChangeListener</code></th><th><code>InvalidationListener</code></th></tr>
<tr><td>Signature</td><td><code>changed(observable, oldValue, newValue)</code></td><td><code>invalidated(observable)</code></td></tr>
<tr><td>Fires</td><td>When the value actually changes</td><td>When the value becomes invalid (may not have changed; lazy, only once until re-read)</td></tr>
<tr><td>Evaluation</td><td>Forces the new value to be computed (eager)</td><td>Does not compute (lazy)</td></tr>
<tr><td>Use</td><td>React with old/new values</td><td>Cheap "something changed" signal (redraw)</td></tr>
</table>
• <b>Memory leaks</b>: a listener on a long-lived property (a model, a service) keeps the listener's owner (a controller, a node) reachable. Remove listeners when the view closes, or use <code>WeakChangeListener</code>/<code>WeakInvalidationListener</code> (keep a strong reference to the real listener yourself). Bindings hold only weak references from the source side, so <code>bind</code> is leak-safe but <code>addListener</code> is not.`,
          `ChangeListener<String> listener = (obs, old, now) -> validate(now);
titleField.textProperty().addListener(listener);
// when the view is disposed:
titleField.textProperty().removeListener(listener);

// weak listener: the property will not keep the controller alive
ChangeListener<String> strong = (obs, old, now) -> controller.onTitle(now);
model.titleProperty().addListener(new WeakChangeListener<>(strong));          // 'strong' must be stored in a field

InvalidationListener redraw = obs -> canvasDirty = true;
zoom.addListener(redraw);

// debounce search-as-you-type
PauseTransition pause = new PauseTransition(Duration.millis(300));
searchField.textProperty().addListener((o, a, text) -> { pause.setOnFinished(e -> search(text)); pause.playFromStart(); });`,
        ),
      ],
      [
        ['Unidirectional vs bidirectional binding?', 'Unidirectional makes the target follow the source and prevents manual setting; bidirectional keeps two properties synchronised in both directions, ideal for form fields and model properties.'],
        ['ChangeListener vs InvalidationListener?', 'A ChangeListener receives old and new values when the value changes and forces evaluation; an InvalidationListener only signals invalidation and is lazy and cheaper.'],
        ['How can property listeners cause memory leaks?', 'A listener registered on a long-lived property keeps its owner reachable; remove listeners when the view is disposed or use weak listeners.'],
      ],
    ),
  ]),
];
