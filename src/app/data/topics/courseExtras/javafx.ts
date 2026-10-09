// JavaFX course extras (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const javafxExtras: Record<string, Extra> = {
    'javafx-intro': x(
        ['JavaFX is the modern Java toolkit for desktop GUI applications, replacing Swing for new projects.',
            'An app extends <code>Application</code> and builds its UI in <code>start(Stage)</code>; <code>launch()</code> starts it.',
            'The UI is a tree of nodes (a scene graph) inside a Scene on a Stage (the window).'],
        ['JavaFX is distributed separately from the JDK (OpenJFX); add the modules <code>javafx.controls</code> and others to the project.',
            'Layouts (VBox, HBox, BorderPane, GridPane) arrange nodes; controls (Button, TextField, TableView) provide behaviour.',
            'Styling uses CSS and UI can be declared in FXML with a controller.'],
        ['Keep long work off the JavaFX Application Thread (use Task/Service) or the UI freezes.',
            'Use properties and bindings to keep UI and model in sync without manual listeners.',
            'Package with jlink/jpackage to ship a runtime with the application.'],
        [['F', 'What is JavaFX?', 'A Java framework for building desktop and rich client user interfaces.'],
            ['F', 'What are Stage and Scene?', 'Stage is the window; Scene holds the node tree displayed in it.'],
            ['M', 'What is the JavaFX Application Thread?', 'The single thread that builds and updates the UI; UI changes must happen on it.'],
            ['M', 'What is FXML?', 'An XML format for declaring UI layout, connected to a controller class.'],
            ['S', 'How do you run long tasks without freezing the UI?', 'Run them in a Task on a background thread and update the UI through Platform.runLater or task callbacks.'],
            ['S', 'How do you distribute a JavaFX app?', 'With jpackage or jlink producing a native installer or runtime image that includes the needed modules.']],
        [['Hello JavaFX.',
            r`public class HelloApp extends Application {
    @Override public void start(Stage stage) {
        Label label = new Label("Hello JavaFX");
        Button btn = new Button("Click");
        btn.setOnAction(e -> label.setText("Clicked!"));
        stage.setScene(new Scene(new VBox(10, label, btn), 320, 160));
        stage.setTitle("Demo");
        stage.show();
    }
    public static void main(String[] args) { launch(args); }
}

// OUTPUT:
// a window titled Demo with a label and a button; clicking changes the label`],
            ['Maven setup.',
                r`<dependency><groupId>org.openjfx</groupId><artifactId>javafx-controls</artifactId><version>21.0.2</version></dependency>
<plugin><groupId>org.openjfx</groupId><artifactId>javafx-maven-plugin</artifactId><version>0.0.8</version><configuration><mainClass>com.shop.HelloApp</mainClass></configuration></plugin>
mvn javafx:run

// OUTPUT:
// the application window opens`]],
        [['Background task.',
            r`Task<String> task = new Task<>() { protected String call() throws Exception { Thread.sleep(2000); return "done"; } };
task.setOnSucceeded(e -> label.setText(task.getValue()));
new Thread(task).start();

// OUTPUT:
// the label shows done after 2 seconds while the UI stays responsive`],
            ['Property binding.',
                r`TextField input = new TextField();
Label echo = new Label();
echo.textProperty().bind(input.textProperty());

// OUTPUT:
// typing in the field updates the label instantly`]]
    ),

    'javafx-scene-graph': x(
        ['The scene graph is a tree: the root node contains child nodes, which may contain more nodes. Layout panes and controls are nodes.',
            'A Stage shows one Scene; replacing the scene root changes the screen.',
            'Lifecycle of an Application: <code>init()</code>, <code>start(Stage)</code>, <code>stop()</code>.'],
        ['Nodes have properties: position, size, visibility, opacity, transforms, effects and CSS classes.',
            'Group, Pane and layout containers manage children; <code>getChildren().add()</code> modifies the tree.',
            'Events bubble through the tree; filters and handlers can intercept them.'],
        ['Keep the scene graph small: thousands of nodes slow rendering; use virtualized controls (ListView, TableView) for big data.',
            'Modify the graph only on the Application Thread; other threads must use <code>Platform.runLater</code>.',
            'Clean up listeners and bindings in <code>stop()</code> or when removing nodes to avoid leaks.'],
        [['F', 'What is a scene graph?', 'A tree of nodes that describes everything shown in a Scene.'],
            ['F', 'Order of Application lifecycle methods?', 'init, start, stop.'],
            ['M', 'What is a Stage?', 'The top-level window; a primary Stage is passed to start().'],
            ['M', 'How do you add a node?', '<code>parent.getChildren().add(node)</code> on a layout pane or Group.'],
            ['S', 'How do you avoid UI performance problems with big lists?', 'Use virtualized controls (ListView/TableView with cell factories) rather than thousands of nodes.'],
            ['S', 'What causes memory leaks in JavaFX?', 'Listeners and bindings that keep references to nodes after they are removed; remove them or use weak listeners.']],
        [['Building a scene graph in code.',
            r`BorderPane root = new BorderPane();
root.setTop(new Label("Header"));
root.setCenter(new TextArea("Notes"));
root.setBottom(new HBox(8, new Button("Save"), new Button("Cancel")));
Scene scene = new Scene(root, 480, 320);
stage.setScene(scene); stage.show();

// OUTPUT:
// header on top, text area in the middle, two buttons at the bottom`],
            ['Lifecycle logging.',
                r`@Override public void init() { System.out.println("init: " + Thread.currentThread().getName()); }
@Override public void start(Stage s) { System.out.println("start: " + Thread.currentThread().getName()); s.show(); }
@Override public void stop() { System.out.println("stop"); }

// OUTPUT:
// init: JavaFX-Launcher
// start: JavaFX Application Thread
// stop`]],
        [['Update from a background thread.',
            r`new Thread(() -> { String data = loadData(); Platform.runLater(() -> label.setText(data)); }).start();

// OUTPUT:
// the label updates safely on the Application Thread`],
            ['Switch scenes.',
                r`stage.setScene(new Scene(new VBox(new Label("Page 2"))));

// OUTPUT:
// the window content changes to Page 2`]]
    ),

    'javafx-layouts': x(
        ['Layout panes position children: <code>VBox</code> (vertical), <code>HBox</code> (horizontal), <code>BorderPane</code> (five regions), <code>GridPane</code> (rows and columns), <code>StackPane</code> (layers), <code>FlowPane</code>.',
            'Common controls: Label, Button, TextField, CheckBox, ComboBox, ListView, TableView.',
            'Set spacing, padding and alignment to make layouts readable.'],
        ['Use constraints: <code>HBox.setHgrow</code>, <code>GridPane.setConstraints</code>, <code>ColumnConstraints</code> for percentage widths.',
            'TableView needs <code>TableColumn</code> with cell value factories bound to model properties.',
            'Style with CSS: <code>node.getStyleClass().add("primary")</code> and a stylesheet.'],
        ['Responsive layouts: let panes grow (<code>Priority.ALWAYS</code>) and avoid fixed pixel sizes.',
            'Use FXML plus a controller for larger screens; separate layout from logic.',
            'Prefer ObservableList with TableView/ListView so changes update automatically.'],
        [['F', 'Which layout arranges nodes vertically?', 'VBox.'],
            ['F', 'Which layout has top, bottom, left, right, center?', 'BorderPane.'],
            ['M', 'How do you make a node fill remaining space in an HBox?', '<code>HBox.setHgrow(node, Priority.ALWAYS)</code>.'],
            ['M', 'How does a TableView display data?', 'With TableColumn objects whose cell value factories read properties from item objects in an ObservableList.'],
            ['S', 'Why use FXML?', 'It separates UI structure from code, supports tools like Scene Builder and makes UIs easier to maintain.'],
            ['S', 'How do you keep a table in sync with data?', 'Use an ObservableList (and JavaFX properties) so UI updates automatically when the list or items change.']],
        [['Form with GridPane.',
            r`GridPane grid = new GridPane();
grid.setHgap(10); grid.setVgap(8); grid.setPadding(new Insets(16));
grid.add(new Label("Name"), 0, 0);  grid.add(new TextField(), 1, 0);
grid.add(new Label("Email"), 0, 1); grid.add(new TextField(), 1, 1);
grid.add(new Button("Save"), 1, 2);
ColumnConstraints c1 = new ColumnConstraints(); ColumnConstraints c2 = new ColumnConstraints(); c2.setHgrow(Priority.ALWAYS);
grid.getColumnConstraints().addAll(c1, c2);

// OUTPUT:
// a two-column form where the input column stretches with the window`],
            ['TableView with properties.',
                r`TableView<Customer> table = new TableView<>(FXCollections.observableArrayList(new Customer("Asha", "a@x.com")));
TableColumn<Customer, String> name = new TableColumn<>("Name"); name.setCellValueFactory(c -> c.getValue().nameProperty());
TableColumn<Customer, String> email = new TableColumn<>("Email"); email.setCellValueFactory(c -> c.getValue().emailProperty());
table.getColumns().addAll(name, email);

// OUTPUT:
// a table with Name and Email columns`]],
        [['CSS styling.',
            r`scene.getStylesheets().add(getClass().getResource("/app.css").toExternalForm());
button.getStyleClass().add("primary");
/* app.css */  .primary { -fx-background-color: #2563eb; -fx-text-fill: white; -fx-background-radius: 6; }

// OUTPUT:
// the button is blue with white text`],
            ['FXML load.',
                r`FXMLLoader loader = new FXMLLoader(getClass().getResource("/customer.fxml"));
Parent root = loader.load();
CustomerController controller = loader.getController();

// OUTPUT:
// UI built from XML, controller wired by fx:id and onAction handlers`]]
    ),

    'javafx-events': x(
        ['Events notify your code about user actions: clicks, key presses, mouse moves. Register handlers such as <code>setOnAction</code>, <code>setOnKeyPressed</code>, <code>setOnMouseClicked</code>.',
            'Handlers are usually lambdas that receive the event object.',
            'Handlers run on the JavaFX Application Thread, so keep them fast.'],
        ['Event flow: capturing (filters, root to target) then bubbling (handlers, target to root); call <code>event.consume()</code> to stop propagation.',
            'Use <code>addEventHandler</code> and <code>addEventFilter</code> for multiple or generic handlers.',
            'Properties support change listeners: <code>textProperty().addListener((obs, old, val) -&gt; ...)</code>.'],
        ['Do not perform blocking work in handlers; start a Task and update the UI when it finishes.',
            'Remove listeners you add to long-lived properties to prevent memory leaks.',
            'Prefer bindings over manual listeners for simple one-way synchronization.'],
        [['F', 'How do you handle a button click?', '<code>button.setOnAction(e -&gt; ...)</code>.'],
            ['F', 'On which thread do handlers run?', 'The JavaFX Application Thread.'],
            ['M', 'What is event bubbling?', 'After the target handles an event it travels up the parent chain; filters run earlier in the capture phase.'],
            ['M', 'How do you stop an event propagating?', 'Call event.consume().'],
            ['S', 'Why must handlers be short?', 'Long handlers block the Application Thread, freezing rendering and input.'],
            ['S', 'Listener vs binding?', 'A listener runs custom code on change; a binding declaratively keeps one property equal to a computed value.']],
        [['Click and key handlers.',
            r`Button save = new Button("Save");
save.setOnAction(e -> status.setText("Saved " + LocalTime.now().withNano(0)));
root.setOnKeyPressed(e -> { if (e.getCode() == KeyCode.ESCAPE) stage.close(); });
nameField.textProperty().addListener((obs, old, val) -> save.setDisable(val.isBlank()));

// OUTPUT:
// Saved 10:15:30        (Escape closes the window; Save is disabled while the field is blank)`],
            ['Long work in a Task.',
                r`save.setOnAction(e -> {
    save.setDisable(true);
    Task<Void> t = new Task<>() { protected Void call() { repository.saveAll(); return null; } };
    t.setOnSucceeded(ev -> { status.setText("Saved"); save.setDisable(false); });
    t.setOnFailed(ev -> status.setText("Failed: " + t.getException().getMessage()));
    new Thread(t).start();
});

// OUTPUT:
// the UI stays responsive while saving; status updates when done`]],
        [['Event filter that consumes.',
            r`pane.addEventFilter(MouseEvent.MOUSE_CLICKED, e -> { if (locked) e.consume(); });

// OUTPUT:
// clicks are ignored while locked`],
            ['Binding instead of listener.',
                r`total.textProperty().bind(Bindings.format("Total: %.2f", price.multiply(qty)));

// OUTPUT:
// Total: 25.00     (updates automatically when price or qty change)`]]
    )
};

