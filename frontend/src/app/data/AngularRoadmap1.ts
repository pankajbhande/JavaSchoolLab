// Angular roadmap, part 1: the roadmap overview and sections 1-4 (fundamentals, TypeScript, components and templates, directives and pipes).
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const ng = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('ng', n, title, priority, topics);

export const angularRoadmap1: SubTopic[] = [
  {
    id: 'ng-roadmap',
    name: 'Angular Roadmap (13 Sections, 128 Topics)',
    topics: [
      topic(
        'ng-roadmap-overview',
        'Angular Important Topics Checklist (128 Topics)',
        [
          blk(`<h3>How the roadmap is organised</h3>
• The 128 important Angular topics are grouped into <b>13 sections</b>. Each section is a module of this course, with worked examples and interview questions. Sections marked <b>Essential</b> (TypeScript, Services and DI, HTTP and APIs, Advanced Angular) carry the most weight for a Java developer moving to Angular.<br>
• The code uses <b>modern Angular</b>: standalone components, signals, the <code>@if</code>/<code>@for</code> control flow, <code>inject()</code>, functional guards and interceptors, <code>@defer</code>.<br>
<table ${TABLE}>
<tr><th>Section</th><th>Topics</th><th>Items</th><th>Priority</th></tr>
<tr><td>1</td><td>Angular Fundamentals</td><td>1-10</td><td>Core</td></tr>
<tr><td>2</td><td>TypeScript Fundamentals</td><td>11-18</td><td>Essential</td></tr>
<tr><td>3</td><td>Components and Templates</td><td>19-28</td><td>Core</td></tr>
<tr><td>4</td><td>Directives and Pipes</td><td>29-36</td><td>Core</td></tr>
<tr><td>5</td><td>Services and Dependency Injection</td><td>37-43</td><td>Essential</td></tr>
<tr><td>6</td><td>Routing</td><td>44-53</td><td>Core</td></tr>
<tr><td>7</td><td>Forms</td><td>54-62</td><td>Core</td></tr>
<tr><td>8</td><td>HTTP and API Integration</td><td>63-72</td><td>Essential</td></tr>
<tr><td>9</td><td>RxJS and Reactive Programming</td><td>73-88</td><td>Core</td></tr>
<tr><td>10</td><td>Advanced Angular</td><td>89-100</td><td>Essential</td></tr>
<tr><td>11</td><td>State Management</td><td>101-108</td><td>Core</td></tr>
<tr><td>12</td><td>Security and Performance</td><td>109-118</td><td>Production</td></tr>
<tr><td>13</td><td>Testing and Deployment</td><td>119-128</td><td>Production</td></tr>
</table>`),
        ],
        [
          blk(`<h3>Most important topics for Java developers: the learning order</h3>
1. TypeScript fundamentals<br>
2. Components and data binding<br>
3. Directives and pipes<br>
4. Services and dependency injection<br>
5. Routing and guards<br>
6. Reactive forms<br>
7. RxJS and Observables<br>
8. HTTP client and REST APIs<br>
9. Signals and change detection<br>
10. Authentication and authorization<br>
11. Performance optimization<br>
12. Testing and deployment<br>
<br>
<b>Recommended stack:</b> Angular + TypeScript + RxJS + Java Spring Boot + PostgreSQL/MySQL.<br>
Official documentation: angular.dev.`),
        ],
        [
          blk(`<h3>Why Java developers adapt quickly to Angular</h3>
• Angular is class-based and strongly typed (TypeScript), with <b>dependency injection</b>, decorators (similar to Java annotations), modules/imports and a layered structure (components, services, models). The mental model of a Spring Boot application maps directly: <code>@Component</code> ≈ a view controller, <code>@Injectable</code> service ≈ <code>@Service</code>, <code>HttpClient</code> ≈ <code>RestTemplate</code>/<code>WebClient</code>, guards ≈ Spring Security filters (for the UI only).<br>
• The differences to learn first: asynchronous code with Observables and signals, immutability of state, and that <b>the browser is untrusted</b>, so authorisation must always be enforced by Spring Boot.`),
        ],
        [
          ['Which Angular topics matter most for a Java developer?', 'TypeScript, components and data binding, services and dependency injection, routing and guards, reactive forms, RxJS and HttpClient for REST APIs, signals and change detection, then authentication, performance, testing and deployment.'],
          ['What is the recommended stack for Angular with a Java back end?', 'Angular with TypeScript and RxJS on the front end, Spring Boot REST APIs on the server, and PostgreSQL or MySQL for data.'],
        ],
      ),
    ],
  },

  ng(1, 'Angular Fundamentals', 'Core', [
    topic(
      'ng-architecture',
      'Introduction, Architecture and Angular vs React',
      [
        blk(`<h3>What Angular is</h3>
• <b>Angular</b> is Google's open-source, TypeScript-based framework for single-page applications. It is a <b>complete platform</b>: components, templates, dependency injection, routing, forms, HTTP client, animations, testing utilities and a CLI, all designed to work together.<br>
• Not to be confused with <b>AngularJS</b> (1.x, JavaScript, end of life). Modern Angular (2+) releases twice a year and has moved to <b>standalone components</b> and <b>signals</b>.<br>
• An Angular app is a tree of <b>components</b> that render templates, get logic and data from <b>services</b> injected by the <b>DI system</b>, and navigate with the <b>router</b>.`,
          `// main.ts : the entry point bootstraps the root component
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));

// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<h1>Hello, {{ title }}!</h1>',
})
export class AppComponent {
  title = 'JavaSchoolLab';
}`,
        ),
      ],
      [
        blk(`<h3>The building blocks</h3>
<table ${TABLE}>
<tr><th>Block</th><th>Role</th><th>Java/Spring analogy</th></tr>
<tr><td>Component</td><td>View + logic for one part of the UI</td><td>Controller + view template</td></tr>
<tr><td>Template</td><td>HTML with bindings, directives and control flow</td><td>Thymeleaf/JSP page</td></tr>
<tr><td>Directive / Pipe</td><td>Change DOM behaviour / format values</td><td>Tag library / formatter</td></tr>
<tr><td>Service</td><td>Reusable logic and data access</td><td><code>@Service</code> bean</td></tr>
<tr><td>Dependency Injection</td><td>Provides services to classes</td><td>Spring IoC container</td></tr>
<tr><td>Router</td><td>Maps URLs to components</td><td><code>@RequestMapping</code></td></tr>
<tr><td>HttpClient</td><td>Calls REST APIs</td><td><code>RestTemplate</code> / <code>WebClient</code></td></tr>
<tr><td>Guard / Interceptor</td><td>Route protection / request pipeline</td><td>Security filter / servlet filter</td></tr>
</table>
• Data flows <b>down</b> through inputs and <b>up</b> through outputs; shared state lives in services (or a store).`),
      ],
      [
        blk(`<h3>Angular vs React</h3>
<table ${TABLE}>
<tr><th>Aspect</th><th>Angular</th><th>React</th></tr>
<tr><td>Kind</td><td>Full framework</td><td>UI library</td></tr>
<tr><td>Language</td><td>TypeScript (required)</td><td>JavaScript or TypeScript</td></tr>
<tr><td>Templates</td><td>HTML templates with directives</td><td>JSX in JavaScript</td></tr>
<tr><td>Reactivity</td><td>Signals, RxJS, change detection</td><td>State + re-render, hooks</td></tr>
<tr><td>DI</td><td>Built in</td><td>Context or libraries</td></tr>
<tr><td>Routing/Forms/HTTP</td><td>Official packages</td><td>Third-party choices</td></tr>
<tr><td>Structure</td><td>Opinionated, consistent across teams</td><td>Flexible, you decide</td></tr>
<tr><td>Fits</td><td>Large enterprise teams, Java/.NET backgrounds</td><td>Flexible products, huge ecosystem</td></tr>
</table>
• Angular's consistency is a strength in big teams; React's flexibility is a strength in small ones. Both are production-proven.`),
      ],
      [
        ['Is Angular a framework or a library?', 'A framework: it provides components, templates, DI, routing, forms, HTTP and tooling out of the box, in an opinionated structure.'],
        ['What is the difference between AngularJS and Angular?', 'AngularJS (1.x) was JavaScript with controllers and scopes and is end of life. Angular (2+) is a TypeScript, component-based rewrite with DI, AOT compilation, standalone components and signals.'],
        ['How does Angular differ from React?', 'Angular is an all-in-one, opinionated framework in TypeScript with HTML templates and built-in DI, routing, forms and HTTP; React is a view library using JSX where you choose the surrounding tools.'],
      ],
    ),
    topic(
      'ng-cli-structure',
      'Angular CLI and Project Structure',
      [
        blk(`<h3>The Angular CLI</h3>
• Install Node.js (LTS), then <code>npm install -g @angular/cli</code>. The CLI (<code>ng</code>) creates, builds, tests and serves projects and generates code.<br>
• Key commands: <code>ng new app</code>, <code>ng serve</code> (dev server on http://localhost:4200 with live reload), <code>ng generate component|service|pipe|directive|guard</code> (<code>ng g c ...</code>), <code>ng build</code>, <code>ng test</code>, <code>ng update</code>, <code>ng add</code>.`,
          `# create and run
npm install -g @angular/cli
ng new course-portal --style=scss --routing --ssr=false
cd course-portal
ng serve --open                      # http://localhost:4200

# generate code (each creates .ts, .html, .scss, .spec.ts)
ng generate component courses/course-list
ng generate service core/course
ng generate pipe shared/time-ago
ng generate guard core/auth
ng generate interceptor core/auth

ng build --configuration production  # optimised output in dist/
ng test                              # unit tests
ng update @angular/core @angular/cli # upgrade versions`,
        ),
      ],
      [
        blk(`<h3>Project structure</h3>
• <code>src/main.ts</code> bootstraps the app; <code>src/index.html</code> holds <code>&lt;app-root&gt;</code>; <code>src/app/app.config.ts</code> declares application-wide providers (router, HttpClient); <code>app.routes.ts</code> the routes.<br>
• <code>angular.json</code> configures builds; <code>tsconfig.json</code> TypeScript (turn on <code>strict</code>); <code>package.json</code> scripts and dependencies; <code>src/environments</code> or build-time config for environment values; <code>public/</code> (or <code>assets/</code>) static files.<br>
• Organise by <b>feature</b>, not by file type.`,
          `course-portal/
├─ angular.json
├─ package.json
├─ tsconfig.json
├─ public/                      # static files (favicon, images)
└─ src/
   ├─ index.html                # <app-root></app-root>
   ├─ main.ts                   # bootstrapApplication(...)
   ├─ styles.scss               # global styles
   └─ app/
      ├─ app.component.ts       # root component
      ├─ app.config.ts          # providers: router, http client, interceptors
      ├─ app.routes.ts          # route table
      ├─ core/                  # singletons: auth service, interceptors, guards
      ├─ shared/                # reusable components, pipes, directives
      └─ features/
         ├─ courses/            # course-list, course-detail, course.service.ts, course.model.ts
         └─ account/

// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};`,
        ),
      ],
      [
        blk(`<h3>Build, configuration and tooling</h3>
• <code>ng serve</code> uses the esbuild/Vite based builder (fast rebuilds); <code>ng build</code> produces hashed, tree-shaken bundles with <b>AOT</b> (ahead-of-time) compilation: templates are compiled at build time, so the browser does less work and template errors appear at build time.<br>
• <b>Strict mode</b> (<code>"strict": true</code>, <code>strictTemplates</code>) catches template type errors early. Keep it on.<br>
• Add ESLint (<code>ng add @angular-eslint/schematics</code>), Prettier, and optionally Angular Material (<code>ng add @angular/material</code>).<br>
• <b>Schematics</b> automate repetitive code and upgrades: <code>ng add</code> installs a library and wires it up.`,
          `// tsconfig.json (strict settings are the default in new projects)
// {
//   "compilerOptions": { "strict": true, "noImplicitOverride": true, "noPropertyAccessFromIndexSignature": true },
//   "angularCompilerOptions": { "strictInjectionParameters": true, "strictTemplates": true }
// }

// angular.json: production budgets warn when bundles get too big
// "budgets": [
//   { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
//   { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
// ]

// package.json scripts
// "start": "ng serve", "build": "ng build", "test": "ng test", "lint": "ng lint"`,
        ),
      ],
      [
        ['What does ng serve do?', 'Builds the app in development mode, starts a dev server (default port 4200) and rebuilds and reloads the browser when source files change.'],
        ['What is AOT compilation?', 'Ahead-of-time compilation converts Angular templates and decorators into JavaScript at build time. It makes the app start faster, reports template errors during the build and allows better tree shaking.'],
        ['How should an Angular project be organised?', 'By feature (courses, account), with a core folder for singletons (auth, interceptors, guards) and a shared folder for reusable components, directives and pipes.'],
      ],
    ),
    topic(
      'ng-basics-overview',
      'Components, Templates, Data Binding, Directives and Pipes: Overview',
      [
        blk(`<h3>A first component</h3>
• A <b>component</b> is a TypeScript class decorated with <code>@Component</code>, which connects it to an HTML <b>template</b> and styles. The <code>selector</code> is the custom HTML tag you use to place it.<br>
• <b>Standalone</b> components (the default in modern Angular) list what they use in <code>imports</code>; no NgModule is needed.<br>
• Create one with <code>ng g c courses/course-card</code>.`,
          `// course-card.component.ts
import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
})
export class CourseCardComponent {
  title = input.required<string>();
  price = input<number>(0);
}

// course-card.component.html
// <article class="card">
//   <h3>{{ title() }}</h3>
//   <p>{{ price() | currency: 'INR' }}</p>
// </article>

// usage in a parent template:
// <app-course-card title="Angular Essentials" [price]="1999" />`,
        ),
      ],
      [
        blk(`<h3>The four kinds of data binding</h3>
<table ${TABLE}>
<tr><th>Direction</th><th>Syntax</th><th>Example</th></tr>
<tr><td>Component to view</td><td><code>{{ }}</code> interpolation</td><td><code>&lt;h1&gt;{{ title }}&lt;/h1&gt;</code></td></tr>
<tr><td>Component to view</td><td><code>[property]</code></td><td><code>&lt;img [src]="course.imageUrl"&gt;</code></td></tr>
<tr><td>View to component</td><td><code>(event)</code></td><td><code>&lt;button (click)="enroll()"&gt;</code></td></tr>
<tr><td>Both ways</td><td><code>[(ngModel)]</code> / <code>[(model)]</code></td><td><code>&lt;input [(ngModel)]="name"&gt;</code></td></tr>
</table>
• <b>Directives</b> add behaviour to elements (<code>@if</code>, <code>@for</code>, <code>[ngClass]</code>); <b>pipes</b> format values in templates (<code>{{ price | currency }}</code>).`,
          `// enroll.component.ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-enroll',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, UpperCasePipe],
  templateUrl: './enroll.component.html',
})
export class EnrollComponent {
  name = '';
  price = 1999;
  today = new Date();
  enrolled = signal(false);
  enroll() { this.enrolled.set(true); }
}

// enroll.component.html
// <h2>Enroll, {{ name | uppercase }}</h2>
// <input [(ngModel)]="name" placeholder="Your name">                 <!-- two-way -->
// <p>Fee: {{ price | currency: 'INR' }} on {{ today | date: 'longDate' }}</p>
// <button (click)="enroll()" [disabled]="!name">Enroll</button>      <!-- event + property binding -->
// @if (enrolled()) { <p class="ok">Welcome aboard!</p> }`,
        ),
      ],
      [
        blk(`<h3>How a template becomes a page</h3>
• Templates are compiled (AOT) into JavaScript instructions that create and update DOM nodes. Angular checks bindings during <b>change detection</b> and updates only what changed.<br>
• Template expressions should be <b>simple, side-effect free and fast</b>: they run often. Avoid calling expensive methods in templates; use signals, <code>computed()</code> or pure pipes instead.<br>
• Reserved characters: use <code>@if</code>/<code>@for</code> blocks (control flow) instead of <code>*ngIf</code>/<code>*ngFor</code> in new code.`,
          `// Avoid: runs on every change detection pass
// <p>{{ expensiveTotal() }}</p>
// get expensiveTotal() { return this.items.reduce(...); }

// Prefer: cached and recomputed only when its inputs change
import { computed, signal } from '@angular/core';
items = signal<{ price: number }[]>([]);
total = computed(() => this.items().reduce((sum, i) => sum + i.price, 0));
// <p>{{ total() }}</p>`,
        ),
      ],
      [
        ['What is data binding in Angular?', 'The synchronisation between component data and the template: interpolation and property binding (component to view), event binding (view to component) and two-way binding with ngModel/model.'],
        ['What does a standalone component mean?', 'A component that declares its own template dependencies in its imports array and does not belong to an NgModule. It is the default in modern Angular.'],
        ['Why avoid calling methods in templates?', 'Template expressions are re-evaluated on every change detection pass, so expensive methods run repeatedly. Use signals, computed() or pure pipes so values are cached.'],
      ],
    ),
  ]),

  ng(2, 'TypeScript Fundamentals', 'Essential', [
    topic(
      'ng-ts-types-interfaces',
      'Variables, Data Types, Interfaces, Type Aliases and Generics',
      [
        blk(`<h3>Typed variables</h3>
• TypeScript is JavaScript plus <b>static types</b>, checked at compile time and erased in the output. Angular is written in it, so you cannot avoid it. For a Java developer it feels familiar.<br>
• Declare with <code>const</code> and <code>let</code>; annotate with <code>: type</code> or let <b>inference</b> work. Types: <code>string</code>, <code>number</code> (no int/double split), <code>boolean</code>, <code>bigint</code>, <code>null</code>, <code>undefined</code>, arrays (<code>string[]</code>), tuples, <code>enum</code>, <code>unknown</code> (safe), <code>any</code> (avoid), <code>void</code>, <code>never</code>.`,
          `const title: string = 'Angular';
let students: number = 120;
const tags: string[] = ['spa', 'typescript'];
const pair: [string, number] = ['price', 1999];        // tuple
enum Level { Beginner = 'BEGINNER', Advanced = 'ADVANCED' }
let level: Level = Level.Beginner;

let maybe: string | undefined;                         // union
maybe?.toUpperCase();                                  // optional chaining
const city = maybe ?? 'Pune';                          // nullish coalescing

function add(a: number, b: number): number { return a + b; }
// add('1', 2);  // Compile error: Argument of type 'string' is not assignable to 'number'

let data: unknown = JSON.parse('{"x":1}');
if (typeof data === 'object' && data !== null) console.log('object');`,
        ),
      ],
      [
        blk(`<h3>Interfaces and type aliases</h3>
• An <b>interface</b> describes the shape of an object (like a Java interface/DTO). Mark optional fields with <code>?</code> and immutable ones with <code>readonly</code>. Interfaces can <code>extends</code> others.<br>
• A <b>type alias</b> names any type: unions, intersections, literals, function types. Use interfaces for object models and type aliases for unions.<br>
• Interfaces and types exist only at compile time: they produce no runtime code.`,
          `export interface Course {
  readonly id: number;
  title: string;
  price: number;
  level: Level;
  tags?: string[];                      // optional
}
export interface FeaturedCourse extends Course { badge: string }

export type CourseId = number | string;
export type SortOrder = 'asc' | 'desc';                   // literal union
export type ApiResult<T> = { data: T; status: number };
export type Validator = (value: string) => string | null; // function type

const c: Course = { id: 1, title: 'Angular', price: 1999, level: Level.Beginner };
// c.id = 2;   // Error: Cannot assign to 'id' because it is a read-only property
const result: ApiResult<Course[]> = { data: [c], status: 200 };`,
        ),
      ],
      [
        blk(`<h3>Generics</h3>
• Generics (like Java's <code>&lt;T&gt;</code>) let a function, class or interface work with many types while keeping type safety. Angular uses them everywhere: <code>HttpClient.get&lt;Course[]&gt;()</code>, <code>Observable&lt;T&gt;</code>, <code>signal&lt;T&gt;()</code>, <code>FormControl&lt;string&gt;</code>.<br>
• Constrain with <code>extends</code>; use utility types: <code>Partial&lt;T&gt;</code>, <code>Required&lt;T&gt;</code>, <code>Readonly&lt;T&gt;</code>, <code>Pick</code>, <code>Omit</code>, <code>Record</code>.<br>
• Generics are <b>erased</b> at runtime (like Java's type erasure).`,
          `function firstOf<T>(items: T[]): T | undefined { return items[0]; }
const n = firstOf([1, 2, 3]);               // number | undefined
const s = firstOf(['a']);                   // string | undefined

interface Repository<T extends { id: number }> {
  findAll(): T[];
  findById(id: number): T | undefined;
  save(item: T): void;
}
class InMemoryRepository<T extends { id: number }> implements Repository<T> {
  private items = new Map<number, T>();
  findAll() { return [...this.items.values()]; }
  findById(id: number) { return this.items.get(id); }
  save(item: T) { this.items.set(item.id, item); }
}
const repo = new InMemoryRepository<Course>();
repo.save(c);

type CreateCourse = Omit<Course, 'id'>;                // payload without the server-generated id
type CourseUpdate = Partial<CreateCourse>;             // any subset for a PATCH`,
        ),
      ],
      [
        ['Interface vs type alias in TypeScript?', 'Both describe shapes. Interfaces can be extended and merged and suit object models; type aliases can also name unions, intersections, tuples and function types. Neither exists at runtime.'],
        ['any vs unknown?', 'any switches off type checking. unknown accepts any value but requires narrowing (typeof, instanceof) before use, so it stays type-safe.'],
        ['How do TypeScript generics compare with Java generics?', 'They serve the same purpose: reusable, type-safe code. Both are erased at runtime; TypeScript adds structural typing and rich utility types such as Partial and Pick.'],
      ],
    ),
    topic(
      'ng-ts-classes-oop',
      'Classes, Inheritance, Polymorphism and Access Modifiers',
      [
        blk(`<h3>Classes and objects</h3>
• TypeScript classes look like Java's: fields, a <code>constructor</code>, methods, getters/setters, <code>static</code> members. Create objects with <code>new</code>.<br>
• <b>Parameter properties</b> shorten constructors: <code>constructor(private name: string)</code> declares and assigns the field. Angular DI uses this heavily.<br>
• Class types are <b>structural</b>: any object with the same shape fits, no explicit <code>implements</code> is required.`,
          `class Course {
  private enrolled = 0;

  constructor(public readonly id: number, public title: string, protected price: number) {}

  get priceWithTax(): number { return Math.round(this.price * 1.18); }
  enroll(): void { this.enrolled++; }
  get seats(): number { return this.enrolled; }

  static free(title: string): Course { return new Course(0, title, 0); }
  toString(): string { return this.title + ' (' + this.priceWithTax + ')'; }
}

const c = new Course(1, 'Angular', 1999);
c.enroll();
console.log(c.seats, c.priceWithTax, String(c));   // 1 2359 Angular (2359)
console.log(Course.free('Intro').title);`,
        ),
      ],
      [
        blk(`<h3>Inheritance, polymorphism and abstract classes</h3>
• <code>extends</code> creates a subclass; <code>super(...)</code> calls the parent constructor; <code>override</code> (with <code>noImplicitOverride</code>) marks overridden methods. <b>Polymorphism</b>: a variable of the base type can hold any subclass and calls the overriding method.<br>
• <code>abstract</code> classes cannot be instantiated and may declare abstract methods; <code>implements</code> makes a class satisfy an interface (a class can implement several).<br>
• Prefer <b>composition</b> and services over deep hierarchies.`,
          `abstract class Notifier {
  constructor(protected readonly recipient: string) {}
  abstract send(message: string): string;
  describe(): string { return 'Notifier for ' + this.recipient; }
}
class EmailNotifier extends Notifier {
  override send(message: string) { return 'EMAIL to ' + this.recipient + ': ' + message; }
}
class SmsNotifier extends Notifier {
  override send(message: string) { return 'SMS to ' + this.recipient + ': ' + message; }
  override describe() { return super.describe() + ' (SMS)'; }
}

const notifiers: Notifier[] = [new EmailNotifier('a@b.com'), new SmsNotifier('9876543210')];
for (const n of notifiers) console.log(n.send('Course starts today'));   // polymorphic call

interface Printable { print(): void }
interface Exportable { export(format: 'pdf' | 'csv'): Blob }
class Report implements Printable, Exportable {
  print() { window.print(); }
  export(format: 'pdf' | 'csv') { return new Blob(['report'], { type: format }); }
}`,
        ),
      ],
      [
        blk(`<h3>Access modifiers</h3>
• <code>public</code> (default), <code>protected</code> (class and subclasses), <code>private</code> (class only), <code>readonly</code> (assign once). They are enforced by the <b>compiler only</b>.<br>
• True runtime privacy uses JavaScript's <code>#field</code> syntax. Angular components expose to the template only what the template needs: mark things used only in the class as <code>private</code>, and members used in the template as <code>protected</code> or <code>public</code>.<br>
• Convention: <code>private</code> fields for injected services (<code>private http = inject(HttpClient)</code>).`,
          `class Account {
  #pin = 1234;                         // real runtime privacy (ECMAScript private field)
  private balance = 0;                 // compile-time privacy only
  protected owner: string;
  readonly id = crypto.randomUUID();

  constructor(owner: string) { this.owner = owner; }
  deposit(amount: number) { if (amount <= 0) throw new RangeError('amount must be positive'); this.balance += amount; }
  checkPin(p: number) { return p === this.#pin; }
}
const a = new Account('Asha');
// a.balance;     // compile error: 'balance' is private
// a.#pin;        // syntax error: private field
(a as any).balance;                      // works at runtime: TypeScript private is not security

// In a component
// protected readonly title = 'Courses';      // available to the template, hidden from other classes
// private readonly courseService = inject(CourseService);`,
        ),
      ],
      [
        ['Is TypeScript private really private?', 'Only at compile time. The emitted JavaScript still has the property. Use #field for runtime privacy, and never rely on private for security.'],
        ['What are parameter properties?', 'A constructor shorthand: constructor(private name: string) declares a field and assigns it in one step. It is how Angular classes commonly receive injected services.'],
        ['Abstract class vs interface?', 'An interface only describes a contract and has no runtime code. An abstract class can contain shared implementation and state but cannot be instantiated; a class can extend one class but implement many interfaces.'],
      ],
    ),
    topic(
      'ng-ts-decorators-modules',
      'Decorators and Modules (import/export)',
      [
        blk(`<h3>Decorators: Java annotations for TypeScript</h3>
• A <b>decorator</b> is a function applied with <code>@name</code> to a class, property, method or parameter, adding metadata or behaviour. Angular's decorators are the equivalent of Java annotations: <code>@Component</code>, <code>@Injectable</code>, <code>@Directive</code>, <code>@Pipe</code>, <code>@NgModule</code>, and older <code>@Input</code>, <code>@Output</code>, <code>@ViewChild</code>, <code>@HostListener</code>.<br>
• Angular reads this metadata at build time (AOT) to wire templates, dependency injection and change detection.`,
          `import { Component, Directive, HostListener, Injectable, Pipe, PipeTransform } from '@angular/core';

@Injectable({ providedIn: 'root' })                       // class decorator: registers a service
export class LoggerService { log(m: string) { console.log('[app]', m); } }

@Component({ selector: 'app-badge', standalone: true, template: '<span>{{ text }}</span>' })
export class BadgeComponent { text = 'new'; }

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, max = 20): string { return value.length > max ? value.slice(0, max) + '...' : value; }
}

@Directive({ selector: '[appHoverHighlight]', standalone: true })
export class HoverHighlightDirective {
  @HostListener('mouseenter') onEnter() { console.log('hover'); }   // member decorator
}`,
        ),
      ],
      [
        blk(`<h3>Writing a simple decorator</h3>
• A decorator is just a function that receives the target (and context) and may replace or wrap it. Understanding this removes the mystery from <code>@Component</code>.<br>
• TypeScript 5 supports standard (ECMAScript) decorators; Angular uses its own compile-time handling, so you rarely write decorators yourself but you will read them constantly.`,
          `// A method decorator that logs calls (TypeScript 5 standard decorators)
function logCall<This, Args extends unknown[], R>(
  target: (this: This, ...args: Args) => R,
  context: ClassMethodDecoratorContext,
) {
  return function (this: This, ...args: Args): R {
    console.log('calling', String(context.name), args);
    return target.call(this, ...args);
  };
}

class Calculator {
  @logCall
  add(a: number, b: number) { return a + b; }
}
new Calculator().add(2, 3);        // logs: calling add [2, 3]`,
        ),
      ],
      [
        blk(`<h3>Modules: import and export</h3>
• Every <code>.ts</code> file with an <code>import</code>/<code>export</code> is an <b>ES module</b> with its own scope. Share with <code>export</code>; use with <code>import { X } from './x'</code>. <b>Default export</b> (<code>export default</code>) is possible but Angular code prefers <b>named exports</b>.<br>
• Paths: relative (<code>./</code>, <code>../</code>) or <b>path aliases</b> (<code>@app/core/auth</code>) configured in <code>tsconfig.json</code>. <b>Barrel files</b> (<code>index.ts</code>) re-export a folder's public API.<br>
• <code>import type { Course }</code> imports only types (erased).<br>
• <b>NgModule</b> (<code>@NgModule</code>) is the older Angular packaging system, different from ES modules; modern Angular uses standalone components and a component's own <code>imports</code> array instead. Do not confuse the two kinds of "import".`,
          `// course.model.ts
export interface Course { id: number; title: string }
export const DEFAULT_PAGE_SIZE = 10;

// features/courses/index.ts  (barrel)
export * from './course.model';
export { CourseService } from './course.service';

// somewhere else
import { Course, DEFAULT_PAGE_SIZE } from '@app/features/courses';
import type { Observable } from 'rxjs';

// tsconfig.json
// "paths": { "@app/*": ["src/app/*"] }

// Two different "imports" in a standalone component
import { DatePipe } from '@angular/common';             // ES module import (TypeScript)
@Component({
  standalone: true,
  imports: [DatePipe],                                   // Angular template dependency list
  template: '{{ today | date }}',
})
export class DemoComponent { today = new Date(); }`,
        ),
      ],
      [
        ['What is a decorator in Angular?', 'A function applied with @ that attaches metadata or behaviour to a class, property, method or parameter. Angular decorators such as @Component and @Injectable play the role of Java annotations.'],
        ['What is the difference between an ES module import and the imports array of a component?', 'The ES import loads the TypeScript symbol into the file. The component imports array tells Angular which components, directives and pipes the template may use. A standalone component needs both.'],
        ['What is a barrel file?', 'An index.ts that re-exports the public API of a folder so consumers import from one path instead of many deep file paths.'],
      ],
    ),
  ]),

  ng(3, 'Components and Templates', 'Core', [
    topic(
      'ng-component-binding',
      'Component Creation and Template Binding',
      [
        blk(`<h3>Interpolation and property binding</h3>
• <b>Interpolation</b> <code>{{ expression }}</code> renders a value as text (escaped, so safe from XSS). <b>Property binding</b> <code>[prop]="expr"</code> sets a DOM <em>property</em> (<code>[src]</code>, <code>[disabled]</code>, <code>[value]</code>, <code>[hidden]</code>) from an expression.<br>
• Attribute, class and style bindings: <code>[attr.aria-label]="label"</code>, <code>[class.active]="isActive"</code>, <code>[style.width.px]="width"</code>.<br>
• Use property binding, never interpolation, for non-string values such as booleans.`,
          `// profile.component.ts
@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  name = 'Asha';
  avatarUrl = '/assets/asha.png';
  isOnline = true;
  progress = 65;
  unreadLabel = '3 unread messages';
}

// profile.component.html
// <h2>Welcome, {{ name }}!</h2>
// <img [src]="avatarUrl" [alt]="name + ' avatar'">
// <span [class.online]="isOnline" [attr.aria-label]="unreadLabel">{{ isOnline ? 'Online' : 'Offline' }}</span>
// <div class="bar"><div [style.width.%]="progress"></div></div>
// <button [disabled]="!isOnline">Message</button>`,
        ),
      ],
      [
        blk(`<h3>Event binding and two-way binding</h3>
• <b>Event binding</b> <code>(event)="handler($event)"</code> calls a method when the DOM event fires: <code>(click)</code>, <code>(input)</code>, <code>(keyup.enter)</code>, <code>(submit)</code>. <code>$event</code> is the event object (or the emitted value for component outputs).<br>
• <b>Two-way binding</b> "banana in a box" <code>[(ngModel)]="name"</code> combines <code>[ngModel]</code> and <code>(ngModelChange)</code>; it requires <code>FormsModule</code>. Components support it with <code>model()</code> signals.<br>
• Read the typed value from the event safely: <code>(input)="onInput($any($event.target).value)"</code> or use a template reference variable (<code>#box</code>).`,
          `// search.component.ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search.component.html',
})
export class SearchComponent {
  query = '';
  results = signal<string[]>([]);
  private all = ['Angular', 'TypeScript', 'RxJS', 'Spring Boot'];

  search() { this.results.set(this.all.filter(x => x.toLowerCase().includes(this.query.toLowerCase()))); }
  clear() { this.query = ''; this.results.set([]); }
}

// search.component.html
// <input [(ngModel)]="query" (keyup.enter)="search()" placeholder="Search">   <!-- two-way + event -->
// <button (click)="search()">Go</button> <button (click)="clear()">Clear</button>
// <p>You typed: {{ query }}</p>
// <ul>@for (r of results(); track r) { <li>{{ r }}</li> }</ul>`,
        ),
      ],
      [
        blk(`<h3>Template syntax details</h3>
• <b>Template statements</b> (event handlers) can have side effects; <b>template expressions</b> (bindings) must not. No <code>new</code>, assignments (except in handlers), <code>++</code>, chaining with <code>;</code> in expressions.<br>
• Safe navigation <code>user?.address?.city</code>, non-null <code>user!.name</code> (type-only), nullish <code>??</code> work in templates.<br>
• Built-in <b>sanitisation</b>: bound HTML (<code>[innerHTML]</code>), URLs and styles are sanitised against XSS. Bypass only with <code>DomSanitizer</code> for trusted content.<br>
• <code>@let</code> declares a template variable: <code>@let total = price() * qty();</code>.`,
          `// <p>{{ user?.address?.city ?? 'Unknown city' }}</p>
// @let fullName = first() + ' ' + last();
// <h1>{{ fullName }}</h1>
// <div [innerHTML]="bio"></div>        <!-- sanitised: <script> is stripped -->

// Marking something as trusted is a security decision. Do it only for content you fully control.
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
constructor(private sanitizer: DomSanitizer) {}
trustedBanner: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('<b>Admin banner</b>');`,
        ),
      ],
      [
        ['Interpolation vs property binding?', 'Interpolation converts the expression to a string and inserts it as text (or an attribute string). Property binding assigns the expression value, with its real type, to a DOM property, e.g. [disabled]="isBusy".'],
        ['What does [(ngModel)] expand to?', '[ngModel]="value" (ngModelChange)="value = $event": a property binding plus an event binding, provided by FormsModule.'],
        ['Is interpolation safe against XSS?', 'Yes. Angular escapes interpolated values and sanitises [innerHTML], URLs and styles. Bypassing sanitisation requires DomSanitizer and should be avoided with untrusted input.'],
      ],
    ),
    topic(
      'ng-component-communication',
      'Component Communication: Input, Output, model() and Template Reference Variables',
      [
        blk(`<h3>Parent to child: input</h3>
• Data flows <b>down</b> via inputs. Modern Angular uses signal inputs: <code>name = input&lt;string&gt;()</code>, <code>input.required&lt;T&gt;()</code>, optional <code>transform</code> and <code>alias</code>. Read with <code>name()</code>. The older <code>@Input()</code> decorator still works.<br>
• Inputs are read-only inside the child; never mutate them. Derive values with <code>computed()</code>.`,
          `// course-card.component.ts
import { Component, computed, input, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-course-card',
  standalone: true,
  template: \`
    <article>
      <h3>{{ title() }}</h3>
      <p>{{ priceLabel() }}</p>
    </article>\`,
})
export class CourseCardComponent {
  title = input.required<string>();
  price = input(0, { transform: numberAttribute });               // "1999" in the template becomes 1999
  priceLabel = computed(() => this.price() === 0 ? 'Free' : '₹' + this.price());
}

// parent template
// <app-course-card title="Angular Essentials" price="1999" />
// <app-course-card [title]="course.title" [price]="course.price" />`,
        ),
      ],
      [
        blk(`<h3>Child to parent: output and model()</h3>
• Data flows <b>up</b> via outputs: the child declares <code>saved = output&lt;Course&gt;()</code> and calls <code>this.saved.emit(value)</code>; the parent handles <code>(saved)="onSaved($event)"</code>.<br>
• <code>model()</code> creates a <b>two-way</b> signal input: the parent uses <code>[(rating)]="value"</code>; the child reads and writes <code>this.rating.set(5)</code>.<br>
• The older API: <code>@Output() saved = new EventEmitter&lt;Course&gt;()</code>.`,
          `// rating.component.ts
import { Component, model, output } from '@angular/core';

@Component({
  selector: 'app-rating',
  standalone: true,
  template: '<button (click)="rate(n)" *ngFor="let n of [1,2,3,4,5]">{{ n <= rating() ? "★" : "☆" }}</button>',
})
export class RatingComponent {
  rating = model(0);                     // two-way
  rated = output<number>();              // one-way up
  rate(n: number) { this.rating.set(n); this.rated.emit(n); }
}

// parent template
// <app-rating [(rating)]="myRating" (rated)="log($event)" />

// parent class
// myRating = signal(3);
// log(value: number) { console.log('rated', value); }`,
        ),
      ],
      [
        blk(`<h3>Other ways to communicate and template reference variables</h3>
• <b>Template reference variable</b> <code>#name</code> gives access to a DOM element or a child component instance within the template: <code>&lt;input #box&gt; &lt;button (click)="add(box.value)"&gt;</code>; <code>#form="ngForm"</code> exports a directive.<br>
• <code>viewChild()</code> / <code>viewChildren()</code> signal queries give the parent's class access to child components and elements (after the view initialises).<br>
• <b>Siblings and distant components</b> communicate through a <b>shared service</b> (with a signal or BehaviorSubject), not through each other.<br>
• Guideline: inputs/outputs for parent-child, services for everything else.`,
          `// <input #title placeholder="Title">
// <button (click)="addCourse(title.value); title.value = ''">Add</button>
// <app-rating #stars />
// <button (click)="stars.rating.set(5)">Perfect score</button>

// parent class
import { Component, ElementRef, viewChild } from '@angular/core';
export class AddCourseComponent {
  titleBox = viewChild.required<ElementRef<HTMLInputElement>>('title');
  ngAfterViewInit() { this.titleBox().nativeElement.focus(); }
}

// Shared service for siblings
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<Course[]>([]);
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  add(course: Course) { this._items.update(list => [...list, course]); }
}
// Header shows cart.count(); CourseCard calls cart.add(...). They never reference each other.`,
        ),
      ],
      [
        ['How do a parent and a child component communicate?', 'The parent passes data down with inputs ([prop] bound to input()) and the child sends events up with outputs (output() and emit), or both with model() for two-way binding.'],
        ['What is a template reference variable?', 'A #name declared on an element or component that you can use elsewhere in the same template to read its properties or call its methods.'],
        ['How do two sibling components share data?', 'Through a shared injectable service holding the state (a signal or BehaviorSubject), which both inject; neither component references the other.'],
      ],
    ),
    topic(
      'ng-lifecycle-projection',
      'Lifecycle Hooks and Content Projection',
      [
        blk(`<h3>Lifecycle hooks</h3>
• Angular creates, updates and destroys components, and calls <b>lifecycle hook</b> methods you implement. In order: <code>constructor</code> (inject dependencies only), <code>ngOnChanges</code> (an input changed), <code>ngOnInit</code> (once, after the first inputs: load data here), <code>ngDoCheck</code>, <code>ngAfterContentInit/Checked</code>, <code>ngAfterViewInit/Checked</code> (view and child components ready: DOM access), <code>ngOnDestroy</code> (clean up).<br>
• Newer APIs: <code>afterNextRender()</code>/<code>afterRender()</code> for DOM work, <code>DestroyRef.onDestroy()</code> for cleanup, <code>effect()</code> for reacting to signals.`,
          `import { Component, DestroyRef, OnChanges, OnDestroy, OnInit, SimpleChanges, afterNextRender, inject, input } from '@angular/core';

@Component({ selector: 'app-clock', standalone: true, template: '<p>{{ now.toLocaleTimeString() }}</p>' })
export class ClockComponent implements OnInit, OnChanges, OnDestroy {
  label = input('');
  now = new Date();
  private timer?: ReturnType<typeof setInterval>;
  private destroyRef = inject(DestroyRef);

  constructor() {
    console.log('constructor: only DI and simple field setup');
    afterNextRender(() => console.log('DOM is ready: safe to measure or focus elements'));
  }
  ngOnChanges(changes: SimpleChanges) { console.log('inputs changed', Object.keys(changes)); }
  ngOnInit() {
    this.timer = setInterval(() => (this.now = new Date()), 1000);
    this.destroyRef.onDestroy(() => console.log('destroyed (alternative to ngOnDestroy)'));
  }
  ngOnDestroy() { clearInterval(this.timer); }      // always clean up timers and subscriptions
}`,
        ),
      ],
      [
        blk(`<h3>Choosing the right hook</h3>
<table ${TABLE}>
<tr><th>Need</th><th>Use</th></tr>
<tr><td>Inject services, set simple defaults</td><td><code>constructor</code> / <code>inject()</code></td></tr>
<tr><td>Load data, start timers, set up after inputs are known</td><td><code>ngOnInit</code></td></tr>
<tr><td>React to a changed input (compare previous/current)</td><td><code>ngOnChanges</code> or an <code>effect()</code>/<code>computed()</code> over signal inputs</td></tr>
<tr><td>Access child components or DOM elements</td><td><code>ngAfterViewInit</code>, <code>afterNextRender</code></td></tr>
<tr><td>Release resources (timers, listeners, subscriptions)</td><td><code>ngOnDestroy</code> / <code>DestroyRef</code> / <code>takeUntilDestroyed</code></td></tr>
</table>
• Avoid heavy work in <code>ngDoCheck</code>/<code>ngAfterViewChecked</code>: they run on every change detection pass. Do not change bound state in <code>ngAfterViewInit</code> (causes <code>ExpressionChangedAfterItHasBeenChecked</code>).`),
      ],
      [
        blk(`<h3>Content projection: building flexible components</h3>
• <b>Content projection</b> lets a component accept markup from its parent and place it with <code>&lt;ng-content&gt;</code>: the Angular equivalent of slots or React's <code>children</code>.<br>
• <b>Multi-slot</b> projection uses <code>select</code>: <code>&lt;ng-content select="[header]"&gt;</code>, <code>select="app-footer"</code>, <code>select=".actions"</code>. Unmatched content goes to the default <code>&lt;ng-content&gt;</code>. <code>ngProjectAs</code> re-labels content.<br>
• <code>contentChild()</code> / <code>contentChildren()</code> query projected components; <code>ng-template</code> plus <code>ngTemplateOutlet</code> projects <em>templates</em> with context for custom rendering.`,
          `// card.component.ts
@Component({
  selector: 'app-card',
  standalone: true,
  template: \`
    <section class="card">
      <header><ng-content select="[card-title]" /></header>
      <div class="body"><ng-content /></div>
      <footer><ng-content select="[card-actions]" /></footer>
    </section>\`,
})
export class CardComponent {}

// usage
// <app-card>
//   <h3 card-title>Angular Essentials</h3>
//   <p>Learn components, services and routing.</p>
//   <div card-actions><button>Enroll</button></div>
// </app-card>

// Template projection with context (custom row rendering)
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: '@for (item of items(); track item) { <ng-container *ngTemplateOutlet="row() ?? fallback; context: { $implicit: item }" /> } <ng-template #fallback let-i>{{ i }}</ng-template>',
})
export class ListComponent<T> {
  items = input.required<T[]>();
  row = contentChild<TemplateRef<{ $implicit: T }>>('row');
}`,
        ),
      ],
      [
        ['Difference between constructor and ngOnInit?', 'The constructor runs when the class is created and should only set up DI and simple fields. ngOnInit runs once after Angular has set the inputs, which is where initialisation and data loading belong.'],
        ['What is content projection?', 'Passing markup from a parent into a child component\'s template, placed with <ng-content> (optionally multi-slot using select), so components such as cards and dialogs can wrap arbitrary content.'],
        ['When should you unsubscribe or clean up?', 'In ngOnDestroy or via DestroyRef/takeUntilDestroyed: clear timers, remove event listeners and unsubscribe from long-lived observables to avoid memory leaks.'],
      ],
    ),
  ]),

  ng(4, 'Directives and Pipes', 'Core', [
    topic(
      'ng-control-flow',
      'Structural Directives and Control Flow: @if, @for, @switch',
      [
        blk(`<h3>Built-in control flow blocks</h3>
• Since Angular 17 the template uses <b>control flow blocks</b>: <code>@if</code> / <code>@else if</code> / <code>@else</code>, <code>@for</code> (with <code>track</code>, <code>@empty</code>), <code>@switch</code> / <code>@case</code> / <code>@default</code>. They need no imports, are faster than the older directives and have better type narrowing.<br>
• <code>@for</code> <b>requires</b> a <code>track</code> expression (use a unique id): it lets Angular reuse DOM nodes when the list changes.`,
          `// course-list.component.html
// @if (loading()) {
//   <p>Loading courses...</p>
// } @else if (error()) {
//   <p role="alert">{{ error() }}</p>
// } @else {
//   <ul>
//     @for (c of courses(); track c.id; let i = $index, last = $last) {
//       <li [class.last]="last">{{ i + 1 }}. {{ c.title }}</li>
//     } @empty {
//       <li>No courses yet.</li>
//     }
//   </ul>
// }
//
// @switch (level()) {
//   @case ('BEGINNER') { <span class="tag green">Beginner</span> }
//   @case ('ADVANCED') { <span class="tag red">Advanced</span> }
//   @default { <span class="tag">All levels</span> }
// }`,
        ),
      ],
      [
        blk(`<h3>@for context variables and track</h3>
• Context variables: <code>$index</code>, <code>$count</code>, <code>$first</code>, <code>$last</code>, <code>$even</code>, <code>$odd</code>. Alias them: <code>let i = $index</code>.<br>
• <code>track c.id</code> identifies items (like React keys). <code>track $index</code> is acceptable only for static lists. Without stable tracking Angular destroys and recreates DOM when the array is replaced, losing focus and input state.<br>
• <code>@let</code> stores an intermediate value; <code>@if (user(); as u)</code> aliases the expression result.`,
          `// @if (course(); as c) {
//   <h2>{{ c.title }}</h2>
//   @let discounted = c.price * 0.9;
//   <p>Now {{ discounted | currency: 'INR' }}</p>
// }
//
// @for (row of rows(); track row.id) {
//   <tr><td>{{ row.name }}</td><td><input [value]="row.note"></td></tr>   <!-- typed text survives reordering because of track -->
// }

// component
import { signal } from '@angular/core';
rows = signal([{ id: 1, name: 'A', note: '' }, { id: 2, name: 'B', note: '' }]);
reverse() { this.rows.update(r => [...r].reverse()); }`,
        ),
      ],
      [
        blk(`<h3>The legacy directives (still in many codebases)</h3>
• Before Angular 17: <code>*ngIf</code>, <code>*ngFor</code> and <code>[ngSwitch]</code>, imported from <code>CommonModule</code> (or each directive in standalone components). The <code>*</code> is shorthand for wrapping the element in an <code>&lt;ng-template&gt;</code>: that is what makes them <b>structural</b> directives (they add/remove DOM).<br>
• Migrate automatically with <code>ng generate @angular/core:control-flow</code>.<br>
• A <b>custom structural directive</b> injects <code>TemplateRef</code> and <code>ViewContainerRef</code> to create or clear views.`,
          `// Legacy
// <p *ngIf="user; else guest">Hello {{ user.name }}</p>
// <ng-template #guest><p>Please log in</p></ng-template>
// <li *ngFor="let c of courses; trackBy: trackById; let i = index">{{ c.title }}</li>

// Custom structural directive: show content only for a role
import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';

@Directive({ selector: '[appHasRole]', standalone: true })
export class HasRoleDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthService);
  @Input() set appHasRole(role: string) {
    this.vcr.clear();
    if (this.auth.user()?.roles.includes(role)) this.vcr.createEmbeddedView(this.tpl);
  }
}
// <button *appHasRole="'ADMIN'">Delete course</button>   (cosmetic only: the API still enforces authorisation)`,
        ),
      ],
      [
        ['Why does @for require track?', 'It gives each item an identity so Angular can reuse, move and remove DOM nodes efficiently when the collection changes, preserving state such as focus and typed input.'],
        ['What is a structural directive?', 'A directive that adds or removes DOM elements (*ngIf, *ngFor, custom ones using TemplateRef and ViewContainerRef). The control flow blocks @if/@for/@switch replace the built-in ones.'],
        ['@if vs *ngIf?', '@if is built-in control flow: no imports, better performance and type narrowing, supports @else if. *ngIf is the older directive from CommonModule; migration is automatic with a schematic.'],
      ],
    ),
    topic(
      'ng-attribute-directives',
      'Attribute Directives: ngClass, ngStyle and Custom Directives',
      [
        blk(`<h3>Class and style bindings</h3>
• <b>Attribute directives</b> change the appearance or behaviour of an existing element. The simplest tools are plain bindings: <code>[class.active]="isActive"</code>, <code>[class]="classes"</code>, <code>[style.color]="color"</code>, <code>[style.width.px]="w"</code>.<br>
• <code>[ngClass]</code> and <code>[ngStyle]</code> accept strings, arrays or objects for several classes/styles at once. Prefer the direct <code>[class]</code>/<code>[style]</code> bindings in new code, which are faster and more flexible.`,
          `// <span [class.badge]="true" [class.overdue]="due() < today">Task</span>
// <div [ngClass]="{ 'card': true, 'selected': isSelected, 'disabled': !enabled }">...</div>
// <div [ngClass]="['card', level === 'ADVANCED' ? 'hard' : 'easy']">...</div>
// <p [ngStyle]="{ 'font-size.px': size, 'font-weight': bold ? 'bold' : 'normal' }">Styled</p>

// Modern equivalent
// <div [class]="{ card: true, selected: isSelected }" [style]="{ 'font-size.px': size }">

// component imports (only if you use ngClass/ngStyle)
import { NgClass, NgStyle } from '@angular/common';
@Component({ standalone: true, imports: [NgClass, NgStyle], templateUrl: './card.component.html' })`,
        ),
      ],
      [
        blk(`<h3>Custom attribute directives</h3>
• Create with <code>ng g directive shared/highlight</code>. Use <code>@HostListener</code> for events on the host element, <code>@HostBinding</code> (or the <code>host</code> metadata) for properties, <code>ElementRef</code> to touch the DOM (sparingly) and <code>input()</code> for options.<br>
• Typical uses: highlight on hover, autofocus, click-outside, tooltips, permission checks, drag and drop, input masks.<br>
• Prefer the <code>host</code> metadata object over the decorators in new code.`,
          `// highlight.directive.ts
import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
  host: { '[style.transition]': '"background 150ms"' },
})
export class HighlightDirective {
  appHighlight = input('#fff3bf');              // the directive's selector doubles as its input
  private el = inject(ElementRef<HTMLElement>);

  @HostListener('mouseenter') onEnter() { this.el.nativeElement.style.background = this.appHighlight(); }
  @HostListener('mouseleave') onLeave() { this.el.nativeElement.style.background = ''; }
}

// usage: <p appHighlight="lightgreen">Hover me</p>

// autofocus directive
@Directive({ selector: '[appAutofocus]', standalone: true })
export class AutofocusDirective {
  constructor() { const el = inject(ElementRef<HTMLElement>); afterNextRender(() => el.nativeElement.focus()); }
}
// <input appAutofocus>`,
        ),
      ],
      [
        blk(`<h3>Host directives and click-outside</h3>
• <b>Directive composition</b>: a component or directive can apply other directives with <code>hostDirectives: [...]</code>, reusing behaviour without inheritance.<br>
• A <b>click-outside</b> directive listens on <code>document</code> and emits an output when the click target is outside the host; always remove the listener (<code>DestroyRef</code>).<br>
• Use <code>Renderer2</code> instead of direct DOM access when you must stay compatible with server-side rendering.`,
          `import { DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

@Directive({ selector: '[appClickOutside]', standalone: true })
export class ClickOutsideDirective {
  appClickOutside = output<MouseEvent>();
  private host = inject(ElementRef<HTMLElement>);

  constructor() {
    const handler = (e: MouseEvent) => {
      if (!this.host.nativeElement.contains(e.target as Node)) this.appClickOutside.emit(e);
    };
    document.addEventListener('click', handler);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('click', handler));   // no leak
  }
}
// <div class="menu" (appClickOutside)="open.set(false)">...</div>

@Component({
  selector: 'app-fancy-button',
  standalone: true,
  hostDirectives: [{ directive: HighlightDirective, inputs: ['appHighlight: color'] }],
  template: '<ng-content />',
})
export class FancyButtonComponent {}`,
        ),
      ],
      [
        ['Structural vs attribute directives?', 'Structural directives add or remove elements from the DOM (@if, @for, *ngIf). Attribute directives change the look or behaviour of an existing element (ngClass, ngStyle, custom highlight).'],
        ['What are HostListener and HostBinding?', 'HostListener subscribes to events on the directive\'s host element; HostBinding binds a host property, class or style to a directive property. The host metadata object is the modern alternative.'],
        ['ngClass vs [class] binding?', '[class.name]="cond" and [class]="obj" are the preferred, lighter bindings; ngClass is the older directive that accepts strings, arrays and objects and needs an import.'],
      ],
    ),
    topic(
      'ng-pipes-deep',
      'Pipes: Built-in, Custom, Pure and Impure',
      [
        blk(`<h3>Built-in pipes</h3>
• A <b>pipe</b> transforms a value for display: <code>{{ value | pipeName: arg1 : arg2 }}</code>. Pipes can be chained.<br>
• Common built-ins: <code>date</code>, <code>currency</code>, <code>number</code>, <code>percent</code>, <code>uppercase</code>, <code>lowercase</code>, <code>titlecase</code>, <code>slice</code>, <code>json</code> (debugging), <code>keyvalue</code>, <code>async</code> (subscribes to an Observable/Promise and unsubscribes automatically), <code>i18nPlural</code>.<br>
• Import each one used by a standalone component (<code>DatePipe</code>, <code>CurrencyPipe</code>, <code>AsyncPipe</code>, ...).`,
          `// {{ today | date: 'dd MMM yyyy, hh:mm a' }}            ->  20 Oct 2026, 12:11 AM
// {{ price | currency: 'INR' : 'symbol' : '1.0-0' }}       ->  ₹1,999
// {{ ratio | percent: '1.0-1' }}                           ->  72.5%
// {{ name | titlecase | slice: 0 : 10 }}                   (chained)
// {{ course | json }}                                      (debug)
// @for (e of settings | keyvalue; track e.key) { <li>{{ e.key }} = {{ e.value }}</li> }
// @if (courses$ | async; as courses) { <p>{{ courses.length }} courses</p> }   (no manual subscribe or unsubscribe)

import { AsyncPipe, CurrencyPipe, DatePipe, KeyValuePipe, PercentPipe, TitleCasePipe, SlicePipe, JsonPipe } from '@angular/common';
@Component({
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, KeyValuePipe, PercentPipe, TitleCasePipe, SlicePipe, JsonPipe],
  templateUrl: './report.component.html',
})
export class ReportComponent { courses$ = inject(CourseService).list(); today = new Date(); }`,
        ),
      ],
      [
        blk(`<h3>Custom pipes</h3>
• Create with <code>ng g pipe shared/time-ago</code>. Implement <code>PipeTransform</code>; <code>transform(value, ...args)</code> returns the formatted value. Mark it <code>standalone: true</code> and import it where used.<br>
• Good pipe candidates: formatting (initials, file size, relative time, truncate), simple filtering of display data. Do <b>business logic</b> and heavy computation elsewhere.`,
          `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileSize', standalone: true })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined, decimals = 1): string {
    if (bytes == null || bytes < 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0, v = bytes;
    while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
    return v.toFixed(i === 0 ? 0 : decimals) + ' ' + units[i];
  }
}

@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const steps: [number, string][] = [[60, 'minute'], [3600, 'hour'], [86400, 'day']];
    for (let i = steps.length - 1; i >= 0; i--) {
      const [size, name] = steps[i];
      if (seconds >= size) { const n = Math.floor(seconds / size); return n + ' ' + name + (n > 1 ? 's' : '') + ' ago'; }
    }
    return seconds + ' seconds ago';
  }
}
// {{ file.size | fileSize }}   {{ post.createdAt | timeAgo }}`,
        ),
      ],
      [
        blk(`<h3>Pure vs impure pipes</h3>
• A <b>pure</b> pipe (the default) runs only when its <b>input value or arguments change by reference</b> (primitive value change, or a new object/array). Angular caches the result: very efficient.<br>
• An <b>impure</b> pipe (<code>pure: false</code>) runs on <b>every change detection cycle</b>, even when the input is the same object. Needed when the result depends on mutated data or on external state (like <code>async</code>, <code>json</code> and <code>keyvalue</code> do), but expensive.<br>
• Consequence: a pure pipe on an array does <b>not</b> re-run when you <code>push</code> into the same array. Replace the array (immutable update) or use a signal/computed.`,
          `@Pipe({ name: 'filterByTag', standalone: true })                 // pure: fast, re-runs only on a new array or tag
export class FilterByTagPipe implements PipeTransform {
  transform(courses: Course[], tag: string): Course[] { return courses.filter(c => c.tags?.includes(tag)); }
}

@Pipe({ name: 'filterByTagImpure', standalone: true, pure: false })   // impure: re-runs on every change detection pass
export class FilterByTagImpurePipe implements PipeTransform {
  transform(courses: Course[], tag: string): Course[] { return courses.filter(c => c.tags?.includes(tag)); }
}

// courses.push(newCourse);                   // same array: the PURE pipe will NOT update the view
// courses = [...courses, newCourse];         // new array: the pure pipe re-runs
// Best: avoid filtering pipes entirely; use computed()
filtered = computed(() => this.courses().filter(c => c.tags?.includes(this.tag())));`,
        ),
      ],
      [
        ['Pure vs impure pipe?', 'A pure pipe runs only when its inputs change by reference and its result is cached. An impure pipe runs on every change detection cycle, which is needed for mutable or external data but costs performance.'],
        ['What does the async pipe do?', 'It subscribes to an Observable or Promise in the template, renders the latest value, triggers change detection on emissions and unsubscribes automatically when the view is destroyed.'],
        ['Why did my pure pipe not update after I pushed to an array?', 'Pure pipes re-run only when the input reference changes. push mutates the same array, so the pipe is skipped. Assign a new array or use a computed signal.'],
      ],
    ),
  ]),
];
