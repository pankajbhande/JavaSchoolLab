import type { Course } from './types';

// Extra interview question groups for the JavaFX course, shown next to the original "General JavaFX Interview" list.
export const javaFxInterviewGroups: Course['interviewQuestions'] = [
  {
    company: 'JavaFX Fundamentals and Lifecycle',
    questions: [
      'What is JavaFX and how is it different from Swing and AWT?',
      'Explain init(), start(Stage) and stop(). On which thread does each run?',
      'What is the difference between Stage and Scene, and what is the scene graph?',
      'Why does a Node have only one parent?',
      'Why do you get "JavaFX runtime components are missing" and how do you fix it?',
      'How do you add JavaFX to a Maven or Gradle project, and why are the jars platform specific?',
      'What do Prism, Glass and Quantum do in the JavaFX architecture?',
      'How do you embed Swing in JavaFX and JavaFX in Swing?',
    ],
  },
  {
    company: 'Layouts, Controls and Events',
    questions: [
      'When would you use HBox, VBox, BorderPane, GridPane, StackPane, FlowPane and AnchorPane?',
      'How do you make a node fill remaining space in an HBox or GridPane?',
      'What is the difference between padding, margin and spacing?',
      'How do you build a responsive layout in JavaFX?',
      'Explain event capturing and bubbling. Where do filters and handlers run?',
      'What is the difference between setOnAction and addEventHandler?',
      'How do you create and fire a custom event?',
      'Why does a key handler on a Pane sometimes not fire?',
    ],
  },
  {
    company: 'Properties, Binding and FXML',
    questions: [
      'What is a JavaFX property and how does it differ from a plain field?',
      'Unidirectional vs bidirectional binding. What happens if you set() a bound property?',
      'ChangeListener vs InvalidationListener: which is lazy and why does it matter?',
      'How can listeners cause memory leaks and how do you avoid them?',
      'What is an extractor on an ObservableList?',
      'What is the order: constructor, @FXML injection, initialize()?',
      'Why is my @FXML field null? List the possible causes.',
      'How do two FXML controllers communicate without static references?',
      'What does fx:root do and when would you use it?',
      'What must module-info.java contain for FXML controllers?',
    ],
  },
  {
    company: 'TableView, Cells and CSS',
    questions: [
      'How does TableView display data and why is it fast with many rows?',
      'PropertyValueFactory vs a lambda cell value factory: trade-offs?',
      'How do you filter and sort a TableView at the same time?',
      'Why must updateItem handle the empty case in a custom cell?',
      'How do you make a table editable and validate the new value?',
      'How is JavaFX CSS different from web CSS? What is the -fx- prefix?',
      'What is the precedence of inline styles, scene stylesheets and the default Modena stylesheet?',
      'How do you implement dark mode and custom pseudo-classes?',
    ],
  },
  {
    company: 'Concurrency and Background Work',
    questions: [
      'What is the JavaFX Application Thread and why must long tasks not run on it?',
      'What does Platform.runLater do and what are its pitfalls?',
      'Task vs Service vs ScheduledService: when do you use each?',
      'How do you report progress, support cancellation and handle exceptions in a Task?',
      'How do you combine CompletableFuture with the FX thread?',
      'How do you stop updates flooding the FX thread?',
      'How do you implement search-as-you-type without showing stale results?',
      'What makes an application not exit after the last window closes?',
    ],
  },
  {
    company: 'Data, Spring Boot Integration and Architecture',
    questions: [
      'How do you run JDBC safely from a JavaFX application?',
      'Why use PreparedStatement and a connection pool in a desktop application?',
      'How do you integrate JavaFX with Spring Boot? Where is the context started?',
      'Why are FXML controllers prototype scoped when managed by Spring?',
      'How do you pass JPA entities to the UI without LazyInitializationException?',
      'How do you structure a JavaFX application with MVVM?',
      'How do you design an offline-capable desktop client with a sync outbox?',
      'How do you secure REST calls from a desktop client?',
    ],
  },
  {
    company: 'Testing, Performance and Deployment',
    questions: [
      'How do you unit test JavaFX code? What belongs in a view model?',
      'What is TestFX and how do you run UI tests on a CI server?',
      'How do you find and fix a memory leak in a JavaFX application?',
      'How do you diagnose a frozen UI?',
      'What is the difference between jlink and jpackage?',
      'Why can jpackage not build a Windows installer on Linux?',
      'What are the steps to sign a desktop application, and why does macOS need notarisation?',
      'How do you ship updates to desktop users?',
    ],
  },
];
