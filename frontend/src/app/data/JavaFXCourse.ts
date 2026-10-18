// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const JavaFXCourse: Course[] = [
    {
        id: 'javafx',
        name: 'JavaFX',
        icon: 'Layers',
        subTopics: [
            {
                id: 'javafx-basics',
                name: 'JavaFX Fundamentals',
                topics: [
                    {
                        id: 'javafx-intro',
                        name: 'Introduction to JavaFX',
                        beginner: [
                            {
                                content: `<h3>What is JavaFX?</h3>
• JavaFX is Java's modern toolkit for building desktop GUI applications, and is the successor to the older Swing/AWT toolkits.<br>
• A JavaFX app is structured around three core concepts:<br>
1. <strong>Stage</strong> - the top-level window (like a JFrame in Swing).<br>
2. <strong>Scene</strong> - the content container placed inside a Stage.<br>
3. <strong>Scene Graph</strong> - a tree of Nodes (buttons, labels, layouts) that make up the Scene's content.<br>
• Every JavaFX application extends the <code>Application</code> class and overrides <code>start(Stage primaryStage)</code>.<br>`,
                                codeExamples: [
                                    `import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

public class HelloJavaFX extends Application {

    @Override
    public void start(Stage primaryStage) {
        Label label = new Label("Hello, JavaFX!");
        StackPane root = new StackPane(label);
        Scene scene = new Scene(root, 300, 200);

        primaryStage.setTitle("My First JavaFX App");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args); // bootstraps the JavaFX runtime and calls start()
    }
}
// OUTPUT: A 300x200 window titled "My First JavaFX App" showing centered text "Hello, JavaFX!"`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'javafx-scene-graph',
                        name: 'Scene Graph & Stage Lifecycle',
                        beginner: [
                            {
                                content: `<h4>Understanding the Scene Graph</h4>
The scene graph is a hierarchical tree of <code>Node</code> objects. Container nodes (like <code>VBox</code>, <code>HBox</code>) can hold child nodes, forming a parent-child tree - similar in spirit to the DOM in a web page. Each node can only appear ONCE in the scene graph at a time.<br>`,
                                codeExamples: [
                                    `import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class SceneGraphDemo extends Application {
    @Override
    public void start(Stage stage) {
        Label title = new Label("Scene Graph Example");
        Button button = new Button("Click Me");

        VBox root = new VBox(10, title, button); // 10px spacing between children
        root.setPadding(new Insets(20));

        stage.setScene(new Scene(root, 250, 150));
        stage.setTitle("Scene Graph");
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
// OUTPUT: A window with a label stacked above a button, both padded and spaced within a VBox`
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'javafx-ui',
                name: 'JavaFX UI & Events',
                topics: [
                    {
                        id: 'javafx-layouts',
                        name: 'Layouts & Controls',
                        beginner: [
                            {
                                content: `<h3>Common Layout Panes</h3>
JavaFX ships several layout containers that automatically arrange their children:<br>
• <code>VBox</code> / <code>HBox</code> - vertical / horizontal stacking.<br>
• <code>BorderPane</code> - top, bottom, left, right, and center regions.<br>
• <code>GridPane</code> - rows and columns, like an HTML table.<br>
• <code>StackPane</code> - layers children on top of one another (centered by default).<br>`,
                                codeExamples: [
                                    `import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.GridPane;
import javafx.stage.Stage;

public class LoginFormDemo extends Application {
    @Override
    public void start(Stage stage) {
        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20));

        grid.add(new Label("Username:"), 0, 0);
        grid.add(new TextField(), 1, 0);
        grid.add(new Label("Password:"), 0, 1);
        grid.add(new TextField(), 1, 1);
        grid.add(new Button("Login"), 1, 2);

        stage.setScene(new Scene(grid, 300, 150));
        stage.setTitle("Login Form");
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
// OUTPUT: A neatly aligned login form with labels and input fields laid out in a grid`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'javafx-events',
                        name: 'Event Handling',
                        beginner: [
                            {
                                content: `<h3>Handling User Events</h3>
JavaFX controls expose <code>setOn&lt;EventType&gt;()</code> methods to attach an event handler - most commonly implemented with a lambda expression since Java 8.<br>`,
                                codeExamples: [
                                    `import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class ButtonClickDemo extends Application {
    @Override
    public void start(Stage stage) {
        Label result = new Label("Count: 0");
        Button button = new Button("Increment");

        int[] count = {0}; // effectively-final workaround to mutate inside the lambda
        button.setOnAction(event -> {
            count[0]++;
            result.setText("Count: " + count[0]);
        });

        VBox root = new VBox(10, button, result);
        stage.setScene(new Scene(root, 200, 120));
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
// OUTPUT: Clicking "Increment" updates the label to show the running count`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>Property Binding</h4>
JavaFX controls expose their state as <code>Property</code> objects (e.g. <code>textProperty()</code>). Binding one property to another keeps them automatically synchronized - no manual event-listener wiring needed.<br>`,
                                codeExamples: [
                                    `import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.Slider;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class BindingDemo extends Application {
    @Override
    public void start(Stage stage) {
        Slider slider = new Slider(0, 100, 50);
        Label valueLabel = new Label();

        // Automatically keeps the label text in sync with the slider value
        valueLabel.textProperty().bind(slider.valueProperty().asString("Value: %.0f"));

        VBox root = new VBox(10, slider, valueLabel);
        stage.setScene(new Scene(root, 250, 100));
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
// OUTPUT: Dragging the slider updates "Value: NN" live, with no explicit event listener written`
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        cheatNotes: [
            'Application - Base class every JavaFX app extends',
            'start(Stage) - Entry point method JavaFX calls after launch()',
            'Stage - The top-level window of a JavaFX application',
            'Scene - The container of content placed inside a Stage',
            'Scene Graph - Tree of Node objects that make up a Scene\'s visual content',
            'Node - Base class for anything visual: buttons, labels, panes, shapes',
            'VBox / HBox - Stack children vertically / horizontally',
            'BorderPane - Layout with top/bottom/left/right/center regions',
            'GridPane - Row-and-column layout, like an HTML table',
            'StackPane - Layers children on top of each other',
            'setOnAction() - Attaches a click handler to a control like Button',
            'Property (e.g. textProperty()) - Observable, bindable wrapper around a value',
            'bind() - Keeps one property automatically synced with another',
            'FXML - XML-based markup for declaring JavaFX UIs separately from Java code',
            'CSS styling - JavaFX supports CSS stylesheets for theming controls',
            'launch(args) - Bootstraps the JavaFX runtime and calls start()',
            'Platform.runLater() - Schedules code to run on the JavaFX Application Thread',
        ],
        interviewQuestions: [
            {
                company: 'General JavaFX Interview',
                questions: [
                    'What is the relationship between Stage, Scene, and the Scene Graph?',
                    'What is the difference between JavaFX and Swing?',
                    'How do you handle a button click event in JavaFX?',
                    'What is property binding in JavaFX and why is it useful?',
                    'What is FXML and how does it relate to Java code?',
                    'What is the JavaFX Application Thread, and why does Platform.runLater() exist?'
                ]
            }
        ]
    }
];
