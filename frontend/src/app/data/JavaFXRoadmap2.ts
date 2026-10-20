// JavaFX roadmap, part 2: sections 6-10 (FXML and Scene Builder, CSS, TableView, navigation and windows, concurrency).
// Examples use JavaFX 21 and Java 21.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const fx = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('fx', n, title, priority, topics);

export const javaFxRoadmap2: SubTopic[] = [
  fx(6, 'FXML and Scene Builder', 'Core', [
    topic(
      'fx-fxml-basics',
      'Introduction to FXML, Syntax, FXMLLoader and Controllers',
      [
        blk(`<h3>What is FXML?</h3>
• <b>FXML</b> is an XML-based markup language for describing the JavaFX scene graph declaratively. It separates <b>view</b> (layout and controls: <code>.fxml</code>) from <b>logic</b> (controller class). Benefits: readable structure, designer tooling (Scene Builder), easier collaboration, less boilerplate. Elements are JavaFX classes (imported with <code>&lt;?import ...?&gt;</code>), attributes are properties, nested elements are children or property values.`,
          `<?xml version="1.0" encoding="UTF-8"?>
<?import javafx.geometry.Insets?>
<?import javafx.scene.control.*?>
<?import javafx.scene.layout.*?>

<VBox xmlns="http://javafx.com/javafx" xmlns:fx="http://javafx.com/fxml"
      fx:controller="com.javaschoollab.tracker.ui.CourseFormController" spacing="12" prefWidth="420">
    <padding><Insets top="16" right="16" bottom="16" left="16"/></padding>
    <Label text="New course" styleClass="title"/>
    <TextField fx:id="titleField" promptText="Course title"/>
    <ComboBox fx:id="levelCombo" promptText="Level" maxWidth="Infinity"/>
    <HBox spacing="8" alignment="CENTER_RIGHT">
        <Button text="Cancel" onAction="#onCancel" cancelButton="true"/>
        <Button fx:id="saveButton" text="Save" onAction="#onSave" defaultButton="true"/>
    </HBox>
</VBox>`,
        ),
      ],
      [
        blk(`<h3>Controllers, fx:id, @FXML and onAction</h3>
• <code>fx:controller</code> names the controller class; the loader instantiates it (public no-arg constructor) and <b>injects</b> nodes whose <code>fx:id</code> matches a field annotated <code>@FXML</code> (private is fine with <code>@FXML</code>; needs <code>opens ... to javafx.fxml</code> in a module). Event attributes <code>onAction="#handler"</code> call a method (annotated <code>@FXML</code> if non-public) taking the event or nothing. <b><code>initialize()</code></b> (no-arg, <code>@FXML</code>) is called <b>after injection</b>: wire bindings, items and listeners there; the constructor runs <b>before</b> injection (fields are still <code>null</code>). The <code>Initializable</code> interface (<code>initialize(URL, ResourceBundle)</code>) is the older alternative.`,
          `public class CourseFormController {
    @FXML private TextField titleField;
    @FXML private ComboBox<Level> levelCombo;
    @FXML private Button saveButton;

    private final CourseService service = new CourseService();           // constructor: fields above are still null

    @FXML
    private void initialize() {                                          // after injection
        levelCombo.getItems().setAll(Level.values());
        saveButton.disableProperty().bind(titleField.textProperty().isEmpty().or(levelCombo.valueProperty().isNull()));
    }

    @FXML private void onSave(ActionEvent event) {
        service.create(titleField.getText().trim(), levelCombo.getValue());
        close(event);
    }
    @FXML private void onCancel(ActionEvent event) { close(event); }
    private void close(ActionEvent e) { ((Node) e.getSource()).getScene().getWindow().hide(); }
}`,
        ),
      ],
      [
        blk(`<h3>FXMLLoader</h3>
• <code>new FXMLLoader(url)</code> then <code>load()</code> returns the root node and creates the controller (<code>getController()</code> afterwards). A loader instance <b>loads once</b>: create a new loader per load. Options: <code>setController(obj)</code> (when the FXML has no <code>fx:controller</code>), <code>setControllerFactory(cls -> ...)</code> (create controllers with dependencies: constructor injection, Spring), <code>setResources(ResourceBundle)</code> for i18n (<code>%key</code> in FXML), <code>setRoot</code> + <code>setController(this)</code> for <b>custom components</b> (<code>fx:root</code>). Always use <code>getResource</code> paths; a <code>null</code> URL gives <code>LoadException: Location is not set</code>.`,
          `FXMLLoader loader = new FXMLLoader(getClass().getResource("/com/javaschoollab/tracker/view/course-form.fxml"));
Parent root = loader.load();
CourseFormController controller = loader.getController();
controller.setCourse(existingCourse);                                   // pass data after load

// controller factory: inject dependencies
FXMLLoader l2 = new FXMLLoader(getClass().getResource("course-list.fxml"));
l2.setControllerFactory(type -> type == CourseListController.class ? new CourseListController(courseService) : fallback(type));

// i18n: <Label text="%course.title"/> with messages.properties
l2.setResources(ResourceBundle.getBundle("messages", Locale.getDefault()));

Stage stage = new Stage(); stage.setScene(new Scene(root)); stage.show();`,
        ),
      ],
      [
        ['When is initialize() called?', 'After the FXML has been loaded and @FXML fields injected, so UI setup that needs the nodes belongs there rather than in the constructor.'],
        ['Why is my @FXML field null?', 'The fx:id does not match the field name, the field lacks @FXML, the controller was not created by FXMLLoader (created with new), or you access it in the constructor before injection.'],
        ['How can FXML controllers receive dependencies?', 'Use a controller factory on the FXMLLoader (constructor injection or Spring), or pass data through setters after load.'],
      ],
    ),
    topic(
      'fx-fxml-scenebuilder-components',
      'Scene Builder, Controller Communication and Reusable FXML Components',
      [
        blk(`<h3>Scene Builder</h3>
• <b>Scene Builder</b> (Gluon) is a visual drag-and-drop editor for FXML: palette of controls, hierarchy panel, inspector for properties/layout/code (<code>fx:id</code>, event handlers, controller class), CSS preview. Typical workflow: design the layout in Scene Builder, set the controller class and <code>fx:id</code>s, then use <b>View → Show Sample Controller Skeleton</b> to generate the <code>@FXML</code> fields and handlers. Integrate with IntelliJ/Eclipse ("Open in Scene Builder"). Keep FXML files small (one screen or component per file) and avoid logic in FXML (expression bindings only for simple things).`,
          `<!-- FXML expression binding and references -->
<Label text="${'$'}{titleField.text}"/>                                  <!-- one-way binding to another node's property -->
<fx:define><Insets fx:id="pad" top="8" right="8" bottom="8" left="8"/></fx:define>
<VBox padding="${'$'}{pad}"/>
<fx:include source="toolbar.fxml" fx:id="toolbar"/>                    <!-- include another FXML; controller injected as toolbarController -->`,
        ),
      ],
      [
        blk(`<h3>Controller communication</h3>
• Options: (1) <b>Parent holds child controller</b>: with <code>&lt;fx:include fx:id="toolbar"&gt;</code> a field <code>@FXML private ToolbarController toolbarController;</code> is injected (name = <code>fx:id</code> + <code>Controller</code>). (2) <b>Pass data via setters/methods</b> after <code>load()</code> using <code>getController()</code>. (3) <b>Shared model/services</b> (observable properties in a model both controllers bind to): best for decoupling. (4) <b>Callbacks</b> (<code>Consumer&lt;Course&gt;</code> passed to the child). (5) <b>Event bus</b> (custom events, a simple pub/sub, or an app-level event bus). Avoid static references between controllers.`,
          `// (3) shared model
public class AppState {
    private final ObjectProperty<Course> selected = new SimpleObjectProperty<>();
    private final ObservableList<Course> courses = FXCollections.observableArrayList();
    public ObjectProperty<Course> selectedProperty() { return selected; }
    public ObservableList<Course> getCourses() { return courses; }
}
// list controller
@FXML void initialize() { listView.setItems(state.getCourses()); listView.getSelectionModel().selectedItemProperty().addListener((o, a, c) -> state.selectedProperty().set(c)); }
// detail controller: reacts without knowing the list controller
@FXML void initialize() { state.selectedProperty().addListener((o, a, c) -> showDetail(c)); }

// (4) callback
public class CourseFormController { private Consumer<Course> onSaved = c -> {}; public void setOnSaved(Consumer<Course> cb) { this.onSaved = cb; } }
loader.<CourseFormController>getController().setOnSaved(listController::add);`,
        ),
      ],
      [
        blk(`<h3>Reusable FXML components (fx:root)</h3>
• A <b>custom component</b> that is both a control and its own controller: FXML root <code>&lt;fx:root type="VBox"&gt;</code>; the Java class <code>extends VBox</code> and in its constructor loads the FXML with <code>setRoot(this)</code> and <code>setController(this)</code>. The component can then be used in other FXML files as <code>&lt;CourseCard course="..."/&gt;</code> and by code. Add public properties (<code>courseProperty()</code>) and custom events for a clean API.`,
          `<!-- course-card.fxml -->
<?import javafx.scene.control.*?><?import javafx.scene.layout.*?>
<fx:root type="VBox" xmlns="http://javafx.com/javafx" xmlns:fx="http://javafx.com/fxml" spacing="4" styleClass="card">
    <Label fx:id="title" styleClass="card-title"/>
    <Label fx:id="meta" styleClass="muted"/>
    <Button text="Open" onAction="#open"/>
</fx:root>

public class CourseCard extends VBox {
    @FXML private Label title; @FXML private Label meta;
    private final ObjectProperty<Course> course = new SimpleObjectProperty<>();

    public CourseCard() {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("course-card.fxml"));
        loader.setRoot(this); loader.setController(this);
        try { loader.load(); } catch (IOException e) { throw new UncheckedIOException(e); }
        course.addListener((o, a, c) -> { title.setText(c.title()); meta.setText(c.lessons() + " lessons"); });
    }
    public ObjectProperty<Course> courseProperty() { return course; }
    @FXML private void open() { fireEvent(new CourseSelectedEvent(course.get())); }
}
// usage in code: new CourseCard() ; in FXML: <CourseCard fx:id="card"/>`,
        ),
      ],
      [
        ['How do two FXML controllers communicate?', 'Through shared model objects with observable properties, parent-child controller references from fx:include, callbacks or an event bus; avoid static references.'],
        ['What is fx:root used for?', 'Building reusable custom components where the Java class is both the root node and the controller of its FXML.'],
        ['What does Scene Builder generate for you?', 'A visual editor produces the FXML and a sample controller skeleton with @FXML fields and handler stubs matching the fx:id values and onAction attributes.'],
      ],
    ),
  ]),

  fx(7, 'CSS and Styling', 'Core', [
    topic(
      'fx-css-basics',
      'JavaFX CSS: Inline vs External, Selectors, Style Classes, IDs and Pseudo-Classes',
      [
        blk(`<h3>JavaFX CSS</h3>
• JavaFX has its own CSS dialect: properties are prefixed <b><code>-fx-</code></b> (<code>-fx-background-color</code>, <code>-fx-text-fill</code>, <code>-fx-font-size</code>, <code>-fx-padding</code>, <code>-fx-border-radius</code>, <code>-fx-effect: dropshadow(...)</code>). The <b>default type selector</b> is the node's <b>style class</b> (<code>.button</code>, <code>.label</code>, <code>.text-field</code>), not its Java class name. <b>Inline style</b>: <code>node.setStyle("-fx-text-fill: red;")</code> (highest priority; hard to maintain). <b>External stylesheet</b>: <code>scene.getStylesheets().add(url)</code> or FXML <code>stylesheets="@app.css"</code>.`,
          `/* app.css */
.root {
    -fx-font-family: "Inter", "Segoe UI", sans-serif;
    -fx-font-size: 14px;
    -fx-base: #f4f6fa;
    -fx-accent: #3b82f6;
}
.title { -fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #1f2937; }
.button { -fx-background-color: #3b82f6; -fx-text-fill: white; -fx-background-radius: 6; -fx-padding: 8 16; -fx-cursor: hand; }
.button:hover { -fx-background-color: #2563eb; }
.button:pressed { -fx-background-color: #1d4ed8; }
.button:disabled { -fx-opacity: 0.5; }
.text-field:focused { -fx-border-color: #3b82f6; -fx-border-radius: 4; }`,
        ),
      ],
      [
        blk(`<h3>Selectors, style classes, IDs and pseudo-classes</h3>
<table ${TABLE}>
<tr><th>Selector</th><th>Example</th><th>Meaning</th></tr>
<tr><td>Style class</td><td><code>.card</code></td><td>Nodes with <code>getStyleClass().add("card")</code></td></tr>
<tr><td>ID</td><td><code>#saveButton</code></td><td>Node with <code>setId("saveButton")</code> or FXML <code>id</code></td></tr>
<tr><td>Descendant</td><td><code>.card .label</code></td><td>Labels inside a card</td></tr>
<tr><td>Child</td><td><code>.toolbar &gt; .button</code></td><td>Direct children only</td></tr>
<tr><td>Pseudo-class</td><td><code>:hover</code>, <code>:focused</code>, <code>:selected</code>, <code>:disabled</code>, <code>:pressed</code>, <code>:armed</code>, <code>:empty</code>, <code>:odd/:even</code> (cells)</td><td>State-based styling</td></tr>
<tr><td>Substructure</td><td><code>.combo-box .arrow-button</code>, <code>.table-view .column-header</code></td><td>Internal parts of a control (see the Modena CSS reference)</td></tr>
<tr><td>Multiple</td><td><code>.button.primary</code></td><td>Both classes</td></tr>
</table>
• <b>Custom pseudo-classes</b>: <code>node.pseudoClassStateChanged(PseudoClass.getPseudoClass("error"), true)</code> then <code>.text-field:error { ... }</code>: model UI state in code, style in CSS.`,
          `Button primary = new Button("Save");
primary.getStyleClass().addAll("primary");
saveCard.setId("saveCard");

PseudoClass ERROR = PseudoClass.getPseudoClass("error");
titleField.textProperty().addListener((o, a, text) -> titleField.pseudoClassStateChanged(ERROR, text.isBlank()));

/* css */
.text-field:error { -fx-border-color: #dc2626; -fx-background-color: #fef2f2; }
.button.primary { -fx-background-color: #16a34a; }
#saveCard { -fx-background-color: white; -fx-background-radius: 12; -fx-effect: dropshadow(gaussian, rgba(0,0,0,.15), 12, 0, 0, 2); }`,
        ),
      ],
      [
        blk(`<h3>Precedence, looked-up colours and debugging</h3>
• <b>Order of precedence</b> (low → high): the JavaFX default (user agent) stylesheet (Modena) < <code>Application.setUserAgentStylesheet</code> < stylesheets of the Scene < stylesheets of parents (<code>Parent.getStylesheets()</code>) < inline styles. Within a stylesheet: specificity (ID > class > type), then later rules win. <b>Looked-up colours</b>: define <code>-fx-base</code>/<code>-fx-accent</code>/custom variables on <code>.root</code> and derive others with <code>derive(color, -20%)</code>, <code>ladder()</code>; change the whole theme by editing the root variables. Debug with <b>ScenicView</b> (inspect the scene graph, style classes, CSS) and <code>-Djavafx.pseudoClassOverrideEnabled</code>; check the log for <i>"CSS Error parsing"</i> warnings.`,
          `.root {
    -app-primary: #3b82f6;
    -app-surface: #ffffff;
    -fx-accent: -app-primary;
}
.card { -fx-background-color: -app-surface; -fx-border-color: derive(-app-surface, -15%); }
.button.primary { -fx-background-color: -app-primary; }
.button.primary:hover { -fx-background-color: derive(-app-primary, -15%); }`,
        ),
      ],
      [
        ['Inline vs external CSS?', 'Inline styles (setStyle) have the highest precedence and are for dynamic one-offs; external stylesheets keep styling reusable and maintainable and should be the default.'],
        ['How do you target a specific state, e.g. an invalid text field?', 'Define a custom pseudo-class, toggle it with pseudoClassStateChanged and style it with a :error selector in CSS.'],
        ['Which tool inspects JavaFX CSS at runtime?', 'ScenicView shows the scene graph, style classes, IDs and applied CSS of a running application.'],
      ],
    ),
    topic(
      'fx-css-themes-fonts-darkmode',
      'Themes, Custom Fonts, Backgrounds and Borders, Responsive Styling and Dark Mode',
      [
        blk(`<h3>Themes, backgrounds and borders</h3>
• <b>Built-in themes</b>: <code>Application.setUserAgentStylesheet(Application.STYLESHEET_MODENA)</code> (default) or <code>STYLESHEET_CASPIAN</code>; JavaFX 22+ adds <code>Platform.Preferences</code> colour scheme detection. Third-party themes: AtlantaFX, JMetro, BootstrapFX, MaterialFX. <b>Backgrounds</b>: <code>-fx-background-color</code> (multiple colours, <code>linear-gradient(...)</code>, <code>radial-gradient</code>), <code>-fx-background-image</code>, <code>-fx-background-radius</code>, <code>-fx-background-insets</code>. <b>Borders</b>: <code>-fx-border-color</code>, <code>-fx-border-width</code>, <code>-fx-border-radius</code>, <code>-fx-border-style</code>; effects: <code>-fx-effect: dropshadow(...)</code>. In Java: <code>Background</code>/<code>Border</code> objects.`,
          `.hero {
    -fx-background-color: linear-gradient(to bottom right, #667eea, #764ba2);
    -fx-background-radius: 16;
    -fx-padding: 24;
}
.outlined { -fx-border-color: #cbd5e1; -fx-border-width: 1; -fx-border-radius: 8; -fx-border-style: solid; }`,
          `Region box = new Region();
box.setBackground(new Background(new BackgroundFill(Color.web("#f8fafc"), new CornerRadii(8), Insets.EMPTY)));
box.setBorder(new Border(new BorderStroke(Color.GRAY, BorderStrokeStyle.SOLID, new CornerRadii(8), new BorderWidths(1))));

Application.setUserAgentStylesheet(new PrimerLight().getUserAgentStylesheet());      // AtlantaFX theme`,
        ),
      ],
      [
        blk(`<h3>Custom fonts</h3>
• Load a bundled font with <code>Font.loadFont(getClass().getResourceAsStream("/fonts/Inter-Regular.ttf"), 14)</code> <b>before</b> the scene is shown (the family name is then available in CSS), or declare it in CSS with <code>@font-face { src: url("fonts/Inter.ttf"); }</code>. Provide fallbacks (<code>-fx-font-family: "Inter", "Segoe UI", sans-serif</code>). Use icon fonts (Ikonli: FontAwesome, Material) for icons: <code>new FontIcon("fas-save")</code>. Mind font licences.`,
          `@Override public void start(Stage stage) {
    Font.loadFont(getClass().getResourceAsStream("/fonts/Inter-Regular.ttf"), 14);
    Font.loadFont(getClass().getResourceAsStream("/fonts/Inter-Bold.ttf"), 14);
    Scene scene = new Scene(root);
    scene.getStylesheets().add(getClass().getResource("/css/app.css").toExternalForm());   // .root { -fx-font-family: "Inter"; }
    ...
}
Button save = new Button("Save", new FontIcon("mdi2c-content-save"));                     // Ikonli icon`,
        ),
      ],
      [
        blk(`<h3>Responsive styling and dark mode</h3>
• <b>Dark mode</b>: keep colours as <b>variables on <code>.root</code></b> and switch by toggling a style class on the root or swapping the theme stylesheet at runtime. <b>Responsive styling</b>: toggle classes (<code>compact</code>, <code>wide</code>) from scene width listeners and write CSS per class; use relative units (<code>em</code>) and the root font size to scale text; honour HiDPI (JavaFX scales automatically; supply 2x images). Persist the user's theme choice in <code>Preferences</code>.`,
          `/* light.css */ .root { -app-bg: #ffffff; -app-fg: #111827; -app-card: #f3f4f6; }
/* dark.css  */ .root { -app-bg: #0f172a; -app-fg: #e5e7eb; -app-card: #1e293b; }
.root { -fx-background-color: -app-bg; -fx-text-fill: -app-fg; }
.card { -fx-background-color: -app-card; }
.label { -fx-text-fill: -app-fg; }
.root.compact { -fx-font-size: 12px; }`,
          `public void applyTheme(Scene scene, boolean dark) {
    scene.getStylesheets().removeIf(s -> s.endsWith("light.css") || s.endsWith("dark.css"));
    scene.getStylesheets().add(getClass().getResource(dark ? "/css/dark.css" : "/css/light.css").toExternalForm());
    Preferences.userNodeForPackage(App.class).putBoolean("dark", dark);
}
ToggleButton darkToggle = new ToggleButton("Dark");
darkToggle.selectedProperty().addListener((o, a, on) -> applyTheme(scene, on));
// JavaFX 22+: follow the OS colour scheme
boolean systemDark = Platform.getPreferences().getColorScheme() == ColorScheme.DARK;`,
        ),
      ],
      [
        ['How do you implement dark mode in JavaFX?', 'Define colours as variables on .root, provide light and dark stylesheets (or classes) and switch the scene stylesheet at runtime, remembering the choice in Preferences.'],
        ['How do you use a custom font?', 'Load it with Font.loadFont before showing the scene (or @font-face) and reference its family name in -fx-font-family with fallbacks.'],
        ['What is the default JavaFX theme?', 'Modena, applied as the user agent stylesheet; Caspian is the legacy theme.'],
      ],
    ),
  ]),

  fx(8, 'TableView and Data Handling', 'Essential', [
    topic(
      'fx-tableview-basics',
      'TableView, TableColumn, PropertyValueFactory and Observable Data',
      [
        blk(`<h3>TableView basics</h3>
• <code>TableView&lt;S&gt;</code> shows rows of type <code>S</code> from an <code>ObservableList&lt;S&gt;</code> (<code>setItems</code>); each <code>TableColumn&lt;S,T&gt;</code> has a <b>cell value factory</b> that extracts a value (as an <code>ObservableValue&lt;T&gt;</code>) from a row. Table cells are <b>virtualised</b>, so millions of rows are fine. Set <code>setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_FLEX_LAST_COLUMN)</code> (or <code>CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS</code>), <code>setPlaceholder(...)</code> for empty tables.`,
          `TableView<CourseModel> table = new TableView<>();
TableColumn<CourseModel, String> titleCol = new TableColumn<>("Title");
TableColumn<CourseModel, Number> lessonsCol = new TableColumn<>("Lessons");
TableColumn<CourseModel, Boolean> completeCol = new TableColumn<>("Complete");

titleCol.setCellValueFactory(cell -> cell.getValue().titleProperty());                // lambda: type safe
lessonsCol.setCellValueFactory(cell -> cell.getValue().lessonsProperty());
completeCol.setCellValueFactory(cell -> cell.getValue().completeProperty());

table.getColumns().addAll(titleCol, lessonsCol, completeCol);
table.setItems(FXCollections.observableArrayList(model.loadAll()));
table.setPlaceholder(new Label("No courses yet"));
table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_FLEX_LAST_COLUMN);`,
        ),
      ],
      [
        blk(`<h3>PropertyValueFactory vs lambdas</h3>
• <code>new PropertyValueFactory&lt;&gt;("title")</code> uses <b>reflection</b>: it looks for <code>titleProperty()</code>, else <code>getTitle()</code> (read-only wrapper, no automatic updates). Disadvantages: strings are not checked by the compiler, break on refactoring, and in <b>modular apps</b> the model package must be <code>opens ... to javafx.base</code>. Prefer <b>lambda factories</b> returning the property (type safe, live updates). For plain records/immutable models: <code>cell -> new ReadOnlyStringWrapper(cell.getValue().title())</code> or <code>new SimpleStringProperty(...)</code>.`,
          `// reflection-based (works, but fragile)
titleCol.setCellValueFactory(new PropertyValueFactory<>("title"));

// recommended: a lambda
titleCol.setCellValueFactory(c -> c.getValue().titleProperty());

// immutable record row
record CourseRow(String title, int lessons, LocalDate start) {}
TableColumn<CourseRow, String> t = new TableColumn<>("Title");
t.setCellValueFactory(c -> new ReadOnlyStringWrapper(c.getValue().title()));
TableColumn<CourseRow, LocalDate> d = new TableColumn<>("Start");
d.setCellValueFactory(c -> new ReadOnlyObjectWrapper<>(c.getValue().start()));

// module-info: opens com.javaschoollab.tracker.model to javafx.base;   (needed only for PropertyValueFactory)`,
        ),
      ],
      [
        blk(`<h3>Observable data collections and updating the table</h3>
• Modify the <b><code>ObservableList</code></b> (add/remove/set) and the table updates automatically; updating an element's <b>property</b> updates its cells if the cell value factory returns the property; for plain getters changes are not seen: call <code>table.refresh()</code> or replace the item. <b>Modify the list on the Application Thread</b> (or build a new list in the background and <code>setAll</code> on the UI thread). For bulk updates use <code>setAll</code>/<code>addAll</code> (one change event) instead of many <code>add</code> calls.`,
          `ObservableList<CourseModel> items = table.getItems();
items.add(new CourseModel("JavaFX", 40));
items.remove(table.getSelectionModel().getSelectedItem());
items.get(0).setTitle("JavaFX 21");                        // cell updates because the factory returned titleProperty()

// refresh data from the background without freezing the UI
Task<List<CourseModel>> load = new Task<>() { protected List<CourseModel> call() { return service.fetchAll(); } };
load.setOnSucceeded(e -> items.setAll(load.getValue()));   // runs on the FX thread
new Thread(load).start();`,
        ),
      ],
      [
        ['PropertyValueFactory vs lambda cell value factory?', 'PropertyValueFactory finds a property/getter by name using reflection and is fragile; a lambda returning the property is type safe, refactor friendly and live-updating.'],
        ['Why doesn\'t my table update when I change an object?', 'The cell value factory must return an observable property; with getters or plain values call refresh() or replace the item in the list.'],
        ['Why is TableView fast with many rows?', 'It virtualises rows, creating cells only for visible rows and reusing them while scrolling.'],
      ],
    ),
    topic(
      'fx-tableview-sort-filter-edit',
      'Sorting, Filtering, Searching, Pagination, Selection and Editable Tables',
      [
        blk(`<h3>Sorting, filtering and searching</h3>
• Click a column header to sort; the table sorts the list through <code>table.getSortOrder()</code>/<code>comparator</code>. For <b>filtering</b> wrap the source list: <code>FilteredList&lt;S&gt; filtered = new FilteredList&lt;&gt;(items, p -> true)</code>, update <code>filtered.setPredicate(...)</code> when the search text changes; for <b>sorting</b> a filtered list wrap in <code>SortedList</code> and <b>bind its comparator</b> to the table's comparator: <code>sorted.comparatorProperty().bind(table.comparatorProperty())</code>, then <code>table.setItems(sorted)</code>.`,
          `FilteredList<CourseModel> filtered = new FilteredList<>(items, c -> true);
searchField.textProperty().addListener((obs, old, text) -> {
    String q = text == null ? "" : text.toLowerCase().trim();
    filtered.setPredicate(c -> q.isEmpty() || c.getTitle().toLowerCase().contains(q) || c.getLevel().name().toLowerCase().contains(q));
});
SortedList<CourseModel> sorted = new SortedList<>(filtered);
sorted.comparatorProperty().bind(table.comparatorProperty());                // keep header-click sorting working
table.setItems(sorted);

titleCol.setComparator(String.CASE_INSENSITIVE_ORDER);
lessonsCol.setSortType(TableColumn.SortType.DESCENDING);
table.getSortOrder().add(lessonsCol);

levelFilter.valueProperty().addListener((o, a, lvl) -> filtered.setPredicate(c -> lvl == null || c.getLevel() == lvl));   // combine filters in one predicate in real code`,
        ),
      ],
      [
        blk(`<h3>Pagination and row selection</h3>
• <code>Pagination</code> control with a <b>page factory</b> returning a node for each page index: show a table of a slice (<code>items.subList(from, to)</code>) or query the database page-by-page (<code>LIMIT/OFFSET</code>, keyset). <b>Selection</b>: <code>table.getSelectionModel()</code> (<code>setSelectionMode(MULTIPLE)</code>, <code>getSelectedItem()</code>, <code>getSelectedItems()</code>, <code>selectedItemProperty()</code>, <code>setCellSelectionEnabled(true)</code> for cell selection); bind buttons to selection (<code>deleteButton.disableProperty().bind(table.getSelectionModel().selectedItemProperty().isNull())</code>); double-click rows with a <b>row factory</b>.`,
          `int pageSize = 20;
Pagination pagination = new Pagination((int) Math.ceil(filtered.size() / (double) pageSize), 0);
pagination.setPageFactory(page -> {
    int from = page * pageSize, to = Math.min(from + pageSize, filtered.size());
    TableView<CourseModel> view = createTable();
    view.setItems(FXCollections.observableArrayList(filtered.subList(from, to)));
    return view;
});
// resize the page count when the filter changes
filtered.addListener((ListChangeListener<CourseModel>) c -> pagination.setPageCount(Math.max(1, (int) Math.ceil(filtered.size() / (double) pageSize))));

table.getSelectionModel().setSelectionMode(SelectionMode.MULTIPLE);
deleteButton.disableProperty().bind(table.getSelectionModel().selectedItemProperty().isNull());
table.setRowFactory(tv -> {
    TableRow<CourseModel> row = new TableRow<>();
    row.setOnMouseClicked(e -> { if (e.getClickCount() == 2 && !row.isEmpty()) open(row.getItem()); });
    return row;
});`,
        ),
      ],
      [
        blk(`<h3>Editable tables and custom cell factories</h3>
• <b>Editing</b>: <code>table.setEditable(true)</code>, then a column's <b>cell factory</b> from <code>TextFieldTableCell.forTableColumn()</code>, <code>ComboBoxTableCell</code>, <code>CheckBoxTableCell</code>, <code>ChoiceBoxTableCell</code>; commit with <code>column.setOnEditCommit(e -> e.getRowValue().setTitle(e.getNewValue()))</code> (validate here; for property-backed models the default commit writes to the property). <b>Custom cell factories</b> render anything in a cell: badges, progress bars, buttons, icons. Always handle <code>empty</code> in <code>updateItem</code>; do <b>not</b> create heavy objects per update; reuse nodes held by the cell.`,
          `table.setEditable(true);
titleCol.setCellFactory(TextFieldTableCell.forTableColumn());
titleCol.setOnEditCommit(e -> {
    String value = e.getNewValue().trim();
    if (value.isEmpty()) { table.refresh(); return; }                                // reject: restore the old value
    e.getRowValue().setTitle(value);
    service.rename(e.getRowValue());
});
levelCol.setCellFactory(ComboBoxTableCell.forTableColumn(Level.values()));
completeCol.setCellFactory(CheckBoxTableCell.forTableColumn(completeCol));

// progress cell
progressCol.setCellFactory(col -> new TableCell<>() {
    private final ProgressBar bar = new ProgressBar();
    @Override protected void updateItem(Number value, boolean empty) {
        super.updateItem(value, empty);
        if (empty || value == null) { setGraphic(null); return; }
        bar.setProgress(value.doubleValue() / 100.0); setGraphic(bar);
    }
});

// action button cell
actionCol.setCellFactory(col -> new TableCell<>() {
    private final Button delete = new Button("Delete");
    { delete.setOnAction(e -> service.delete(getTableView().getItems().get(getIndex()))); }
    @Override protected void updateItem(Void v, boolean empty) { super.updateItem(v, empty); setGraphic(empty ? null : delete); }
});`,
        ),
      ],
      [
        ['How do you filter and sort a TableView?', 'Wrap the source ObservableList in a FilteredList (set a predicate), wrap that in a SortedList whose comparator is bound to the table comparator and set the SortedList as table items.'],
        ['How do you make cells editable?', 'Set the table and column editable with a cell factory such as TextFieldTableCell and commit changes in setOnEditCommit or by property binding.'],
        ['What is a row factory used for?', 'Customising TableRow behaviour and style, e.g. double-click to open, context menus or row styling by state.'],
      ],
    ),
  ]),

  fx(9, 'Navigation and Windows', 'Core', [
    topic(
      'fx-navigation-scenes-windows',
      'Opening New Windows, Switching Scenes, Modal Windows and Window Events',
      [
        blk(`<h3>Opening new windows</h3>
• Create another <code>Stage</code> with its own <code>Scene</code> and call <code>show()</code>; set <b>owner</b> (<code>initOwner(parent)</code>) and <b>modality</b> (<code>initModality(Modality.APPLICATION_MODAL | WINDOW_MODAL | NONE)</code>) before showing; <code>showAndWait()</code> blocks the caller until the window closes (nested event loop) and is perfect for modal forms that return a result. Position relative to the owner, set a title and icon.`,
          `public Optional<Course> openCourseForm(Window owner, Course existing) throws IOException {
    FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/course-form.fxml"));
    Stage dialog = new Stage();
    dialog.initOwner(owner);
    dialog.initModality(Modality.WINDOW_MODAL);                       // blocks only the owner window
    dialog.setTitle(existing == null ? "New course" : "Edit course");
    dialog.setScene(new Scene(loader.load()));
    CourseFormController c = loader.getController();
    c.setCourse(existing);
    dialog.showAndWait();                                              // returns after the dialog closes
    return Optional.ofNullable(c.getResult());
}`,
        ),
      ],
      [
        blk(`<h3>Switching scenes and content</h3>
• Two approaches: (1) <b>replace the Scene</b> of the stage: <code>stage.setScene(next)</code> (loses window state such as maximised/size unless handled); (2) <b>swap the content</b> of a fixed shell: keep a <code>BorderPane</code>/<code>StackPane</code> root and call <code>shell.setCenter(loadView("courses"))</code>: preferred (single scene, shared menu/toolbar/CSS, easy transitions and back-stack). Build a small <b>router/navigator</b> class: it loads FXML views by name, caches or recreates them, and keeps a history stack.`,
          `public class Navigator {
    private final BorderPane shell; private final Deque<String> history = new ArrayDeque<>(); private final Map<String, Parent> cache = new HashMap<>();
    public Navigator(BorderPane shell) { this.shell = shell; }

    public void go(String view) {
        Parent node = cache.computeIfAbsent(view, v -> load("/view/" + v + ".fxml"));
        history.push(view);
        FadeTransition in = new FadeTransition(Duration.millis(150), node); in.setFromValue(0); in.setToValue(1);
        shell.setCenter(node); in.play();
    }
    public void back() { if (history.size() > 1) { history.pop(); shell.setCenter(cache.get(history.peek())); } }

    private Parent load(String path) {
        try { return new FXMLLoader(Navigator.class.getResource(path)).load(); }
        catch (IOException e) { throw new UncheckedIOException(e); }
    }
}
// menu: courses.setOnAction(e -> navigator.go("courses"));`,
        ),
      ],
      [
        blk(`<h3>Menu and tab navigation, passing data, window events</h3>
• <b>Menu navigation</b>: <code>MenuItem</code> actions call the navigator; <b>tab-based</b>: a <code>TabPane</code> with a tab per module (open on demand, select existing tab if already open). <b>Passing data between controllers</b>: via the controller (<code>loader.getController().setX()</code>), a shared model/service, a <b>navigation parameter map</b> in the navigator, or a dependency-injected context object. <b>Window events</b>: <code>setOnCloseRequest</code> (confirm unsaved changes; <code>consume()</code> to veto), <code>setOnShowing/OnShown/OnHiding/OnHidden</code>, <code>focusedProperty</code>, <code>iconifiedProperty</code>, <code>maximizedProperty</code>; persist window size/position in <code>Preferences</code>.`,
          `stage.setOnCloseRequest(e -> {
    if (state.hasUnsavedChanges()) {
        Alert a = new Alert(Alert.AlertType.CONFIRMATION, "Discard unsaved changes?", ButtonType.YES, ButtonType.NO);
        if (a.showAndWait().filter(ButtonType.NO::equals).isPresent()) e.consume();              // cancel closing
    }
});
stage.setOnHidden(e -> { prefs.putDouble("w", stage.getWidth()); prefs.putDouble("h", stage.getHeight()); });
stage.setWidth(prefs.getDouble("w", 960)); stage.setHeight(prefs.getDouble("h", 640));

Tab open(String id, String title, Supplier<Node> content) {
    return tabs.getTabs().stream().filter(t -> id.equals(t.getId())).findFirst()
        .orElseGet(() -> { Tab t = new Tab(title, content.get()); t.setId(id); tabs.getTabs().add(t); return t; });
}`,
        ),
      ],
      [
        ['Modal window vs non-modal?', 'A modal stage blocks input to its owner (WINDOW_MODAL) or all application windows (APPLICATION_MODAL) until closed; non-modal windows can be used independently. showAndWait pauses the caller until it closes.'],
        ['Why swap content instead of scenes?', 'A single scene with a shell layout keeps window state, menus and CSS and enables transitions; replacing the scene resets more state.'],
        ['How do you stop a window from closing with unsaved data?', 'Handle setOnCloseRequest, ask the user and call event.consume() to cancel closing.'],
      ],
    ),
  ]),

  fx(10, 'Concurrency and Background Tasks', 'Essential', [
    topic(
      'fx-concurrency-thread-rules',
      'The JavaFX Application Thread, UI Thread Restrictions and Platform.runLater',
      [
        blk(`<h3>The JavaFX Application Thread</h3>
• All <b>live scene graph changes</b> and event handlers run on <b>one thread</b>, the <b>JavaFX Application Thread</b> (FX thread). Blocking it (sleep, JDBC, HTTP, big loops) <b>freezes the entire UI</b>. Touching a live node from another thread throws <code>IllegalStateException: Not on FX application thread</code>. <b>Rule</b>: do long work on <b>background threads</b>, then hand results back to the FX thread. <code>Platform.isFxApplicationThread()</code> checks the current thread.`,
          `// BAD: freezes the window for 5 seconds
button.setOnAction(e -> { Thread.sleep(5000); label.setText("done"); });

// BAD: touching the UI off the FX thread -> IllegalStateException
new Thread(() -> label.setText("done")).start();

// GOOD: work in background, update via runLater
button.setOnAction(e -> new Thread(() -> {
    String result = slowService.compute();                       // background thread
    Platform.runLater(() -> label.setText(result));              // back on the FX thread
}).start());`,
        ),
      ],
      [
        blk(`<h3>Platform.runLater and its pitfalls</h3>
• <code>Platform.runLater(Runnable)</code> queues the runnable on the FX thread. Pitfalls: <b>flooding</b> the queue (calling it thousands of times a second for progress updates makes the UI lag: coalesce updates, use an <code>AtomicReference</code> + one pending runnable, or <code>Task.updateProgress</code> which coalesces for you); it is <b>asynchronous</b> (code after it runs first); exceptions inside are not propagated to the caller; use <code>PlatformImpl.runAndWait</code>-style helpers (a <code>FutureTask</code> + <code>runLater</code>) if you must wait for a result; in tests, the toolkit must be started.`,
          `// coalescing high-frequency updates: at most one pending UI update
private final AtomicReference<String> latest = new AtomicReference<>();
private final AtomicBoolean scheduled = new AtomicBoolean();

void post(String text) {
    latest.set(text);
    if (scheduled.compareAndSet(false, true)) Platform.runLater(() -> { scheduled.set(false); label.setText(latest.get()); });
}

// run something on the FX thread and wait for the result (never call from the FX thread itself)
static <T> T callOnFx(Callable<T> c) throws Exception {
    if (Platform.isFxApplicationThread()) return c.call();
    FutureTask<T> task = new FutureTask<>(c);
    Platform.runLater(task);
    return task.get();
}`,
        ),
      ],
      [
        blk(`<h3>Common symptoms</h3>
<table ${TABLE}>
<tr><th>Symptom</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Window "Not Responding", no repaint</td><td>Long work in a handler or <code>start()</code></td><td>Move to <code>Task</code></td></tr>
<tr><td><code>Not on FX application thread</code></td><td>UI change from a worker thread</td><td><code>Platform.runLater</code> or Task callbacks</td></tr>
<tr><td>UI lags while a task reports progress</td><td>Too many <code>runLater</code> calls</td><td>Throttle / use <code>updateProgress</code></td></tr>
<tr><td>Deadlock when waiting for runLater result on the FX thread</td><td><code>get()</code> on the FX thread</td><td>Never block the FX thread</td></tr>
<tr><td>App does not exit</td><td>Non-daemon worker threads</td><td>Daemon threads or shut pools in <code>stop()</code></td></tr>
</table>`,
          `Thread t = new Thread(task, "import"); t.setDaemon(true); t.start();          // daemon: does not keep the JVM alive`,
        ),
      ],
      [
        ['Why can\'t you update the UI from a background thread?', 'The scene graph is not thread-safe and is accessed only by the JavaFX Application Thread; changes elsewhere throw IllegalStateException or corrupt state, so use Platform.runLater or Task callbacks.'],
        ['What is Platform.runLater?', 'It schedules a Runnable to execute later on the JavaFX Application Thread, used to hand results from worker threads to the UI.'],
        ['Why does the UI freeze during a long handler?', 'Handlers run on the single FX thread; while it is busy no events are processed and nothing repaints.'],
      ],
    ),
    topic(
      'fx-task-service',
      'Task<V>, Service<V>, Progress, Cancellation and Exception Handling',
      [
        blk(`<h3>Task&lt;V&gt;</h3>
• <b><code>Task&lt;V&gt;</code></b> (<code>javafx.concurrent</code>) is a one-shot background job that implements <code>Runnable</code>, <code>Future</code> and <code>Worker</code>: you implement <code>call()</code> (runs on the worker thread), and observe <b>properties updated safely on the FX thread</b>: <code>stateProperty</code> (<code>READY, SCHEDULED, RUNNING, SUCCEEDED, CANCELLED, FAILED</code>), <code>valueProperty</code>, <code>progressProperty</code>, <code>messageProperty</code>, <code>titleProperty</code>, <code>exceptionProperty</code>, <code>runningProperty</code>. Callbacks <code>setOnSucceeded/Failed/Cancelled/Running</code> run on the FX thread. Inside <code>call()</code> use <code>updateProgress(done, total)</code>, <code>updateMessage</code>, <code>updateValue</code> (these are throttled and marshalled for you) and check <code>isCancelled()</code>.`,
          `Task<List<Course>> load = new Task<>() {
    @Override protected List<Course> call() throws Exception {
        updateMessage("Loading courses...");
        List<Course> result = new ArrayList<>();
        List<Integer> ids = repo.ids();
        for (int i = 0; i < ids.size(); i++) {
            if (isCancelled()) { updateMessage("Cancelled"); return result; }                     // cooperative cancellation
            result.add(repo.load(ids.get(i)));
            updateProgress(i + 1, ids.size());
        }
        return result;
    }
};
progressBar.progressProperty().bind(load.progressProperty());
statusLabel.textProperty().bind(load.messageProperty());
loadButton.disableProperty().bind(load.runningProperty());
cancelButton.setOnAction(e -> load.cancel());

load.setOnSucceeded(e -> items.setAll(load.getValue()));                // on the FX thread
load.setOnFailed(e -> new Alert(Alert.AlertType.ERROR, load.getException().getMessage()).show());
Thread th = new Thread(load, "load-courses"); th.setDaemon(true); th.start();`,
        ),
      ],
      [
        blk(`<h3>Service&lt;V&gt; and executors</h3>
• A <b><code>Service&lt;V&gt;</code></b> is a <b>reusable</b> task factory: override <code>createTask()</code>; <code>start()</code> runs it, <code>restart()</code> cancels and runs again, <code>cancel()</code>, <code>reset()</code>; it exposes the same properties of the current task and uses a <b>shared daemon thread pool</b> (or your own <code>setExecutor</code>). <code>ScheduledService</code> repeats on a schedule (polling) with <code>setPeriod</code>, <code>setRestartOnFailure</code>, <code>setBackoffStrategy</code>.<br>
<table ${TABLE}>
<tr><th></th><th><code>Task</code></th><th><code>Service</code></th></tr>
<tr><td>Runs</td><td><b>Once</b> (cannot be restarted)</td><td><b>Many times</b> (restart/reset)</td></tr>
<tr><td>Thread</td><td>You start it (<code>Thread</code>/executor)</td><td>Managed (executor)</td></tr>
<tr><td>Typical use</td><td>One-off operation (import file)</td><td>Reusable operation tied to the UI (refresh, search, poll)</td></tr>
<tr><td>Creation</td><td><code>new Task&lt;&gt;() { call() }</code></td><td>Subclass with <code>createTask()</code></td></tr>
</table>`,
          `Service<List<Course>> searchService = new Service<>() {
    @Override protected Task<List<Course>> createTask() {
        final String query = searchField.getText();                               // capture inputs on the FX thread
        return new Task<>() { @Override protected List<Course> call() { return api.search(query); } };
    }
};
searchService.setOnSucceeded(e -> items.setAll(searchService.getValue()));
searchField.textProperty().addListener((o, a, b) -> searchService.restart());   // cancels the running search and starts a new one

ScheduledService<Status> poll = new ScheduledService<>() {
    protected Task<Status> createTask() { return new Task<>() { protected Status call() { return api.status(); } }; }
};
poll.setPeriod(Duration.seconds(10)); poll.setRestartOnFailure(true);
poll.setOnSucceeded(e -> statusLabel.setText(poll.getValue().toString())); poll.start();

ExecutorService pool = Executors.newFixedThreadPool(4, r -> { Thread t = new Thread(r); t.setDaemon(true); return t; });
searchService.setExecutor(pool);`,
        ),
      ],
      [
        blk(`<h3>Exception handling, cancellation and CompletableFuture integration</h3>
• Exceptions thrown in <code>call()</code> move the task to <b>FAILED</b>; read <code>getException()</code> in <code>setOnFailed</code> (not thrown to the FX thread, so an unhandled failure is <b>silent</b> if you don't observe it). Set a default handler: <code>Thread.setDefaultUncaughtExceptionHandler</code>. <b>Cancellation is cooperative</b>: <code>cancel()</code> interrupts the thread, so check <code>isCancelled()</code> in loops and handle <code>InterruptedException</code> by restoring the interrupt and returning. <b>CompletableFuture</b>: run work with <code>supplyAsync(..., executor)</code> and move to the FX thread with <code>.thenAcceptAsync(r -> ..., Platform::runLater)</code> (use a custom executor with <code>runLater</code>); handle errors with <code>exceptionally</code>/<code>handle</code>. Virtual threads (<code>Executors.newVirtualThreadPerTaskExecutor()</code>) are fine for blocking I/O tasks.`,
          `Executor fx = Platform::runLater;
CompletableFuture
    .supplyAsync(() -> api.fetchCourses(), Executors.newVirtualThreadPerTaskExecutor())      // background (blocking I/O)
    .thenAcceptAsync(courses -> items.setAll(courses), fx)                                  // FX thread
    .exceptionally(ex -> { Platform.runLater(() -> showError(ex.getCause() == null ? ex : ex.getCause())); return null; });

Task<Void> t = new Task<>() {
    @Override protected Void call() {
        try { while (!isCancelled()) { Thread.sleep(200); poll(); } }
        catch (InterruptedException e) { if (isCancelled()) return null; Thread.currentThread().interrupt(); }
        return null;
    }
};
t.exceptionProperty().addListener((o, a, ex) -> log.error("task failed", ex));`,
        ),
      ],
      [
        ['Task vs Service?', 'A Task is a one-shot background job; a Service creates a new Task each time it is started or restarted, so it is reusable and manages threading, ideal for repeatable UI operations like search or refresh.'],
        ['How do you report progress from a background task?', 'Call updateProgress and updateMessage inside call(); bind progress bars and labels to the Task properties, which update safely on the FX thread.'],
        ['How do you handle exceptions and cancellation in a Task?', 'Observe the FAILED state or exceptionProperty/setOnFailed, and for cancellation check isCancelled() and handle InterruptedException cooperatively.'],
        ['How do you combine CompletableFuture with JavaFX?', 'Run the work asynchronously and continue with an executor that delegates to Platform.runLater so UI updates occur on the FX thread.'],
      ],
    ),
  ]),
];