export const javafxDeep: Record<string, Deep> = {
    'javafx-intro': dv(
        [`JavaFX renders through a scene graph managed on a single UI thread, the JavaFX Application Thread. A pulse (about 60 per second) synchronizes the scene graph with the render thread: dirty nodes are updated, layout runs, CSS is applied, and the result is drawn with hardware acceleration when available. Anything that blocks the Application Thread delays pulses and freezes the UI.`,
            r`public class App extends Application {
    @Override public void start(Stage stage) {
        Label clock = new Label();
        Timeline tick = new Timeline(new KeyFrame(Duration.seconds(1), e -> clock.setText(LocalTime.now().withNano(0).toString())));
        tick.setCycleCount(Animation.INDEFINITE); tick.play();
        stage.setScene(new Scene(new StackPane(clock), 240, 120)); stage.show();
    }
}

// OUTPUT:
// a window showing a clock that updates every second, driven by a Timeline on the UI thread`],
        [`Ways to build UI: pure Java code, FXML with Scene Builder, and mixed approaches. Ways to run: <code>Application.launch</code>, Maven or Gradle plugins, jlink runtime images, jpackage installers. Modules: <code>javafx.base</code>, <code>controls</code>, <code>graphics</code>, <code>fxml</code>, <code>media</code>, <code>web</code>, <code>swing</code>.`,
            r`module com.shop.desktop { requires javafx.controls; requires javafx.fxml; opens com.shop.desktop to javafx.fxml; exports com.shop.desktop; }
jpackage --type msi --input target --main-jar shop.jar --main-class com.shop.desktop.App --module-path "%PATH_TO_FX%" --add-modules javafx.controls,javafx.fxml

// OUTPUT:
// shop-1.0.msi installer with a bundled runtime`],
        [`Typical mistakes: updating the UI from background threads (IllegalStateException), doing blocking I/O in handlers, missing module opens for FXML reflection, forgetting <code>Platform.exit</code> (threads keep the JVM alive) and shipping without the native libraries. Use Task/Service and the correct module declarations.`,
            r`new Thread(() -> label.setText("loaded")).start();       // wrong thread

// OUTPUT:
// java.lang.IllegalStateException: Not on FX application thread; currentThread = Thread-4

// fix
new Thread(() -> Platform.runLater(() -> label.setText("loaded"))).start();`],
        [`Performance: keep the scene graph small, use virtualized controls, avoid layout thrash (many resize/relayout cycles), cache static nodes (<code>setCache(true)</code>), and keep CSS simple. Profile with the JavaFX pulse logger.`,
            r`java -Djavafx.pulseLogger=true -jar shop.jar

// OUTPUT: (summary)
// pulse 120: 3.1 ms layout, 1.4 ms render        (a pulse over 16 ms means dropped frames)`],
        [`Real-world: a small desktop client that talks to a REST API. The UI shows a table, loads data in a Task, shows a progress indicator and handles errors in a dialog.`,
            r`ProgressIndicator spinner = new ProgressIndicator();
Task<List<Order>> load = new Task<>() { protected List<Order> call() { return api.fetchOrders(); } };
spinner.visibleProperty().bind(load.runningProperty());
load.setOnSucceeded(e -> table.getItems().setAll(load.getValue()));
load.setOnFailed(e -> new Alert(Alert.AlertType.ERROR, load.getException().getMessage()).show());
new Thread(load).start();

// OUTPUT:
// spinner while loading; table filled on success; an error dialog on failure`]
    ),

    'javafx-scene-graph': dv(
        [`Every node has a parent (except the root), transforms relative to it, bounds in several coordinate systems (layout, local, parent) and a render state. Changing a property marks the node dirty; on the next pulse JavaFX recomputes layout (top-down for size, bottom-up for preferred sizes), applies CSS and synchronizes with the renderer.`,
            r`Rectangle r = new Rectangle(100, 40, Color.STEELBLUE);
Group g = new Group(r);
r.setTranslateX(30);
r.setRotate(20);
System.out.println(r.getBoundsInLocal());
System.out.println(r.getBoundsInParent());

// OUTPUT:
// BoundingBox [minX:0.0, minY:0.0, width:100.0, height:40.0 ...]
// BoundingBox [minX:~24.2, minY:~-7.5, width:~..., height:~... ]   (includes translation and rotation)`],
        [`Tree operations: add, remove, reorder (<code>toFront</code>), find by id (<code>lookup("#id")</code>), traverse children, apply CSS classes and pseudo-classes, set clip, effects and transforms. Lifecycle hooks: <code>sceneProperty()</code> listeners and <code>Application.stop()</code>.`,
            r`Node save = root.lookup("#saveButton");
root.getChildren().remove(save);
root.getChildren().add(0, save);          // z-order: first is behind
save.pseudoClassStateChanged(PseudoClass.getPseudoClass("danger"), true);
save.setEffect(new DropShadow(6, Color.gray(0, 0.4)));

// OUTPUT:
// the button is moved to the back, styled with :danger and given a shadow`],
        [`Mistakes: leaving old nodes referenced by listeners (leaks), building a huge static graph for long lists, modifying the children list while iterating it, and relying on node sizes before layout has run. Use virtualization and listen for layout bounds changes.`,
            r`Platform.runLater(() -> System.out.println(node.getLayoutBounds().getWidth()));     // after the first layout pass
// virtualized list instead of 10,000 Label nodes
ListView<String> list = new ListView<>(FXCollections.observableArrayList(names));

// OUTPUT:
// 10,000 items shown with about 20 cell nodes`],
        [`Rendering cost scales with node count and effects. Cache complex static nodes, avoid large blur or shadow effects on animated nodes, and use Canvas for very many simple primitives.`,
            r`node.setCache(true); node.setCacheHint(CacheHint.SPEED);
Canvas canvas = new Canvas(800, 600);
GraphicsContext gc = canvas.getGraphicsContext2D();
for (Point p : points) gc.fillOval(p.x, p.y, 2, 2);

// OUTPUT:
// 100,000 dots drawn on a Canvas at 60 fps; as Circle nodes it would be a few fps`],
        [`Real-world: a dashboard with tiles. Each tile is a small component node; tiles are added and removed as widgets are configured, and all listeners are removed when a tile is closed.`,
            r`public class Tile extends VBox implements AutoCloseable {
    private final ChangeListener<Number> l = (o, a, b) -> refresh(b.intValue());
    Tile(IntegerProperty source) { source.addListener(l); this.source = source; }
    @Override public void close() { source.removeListener(l); }
}

// OUTPUT:
// closed tiles can be garbage collected because no listener references them`]
    ),

    'javafx-layouts': dv(
        [`A Region calculates three sizes: minimum, preferred and maximum. A parent asks each child for its preferred size, gives it space according to constraints (grow/shrink priorities, alignment, margins), then calls layout recursively. This is why layouts adapt when the window resizes or content changes.`,
            r`HBox box = new HBox(10);
TextField search = new TextField();
Button go = new Button("Go");
HBox.setHgrow(search, Priority.ALWAYS);              // search takes the leftover width
box.getChildren().addAll(search, go);
box.setPadding(new Insets(8));
System.out.println(box.prefWidth(-1));

// OUTPUT:
// 248.0      (preferred width from the children plus spacing and padding)`],
        [`Panes: <code>VBox/HBox</code>, <code>BorderPane</code>, <code>GridPane</code> (row/column spans and constraints), <code>StackPane</code>, <code>FlowPane</code>, <code>TilePane</code>, <code>AnchorPane</code>, <code>SplitPane</code>, <code>TabPane</code>, <code>ScrollPane</code>. Controls: ListView, TableView, TreeView, ComboBox, DatePicker, Spinner, Slider.`,
            r`SplitPane split = new SplitPane(new ListView<>(items), new TextArea());
split.setDividerPositions(0.3);
TabPane tabs = new TabPane(new Tab("Orders", ordersTable), new Tab("Customers", customersTable));
tabs.getTabs().forEach(t -> t.setClosable(false));
ScrollPane scroll = new ScrollPane(form); scroll.setFitToWidth(true);

// OUTPUT:
// resizable split view with a tabbed area and a scrollable form`],
        [`Mistakes: fixed pixel sizes (breaks on high-DPI or resize), nesting many panes needlessly, blocking the UI while populating a TableView with a huge list, and forgetting cell factories for custom rendering. Let panes grow, keep nesting shallow and use cell factories.`,
            r`TableColumn<Order, BigDecimal> total = new TableColumn<>("Total");
total.setCellValueFactory(c -> c.getValue().totalProperty());
total.setCellFactory(col -> new TableCell<>() {
    @Override protected void updateItem(BigDecimal v, boolean empty) { super.updateItem(v, empty); setText(empty || v == null ? null : String.format("%,.2f", v)); }
});

// OUTPUT:
// totals shown as 1,200.00`],
        [`TableView and ListView virtualize cells: only visible rows are created. Keep cell updateItem cheap (no I/O), use properties, and apply sorting/filtering with SortedList and FilteredList over the observable list.`,
            r`FilteredList<Order> filtered = new FilteredList<>(orders, o -> true);
SortedList<Order> sorted = new SortedList<>(filtered);
sorted.comparatorProperty().bind(table.comparatorProperty());
table.setItems(sorted);
search.textProperty().addListener((o, a, q) -> filtered.setPredicate(x -> x.customer().toLowerCase().contains(q.toLowerCase())));

// OUTPUT:
// typing in the search box filters the table instantly without rebuilding it`],
        [`Real-world: an order entry screen using FXML for structure, a controller for logic, CSS for theming, and validation that enables the Save button only when the form is valid.`,
            r`BooleanBinding valid = name.textProperty().isNotEmpty().and(Bindings.createBooleanBinding(() -> email.getText().matches("[^@]+@[^@]+"), email.textProperty()));
save.disableProperty().bind(valid.not());

// OUTPUT:
// Save is enabled only when a name and a valid-looking email are entered`]
    ),

    'javafx-events': dv(
        [`When you click, JavaFX picks the target node by hit testing, builds the event dispatch chain from the scene root to the target, runs event filters on the way down (capture), then handlers on the way back up (bubble). Handlers run on the Application Thread. A consumed event stops further propagation.`,
            r`root.addEventFilter(MouseEvent.MOUSE_CLICKED, e -> System.out.println("filter root"));
parent.addEventHandler(MouseEvent.MOUSE_CLICKED, e -> System.out.println("handler parent"));
button.setOnMouseClicked(e -> { System.out.println("handler button"); });

// OUTPUT: (clicking the button)
// filter root
// handler button
// handler parent`],
        [`Event types: ActionEvent, MouseEvent, KeyEvent, ScrollEvent, TouchEvent, DragEvent, WindowEvent, plus custom events. Tools: <code>setOnXxx</code> convenience methods, <code>addEventHandler/Filter</code>, accelerators (<code>scene.getAccelerators()</code>), drag and drop, property listeners and bindings.`,
            r`scene.getAccelerators().put(new KeyCodeCombination(KeyCode.S, KeyCombination.CONTROL_DOWN), this::save);
label.setOnDragDetected(e -> { Dragboard db = label.startDragAndDrop(TransferMode.COPY); ClipboardContent c = new ClipboardContent(); c.putString(label.getText()); db.setContent(c); e.consume(); });
stage.setOnCloseRequest(e -> { if (dirty && !confirm("Discard changes?")) e.consume(); });

// OUTPUT:
// Ctrl+S saves; labels can be dragged; closing a dirty window asks first`],
        [`Mistakes: blocking handlers, forgetting to remove listeners from long-lived objects, doing UI changes from non-UI threads, anonymous classes capturing the enclosing window, and handlers that throw (the exception ends in the default handler). Use Tasks, remove listeners and handle exceptions.`,
            r`button.setOnAction(e -> Thread.sleep(5000));       // freezes the window for 5 seconds
button.setOnAction(e -> CompletableFuture.supplyAsync(this::slow).thenAccept(v -> Platform.runLater(() -> label.setText(v))));

// OUTPUT:
// the second form keeps the UI responsive`],
        [`Event handling cost is small, but handlers that trigger layout (changing text and sizes repeatedly) or rebuild large parts of the scene are expensive. Batch updates, debounce frequent events such as typing or resizing.`,
            r`PauseTransition debounce = new PauseTransition(Duration.millis(250));
search.textProperty().addListener((o, a, q) -> { debounce.setOnFinished(e -> runSearch(q)); debounce.playFromStart(); });

// OUTPUT:
// one search 250 ms after the user stops typing`],
        [`Real-world: a form with validation feedback. Property listeners validate on change, a binding enables the submit button, and the submit handler runs the network call in a Task with progress and error handling.`,
            r`Task<Void> submit = new Task<>() { protected Void call() { api.save(form.toDto()); return null; } };
progress.visibleProperty().bind(submit.runningProperty());
submit.setOnSucceeded(e -> status.setText("Saved"));
submit.setOnFailed(e -> new Alert(Alert.AlertType.ERROR, submit.getException().getMessage()).show());
saveButton.setOnAction(e -> new Thread(submit).start());

// OUTPUT:
// progress shown while saving; success or error shown without freezing the form`]
    )
};
