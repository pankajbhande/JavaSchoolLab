// Angular syllabus, part 2: modules 9-15 (lifecycle, routing, forms, RxJS, signals, HTTP, state management).
import type { SubTopic, Topic } from './types';
import { blk, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';

/** Overview topic: every syllabus item of the module, in order, with a one-line explanation and the lesson that covers it. */
const ov = (n: number, intro: string, rows: [string, string, string][]): Topic =>
  topic(
    'ngs-m' + n + '-overview',
    'Module ' + n + ' overview and checklist',
    [
      blk(
        '<h3>What this module covers</h3>' +
          intro +
          '<br><br><table ' + TABLE + '><thead><tr><th>#</th><th>Syllabus item</th><th>In plain words</th><th>Covered in lesson</th></tr></thead><tbody>' +
          rows.map((r, i) => '<tr><td>' + (i + 1) + '</td><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') +
          '</tbody></table>',
      ),
    ],
    [],
    [],
    [['How should I use this checklist?', 'Work through the lessons in order, tick each item once you can explain it and write a small example from memory. The last column tells you which lesson to revisit.']],
  );

// ---------------------------------------------------------------- Module 9
const m9: Topic[] = [
  ov(9, 'A component is born, updated, rendered and destroyed. Angular calls <b>lifecycle hooks</b> at each step so you can run code at the right moment.', [
    ['Angular component lifecycle overview', 'The stages from creation to destruction and the hooks Angular calls', 'Lifecycle overview, constructor and the first hooks'],
    ['Constructor vs lifecycle hooks', 'Constructor wires dependencies; hooks run when inputs and views are ready', 'Lifecycle overview, constructor and the first hooks'],
    ['ngOnChanges()', 'Runs when a bound @Input changes', 'Lifecycle overview, constructor and the first hooks'],
    ['ngOnInit()', 'One-time initialisation after the first inputs are set', 'Lifecycle overview, constructor and the first hooks'],
    ['ngDoCheck()', 'Runs on every change detection pass for custom checks', 'Lifecycle overview, constructor and the first hooks'],
    ['ngAfterContentInit()', 'Projected content (ng-content) is ready', 'Content and view hooks'],
    ['ngAfterContentChecked()', 'Projected content was checked again', 'Content and view hooks'],
    ['ngAfterViewInit()', 'Own view and child components are ready (safe for ViewChild)', 'Content and view hooks'],
    ['ngAfterViewChecked()', 'Own view was checked again', 'Content and view hooks'],
    ['ngOnDestroy()', 'Cleanup just before the component is removed', 'Destruction and cleanup'],
    ['DestroyRef', 'Injectable object to register cleanup callbacks', 'Destruction and cleanup'],
    ['takeUntilDestroyed()', 'RxJS operator that auto-unsubscribes when the component dies', 'Destruction and cleanup'],
    ['Lifecycle ordering', 'The exact order of all hooks', 'Lifecycle overview, constructor and the first hooks'],
    ['Parent-child lifecycle behavior', 'How hooks interleave between a parent and its children', 'Parent-child behavior, input changes and mistakes'],
    ['Input changes and lifecycle hooks', 'How input changes trigger ngOnChanges and signals', 'Parent-child behavior, input changes and mistakes'],
    ['Avoiding expensive lifecycle operations', 'Keep ngDoCheck and *Checked hooks cheap', 'Parent-child behavior, input changes and mistakes'],
    ['Common lifecycle mistakes', 'Typical bugs: ExpressionChanged errors, leaks, constructor logic', 'Parent-child behavior, input changes and mistakes'],
  ]),

  topic(
    'ngs-m9-hooks-basics',
    'Lifecycle overview, constructor and the first hooks',
    [
      blk(`<h3>The life of a component</h3>
• Think of a component like an <b>employee</b>: hired (created), onboarded (inputs set), working (views rendered and updated), and finally leaves (destroyed). Angular's <b>component lifecycle</b> lets you run code at each of those moments through <b>lifecycle hooks</b>: methods with fixed names such as <code>ngOnInit</code>.<br>
• The <b>constructor</b> is plain TypeScript (like a Java constructor). It runs first, before Angular has set any <code>@Input</code>. Use it only to receive dependencies (or use <code>inject()</code>) and set simple fields.<br>
• <b>ngOnInit()</b> runs once, after the first inputs are set. This is where you load data and start work.<br>
• To use a hook, implement its interface (<code>OnInit</code>) and add the method. Interfaces are optional but catch typos.`,
        `// hello.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { UserService } from './user.service';

@Component({ selector: 'app-hello', template: '<p>Hello {{ name }}</p>' })
export class HelloComponent implements OnInit {
  private users = inject(UserService);   // constructor-time: only wiring
  name = '';

  ngOnInit() {                            // runs once, inputs are available now
    this.name = this.users.currentName();
  }
}`),
    ],
    [
      blk(`<h3>The hooks in order, and constructor vs ngOnInit</h3>
<b>Lifecycle ordering</b> for one component:<br>
1. <b>constructor</b>, 2. <b>ngOnChanges</b> (only if it has bound inputs; runs before ngOnInit and again on every input change), 3. <b>ngOnInit</b> (once), 4. <b>ngDoCheck</b> (every change detection pass), 5. <b>ngAfterContentInit</b> (once), 6. <b>ngAfterContentChecked</b> (every pass), 7. <b>ngAfterViewInit</b> (once), 8. <b>ngAfterViewChecked</b> (every pass), 9. <b>ngOnDestroy</b> (once).<br><br>
<table ${TABLE}><thead><tr><th>Hook</th><th>Runs</th><th>Typical use</th></tr></thead><tbody>
<tr><td>ngOnChanges</td><td>Before init, then on each input change</td><td>React to a changed @Input with old and new values</td></tr>
<tr><td>ngOnInit</td><td>Once</td><td>Fetch data, set up subscriptions</td></tr>
<tr><td>ngDoCheck</td><td>Every CD pass</td><td>Custom change detection (rare)</td></tr>
<tr><td>ngAfterContentInit / Checked</td><td>Once / every pass</td><td>Work with projected content (ContentChild)</td></tr>
<tr><td>ngAfterViewInit / Checked</td><td>Once / every pass</td><td>Work with ViewChild, third-party widgets</td></tr>
<tr><td>ngOnDestroy</td><td>Once</td><td>Cleanup</td></tr></tbody></table>`),
      blk(`<h3>ngOnChanges and ngOnInit in practice</h3>
• <b>ngOnChanges(changes: SimpleChanges)</b> gives a <code>SimpleChange</code> per changed input with <code>previousValue</code>, <code>currentValue</code> and <code>firstChange</code>. It only fires when the input <b>reference</b> changes: mutating an object in place does not trigger it.<br>
• <b>ngOnInit</b> is the right place for initial data loading because the inputs are ready. The constructor must stay free of logic so the component is easy to test.`,
        `// price-tag.component.ts
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({ selector: 'app-price-tag', template: '{{ label }}' })
export class PriceTagComponent implements OnChanges, OnInit {
  @Input() price = 0;
  @Input() currency = 'INR';
  label = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['price']) {
      const c = changes['price'];
      console.log('price', c.previousValue, '->', c.currentValue, 'first?', c.firstChange);
      this.label = this.currency + ' ' + this.price;   // derived value kept in sync
    }
  }
  ngOnInit() { console.log('ready with price', this.price); }
}`),
    ],
    [
      blk(`<h3>ngDoCheck, internals and version notes</h3>
• <b>ngDoCheck</b> runs on <b>every</b> change detection pass of the component (and for OnPush components it still runs when the parent is checked, even if the component itself is skipped). Use it only to detect changes Angular cannot see, such as in-place mutation of an input object, and keep it extremely cheap (compare a version number or use <code>KeyValueDiffers</code> / <code>IterableDiffers</code>).<br>
• Angular calls <code>ngOnChanges</code>, <code>ngOnInit</code> and <code>ngDoCheck</code> during the parent's template update, per child, in template order. Hooks are not called on every component instance for free: Angular only calls hooks that exist, resolved at compile time (Ivy).<br>
• <b>Signal-era note</b>: with <code>input()</code> signals you usually do not need <code>ngOnChanges</code>. Use <code>computed()</code> for derived values and <code>effect()</code> for side effects (see Module 13). The classic hooks remain fully supported.<br>
• Prefer <code>inject()</code> or constructor injection for dependencies, <code>ngOnInit</code> for startup work, and <code>afterNextRender()</code> / <code>afterRenderEffect()</code> (newer APIs) for DOM work that must run in the browser only.`,
        `// Detecting in-place mutation with ngDoCheck (rare, keep it cheap)
import { Component, DoCheck, Input, KeyValueDiffers, KeyValueDiffer } from '@angular/core';

@Component({ selector: 'app-watch', template: '' })
export class WatchComponent implements DoCheck {
  @Input() settings: Record<string, unknown> = {};
  private differ!: KeyValueDiffer<string, unknown>;
  constructor(differs: KeyValueDiffers) { this.differ = differs.find({}).create(); }

  ngDoCheck() {
    const changes = this.differ.diff(this.settings);   // cheap structural diff
    if (changes) console.log('settings mutated in place');
  }
}`),
    ],
    [
      ['Constructor vs ngOnInit: what goes where?', 'The constructor is for dependency injection and trivial field setup; at that time inputs are not set and the view does not exist. ngOnInit runs after the first ngOnChanges with inputs available, so it hosts initial data loading and subscription setup.'],
      ['In what order do the lifecycle hooks run?', 'constructor, ngOnChanges (if inputs), ngOnInit, ngDoCheck, ngAfterContentInit, ngAfterContentChecked, ngAfterViewInit, ngAfterViewChecked, and finally ngOnDestroy. Init hooks run once; DoCheck and the Checked hooks run on every change detection pass.'],
      ['When does ngOnChanges fire?', 'Before ngOnInit and whenever a bound input gets a new reference (or primitive value). Mutating an object or array in place does not trigger it.'],
      ['What is ngDoCheck for and what is the danger?', 'It lets you run custom change detection logic on every pass, for example to detect in-place mutations. Because it runs so often, expensive code there degrades performance of the whole app.'],
      ['Is ngOnChanges still needed with signal inputs?', 'Usually not. input() returns a signal, so you derive values with computed() and react with effect(). ngOnChanges still works for decorator-based @Input.'],
    ],
  ),

  topic(
    'ngs-m9-content-view-hooks',
    'Content and view hooks',
    [
      blk(`<h3>Content vs view</h3>
• Imagine a <b>photo frame</b>. The frame (your component) has its own parts (its <b>view</b>: template and child components). Someone can also slide a picture into it from outside (<b>content</b> projected with <code>&lt;ng-content&gt;</code>).<br>
• <b>ngAfterContentInit()</b> runs once after the projected content is ready. <b>ngAfterViewInit()</b> runs once after the component's own template and its children are rendered.<br>
• The <b>Checked</b> variants (<b>ngAfterContentChecked</b>, <b>ngAfterViewChecked</b>) run after every change detection pass, so they run very often.<br>
• Rule of thumb: need a <code>@ViewChild</code> element? Use ngAfterViewInit. Not before: it is undefined in ngOnInit (unless <code>static: true</code>).`,
        `// focus-input.component.ts
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({ selector: 'app-focus-input', template: '<input #box placeholder="type here">' })
export class FocusInputComponent implements AfterViewInit {
  @ViewChild('box') box!: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    this.box.nativeElement.focus();   // the view exists now
  }
}`),
    ],
    [
      blk(`<h3>Content hooks with projected content</h3>
• <b>ngAfterContentInit</b> is where <code>@ContentChild</code> / <code>@ContentChildren</code> (or signal <code>contentChild()</code>) are first populated. Typical for tabs, accordions and menu components that inspect their projected children.<br>
• <b>ngAfterContentChecked</b> runs after Angular checked the projected content on each pass. Use it very rarely.`,
        `// tabs.component.ts
import { AfterContentInit, Component, ContentChildren, QueryList } from '@angular/core';
import { TabComponent } from './tab.component';

@Component({
  selector: 'app-tabs',
  template: '<ng-content></ng-content>',
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;

  ngAfterContentInit() {
    this.tabs.first.active = true;                       // projected tabs are available now
    this.tabs.changes.subscribe(() => console.log('tabs changed'));   // QueryList is observable
  }
}
// usage: <app-tabs><app-tab title="A"></app-tab><app-tab title="B"></app-tab></app-tabs>`),
      blk(`<h3>View hooks with third-party widgets</h3>
• <b>ngAfterViewInit</b> is the place to hand a DOM element to a charting or map library, measure sizes, or call <code>scrollIntoView</code>.<br>
• Do not change bound state in the view hooks: it triggers the dev-mode error <b>ExpressionChangedAfterItHasBeenChecked</b> because the view was already checked.`,
        `// chart.component.ts
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
declare const Chart: any;   // third-party library

@Component({ selector: 'app-chart', template: '<canvas #c></canvas>' })
export class ChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('c') canvas!: ElementRef<HTMLCanvasElement>;
  private chart: any;

  ngAfterViewInit() {
    this.chart = new Chart(this.canvas.nativeElement, { type: 'bar', data: { labels: ['A'], datasets: [{ data: [3] }] } });
  }
  ngOnDestroy() { this.chart?.destroy(); }   // pair every init with a cleanup
}`),
    ],
    [
      blk(`<h3>Internals, pitfalls and modern replacements</h3>
• Queries resolve in a fixed order: static queries before ngOnInit, content queries before ngAfterContentInit, view queries before ngAfterViewInit. Dynamic queries (inside @if / @for) update after each pass and are visible in the Checked hooks.<br>
• <b>ngAfterViewChecked / ngAfterContentChecked</b> fire after every pass, even when nothing changed. Putting DOM reads there causes layout thrashing. Prefer signal queries <code>viewChild()</code> and <code>contentChild()</code> with <code>effect()</code>, or <code>afterNextRender()</code> / <code>afterEveryRender()</code> (v17.x-19, the render hooks API is stable from v19 under the names <code>afterNextRender</code> and <code>afterEveryRender</code>; earlier versions had <code>afterRender</code>).<br>
• Under SSR, ngAfterViewInit also runs on the server where there is no real DOM. Guard browser-only code with <code>afterNextRender</code> or <code>isPlatformBrowser</code>.<br>
• To change state after the view was checked, either schedule it (<code>afterNextRender</code>, <code>Promise.resolve().then</code>) or call <code>cdr.detectChanges()</code>, but first ask if the state belongs in a signal.`,
        `import { Component, ElementRef, afterNextRender, viewChild } from '@angular/core';

@Component({ selector: 'app-map', template: '<div #host class="map"></div>' })
export class MapComponent {
  host = viewChild.required<ElementRef<HTMLElement>>('host');   // signal query

  constructor() {
    afterNextRender(() => {                  // browser only, once, after the first render
      const el = this.host().nativeElement;
      console.log('width', el.offsetWidth);  // safe to read layout here
    });
  }
}`),
    ],
    [
      ['Difference between ngAfterContentInit and ngAfterViewInit?', 'Content hooks concern nodes projected into the component through ng-content (declared by the parent). View hooks concern the component own template and its child components. Content hooks fire first.'],
      ['Why is my @ViewChild undefined in ngOnInit?', 'The view is not rendered yet. View queries are resolved before ngAfterViewInit; only { static: true } queries (elements not inside @if/@for) are available in ngOnInit.'],
      ['What causes ExpressionChangedAfterItHasBeenChecked and how do you fix it?', 'Changing a bound value after Angular already checked it in the same pass, often in ngAfterViewInit or a child hook. Fix by deriving state correctly, moving the change earlier, using signals, or deferring it to the next render.'],
      ['Why are the Checked hooks dangerous?', 'They run after every change detection pass for every instance. Heavy or DOM-reading logic there hurts performance and can cause loops.'],
      ['How do you safely run browser-only code after render in SSR apps?', 'Use afterNextRender / afterEveryRender or guard with isPlatformBrowser, because lifecycle hooks such as ngAfterViewInit also execute on the server.'],
    ],
  ),

  topic(
    'ngs-m9-destroy-cleanup',
    'Destruction and cleanup',
    [
      blk(`<h3>Cleaning up after yourself</h3>
• When a component is removed (route change, @if turns false) Angular calls <b>ngOnDestroy()</b> once. Like Java's <code>close()</code> in try-with-resources, this is where you release things: stop timers, unsubscribe, close sockets.<br>
• If you forget, the timer or subscription keeps running in memory: a <b>memory leak</b>, and sometimes code keeps updating a component that no longer exists.`,
        `// clock.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({ selector: 'app-clock', template: '{{ now }}' })
export class ClockComponent implements OnInit, OnDestroy {
  now = new Date().toLocaleTimeString();
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() { this.timer = setInterval(() => (this.now = new Date().toLocaleTimeString()), 1000); }
  ngOnDestroy() { clearInterval(this.timer); }   // stop it, otherwise it runs forever
}`),
    ],
    [
      blk(`<h3>DestroyRef and takeUntilDestroyed()</h3>
• <b>DestroyRef</b> (v16+) is an injectable that lets you register cleanup callbacks with <code>onDestroy(fn)</code> right where you create the resource, so no separate ngOnDestroy is needed. It works in components, directives, services and environment injectors.<br>
• <b>takeUntilDestroyed()</b> (from <code>@angular/core/rxjs-interop</code>) is an RxJS operator that completes the stream when the current injection context is destroyed. Call it with no argument in a constructor or field initialiser, or pass a <code>DestroyRef</code> elsewhere.`,
        `import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Component({ selector: 'app-ticker', template: '{{ n }}' })
export class TickerComponent implements OnInit {
  n = 0;
  private destroyRef = inject(DestroyRef);

  constructor() {
    // injection context: no argument needed
    interval(1000).pipe(takeUntilDestroyed()).subscribe(v => (this.n = v));
  }

  ngOnInit() {
    const onResize = () => console.log('resized');
    window.addEventListener('resize', onResize);
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));   // cleanup next to setup

    // outside injection context (ngOnInit): pass the DestroyRef explicitly
    interval(5000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => console.log('tick'));
  }
}`),
    ],
    [
      blk(`<h3>Patterns, pitfalls and what not to clean</h3>
• The classic pattern before v16 was a <code>destroy$ = new Subject()</code> with <code>takeUntil(this.destroy$)</code> and <code>destroy$.next()</code> in ngOnDestroy. It still works, but <code>takeUntilDestroyed()</code> removes the boilerplate.<br>
• You do <b>not</b> need to unsubscribe from: the <code>async</code> pipe (it cleans itself), <code>HttpClient</code> calls that complete, router <code>paramMap</code> of the same component, template event listeners, and <code>toSignal()</code> (it unsubscribes with its owner).<br>
• You <b>must</b> clean: <code>interval</code>/<code>fromEvent</code>/Subject subscriptions, <code>addEventListener</code> on window/document, WebSocket/SSE connections, third-party widgets, <code>ResizeObserver</code>/<code>IntersectionObserver</code>.<br>
• <code>takeUntilDestroyed()</code> without argument throws <code>NG0203</code> outside an injection context. Put it before <code>subscribe</code> and, when combined with other completing operators, place it last in the <code>pipe</code> to avoid leaks from inner observables (same rule as <code>takeUntil</code>).<br>
• Service destruction: root services live as long as the app; component-provided services are destroyed with the component and their ngOnDestroy runs too.`,
        `// A service with its own cleanup
@Injectable()
export class LiveFeedService {
  private ws = new WebSocket('wss://example.com/feed');
  constructor() {
    inject(DestroyRef).onDestroy(() => this.ws.close());   // closes when the providing component dies
  }
}`),
    ],
    [
      ['When is ngOnDestroy called and what belongs there?', 'Just before Angular removes the component or directive (route change, @if false, @for item removed). Put cleanup there: timers, manual subscriptions, event listeners, sockets, third-party widget disposal.'],
      ['What is DestroyRef?', 'An injectable (v16+) that exposes onDestroy(callback), letting you register cleanup logic at the place where you create the resource, in components, directives and services.'],
      ['How does takeUntilDestroyed work and where can you call it?', 'It completes an observable when the surrounding injection context is destroyed. With no argument it must run in an injection context (constructor or field initialiser); elsewhere pass a DestroyRef.'],
      ['Which subscriptions do not need manual unsubscription?', 'Async pipe subscriptions, completing HttpClient observables, toSignal subscriptions, and template event bindings. Infinite streams like interval, fromEvent and Subjects do need cleanup.'],
      ['What was the older pattern and why replace it?', 'A destroy$ Subject with takeUntil(destroy$) and next()/complete() in ngOnDestroy. It works but is boilerplate and easy to forget; takeUntilDestroyed does the same automatically.'],
    ],
  ),

  topic(
    'ngs-m9-parent-child-mistakes',
    'Parent-child behavior, input changes and mistakes',
    [
      blk(`<h3>Parents and children together</h3>
• A parent creates its children while rendering. The parent's constructor and ngOnInit run <b>before</b> the children are created; the children then run their hooks; and the parent's <b>ngAfterViewInit</b> runs only <b>after all children</b> finished theirs. Destruction goes parent first, then children.<br>
• When a parent changes a bound value, Angular updates the child input and calls the child's <b>ngOnChanges</b>. That is how <b>input changes</b> reach <b>lifecycle hooks</b>.`,
        `// Console order for <app-parent> containing <app-child>:
// parent constructor
// parent ngOnInit
// parent ngDoCheck
// child  constructor
// child  ngOnChanges (inputs bound)
// child  ngOnInit
// child  ngDoCheck
// child  ngAfterViewInit        (child view ready)
// child  ngAfterViewChecked
// parent ngAfterViewInit        (parent last, children done)
// parent ngAfterViewChecked`),
    ],
    [
      blk(`<h3>Input changes and the hooks</h3>
• With several children, hooks interleave in template order: <code>ngOnChanges/ngOnInit/ngDoCheck</code> for child A, then child B, while the After* hooks run once the whole view subtree is created.<br>
• Primitive inputs trigger <code>ngOnChanges</code> when the value differs; object inputs when the reference differs. Use immutable updates in the parent.<br>
• With <code>OnPush</code> children, <code>ngDoCheck</code> still runs, but the child view is skipped unless an input reference changed, an event fired inside it, or a signal it reads changed.`,
        `// parent.component.ts
@Component({
  selector: 'app-parent', imports: [ChildComponent],
  template: '<button (click)="bump()">bump</button><app-child [user]="user" />',
})
export class ParentComponent {
  user = { name: 'Asha', age: 30 };
  bump() {
    this.user.age++;                          // mutation: child ngOnChanges does NOT fire
    // this.user = { ...this.user, age: this.user.age + 1 };   // new reference: ngOnChanges fires
  }
}`),
    ],
    [
      blk(`<h3>Avoiding expensive lifecycle operations</h3>
• Anything in <code>ngDoCheck</code>, <code>ngAfterContentChecked</code>, <code>ngAfterViewChecked</code> and template method calls runs on each pass; for a list of 1000 rows that is thousands of calls per click. Keep them O(1), or move work to <code>computed()</code>, pure pipes or <code>OnPush</code>.<br>
• Do heavy startup work lazily (<code>@defer</code>, route lazy loading) rather than blocking <code>ngOnInit</code>; never make <code>ngOnInit</code> block on synchronous heavy loops.<br>
• Avoid reading layout (<code>offsetWidth</code>) and writing the DOM in the same hook: it forces synchronous reflow.`),
      blk(`<h3>Common lifecycle mistakes</h3>
<table ${TABLE}><thead><tr><th>Mistake</th><th>Consequence</th><th>Fix</th></tr></thead><tbody>
<tr><td>Fetching data or reading @Input in the constructor</td><td>Inputs are undefined, hard to test</td><td>Use ngOnInit</td></tr>
<tr><td>Using @ViewChild in ngOnInit</td><td>undefined</td><td>ngAfterViewInit or signal viewChild()</td></tr>
<tr><td>Forgetting to unsubscribe from infinite streams</td><td>Memory leak, ghost updates</td><td>takeUntilDestroyed / async pipe</td></tr>
<tr><td>Changing bound state in ngAfterViewInit</td><td>ExpressionChangedAfterItHasBeenChecked</td><td>Derive earlier, use signals, afterNextRender</td></tr>
<tr><td>Mutating an input object</td><td>ngOnChanges and OnPush do not fire</td><td>Immutable updates</td></tr>
<tr><td>Heavy code in ngDoCheck / *Checked</td><td>Slow app</td><td>computed, pure pipe, OnPush</td></tr>
<tr><td>Browser APIs (window, document) in hooks under SSR</td><td>Server crash</td><td>afterNextRender, isPlatformBrowser</td></tr>
<tr><td>Calling ngOnInit manually</td><td>Runs twice</td><td>Never call hooks yourself</td></tr></tbody></table>`),
      blk(`<h3>Version notes and design guidance</h3>
• Order guarantee: for a parent P with child C, PreOrder hooks (OnChanges, OnInit, DoCheck) go P then C; AfterContent/AfterView hooks go C then P (post-order). OnDestroy is invoked for the parent and then its descendants.<br>
• In zoneless apps (stable from v20.2, developer preview in v18-20.1) hooks still run, but change detection is scheduled by signals, <code>markForCheck</code>, events and the async pipe rather than zone.js.<br>
• Prefer reactive wiring (signals, computed, effect) over hook choreography: fewer ordering bugs. Keep hooks thin and delegate to services or pure functions so they are testable: in tests <code>fixture.detectChanges()</code> triggers the first ngOnInit.`),
    ],
    [
      ['In what order do parent and child hooks run?', 'Parent constructor, ngOnInit and ngDoCheck first; then each child runs its constructor, ngOnChanges, ngOnInit, ngDoCheck and view hooks; the parent AfterViewInit runs after all children are initialised.'],
      ['How does an input change reach a child?', 'The parent binding changes, Angular sets the child input and calls ngOnChanges (or updates the input signal). Only a new value or reference counts; in-place mutation is not detected.'],
      ['Name common lifecycle mistakes.', 'Logic in the constructor, ViewChild in ngOnInit, leaked subscriptions, state changes in AfterViewInit, mutated inputs, heavy code in DoCheck/Checked hooks, and browser APIs used under SSR.'],
      ['How do you keep lifecycle work cheap?', 'Keep per-pass hooks O(1), memoise with computed or pure pipes, use OnPush, track in @for, lazy load with @defer, and move heavy work out of ngOnInit.'],
    ],
  ),
];

// ---------------------------------------------------------------- Module 10
const L10_1 = 'Router basics and configuration';
const L10_2 = 'Navigation, route and query parameters';
const L10_3 = 'Child, nested, redirect and wildcard routes';
const L10_4 = 'Lazy loading, preloading and routing performance';
const L10_5 = 'Route guards and protected routes';
const L10_6 = 'Resolvers, route data, titles and route providers';
const L10_7 = 'Router events, navigation lifecycle and testing';

const m10: Topic[] = [
  ov(10, 'The <b>Router</b> maps URLs to components so a single-page app can have many "pages", deep links, back-button support and protected areas.', [
    ['What is routing?', 'Mapping URL paths to components in a single page app', L10_1],
    ['Angular Router architecture', 'Routes, Router service, RouterOutlet, ActivatedRoute, RouterState', L10_1],
    ['Configuring routes', 'A Routes array of path plus component objects', L10_1],
    ['provideRouter()', 'Registers the router in the application providers', L10_1],
    ['Router outlet', 'Placeholder where the matched component is rendered', L10_1],
    ['RouterLink', 'Directive for navigation links without page reload', L10_1],
    ['RouterLinkActive', 'Adds a CSS class to the link of the active route', L10_1],
    ['Programmatic navigation', 'router.navigate() from code', L10_2],
    ['Navigation extras', 'Options such as replaceUrl, state, queryParams, relativeTo', L10_2],
    ['Route parameters', 'Dynamic path segments like /users/:id', L10_2],
    ['Query parameters', 'Optional key-value pairs after ? in the URL', L10_2],
    ['Reading route parameters', 'ActivatedRoute, paramMap, or withComponentInputBinding', L10_2],
    ['Optional route parameters', 'Matrix params and query params for optional data', L10_2],
    ['Child routes', 'Routes declared in the children array', L10_3],
    ['Nested routes', 'Child components rendered in a nested router-outlet', L10_3],
    ['Redirect routes', 'redirectTo with pathMatch', L10_3],
    ['Wildcard routes', 'The ** route matching anything', L10_3],
    ['404 Not Found pages', 'A wildcard route showing a NotFound component', L10_3],
    ['Route ordering', 'First match wins, so order specific to generic', L10_3],
    ['Lazy loading components', 'loadComponent downloads a component on demand', L10_4],
    ['Lazy loading route configurations', 'loadChildren downloads a whole route tree on demand', L10_4],
    ['Route guards', 'Functions that allow or block navigation', L10_5],
    ['CanActivate', 'Can the user enter this route?', L10_5],
    ['CanActivateChild', 'Can the user enter any child route?', L10_5],
    ['CanDeactivate', 'Can the user leave (unsaved changes)?', L10_5],
    ['CanMatch', 'Should this route even match (feature flags, roles)?', L10_5],
    ['Functional route guards', 'Guards written as plain functions using inject()', L10_5],
    ['Route resolvers', 'Load data before the route activates', L10_6],
    ['ResolveFn', 'The type of a functional resolver', L10_6],
    ['Route data', 'Static data attached to a route', L10_6],
    ['Route titles', 'Setting document.title per route', L10_6],
    ['Router events', 'Observable stream of navigation events', L10_7],
    ['Navigation lifecycle', 'The phases from NavigationStart to NavigationEnd', L10_7],
    ['Preloading strategies', 'Download lazy chunks in the background', L10_4],
    ['Custom preloading', 'Your own PreloadingStrategy class', L10_4],
    ['Route-level providers', 'providers array on a route creating a route injector', L10_6],
    ['Protected routes', 'Combining guards with a login flow', L10_5],
    ['Role-based navigation', 'Roles drive guards and visible menu items', L10_5],
    ['Routing performance', 'Lazy loading, preloading, component input binding, trackers', L10_4],
    ['Router testing', 'RouterTestingHarness and provideRouter in tests', L10_7],
  ]),

  topic(
    'ngs-m10-router-basics',
    L10_1,
    [
      blk(`<h3>What is routing?</h3>
• An Angular app is a <b>single page application</b>: the browser loads <code>index.html</code> once. <b>Routing</b> swaps which component is shown when the URL changes, without a full page reload, like changing TV channels while the TV stays on.<br>
• Java comparison: Spring MVC maps a URL to a controller method on the server; the <b>Angular Router</b> maps a URL to a component in the browser.<br>
• Three pieces: a <b>routes</b> array (the map), <code>&lt;router-outlet&gt;</code> (where the page appears) and <b>RouterLink</b> (clickable links).`,
        `// app.routes.ts - configuring routes
import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { AboutComponent } from './about.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },        // /
  { path: 'about', component: AboutComponent },  // /about
];

// app.config.ts - provideRouter registers the router
export const appConfig: ApplicationConfig = { providers: [provideRouter(routes)] };`,
        `// app.component.ts - outlet and links
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: '<nav><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a> <a routerLink="/about" routerLinkActive="active">About</a></nav><router-outlet />',
})
export class AppComponent {}`),
    ],
    [
      blk(`<h3>Using the router building blocks</h3>
• <b>provideRouter(routes, ...features)</b> replaces <code>RouterModule.forRoot</code>. Features are added as arguments: <code>withComponentInputBinding()</code>, <code>withRouterConfig()</code>, <code>withPreloading()</code>, <code>withInMemoryScrolling()</code>, <code>withViewTransitions()</code>, <code>withDebugTracing()</code>.<br>
• <b>RouterLink</b> accepts a string, an array of segments (<code>[ '/users', user.id ]</code>), plus <code>[queryParams]</code>, <code>fragment</code> and <code>relativeTo</code>. It renders a real <code>href</code>, so open in new tab and SEO work.<br>
• <b>RouterLinkActive</b> adds one or more CSS classes when the link URL matches the current URL; use <code>[routerLinkActiveOptions]="{ exact: true }"</code> for the home link, otherwise "/" is always active.<br>
• Named outlets (<code>&lt;router-outlet name="side"&gt;</code>) allow auxiliary routes.`,
        `// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),                       // route params become @Input / input()
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withViewTransitions(),                             // animated page transitions
    ),
    provideHttpClient(),
  ],
});`),
    ],
    [
      blk(`<h3>Router architecture internals</h3>
• The <b>Router</b> service holds the current <b>RouterState</b>, a tree of <b>ActivatedRouteSnapshot</b>/<b>ActivatedRoute</b> objects mirroring the matched route tree. Each <code>RouterOutlet</code> renders the component of the route at its depth. URL parsing is done by <code>UrlSerializer</code> into a <code>UrlTree</code>.<br>
• Matching: <code>recognize</code> walks the config depth-first, applies <code>CanMatch</code>, applies the first matching route, and builds the state. Then guards, resolvers and activation run (see lifecycle lesson).<br>
• URL strategy: <code>PathLocationStrategy</code> (HTML5 pushState, needs server fallback to index.html; in Spring Boot add a forward from unknown paths to <code>/index.html</code>) or <code>HashLocationStrategy</code> (<code>withHashLocation()</code>, works without server rules).<br>
• Route reuse: navigating to the same route with different params reuses the component instance, so ngOnInit does not re-run. Subscribe to <code>paramMap</code> or use input binding (see next lesson). A custom <code>RouteReuseStrategy</code> can cache components.<br>
• Version notes: <code>RouterModule.forRoot</code> is legacy but supported. Since v16 <code>withComponentInputBinding</code>; v17 added view transitions; v18-19 introduced <code>redirectTo</code> as function.`),
    ],
    [
      ['What is the Angular Router and what are its core parts?', 'It maps URL paths to components inside a single page app. Core parts: the Routes configuration, the Router service, RouterOutlet where components render, RouterLink for links, and ActivatedRoute for reading route information.'],
      ['How do you set up routing in a standalone app?', 'Define a Routes array and pass it to provideRouter(routes) in the application config providers, then place <router-outlet> in a template.'],
      ['Why use routerLink rather than href?', 'routerLink navigates through the Router without reloading the page and still renders a real href. A plain href triggers a full page reload and loses app state.'],
      ['What does RouterLinkActive do and why exact: true for home?', 'It toggles CSS classes on the link whose URL matches the current route. The root link "/" is a prefix of every URL, so without exact matching it would always be active.'],
      ['Hash vs path location strategy?', 'Path strategy gives clean URLs but the server must return index.html for unknown paths; hash strategy puts the route after # and needs no server configuration.'],
    ],
  ),

  topic(
    'ngs-m10-navigation-params',
    L10_2,
    [
      blk(`<h3>Moving between pages and passing data</h3>
• <b>Programmatic navigation</b> means navigating from TypeScript code with <code>router.navigate()</code>, for example after a successful login.<br>
• <b>Route parameters</b> are parts of the path: <code>/users/42</code> matches <code>users/:id</code>. <b>Query parameters</b> come after a question mark: <code>/search?term=java&amp;page=2</code>. Rule of thumb: identifiers in the path, filters and optional things in the query.<br>
• <b>Optional route parameters</b> are normally query parameters (or matrix params like <code>;sort=asc</code>).`,
        `// routes
{ path: 'users/:id', component: UserDetailComponent }

// app.component.html
// <a [routerLink]="['/users', 42]">User 42</a>
// <a routerLink="/search" [queryParams]="{ term: 'java', page: 2 }">Search</a>

// login.component.ts
private router = inject(Router);
onLoginSuccess() {
  this.router.navigate(['/dashboard']);        // programmatic navigation
}`),
    ],
    [
      blk(`<h3>Reading route parameters</h3>
Three ways, newest first:<br>
1. <b>Component input binding</b> (<code>withComponentInputBinding()</code>, v16+): route params, query params, data and resolved data are set directly on matching <code>input()</code>s. Cleanest, signal friendly.<br>
2. <b>ActivatedRoute observables</b>: <code>paramMap</code> and <code>queryParamMap</code> emit on every change, required when the component is reused for different ids.<br>
3. <b>Snapshot</b>: <code>route.snapshot.paramMap.get('id')</code>, a one-time read; stale if the component is reused.`,
        `// user-detail.component.ts - input binding (needs withComponentInputBinding())
@Component({ selector: 'app-user-detail', template: '<h2>User {{ id() }} tab {{ tab() }}</h2>' })
export class UserDetailComponent {
  id = input.required<string>();      // from /users/:id
  tab = input<string>('info');        // from ?tab=...
  user = toSignal(toObservable(this.id).pipe(switchMap(id => inject(UserService).get(id))));
}

// classic: ActivatedRoute
export class UserDetail2Component {
  private route = inject(ActivatedRoute);
  id$ = this.route.paramMap.pipe(map(p => p.get('id')));
  page$ = this.route.queryParamMap.pipe(map(q => Number(q.get('page') ?? 1)));
}`),
      blk(`<h3>Navigation extras</h3>
<b>NavigationExtras</b> is the second argument of <code>navigate</code>: <code>queryParams</code>, <code>queryParamsHandling</code> ('merge' or 'preserve'), <code>fragment</code>, <code>relativeTo</code>, <code>replaceUrl</code> (do not add a history entry), <code>skipLocationChange</code>, <code>state</code> (hidden data in history), <code>onSameUrlNavigation</code>. <code>navigateByUrl('/a/b?x=1')</code> takes a full URL string.`,
        `private router = inject(Router);
private route = inject(ActivatedRoute);

go() {
  this.router.navigate(['/users', 42], { queryParams: { tab: 'orders' }, fragment: 'top' });
}
filter(term: string) {
  this.router.navigate([], {                    // stay on the same route
    relativeTo: this.route,
    queryParams: { term, page: 1 },
    queryParamsHandling: 'merge',               // keep other query params
    replaceUrl: true,                           // do not pollute back history
  });
}
afterSave(id: number) {
  this.router.navigate(['/orders', id], { state: { justCreated: true } });   // read via router.getCurrentNavigation()?.extras.state
}`),
    ],
    [
      blk(`<h3>Pitfalls and best practices</h3>
• Same component, different id: Angular reuses the instance, so <b>ngOnInit does not run again</b>. Use observables, input signals or <code>switchMap</code> from <code>toObservable(id)</code>.<br>
• Always <b>URL-encode</b> is automatic for navigate arrays; building URL strings by hand with user text is an injection and bug source. Prefer <code>UrlTree</code> via <code>router.createUrlTree()</code> and guards returning UrlTrees.<br>
• Route params are strings: convert with <code>numberAttribute</code> transform: <code>input({ transform: numberAttribute })</code>.<br>
• Put shareable state (filters, page, sort) in query params: refresh and bookmarks work, and the back button behaves. Do not put secrets or large objects in URLs or <code>state</code> (<code>state</code> is lost on reload in some flows).<br>
• Relative navigation (<code>relativeTo</code>) keeps feature routes movable.`,
        `// typed numeric input from the route
id = input.required<number, string>({ transform: numberAttribute });

// router.navigate returns Promise<boolean>
const ok = await this.router.navigate(['/orders']);   // false if a guard blocked it`),
    ],
    [
      ['Route parameter vs query parameter?', 'Route params are part of the path and identify a resource (/users/42), required for matching. Query params follow ? and are optional, used for filters, paging and sorting.'],
      ['How can a component read route params in modern Angular?', 'With withComponentInputBinding the param becomes an input. Otherwise inject ActivatedRoute and use paramMap / queryParamMap observables, or the snapshot for one-off reads.'],
      ['Why does my component not refresh when /users/1 changes to /users/2?', 'The Router reuses the component instance for the same route config, so ngOnInit does not run again. React to paramMap (or an input signal) changes instead.'],
      ['Name some NavigationExtras.', 'queryParams, queryParamsHandling, fragment, relativeTo, replaceUrl, skipLocationChange, state, onSameUrlNavigation.'],
      ['navigate vs navigateByUrl?', 'navigate takes a commands array and extras and supports relative navigation; navigateByUrl takes an absolute URL string or UrlTree and is always absolute.'],
    ],
  ),

  topic(
    'ngs-m10-structure-routes',
    L10_3,
    [
      blk(`<h3>Child routes, redirects and not-found pages</h3>
• <b>Child routes</b> are routes inside a parent route's <code>children</code> array. The parent component (a layout with a menu) contains its own <code>&lt;router-outlet&gt;</code> where the child appears: these are <b>nested routes</b>. Think of a house (parent) with rooms (children).<br>
• A <b>redirect route</b> sends one URL to another: <code>{ path: '', redirectTo: 'home', pathMatch: 'full' }</code>.<br>
• A <b>wildcard route</b> <code>path: '**'</code> matches anything left over; use it for the <b>404 Not Found page</b>.<br>
• <b>Route ordering</b>: the router takes the first match, so put specific routes first and the wildcard last.`,
        `export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },       // redirect route
  { path: 'home', component: HomeComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,           // contains <router-outlet> for the children
    children: [                                // child routes: /admin/users, /admin/reports
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: AdminUsersComponent },
      { path: 'reports', component: AdminReportsComponent },
    ],
  },
  { path: '**', component: NotFoundComponent },  // wildcard / 404, always last
];`),
    ],
    [
      blk(`<h3>Layout routes and pathMatch</h3>
• <b>pathMatch: 'full'</b> means the whole remaining URL must equal the path; <b>'prefix'</b> (default) matches when the URL starts with the path. An empty-path redirect without 'full' would match every URL: infinite redirect.<br>
• A <b>componentless route</b> (no component, only children) groups routes to share guards, data or providers without adding a layout.<br>
• Relative links inside children (<code>routerLink="users"</code>) resolve against the parent route.<br>
• A 404 page should also set a proper status when using SSR. A redirect can be a function (v18+): <code>redirectTo: (data) =&gt; '/new/' + data.params['id']</code>.`,
        `export const routes: Routes = [
  {
    path: 'shop',
    canActivateChild: [authGuard],             // shared by all children
    data: { section: 'shop' },
    children: [                                // componentless grouping route
      { path: 'products', component: ProductListComponent },
      { path: 'products/:id', component: ProductDetailComponent },
    ],
  },
  { path: 'old-path/:id', redirectTo: (r) => '/shop/products/' + r.params['id'] },
  { path: '**', component: NotFoundComponent, title: 'Page not found' },
];`),
    ],
    [
      blk(`<h3>Matching rules and pitfalls</h3>
• The router matches <b>depth-first, in config order</b>. A greedy route such as <code>:slug</code> placed before <code>about</code> swallows it. Put static segments before parameterised ones.<br>
• Custom <code>UrlMatcher</code> functions handle patterns like <code>@username</code> that the path syntax cannot express.<br>
• Nested route trees mean many outlets; keep nesting shallow (2-3 levels) for readability. Use feature-level route files (<code>admin.routes.ts</code>) loaded with <code>loadChildren</code>.<br>
• Wildcard inside a lazy child only catches unmatched URLs under that parent; add a top-level <code>**</code> as well.<br>
• Trailing-slash, case-sensitivity and relative redirect (<code>redirectTo: 'home'</code> vs <code>'/home'</code>) are frequent bugs: a leading slash makes it absolute.`,
        `// custom matcher for URLs like /@asha
export function userMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  return segments.length === 1 && segments[0].path.startsWith('@')
    ? { consumed: segments, posParams: { username: new UrlSegment(segments[0].path.slice(1), {}) } }
    : null;
}
{ matcher: userMatcher, component: ProfileComponent }`),
    ],
    [
      ['What are child routes and how do they render?', 'Routes in a parent route children array. The parent component hosts a nested router-outlet in which the matched child component renders.'],
      ['Why does pathMatch full matter on a redirect with an empty path?', 'With the default prefix, an empty path is a prefix of every URL, so the redirect would match everything and loop. full requires the whole URL to be empty.'],
      ['How do you build a 404 page?', 'Add a wildcard route path ** as the last entry that renders a NotFound component (optionally with a title).'],
      ['Why does route order matter?', 'The router uses the first matching route, so a generic or parameterised route defined earlier can hide specific ones, and the wildcard must be last.'],
      ['What is a componentless route used for?', 'Grouping child routes under one path so they share guards, data, resolvers or providers without a wrapper component.'],
    ],
  ),

  topic(
    'ngs-m10-lazy-loading',
    L10_4,
    [
      blk(`<h3>Load code only when needed</h3>
• By default all code ships in one big file. <b>Lazy loading</b> splits the app into chunks that the browser downloads only when the user visits that route, like ordering food only when you are hungry instead of carrying the whole menu.<br>
• <b>Lazy loading components</b>: <code>loadComponent: () =&gt; import('./x').then(m =&gt; m.XComponent)</code>.<br>
• <b>Lazy loading route configurations</b>: <code>loadChildren: () =&gt; import('./admin/admin.routes').then(m =&gt; m.ADMIN_ROUTES)</code> loads a whole feature's route tree.`,
        `// app.routes.ts
export const routes: Routes = [
  { path: '', component: HomeComponent },                                   // in the main bundle
  { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },
];

// admin/admin.routes.ts
export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminHomeComponent },
  { path: 'users', component: AdminUsersComponent },
];
// shorthand when the file has a default export: loadComponent: () => import('./x.component')`),
    ],
    [
      blk(`<h3>Preloading strategies and custom preloading</h3>
• <b>Preloading strategies</b> download lazy chunks in the background after the first page is ready. Built in: <code>NoPreloading</code> (default) and <code>PreloadAllModules</code>. Enable with <code>withPreloading(PreloadAllModules)</code>.<br>
• <b>Custom preloading</b>: implement <code>PreloadingStrategy</code> and preload only routes marked with <code>data: { preload: true }</code>, or only on fast connections.`,
        `// selective-preload.strategy.ts
@Injectable({ providedIn: 'root' })
export class SelectivePreload implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    const conn = (navigator as any).connection;
    const slow = conn?.saveData || /2g/.test(conn?.effectiveType ?? '');
    return route.data?.['preload'] && !slow ? load() : of(null);   // load() triggers the download
  }
}

// app.config.ts
provideRouter(routes, withPreloading(SelectivePreload));
// route: { path: 'reports', loadComponent: ..., data: { preload: true } }`),
    ],
    [
      blk(`<h3>Routing performance</h3>
• Lazy load every feature that is not on the landing path; check the result with <code>ng build --stats-json</code> and a bundle analyzer. Keep the initial bundle small.<br>
• Avoid importing lazy components elsewhere (static imports pull them into the main bundle); share code through a shared file, not through cross-feature imports.<br>
• Use <code>withComponentInputBinding</code> (less subscription code), <code>@defer</code> for in-page chunks, <code>withViewTransitions</code> for perceived speed, and resolvers or skeletons to avoid blank screens.<br>
• Guards and resolvers run sequentially or in parallel depending on type; keep them fast and cache their data. Route-level <code>canMatch</code> prevents downloading a chunk the user may not access.<br>
• Chunks are content-hashed; after a deploy, users with an old tab may fail with a ChunkLoadError: handle it by reloading (global error handler) and by serving old assets for a while.<br>
• Version: functional <code>loadComponent</code>/<code>loadChildren</code> with default exports since v15; <code>PreloadAllModules</code> name remains although modules are optional.`),
    ],
    [
      ['loadComponent vs loadChildren?', 'loadComponent lazily loads a single standalone component for a route; loadChildren lazily loads a set of child routes (a feature route file) for a path prefix.'],
      ['What is preloading and why use it?', 'Downloading lazy chunks in the background after the initial load so later navigation is instant, while keeping the first load small.'],
      ['How do you preload only some routes?', 'Write a custom PreloadingStrategy that checks route.data (for example preload: true) or network conditions and returns load() or of(null).'],
      ['What accidentally defeats lazy loading?', 'Importing a lazy component or its feature files statically from eagerly loaded code, which pulls them into the main bundle.'],
      ['How do you reduce routing-related startup cost?', 'Lazy load features, use canMatch to avoid fetching unauthorised chunks, preload selectively, keep guards and resolvers fast, and analyse bundles with stats.'],
    ],
  ),

  topic(
    'ngs-m10-guards',
    L10_5,
    [
      blk(`<h3>Route guards: the bouncers of your app</h3>
• A <b>route guard</b> decides whether a navigation may continue. Like a security guard at a door it returns <code>true</code> (come in), <code>false</code> (stay out), or a <code>UrlTree</code> (go there instead, e.g. the login page).<br>
• <b>CanActivate</b>: may I enter this route? <b>CanActivateChild</b>: may I enter any child? <b>CanDeactivate</b>: may I leave (unsaved changes)? <b>CanMatch</b>: should this route even be considered?<br>
• Modern guards are <b>functional route guards</b>: plain functions (<code>CanActivateFn</code>) that use <code>inject()</code>. Class-based guards are legacy and deprecated.`,
        `// auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });   // redirect
};

// routes
{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }`),
    ],
    [
      blk(`<h3>The four guard types</h3>
<table ${TABLE}><thead><tr><th>Guard</th><th>When</th><th>Typical use</th></tr></thead><tbody>
<tr><td>canMatch</td><td>While matching, before lazy chunk download</td><td>Role/feature-flag based route variants</td></tr>
<tr><td>canActivate</td><td>Before entering a route</td><td>Login required</td></tr>
<tr><td>canActivateChild</td><td>Before entering any child</td><td>Guard a whole section once</td></tr>
<tr><td>canDeactivate</td><td>Before leaving</td><td>Unsaved-changes confirmation</td></tr></tbody></table>`),
      blk(`<h3>Protected routes and role-based navigation</h3>
• <b>Protected routes</b> combine <code>canActivate</code> with a login flow: redirect to <code>/login?returnUrl=...</code> and navigate back after success.<br>
• <b>Role-based navigation</b>: put the allowed roles in route <code>data</code>, read them in one reusable guard factory, and hide menu items the user cannot open (UI hint only).`,
        `// role.guard.ts - guard factory
export const hasRole = (...roles: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  return roles.some(r => auth.roles().includes(r)) || inject(Router).createUrlTree(['/forbidden']);
};

// routes
{ path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  canMatch: [hasRole('ADMIN')] },                       // chunk not even downloaded for others
{ path: 'reports', component: ReportsComponent, canActivate: [authGuard, hasRole('ADMIN', 'MANAGER')] }

// unsaved changes
export interface HasUnsaved { hasUnsaved(): boolean; }
export const leaveGuard: CanDeactivateFn<HasUnsaved> = c => !c.hasUnsaved() || confirm('Discard changes?');`),
    ],
    [
      blk(`<h3>Guard internals and security reality</h3>
• Guards may return <code>boolean | UrlTree | Observable | Promise</code> (and <code>RedirectCommand</code> from v18.1+ to control redirect navigation extras). Observables must complete or the navigation hangs: add <code>take(1)</code> / <code>first()</code>.<br>
• Order: <b>canMatch</b> then <b>canDeactivate</b> (leaving), <b>canActivateChild</b> (parent to child), <b>canActivate</b> (parent to child). Guards of the same type run in parallel unless <code>runGuardsAndResolvers</code> / async redirects short-circuit; the first <code>false</code>/<code>UrlTree</code> wins.<br>
• Prefer returning a <code>UrlTree</code> to calling <code>router.navigate</code> inside a guard (which cancels the current navigation inconsistently).<br>
• <b>Security</b>: guards are only UX. The JavaScript is in the browser and can be modified. The Spring Boot API must authorise every request (<code>@PreAuthorize</code>, method security). Never rely on a guard to protect data.<br>
• Use <code>canMatch</code> rather than <code>canActivate</code> for lazy features you want hidden; use <code>canActivateChild</code> or a componentless parent route to avoid repeating guards. Class guards (<code>CanActivate</code> interface) are deprecated since v15.2.`,
        `// guard that waits for the auth state to load
export const readyAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return toObservable(auth.loaded).pipe(
    filter(Boolean), take(1),                                   // must complete!
    map(() => auth.isLoggedIn() || router.createUrlTree(['/login'])),
  );
};`),
    ],
    [
      ['What is a route guard and what can it return?', 'A function/class run by the router to allow or block navigation. It returns true, false, or a UrlTree (redirect), directly or as Observable/Promise.'],
      ['canActivate vs canMatch?', 'canMatch runs while the router is matching and can make a route not match at all (so the lazy chunk is not downloaded and another route with the same path can match). canActivate runs after matching to allow or deny entry.'],
      ['How do you prevent losing unsaved form changes?', 'Add a canDeactivate guard that asks the component (via an interface) whether it has unsaved changes and shows a confirmation.'],
      ['Are guards enough to secure an app?', 'No. They only improve user experience. All authorisation must be enforced by the backend API (for example Spring Security), because client code can be bypassed.'],
      ['Why prefer functional guards?', 'Less boilerplate, composable guard factories, use inject() directly, and class-based guards are deprecated.'],
      ['Why might navigation hang in a guard?', 'The returned Observable never completes. Use take(1) or first().'],
    ],
  ),

  topic(
    'ngs-m10-resolvers-data',
    L10_6,
    [
      blk(`<h3>Data, titles and resolvers</h3>
• <b>Route data</b>: static information attached to a route with <code>data: { ... }</code>, such as breadcrumb text or required roles.<br>
• <b>Route titles</b>: <code>title: 'Orders'</code> sets <code>document.title</code> automatically for each route.<br>
• A <b>route resolver</b> fetches data <b>before</b> the page shows, so the component never renders half empty. Think of a waiter bringing your meal to the table instead of you cooking it at the table.`,
        `{
  path: 'orders/:id',
  component: OrderDetailComponent,
  title: 'Order details',                       // route title
  data: { breadcrumb: 'Order' },                // route data
  resolve: { order: orderResolver },            // resolver
}`),
    ],
    [
      blk(`<h3>ResolveFn and reading resolved data</h3>
• <b>ResolveFn&lt;T&gt;</b> is the type of a functional resolver. It may return a value, Promise or Observable (which must complete or emit once).<br>
• Read resolved data with an input of the same name (with <code>withComponentInputBinding</code>) or <code>route.data</code>.<br>
• Dynamic titles use <code>TitleResolveFn</code> or a custom <code>TitleStrategy</code>.`,
        `// order.resolver.ts
export const orderResolver: ResolveFn<Order> = (route, state) => {
  const id = route.paramMap.get('id')!;
  return inject(OrderService).get(id).pipe(
    catchError(() => { inject(Router).navigate(['/not-found']); return EMPTY; }),   // EMPTY cancels navigation
  );
};

// dynamic title
{ path: 'orders/:id', component: OrderDetailComponent,
  title: (route) => 'Order #' + route.paramMap.get('id'),
  resolve: { order: orderResolver } }

// order-detail.component.ts
export class OrderDetailComponent {
  order = input.required<Order>();            // filled from the resolver
}`),
      blk(`<h3>Route-level providers</h3>
A route can have a <code>providers</code> array. Angular creates an <b>environment injector</b> for that route (and its children), giving feature-scoped services without a NgModule. Services are created when the route is first activated and live as long as the route config is loaded.`,
        `{
  path: 'checkout',
  providers: [CheckoutStore, { provide: PAYMENT_API, useValue: '/api/pay' }],   // scoped to /checkout/**
  children: [
    { path: '', component: CartStepComponent },
    { path: 'pay', component: PayStepComponent },
  ],
}`),
    ],
    [
      blk(`<h3>Resolver trade-offs and best practices</h3>
• A resolver <b>blocks navigation</b> until it finishes: slow APIs make the app feel frozen, with the previous page staying visible. Often better: navigate immediately and show a skeleton, using a signal/resource in the component. Use resolvers for data the page cannot render without, or when you need to redirect on a 404 before the page appears.<br>
• Resolvers re-run only when params change by default; control with <code>runGuardsAndResolvers: 'paramsOrQueryParamsChange' | 'always'</code>.<br>
• Handle errors: an error thrown in a resolver cancels the navigation (a <code>NavigationError</code> event). Return <code>EMPTY</code> or a <code>RedirectCommand</code> (v18.1+) deliberately.<br>
• Route data merges parent data into children only with <code>paramsInheritanceStrategy: 'always'</code> (<code>withRouterConfig</code>) for componentless/empty-path parents.<br>
• Route-level providers are tree-shakable alternatives to <code>providedIn: 'root'</code> for stateful feature services: state resets when leaving the route tree is destroyed only if the route's injector is destroyed (lazy loaded config injectors live on). For per-visit state, provide in the component's <code>providers</code>.`),
    ],
    [
      ['What is a resolver and when would you use one?', 'A function run before activation that fetches data the route needs, so the component renders with data ready. Use it when the page cannot render without the data or to redirect on missing data; otherwise prefer loading states.'],
      ['What is ResolveFn?', 'The TypeScript type of a functional resolver: (route, state) => T | Observable<T> | Promise<T>.'],
      ['How does a component receive resolved data?', 'Through route.data (ActivatedRoute) or, with withComponentInputBinding, as an input named like the resolve key.'],
      ['How do you set a dynamic page title?', 'Use title as a function or ResolveFn on the route, or provide a custom TitleStrategy.'],
      ['What are route-level providers?', 'A providers array on a route that creates an environment injector scoped to that route subtree, so feature services need no NgModule.'],
    ],
  ),

  topic(
    'ngs-m10-events-testing',
    L10_7,
    [
      blk(`<h3>Router events and the navigation lifecycle</h3>
• The router announces what it is doing through an observable, <code>router.events</code>. Typical use: show a loading bar while navigating.<br>
• <b>Navigation lifecycle</b> in short: <b>NavigationStart</b>, route recognised, guards run, resolvers run, <b>ActivationStart</b>, components activate, <b>NavigationEnd</b> (or <b>NavigationCancel</b> / <b>NavigationError</b>).`,
        `// app.component.ts
export class AppComponent {
  loading = signal(false);
  constructor() {
    inject(Router).events.pipe(takeUntilDestroyed()).subscribe(e => {
      if (e instanceof NavigationStart) this.loading.set(true);
      if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) this.loading.set(false);
    });
  }
}`),
    ],
    [
      blk(`<h3>Events in detail and router testing</h3>
Order of events: <code>NavigationStart</code>, <code>RoutesRecognized</code>, <code>GuardsCheckStart</code>, <code>ChildActivationStart</code>, <code>ActivationStart</code>, <code>GuardsCheckEnd</code>, <code>ResolveStart</code>, <code>ResolveEnd</code>, <code>ActivationEnd</code>, <code>ChildActivationEnd</code>, <code>NavigationEnd</code> (v17+ adds <code>NavigationSkipped</code>). Filter with <code>filter((e): e is NavigationEnd =&gt; e instanceof NavigationEnd)</code>.<br>
<b>Router testing</b>: use <code>provideRouter(routes)</code> and <code>RouterTestingHarness</code> (v15.2+) to navigate and get a fixture for the routed component. Use <code>provideRouter([])</code> with a stubbed Router for isolated unit tests.`,
        `// orders.routes.spec.ts
it('redirects anonymous users to login', async () => {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes), { provide: AuthService, useValue: { isLoggedIn: () => false } }],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl('/dashboard');                       // guard runs
  expect(TestBed.inject(Router).url).toBe('/login?returnUrl=%2Fdashboard');
});

it('renders the order detail', async () => {
  const harness = await RouterTestingHarness.create('/orders/7');
  const cmp = await harness.navigateByUrl('/orders/7', OrderDetailComponent);   // typed component instance
  expect(cmp.order().id).toBe(7);
});`),
    ],
    [
      blk(`<h3>Lifecycle details worth knowing</h3>
• Navigation is <b>transitional and cancelable</b>: a new navigation cancels the previous one (<code>NavigationCancel</code> with a code), so make guards and resolvers cancellation friendly (observables get unsubscribed).<br>
• Phases: parse URL, apply redirects (<code>applyRedirects</code>), recognize, run guards (canMatch, canDeactivate, canActivateChild, canActivate), resolve data, activate routes (create or reuse components), update the URL (<code>urlUpdateStrategy: 'deferred'</code> by default, after success), scroll.<br>
• <code>router.events</code> is a Subject: subscribe before navigation happens (the constructor of the root component). Use <code>router.navigated</code> and <code>router.url</code> only after NavigationEnd. For scroll restoration and anchors use <code>withInMemoryScrolling</code>.<br>
• In tests, prefer the harness; avoid <code>RouterTestingModule</code> (deprecated). Asynchronous guards need <code>await</code> or <code>fakeAsync</code>+<code>tick</code>.<br>
• Signals: <code>toSignal(router.events.pipe(filter(...)))</code> gives a signal of the latest event; a "currentUrl" signal from NavigationEnd is a common pattern for breadcrumbs.`),
    ],
    [
      ['How do you detect when navigation starts and ends?', 'Subscribe to router.events and check instances of NavigationStart and NavigationEnd (also NavigationCancel and NavigationError to hide a spinner reliably).'],
      ['Describe the navigation lifecycle.', 'URL parsed and redirects applied, routes recognised, guards run, resolvers run, components activated, URL updated, NavigationEnd emitted. Failures emit NavigationCancel or NavigationError.'],
      ['How do you test a route guard end to end?', 'Configure TestBed with provideRouter(routes) and stub services, create a RouterTestingHarness, navigate to the protected URL and assert the resulting router URL or rendered component.'],
      ['What happens when a new navigation starts during an ongoing one?', 'The router cancels the earlier navigation (NavigationCancel) and processes the latest, unsubscribing from in-flight guards and resolvers.'],
    ],
  ),
];

// ---------------------------------------------------------------- Module 11
const L11_1 = 'Template-driven vs reactive forms';
const L11_2 = 'Form model: FormControl, FormGroup, FormArray, FormBuilder';
const L11_3 = 'Form states and built-in validators';
const L11_4 = 'Custom, cross-field and async validation, error messages';
const L11_5 = 'Dynamic, nested and conditional forms, submit and reset';
const L11_6 = 'Custom form controls and ControlValueAccessor';
const L11_7 = 'Form accessibility, testing and performance';

const m11: Topic[] = [
  ov(11, 'Forms collect and validate user input. Angular gives two approaches, <b>template-driven</b> and <b>reactive</b>, plus a validation system and tools for dynamic forms.', [
    ['Forms in Angular', 'Two ways to bind inputs to data and validate them', L11_1],
    ['Template-driven forms', 'Form logic mostly in the HTML using ngModel', L11_1],
    ['Reactive forms', 'Form model built in TypeScript', L11_1],
    ['Template-driven vs reactive forms', 'When to choose which', L11_1],
    ['FormsModule', 'Import that enables ngModel and template forms', L11_1],
    ['ReactiveFormsModule', 'Import that enables formControl, formGroup, formArray', L11_1],
    ['FormControl', 'Model of one input value and its state', L11_2],
    ['FormGroup', 'Model of a set of named controls', L11_2],
    ['FormArray', 'Model of a list of controls', L11_2],
    ['FormBuilder', 'Shortcut service to create controls', L11_2],
    ['NonNullableFormBuilder', 'Builder whose controls reset to initial value, not null', L11_2],
    ['Typed reactive forms', 'Controls and values are strongly typed (v14+)', L11_2],
    ['FormControl states', 'Status flags like valid, dirty, touched', L11_3],
    ['Dirty and pristine states', 'Has the user changed the value?', L11_3],
    ['Touched and untouched states', 'Has the user visited the field (blur)?', L11_3],
    ['Valid and invalid states', 'Do all validators pass?', L11_3],
    ['Built-in validators', 'The Validators class', L11_3],
    ['Required validation', 'Validators.required', L11_3],
    ['Minimum and maximum length', 'minLength, maxLength, min, max', L11_3],
    ['Email validation', 'Validators.email', L11_3],
    ['Pattern validation', 'Validators.pattern with a regular expression', L11_3],
    ['Custom validators', 'Your own ValidatorFn', L11_4],
    ['Cross-field validation', 'Validator on the group comparing fields', L11_4],
    ['Asynchronous validators', 'Validation that calls the server', L11_4],
    ['Dynamic forms', 'Build the form from metadata', L11_5],
    ['Nested forms', 'FormGroups inside FormGroups', L11_5],
    ['FormArray for dynamic fields', 'Add and remove rows at runtime', L11_5],
    ['Conditional form fields', 'Show, enable or require fields depending on other values', L11_5],
    ['Form submission', 'ngSubmit and sending getRawValue / value', L11_5],
    ['Resetting forms', 'reset() and initial values', L11_5],
    ['Form error messages', 'Mapping errors to readable text', L11_4],
    ['Custom form controls', 'Your own reusable input component', L11_6],
    ['ControlValueAccessor', 'The interface that connects a component to forms', L11_6],
    ['Form validation strategies', 'When to show errors: blur, submit, immediately', L11_4],
    ['Server-side validation errors', 'Mapping backend field errors onto controls', L11_4],
    ['Form accessibility', 'Labels, aria attributes, focus management', L11_7],
    ['Form testing', 'Testing validators and form components', L11_7],
    ['Form performance', 'updateOn, OnPush, large forms', L11_7],
  ]),

  topic(
    'ngs-m11-forms-intro',
    L11_1,
    [
      blk(`<h3>Two ways to build forms</h3>
• <b>Forms in Angular</b> connect HTML inputs to TypeScript data, track whether the data is valid, and report errors.<br>
• <b>Template-driven forms</b>: you write the form mostly in HTML with <code>ngModel</code>. Quick for small forms (like filling a paper form: the form defines itself as you write it). Needs <b>FormsModule</b>.<br>
• <b>Reactive forms</b>: you build the form object in TypeScript (<code>FormGroup</code>, <code>FormControl</code>) and bind the HTML to it with <code>[formGroup]</code> and <code>formControlName</code>. More code, but explicit and testable (like an architect's blueprint first). Needs <b>ReactiveFormsModule</b>.`,
        `// template-driven: login.component.ts
@Component({
  selector: 'app-login', imports: [FormsModule],
  template: '<form #f="ngForm" (ngSubmit)="login(f.value)"><input name="email" ngModel required email><button [disabled]="f.invalid">Go</button></form>',
})
export class LoginComponent { login(v: { email: string }) { console.log(v.email); } }`,
        `// reactive: signup.component.ts
@Component({
  selector: 'app-signup', imports: [ReactiveFormsModule],
  template: '<form [formGroup]="form" (ngSubmit)="save()"><input formControlName="email"><button [disabled]="form.invalid">Go</button></form>',
})
export class SignupComponent {
  form = new FormGroup({ email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }) });
  save() { console.log(this.form.getRawValue()); }
}`),
    ],
    [
      blk(`<h3>Choosing between the two</h3>
<table ${TABLE}><thead><tr><th>Aspect</th><th>Template-driven</th><th>Reactive</th></tr></thead><tbody>
<tr><td>Import</td><td>FormsModule</td><td>ReactiveFormsModule</td></tr>
<tr><td>Source of truth</td><td>Template (directives create controls)</td><td>Component class (explicit model)</td></tr>
<tr><td>Data flow</td><td>Asynchronous (model updated after change detection)</td><td>Synchronous, immutable-friendly</td></tr>
<tr><td>Validation</td><td>Directive attributes (required, email)</td><td>Validator functions</td></tr>
<tr><td>Dynamic fields</td><td>Hard</td><td>Easy (FormArray, add/remove controls)</td></tr>
<tr><td>Testing</td><td>Needs rendering</td><td>Plain unit tests</td></tr>
<tr><td>Best for</td><td>Small, simple forms</td><td>Anything non-trivial, enterprise forms</td></tr></tbody></table>
Both can live in one app, but not on the same input. Reactive forms are the default recommendation for real projects.`),
      blk(`<h3>Wiring modules in a standalone app</h3>
Standalone components import the pieces they use: <code>FormsModule</code> (ngModel, ngForm), or <code>ReactiveFormsModule</code> (formGroup, formControlName, formControl, formArrayName). Importing the module gives you the directive set; no <code>provide...</code> call is needed.`,
        `@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],        // or [FormsModule] for template-driven
  templateUrl: './profile.component.html',
})
export class ProfileComponent {}`),
    ],
    [
      blk(`<h3>Under the hood</h3>
• Both approaches use the same model classes: the template-driven directives (<code>NgModel</code>, <code>NgForm</code>) create <code>FormControl</code>/<code>FormGroup</code> instances for you, asynchronously (a microtask later), which is why you cannot read <code>form.controls</code> in <code>ngOnInit</code> with template-driven forms.<br>
• Each control is wired to the DOM element through a <code>ControlValueAccessor</code> (DefaultValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor...), the same mechanism you use for custom controls.<br>
• Reactive forms are observable-based: <code>valueChanges</code> and <code>statusChanges</code> are streams, perfect for RxJS operators like <code>debounceTime</code>. Template-driven forms expose the same on the generated model.<br>
• Angular forms have no built-in signal API yet (as of v20, signal forms are experimental/in development); convert with <code>toSignal(control.valueChanges, { initialValue })</code>.<br>
• Version note: <code>NgModel</code> two-way binding <code>[(ngModel)]</code> works on signals as well: <code>[(ngModel)]="name"</code> where <code>name</code> is a <code>model()</code> or WritableSignal.`),
    ],
    [
      ['Template-driven vs reactive forms?', 'Template-driven defines the form in the template with ngModel directives and is asynchronous and simple; reactive defines the model explicitly in TypeScript, is synchronous, observable-based, easier to test and better for complex or dynamic forms.'],
      ['Which module does each need?', 'Template-driven needs FormsModule; reactive needs ReactiveFormsModule. In standalone components you import them in the component imports.'],
      ['Why does form.controls look empty in ngOnInit for template-driven forms?', 'The controls are created asynchronously by the directives after the first change detection; reactive forms build the model synchronously in code.'],
      ['Can you mix both approaches?', 'Yes in the same app, but not on the same control or form element.'],
    ],
  ),

  topic(
    'ngs-m11-form-model',
    L11_2,
    [
      blk(`<h3>The three building blocks</h3>
• <b>FormControl</b> = one input (a single cell). It holds the value and state.<br>
• <b>FormGroup</b> = a set of named controls (a form or a section). Its value is an object.<br>
• <b>FormArray</b> = an ordered list of controls or groups (rows). Its value is an array.<br>
• <b>FormBuilder</b> is a helper service with short methods <code>group()</code>, <code>control()</code>, <code>array()</code> so you write less code.`,
        `// manual
const profile = new FormGroup({
  name: new FormControl(''),
  address: new FormGroup({ city: new FormControl(''), zip: new FormControl('') }),
  phones: new FormArray([new FormControl('')]),
});

// FormBuilder: same thing, shorter
private fb = inject(FormBuilder);
profile = this.fb.group({
  name: [''],
  address: this.fb.group({ city: [''], zip: [''] }),
  phones: this.fb.array([this.fb.control('')]),
});`),
    ],
    [
      blk(`<h3>Typed forms and NonNullableFormBuilder</h3>
• Since v14 reactive forms are <b>typed</b>: <code>FormControl&lt;string | null&gt;</code>, <code>FormGroup&lt;{ name: FormControl&lt;string&gt; }&gt;</code>. <code>form.value</code> is <code>Partial</code> (disabled controls are omitted); <code>getRawValue()</code> includes everything.<br>
• By default <code>reset()</code> sets a control to <code>null</code>, which makes the type <code>string | null</code>. <b>NonNullableFormBuilder</b> (<code>fb.nonNullable</code>) or <code>{ nonNullable: true }</code> makes <code>reset()</code> go back to the initial value and types as plain <code>string</code>.<br>
• Use <code>FormRecord</code> for dynamic string-keyed groups and <code>UntypedFormGroup</code> only when migrating.`,
        `private fb = inject(NonNullableFormBuilder);

form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],     // FormControl<string>
  age: this.fb.control<number | null>(null, Validators.min(18)),
  tags: this.fb.array<string>([]),                          // FormArray<FormControl<string>>
});

submit() {
  const v = this.form.getRawValue();     // { email: string; age: number | null; tags: string[] }
  this.http.post('/api/users', v).subscribe();
}
// template: <input formControlName="email"> ... [formGroup]="form"`),
      blk(`<h3>Working with the model</h3>
Common API: <code>setValue()</code> (all fields), <code>patchValue()</code> (some fields), <code>get('address.city')</code>, <code>controls.x</code>, <code>addControl/removeControl</code>, <code>disable()/enable()</code>, <code>valueChanges</code> / <code>statusChanges</code>, <code>reset(value)</code>.`,
        `this.form.patchValue({ email: 'asha@example.com' });             // partial update
this.form.controls.email.valueChanges.pipe(debounceTime(300)).subscribe(v => console.log(v));
this.form.get('age')?.disable();`),
    ],
    [
      blk(`<h3>Internals and recommendations</h3>
• <b>FormControlState</b>: a control emits <code>valueChanges</code> before updating validity; <code>statusChanges</code> after. Options <code>{ emitEvent: false }</code> and <code>{ onlySelf: true }</code> control propagation. Since v18 a unified <code>control.events</code> stream emits <code>ValueChangeEvent</code>, <code>StatusChangeEvent</code>, <code>PristineChangeEvent</code>, <code>TouchedChangeEvent</code>, <code>FormSubmittedEvent</code>, <code>FormResetEvent</code>.<br>
• Prefer typed forms end-to-end; avoid <code>as any</code> casts. Create the form once as a field, not in a getter (a getter would recreate it on each change detection).<br>
• Map form value to a DTO explicitly (the Spring Boot request class) rather than posting the raw form blindly; handle <code>null</code>s and number/date conversions in one mapper.<br>
• Do not subscribe to <code>valueChanges</code> without cleanup: use <code>takeUntilDestroyed()</code>.`),
    ],
    [
      ['FormControl vs FormGroup vs FormArray?', 'FormControl holds a single value and its state, FormGroup aggregates named controls into an object, FormArray aggregates an ordered list of controls into an array.'],
      ['What is NonNullableFormBuilder for?', 'It creates controls that are non-nullable: reset() restores the initial value instead of null and the types stay plain (string instead of string | null).'],
      ['setValue vs patchValue?', 'setValue requires a value for every control of the group and throws if shape differs; patchValue updates only the supplied fields.'],
      ['value vs getRawValue?', 'value omits disabled controls; getRawValue includes all controls, enabled or disabled.'],
      ['What did typed reactive forms (v14) change?', 'Controls, groups and arrays carry generic types, so value, setValue and controls access are compile-time checked.'],
    ],
  ),

  topic(
    'ngs-m11-states-validators',
    L11_3,
    [
      blk(`<h3>What state is a form field in?</h3>
Every control keeps <b>FormControl states</b> (CSS classes <code>ng-valid</code>, <code>ng-dirty</code>... are added automatically):<br>
• <b>pristine / dirty</b>: dirty once the user changed the value. <br>
• <b>untouched / touched</b>: touched after the field loses focus (blur).<br>
• <b>valid / invalid</b>: all validators pass or at least one fails. Also <code>pending</code> (async validation running) and <code>disabled</code>.<br>
Good UX: show an error only when the field is <b>invalid and touched</b>, not as soon as the page opens.`,
        `<!-- signup.component.html -->
<input formControlName="email">
@if (email.invalid && (email.dirty || email.touched)) {
  <small class="error">Please enter a valid email.</small>
}
<!-- component: get email() { return this.form.controls.email; } -->`),
    ],
    [
      blk(`<h3>Built-in validators</h3>
<table ${TABLE}><thead><tr><th>Validator</th><th>Meaning</th><th>Error key</th></tr></thead><tbody>
<tr><td>Validators.required</td><td>Value not empty (required validation)</td><td>required</td></tr>
<tr><td>Validators.minLength(n) / maxLength(n)</td><td>Minimum and maximum length of text</td><td>minlength / maxlength</td></tr>
<tr><td>Validators.min(n) / max(n)</td><td>Numeric range</td><td>min / max</td></tr>
<tr><td>Validators.email</td><td>Email validation (simple format check)</td><td>email</td></tr>
<tr><td>Validators.pattern(regex)</td><td>Pattern validation with regular expression</td><td>pattern</td></tr>
<tr><td>Validators.requiredTrue</td><td>Checkbox must be true</td><td>required</td></tr>
<tr><td>Validators.compose / composeAsync</td><td>Combine validators</td><td>-</td></tr></tbody></table>`,
      ),
      blk(`<h3>Using them in both styles</h3>`,
        `// reactive
form = inject(NonNullableFormBuilder).group({
  username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
  email: ['', [Validators.required, Validators.email]],
  age: [18, [Validators.min(18), Validators.max(65)]],
  pincode: ['', Validators.pattern('^[0-9]{6}$')],       // 6 digits
  terms: [false, Validators.requiredTrue],
});`,
        `<!-- template-driven: the same rules as attributes -->
<input name="username" ngModel required minlength="3" maxlength="20" #u="ngModel">
<input name="email" ngModel required email>
<input name="pincode" ngModel pattern="[0-9]{6}">
@if (u.errors?.['minlength']; as e) { <small>Need {{ e.requiredLength }} chars, you typed {{ e.actualLength }}</small> }`),
    ],
    [
      blk(`<h3>Details and gotchas</h3>
• <code>Validators.required</code> treats <code>''</code>, <code>null</code>, empty arrays as missing; <code>0</code> and <code>false</code> are valid values. <code>minLength</code> ignores empty values (combine with <code>required</code>).<br>
• <code>Validators.email</code> is intentionally lax (e.g. accepts <code>a@b</code>); use a stricter <code>pattern</code> or server validation for real checking. A pattern string is anchored automatically with ^ and $; a RegExp is used as is.<br>
• Validity propagates upward: the group is invalid if any child is. <code>updateValueAndValidity()</code> re-runs validators (needed when another field affects validity). <code>markAllAsTouched()</code> on submit reveals all errors.<br>
• Status values: <code>VALID</code>, <code>INVALID</code>, <code>PENDING</code>, <code>DISABLED</code>. Disabled controls are excluded from validation.<br>
• Use the <code>updateOn: 'blur' | 'submit'</code> option to validate less often. Browser <code>novalidate</code> on the form avoids double native validation bubbles (Angular adds it automatically).`),
    ],
    [
      ['Difference between touched and dirty?', 'Touched means the field has been focused and blurred; dirty means its value has been changed by the user. They are independent.'],
      ['Which built-in validators exist?', 'required, requiredTrue, min, max, minLength, maxLength, email, pattern, plus compose and composeAsync helpers, and null validator.'],
      ['When should validation messages be displayed?', 'When the control is invalid and (touched or dirty) or the form was submitted, so users are not shown errors before interaction.'],
      ['Why does minLength not make a field required?', 'Length validators ignore empty values; add Validators.required to enforce presence.'],
      ['How do you show all errors on submit?', 'Call form.markAllAsTouched() (and check form.invalid) before submitting.'],
    ],
  ),

  topic(
    'ngs-m11-custom-validation',
    L11_4,
    [
      blk(`<h3>Your own rules</h3>
• A <b>custom validator</b> is a function that receives a control and returns <code>null</code> when valid or an object describing the error: <code>{ noSpaces: true }</code>.<br>
• <b>Cross-field validation</b> compares several fields (password and confirm password); attach it to the <b>group</b>.<br>
• <b>Form error messages</b>: translate error keys to friendly text in one place.`,
        `// validators.ts
export const noSpaces: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  /\\s/.test(c.value ?? '') ? { noSpaces: true } : null;

// cross-field validator on the group
export const passwordsMatch: ValidatorFn = (g: AbstractControl): ValidationErrors | null => {
  const p = g.get('password')?.value, c = g.get('confirm')?.value;
  return p === c ? null : { mismatch: true };
};

form = this.fb.group({ username: ['', [Validators.required, noSpaces]], password: [''], confirm: [''] }, { validators: passwordsMatch });
// template: @if (form.errors?.['mismatch'] && form.controls.confirm.touched) { <small>Passwords differ</small> }`),
    ],
    [
      blk(`<h3>Parameterised, async validators and error messages</h3>
• A validator with parameters is a <b>factory</b> returning a ValidatorFn.<br>
• <b>Asynchronous validators</b> (<code>AsyncValidatorFn</code>) return an Observable or Promise, e.g. "is this username taken?". While running, status is <code>PENDING</code>. They run only after all sync validators pass. Use <code>debounceTime</code> via <code>timer</code> and <code>switchMap</code>, and <code>updateOn: 'blur'</code> to limit requests.`,
        `export const minAge = (min: number): ValidatorFn => c => {
  const years = new Date().getFullYear() - new Date(c.value).getFullYear();
  return years >= min ? null : { minAge: { required: min, actual: years } };
};

// async validator calling Spring Boot: GET /api/users/exists?username=asha
export const uniqueUsername = (http: HttpClient): AsyncValidatorFn => c =>
  timer(400).pipe(                                               // debounce
    switchMap(() => http.get<boolean>('/api/users/exists', { params: { username: c.value } })),
    map(exists => (exists ? { taken: true } : null)),
    catchError(() => of(null)),                                  // do not block the user on server errors
  );

username = ['', { validators: [Validators.required], asyncValidators: [uniqueUsername(this.http)], updateOn: 'blur' }];`,
        `// error-messages.ts - central mapping
const MESSAGES: Record<string, (e: any) => string> = {
  required: () => 'This field is required',
  minlength: e => 'Minimum ' + e.requiredLength + ' characters',
  email: () => 'Enter a valid email',
  taken: () => 'Username already taken',
  mismatch: () => 'Passwords do not match',
};
export const errorText = (c: AbstractControl): string | null => {
  const key = Object.keys(c.errors ?? {})[0];
  return key ? (MESSAGES[key]?.(c.errors![key]) ?? 'Invalid value') : null;
};`),
      blk(`<h3>Validation strategies and server-side errors</h3>
• <b>Form validation strategies</b>: (1) show errors on blur/touched (default recommendation), (2) on submit only (<code>updateOn: 'submit'</code> or a submitted flag), (3) immediately while typing (password strength meters). Pick per form; consistent across the app.<br>
• <b>Server-side validation errors</b>: the backend remains the authority. Map its field errors (Spring Boot returns e.g. <code>{ "errors": { "email": "already registered" } }</code>) to controls using <code>setErrors()</code>.`,
        `save() {
  this.http.post('/api/users', this.form.getRawValue()).subscribe({
    error: (err: HttpErrorResponse) => {
      if (err.status === 400 && err.error?.errors) {                       // Spring MethodArgumentNotValidException handler
        for (const [field, msg] of Object.entries<string>(err.error.errors)) {
          this.form.get(field)?.setErrors({ server: msg });                // shows via errorText mapping
        }
      } else {
        this.formError.set('Something went wrong. Try again.');
      }
    },
  });
}`),
    ],
    [
      blk(`<h3>Design notes</h3>
• Validators must be <b>pure and fast</b>; they run on every value change. Return the same error shape consistently (<code>{ key: details }</code>). Never mutate the control.<br>
• A group-level validator marks the group (not the field) invalid; to display it on the field, either read <code>form.errors</code> in the template or <code>setErrors</code> on the child inside the validator (a documented but frowned-on side effect). Another option: validator returns the error and you show it near the confirm field.<br>
• Async validators: always handle errors (<code>catchError(() =&gt; of(null))</code>), debounce, and cancel previous requests with <code>switchMap</code> (cancellation is automatic as Angular unsubscribes from the previous pending validation). Check on the server too (race conditions between check and insert).<br>
• Server errors set via <code>setErrors</code> are cleared on the next validity recalculation (value change). That is correct behaviour; do not persist them manually.<br>
• Template-driven custom validators need a directive implementing <code>Validator</code> and provided with <code>NG_VALIDATORS</code>; reactive validators need nothing extra. Share validators between both through a small wrapper directive.<br>
• Version note: control events (v18) and <code>{ nonNullable: true }</code> options; ValidatorFn typing stays the same across v14-v20.`),
    ],
    [
      ['How do you write a custom validator?', 'A function (control) => ValidationErrors | null. Return null for valid and an object like { myError: true } for invalid; parameterised validators are factories returning that function.'],
      ['How do you validate two fields together?', 'Attach a validator to the parent FormGroup that reads both controls (for example password and confirm) and returns an error on the group.'],
      ['How do async validators work and what is PENDING?', 'They return Observable/Promise of errors; while waiting, the control status is PENDING. They run only if sync validators pass, and a new value cancels the previous pending validation.'],
      ['How do you display backend validation errors?', 'Map the error response fields to controls with control.setErrors({ server: message }) and render them like normal validation messages; the backend remains the source of truth.'],
      ['How do you centralise error messages?', 'Use a map from error key to message function and a helper or pipe/component (for example app-field-error) used everywhere.'],
      ['When should errors appear?', 'Usually after blur (touched) or on submit attempt; immediate feedback only for helpful hints such as password strength.'],
    ],
  ),

  topic(
    'ngs-m11-dynamic-forms',
    L11_5,
    [
      blk(`<h3>Forms that change shape</h3>
• <b>Nested forms</b>: a FormGroup inside a FormGroup (address inside user). In HTML use <code>formGroupName</code>.<br>
• <b>FormArray for dynamic fields</b>: a list the user can grow, like adding phone numbers. Use <code>push()</code> to add and <code>removeAt()</code> to remove.<br>
• <b>Conditional form fields</b>: show or require a field depending on another value (e.g. "Company name" only if "I am a business").<br>
• <b>Form submission</b>: <code>(ngSubmit)</code> on the form, then read the value. <b>Resetting forms</b>: <code>form.reset()</code>.`,
        `<!-- order-form.component.html -->
<form [formGroup]="form" (ngSubmit)="submit()">
  <input formControlName="customer">
  <div formGroupName="address"> <input formControlName="city"> <input formControlName="zip"> </div>

  <div formArrayName="items">
    @for (item of items.controls; track item; let i = $index) {
      <div [formGroupName]="i">
        <input formControlName="name"> <input type="number" formControlName="qty">
        <button type="button" (click)="removeItem(i)">Remove</button>
      </div>
    }
  </div>
  <button type="button" (click)="addItem()">Add item</button>
  <button type="submit">Place order</button>
</form>`,
        `// order-form.component.ts
private fb = inject(NonNullableFormBuilder);
form = this.fb.group({
  customer: ['', Validators.required],
  address: this.fb.group({ city: [''], zip: [''] }),
  items: this.fb.array([this.newItem()]),
});
get items() { return this.form.controls.items; }
newItem() { return this.fb.group({ name: ['', Validators.required], qty: [1, Validators.min(1)] }); }
addItem() { this.items.push(this.newItem()); }
removeItem(i: number) { this.items.removeAt(i); }`),
    ],
    [
      blk(`<h3>Conditional fields, submission and reset</h3>`,
        `// conditional: react to another control
ngOnInit() {
  this.form.controls.type.valueChanges.pipe(startWith(this.form.controls.type.value), takeUntilDestroyed(this.destroyRef))
    .subscribe(type => {
      const company = this.form.controls.company;
      if (type === 'BUSINESS') { company.addValidators(Validators.required); company.enable(); }
      else { company.clearValidators(); company.disable(); company.reset(); }
      company.updateValueAndValidity();                         // re-run after changing validators
    });
}
// template: @if (form.controls.type.value === 'BUSINESS') { <input formControlName="company"> }`,
        `submitted = signal(false);
submit() {
  this.submitted.set(true);
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }       // show all errors
  this.saving.set(true);
  this.http.post('/api/orders', this.form.getRawValue()).pipe(finalize(() => this.saving.set(false)))
    .subscribe(() => {
      this.form.reset();             // back to initial values (nonNullable)
      this.items.clear();            // empty the FormArray too
      this.items.push(this.newItem());
      this.submitted.set(false);
    });
}`),
      blk(`<h3>Dynamic forms from metadata</h3>
A <b>dynamic form</b> is generated from a description (JSON from a Spring Boot endpoint or a config object): loop over field definitions, create controls and render the right input per type.`,
        `interface FieldDef { key: string; label: string; type: 'text' | 'number' | 'select'; required?: boolean; options?: string[]; }

buildForm(fields: FieldDef[]) {
  const group: Record<string, FormControl> = {};
  for (const f of fields) group[f.key] = new FormControl('', { nonNullable: true, validators: f.required ? [Validators.required] : [] });
  return new FormGroup(group);              // FormGroup<Record<string, FormControl<string>>>
}
// template: @for (f of fields; track f.key) { @switch (f.type) { @case ('select') { <select [formControlName]="f.key">...</select> } @default { <input [type]="f.type" [formControlName]="f.key"> } } }`),
    ],
    [
      blk(`<h3>Pitfalls and architecture</h3>
• <code>track</code> by control identity (<code>track item</code>) in FormArray loops; tracking by <code>$index</code> misrenders when removing rows in the middle.<br>
• <code>reset()</code> does not shrink a FormArray; clear it yourself (<code>clear()</code>). <code>reset()</code> also marks the control pristine and untouched, and with nonNullable restores the initial value (the one given at construction); to change the baseline, use <code>reset(newValue)</code>.<br>
• Disabled controls are missing from <code>form.value</code>; use <code>getRawValue()</code> or enable before sending, and send exactly what the backend DTO expects.<br>
• Toggling validators requires <code>updateValueAndValidity()</code>; prefer disabling hidden controls: disabled controls are excluded from validation, which keeps hidden required fields from blocking submit. Use <code>emitEvent: false</code> to avoid loops when you update controls inside valueChanges handlers.<br>
• Prevent double submit: disable the button while saving, use <code>exhaustMap</code> for the submit stream.<br>
• Large dynamic forms: build reusable "sub-form" components receiving a <code>FormGroup</code> as input (typed), or use <code>ControlContainer</code> with <code>viewProviders</code> to nest templates without passing the group around.<br>
• Version: typed forms (v14), <code>FormRecord</code> for dynamic keys; <code>FormArray.push</code> accepts options such as <code>{ emitEvent: false }</code> (v18+).`,
        `// reusable child form that joins the parent's form via ControlContainer
@Component({
  selector: 'app-address-fields', imports: [ReactiveFormsModule],
  viewProviders: [{ provide: ControlContainer, useFactory: () => inject(ControlContainer, { skipSelf: true }) }],
  template: '<div formGroupName="address"><input formControlName="city"><input formControlName="zip"></div>',
})
export class AddressFieldsComponent {}`),
    ],
    [
      ['How do you build a list of repeating fields?', 'Use a FormArray of FormGroups or FormControls; render it with @for over array.controls inside formArrayName, and add/remove via push() and removeAt().'],
      ['How do you make a field conditionally required?', 'Subscribe to the controlling field valueChanges and add or remove validators (or enable/disable the control), then call updateValueAndValidity().'],
      ['How do you handle submission correctly?', 'Use (ngSubmit), check form.invalid and call markAllAsTouched(), disable the button while the request runs, map the form value to the DTO, and reset on success.'],
      ['What does form.reset() do?', 'Sets values back to null or the nonNullable initial value and marks controls pristine and untouched. It does not remove FormArray items.'],
      ['How are nested forms bound in the template?', 'formGroupName for nested groups, formArrayName plus an index-bound formGroupName for arrays, formControlName for leaf controls.'],
      ['Why track by control rather than index in FormArray loops?', 'Index tracking recycles DOM for the wrong row after removal; tracking by control object keeps DOM and state aligned.'],
    ],
  ),

  topic(
    'ngs-m11-custom-controls',
    L11_6,
    [
      blk(`<h3>Your own input component</h3>
• A <b>custom form control</b> is a component (a star rating, a date picker, a tag input) that can be used with <code>formControlName</code> or <code>[(ngModel)]</code> just like a normal input.<br>
• The glue is <b>ControlValueAccessor</b> (CVA): an interface that tells Angular how to write a value into your component and how your component reports changes. Think of it as an adapter plug between the forms system and your component, like a Java interface that lets any class be used as a Comparator.`,
        `// rating.component.ts
@Component({
  selector: 'app-rating',
  template: '@for (s of [1,2,3,4,5]; track s) { <button type="button" [disabled]="disabled" (click)="pick(s)" [attr.aria-pressed]="s <= value">{{ s <= value ? "*" : "-" }}</button> }',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RatingComponent), multi: true }],
})
export class RatingComponent implements ControlValueAccessor {
  value = 0; disabled = false;
  private onChange: (v: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: number) { this.value = v ?? 0; }                  // form -> component
  registerOnChange(fn: (v: number) => void) { this.onChange = fn; }   // component -> form
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.disabled = d; }

  pick(v: number) { this.value = v; this.onChange(v); this.onTouched(); }
}
// usage: <app-rating formControlName="stars" />`),
    ],
    [
      blk(`<h3>Making it production ready</h3>
• Register with <code>NG_VALUE_ACCESSOR</code> and <code>multi: true</code>. <code>forwardRef</code> is needed because the class is referenced before it is defined.<br>
• Alternative without <code>providers</code>: inject <code>NgControl</code> with <code>@Self()</code> and set <code>ngControl.valueAccessor = this</code> in the constructor. This gives access to the control (for validation state and CSS classes).<br>
• Call <code>onTouched()</code> on blur; call <code>onChange()</code> only for user changes, not inside <code>writeValue</code> (that would loop and dirty the form).<br>
• Implement <code>Validator</code> too (<code>NG_VALIDATORS</code>) when the control has built-in rules.<br>
• With OnPush, call <code>cdr.markForCheck()</code> in <code>writeValue</code> and <code>setDisabledState</code>, or keep value in a signal.`,
        `// signals + NgControl injection (no providers array)
@Component({ selector: 'app-tag-input', template: '<input [value]="text()" (input)="text.set($any($event.target).value)" (blur)="touched()">' })
export class TagInputComponent implements ControlValueAccessor {
  text = signal('');
  private onChange = (_: string) => {};
  touched = () => this.onTouched();
  private onTouched = () => {};
  ngControl = inject(NgControl, { self: true, optional: true });
  constructor() { if (this.ngControl) this.ngControl.valueAccessor = this; }

  writeValue(v: string) { this.text.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void) { this.onChange = fn; effect(() => fn(this.text())); }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
}`),
    ],
    [
      blk(`<h3>Details</h3>
• <code>writeValue</code> may be called with <code>null</code> (reset) and before the view exists; code defensively. <code>registerOnChange</code> is called once per binding; never call the callback before registration.<br>
• Do not duplicate form state in your own internal state if you can derive it; the form control is the source of truth. For compound values (an address editor), pass an object and treat it immutably.<br>
• Accessibility is your job: label association (<code>aria-labelledby</code>), keyboard support, roles, <code>aria-invalid</code> from <code>ngControl.invalid</code>.<br>
• Version notes: Angular does not yet ship a signals-native CVA replacement (signal forms were being previewed in v20+); also consider simply using a <code>model()</code>-based component when no integration with forms validation is needed. Libraries like Angular Material use CVA for all their controls (<code>MatFormFieldControl</code> adds the form-field integration).<br>
• Test a CVA through a host component with a real <code>FormControl</code>: set a value, assert the DOM, interact, assert control value and touched.`),
    ],
    [
      ['What is ControlValueAccessor?', 'An interface (writeValue, registerOnChange, registerOnTouched, setDisabledState) that bridges Angular forms and a DOM element or component so it can work with ngModel and reactive forms.'],
      ['How do you register a custom control?', 'Provide NG_VALUE_ACCESSOR with useExisting forwardRef(() => Component) and multi: true, or inject NgControl and assign valueAccessor = this.'],
      ['When must the control call onChange and onTouched?', 'onChange when the user changes the value (never from writeValue), onTouched when the user leaves or finishes interacting.'],
      ['Why forwardRef?', 'The provider references the class inside its own decorator before the class is defined; forwardRef defers resolution.'],
      ['How does a custom control show validation state?', 'Inject NgControl (self) to read invalid/touched, or let the parent show messages; apply aria-invalid and styles accordingly.'],
    ],
  ),

  topic(
    'ngs-m11-a11y-testing-perf',
    L11_7,
    [
      blk(`<h3>Accessible forms</h3>
• Every input needs a visible <b>label</b> tied by <code>for</code>/<code>id</code> (or wrapping the input). Placeholders are not labels.<br>
• Mark invalid fields with <code>aria-invalid="true"</code> and connect the error text with <code>aria-describedby</code>; announce errors with <code>role="alert"</code> or <code>aria-live</code>.<br>
• Use proper input <code>type</code> and <code>autocomplete</code>, keep keyboard order logical, and on a failed submit move focus to the first invalid field.`,
        `<label for="email">Email</label>
<input id="email" type="email" formControlName="email" autocomplete="email"
       [attr.aria-invalid]="email.invalid && email.touched"
       [attr.aria-describedby]="email.invalid && email.touched ? 'email-err' : null">
@if (email.invalid && email.touched) { <small id="email-err" role="alert">Enter a valid email address</small> }`),
    ],
    [
      blk(`<h3>Form testing</h3>
• Test <b>validators</b> as plain functions. Test <b>form components</b> with <code>TestBed</code>: set values, dispatch <code>input</code> events, call <code>detectChanges</code>, and assert errors and submitted payloads.<br>
• Reactive forms are easy to unit test without a DOM because the model lives in the class.`,
        `// validators.spec.ts
it('rejects spaces', () => {
  expect(noSpaces(new FormControl('a b'))).toEqual({ noSpaces: true });
  expect(noSpaces(new FormControl('ab'))).toBeNull();
});

// signup.component.spec.ts
it('submits only when valid', () => {
  const fixture = TestBed.createComponent(SignupComponent);
  const cmp = fixture.componentInstance;
  cmp.form.patchValue({ email: 'bad' });
  expect(cmp.form.invalid).toBeTrue();
  const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
  input.value = 'asha@example.com'; input.dispatchEvent(new Event('input'));    // user typing
  fixture.detectChanges();
  expect(cmp.form.valid).toBeTrue();
});`),
    ],
    [
      blk(`<h3>Form performance</h3>
• Validators and <code>valueChanges</code> handlers run on every keystroke. Use <code>updateOn: 'blur'</code> (control or whole form) for heavy validation, <code>debounceTime</code> for searches, and avoid method calls in templates that iterate big FormArrays.<br>
• For large forms (hundreds of controls) use <code>OnPush</code> sub-components that take a typed FormGroup, <code>track</code> in loops, and <code>@defer</code> for sections. Disable emission when patching many values: <code>patchValue(v, { emitEvent: false })</code> and call <code>updateValueAndValidity()</code> once.<br>
• Prefer <code>form.valid</code> as a template read over a function; ensure async validators are debounced.<br>
• Memory: complete <code>valueChanges</code> subscriptions with <code>takeUntilDestroyed</code>; controls created dynamically and removed are garbage collected once unreferenced.<br>
• Accessibility checks (axe, Lighthouse) belong in CI; add a test that each input has a label.`,
        `form = new FormGroup({ search: new FormControl('') }, { updateOn: 'blur' });     // validate/emit only on blur
bulk() { this.form.patchValue(bigObject, { emitEvent: false }); this.form.updateValueAndValidity(); }`),
    ],
    [
      ['How do you make a form accessible?', 'Associate labels with inputs, use correct types and autocomplete, set aria-invalid and aria-describedby for errors, announce errors with role=alert, and manage focus on failed submit.'],
      ['How do you unit test a validator?', 'Call it as a function with a FormControl or group holding test values and assert it returns null or the expected error object.'],
      ['How do you reduce validation cost on big forms?', 'Use updateOn blur or submit, debounce async validators and searches, batch updates with emitEvent false, use OnPush sub-forms and track in loops.'],
      ['How do you simulate user input in a component test?', 'Set the element value, dispatch an input event, then call fixture.detectChanges(); alternatively set the control value directly for model-level tests.'],
    ],
  ),
];

// ---------------------------------------------------------------- Module 12
const L12_1 = 'Reactive programming, Observables and Observers';
const L12_2 = 'Subjects: Subject, BehaviorSubject, ReplaySubject, AsyncSubject';
const L12_3 = 'Operators: categories and everyday operators';
const L12_4 = 'Higher-order observables: switchMap, mergeMap, concatMap, exhaustMap';
const L12_5 = 'Combining streams and sharing results';
const L12_6 = 'Error handling, completion and subscription management';
const L12_7 = 'AsyncPipe, Signals interop, testing and choosing operators';

const m12: Topic[] = [
  ov(12, '<b>RxJS</b> is the library Angular uses for asynchronous streams: HTTP, router events, form value changes, user events. Learn the Observable, a handful of operators and how to clean up.', [
    ['Introduction to Reactive Programming', 'Programming with streams of data over time', L12_1],
    ['What is RxJS?', 'Library of Observables and operators', L12_1],
    ['Observable', 'A lazy stream of values you can subscribe to', L12_1],
    ['Observer', 'Object with next, error, complete handlers', L12_1],
    ['Subscription', 'Handle to a running execution; can unsubscribe', L12_1],
    ['Creating observables', 'new Observable, of, from, fromEvent, interval, timer', L12_1],
    ['Observable execution', 'Code runs per subscription: next, error, complete', L12_1],
    ['Cold vs hot observables', 'Producer created per subscriber vs shared producer', L12_1],
    ['Subjects', 'Observable plus Observer: multicast and push values manually', L12_2],
    ['BehaviorSubject', 'Subject with a current value', L12_2],
    ['ReplaySubject', 'Subject that replays the last N values', L12_2],
    ['AsyncSubject', 'Emits only the last value on completion', L12_2],
    ['Operators', 'Functions that transform streams, used in pipe()', L12_3],
    ['Creation operators', 'of, from, interval, timer, fromEvent, defer, range', L12_3],
    ['Transformation operators', 'map, scan, switchMap family, pluck-like', L12_3],
    ['Filtering operators', 'filter, take, debounceTime, distinctUntilChanged', L12_3],
    ['Combination operators', 'combineLatest, forkJoin, merge, concat, withLatestFrom', L12_5],
    ['Utility operators', 'tap, delay, startWith, finalize, timeout', L12_3],
    ['Error-handling operators', 'catchError, retry, finalize', L12_6],
    ['map()', 'Transform each value', L12_3],
    ['filter()', 'Keep values that match a predicate', L12_3],
    ['tap()', 'Side effects without changing the stream', L12_3],
    ['switchMap()', 'Switch to a new inner stream, cancel the old', L12_4],
    ['mergeMap()', 'Run inner streams concurrently', L12_4],
    ['concatMap()', 'Run inner streams one after another', L12_4],
    ['exhaustMap()', 'Ignore new triggers while one is running', L12_4],
    ['debounceTime()', 'Wait for a pause in emissions', L12_3],
    ['distinctUntilChanged()', 'Skip consecutive duplicates', L12_3],
    ['catchError()', 'Handle an error and return a fallback stream', L12_6],
    ['retry()', 'Resubscribe after an error', L12_6],
    ['finalize()', 'Run code on complete, error or unsubscribe', L12_6],
    ['combineLatest()', 'Emit latest values of all sources whenever one emits', L12_5],
    ['forkJoin()', 'Wait for all sources to complete, emit last values', L12_5],
    ['merge()', 'Interleave several sources', L12_5],
    ['concat()', 'Sources one after another', L12_5],
    ['withLatestFrom()', 'Combine with the latest value of another stream', L12_5],
    ['startWith()', 'Emit an initial value first', L12_3],
    ['shareReplay()', 'Share one execution and replay for late subscribers', L12_5],
    ['take()', 'Take the first N values then complete', L12_3],
    ['takeUntil()', 'Complete when a notifier emits', L12_6],
    ['takeUntilDestroyed()', 'Complete when the component or service is destroyed', L12_6],
    ['firstValueFrom()', 'Convert to a Promise of the first value', L12_6],
    ['lastValueFrom()', 'Convert to a Promise of the last value', L12_6],
    ['Error handling', 'Error notifications end a stream; handle them', L12_6],
    ['Subscription management', 'Track and close subscriptions', L12_6],
    ['Memory leak prevention', 'Always end infinite streams', L12_6],
    ['Observable cancellation', 'Unsubscribing stops the work', L12_4],
    ['HTTP request cancellation', 'Unsubscribe aborts the XHR/fetch', L12_4],
    ['Higher-order observables', 'Observables that emit observables', L12_4],
    ['RxJS marble testing', 'Test streams with marble diagrams and TestScheduler', L12_7],
    ['RxJS with Angular Signals', 'toSignal and toObservable', L12_7],
    ['AsyncPipe', 'Subscribe in the template and auto-unsubscribe', L12_7],
    ['Choosing the right RxJS operator', 'Decision guide by problem', L12_7],
  ]),

  topic(
    'ngs-m12-observable-basics',
    L12_1,
    [
      blk(`<h3>Streams over time</h3>
• <b>Reactive programming</b> means describing what should happen when data arrives, instead of asking for it. Compare a Java <code>List</code> (all values exist now) with a stream of events (values arrive over time): clicks, keystrokes, HTTP responses.<br>
• <b>RxJS</b> (Reactive Extensions for JavaScript) is the library that models these as <b>Observables</b>. Angular uses it in HttpClient, Router, forms and more.<br>
• An <b>Observable</b> is a lazy stream, like a YouTube channel: nothing happens until someone subscribes. The <b>Observer</b> is the subscriber with three callbacks: <code>next</code> (a value), <code>error</code> (failed) and <code>complete</code> (finished). A <b>Subscription</b> is the handle you get back; <code>unsubscribe()</code> cancels.`,
        `import { Observable } from 'rxjs';

const numbers$ = new Observable<number>(subscriber => {   // the producer
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

const sub = numbers$.subscribe({            // an Observer object
  next: v => console.log('got', v),
  error: e => console.error(e),
  complete: () => console.log('done'),
});
sub.unsubscribe();                           // stop listening (no-op here, stream already completed)`),
    ],
    [
      blk(`<h3>Creating observables and how execution works</h3>
<b>Creating observables</b> usually uses creation functions rather than <code>new Observable</code>:`,
        `import { of, from, fromEvent, interval, timer, defer, range, throwError, EMPTY } from 'rxjs';

of(1, 2, 3);                               // emits 1,2,3 then completes
from([10, 20, 30]);                        // from array / Promise / iterable
from(fetch('/api/ping'));                  // from a Promise
fromEvent(document, 'click');              // DOM events (infinite)
interval(1000);                            // 0,1,2,... every second (infinite)
timer(2000);                               // one value after 2s
timer(0, 1000);                            // start immediately, then every second
range(1, 5);                               // 1..5
defer(() => of(Date.now()));               // create a fresh source per subscriber
EMPTY;                                     // completes immediately`),
      blk(`<h3>Observable execution</h3>
• Each <code>subscribe()</code> <b>runs the producer function again</b> (for cold observables): two subscribers means two executions, e.g. two HTTP requests.<br>
• The contract: zero or more <code>next</code>, then at most one of <code>error</code> or <code>complete</code>. After error or complete nothing else is emitted and resources are released.<br>
• The function you <code>return</code> from the producer is the <b>teardown</b> logic, called on unsubscribe, error or complete.`,
        `const ticks$ = new Observable<number>(sub => {
  let n = 0;
  const id = setInterval(() => sub.next(n++), 1000);
  return () => { clearInterval(id); console.log('teardown'); };   // runs on unsubscribe/complete/error
});
const s = ticks$.subscribe(v => console.log(v));
setTimeout(() => s.unsubscribe(), 3500);    // prints 0,1,2 then teardown`),
    ],
    [
      blk(`<h3>Cold versus hot</h3>
• <b>Cold observable</b>: the producer is created inside the Observable, per subscriber (HttpClient, <code>of</code>, <code>interval</code>). Like Netflix: each viewer starts their own playback.<br>
• <b>Hot observable</b>: the producer lives outside and values flow whether or not someone listens (DOM events, WebSocket, a Subject). Like live TV: you see what is airing now.<br>
• Convert cold to hot with <code>share()</code>, <code>shareReplay()</code> or by pushing through a Subject. Beware: two <code>subscribe</code>s or two <code>| async</code>s on a cold HTTP observable fire two requests.`,
        `const cold$ = new Observable<number>(sub => sub.next(Math.random()));
cold$.subscribe(v => console.log('A', v));
cold$.subscribe(v => console.log('B', v));   // different number: separate executions

const hot$ = cold$.pipe(share());            // one shared execution
hot$.subscribe(v => console.log('A', v));
hot$.subscribe(v => console.log('B', v));    // same value (if subscribed before it emitted)`),
      blk(`<h3>Internals and rules</h3>
• Observables are lazy and unicast by default; Subjects are multicast. <code>subscribe(fn)</code> with a single function is shorthand for <code>{ next: fn }</code>. In RxJS 7 the deprecated signature with three positional callbacks still works but prefer an observer object.<br>
• Synchronous observables (<code>of</code>) emit during <code>subscribe()</code>; the observable contract does not promise asynchronous delivery. <code>observeOn</code>/<code>subscribeOn</code> change the scheduler.<br>
• Observable vs Promise: Promise is eager, single value, not cancellable, always async; Observable is lazy, many values, cancellable, sync or async. Java parallels: <code>CompletableFuture</code> (Promise-like), <code>java.util.stream.Stream</code> (pull, one use) vs Reactor <code>Flux</code> / <code>Mono</code> (push, very similar to Observable).<br>
• RxJS 7 (Angular 13-20 era) and 8 (in preview, removes some deprecated APIs). Import operators from <code>'rxjs'</code> (since v7.2), not <code>'rxjs/operators'</code>.`),
    ],
    [
      ['What is an Observable and how does it differ from a Promise?', 'An Observable is a lazy stream that can emit many values over time, is cancellable and runs per subscription. A Promise is eager, resolves one value once and cannot be cancelled.'],
      ['What are Observer and Subscription?', 'The Observer is the set of callbacks (next, error, complete) that receives notifications. The Subscription is the object returned by subscribe() that represents the running execution and offers unsubscribe().'],
      ['Cold vs hot observable?', 'Cold creates its producer per subscriber, so each subscription runs separately (HTTP). Hot shares one producer that emits regardless of subscribers (DOM events, Subjects). share/shareReplay turn cold into hot.'],
      ['Which ways exist to create observables?', 'new Observable, of, from, fromEvent, interval, timer, range, defer, EMPTY, throwError, plus Subjects and framework sources like HttpClient.'],
      ['When does an observable stop emitting?', 'After error or complete, or when the subscriber unsubscribes; teardown logic then runs.'],
    ],
  ),

  topic(
    'ngs-m12-subjects',
    L12_2,
    [
      blk(`<h3>Subjects: an observable you can push into</h3>
• A <b>Subject</b> is both an Observable (others subscribe) and an Observer (you call <code>next()</code>). Think of a <b>radio station</b>: one broadcaster, many listeners; listeners only hear what is broadcast after they tune in.<br>
• Subjects are <b>multicast</b>: all subscribers share one execution. Typical use: a service that broadcasts events to components.`,
        `import { Subject } from 'rxjs';

const chat$ = new Subject<string>();
chat$.subscribe(m => console.log('A:', m));
chat$.next('hello');                 // A: hello
chat$.subscribe(m => console.log('B:', m));
chat$.next('welcome');               // A: welcome, B: welcome  (B missed "hello")`),
    ],
    [
      blk(`<h3>The four kinds</h3>
<table ${TABLE}><thead><tr><th>Type</th><th>Behaviour</th><th>Use for</th></tr></thead><tbody>
<tr><td><b>Subject</b></td><td>No memory; late subscribers miss earlier values</td><td>Events, commands</td></tr>
<tr><td><b>BehaviorSubject</b></td><td>Needs an initial value; holds the current value (<code>.value</code>); new subscribers get it immediately</td><td>State: current user, theme, selected item</td></tr>
<tr><td><b>ReplaySubject(n)</b></td><td>Replays the last n values (optionally within a time window) to new subscribers</td><td>History, late-joining consumers</td></tr>
<tr><td><b>AsyncSubject</b></td><td>Emits only the last value, and only when it completes</td><td>One final result (like a Promise)</td></tr></tbody></table>`),
      blk(`<h3>A tiny state service</h3>`,
        `// auth.service.ts - BehaviorSubject for the current user
@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();          // expose read-only, hide next()

  login(u: User) { this.userSubject.next(u); }
  logout() { this.userSubject.next(null); }
  get snapshot() { return this.userSubject.value; }          // synchronous read
}

const replay = new ReplaySubject<number>(2);
replay.next(1); replay.next(2); replay.next(3);
replay.subscribe(v => console.log(v));   // 2, 3 (last two)

const last = new AsyncSubject<number>();
last.subscribe(v => console.log(v));
last.next(1); last.next(2); last.complete();   // prints 2 only`),
    ],
    [
      blk(`<h3>Best practices and traps</h3>
• Never expose the raw Subject; expose <code>asObservable()</code> so only the owner can call <code>next</code>.<br>
• Subjects are <b>hot</b> and stay alive: complete them or unsubscribe subscribers, otherwise leaks. A Subject that errors is dead for everyone.<br>
• Do not call <code>next</code> inside a subscriber of the same subject without care: reentrancy can overflow the stack. Emit with a clean flow (operators like <code>scan</code>) rather than shared mutable state.<br>
• <code>BehaviorSubject.getValue()</code> in business logic is a code smell mirroring mutable state; prefer derived streams. For state in new code prefer <b>signals</b> (Module 13), keeping BehaviorSubject where streams and operators are needed.<br>
• <code>ReplaySubject(1)</code> vs <code>BehaviorSubject</code>: Replay has no initial value and does not emit until first <code>next</code>; use it when "not yet known" must be expressed by absence. <code>shareReplay({ bufferSize: 1, refCount: true })</code> is often a safer alternative to a hand-written ReplaySubject cache.<br>
• Java parallels: <code>BehaviorSubject</code> ~ Reactor <code>Sinks.many().replay().latest()</code>; <code>Subject</code> ~ <code>Sinks.many().multicast()</code>.`),
    ],
    [
      ['Subject vs BehaviorSubject?', 'Both multicast. BehaviorSubject requires an initial value, always holds the current value and gives it to new subscribers immediately; a plain Subject has no memory so late subscribers miss earlier emissions.'],
      ['When would you use ReplaySubject?', 'When late subscribers must receive the last N values (or those in a time window), such as event history or cached emissions.'],
      ['What does AsyncSubject emit?', 'Only the last value, after complete(); nothing if it errors.'],
      ['Why expose asObservable() from a service?', 'To prevent consumers from calling next/complete on your Subject, preserving encapsulation of the state owner.'],
      ['Why do Subjects need care about memory?', 'They are long-lived and hold references to subscribers; undisposed subscriptions leak and keep callbacks running.'],
    ],
  ),

  topic(
    'ngs-m12-operators-basics',
    L12_3,
    [
      blk(`<h3>Operators: tools on an assembly line</h3>
• An <b>operator</b> is a function that takes an Observable and returns a new one. You chain them in <code>pipe()</code> like stations on an assembly line; the source is not modified.<br>
• Operator categories:<br>
<b>Creation operators</b> make streams (<code>of</code>, <code>from</code>, <code>interval</code>, <code>timer</code>, <code>fromEvent</code>).<br>
<b>Transformation operators</b> change values (<code>map</code>, <code>scan</code>, <code>switchMap</code>, <code>mergeMap</code>).<br>
<b>Filtering operators</b> drop values (<code>filter</code>, <code>take</code>, <code>debounceTime</code>, <code>distinctUntilChanged</code>).<br>
<b>Combination operators</b> join streams (<code>combineLatest</code>, <code>merge</code>, <code>forkJoin</code>, <code>concat</code>, <code>withLatestFrom</code>).<br>
<b>Utility operators</b> support the flow (<code>tap</code>, <code>delay</code>, <code>startWith</code>, <code>timeout</code>).<br>
<b>Error-handling operators</b> (<code>catchError</code>, <code>retry</code>, <code>finalize</code>) are in the error lesson.`,
        `import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';   // or from 'rxjs' in v7.2+

of(1, 2, 3, 4, 5, 6).pipe(
  filter(n => n % 2 === 0),    // 2, 4, 6
  map(n => n * 10),            // 20, 40, 60
).subscribe(v => console.log(v));`),
    ],
    [
      blk(`<h3>map, filter, tap, take, startWith</h3>`,
        `// map(): transform each value
this.http.get<User[]>('/api/users').pipe(map(users => users.map(u => u.name)));

// filter(): keep matching values
fromEvent<KeyboardEvent>(document, 'keydown').pipe(filter(e => e.key === 'Enter'));

// tap(): side effect (log, set a flag) without altering values
this.http.get<Order[]>('/api/orders').pipe(tap(list => console.log('loaded', list.length)));

// take(n): first n values then complete (auto-unsubscribes)
interval(1000).pipe(take(3));          // 0,1,2 then complete

// startWith(): initial value before the first real one
this.search.valueChanges.pipe(startWith(''));

// scan(): running total (like reduce but emits each step)
clicks$.pipe(scan((count) => count + 1, 0));`),
      blk(`<h3>debounceTime and distinctUntilChanged: the search-box pair</h3>
• <b>debounceTime(ms)</b> waits until the source is quiet for <code>ms</code> milliseconds, then emits the last value. Perfect for typing.<br>
• <b>distinctUntilChanged()</b> drops a value equal to the previous one (pass a comparator for objects).`,
        `// search.component.ts
results$ = this.searchControl.valueChanges.pipe(
  debounceTime(300),                       // wait for the user to pause typing
  map(t => (t ?? '').trim()),
  filter(t => t.length >= 2),
  distinctUntilChanged(),                  // same text again? ignore
  switchMap(t => this.http.get<Item[]>('/api/items', { params: { q: t } })),
);`),
    ],
    [
      blk(`<h3>Practical details</h3>
• <code>tap</code> is for side effects only; do not mutate values in it. It accepts an observer object too: <code>tap({ next, error, complete, subscribe, unsubscribe, finalize })</code> (RxJS 7.3+) which is excellent for debugging lifecycle.<br>
• <code>debounceTime</code> delays the final emission; <code>throttleTime</code> emits the first and ignores the rest for a period (scroll/resize); <code>auditTime</code> emits the last at the end of each period; <code>sampleTime</code> samples periodically. Choose by whether you need the first, last or periodic value.<br>
• <code>take(1)</code> vs <code>first()</code>: <code>first()</code> errors with <code>EmptyError</code> if the source completes without emitting; <code>take(1)</code> just completes. Use <code>first(pred, default)</code> for defaults.<br>
• <code>distinctUntilChanged</code> uses <code>===</code>; for objects pass a key selector (<code>distinctUntilKeyChanged('id')</code>) or compare function; mutable objects defeat it.<br>
• <code>startWith</code> is ideal with <code>combineLatest</code> so the combined stream emits before every source has emitted.<br>
• <b>Pipeable operators</b> (functions) replaced the old prototype-patching <code>.map()</code> chain; a custom operator is simply a function <code>(source: Observable&lt;T&gt;) =&gt; Observable&lt;R&gt;</code>.<br>
• Order matters: <code>filter</code> before expensive <code>map</code>; <code>debounceTime</code> before <code>switchMap</code>; <code>distinctUntilChanged</code> right after debounce.`,
        `// a custom operator
export const logAs = <T>(label: string) => (source: Observable<T>) =>
  source.pipe(tap({ next: v => console.log(label, v), error: e => console.error(label, e), finalize: () => console.log(label, 'closed') }));
// usage: obs$.pipe(logAs('users'))`),
    ],
    [
      ['What is an operator and what is pipe()?', 'An operator is a function from Observable to Observable. pipe() composes operators left to right, leaving the source untouched.'],
      ['List the main operator categories with examples.', 'Creation (of, from, interval), transformation (map, scan, switchMap), filtering (filter, take, debounceTime, distinctUntilChanged), combination (combineLatest, merge, forkJoin), utility (tap, delay, startWith), error handling (catchError, retry).'],
      ['What does tap do?', 'Runs a side effect for each notification without changing the stream, useful for logging or setting flags.'],
      ['debounceTime vs throttleTime?', 'debounceTime emits the latest value after a quiet period; throttleTime emits the first value then ignores others for the period.'],
      ['Why combine debounceTime and distinctUntilChanged for search?', 'Debounce reduces requests while typing; distinct avoids repeating the same query when the text returns to the same value.'],
      ['take(1) vs first()?', 'first() throws EmptyError when the source completes empty; take(1) simply completes.'],
    ],
  ),

  topic(
    'ngs-m12-higher-order',
    L12_4,
    [
      blk(`<h3>Streams that start other streams</h3>
• A <b>higher-order observable</b> is an observable whose values are themselves observables, for example "for every search term, start an HTTP call". You rarely handle it by hand: the <b>flattening operators</b> switchMap, mergeMap, concatMap and exhaustMap subscribe to the inner observable and flatten the results.<br>
• They differ in how they treat a new outer value while an inner one is still running:<br>
<b>switchMap</b>: cancel the old, start the new (latest wins).<br>
<b>mergeMap</b>: run all at once (concurrent).<br>
<b>concatMap</b>: queue, one after another (order preserved).<br>
<b>exhaustMap</b>: ignore new ones until the current finishes.`,
        `// Real life analogy at a coffee shop
// switchMap : you change your order, the barista throws away the old drink
// mergeMap  : many baristas, all orders made in parallel
// concatMap : one barista, orders made in queue order
// exhaustMap: barista busy, new orders are ignored`),
    ],
    [
      blk(`<h3>When to use which</h3>
<table ${TABLE}><thead><tr><th>Operator</th><th>Concurrency</th><th>Order</th><th>Use for</th></tr></thead><tbody>
<tr><td>switchMap</td><td>1, cancels previous</td><td>Latest</td><td>Search-as-you-type, route param changes, load details for selected id</td></tr>
<tr><td>mergeMap</td><td>Many (limit via 2nd arg)</td><td>Completion order</td><td>Independent fire-and-forget calls, batch upload</td></tr>
<tr><td>concatMap</td><td>1, queued</td><td>Strict source order</td><td>Saving edits in order, sequential API calls</td></tr>
<tr><td>exhaustMap</td><td>1, drops others</td><td>First wins</td><td>Login or submit button (prevent double click)</td></tr></tbody></table>`),
      blk(`<h3>Examples with HTTP</h3>`,
        `// switchMap: search, previous request is cancelled
this.term$.pipe(debounceTime(300), switchMap(t => this.http.get<Item[]>('/api/items?q=' + t)));

// exhaustMap: ignore extra clicks while the login request is running
this.loginClick$.pipe(exhaustMap(() => this.http.post<Token>('/api/login', this.form.getRawValue())));

// concatMap: save changes in order
this.saveQueue$.pipe(concatMap(draft => this.http.put('/api/docs/' + draft.id, draft)));

// mergeMap with concurrency limit 3: upload many files
from(files).pipe(mergeMap(f => this.upload(f), 3));

// route params -> data
this.route.paramMap.pipe(map(p => p.get('id')!), switchMap(id => this.users.get(id)));`),
    ],
    [
      blk(`<h3>Cancellation, HTTP cancellation and pitfalls</h3>
• <b>Observable cancellation</b>: unsubscribing runs the teardown. Flattening operators unsubscribe the inner observable when switched away, when the outer completes/unsubscribes, or on error.<br>
• <b>HTTP request cancellation</b>: unsubscribing from <code>HttpClient</code> aborts the in-flight XHR/fetch (the browser cancels it). With <code>switchMap</code> the old request is aborted automatically. Caveat: the server may already have processed it, so never use <code>switchMap</code> for non-idempotent writes (POST payments): use <code>concatMap</code> or <code>exhaustMap</code>.<br>
• Do not nest <code>subscribe</code> inside <code>subscribe</code> ("callback hell"): flatten with an operator, which also gives you cancellation and error propagation.<br>
• <b>Errors</b>: if an inner observable errors, the outer chain dies. Put <code>catchError</code> <i>inside</i> the flattening function to keep the outer stream alive.<br>
• <code>mergeMap</code> without a limit can flood a backend; pass <code>concurrent</code>. Results arrive in completion order; use <code>concatMap</code> or <code>forkJoin</code> if order matters.<br>
• For a click-driven stream use <code>exhaustMap</code>; for "latest request only" use <code>switchMap</code>; <code>switchMap</code> is also the default choice for GET with changing inputs. Newer helpers: <code>mergeScan</code>, <code>switchScan</code> (RxJS 7.x).`,
        `// keep the outer search stream alive when one request fails
this.term$.pipe(
  switchMap(t => this.http.get<Item[]>('/api/items?q=' + t).pipe(
    catchError(() => of([] as Item[])),      // catch INSIDE so the term$ chain survives
  )),
);`),
    ],
    [
      ['Explain switchMap, mergeMap, concatMap and exhaustMap.', 'All map a value to an inner observable and flatten. switchMap cancels the previous inner, mergeMap runs all concurrently, concatMap queues them in order, exhaustMap ignores new values while one inner is active.'],
      ['Which operator for typeahead search and why?', 'switchMap after debounceTime and distinctUntilChanged, because only the latest query matters and earlier requests are cancelled.'],
      ['Which operator prevents double submits?', 'exhaustMap on the click stream, since extra clicks are ignored until the request finishes.'],
      ['What is a higher-order observable?', 'An observable that emits observables. Flattening operators subscribe to the inner ones and merge their output into a single stream.'],
      ['Does unsubscribing cancel an HTTP request?', 'Yes, the browser request is aborted, but the server may already have processed it, so be careful with non-idempotent operations.'],
      ['Where to place catchError with switchMap?', 'Inside the inner pipe, so a failing request does not terminate the outer stream.'],
    ],
  ),

  topic(
    'ngs-m12-combine-share',
    L12_5,
    [
      blk(`<h3>Joining streams</h3>
• <b>combineLatest([a$, b$])</b>: whenever any source emits, emit the latest values of all (after each has emitted once). Like a dashboard showing the latest of several gauges.<br>
• <b>forkJoin([a$, b$])</b>: wait until all complete, then emit the last values once. Like <code>Promise.all</code> for HTTP calls.<br>
• <b>merge(a$, b$)</b>: interleave values from all, as they come.<br>
• <b>concat(a$, b$)</b>: run a$ fully, then b$.<br>
• <b>withLatestFrom(b$)</b>: when the main stream emits, also take the latest value of b$ (b$ alone does not trigger).`,
        `import { combineLatest, forkJoin, merge, concat, of } from 'rxjs';

combineLatest([of('A'), of(1)]).subscribe(([x, y]) => console.log(x, y));          // A 1
forkJoin({ user: this.http.get<User>('/api/me'), orders: this.http.get<Order[]>('/api/orders') })
  .subscribe(({ user, orders }) => console.log(user.name, orders.length));        // parallel, waits for both
merge(click$, keydown$).subscribe(e => console.log('input', e));
concat(this.loadConfig$, this.loadUser$).subscribe();                              // sequential
save$.pipe(withLatestFrom(this.currentUser$)).subscribe(([_, user]) => console.log(user));`),
    ],
    [
      blk(`<h3>Typical patterns</h3>`,
        `// view model from several sources (filters + data)
vm$ = combineLatest([
  this.products$,
  this.category$.pipe(startWith('all')),                 // startWith so combineLatest emits right away
  this.search$.pipe(startWith(''), debounceTime(200)),
]).pipe(
  map(([products, cat, q]) => products.filter(p => (cat === 'all' || p.category === cat) && p.name.includes(q))),
);

// parallel loading on a page (forkJoin completes only when ALL complete; each HTTP call completes)
init$ = forkJoin({ countries: this.api.countries(), roles: this.api.roles() });

// withLatestFrom: use current token/user when an event happens
this.saveClicks$.pipe(
  withLatestFrom(this.form.valueChanges),
  map(([_, value]) => value),
  exhaustMap(value => this.api.save(value)),
);`),
      blk(`<h3>Sharing: shareReplay</h3>
<b>shareReplay</b> multicasts one execution and replays the last value(s) to late subscribers. Use it for cached lookups so several components or async pipes do not repeat the HTTP call.`,
        `// countries.service.ts
@Injectable({ providedIn: 'root' })
export class CountriesService {
  readonly countries$ = this.http.get<Country[]>('/api/countries').pipe(
    shareReplay({ bufferSize: 1, refCount: true }),   // one request, replayed to everyone
  );
  constructor(private http: HttpClient) {}
}`),
    ],
    [
      blk(`<h3>Choosing and avoiding bugs</h3>
• <b>combineLatest</b> never emits until every source has emitted at least once, and never completes until all complete; infinite sources (valueChanges) need <code>startWith</code>. <b>forkJoin</b> needs finite sources, emits nothing if any completes empty, and errors fail all (catch per source). For polling or never-ending streams use <code>combineLatest</code> not <code>forkJoin</code>.<br>
• <code>zip</code> pairs values by index (1st with 1st); <code>race</code> takes the first source to emit. <code>combineLatest</code> and <code>forkJoin</code> accept arrays or object maps (named results, v7+); the multi-argument form is deprecated.<br>
• <code>merge</code> has <code>concurrent</code> limit; <code>concat</code> waits for each source to complete (infinite first source blocks the rest).<br>
• <b>shareReplay pitfalls</b>: <code>shareReplay(1)</code> without <code>refCount: true</code> keeps the source subscription alive forever after the last subscriber leaves (a leak for infinite sources, but good for HTTP that completes). Cached errors: the source is not re-subscribed after error unless you reset; use <code>share({ connector: () =&gt; new ReplaySubject(1), resetOnError: true, resetOnComplete: false, resetOnRefCountZero: true })</code> for exact control (RxJS 7). Cache invalidation needs an explicit refresh trigger, e.g. <code>refresh$.pipe(startWith(null), switchMap(() =&gt; http.get(...)), shareReplay(1))</code>.<br>
• Because an <code>HttpClient</code> observable is cold, two <code>| async</code> in a template trigger two requests: share, or bind once with <code>@if (data$ | async; as data)</code> (or <code>toSignal</code>).`,
        `// refreshable cached list
private refresh$ = new BehaviorSubject<void>(undefined);
readonly orders$ = this.refresh$.pipe(
  switchMap(() => this.http.get<Order[]>('/api/orders')),
  shareReplay({ bufferSize: 1, refCount: true }),
);
reload() { this.refresh$.next(); }`),
    ],
    [
      ['combineLatest vs forkJoin?', 'combineLatest emits every time any source emits (after all have emitted once) and works with infinite streams. forkJoin waits for all sources to complete and emits their last values once, like Promise.all.'],
      ['merge vs concat?', 'merge subscribes to all sources at once and interleaves emissions; concat subscribes to the next source only after the previous completes.'],
      ['What does withLatestFrom do?', 'On each emission of the main stream it combines the latest value of another stream; emissions of the other stream alone do not trigger output.'],
      ['Why does combineLatest sometimes emit nothing?', 'One source has not emitted yet. Add startWith for sources like valueChanges that emit only on change.'],
      ['What does shareReplay do and what is its main risk?', 'It shares one subscription and replays the latest N values to late subscribers. Without refCount it keeps the source alive forever and can cache stale data or errors.'],
      ['How do you load several HTTP calls in parallel on init?', 'forkJoin with an object of observables, handling errors per call if partial results are acceptable.'],
    ],
  ),

  topic(
    'ngs-m12-errors-subscriptions',
    L12_6,
    [
      blk(`<h3>Errors and ending streams</h3>
• <b>Error handling</b>: an error notification ends the observable. Unhandled, it reaches the subscriber (or is thrown as an unhandled error). Handle it with <b>catchError</b> (give a fallback), <b>retry</b> (try again), <b>finalize</b> (cleanup code that always runs).<br>
• <b>Subscription management</b>: infinite streams (<code>interval</code>, <code>fromEvent</code>, Subjects) never end, so you must end them. <b>Memory leak prevention</b> = every long-lived subscription has an owner that closes it.<br>
• Tools: <b>take</b>, <b>takeUntil</b>, <b>takeUntilDestroyed</b>, <code>unsubscribe()</code>, the async pipe.`,
        `this.http.get<User[]>('/api/users').pipe(
  retry(2),                                      // 2 more attempts on error
  catchError(err => {                            // after retries fail
    console.error(err);
    return of([] as User[]);                     // fallback value, stream completes normally
  }),
  finalize(() => (this.loading = false)),        // always runs: success, error or unsubscribe
).subscribe(users => (this.users = users));`),
    ],
    [
      blk(`<h3>catchError, retry, finalize in more detail</h3>`,
        `// catchError: return a replacement observable, or rethrow
catchError(err => err.status === 404 ? of(null) : throwError(() => err))

// retry with delay and a count (RxJS 7 config form)
retry({ count: 3, delay: (err, attempt) => timer(attempt * 1000) })   // 1s, 2s, 3s back-off

// retry only for transient errors
retry({ count: 2, delay: err => (err.status >= 500 ? timer(500) : throwError(() => err)) })

// finalize: stop the spinner
this.loading.set(true);
this.api.load().pipe(finalize(() => this.loading.set(false))).subscribe();`),
      blk(`<h3>Stopping streams: take, takeUntil, takeUntilDestroyed</h3>`,
        `// take(n): self ending
this.router.events.pipe(filter(e => e instanceof NavigationEnd), take(1)).subscribe(() => this.init());

// takeUntil with a notifier (classic pattern)
private destroy$ = new Subject<void>();
ngOnInit() { interval(1000).pipe(takeUntil(this.destroy$)).subscribe(); }
ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

// modern: takeUntilDestroyed (Angular 16+)
constructor() { interval(1000).pipe(takeUntilDestroyed()).subscribe(); }
// outside an injection context: takeUntilDestroyed(this.destroyRef)

// manual Subscription management
private subs = new Subscription();
ngOnInit() { this.subs.add(a$.subscribe()); this.subs.add(b$.subscribe()); }
ngOnDestroy() { this.subs.unsubscribe(); }`),
      blk(`<h3>Observable to Promise: firstValueFrom and lastValueFrom</h3>
<code>firstValueFrom(obs$)</code> resolves with the first emission; <code>lastValueFrom(obs$)</code> waits for completion and resolves with the last. They replace the deprecated <code>toPromise()</code> and enable <code>async/await</code>. Both reject with <code>EmptyError</code> if the stream completes without a value, unless you pass <code>{ defaultValue }</code>.`,
        `async loadProfile() {
  const user = await firstValueFrom(this.http.get<User>('/api/me'));
  const total = await lastValueFrom(this.progress$, { defaultValue: 0 });
  console.log(user.name, total);
}`),
    ],
    [
      blk(`<h3>Details and recommendations</h3>
• Error semantics: the subscriber <code>error</code> callback is terminal. <code>catchError</code> replaces the failing source with another observable, so the downstream sees a normal continuation. To keep a long-lived stream (a valueChanges pipeline) alive, <b>catch inside the inner observable</b>, not on the outer.<br>
• <code>retry</code> resubscribes to the whole upstream chain (cold sources re-execute, e.g. re-send an HTTP request): never retry non-idempotent POSTs blindly. Add back-off (<code>retry({ delay })</code>) and jitter; for HTTP combine with an interceptor. <code>retryWhen</code> is deprecated.<br>
• <code>finalize</code> runs on complete, error <i>and</i> unsubscribe, making it ideal for spinners; its position matters (put it last in pipe to also cover downstream unsubscription, but before <code>takeUntil</code> if you want it to run when takeUntil triggers).<br>
• <b>takeUntil position</b>: put it as the <i>last</i> operator, after switchMap/mergeMap, otherwise inner subscriptions can leak.<br>
• Unhandled errors with no <code>error</code> callback are reported asynchronously through <code>reportUnhandledError</code> (RxJS 7), reaching Angular's <code>ErrorHandler</code>.<br>
• What does <b>not</b> need manual unsubscribe: completing HttpClient calls, <code>async</code> pipe, <code>toSignal</code>, <code>first()/take(n)</code> that complete. What does: <code>interval</code>, <code>fromEvent</code>, valueChanges, router events, Subject-based buses, WebSockets.<br>
• Detect leaks with browser memory profiler (growing detached DOM nodes / listeners) and by logging with <code>tap({ finalize })</code>. A lint rule (<code>eslint-plugin-rxjs-angular</code>, <code>no-ignored-subscription</code>) helps.<br>
• <code>toPromise()</code> is deprecated (removed in RxJS 8): always use <code>firstValueFrom</code>/<code>lastValueFrom</code>.`),
    ],
    [
      ['How do you handle errors in RxJS?', 'Use catchError to supply a fallback observable or rethrow, retry for transient failures (with delay/back-off), the subscriber error callback as last resort, and finalize for cleanup.'],
      ['Where to put catchError in a switchMap chain?', 'Inside the inner observable so the outer stream survives an error; at the end of the chain it would end the stream.'],
      ['How do you prevent memory leaks from subscriptions?', 'Use async pipe, toSignal, take/first for finite needs, takeUntilDestroyed or takeUntil(destroy$) placed last in the pipe, or a Subscription container unsubscribed in ngOnDestroy.'],
      ['What is takeUntilDestroyed?', 'An Angular rxjs-interop operator completing a stream when the injection context (component, directive, service) is destroyed; takes an optional DestroyRef.'],
      ['firstValueFrom vs toPromise?', 'firstValueFrom/lastValueFrom are the replacements for the deprecated toPromise, with explicit semantics and EmptyError or defaultValue handling.'],
      ['When does finalize run?', 'On complete, on error and on unsubscribe.'],
    ],
  ),

  topic(
    'ngs-m12-asyncpipe-interop-testing',
    L12_7,
    [
      blk(`<h3>AsyncPipe: subscribe from the template</h3>
• <b>AsyncPipe</b> (<code>| async</code>) subscribes to an Observable (or Promise) in the template, shows the latest value and <b>unsubscribes automatically</b> when the component dies. It also triggers change detection for OnPush components.<br>
• Use <code>@if (data$ | async; as data)</code> to subscribe once and get a local variable.`,
        `// users.component.ts
users$ = inject(HttpClient).get<User[]>('/api/users');

// users.component.html
@if (users$ | async; as users) {
  <ul> @for (u of users; track u.id) { <li>{{ u.name }}</li> } </ul>
} @else { <p>Loading...</p> }`),
    ],
    [
      blk(`<h3>RxJS with Angular Signals</h3>
• <b>toSignal(obs$, { initialValue })</b> turns an observable into a signal (auto-unsubscribes).<br>
• <b>toObservable(signal)</b> turns a signal into an observable (emits asynchronously through an effect), the bridge to <code>switchMap</code>.<br>
Both come from <code>@angular/core/rxjs-interop</code> (stable in v17+; developer preview in v16). Details in Module 13.`,
        `import { toSignal, toObservable } from '@angular/core/rxjs-interop';

export class ProductsComponent {
  private api = inject(ProductApi);
  query = signal('');
  products = toSignal(
    toObservable(this.query).pipe(debounceTime(300), switchMap(q => this.api.search(q))),
    { initialValue: [] as Product[] },
  );
}
// template: {{ products().length }} results`),
      blk(`<h3>Choosing the right operator</h3>
<table ${TABLE}><thead><tr><th>I want to...</th><th>Use</th></tr></thead><tbody>
<tr><td>Change each value</td><td>map</td></tr>
<tr><td>Drop some values</td><td>filter, take, skip, distinctUntilChanged</td></tr>
<tr><td>React once typing pauses</td><td>debounceTime</td></tr>
<tr><td>Call an API per value, latest only</td><td>switchMap</td></tr>
<tr><td>Call an API per value, keep order</td><td>concatMap</td></tr>
<tr><td>Call an API per value, in parallel</td><td>mergeMap</td></tr>
<tr><td>Ignore triggers while busy</td><td>exhaustMap</td></tr>
<tr><td>Wait for several calls</td><td>forkJoin</td></tr>
<tr><td>Latest of several live streams</td><td>combineLatest</td></tr>
<tr><td>Combine an event with current state</td><td>withLatestFrom</td></tr>
<tr><td>Recover from errors</td><td>catchError, retry</td></tr>
<tr><td>Share an HTTP result</td><td>shareReplay</td></tr>
<tr><td>Stop on destroy</td><td>takeUntilDestroyed</td></tr></tbody></table>`),
    ],
    [
      blk(`<h3>RxJS marble testing</h3>
<b>Marble testing</b> describes streams as ASCII diagrams run on a virtual clock via <code>TestScheduler</code>: <code>-</code> is one frame (1 ms), letters are values, <code>|</code> complete, <code>#</code> error, <code>(ab)</code> same-frame group, <code>^</code> subscription point in hot observables, <code>!</code> unsubscription. Time progression such as <code>debounceTime(30)</code> is then tested without real waiting.`,
        `import { TestScheduler } from 'rxjs/testing';

describe('search stream', () => {
  const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

  it('debounces and uses the latest value', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const input  = cold('a-b-c------|');           // user types a, b, c
      const result = input.pipe(debounceTime(3));
      expectObservable(result).toBe('------c----|');  // only c survives (debounce 3 frames)
    });
  });
});
// For simple async cases use fakeAsync + tick(), or subscribe in an async test and await firstValueFrom.`),
      blk(`<h3>Interop details and AsyncPipe internals</h3>
• <b>AsyncPipe</b> is impure; it holds the subscription, calls <code>markForCheck</code> on emission (so it works with OnPush), and returns <code>null</code> before the first value (so guard with <code>@if ... as</code> or use <code>?? default</code>). Each <code>| async</code> is a separate subscription: share cold sources.<br>
• <b>toSignal</b> subscribes immediately, unsubscribes on owner destroy, throws on read if the observable errored, and needs an <code>initialValue</code> (or <code>requireSync: true</code> for synchronous sources like BehaviorSubject) otherwise the type includes <code>undefined</code>. It must run in an injection context (or pass <code>injector</code>). <b>toObservable</b> emits through an <code>effect</code>, so rapid sequential sets are coalesced and the first emission is asynchronous.<br>
• Prefer <b>signals for state, RxJS for events and async flows</b> (debounce, cancellation, retry, websockets). Angular's own <code>httpResource</code>/<code>resource()</code> (Module 13) cover many simple cases that once required <code>switchMap</code> wiring.<br>
• Avoid manual <code>subscribe</code> in components where the async pipe or toSignal fit; if you subscribe, own the cleanup.<br>
• Version note: RxJS 7.8 ships with Angular 16-20; RxJS 8 will remove deprecated APIs (<code>toPromise</code>, the old <code>subscribe(next, error, complete)</code> form, <code>retryWhen</code>) so migrate now.`),
    ],
    [
      ['What does the AsyncPipe do and why is it recommended?', 'It subscribes to an Observable/Promise in the template, renders the latest value, unsubscribes automatically on destroy and marks the view for check, avoiding manual subscriptions and leaks.'],
      ['What is toSignal and what must you provide?', 'It converts an Observable to a Signal and unsubscribes automatically. Provide initialValue (or requireSync) or accept undefined; call it in an injection context.'],
      ['How do you bridge a signal into an RxJS pipeline?', 'toObservable(signal) then operators like debounceTime and switchMap, optionally converting back with toSignal.'],
      ['What are marble diagrams?', 'A textual notation for streams over virtual time (- frames, letters values, | complete, # error) used with TestScheduler to test timing-based operators deterministically.'],
      ['How do you choose between switchMap, concatMap, mergeMap and exhaustMap?', 'Latest only: switchMap. Ordered queue: concatMap. Parallel: mergeMap. Ignore while busy: exhaustMap.'],
      ['Signals or RxJS for state?', 'Signals for synchronous state and derived values; RxJS for event streams, time-based operators, cancellation and complex async orchestration. Interop functions connect them.'],
    ],
  ),
];

// ---------------------------------------------------------------- Module 13
const L13_1 = 'Signals basics: signal(), set(), update(), asReadonly()';
const L13_2 = 'computed(), effect(), equality and dependencies';
const L13_3 = 'Signal-based components: input(), model(), output()';
const L13_4 = 'linkedSignal() and resource()';
const L13_5 = 'Signal interop with RxJS: toSignal() and toObservable()';
const L13_6 = 'Signal performance, testing, mistakes and best practices';

const m13: Topic[] = [
  ov(13, '<b>Signals</b> are Angular reactive values: you read them by calling them, and Angular knows exactly what depends on them. Some APIs (linkedSignal, resource) are newer: check your Angular version.', [
    ['Introduction to Signals', 'A reactive value container Angular can track', L13_1],
    ['Signals vs Observables', 'Synchronous state vs asynchronous streams', L13_1],
    ['Creating signals', 'signal(initial)', L13_1],
    ['signal()', 'Writable signal factory', L13_1],
    ['Reading signal values', 'Call it: count()', L13_1],
    ['Updating signal values', 'set, update', L13_1],
    ['set()', 'Replace the value', L13_1],
    ['update()', 'Compute new value from old', L13_1],
    ['asReadonly()', 'Expose a read-only view', L13_1],
    ['computed()', 'Derived read-only signal', L13_2],
    ['Derived state', 'Compute values instead of storing duplicates', L13_2],
    ['effect()', 'Run side effects when signals change', L13_2],
    ['Signal equality', 'Changes are detected with Object.is or custom equal', L13_2],
    ['Signal dependencies', 'Dynamic automatic tracking', L13_2],
    ['Signals in templates', 'Call signals in the template; fine-grained updates', L13_1],
    ['Signals in components', 'Fields as signals, OnPush friendly', L13_1],
    ['Input signals', 'input() and input.required()', L13_3],
    ['Model signals', 'model() two-way binding', L13_3],
    ['Output functions', 'output() replaces @Output EventEmitter', L13_3],
    ['Signal-based component communication', 'Parent-child with inputs, models, outputs, queries', L13_3],
    ['Signal-based state management', 'Services holding signals', L13_3],
    ['linkedSignal()', 'Writable signal that resets from a source', L13_4],
    ['resource() and async resource patterns', 'Signal-driven async loading', L13_4],
    ['Signal interop with RxJS', 'Bridging both worlds', L13_5],
    ['toSignal()', 'Observable to Signal', L13_5],
    ['toObservable()', 'Signal to Observable', L13_5],
    ['Signal performance', 'Fine-grained updates, memoisation', L13_6],
    ['Signal testing', 'Testing with TestBed and flushEffects', L13_6],
    ['Common signal mistakes', 'Mutation, effect misuse, forgetting to call', L13_6],
    ['Signals best practices', 'Guidelines for clean signal code', L13_6],
  ]),

  topic(
    'ngs-m13-signals-basics',
    L13_1,
    [
      blk(`<h3>Introduction to Signals</h3>
• A <b>signal</b> is a box holding a value that tells Angular when the value changes. Like a spreadsheet cell: change A1 and every cell using it recalculates automatically.<br>
• <b>Creating signals</b>: <code>signal(initialValue)</code>. <b>Reading signal values</b>: call it like a function, <code>count()</code>. <b>Updating signal values</b>: <code>count.set(5)</code> or <code>count.update(c =&gt; c + 1)</code>.<br>
• <b>Signals in templates</b>: write <code>{{ count() }}</code>; Angular updates only that spot when it changes. No pipes, no subscriptions.`,
        `// counter.component.ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: '<p>Count: {{ count() }}</p><button (click)="inc()">+1</button><button (click)="reset()">Reset</button>',
})
export class CounterComponent {
  count = signal(0);                       // writable signal
  inc() { this.count.update(c => c + 1); } // new value from the old one
  reset() { this.count.set(0); }           // replace
}`),
      blk(`<h3>Signals vs Observables</h3>
<table ${TABLE}><thead><tr><th></th><th>Signal</th><th>Observable</th></tr></thead><tbody>
<tr><td>Value</td><td>Always has a current value</td><td>Values arrive over time (maybe none)</td></tr>
<tr><td>Read</td><td>Synchronously: <code>s()</code></td><td>Subscribe</td></tr>
<tr><td>Cleanup</td><td>Automatic (garbage collected)</td><td>Must unsubscribe unless async pipe</td></tr>
<tr><td>Best for</td><td>UI state, derived values</td><td>Events, HTTP, time-based flows</td></tr>
<tr><td>Push/Pull</td><td>Push notification, lazy pull of values</td><td>Push</td></tr></tbody></table>`),
    ],
    [
      blk(`<h3>Writable, read-only, and signals in components</h3>
• <code>set()</code> replaces; <code>update(fn)</code> derives from the previous value. For objects and arrays always create a new reference: <code>items.update(list =&gt; [...list, x])</code>.<br>
• <b>asReadonly()</b> returns a read-only view so a service can keep <code>set</code> private and expose state safely (like a Java getter without a setter).<br>
• <b>Signals in components</b>: declare state as signal fields; the template reads them by calling. They work with <code>OnPush</code> and zoneless change detection because Angular knows what to refresh.`,
        `// todo.store.ts - signals in a service with a read-only API
@Injectable({ providedIn: 'root' })
export class TodoStore {
  private _todos = signal<Todo[]>([]);
  readonly todos = this._todos.asReadonly();          // consumers cannot call set/update

  add(title: string) { this._todos.update(list => [...list, { id: Date.now(), title, done: false }]); }
  toggle(id: number) {
    this._todos.update(list => list.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }
}

// todo-list.component.html
// @for (t of store.todos(); track t.id) { <li (click)="store.toggle(t.id)">{{ t.title }}</li> }`),
    ],
    [
      blk(`<h3>How signals work</h3>
• A signal is a node in a reactive graph. Reading one inside a <b>reactive context</b> (template, <code>computed</code>, <code>effect</code>) records a dependency; setting it marks consumers dirty and schedules them. The graph is push-pull: notification is pushed, values are pulled lazily and cached.<br>
• Templates are reactive contexts: a component with <code>OnPush</code> is marked for check only when a signal it read changed. This is the foundation for <b>zoneless</b> change detection (<code>provideZonelessChangeDetection()</code>, stable in v20.2, experimental from v18).<br>
• Signals are not deep reactive: <code>user().name = 'x'</code> mutates silently and nothing updates. Use immutable updates (or copy-on-write helpers). Signal arrays of signals are possible but make code hard to reason about; prefer one signal of an immutable structure and derive slices with <code>computed</code>.<br>
• Reading a signal in a plain method called outside a reactive context just returns the current value; no tracking occurs. <code>untracked(() =&gt; sig())</code> reads without creating a dependency.<br>
• Version: signals stable from v17 (developer preview v16); signal inputs v17.1, model v17.2, signal queries v17.2, output() v17.3, <code>linkedSignal</code> and <code>resource</code> v19 (experimental through v19-20; check release notes), zoneless from v18 (experimental).`),
    ],
    [
      ['What is a signal?', 'A reactive wrapper around a value. You read it by calling it, change it with set/update, and Angular tracks consumers (templates, computed, effects) so only dependents update.'],
      ['set vs update?', 'set replaces the value; update takes a function receiving the current value and returning the new one.'],
      ['Why use asReadonly()?', 'To expose state without letting consumers modify it, keeping write access inside the owner (encapsulation).'],
      ['Signals vs Observables?', 'Signals hold a current synchronous value and suit UI state; Observables model asynchronous streams over time with operators. They interoperate.'],
      ['Why does mutating an object inside a signal not update the view?', 'Signals detect change by reference equality (Object.is). Mutation keeps the same reference; replace the object or array with a new one.'],
    ],
  ),

  topic(
    'ngs-m13-computed-effect',
    L13_2,
    [
      blk(`<h3>computed() and derived state</h3>
• <b>Derived state</b> is anything you can calculate from other state (totals, filtered lists). Do not store it separately; compute it.<br>
• <b>computed()</b> creates a read-only signal from a formula. Like a spreadsheet formula cell: it recalculates when its inputs change, and caches the result otherwise.<br>
• <b>effect()</b> runs code (a side effect: logging, saving, calling a library) whenever the signals it reads change.`,
        `const price = signal(100);
const qty = signal(2);
const total = computed(() => price() * qty());   // 200

qty.set(3);
console.log(total());                            // 300 (recomputed lazily)

effect(() => console.log('total is now', total()));   // runs once now, then on each change`),
    ],
    [
      blk(`<h3>Dependencies, equality and effects in practice</h3>
• <b>Signal dependencies</b> are tracked <b>dynamically</b> at runtime: only the signals actually read in the last run count. In <code>flag() ? a() : b()</code> only one of a or b is a dependency at a time.<br>
• <b>Signal equality</b>: a signal notifies only if the new value is <b>not equal</b> (<code>Object.is</code>) to the old one. Pass <code>{ equal: fn }</code> to <code>signal</code> or <code>computed</code> for custom comparison.<br>
• <b>effect()</b> must be created in an injection context (constructor or field initialiser), runs asynchronously during change detection, and is destroyed with its owner. Use it for syncing with the outside world (localStorage, analytics, canvas, third-party widgets), not for deriving state.`,
        `export class CartComponent {
  items = signal<CartItem[]>([]);
  coupon = signal(0);

  count = computed(() => this.items().reduce((n, i) => n + i.qty, 0));
  subtotal = computed(() => this.items().reduce((s, i) => s + i.price * i.qty, 0));
  total = computed(() => this.subtotal() * (1 - this.coupon() / 100));     // derived state

  // custom equality: ignore re-sorted arrays with same ids
  ids = computed(() => this.items().map(i => i.id), { equal: (a, b) => a.length === b.length && a.every((x, i) => x === b[i]) });

  constructor() {
    effect(() => localStorage.setItem('cart', JSON.stringify(this.items())));   // sync side effect
    effect(onCleanup => {
      const id = setInterval(() => console.log(this.count()), 5000);
      onCleanup(() => clearInterval(id));                                       // runs before re-run and on destroy
    });
  }
}`),
    ],
    [
      blk(`<h3>Rules, pitfalls and version notes</h3>
• <b>computed is lazy and memoised</b>: the function runs on first read and again only if a dependency changed. It must be pure: no side effects and no writes to signals (Angular throws).<br>
• <b>effect timing</b>: component effects run during change detection before the component's template check (v19 changed timing: effects are tied to the component tree and run in the "mark for check" phase; root effects run in microtask-like flush). Do not rely on exact order; do not read DOM state in effects: use <code>afterRenderEffect</code> / <code>afterNextRender</code>.<br>
• <b>Writing signals inside effects</b> is disallowed by default (error NG0600) because it creates loops; v19 removed <code>allowSignalWrites</code> as a requirement, but prefer <code>computed</code> or <code>linkedSignal</code> for derivations. Use <code>untracked()</code> to read signals without subscribing.<br>
• Avoid effects for state propagation chains (A sets B sets C): hard to debug. Use computed or event handlers.<br>
• <code>effect</code> outside an injection context: pass <code>{ injector }</code>. Manual destroy: <code>const ref = effect(...); ref.destroy()</code>.<br>
• Conditional reads: if the effect returns early before reading a signal, that signal is not tracked in that run; read all dependencies you need first.<br>
• Java mapping: <code>computed</code> ~ a memoised getter; <code>effect</code> ~ a listener/observer registered for you.`,
        `effect(() => {
  const user = this.user();                    // tracked
  untracked(() => this.analytics.track('user-changed', this.sessionId()));   // sessionId NOT tracked
});`),
    ],
    [
      ['computed vs effect?', 'computed derives a read-only, lazily evaluated and memoised value and must be pure. effect performs side effects whenever its dependencies change and returns nothing.'],
      ['How does Angular know a computed or effect depends on a signal?', 'It tracks signals read during execution (dynamic dependency tracking) and re-evaluates when any of them changes.'],
      ['What is signal equality?', 'A signal updates dependents only when the new value differs from the old one by Object.is, or by a custom equal function you provide.'],
      ['Why avoid using effect to set other signals?', 'It hides data flow, can cause loops and extra change detection. Use computed for derivation or linkedSignal for resettable state.'],
      ['Where can you call effect()?', 'In an injection context such as a constructor or field initialiser (or pass an injector); it is auto-destroyed with the owner.'],
    ],
  ),

  topic(
    'ngs-m13-signal-components',
    L13_3,
    [
      blk(`<h3>Signal-based component API</h3>
• <b>Input signals</b>: <code>name = input&lt;string&gt;()</code> or <code>input.required&lt;string&gt;()</code>; read with <code>name()</code>. Replaces <code>@Input()</code>.<br>
• <b>Output functions</b>: <code>saved = output&lt;User&gt;()</code>, emit with <code>this.saved.emit(user)</code>. Replaces <code>@Output() + EventEmitter</code>.<br>
• <b>Model signals</b>: <code>value = model(0)</code> is a writable input plus an automatic output, enabling <code>[(value)]</code> two-way binding.<br>
• <b>Signal-based component communication</b>: parent sets inputs, child emits outputs, siblings share a signal service.`,
        `// rating.component.ts (child)
@Component({
  selector: 'app-rating',
  template: '<button (click)="rate.set(rate() + 1)">+</button> {{ rate() }} / {{ max() }} <button (click)="cleared.emit()">clear</button>',
})
export class RatingComponent {
  max = input(5);                       // optional input with default
  label = input.required<string>();     // must be provided
  rate = model(0);                      // two-way: [(rate)]
  cleared = output<void>();             // event
}

// parent.component.html
// <app-rating label="Quality" [max]="10" [(rate)]="score" (cleared)="score = 0" />`),
    ],
    [
      blk(`<h3>Derive from inputs and share signal state</h3>
Inputs are signals, so derived values are plain <code>computed</code> (no <code>ngOnChanges</code>). <code>input()</code> accepts <code>{ alias, transform }</code>, e.g. <code>numberAttribute</code> or <code>booleanAttribute</code>.`,
        `export class UserCardComponent {
  user = input.required<User>();
  compact = input(false, { transform: booleanAttribute });          // <app-user-card compact>
  initials = computed(() => this.user().name.split(' ').map(p => p[0]).join(''));   // reacts to input changes
  selected = output<User>();
  fullWidth = computed(() => !this.compact());
}`),
      blk(`<h3>Signal-based state management in a service</h3>
A root service with private writable signals, public readonly signals, computed selectors and methods for actions is enough for most apps.`,
        `@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  readonly total = computed(() => this._items().reduce((s, i) => s + i.price, 0));

  add(item: CartItem) { this._items.update(l => [...l, item]); }
  remove(id: number) { this._items.update(l => l.filter(i => i.id !== id)); }
}
// any component: store = inject(CartStore); {{ store.count() }}`),
    ],
    [
      blk(`<h3>Details and migration</h3>
• Signal inputs are <b>read-only</b> inside the component and can be read only after construction (not in the constructor body before inputs are set; use <code>computed</code>/<code>effect</code> or <code>ngOnInit</code>). Required inputs throw if read before binding.<br>
• <code>transform</code> functions must be pure and statically analysable. Use <code>input&lt;T, TRaw&gt;</code> generics for transforms.<br>
• <b>output()</b> is not an Observable (no pipe) but supports <code>outputToObservable</code> / <code>outputFromObservable</code> in rxjs-interop. Emitting during change detection or in the constructor is not allowed. It cleans up its subscribers automatically.<br>
• <b>model()</b> can be bound with <code>[(x)]</code> or with <code>[x]</code> plus <code>(xChange)</code>. Parent must pass a writable signal for true two-way sync; <code>model.required()</code> exists.<br>
• Signal queries: <code>viewChild()</code>, <code>viewChildren()</code>, <code>contentChild()</code>, <code>contentChildren()</code> replace decorator queries and return signals (fixes timing problems).<br>
• Schematics migrate automatically: <code>ng generate @angular/core:signal-input-migration</code>, <code>output-migration</code>, <code>signal-queries-migration</code>.<br>
• <code>inject()</code>-based services plus signals give a lightweight store; when you need devtools, undo, effects orchestration at scale, consider NgRx Signal Store (Module 15).`),
    ],
    [
      ['How do input signals differ from @Input?', 'input() returns a read-only signal, can be required, supports transform and alias, and integrates with computed/effect so ngOnChanges is unnecessary.'],
      ['What does model() do?', 'It creates a writable signal that is both an input and an output (xChange), enabling two-way binding with [(x)].'],
      ['How do you emit events with output()?', 'Declare name = output<T>() and call name.emit(value); parents listen with (name)="handler($event)".'],
      ['How can siblings communicate with signals?', 'Through a shared service that owns signals (private writable, public readonly) and exposes methods to change them.'],
      ['Can you read input signals in the constructor?', 'Not meaningfully, they are not set yet; use computed, effect or ngOnInit.'],
    ],
  ),

  topic(
    'ngs-m13-linked-resource',
    L13_4,
    [
      blk(`<h3>Two newer helpers</h3>
Version note: <b>linkedSignal()</b> and <b>resource()</b> arrived in Angular 19 as experimental/developer-preview APIs and may be stabilised or renamed in later versions (resource gained <code>params</code> instead of <code>request</code> in v20, and <code>httpResource</code> was added in v19.2). Check the docs of your version before relying on them.<br>
• <b>linkedSignal</b>: a writable signal whose value is <b>reset automatically</b> when a source signal changes, yet the user can still set it. Example: the selected size resets to the first option when the product changes.<br>
• <b>resource()</b>: loads async data driven by signals, exposing <code>value()</code>, <code>isLoading()</code>, <code>error()</code> and <code>status()</code> as signals.`,
        `// linkedSignal
sizes = input.required<string[]>();
selectedSize = linkedSignal(() => this.sizes()[0]);     // resets to first size when sizes change
pick(s: string) { this.selectedSize.set(s); }           // but is still writable

// resource (Angular 19 shape: request/loader)
userId = signal(1);
user = resource({
  request: () => ({ id: this.userId() }),                // reruns when userId changes
  loader: async ({ request, abortSignal }) => {
    const res = await fetch('/api/users/' + request.id, { signal: abortSignal });
    return (await res.json()) as User;
  },
});
// template: @if (user.isLoading()) { Loading... } @else { {{ user.value()?.name }} }`),
    ],
    [
      blk(`<h3>Using them in real components</h3>
• <code>linkedSignal({ source, computation })</code> gives access to the previous value so you can <b>keep</b> a selection when still valid.<br>
• <code>resource</code> aborts the previous load when the request changes and exposes <code>reload()</code>, <code>set()</code>, <code>update()</code> for local edits, and <code>status()</code>: idle, loading, reloading, resolved, error, local.<br>
• <code>rxResource</code> (rxjs-interop) takes an Observable loader. <code>httpResource()</code> (v19.2+, experimental) wraps HttpClient so interceptors apply.`,
        `// keep previous selection if it still exists
selected = linkedSignal<Item[], Item | undefined>({
  source: this.items,
  computation: (items, previous) => items.find(i => i.id === previous?.value?.id) ?? items[0],
});

// resource with Spring Boot (Angular 20 shape: params/loader)
page = signal(0);
orders = resource({
  params: () => ({ page: this.page() }),
  loader: ({ params, abortSignal }) =>
    fetch('/api/orders?page=' + params.page, { signal: abortSignal }).then(r => r.json() as Promise<Page<Order>>),
});

// httpResource (experimental)
user = httpResource<User>(() => '/api/users/' + this.userId());   // reactive URL; undefined skips the call`),
    ],
    [
      blk(`<h3>Guidance and caveats</h3>
• Use <code>linkedSignal</code> instead of an <code>effect</code> that writes to a signal when another changes (the classic "reset selection" bug-prone pattern).<br>
• <code>resource()</code> is for <b>reads</b>, not mutations: use HttpClient + a method for POST/PUT/DELETE and then <code>resource.reload()</code>. Resource does not retry or cache by default; add your own cache or keep using a service for shared data.<br>
• Reading <code>value()</code> of an errored resource throws in newer versions; check <code>hasValue()</code>/<code>error()</code>. During reload the previous value is kept (status "reloading"), which avoids flicker.<br>
• Because these APIs are experimental in some releases, isolate them behind a service, and keep an RxJS (<code>switchMap</code> + <code>toSignal</code>) fallback in mind. Argument names changed between 19 and 20; follow the migration notes of your version.<br>
• SSR: resource loaders run on the server; avoid browser-only APIs inside loaders.`),
    ],
    [
      ['What problem does linkedSignal solve?', 'A writable state derived from another signal that must reset when the source changes (selected item, current page) without hand-written effects.'],
      ['What does resource() provide?', 'Signal-driven async loading: value, isLoading, error and status signals, automatic reload when its request/params signal changes and abort of stale loads.'],
      ['Are linkedSignal and resource stable?', 'They were introduced as experimental in Angular 19; stability and some option names changed by v20, so verify against your version documentation.'],
      ['resource vs RxJS switchMap?', 'resource covers simple load-on-change cases with built-in loading and error state; RxJS remains better for debounce, retries, combination and complex streams.'],
      ['Should resource be used to save data?', 'No, it models reads. Perform writes with HttpClient or services and then reload or set the resource.'],
    ],
  ),

  topic(
    'ngs-m13-signal-interop',
    L13_5,
    [
      blk(`<h3>Bridging two worlds</h3>
• <b>Signal interop with RxJS</b> lets you use signals for the view and RxJS for async flows.<br>
• <b>toSignal(observable$)</b> subscribes and exposes the latest value as a signal (and unsubscribes automatically).<br>
• <b>toObservable(signal)</b> makes an observable that emits when the signal changes.`,
        `import { toSignal, toObservable } from '@angular/core/rxjs-interop';

export class ClockComponent {
  now = toSignal(interval(1000).pipe(map(() => new Date())), { initialValue: new Date() });   // observable -> signal
  query = signal('');
  query$ = toObservable(this.query);                                                          // signal -> observable
}
// template: {{ now() | date:'mediumTime' }}`),
    ],
    [
      blk(`<h3>Typical flow: search</h3>`,
        `export class SearchComponent {
  private http = inject(HttpClient);
  term = signal('');

  results = toSignal(
    toObservable(this.term).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(t => (t.length < 2 ? of([]) : this.http.get<Item[]>('/api/items', { params: { q: t } }))),
    ),
    { initialValue: [] as Item[] },
  );
}
// <input [value]="term()" (input)="term.set($any($event.target).value)">  @for (r of results(); track r.id) { ... }`),
      blk(`<h3>Options</h3>
• <code>toSignal</code> options: <code>initialValue</code>, <code>requireSync: true</code> (for BehaviorSubject-like sources that emit synchronously), <code>injector</code> (outside injection context), <code>manualCleanup</code>, <code>rejectErrors</code>.<br>
• Without <code>initialValue</code> the signal type is <code>T | undefined</code>.`),
    ],
    [
      blk(`<h3>Gotchas</h3>
• <b>Errors</b>: if the observable errors, reading the signal rethrows the error. Handle with <code>catchError</code> upstream.<br>
• <b>toObservable</b> uses an <code>effect</code> internally, so emissions are asynchronous and <b>glitch-free</b>: if the signal is set several times quickly, only the final value is emitted. Do not use it for synchronous event ordering.<br>
• <b>Injection context</b>: both functions need one (constructor/field), otherwise pass <code>{ injector }</code>; do not call <code>toSignal</code> repeatedly in methods, as each call creates a new subscription (leak until the owner dies).<br>
• <code>toSignal</code> on a cold HTTP observable fires the request immediately on creation, even if the template never reads the signal.<br>
• <code>toSignal</code> does not replace the async pipe in every case: the async pipe subscribes only when rendered (lazy), toSignal is eager.<br>
• <code>outputToObservable(output)</code> and <code>outputFromObservable(obs$)</code> bridge component outputs; <code>takeUntilDestroyed</code> comes from the same package.<br>
• Version: stable since Angular 17 (preview in 16); the <code>rejectErrors</code> option arrived in v19+.`),
    ],
    [
      ['How do you convert an Observable to a Signal?', 'toSignal(obs$, { initialValue }) from @angular/core/rxjs-interop; it subscribes immediately and unsubscribes when the owner is destroyed.'],
      ['Why does toSignal need initialValue?', 'A signal always has a value but the observable may not have emitted yet; without initialValue the type includes undefined, or use requireSync for synchronous sources.'],
      ['How do you use a signal with switchMap?', 'Convert with toObservable(signal), apply operators, then toSignal for the result.'],
      ['Is toObservable synchronous?', 'No, it emits through an effect, so changes are batched and asynchronous.'],
      ['What happens to errors in toSignal?', 'The error is thrown when the signal is read; catch errors in the pipeline.'],
    ],
  ),

  topic(
    'ngs-m13-signals-quality',
    L13_6,
    [
      blk(`<h3>Common signal mistakes</h3>
• Forgetting the parentheses: <code>{{ count }}</code> shows a function; use <code>{{ count() }}</code>.<br>
• Mutating objects or arrays inside a signal instead of replacing them.<br>
• Using <code>effect</code> to compute values (use <code>computed</code>).<br>
• Writing to signals in <code>computed</code>.<br>
• Storing the same data twice (a signal and a derived duplicate).<br>
• Reading a signal in the constructor and expecting it to update.`,
        `// WRONG
items().push(newItem);                   // mutation, no update

// RIGHT
items.update(l => [...l, newItem]);

// WRONG: derived value stored in an effect
effect(() => this.total.set(this.price() * this.qty()));
// RIGHT
total = computed(() => this.price() * this.qty());`),
    ],
    [
      blk(`<h3>Signal testing</h3>
Signals are plain synchronous values, so tests are simple: set, read, assert. Effects need change detection: call <code>TestBed.flushEffects()</code> (older versions) or <code>TestBed.tick()</code> / <code>fixture.detectChanges()</code> in newer ones. Inputs of a component are set with <code>fixture.componentRef.setInput('name', value)</code>.`,
        `it('computes total', () => {
  const store = TestBed.inject(CartStore);
  store.add({ id: 1, price: 40 });
  store.add({ id: 2, price: 60 });
  expect(store.total()).toBe(100);                 // no async needed
});

it('runs the effect', () => {
  const fixture = TestBed.createComponent(CartComponent);
  fixture.componentInstance.items.set([{ id: 1, price: 5, qty: 1 }]);
  fixture.detectChanges();                         // flushes effects
  expect(localStorage.getItem('cart')).toContain('"id":1');
});

it('sets signal inputs', () => {
  const fixture = TestBed.createComponent(UserCardComponent);
  fixture.componentRef.setInput('user', { name: 'Asha Rao' });
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('AR');
});`),
    ],
    [
      blk(`<h3>Signal performance and best practices</h3>
• <b>Fine-grained</b>: with signals only the exact template bindings that read a changed signal are refreshed; combined with OnPush or zoneless, big trees are not rechecked. <code>computed</code> memoises, so move heavy calculations into computed instead of template method calls.<br>
• Keep <code>computed</code> functions small and free of I/O; break large ones into several computed signals to limit recomputation (each caches independently). Use <code>equal</code> to stop propagation when results are equivalent.<br>
• Avoid signals of signals and giant objects updated frequently; prefer normalised, immutable structures (Module 15) so unchanged slices keep identity (use computed selectors to project them).<br>
• Do not create signals or effects in loops, methods or template-called functions; create them as fields once.<br>
<h3>Best practices</h3>
• State as private writable signal, expose <code>asReadonly()</code> or computed. Name signals as plain nouns, observables with <code>$</code> suffix.<br>
• Prefer <code>computed</code> over <code>effect</code>, <code>linkedSignal</code> over effect-setters, input/model/output over decorators, <code>toSignal</code> over manual subscribe in components.<br>
• Use effects only at the edges (storage, logging, DOM/third-party integration) with <code>onCleanup</code> for resources.<br>
• Migrate incrementally with the Angular schematics; signals and zone-based change detection can coexist.<br>
• Debug with Angular DevTools (signal graph view in recent versions) and by logging inside <code>effect</code>.`),
    ],
    [
      ['What are the most common signal mistakes?', 'Forgetting to call the signal, mutating values in place, using effect for derived state, writing signals inside computed, and creating signals/effects outside a stable place like fields or constructors.'],
      ['How do you test signal-based code?', 'Read and set signals synchronously; use fixture.componentRef.setInput for inputs and detectChanges (or TestBed.tick/flushEffects depending on version) to run effects.'],
      ['Why do signals improve performance?', 'Angular knows exactly which bindings depend on which signals, so it updates only those, and computed values are memoised.'],
      ['When is effect appropriate?', 'For side effects at the boundary: persistence, logging, analytics, imperative DOM or library integration, always with cleanup.'],
      ['How would you structure signal state in a service?', 'Private writable signals, public readonly signals or computed selectors, and methods that perform immutable updates.'],
    ],
  ),
];

// ---------------------------------------------------------------- Module 14
const L14_1 = 'HTTP, REST and JSON fundamentals';
const L14_2 = 'HttpClient setup and CRUD requests';
const L14_3 = 'Parameters, headers and typed services';
const L14_4 = 'Interceptors, errors, retry, timeout and loading';
const L14_5 = 'File upload, download and progress events';
const L14_6 = 'Pagination, search, cancellation, parallel and cached calls';
const L14_7 = 'Environments, CORS, testing and Spring Boot integration';

const m14: Topic[] = [
  ov(14, 'Angular talks to the backend through <b>HttpClient</b>. This module uses Spring Boot REST APIs as the server in all examples.', [
    ['HTTP fundamentals', 'Request/response protocol, headers, body, stateless', L14_1],
    ['REST architecture', 'Resources, URLs, uniform interface, statelessness', L14_1],
    ['HTTP methods', 'GET, POST, PUT, PATCH, DELETE', L14_1],
    ['HTTP status codes', '2xx success, 3xx redirect, 4xx client, 5xx server', L14_1],
    ['JSON request and response', 'Text format both sides exchange', L14_1],
    ['Configuring provideHttpClient()', 'Register HttpClient and interceptors', L14_2],
    ['HttpClient', 'Angular service for HTTP calls returning Observables', L14_2],
    ['GET requests', 'Read data', L14_2],
    ['POST requests', 'Create data', L14_2],
    ['PUT requests', 'Replace data', L14_2],
    ['PATCH requests', 'Partially update data', L14_2],
    ['DELETE requests', 'Remove data', L14_2],
    ['Request parameters', 'Data sent in URL, headers or body', L14_3],
    ['HTTP headers', 'Metadata such as Authorization, Content-Type', L14_3],
    ['Request bodies', 'JSON, FormData, text, blobs', L14_2],
    ['Query parameters', 'key=value pairs after ?', L14_3],
    ['Path parameters', 'Values inside the URL path', L14_3],
    ['Response types', 'json, text, blob, arraybuffer and observe options', L14_2],
    ['Typed API responses', 'Generic http.get with interfaces', L14_3],
    ['Generic API services', 'Reusable base service', L14_3],
    ['HttpParams', 'Immutable query string builder', L14_3],
    ['HttpHeaders', 'Immutable headers builder', L14_3],
    ['HTTP interceptors', 'Middleware for every request/response', L14_4],
    ['Functional interceptors', 'HttpInterceptorFn with inject()', L14_4],
    ['Authentication token interceptors', 'Add Bearer token automatically', L14_4],
    ['Request and response transformations', 'Clone requests, map responses', L14_4],
    ['Global error handling', 'Central interceptor for errors', L14_4],
    ['HTTP error responses', 'HttpErrorResponse and status handling', L14_4],
    ['Retry strategies', 'retry with delay and back-off', L14_4],
    ['Request timeout', 'timeout operator or interceptor', L14_4],
    ['Loading indicators', 'Global counter signal fed by an interceptor', L14_4],
    ['File uploads', 'FormData with multipart', L14_5],
    ['File downloads', 'Blob response and object URL', L14_5],
    ['Progress events', 'reportProgress and HttpEventType', L14_5],
    ['Pagination', 'Page and size parameters, Spring Page', L14_6],
    ['Sorting and filtering', 'sort and filter parameters', L14_6],
    ['Search with debounce', 'debounceTime plus switchMap', L14_6],
    ['API cancellation', 'Unsubscribe or switchMap aborts requests', L14_6],
    ['Parallel API requests', 'forkJoin', L14_6],
    ['Sequential API requests', 'switchMap or concatMap chains', L14_6],
    ['Caching API responses', 'shareReplay, interceptor cache, signals', L14_6],
    ['Environment-specific API URLs', 'Different base URLs per environment', L14_7],
    ['CORS', 'Browser cross-origin rules and server configuration', L14_7],
    ['API integration testing', 'HttpTestingController', L14_7],
    ['Connecting Angular with Spring Boot', 'Full flow: controller, DTO, service, proxy', L14_7],
  ]),

  topic(
    'ngs-m14-http-fundamentals',
    L14_1,
    [
      blk(`<h3>HTTP, REST and JSON in plain words</h3>
• <b>HTTP fundamentals</b>: the browser sends a <b>request</b> (method, URL, headers, optional body) and the server answers with a <b>response</b> (status code, headers, body). HTTP is stateless: every request stands alone, like sending separate letters.<br>
• <b>REST architecture</b>: design the API around <b>resources</b> (nouns): <code>/api/employees</code>, <code>/api/employees/7</code>. The method says the action. If you know Spring Boot, a <code>@RestController</code> exposes exactly this.<br>
• <b>JSON request and response</b>: data travels as JSON text: <code>{ "id": 7, "name": "Asha" }</code>. Angular converts JSON to objects for you.`,
        `// Spring Boot (server)
@RestController
@RequestMapping("/api/employees")
class EmployeeController {
  @GetMapping("/{id}") Employee get(@PathVariable Long id) { return service.find(id); }
  @PostMapping Employee create(@Valid @RequestBody EmployeeDto dto) { return service.create(dto); }
}`,
        `// Angular (client): GET /api/employees/7  ->  200 OK  { "id": 7, "name": "Asha" }
this.http.get<Employee>('/api/employees/7').subscribe(e => console.log(e.name));`),
      blk(`<h3>Methods and status codes</h3>
<table ${TABLE}><thead><tr><th>Method</th><th>Purpose</th><th>Idempotent</th><th>Spring annotation</th></tr></thead><tbody>
<tr><td><b>GET</b></td><td>Read</td><td>Yes</td><td>@GetMapping</td></tr>
<tr><td><b>POST</b></td><td>Create</td><td>No</td><td>@PostMapping</td></tr>
<tr><td><b>PUT</b></td><td>Replace whole resource</td><td>Yes</td><td>@PutMapping</td></tr>
<tr><td><b>PATCH</b></td><td>Change some fields</td><td>Usually no guarantee</td><td>@PatchMapping</td></tr>
<tr><td><b>DELETE</b></td><td>Remove</td><td>Yes</td><td>@DeleteMapping</td></tr></tbody></table><br>
<b>HTTP status codes</b>: 200 OK, 201 Created, 204 No Content; 301/302 redirect; 400 Bad Request (validation), 401 Unauthorized (not logged in), 403 Forbidden (not allowed), 404 Not Found, 409 Conflict, 422 Unprocessable; 500 Internal Server Error, 503 Service Unavailable.`),
    ],
    [
      blk(`<h3>Designing the contract</h3>
• Use plural nouns, nested resources sparingly (<code>/api/orders/5/items</code>), query parameters for filter/sort/page, and consistent error bodies.<br>
• Respond with proper codes: <code>201</code> + <code>Location</code> header on create, <code>204</code> on delete, <code>400</code> with field errors for validation, <code>404</code> for missing resources. In Spring Boot use <code>ResponseEntity</code> and a <code>@RestControllerAdvice</code> for error shaping.<br>
• JSON mapping: Jackson converts DTO classes to JSON with the same property names. Dates travel as ISO strings (<code>2025-03-01T10:00:00Z</code>) and become strings in TypeScript; convert with <code>new Date(...)</code> or the date pipe. Java <code>Long</code> beyond 2^53 loses precision in JavaScript: send as string.`,
        `// shared contract: employee.model.ts mirrors the Spring DTO
export interface Employee { id: number; name: string; email: string; joinedOn: string; salary: number; }
export interface ApiError { timestamp: string; status: number; message: string; errors?: Record<string, string>; }

// Spring error handler producing ApiError
@RestControllerAdvice
class ApiExceptionHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex) { /* 400 + field errors */ }
}`),
    ],
    [
      blk(`<h3>Expert notes</h3>
• <b>Idempotency</b> drives retry safety: retry GET/PUT/DELETE freely; POST only with an idempotency key header the server honours.<br>
• <b>401 vs 403</b>: 401 means unauthenticated (try refresh token or log in), 403 authenticated but not permitted (show forbidden page). Clients should not treat both the same.<br>
• HTTP/2 multiplexing makes many small requests cheap; HTTP caching headers (<code>ETag</code>, <code>Cache-Control</code>) can save bandwidth: browsers cache GET responses unless told otherwise; use <code>If-None-Match</code> flows for large lists.<br>
• Keep contracts typed: generate TypeScript clients from OpenAPI (springdoc-openapi + <code>openapi-generator</code>) so Spring DTO changes break the Angular build instead of production.<br>
• Prefer JSON everywhere; XML or form-encoded only for legacy endpoints (<code>application/x-www-form-urlencoded</code> via <code>HttpParams</code> body).`),
    ],
    [
      ['What does REST mean in practice?', 'Resource-oriented URLs, HTTP methods as verbs, stateless requests, representations such as JSON, and meaningful status codes.'],
      ['PUT vs PATCH?', 'PUT replaces the whole resource and is idempotent; PATCH sends only changed fields.'],
      ['401 vs 403?', '401: the client is not authenticated or the token is invalid; 403: authenticated but not authorised for the action.'],
      ['Which status code after a successful POST that creates a resource?', '201 Created, ideally with a Location header and the created resource in the body.'],
      ['Which methods are idempotent and why does it matter?', 'GET, PUT and DELETE (and HEAD/OPTIONS); repeating them has the same effect, so they are safe to retry. POST is not.'],
    ],
  ),

  topic(
    'ngs-m14-httpclient-crud',
    L14_2,
    [
      blk(`<h3>Setting up HttpClient</h3>
• <b>Configuring provideHttpClient()</b> in the application config registers the <b>HttpClient</b> service. Add features such as <code>withInterceptors([...])</code> and <code>withFetch()</code>.<br>
• Inject with <code>inject(HttpClient)</code> and call <code>get/post/put/patch/delete</code>. Each returns an <b>Observable</b> that sends the request <b>only when subscribed</b> (cold). Without subscribe (or async pipe) nothing is sent!`,
        `// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor]))],
};

// employee.service.ts
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private base = '/api/employees';

  list()                      { return this.http.get<Employee[]>(this.base); }
  get(id: number)             { return this.http.get<Employee>(this.base + '/' + id); }
  create(e: NewEmployee)      { return this.http.post<Employee>(this.base, e); }
  replace(id: number, e: Employee) { return this.http.put<Employee>(this.base + '/' + id, e); }
  patch(id: number, p: Partial<Employee>) { return this.http.patch<Employee>(this.base + '/' + id, p); }
  remove(id: number)          { return this.http.delete<void>(this.base + '/' + id); }
}`),
    ],
    [
      blk(`<h3>Using the service in a component</h3>
<b>GET</b> for reading, <b>POST</b> for creating (the object is the request body, sent as JSON automatically), <b>PUT</b> to replace, <b>PATCH</b> to update parts, <b>DELETE</b> to remove. <b>Request bodies</b> may be objects (JSON), <code>FormData</code>, strings, <code>Blob</code> or <code>HttpParams</code> for form-encoded.`,
        `export class EmployeeListComponent {
  private api = inject(EmployeeService);
  employees = toSignal(this.api.list(), { initialValue: [] as Employee[] });   // GET on creation

  add(name: string) {
    this.api.create({ name, email: name + '@corp.com' }).subscribe(created => console.log('id', created.id));   // POST
  }
  rename(e: Employee) { this.api.patch(e.id, { name: 'New' }).subscribe(); }                                      // PATCH
  delete(id: number)  { this.api.remove(id).subscribe(() => console.log('deleted')); }                           // DELETE
}`),
      blk(`<h3>Response types and observe options</h3>
• <b>Response types</b> (<code>responseType</code>): <code>'json'</code> (default), <code>'text'</code>, <code>'blob'</code>, <code>'arraybuffer'</code>.<br>
• <code>observe: 'body'</code> (default) returns the body; <code>'response'</code> returns the whole <code>HttpResponse</code> (status, headers); <code>'events'</code> returns progress events.`,
        `// need status and headers (e.g. Location after POST)
this.http.post<Employee>('/api/employees', dto, { observe: 'response' }).subscribe(res => {
  console.log(res.status, res.headers.get('Location'), res.body);
});

// plain text
this.http.get('/api/version', { responseType: 'text' }).subscribe(v => console.log(v));`),
    ],
    [
      blk(`<h3>Internals and good practice</h3>
• <b>Cold observables</b>: subscribing twice sends two requests. Responses of successful calls complete after one emission, so no unsubscribe is needed; but unsubscribe cancels in flight.<br>
• <code>provideHttpClient()</code> replaced <code>HttpClientModule</code> (legacy). Use <code>withFetch()</code> (uses the Fetch API; recommended for SSR), <code>withInterceptorsFromDi()</code> to keep old class-based interceptors, <code>withXsrfConfiguration()</code>, <code>withJsonpSupport()</code>.<br>
• Order: interceptors listed run in order for requests and reverse for responses.<br>
• Put HTTP in services, not components. Components deal with state (loading, data, error); the service returns observables mapped to domain types.<br>
• Do not build URLs by string concatenation of user input; use <code>HttpParams</code> or encode (<code>encodeURIComponent</code>).<br>
• Mutations followed by reads: after POST/DELETE, update local state or refetch; avoid reading stale cached lists.<br>
• Angular 19.2+ <code>httpResource()</code> offers a signal-first read API on top of HttpClient (experimental).`),
    ],
    [
      ['Why is my HttpClient call not sending a request?', 'HttpClient returns a cold Observable; the request is sent only on subscribe (or async pipe / toSignal). Nothing happens without a subscriber.'],
      ['How do you register HttpClient in a standalone app?', 'Add provideHttpClient() (with features like withInterceptors) to the application providers.'],
      ['How do you read the status code or headers?', 'Pass { observe: "response" } so the observable emits HttpResponse with status, headers and body.'],
      ['Do you need to unsubscribe from HttpClient calls?', 'Usually no, they complete after the response; unsubscribe only to cancel an in-flight request (switchMap and takeUntilDestroyed handle it).'],
      ['What does withFetch() do?', 'It makes HttpClient use the Fetch API instead of XMLHttpRequest, useful for SSR; note it does not support upload progress events.'],
    ],
  ),

  topic(
    'ngs-m14-params-headers-services',
    L14_3,
    [
      blk(`<h3>Sending data in the URL and headers</h3>
• <b>Path parameters</b> are inside the path: <code>/api/employees/7</code> (Spring <code>@PathVariable</code>).<br>
• <b>Query parameters</b> follow ?: <code>/api/employees?dept=IT&amp;page=0</code> (Spring <code>@RequestParam</code>).<br>
• <b>HTTP headers</b> carry metadata like <code>Authorization</code> and <code>Content-Type</code>.<br>
• These are all kinds of <b>request parameters</b>, alongside the <b>request body</b>.`,
        `this.http.get<Employee>('/api/employees/' + id);                            // path parameter
this.http.get<Employee[]>('/api/employees', { params: { dept: 'IT', page: 0 } });   // query: ?dept=IT&page=0
this.http.get<Employee[]>('/api/employees', { headers: { 'X-Trace-Id': 'abc' } });  // header`),
    ],
    [
      blk(`<h3>HttpParams and HttpHeaders (immutable)</h3>
<b>HttpParams</b> and <b>HttpHeaders</b> are <b>immutable</b>: every <code>set/append</code> returns a new object, so reassign. They also encode values safely.`,
        `let params = new HttpParams().set('dept', 'IT').set('page', 0);
if (search) params = params.set('q', search);              // reassign! the original is unchanged
params = params.append('tag', 'java').append('tag', 'angular');   // ?tag=java&tag=angular

const headers = new HttpHeaders({ 'Accept-Language': 'en' }).set('X-Client', 'web');

this.http.get<Employee[]>('/api/employees', { params, headers });

// object form is simpler and accepts string | number | boolean | readonly string[]
this.http.get<Employee[]>('/api/employees', { params: { dept: 'IT', page: 0, active: true } });`),
      blk(`<h3>Typed API responses and a generic API service</h3>
Always pass the generic type so the compiler knows the shape (<b>typed API responses</b>). Remember: TypeScript types are erased at runtime, so they are not validation. A <b>generic API service</b> removes CRUD repetition.`,
        `export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }

export abstract class CrudService<T extends { id: number }, NewT = Omit<T, 'id'>> {
  protected http = inject(HttpClient);
  constructor(protected url: string) {}

  list(params: Record<string, string | number | boolean> = {}) { return this.http.get<Page<T>>(this.url, { params }); }
  get(id: number)           { return this.http.get<T>(this.url + '/' + id); }
  create(body: NewT)        { return this.http.post<T>(this.url, body); }
  update(id: number, body: T) { return this.http.put<T>(this.url + '/' + id, body); }
  delete(id: number)        { return this.http.delete<void>(this.url + '/' + id); }
}

@Injectable({ providedIn: 'root' })
export class ProductService extends CrudService<Product> {
  constructor() { super('/api/products'); }
}`),
    ],
    [
      blk(`<h3>Notes</h3>
• Forgetting to reassign HttpParams is the classic bug (<code>params.set(...)</code> alone does nothing).<br>
• <code>HttpParams</code> encodes with its own codec which leaves some characters such as <code>+</code> unencoded; for exotic characters pass <code>new HttpParams({ encoder: ... })</code> or <code>fromObject</code> with a custom <code>HttpParameterCodec</code>.<br>
• Boolean/number values in the object form are converted to strings; <code>undefined</code>/<code>null</code> values may be skipped or stringified depending on the Angular version; filter them yourself.<br>
• Typed responses can lie: a backend rename leads to <code>undefined</code> at runtime. Use generated clients, or runtime validation (zod) at critical boundaries, and map DTOs to domain models in the service (adapter pattern): parse dates, rename fields.<br>
• Prefer composition (a small <code>ApiClient</code> wrapper per resource) over deep inheritance if endpoints diverge. Keep Content-Type automatic: setting it manually for <code>FormData</code> breaks the multipart boundary.<br>
• Headers like <code>Authorization</code> belong in an interceptor, not repeated per call.`),
    ],
    [
      ['Path vs query parameters?', 'Path params identify a specific resource (/employees/7); query params provide optional filters, paging and sorting (?dept=IT&page=0).'],
      ['Why is HttpParams immutable and what is the usual bug?', 'Each set/append returns a new instance, so you must reassign it; calling params.set without assignment silently does nothing.'],
      ['How do you type an HttpClient response?', 'Use the generic argument, e.g. http.get<Employee[]>(url). It is compile-time only; there is no runtime validation.'],
      ['Why create a generic CRUD service?', 'To avoid repeating list/get/create/update/delete for each resource while keeping type safety through generics.'],
      ['Should you set Content-Type manually for FormData?', 'No, the browser must set multipart/form-data with the boundary; setting it manually breaks the upload.'],
    ],
  ),

  topic(
    'ngs-m14-interceptors-errors',
    L14_4,
    [
      blk(`<h3>Interceptors: one place for cross-cutting rules</h3>
• An <b>HTTP interceptor</b> sits between your code and the network and can inspect or change every request and response, like a servlet <code>Filter</code> or Spring <code>HandlerInterceptor</code>.<br>
• <b>Functional interceptors</b> are plain functions <code>HttpInterceptorFn</code> registered with <code>withInterceptors([...])</code>; class-based <code>HttpInterceptor</code> is the legacy style.<br>
• Typical interceptors: add an <b>authentication token</b>, show a <b>loading indicator</b>, handle <b>errors globally</b>, log, set base URL.`,
        `// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const authReq = token ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req;   // requests are immutable: clone
  return next(authReq);
};

// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor]));`),
    ],
    [
      blk(`<h3>Global error handling, HTTP error responses, retry and timeout</h3>
• <b>HTTP error responses</b> arrive as <code>HttpErrorResponse</code> with <code>status</code>, <code>error</code> (the body) and <code>message</code>. Status 0 = network/CORS failure. 4xx/5xx errors go to the observable error channel.<br>
• <b>Global error handling</b>: one interceptor translates errors (401 to login, 403 to forbidden page, 5xx to a toast) and rethrows for local handling.<br>
• <b>Retry strategies</b>: retry only transient failures (network, 503) on idempotent calls, with back-off. <b>Request timeout</b>: RxJS <code>timeout()</code>.`,
        `// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  return next(req).pipe(
    retry({ count: 2, delay: (err, n) => (req.method === 'GET' && (err.status === 0 || err.status === 503) ? timer(n * 500) : throwError(() => err)) }),
    timeout(15000),                                              // fail if no response in 15s
    catchError((err: HttpErrorResponse | TimeoutError) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) router.navigate(['/login']);
        else if (err.status === 403) router.navigate(['/forbidden']);
        else if (err.status >= 500) toast.error('Server problem, please retry');
        else if (err.status === 0) toast.error('Cannot reach the server');
      }
      return throwError(() => err);                              // let callers handle 400 field errors
    }),
  );
};`),
      blk(`<h3>Request and response transformation, and loading indicator</h3>
Clone the request to modify it; map the <code>HttpResponse</code> body to transform responses (for example convert ISO date strings). A counter of active requests drives a global spinner.`,
        `// loading.interceptor.ts
@Injectable({ providedIn: 'root' })
export class LoadingService { private n = signal(0); readonly active = computed(() => this.n() > 0); inc() { this.n.update(v => v + 1); } dec() { this.n.update(v => v - 1); } }

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('X-Skip-Loading')) return next(req);
  const loading = inject(LoadingService);
  loading.inc();
  return next(req).pipe(finalize(() => loading.dec()));          // runs on success, error and cancel
};

// url + response transformation
export const apiInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.url.startsWith('/api') ? req.clone({ url: environment.apiUrl + req.url }) : req).pipe(
    map(ev => (ev instanceof HttpResponse && ev.body ? ev.clone({ body: reviveDates(ev.body) }) : ev)),
  );`),
    ],
    [
      blk(`<h3>Pitfalls and architecture</h3>
• <b>Immutability</b>: <code>HttpRequest</code> and <code>HttpResponse</code> are immutable; always <code>clone</code>. Interceptor order = array order for requests, reverse for responses. Place error handling and retry inside auth when you refresh tokens.<br>
• <b>Token refresh</b> pattern: on 401, perform one refresh using <code>exhaustMap</code>/<code>shareReplay</code> shared with other waiting requests, then replay the original request; protect against infinite loops by skipping the refresh URL itself.<br>
• Interceptors see every request including those to third-party hosts: attach tokens only to your own API origin to avoid token leakage. Use <code>HttpContextToken</code> to pass per-request flags (skip auth, disable retry) without magic headers.<br>
• <b>Retry</b> only idempotent requests; combine with exponential back-off and jitter. Do not retry 4xx. Each retry re-runs the downstream chain including your loading counters; keep <code>finalize</code> outside <code>retry</code> to count once.<br>
• <code>timeout</code> throws <code>TimeoutError</code> (not HttpErrorResponse) and cancels the request.<br>
• The loading counter must decrement in <code>finalize</code> else a cancelled request leaves the spinner on.<br>
• DI note: functional interceptors run in an injection context, so use <code>inject()</code> at the top of the function. Legacy class interceptors: <code>provideHttpClient(withInterceptorsFromDi())</code> and the <code>HTTP_INTERCEPTORS</code> multi token.`,
        `// HttpContext: per-request switch
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
this.http.post('/api/auth/login', body, { context: new HttpContext().set(SKIP_AUTH, true) });
// in interceptor: if (req.context.get(SKIP_AUTH)) return next(req);`),
    ],
    [
      ['What is an HTTP interceptor and why use it?', 'A function or class that handles every HttpClient request/response, used for auth headers, logging, error handling, loading indicators and URL/body transformation in one place.'],
      ['How do you write a functional interceptor?', 'Define an HttpInterceptorFn (req, next) => next(req.clone(...)), use inject() inside, and register with provideHttpClient(withInterceptors([fn])).'],
      ['Why clone the request?', 'HttpRequest objects are immutable; clone creates a modified copy with new headers, url or body.'],
      ['How do you implement a global loading indicator?', 'Count active requests in a signal service, increment in the interceptor, and decrement in finalize so success, error and cancellation are all covered.'],
      ['What does HttpErrorResponse status 0 mean?', 'The browser could not reach the server: network down, DNS failure or CORS blocked, no HTTP response was received.'],
      ['How should retries be done safely?', 'Only for idempotent requests and transient errors, with limited count and exponential back-off.'],
    ],
  ),

  topic(
    'ngs-m14-files-progress',
    L14_5,
    [
      blk(`<h3>Sending and receiving files</h3>
• <b>File uploads</b>: put the selected file into a <code>FormData</code> and POST it. The browser sets the multipart header itself. In Spring Boot this arrives as <code>MultipartFile</code>.<br>
• <b>File downloads</b>: request with <code>responseType: 'blob'</code> and create a temporary URL to trigger the browser download.<br>
• <b>Progress events</b>: with <code>reportProgress: true</code> and <code>observe: 'events'</code> you receive upload/download progress for a progress bar.`,
        `// upload (Angular)
onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const form = new FormData();
  form.append('file', file);                         // field name must match @RequestPart / @RequestParam("file")
  form.append('description', 'Profile photo');
  this.http.post<{ url: string }>('/api/files', form).subscribe(r => console.log(r.url));
}
// <input type="file" (change)="onFile($event)">

// Spring Boot
// @PostMapping(value = "/api/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
// FileInfo upload(@RequestParam("file") MultipartFile file, @RequestParam String description) { ... }`),
    ],
    [
      blk(`<h3>Download and progress</h3>`,
        `// download with blob
download(id: number, name: string) {
  this.http.get('/api/files/' + id, { responseType: 'blob' }).subscribe(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);                           // free memory
  });
}

// upload with progress
progress = signal(0);
upload(file: File) {
  const form = new FormData(); form.append('file', file);
  this.http.post('/api/files', form, { reportProgress: true, observe: 'events' }).subscribe(event => {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        this.progress.set(Math.round(100 * event.loaded / (event.total ?? event.loaded)));
        break;
      case HttpEventType.Response:
        console.log('done', event.body);
        break;
    }
  });
}`),
      blk(`<h3>Filename from the server</h3>
Use <code>observe: 'response'</code> to read <code>Content-Disposition</code> (Spring: <code>ResponseEntity</code> with <code>HttpHeaders.CONTENT_DISPOSITION</code>). For CORS you must expose it: <code>exposedHeaders("Content-Disposition")</code>.`),
    ],
    [
      blk(`<h3>Constraints and security</h3>
• Validate on the client (type, size) for UX but enforce on the server: <code>spring.servlet.multipart.max-file-size</code>, content-type sniffing, virus scan, random server-side file names, storage outside web root.<br>
• Large files: Blob in memory is limited; for very big downloads prefer a direct link with a short-lived signed URL, <code>window.open</code> or streaming (<code>StreamingResponseBody</code>) instead of loading into JS memory. For huge uploads consider chunked/resumable uploads.<br>
• <code>withFetch()</code> does not report upload progress (Fetch limitation); keep XHR-based HttpClient for upload progress.<br>
• Always revoke object URLs. Cancelling the observable cancels the transfer. Use <code>HttpEventType.DownloadProgress</code> with <code>responseType: 'blob'</code> for download bars (needs <code>Content-Length</code>).<br>
• Multiple files: <code>mergeMap(file =&gt; upload(file), 3)</code> to limit concurrency. Never set Content-Type yourself for FormData.<br>
• For authenticated downloads you cannot use a plain <code>&lt;a href&gt;</code> (no Authorization header): use HttpClient blob download, or a one-time token in the URL.`),
    ],
    [
      ['How do you upload a file from Angular to Spring Boot?', 'Build a FormData with the File under the field name expected by @RequestParam/@RequestPart (MultipartFile) and POST it; do not set Content-Type manually.'],
      ['How do you download a file?', 'GET with responseType blob, create an object URL, click a temporary anchor with the download attribute, then revoke the URL.'],
      ['How do you show upload progress?', 'Use reportProgress true and observe events, handle HttpEventType.UploadProgress (loaded/total) and HttpEventType.Response.'],
      ['Why might progress events not appear?', 'Using withFetch(), which lacks upload progress, or a server not sending Content-Length for downloads.'],
      ['Which checks belong on the server?', 'Size, type, content validation, safe file naming, storage location, authorisation, virus scanning.'],
    ],
  ),

  topic(
    'ngs-m14-data-patterns',
    L14_6,
    [
      blk(`<h3>Common API patterns</h3>
• <b>Pagination</b>: ask for one page at a time: <code>?page=0&amp;size=10</code>. Spring Data returns a <code>Page</code> JSON with <code>content</code>, <code>totalElements</code>.<br>
• <b>Sorting and filtering</b>: <code>?sort=name,asc&amp;status=ACTIVE</code>.<br>
• <b>Search with debounce</b>: wait until the user stops typing, then call the API.<br>
• <b>API cancellation</b>: abandon outdated requests. <b>Parallel API requests</b>: independent calls together. <b>Sequential API requests</b>: when one needs the result of another. <b>Caching API responses</b>: avoid asking again for unchanged data.`,
        `// Spring: GET /api/products?page=0&size=10&sort=price,desc&q=phone
// Angular
list(page: number, size: number, sort: string, q: string) {
  return this.http.get<Page<Product>>('/api/products', { params: { page, size, sort, q } });
}`),
    ],
    [
      blk(`<h3>Paged, sorted, filtered list with a single stream</h3>`,
        `export class ProductListComponent {
  private api = inject(ProductService);
  page = signal(0); size = signal(10); sort = signal('name,asc'); q = signal('');

  private query$ = toObservable(computed(() => ({ page: this.page(), size: this.size(), sort: this.sort(), q: this.q() })));
  data = toSignal(
    this.query$.pipe(
      debounceTime(300),                                                   // search with debounce
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap(p => this.api.list(p.page, p.size, p.sort, p.q).pipe(catchError(() => of(null)))),   // switchMap = cancellation
    ),
    { initialValue: null },
  );
  onSearch(text: string) { this.q.set(text); this.page.set(0); }          // reset to first page on a new search
}`),
      blk(`<h3>Parallel, sequential and cancellation</h3>`,
        `// parallel: all must succeed
forkJoin({ user: this.api.me(), roles: this.api.roles(), menu: this.api.menu() }).subscribe(({ user, roles, menu }) => { /* ... */ });

// sequential (dependent): second call needs first result
this.api.getOrder(id).pipe(
  switchMap(order => this.api.getCustomer(order.customerId).pipe(map(customer => ({ order, customer })))),
).subscribe(vm => console.log(vm));

// sequential (independent but ordered)
concat(this.api.step1(), this.api.step2(), this.api.step3()).subscribe();

// cancellation: leaving the page / new search aborts in-flight request
this.api.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();`,
        `// simple cache with shareReplay and manual refresh
private cache$?: Observable<Country[]>;
countries() {
  return (this.cache$ ??= this.http.get<Country[]>('/api/countries').pipe(shareReplay({ bufferSize: 1, refCount: false })));
}
invalidate() { this.cache$ = undefined; }`),
    ],
    [
      blk(`<h3>Design considerations</h3>
• Server-side paging, sorting and filtering for any data set that can grow: never load everything and filter in the browser. Spring Data's <code>Pageable</code> maps <code>page</code>, <code>size</code>, <code>sort</code> automatically. For large offsets or live data consider keyset (cursor) pagination.<br>
• Keep the query state (page, sort, filters) in <b>URL query params</b> so refresh, back button and sharing work: read from <code>ActivatedRoute</code>, write with <code>router.navigate([], { queryParams, queryParamsHandling: 'merge' })</code>.<br>
• <b>Race conditions</b>: without <code>switchMap</code> an older slow response can overwrite a newer one. <code>forkJoin</code> fails entirely if any call fails: catch per call. <code>forkJoin</code> on a never-completing stream never emits.<br>
• <b>Caching</b> options: <code>shareReplay</code> in a service, an interceptor-based cache keyed by URL with TTL (GET only), signals/stores holding loaded entities, HTTP cache headers (<code>ETag</code>, <code>Cache-Control</code>) honoured by the browser, and stale-while-revalidate (emit cache, then refresh). Invalidate after mutations.<br>
• Avoid duplicated parallel calls for the same resource (several components requesting simultaneously): share in-flight requests (<code>shareReplay</code>/Map of in-flight observables).<br>
• Dependent calls should be batched on the backend where possible (aggregation endpoint) to avoid waterfalls.`),
    ],
    [
      ['How do you implement search-as-you-type properly?', 'valueChanges (or signal via toObservable) with debounceTime, distinctUntilChanged and switchMap to the API, handling errors inside the inner observable.'],
      ['Why use server-side pagination?', 'To keep payloads and memory small and make large data sets usable; the client sends page, size, sort and filters, and Spring Data returns a Page.'],
      ['Parallel vs sequential requests: which operators?', 'Parallel: forkJoin (or combineLatest for live streams). Sequential/dependent: switchMap/concatMap; ordered independent: concat.'],
      ['How do you cancel an outdated request?', 'Unsubscribe; switchMap does it automatically when a new value arrives, and takeUntilDestroyed on destruction.'],
      ['How can you cache API responses in Angular?', 'shareReplay in a service, a TTL cache interceptor for GET requests, store entities in signals, and rely on HTTP cache headers; invalidate after writes.'],
    ],
  ),

  topic(
    'ngs-m14-env-cors-testing-spring',
    L14_7,
    [
      blk(`<h3>Environments, CORS and wiring to Spring Boot</h3>
• <b>Environment-specific API URLs</b>: development talks to <code>http://localhost:8080</code>, production to <code>https://api.example.com</code>. Keep the base URL in a config, never hard-coded in services.<br>
• <b>CORS</b> (Cross-Origin Resource Sharing): browsers block a page from calling another <b>origin</b> (scheme + host + port) unless the server allows it. Angular on <code>localhost:4200</code> calling Spring on <code>localhost:8080</code> is cross-origin. The server answers with <code>Access-Control-Allow-Origin</code>.<br>
• <b>Connecting Angular with Spring Boot</b>: Spring exposes <code>/api/**</code>; Angular calls it via a dev proxy or an allowed CORS origin.`,
        `// proxy.conf.json - dev-time proxy avoids CORS completely
{ "/api": { "target": "http://localhost:8080", "secure": false, "changeOrigin": true } }
// angular.json -> serve options: "proxyConfig": "proxy.conf.json"   ( or: ng serve --proxy-config proxy.conf.json )

// Angular code just uses relative URLs
this.http.get<Employee[]>('/api/employees');`),
    ],
    [
      blk(`<h3>Environment files and runtime config</h3>`,
        `// src/environments/environment.ts (dev) and environment.prod.ts (replaced at build via fileReplacements)
export const environment = { production: false, apiUrl: 'http://localhost:8080/api' };

// api-url token
export const API_URL = new InjectionToken<string>('API_URL', { providedIn: 'root', factory: () => environment.apiUrl });

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private api = inject(API_URL);
  list() { return this.http.get<Employee[]>(this.api + '/employees'); }
}
// ng generate environments   (creates the files in v15+; build uses --configuration production)`),
      blk(`<h3>Spring Boot side: CORS and a full vertical slice</h3>`,
        `// WebConfig.java - allow the Angular dev server
@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Override public void addCorsMappings(CorsRegistry r) {
    r.addMapping("/api/**")
     .allowedOrigins("http://localhost:4200")
     .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
     .allowedHeaders("*")
     .exposedHeaders("Location", "Content-Disposition")
     .allowCredentials(true);
  }
}
// With Spring Security also call http.cors(Customizer.withDefaults()) so preflight OPTIONS is permitted.

// EmployeeController.java
@RestController @RequestMapping("/api/employees") @RequiredArgsConstructor
public class EmployeeController {
  private final EmployeeService service;
  @GetMapping Page<EmployeeDto> list(Pageable p) { return service.list(p); }
  @PostMapping ResponseEntity<EmployeeDto> create(@Valid @RequestBody EmployeeDto dto) {
    EmployeeDto saved = service.create(dto);
    return ResponseEntity.created(URI.create("/api/employees/" + saved.id())).body(saved);
  }
}`),
    ],
    [
      blk(`<h3>API integration testing with HttpTestingController</h3>
Unit-test services without a server: provide <code>provideHttpClient()</code> and <code>provideHttpClientTesting()</code>, call the service, then use <code>HttpTestingController</code> to assert the request and flush a fake response.`,
        `describe('EmployeeService', () => {
  let service: EmployeeService; let ctrl: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(EmployeeService);
    ctrl = TestBed.inject(HttpTestingController);
  });
  afterEach(() => ctrl.verify());                           // no unexpected requests

  it('GETs employees', () => {
    service.list().subscribe(list => expect(list.length).toBe(1));
    const req = ctrl.expectOne('http://localhost:8080/api/employees');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Asha' }]);                   // fake response
  });

  it('handles 500', () => {
    service.list().subscribe({ error: e => expect(e.status).toBe(500) });
    ctrl.expectOne(r => r.url.endsWith('/employees')).flush('boom', { status: 500, statusText: 'Server Error' });
  });
});`),
      blk(`<h3>CORS and deployment notes</h3>
• <b>Preflight</b>: for non-simple requests (JSON content type, Authorization header, PUT/PATCH/DELETE) the browser first sends an <code>OPTIONS</code> request; the server must answer with allowed origin, methods and headers. Errors show as status 0 with a console CORS message: fix the server, not Angular.<br>
• <code>allowedOrigins("*")</code> cannot be combined with credentials. Never reflect arbitrary origins in production; list exact origins per environment.<br>
• <b>Best production setup</b>: serve Angular and the API under the same origin (reverse proxy such as Nginx routing <code>/</code> to static files and <code>/api</code> to Spring Boot) so no CORS is needed; or serve the built Angular files from Spring Boot static resources with a forward of unknown paths to <code>index.html</code>.<br>
• Runtime configuration (a <code>config.json</code> fetched at start with <code>provideAppInitializer</code>/<code>APP_INITIALIZER</code>) lets one build be deployed to many environments without rebuilding.<br>
• Test levels: service unit tests with HttpTestingController, component tests with stubbed services, and real end-to-end tests (Playwright/Cypress) against a Spring Boot test instance or MockServer/WireMock.`),
    ],
    [
      ['What is CORS and how is it solved?', 'A browser security rule blocking cross-origin calls unless the server sends Access-Control-Allow-* headers. Solve with server CORS configuration (Spring CorsRegistry / Security cors()), a dev proxy, or serving both under one origin via a reverse proxy.'],
      ['How do you manage different API URLs per environment?', 'environment files with fileReplacements, an InjectionToken for the base URL, or runtime config loaded at startup; never hard-code URLs.'],
      ['What is a preflight request?', 'An automatic OPTIONS request the browser sends before cross-origin requests that are not simple; the server must approve method, headers and origin.'],
      ['How do you test an HTTP service?', 'Use provideHttpClient plus provideHttpClientTesting, call the service, assert with HttpTestingController.expectOne, flush responses or errors, and verify() in afterEach.'],
      ['What does the dev proxy do?', 'ng serve forwards /api calls to the backend (target), so the browser sees the same origin and CORS is not needed in development.'],
      ['How do you wire Angular with Spring Boot end to end?', 'Define the REST controller and DTOs with validation, enable CORS or a proxy, mirror DTOs as TypeScript interfaces (or generate from OpenAPI), call through services with HttpClient and interceptors, handle errors uniformly and deploy behind one reverse proxy.'],
    ],
  ),
];

// ---------------------------------------------------------------- Module 15
const L15_1 = 'State fundamentals: local, shared, service, RxJS and Signals state';
const L15_2 = 'Immutable updates, normalization, derived, loading and error state';
const L15_3 = 'Authentication state, persisting state and browser storage';
const L15_4 = 'NgRx fundamentals: Store, actions, reducers, selectors';
const L15_5 = 'NgRx effects, entities, feature state and DevTools';
const L15_6 = 'NgRx Signal Store';
const L15_7 = 'State management testing and choosing an approach';

const m15: Topic[] = [
  ov(15, '<b>State</b> is the data your UI depends on. This module goes from simple component state to services, Signals and NgRx, and ends with a guide to choosing.', [
    ['State management fundamentals', 'What state is and why it needs structure', L15_1],
    ['Local component state', 'State owned by one component', L15_1],
    ['Shared application state', 'State used by many components', L15_1],
    ['Service-based state management', 'A root service owns the state', L15_1],
    ['RxJS-based state', 'BehaviorSubject store', L15_1],
    ['Signals-based state', 'Signal store in a service', L15_1],
    ['Immutable state updates', 'Replace, never mutate', L15_2],
    ['State normalization', 'Store entities by id, reference by id', L15_2],
    ['Derived state', 'Compute instead of store', L15_2],
    ['Loading and error states', 'Model idle, loading, success, error', L15_2],
    ['Authentication state', 'Current user, token, roles', L15_3],
    ['Persisting state', 'Keep state across reloads', L15_3],
    ['LocalStorage and SessionStorage', 'Browser key-value storage', L15_3],
    ['NgRx fundamentals', 'Redux-style unidirectional data flow', L15_4],
    ['NgRx Store', 'The single state container', L15_4],
    ['Actions', 'Events describing what happened', L15_4],
    ['Reducers', 'Pure functions computing the next state', L15_4],
    ['Selectors', 'Memoised state queries', L15_4],
    ['Effects', 'Side effects like HTTP outside reducers', L15_5],
    ['Entity management', 'EntityAdapter for collections', L15_5],
    ['Feature state', 'Per-feature slices registered lazily', L15_5],
    ['Store DevTools', 'Time-travel debugging', L15_5],
    ['NgRx Signal Store', 'signalStore with withState, withComputed, withMethods', L15_6],
    ['State management testing', 'Test reducers, selectors, effects, stores', L15_7],
    ['Choosing between services, Signals, and NgRx', 'Decision guide', L15_7],
  ]),

  topic(
    'ngs-m15-state-fundamentals',
    L15_1,
    [
      blk(`<h3>What is state?</h3>
• <b>State</b> is the data that decides what the screen shows: the logged-in user, items in the cart, whether a menu is open. <b>State management</b> is deciding where that data lives and how it changes.<br>
• <b>Local component state</b>: used by one component only (is the dropdown open?). Keep it in the component as a signal.<br>
• <b>Shared application state</b>: needed by several components (cart, user). Put it in a <b>service</b> that components inject (like a Spring singleton bean).<br>
• Rule: keep state as <b>local</b> as possible and share only what must be shared.`,
        `// local state
@Component({ selector: 'app-dropdown', template: '<button (click)="open.set(!open())">Menu</button> @if (open()) { <ul>...</ul> }' })
export class DropdownComponent { open = signal(false); }

// shared state: one service, many components
@Injectable({ providedIn: 'root' })
export class ThemeService { theme = signal<'light' | 'dark'>('light'); toggle() { this.theme.update(t => (t === 'light' ? 'dark' : 'light')); } }`),
    ],
    [
      blk(`<h3>Service-based state: two styles</h3>
<b>Service-based state management</b> = a root service that owns the state and exposes read-only access plus methods for changes.<br>
<b>RxJS-based state</b>: <code>BehaviorSubject</code> inside the service, exposed as an observable (classic, good with operators).<br>
<b>Signals-based state</b>: <code>signal</code> + <code>computed</code> (modern, simplest).`,
        `// RxJS-based store
@Injectable({ providedIn: 'root' })
export class CartRxStore {
  private items$ = new BehaviorSubject<CartItem[]>([]);
  readonly items = this.items$.asObservable();
  readonly total$ = this.items$.pipe(map(l => l.reduce((s, i) => s + i.price * i.qty, 0)));
  add(i: CartItem) { this.items$.next([...this.items$.value, i]); }     // immutable update
}`,
        `// Signals-based store (preferred for new code)
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly total = computed(() => this._items().reduce((s, i) => s + i.price * i.qty, 0));
  add(i: CartItem) { this._items.update(l => [...l, i]); }
  clear() { this._items.set([]); }
}
// component: store = inject(CartStore);  {{ store.total() }}`),
    ],
    [
      blk(`<h3>Design rules for service stores</h3>
• One store per domain/feature (cart, auth, products) rather than one giant service; stores can depend on each other through <code>inject()</code> but avoid cycles.<br>
• Expose state read-only; mutate only through named methods ("actions"). That gives you a single place to log, validate or persist changes, similar to Redux without the ceremony.<br>
• Choose scope deliberately: <code>providedIn: 'root'</code> lives for the whole app; <code>providers</code> on a route or component gives a store whose lifetime matches that feature, and a fresh instance per visit.<br>
• Do not use services as a communication bus for everything: server data belongs in a cache layer (see Module 14), UI-only state belongs in components.<br>
• Server state vs client state: data fetched from the API (a cache that can go stale) behaves differently from client state (selected tab). Keep them distinct, using resource/query-style tools for server data.<br>
• RxJS stores shine for event-heavy logic (debounce, retry, websockets); signal stores shine for synchronous UI state. You can combine: <code>toSignal(store.items$)</code>.<br>
• Java parallel: a root service is a singleton bean; a route-level provider is like a prototype/request-scoped bean.`),
    ],
    [
      ['What is local vs shared state and where should each live?', 'Local state belongs to one component (signal field). Shared state is needed by multiple components and belongs in an injectable service (or store) scoped appropriately.'],
      ['How do you implement a simple store with Signals?', 'A service with a private writable signal, a readonly exposure via asReadonly, computed selectors and methods that update immutably.'],
      ['BehaviorSubject store vs signal store?', 'BehaviorSubject integrates with RxJS operators and async flows; signals are simpler for synchronous UI state and read without subscription. Both can be combined via interop.'],
      ['Why expose state read-only?', 'So only the store can change state, which keeps updates traceable and prevents accidental mutation from components.'],
      ['What is the difference between server state and client state?', 'Server state is remote data that is cached and may become stale; client state exists only in the UI (filters, open panels). They need different tools and lifecycles.'],
    ],
  ),

  topic(
    'ngs-m15-state-patterns',
    L15_2,
    [
      blk(`<h3>Four habits of clean state</h3>
• <b>Immutable state updates</b>: never change an object in place; create a new one. Change detection and signals notice new references only.<br>
• <b>Derived state</b>: do not store what can be calculated (the total of a cart); compute it.<br>
• <b>State normalization</b>: store each item once, by id, and refer to it by id. Like a database: a foreign key instead of copying the whole row.<br>
• <b>Loading and error states</b>: every remote request has phases: idle, loading, success, error. Model them explicitly so the UI can show spinners and messages.`,
        `// immutable updates
list.update(l => [...l, item]);                              // add
list.update(l => l.filter(x => x.id !== id));                // remove
list.update(l => l.map(x => (x.id === id ? { ...x, done: true } : x)));   // change one
user.update(u => ({ ...u, address: { ...u.address, city: 'Pune' } }));    // nested

// MUTATION (wrong): list().push(item);   user().name = 'x';`),
    ],
    [
      blk(`<h3>Normalized state and loading status</h3>`,
        `// not normalized: duplicates author inside each post
posts = [{ id: 1, title: 'A', author: { id: 7, name: 'Asha' } }, { id: 2, title: 'B', author: { id: 7, name: 'Asha' } }];

// normalized: lookups by id
interface BlogState {
  posts: Record<number, { id: number; title: string; authorId: number }>;
  authors: Record<number, { id: number; name: string }>;
  postIds: number[];                                       // ordering
}
const postsWithAuthor = computed(() => this.state().postIds.map(id => {
  const p = this.state().posts[id];
  return { ...p, author: this.state().authors[p.authorId] };   // derived, joined on read
}));`,
        `// loading and error state as a discriminated union (impossible states are impossible)
type Async<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private http = inject(HttpClient);
  readonly state = signal<Async<Product[]>>({ status: 'idle' });

  load() {
    this.state.set({ status: 'loading' });
    this.http.get<Product[]>('/api/products').subscribe({
      next: data => this.state.set({ status: 'success', data }),
      error: e => this.state.set({ status: 'error', message: e.message }),
    });
  }
}
// template: @switch (store.state().status) { @case ('loading') { <app-spinner/> } @case ('error') { <p>Failed</p> } @case ('success') { ... } }`),
    ],
    [
      blk(`<h3>Why and when</h3>
• Immutability enables cheap change detection (reference comparison), OnPush, memoised selectors, undo/redo and time travel. For deep trees consider helper libraries (<code>immer</code>, or <code>structuredClone</code> for copies), or NgRx Signal Store's <code>patchState</code> with partial updates. Large arrays copied on every keystroke can be costly: batch updates.<br>
• Normalize when entities are shared by many views or updated often (chat messages, users, products referenced from orders). Keep nested only when data is read-only and exclusive to one view. NgRx <code>EntityAdapter</code> normalizes for you (<code>ids</code> + <code>entities</code>).<br>
• Derived state should be computed in selectors (<code>computed</code>/<code>createSelector</code>) so it is memoised and always consistent. Avoid redundant booleans (<code>isLoading</code>, <code>isError</code>, <code>hasData</code> that can contradict); one status union prevents contradictions.<br>
• Keep stale data visible during reloads (status "reloading") and show errors without throwing away previous data; separate per-request status for lists vs details to avoid global spinners masking everything.<br>
• Optimistic updates: change state first, send the request, roll back on error; for correctness keep a copy of the previous state.`),
    ],
    [
      ['Why must state updates be immutable?', 'Angular, signals and selectors detect changes through reference comparison; mutation leaves the reference unchanged so nothing updates, and it breaks OnPush, memoisation and debugging.'],
      ['What is state normalization?', 'Storing entities once in a lookup by id and referencing them by id elsewhere, avoiding duplication and inconsistent updates.'],
      ['How do you model loading and error state?', 'With an explicit status (idle, loading, success, error) preferably as a discriminated union, so contradictory combinations are impossible.'],
      ['What is derived state and why not store it?', 'A value computable from other state (totals, filtered lists). Storing it risks inconsistency; compute with computed or selectors.'],
      ['What is an optimistic update?', 'Applying the change in the UI immediately and reverting if the server request fails.'],
    ],
  ),

  topic(
    'ngs-m15-auth-persistence',
    L15_3,
    [
      blk(`<h3>Authentication state and saving state</h3>
• <b>Authentication state</b> = who is logged in: the user, their roles and the token. It is a classic shared state: put it in one <code>AuthStore</code> that guards, interceptors and menus use.<br>
• <b>Persisting state</b> means keeping it after a refresh by saving to the browser: <b>LocalStorage</b> (stays until cleared, shared across tabs) or <b>SessionStorage</b> (until the tab closes).<br>
• Both store strings only: use <code>JSON.stringify</code> / <code>JSON.parse</code>.`,
        `localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme');           // 'dark' or null
sessionStorage.setItem('draft', JSON.stringify({ title: 'Hello' }));
const draft = JSON.parse(sessionStorage.getItem('draft') ?? 'null');
localStorage.removeItem('theme');`),
    ],
    [
      blk(`<h3>An auth store with persistence</h3>`,
        `@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _user = signal<User | null>(this.restore());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly roles = computed(() => this._user()?.roles ?? []);
  readonly isAdmin = computed(() => this.roles().includes('ADMIN'));

  constructor() {
    effect(() => {                                              // persist on change
      const u = this._user();
      u ? localStorage.setItem('user', JSON.stringify(u)) : localStorage.removeItem('user');
    });
  }
  login(creds: Credentials) {
    return inject(HttpClient).post<{ user: User }>('/api/auth/login', creds).pipe(tap(r => this._user.set(r.user)));
  }
  logout() { this._user.set(null); }
  private restore(): User | null {
    try { return JSON.parse(localStorage.getItem('user') ?? 'null'); } catch { return null; }   // corrupted data must not crash the app
  }
}`),
      blk(`<h3>A safe storage helper</h3>`,
        `export function persistedSignal<T>(key: string, initial: T, storage: Storage = localStorage) {
  let start = initial;
  try { const raw = storage.getItem(key); if (raw !== null) start = JSON.parse(raw) as T; } catch { /* ignore */ }
  const s = signal<T>(start);
  effect(() => { try { storage.setItem(key, JSON.stringify(s())); } catch { /* quota or private mode */ } });
  return s;       // call inside an injection context
}
// usage: filters = persistedSignal('product-filters', { category: 'all' }, sessionStorage);`),
    ],
    [
      blk(`<h3>Security and limits of browser storage</h3>
• <b>Never store secrets</b> (passwords, long-lived tokens) in LocalStorage/SessionStorage: any XSS can read it. Prefer <b>HttpOnly, Secure, SameSite cookies</b> set by Spring Security for session or refresh tokens, and keep the access token in memory (a signal) with silent refresh. If you must store a token, keep it short-lived.<br>
• Storage is synchronous, limited (about 5 MB), same-origin, per-browser, can be disabled or throw (private mode, quota). Always wrap in try/catch and tolerate missing or corrupted data. Version stored shapes (<code>{ v: 2, data }</code>) so releases can migrate old data.<br>
• Cross-tab sync: listen to the <code>storage</code> event (fires in other tabs) to update the state on logout in another tab.<br>
• SSR: <code>localStorage</code> does not exist on the server; guard with <code>isPlatformBrowser</code> or wrap behind an injection token (<code>STORAGE</code>) with a no-op server implementation, which also helps testing.<br>
• Persist only what is worth persisting (preferences, drafts, filters), not server data that can be refetched. For larger data use IndexedDB.<br>
• Remember: client-side auth state is for display. The server validates every request. Guards and interceptors read this state (Module 16 covers the full security model).`,
        `// storage injection token (SSR and test friendly)
export const APP_STORAGE = new InjectionToken<Storage>('APP_STORAGE', {
  providedIn: 'root',
  factory: () => (isPlatformBrowser(inject(PLATFORM_ID)) ? localStorage : ({ getItem: () => null, setItem: () => {}, removeItem: () => {} } as unknown as Storage)),
});

// cross-tab logout
fromEvent<StorageEvent>(window, 'storage').pipe(filter(e => e.key === 'user' && e.newValue === null), takeUntilDestroyed())
  .subscribe(() => this.logout());`),
    ],
    [
      ['LocalStorage vs SessionStorage?', 'LocalStorage persists until cleared and is shared across tabs of the same origin; SessionStorage lasts for one tab session. Both store strings and are synchronous.'],
      ['Where should the authentication state live?', 'In a dedicated auth store/service (signals) exposing user, roles and isLoggedIn, consumed by guards, interceptors and templates.'],
      ['Is LocalStorage a safe place for tokens?', 'Not for sensitive long-lived tokens, because XSS can read it. Prefer HttpOnly secure cookies or in-memory short-lived access tokens.'],
      ['How do you persist state safely?', 'Serialise to JSON in try/catch, version the shape, persist only needed parts, and abstract storage behind a token for SSR and tests.'],
      ['How can you sync logout across browser tabs?', 'Listen to the window storage event and clear the in-memory state when the key is removed.'],
    ],
  ),

  topic(
    'ngs-m15-ngrx-core',
    L15_4,
    [
      blk(`<h3>NgRx fundamentals</h3>
• <b>NgRx</b> is Angular's implementation of the Redux pattern: one predictable, central <b>Store</b> and a strict one-way loop. Think of a bank: you do not edit the ledger yourself; you fill a slip (<b>action</b>), the clerk (<b>reducer</b>) updates the ledger by fixed rules, and you read balances through statements (<b>selectors</b>).<br>
• The loop: component dispatches an <b>Action</b> to the <b>Store</b>; a <b>Reducer</b> (pure function) returns the next state; <b>Selectors</b> read slices; components re-render. <b>Effects</b> handle side effects such as HTTP.<br>
• Install: <code>ng add @ngrx/store</code> (plus <code>@ngrx/effects</code>, <code>@ngrx/entity</code>, <code>@ngrx/store-devtools</code>).`,
        `// counter.actions.ts
export const increment = createAction('[Counter] Increment');
export const add = createAction('[Counter] Add', props<{ amount: number }>());

// counter.reducer.ts
export const counterReducer = createReducer(
  0,                                                   // initial state
  on(increment, state => state + 1),
  on(add, (state, { amount }) => state + amount),
);

// app.config.ts
provideStore({ counter: counterReducer });

// component
store = inject(Store);
count = this.store.selectSignal(state => state.counter);   // signal from the store
inc() { this.store.dispatch(increment()); }`),
    ],
    [
      blk(`<h3>Actions, reducers, selectors for a feature</h3>
• <b>Actions</b> describe events, named "[Source] Event", with a typed payload (<code>createActionGroup</code> reduces boilerplate).<br>
• <b>Reducers</b> are pure: no HTTP, no randomness, no mutation; same input, same output.<br>
• <b>Selectors</b> (<code>createFeatureSelector</code>, <code>createSelector</code>) are memoised functions that read and derive state.`,
        `// products.actions.ts
export const ProductsActions = createActionGroup({
  source: 'Products',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ products: Product[] }>(),
    'Load Failure': props<{ error: string }>(),
    'Select': props<{ id: number }>(),
  },
});

// products.reducer.ts
export interface ProductsState { products: Product[]; selectedId: number | null; loading: boolean; error: string | null; }
const initial: ProductsState = { products: [], selectedId: null, loading: false, error: null };

export const productsFeature = createFeature({
  name: 'products',
  reducer: createReducer(
    initial,
    on(ProductsActions.load, s => ({ ...s, loading: true, error: null })),
    on(ProductsActions.loadSuccess, (s, { products }) => ({ ...s, products, loading: false })),
    on(ProductsActions.loadFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(ProductsActions.select, (s, { id }) => ({ ...s, selectedId: id })),
  ),
  extraSelectors: ({ selectProducts, selectSelectedId }) => ({
    selectSelected: createSelector(selectProducts, selectSelectedId, (list, id) => list.find(p => p.id === id) ?? null),
  }),
});
// createFeature auto-creates selectProducts, selectLoading, selectError, selectProductsState ...`),
    ],
    [
      blk(`<h3>Principles and details</h3>
• <b>Store</b> is an Observable of state plus <code>dispatch</code>. Use <code>store.select(selector)</code> (Observable) or <code>store.selectSignal(selector)</code> (Signal, v16+). Prefer signals in components.<br>
• Reducers must be <b>pure and fast</b>. Runtime checks (<code>strictStateImmutability</code>, <code>strictActionImmutability</code>, serializability) are on in development and freeze state to catch mutation. Keep state serializable: no class instances, Dates (use ISO strings), Maps/Sets or functions.<br>
• <b>Selectors</b> memoise by input reference: composing small selectors gives precise recomputation. A selector that returns a new object/array each time defeats memoisation downstream. Use <code>projector</code> to unit test selectors without a store.<br>
• Actions are the audit log: model <b>events</b> ("Order Placed"), not setters ("Set Order Flag"); good action names describe what happened, not what to do. Avoid reusing one action for many sources.<br>
• NgRx adds files and indirection. It pays off with big teams, complex cross-feature workflows, strict traceability or undo/redo; not for a to-do app. Compare with a signal service in the last lesson.<br>
• Version: standalone APIs (<code>provideStore</code>, <code>provideState</code>, <code>provideEffects</code>) from NgRx 15+; <code>createFeature</code> v12+; class-based <code>StoreModule</code> is legacy; <code>on</code>-based reducers since v8.`),
    ],
    [
      ['Explain the NgRx data flow.', 'Components dispatch actions; reducers (pure functions) compute the new immutable state in the Store; selectors expose slices to components; effects handle async side effects and dispatch further actions.'],
      ['Why must reducers be pure?', 'So state transitions are predictable, testable and replayable (time travel, DevTools); side effects belong in effects.'],
      ['What are selectors and why memoised?', 'Functions to read and derive state; memoisation recomputes only when input slices change, saving work and avoiding extra renders.'],
      ['What are the three ways to read state in a component?', 'store.select (Observable with async pipe), store.selectSignal (Signal), or subscribe manually (discouraged).'],
      ['How should actions be named and designed?', 'As events that happened with a [Source] prefix, such as [Products Page] Load, describing the origin and intent rather than generic setters.'],
    ],
  ),

  topic(
    'ngs-m15-ngrx-effects-entity',
    L15_5,
    [
      blk(`<h3>Effects: where side effects live</h3>
• <b>Effects</b> listen to the stream of actions, perform side effects (HTTP calls, navigation, storage) and dispatch new actions with the result. They keep reducers pure and components thin.<br>
• <b>Feature state</b>: state split per feature, registered with <code>provideState</code> on a lazy route, so the code and its slice load together.<br>
• <b>Entity management</b>: <code>@ngrx/entity</code> manages collections as normalised <code>ids</code> + <code>entities</code> with ready-made add/update/remove methods.<br>
• <b>Store DevTools</b>: a browser extension view of every action and state, with time-travel.`,
        `// products.effects.ts (functional effect, NgRx 15+)
export const loadProducts = createEffect(
  (actions$ = inject(Actions), api = inject(ProductApi)) =>
    actions$.pipe(
      ofType(ProductsActions.load),
      switchMap(() => api.list().pipe(
        map(products => ProductsActions.loadSuccess({ products })),
        catchError(err => of(ProductsActions.loadFailure({ error: err.message }))),     // keep the effect alive
      )),
    ),
  { functional: true },
);

// products.routes.ts - feature state + effects registered lazily
export const PRODUCT_ROUTES: Routes = [{
  path: '', component: ProductsPageComponent,
  providers: [provideState(productsFeature), provideEffects({ loadProducts })],
}];`),
    ],
    [
      blk(`<h3>Entity adapter</h3>`,
        `// products.entity.ts
export interface ProductsState extends EntityState<Product> { selectedId: number | null; loading: boolean; }
export const adapter = createEntityAdapter<Product>({ selectId: p => p.id, sortComparer: (a, b) => a.name.localeCompare(b.name) });
const initial: ProductsState = adapter.getInitialState({ selectedId: null, loading: false });

export const productsReducer = createReducer(
  initial,
  on(ProductsActions.loadSuccess, (s, { products }) => adapter.setAll(products, { ...s, loading: false })),
  on(ProductsActions.added, (s, { product }) => adapter.addOne(product, s)),
  on(ProductsActions.updated, (s, { id, changes }) => adapter.updateOne({ id, changes }, s)),
  on(ProductsActions.removed, (s, { id }) => adapter.removeOne(id, s)),
);
export const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors();`),
      blk(`<h3>Dispatching and reading in a component; DevTools setup</h3>`,
        `// app.config.ts
provideStore(), provideEffects(), provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode(), connectInZone: true })

// component
export class ProductsPageComponent {
  private store = inject(Store);
  products = this.store.selectSignal(productsFeature.selectProducts);
  loading = this.store.selectSignal(productsFeature.selectLoading);
  ngOnInit() { this.store.dispatch(ProductsActions.load()); }
}`),
    ],
    [
      blk(`<h3>Effects in depth</h3>
• Choose the flattening operator deliberately: <code>switchMap</code> (latest wins, loads), <code>concatMap</code> (ordered writes), <code>mergeMap</code> (parallel independent), <code>exhaustMap</code> (ignore duplicates, login). Put <code>catchError</code> <b>inside</b> the inner pipe, or the effect dies after the first error (NgRx resubscribes effects up to 10 times by default but do not rely on it).<br>
• Non-dispatching effects (navigation, logging): <code>{ dispatch: false }</code>. Effects can read state with <code>concatLatestFrom</code> (or <code>withLatestFrom(store.select(...))</code>) to avoid races.<br>
• Avoid the "effect chain" anti-pattern where effect A triggers action that triggers effect B for a simple sequence; and avoid effects that only map one action to another (do it in the reducer or selector).<br>
• <b>Entity</b>: use <code>selectId</code> for custom keys and <code>sortComparer</code> only when needed (sorting cost). Selectors from <code>getSelectors()</code> are memoised; combine with feature selectors.<br>
• <b>Feature state</b>: register with <code>provideState</code> at route level so a lazy chunk brings its reducer; avoid cross-feature direct state access, expose public selectors/facades. The state key must be unique.<br>
• <b>DevTools</b>: use <code>maxAge</code> to bound memory, <code>logOnly</code> in production, sanitize large or sensitive actions/state (<code>actionSanitizer</code>, <code>stateSanitizer</code>), never expose tokens. Features: time travel, action replay, state diff, import/export.<br>
• Facade pattern: wrap Store access in a feature service/facade so components do not know about NgRx; eases migration to Signal Store or services.`),
    ],
    [
      ['What are effects used for?', 'Handling side effects outside reducers: HTTP calls, navigation, storage, analytics. They react to actions and dispatch result actions.'],
      ['Why put catchError inside switchMap in effects?', 'So an error in one request does not complete the outer actions stream and kill the effect.'],
      ['What does EntityAdapter provide?', 'A normalised ids/entities state and ready-made reducer helpers (addOne, setAll, updateOne, removeOne) and memoised selectors (selectAll, selectEntities).'],
      ['What is feature state?', 'A slice of the store owned by one feature, registered with provideState (often on a lazy route) so its reducer and effects load with the feature.'],
      ['What do Store DevTools offer?', 'Inspection of dispatched actions and state diffs, time travel, replay and import/export of sessions; configure sanitizers and logOnly for production.'],
    ],
  ),

  topic(
    'ngs-m15-signal-store',
    L15_6,
    [
      blk(`<h3>NgRx Signal Store: the light version</h3>
• <b>NgRx Signal Store</b> (<code>@ngrx/signals</code>) is a signal-based store with far less boilerplate than the classic Store: define state, computed values and methods in one place.<br>
• Building blocks: <code>signalStore()</code>, <code>withState()</code>, <code>withComputed()</code>, <code>withMethods()</code>, <code>patchState()</code>, <code>withHooks()</code>.<br>
• Think of it as a well-structured service with a standard shape, so every team writes stores the same way.`,
        `// todos.store.ts
export const TodosStore = signalStore(
  { providedIn: 'root' },
  withState({ todos: [] as Todo[], filter: 'all' as 'all' | 'done' }),
  withComputed(({ todos, filter }) => ({
    visible: computed(() => (filter() === 'done' ? todos().filter(t => t.done) : todos())),
    remaining: computed(() => todos().filter(t => !t.done).length),
  })),
  withMethods(store => ({
    add(title: string) { patchState(store, s => ({ todos: [...s.todos, { id: Date.now(), title, done: false }] })); },
    toggle(id: number) { patchState(store, s => ({ todos: s.todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)) })); },
    setFilter(filter: 'all' | 'done') { patchState(store, { filter }); },
  })),
);

// component
store = inject(TodosStore);
// {{ store.remaining() }}  @for (t of store.visible(); track t.id) { ... }  (click)="store.toggle(t.id)"`),
    ],
    [
      blk(`<h3>Async methods, entities and hooks</h3>
• <code>rxMethod</code> (from <code>@ngrx/signals/rxjs-interop</code>) turns an RxJS pipeline into a method that accepts a value, signal or observable: ideal for loading with switchMap.<br>
• <code>withEntities()</code> from <code>@ngrx/signals/entities</code> provides normalised collections. <code>withHooks({ onInit, onDestroy })</code> runs setup and cleanup.<br>
• Add status with a custom feature (<code>signalStoreFeature</code>) to reuse loading/error handling across stores.`,
        `export const ProductsStore = signalStore(
  withState({ loading: false, error: null as string | null }),
  withEntities<Product>(),
  withMethods((store, api = inject(ProductApi)) => ({
    load: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() => api.list().pipe(
        tapResponse({
          next: products => patchState(store, setAllEntities(products), { loading: false }),
          error: (e: Error) => patchState(store, { loading: false, error: e.message }),
        }),
      )),
    )),
    remove(id: number) { patchState(store, removeEntity(id)); },
  })),
  withHooks({ onInit: store => store.load() }),           // load when the store is created
);

// scoped to a route/component instead of root:
// @Component({ providers: [ProductsStore] })`),
    ],
    [
      blk(`<h3>Design and caveats</h3>
• State is exposed as deep-readonly signals; updates go through <code>patchState</code> only (state itself is not writable from outside), keeping encapsulation. State must be a plain object; each top-level property becomes a signal (nested objects can be deep signals).<br>
• Scope: <code>providedIn: 'root'</code> for global, or provide on component/route for per-feature lifecycle (a fresh instance per visit, destroyed with it, with <code>withHooks</code> cleanup).<br>
• Compared with classic NgRx: no actions/reducers/effects, no DevTools by default (community <code>withDevtools</code> feature exists: <code>@angular-architects/ngrx-toolkit</code>), less ceremony, less audit trail. Great default for feature-level state; classic Store for app-wide event-sourced logic.<br>
• Extend with <code>signalStoreFeature</code> (reusable slices: loading status, pagination, undo-redo), <code>withProps</code> (v19+) for injected dependencies and observables, and <code>withLinkedState</code> (v20) for linkedSignal-based state; check your <code>@ngrx/signals</code> version because the API grew quickly (v17 introduced it, stable from v18/19).<br>
• Use <code>getState(store)</code> for snapshots and <code>watchState</code> to observe changes; keep derived data in <code>withComputed</code>. Do not put non-serialisable things in state if you plan to persist or debug it.<br>
• NgRx Signal Store pairs naturally with Angular signals and zoneless apps; keep HTTP inside <code>rxMethod</code> with <code>switchMap</code> or <code>exhaustMap</code> chosen deliberately.`),
    ],
    [
      ['What is the NgRx Signal Store?', 'A lightweight signal-based store from @ngrx/signals defined with signalStore, withState, withComputed and withMethods, updated through patchState, without actions and reducers.'],
      ['How do you do async loading in a Signal Store?', 'With rxMethod and an RxJS pipeline (tap, switchMap, tapResponse) that patches loading, data and error state.'],
      ['Signal Store vs classic NgRx Store?', 'Signal Store is simpler, local or feature-scoped, with direct method calls; classic Store enforces actions/reducers/effects for global, auditable, DevTools-friendly flows at the cost of boilerplate.'],
      ['How do you reuse logic across Signal Stores?', 'Create custom features with signalStoreFeature (for example withLoadingStatus) and compose them.'],
      ['Can a Signal Store be scoped to a component?', 'Yes, omit providedIn root and add it to the providers of a component or route, so each instance gets its own store which is destroyed with it.'],
    ],
  ),

  topic(
    'ngs-m15-testing-choosing',
    L15_7,
    [
      blk(`<h3>Choosing a state approach</h3>
<table ${TABLE}><thead><tr><th>Situation</th><th>Use</th></tr></thead><tbody>
<tr><td>UI state of one component</td><td>Local signal</td></tr>
<tr><td>Shared by a few components, simple</td><td>Signal service store</td></tr>
<tr><td>Stream-heavy (websocket, polling, debounce)</td><td>RxJS service (BehaviorSubject) with toSignal</td></tr>
<tr><td>Feature with loading, entities, many methods</td><td>NgRx Signal Store</td></tr>
<tr><td>Large app, many teams, cross-feature workflows, audit, time travel</td><td>NgRx Store + Effects + Entity</td></tr>
<tr><td>Server data fetch and cache</td><td>resource/httpResource or a data-fetching layer with caching</td></tr></tbody></table>
Start simple (signals in services) and escalate only when a real problem appears.`),
    ],
    [
      blk(`<h3>State management testing</h3>
• <b>Signal service store</b>: instantiate via TestBed, call methods, assert signals (synchronous).<br>
• <b>NgRx reducer</b>: pure function: call with state and action, compare result. <b>Selector</b>: call <code>.projector</code> or with a mock state. <b>Effect</b>: provide actions as a stream (<code>provideMockActions</code>) and mock the API, assert emitted actions. <b>Component with Store</b>: <code>provideMockStore({ initialState, selectors })</code> and spy on <code>dispatch</code>. <b>Signal Store</b>: <code>TestBed.inject(Store)</code>, call methods, read signals; mock the injected API.`,
        `// reducer test
it('sets loading on load', () => {
  const state = productsFeature.reducer(undefined, ProductsActions.load());
  expect(state.loading).toBeTrue();
});

// selector test
it('selects expensive products', () => {
  expect(selectExpensive.projector([{ id: 1, price: 5 }, { id: 2, price: 500 }], 100)).toEqual([{ id: 2, price: 500 }]);
});

// effect test
it('dispatches loadSuccess', done => {
  TestBed.configureTestingModule({ providers: [provideMockActions(() => of(ProductsActions.load())), { provide: ProductApi, useValue: { list: () => of([p1]) } }] });
  TestBed.runInInjectionContext(() => loadProducts()).subscribe(a => { expect(a).toEqual(ProductsActions.loadSuccess({ products: [p1] })); done(); });
});

// component with a mock store
TestBed.configureTestingModule({ providers: [provideMockStore({ initialState: { products: { products: [p1], loading: false } } })] });
const store = TestBed.inject(MockStore); spyOn(store, 'dispatch');`,
        `// signal service store test
it('computes total', () => {
  const store = TestBed.inject(CartStore);
  store.add({ id: 1, price: 10, qty: 2 });
  expect(store.total()).toBe(20);
});`),
    ],
    [
      blk(`<h3>Decision factors and migration</h3>
• Evaluate: team size and experience, need for traceability/undo/time travel, number of cross-feature interactions, amount of async orchestration, testing culture, bundle size, and onboarding cost. NgRx brings strong conventions (valuable across large teams) and cost (boilerplate, learning).<br>
• Hide implementation behind <b>facades</b> or store services so components depend on an interface (signals, methods), enabling later swaps (service to Signal Store to classic NgRx).<br>
• Avoid anti-patterns: global store for everything (form input state, hover flags), duplicated server data in many places, state in the URL ignored (filters, paging belong in route/query params), subscriptions in components that copy store data into fields.<br>
• Server state libraries: Angular <code>resource</code>/<code>httpResource</code> and community TanStack Query for Angular provide caching, refetching and invalidation which stores do poorly by hand.<br>
• Testing strategy: unit-test pure logic (reducers, selectors, computed), integration-test effects and stores with fake APIs, and a few end-to-end tests for critical flows. Test behaviours (state after actions), not implementation details.<br>
• Java mapping: signal service ~ singleton Spring bean with state; NgRx ~ event sourcing / CQRS with an event log; Signal Store ~ a typed state holder with command methods.`),
    ],
    [
      ['How do you choose between services, Signals and NgRx?', 'Start with local signals, then signal services for shared state, Signal Store for richer feature state, and classic NgRx when you need strict conventions, auditability, DevTools and large-scale team coordination.'],
      ['How do you test a reducer and a selector?', 'Reducers are pure: call with state and action and assert the result. Selectors: test projector functions or run against a mock state.'],
      ['How do you test an NgRx effect?', 'Provide a mock actions stream (provideMockActions), mock the injected API, run the effect in an injection context and assert emitted actions.'],
      ['What is a facade in this context?', 'A service wrapping store access so components use simple signals and methods without knowing whether NgRx, Signal Store or plain services are underneath.'],
      ['Name state management anti-patterns.', 'Putting everything in a global store, duplicating server data, mutating state, storing derived values, copying store data into component fields via subscribe, and ignoring URL state.'],
    ],
  ),
];

export const angularSyllabus2: SubTopic[] = [
  { id: 'ngs-mod-9', name: 'Module 9 · Component Lifecycle', topics: m9 },
  { id: 'ngs-mod-10', name: 'Module 10 · Angular Routing', topics: m10 },
  { id: 'ngs-mod-11', name: 'Module 11 · Angular Forms', topics: m11 },
  { id: 'ngs-mod-12', name: 'Module 12 · RxJS', topics: m12 },
  { id: 'ngs-mod-13', name: 'Module 13 · Angular Signals', topics: m13 },
  { id: 'ngs-mod-14', name: 'Module 14 · HTTP Client and REST API Integration', topics: m14 },
  { id: 'ngs-mod-15', name: 'Module 15 · State Management', topics: m15 },
];
