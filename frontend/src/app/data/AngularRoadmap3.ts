// Angular roadmap, part 3: sections 10-13 (advanced Angular, state management, security and performance, testing and deployment).
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';
import { angularExamples } from './RoadmapExamples2';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const ng = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('ng', n, title, priority, topics);

const angularRoadmap3Base: SubTopic[] = [
  ng(10, 'Advanced Angular', 'Essential', [
    topic(
      'ng-standalone-signals',
      'Standalone Components and Signals: signal, computed, effect',
      [
        blk(`<h3>Standalone components</h3>
• A <b>standalone component</b> (<code>standalone: true</code>, the default since v19) declares its own template dependencies in <code>imports</code> and needs no <code>NgModule</code>. The app starts with <code>bootstrapApplication(AppComponent, appConfig)</code>.<br>
• Benefits: less boilerplate, clearer dependencies, easier lazy loading (<code>loadComponent</code>), better tree-shaking. Directives and pipes are standalone too.<br>
• Migrate old modules with <code>ng generate @angular/core:standalone</code>.`,
          `import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CourseCardComponent } from './course-card.component';
import { HighlightDirective } from '../shared/highlight.directive';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CurrencyPipe, DatePipe, CourseCardComponent, HighlightDirective],   // everything the template uses
  template: '<app-course-card title="Angular" /> <a routerLink="/about">About</a> {{ today | date }}',
})
export class HomeComponent { today = new Date(); }

// main.ts
bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient(), provideAnimationsAsync()],
});`,
        ),
      ],
      [
        blk(`<h3>Signals: fine-grained reactive state</h3>
• A <b>signal</b> is a wrapper around a value that notifies consumers when it changes. Create with <code>signal(initial)</code>, <b>read by calling it</b> (<code>count()</code>), change with <code>set(v)</code> or <code>update(fn)</code>. Always replace objects/arrays immutably.<br>
• <code>computed(() =&gt; ...)</code> derives a <b>read-only, lazily evaluated, memoised</b> signal: it recomputes only when a signal it read changes. Dependencies are tracked automatically.<br>
• Signals make Angular know exactly <b>which views</b> depend on which state, enabling precise updates and zoneless change detection.`,
          `import { signal, computed } from '@angular/core';

export class CartComponent {
  items = signal<{ name: string; price: number; qty: number }[]>([]);
  couponPercent = signal(0);

  count = computed(() => this.items().reduce((n, i) => n + i.qty, 0));
  subtotal = computed(() => this.items().reduce((s, i) => s + i.price * i.qty, 0));
  total = computed(() => Math.round(this.subtotal() * (1 - this.couponPercent() / 100)));

  add(name: string, price: number) {
    this.items.update(list => {
      const found = list.find(i => i.name === name);
      return found ? list.map(i => i === found ? { ...i, qty: i.qty + 1 } : i) : [...list, { name, price, qty: 1 }];
    });
  }
  applyCoupon(p: number) { this.couponPercent.set(p); }
}
// {{ count() }} items, total ₹{{ total() }}            (no async pipe, no subscribe)`,
        ),
      ],
      [
        blk(`<h3>effect(), linkedSignal and the signal-based APIs</h3>
• <code>effect(() =&gt; ...)</code> runs a side effect whenever the signals it reads change: logging, saving to <code>localStorage</code>, syncing with a non-Angular library, drawing on a canvas. It must be created in an injection context (constructor/field) and is cleaned up automatically.<br>
• <b>Do not use effects to derive state</b> (use <code>computed</code>) or to set other signals in a chain (use <code>linkedSignal</code>, a writable signal that resets from a source). Avoid writing to signals inside effects unless you opt in deliberately.<br>
• Signal-based component APIs: <code>input()</code>, <code>output()</code>, <code>model()</code>, <code>viewChild()</code>, <code>contentChild()</code>; <code>toSignal</code>/<code>toObservable</code> for RxJS; <code>resource()</code>/<code>httpResource()</code> for async data.`,
          `import { effect, linkedSignal, signal, untracked } from '@angular/core';

export class SettingsComponent {
  theme = signal<'light' | 'dark'>((localStorage.getItem('theme') as 'light' | 'dark') ?? 'light');
  lastSaved = signal<Date | null>(null);

  constructor() {
    effect(() => {
      const t = this.theme();                                   // tracked: re-runs when theme changes
      localStorage.setItem('theme', t);
      document.documentElement.dataset['theme'] = t;
      untracked(() => this.lastSaved.set(new Date()));           // read/write without tracking
    });
  }
}

// linkedSignal: resets to a default whenever the source changes, yet stays writable
selectedCourse = signal<Course | null>(null);
selectedLesson = linkedSignal(() => this.selectedCourse()?.lessons[0] ?? null);
selectedLesson.set(otherLesson);          // user choice; resets when selectedCourse changes

// resource(): async data driven by signals
id = signal(1);
course = resource({ request: () => ({ id: this.id() }), loader: ({ request }) => fetch('/api/courses/' + request.id).then(r => r.json() as Promise<Course>) });
// course.value(), course.isLoading(), course.error(), course.reload()`,
        ),
      ],
      [
        ['What is a signal in Angular?', 'A reactive value container: you read it by calling it, update it with set/update, and Angular tracks which templates and computed signals use it so only those are updated.'],
        ['computed vs effect?', 'computed derives a new read-only value from other signals (lazy and memoised) and has no side effects. effect runs side effects (logging, storage, third-party APIs) when its signals change; it should not be used to derive state.'],
        ['What changed with standalone components?', 'Components, directives and pipes declare their own imports and no NgModule is needed. Apps bootstrap with bootstrapApplication and lazy-load with loadComponent.'],
      ],
    ),
    topic(
      'ng-change-detection',
      'Change Detection and the OnPush Strategy',
      [
        blk(`<h3>How Angular knows when to update the view</h3>
• <b>Change detection (CD)</b> compares template bindings with their previous values and updates the DOM. By default <b>zone.js</b> patches async APIs (events, timers, HTTP) and triggers a CD pass over <b>the whole component tree</b> after each.<br>
• The <b>Default</b> strategy checks every component every time: simple but can be slow in big apps. Template expressions run on each pass, so they must be cheap.<br>
• Use <code>ng.profiler</code>/Angular DevTools to see how often components are checked.`,
          `// Every click anywhere re-checks every component's bindings under the Default strategy
@Component({ selector: 'app-row', standalone: true, template: '{{ compute() }}' })
export class RowComponent {
  compute() { console.log('checked'); return this.value * 2; }   // logs on every CD pass: avoid heavy work here
  value = 21;
}

// Enable event coalescing to reduce the number of passes
provideZoneChangeDetection({ eventCoalescing: true })`,
        ),
      ],
      [
        blk(`<h3>OnPush</h3>
• <code>changeDetection: ChangeDetectionStrategy.OnPush</code> tells Angular to check a component <b>only when</b>: (1) an <b>input reference changes</b>, (2) an <b>event</b> originates in the component or its template, (3) a bound <b>signal</b> it reads changes, (4) the <b>async pipe</b> emits, or (5) you call <code>markForCheck()</code>.<br>
• It skips whole subtrees that cannot have changed: large performance wins, and it forces good habits: <b>immutable data</b>, signals and the async pipe.<br>
• Common pitfall: mutating an input object/array (<code>items.push(x)</code>) does not trigger OnPush; assign a new reference. Make <b>OnPush your default</b> for every component (set it in the schematic defaults in <code>angular.json</code>).`,
          `import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-course-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<li>{{ course().title }} - {{ price() }}</li>',
})
export class CourseRowComponent {
  course = input.required<Course>();
  price = computed(() => '₹' + this.course().price);
}

// Parent
// this.courses.push(newCourse);                          // OnPush child lists do NOT update
// this.courses = [...this.courses, newCourse];           // new reference: updates
// courses.update(list => [...list, newCourse]);          // signals: always correct

// angular.json: make OnPush the default for generated components
// "schematics": { "@schematics/angular:component": { "changeDetection": "OnPush" } }`,
        ),
      ],
      [
        blk(`<h3>Zoneless Angular and optimisation tips</h3>
• With signals (and the async pipe), Angular does not need zone.js. <b>Zoneless</b> mode (<code>provideExperimentalZonelessChangeDetection()</code> / <code>provideZonelessChangeDetection()</code>) removes zone.js: smaller bundles, faster, more predictable. It works when views update through signals, the async pipe, <code>markForCheck</code> or event handlers.<br>
• Optimisation checklist: OnPush everywhere; signals for state; <code>@for</code> with <code>track</code>; no heavy methods in templates (use <code>computed</code>/pure pipes); run non-UI timers outside the zone (<code>NgZone.runOutsideAngular</code>); virtual scrolling (<code>cdk-virtual-scroll-viewport</code>) for long lists; <code>@defer</code> for below-the-fold parts.<br>
• Use <code>ChangeDetectorRef.markForCheck()</code> sparingly (when updating state from non-Angular code), <code>detectChanges()</code> rarely.`,
          `// zoneless
bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] });
// remove "zone.js" from polyfills in angular.json

// heavy animation loop outside Angular's zone: no CD per frame
constructor(private zone: NgZone) {
  this.zone.runOutsideAngular(() => {
    const loop = () => { this.draw(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
}

// virtual scrolling for huge lists
// <cdk-virtual-scroll-viewport itemSize="48" class="viewport">
//   <div *cdkVirtualFor="let row of rows; trackBy: trackById" class="row">{{ row.name }}</div>
// </cdk-virtual-scroll-viewport>

// updating from third-party code
private cdr = inject(ChangeDetectorRef);
chart.on('select', point => { this.selected = point; this.cdr.markForCheck(); });`,
        ),
      ],
      [
        ['What is the difference between Default and OnPush change detection?', 'Default checks every component on every pass. OnPush checks a component only when an input reference changes, an event fires inside it, a signal or async pipe it uses emits, or markForCheck is called, skipping unaffected subtrees.'],
        ['Why does an OnPush component not update when I push into an array input?', 'OnPush compares input references. push mutates the same array, so the reference is unchanged. Assign a new array (immutable update) or use signals.'],
        ['What is zoneless Angular?', 'Running without zone.js: change detection is triggered explicitly by signals, the async pipe, markForCheck and event handlers, giving smaller bundles and more predictable, faster updates.'],
      ],
    ),
    topic(
      'ng-dynamic-defer-encapsulation',
      'Dynamic Components, View Encapsulation and Deferrable Views (@defer)',
      [
        blk(`<h3>Dynamic components</h3>
• A <b>dynamic component</b> is created at runtime rather than written in a template: dialogs, widgets chosen by configuration, dashboards, plugin systems.<br>
• Use <code>ViewContainerRef.createComponent(Type)</code> (returns a <code>ComponentRef</code>: set inputs with <code>setInput()</code>, subscribe to outputs, call <code>destroy()</code>) or the declarative <code>*ngComponentOutlet</code> / <code>NgComponentOutlet</code>.<br>
• Load the component class lazily with <code>import()</code> to keep it out of the main bundle.`,
          `import { Component, ViewContainerRef, inject, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';

@Component({ selector: 'app-widget-host', standalone: true, template: '<ng-container #slot />' })
export class WidgetHostComponent {
  private vcr = inject(ViewContainerRef);

  async show(kind: 'chart' | 'table', data: unknown) {
    const type: Type<unknown> = kind === 'chart'
      ? (await import('./chart.component')).ChartComponent        // lazily loaded
      : (await import('./table.component')).TableComponent;
    this.vcr.clear();
    const ref = this.vcr.createComponent(type);
    ref.setInput('data', data);                                    // works with input() signals too
    ref.changeDetectorRef.detectChanges();
  }
}

// declarative version
@Component({
  selector: 'app-dashboard', standalone: true, imports: [NgComponentOutlet],
  template: '@for (w of widgets; track w.id) { <ng-container *ngComponentOutlet="w.component; inputs: w.inputs" /> }',
})
export class DashboardComponent { widgets: { id: number; component: Type<unknown>; inputs: Record<string, unknown> }[] = []; }`,
        ),
      ],
      [
        blk(`<h3>View encapsulation</h3>
• By default component styles are <b>scoped</b> to the component (<code>ViewEncapsulation.Emulated</code>): Angular adds unique attributes (<code>_ngcontent-xyz</code>) to elements and selectors, so styles do not leak out or in.<br>
• Modes: <code>Emulated</code> (default), <code>None</code> (styles become global: use for global theme components only), <code>ShadowDom</code> (native shadow DOM: strict isolation).<br>
• Style projected content or child components deliberately: <code>:host</code> (the component element), <code>:host-context(.dark)</code>, CSS custom properties (the clean way to theme), and (avoid) <code>::ng-deep</code> (deprecated, leaks).`,
          `@Component({
  selector: 'app-alert',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: '<div class="box"><ng-content /></div>',
  styles: [\`
    :host { display: block; margin: 1rem 0; }
    :host(.compact) { margin: 0.25rem 0; }
    :host-context(.dark) .box { background: #1f2937; color: #f9fafb; }
    .box { padding: 1rem; border-radius: 8px; background: var(--alert-bg, #fef3c7); }   /* themable from outside */
  \`],
})
export class AlertComponent {}

// theme from a parent without ::ng-deep
// app-alert { --alert-bg: #dcfce7; }
// <app-alert class="compact">Saved</app-alert>`,
        ),
      ],
      [
        blk(`<h3>Deferrable views: @defer</h3>
• <code>@defer</code> (Angular 17+) lazy-loads <b>parts of a template</b> (a component and its dependencies become a separate chunk) when a trigger fires. It cuts the initial bundle and speeds up first render.<br>
• <b>Triggers</b>: <code>on idle</code> (default), <code>on viewport</code> (visible), <code>on interaction</code>, <code>on hover</code>, <code>on immediate</code>, <code>on timer(2s)</code>, or <code>when condition</code>. Add <code>prefetch on ...</code> to download early.<br>
• Companion blocks: <code>@placeholder</code> (before loading starts; keep it the same size to avoid layout shift), <code>@loading (after 100ms; minimum 500ms)</code>, <code>@error</code>.<br>
• Only <b>standalone</b> components, directives and pipes referenced inside the block are deferred, and must not be used elsewhere eagerly.`,
          `// course-page.component.html
// <app-course-header [course]="course()" />
//
// @defer (on viewport; prefetch on idle) {
//   <app-reviews [courseId]="course().id" />
// } @placeholder (minimum 300ms) {
//   <div class="skeleton" style="height: 240px"></div>
// } @loading (after 150ms; minimum 500ms) {
//   <app-spinner />
// } @error {
//   <p role="alert">Could not load reviews.</p>
// }
//
// @defer (on interaction(playBtn)) {
//   <app-video-player [src]="course().trailer" />
// } @placeholder {
//   <button #playBtn>Play trailer</button>
// }
//
// @defer (when isAdmin()) { <app-admin-tools /> }       <!-- once true, stays loaded -->`,
        ),
      ],
      [
        ['What does ViewEncapsulation.Emulated do?', 'It scopes component CSS by adding unique attributes to the component\'s elements and rewriting selectors, so styles do not leak to or from other components. It is the default mode.'],
        ['What is @defer used for?', 'To lazy-load part of a template on a trigger (viewport, idle, interaction, timer, condition), with placeholder, loading and error blocks, reducing the initial bundle size and improving first load.'],
        ['How do you create a component dynamically?', 'With ViewContainerRef.createComponent(Type), setting inputs via setInput and destroying it when no longer needed, or declaratively with ngComponentOutlet. The class can be loaded lazily with import().'],
      ],
    ),
    topic(
      'ng-ssr-hydration',
      'Server-Side Rendering (SSR), Hydration and Prerendering',
      [
        blk(`<h3>Why SSR?</h3>
• A client-rendered SPA sends an empty shell, then JavaScript builds the page: slower first paint on weak devices and poor for crawlers/link previews. <b>Server-side rendering</b> runs Angular on the server and sends ready HTML, which the browser shows immediately; the app then <b>hydrates</b> it (attaches listeners and state, reusing the DOM).<br>
• <b>Prerendering (SSG)</b> renders routes at build time into static HTML: ideal for public content (marketing pages, course catalogue, docs).<br>
• Add it with <code>ng add @angular/ssr</code>, or <code>ng new app --ssr</code>. It creates a Node/Express server entry (<code>server.ts</code>) and <code>provideClientHydration()</code>.`,
          `ng new course-portal --ssr
# or in an existing app
ng add @angular/ssr

# app.config.ts
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
provideClientHydration(withEventReplay())          // replays user clicks made before hydration finished

# build and run
ng build
node dist/course-portal/server/server.mjs          # serves server-rendered pages on port 4000

# prerender static routes at build time (angular.json: "prerender": true, or a routes file)
ng build --prerender`,
        ),
      ],
      [
        blk(`<h3>Writing SSR-safe code</h3>
• On the server there is <b>no <code>window</code>, <code>document</code>, <code>localStorage</code>, layout or real DOM events</b>. Guard browser-only code: <code>isPlatformBrowser(inject(PLATFORM_ID))</code>, or run it in <code>afterNextRender()</code>/<code>afterRender()</code> (client only).<br>
• Use Angular abstractions (<code>DOCUMENT</code>, <code>Renderer2</code>, <code>Title</code>, <code>Meta</code>) rather than touching globals.<br>
• <b>HTTP on the server</b>: relative URLs need a base URL; <b>TransferState</b> (automatic with <code>provideHttpClient(withFetch())</code> + hydration) reuses server responses on the client so data is not fetched twice.<br>
• Avoid timers and long-lived subscriptions started during server rendering (they delay the response). Per-request state must not live in module-level variables (shared between users!).`,
          `import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { PLATFORM_ID, afterNextRender, inject } from '@angular/core';

export class CourseDetailComponent {
  private platformId = inject(PLATFORM_ID);
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  constructor() {
    // runs on server and browser: SEO tags
    this.title.setTitle('Angular Essentials | JavaSchoolLab');
    this.meta.updateTag({ name: 'description', content: 'Learn Angular step by step.' });
    this.meta.updateTag({ property: 'og:title', content: 'Angular Essentials' });

    // browser only
    afterNextRender(() => { localStorage.setItem('lastCourse', 'angular'); new IntersectionObserver(() => {}).observe(this.doc.body); });
    if (isPlatformBrowser(this.platformId)) { window.scrollTo(0, 0); }
  }
}

// Wrong: window.innerWidth in a constructor crashes on the server with "window is not defined"`,
        ),
      ],
      [
        blk(`<h3>Choosing SSR, SSG or a plain SPA</h3>
<table ${TABLE}>
<tr><th>Mode</th><th>Good for</th><th>Trade-offs</th></tr>
<tr><td>Client-side SPA</td><td>Logged-in dashboards, admin tools</td><td>Slower first paint, weak SEO</td></tr>
<tr><td>SSR</td><td>Public, dynamic, SEO-relevant pages (catalogue with live data)</td><td>Needs a Node server, more complexity, careful browser-only code</td></tr>
<tr><td>Prerendering / SSG</td><td>Mostly static public pages (landing, docs, blog)</td><td>Rebuild to update; not for per-user content</td></tr>
<tr><td>Hybrid (route-level render mode)</td><td>Mix: static landing, SSR catalogue, client-only dashboard</td><td>Configure per route with <code>serverRoutes</code></td></tr>
</table>
• For a learning platform: prerender or SSR the public course pages (SEO and link previews) and keep the authenticated learner area client-rendered.<br>
• Incremental hydration (<code>@defer</code> with <code>hydrate on ...</code>) delays hydrating parts of the page until needed.`,
          `// app.routes.server.ts (Angular 19+): render mode per route
import { RenderMode, ServerRoute } from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },                       // static landing
  { path: 'courses', renderMode: RenderMode.Server },                   // SSR with fresh data
  { path: 'courses/:slug', renderMode: RenderMode.Prerender,
    async getPrerenderParams() { return (await fetch('http://localhost:8080/api/slugs').then(r => r.json())).map((slug: string) => ({ slug })); } },
  { path: 'dashboard/**', renderMode: RenderMode.Client },              // logged-in area: client only
  { path: '**', renderMode: RenderMode.Server },
];

// incremental hydration
// @defer (on viewport; hydrate on interaction) { <app-comments /> }`,
        ),
      ],
      [
        ['What is hydration?', 'After server-rendered HTML is shown, Angular attaches event listeners and state to the existing DOM instead of re-creating it, avoiding flicker and repeated work.'],
        ['Why does "window is not defined" appear with SSR?', 'The code runs on the Node server, which has no browser globals. Guard it with isPlatformBrowser, use afterNextRender, or use abstractions such as DOCUMENT and Renderer2.'],
        ['When would you not use SSR?', 'For authenticated, highly interactive dashboards where SEO does not matter; a client-side SPA is simpler and avoids running a Node server.'],
      ],
    ),
  ]),

  ng(11, 'State Management', 'Core', [
    topic(
      'ng-state-patterns',
      'Component, Service, Signals and RxJS State',
      [
        blk(`<h3>Where state lives</h3>
• <b>Component state</b>: UI-only, short-lived data (is the menu open, current tab, form values). Keep it in the component with a <code>signal</code>.<br>
• <b>Service state</b>: data shared by several components (cart, current user, filters). A root (or feature-scoped) service holds it and exposes read-only signals/observables plus methods to change it.<br>
• <b>Server state</b>: data that belongs to the API (lists, records) with caching/invalidation concerns: a store, <code>httpResource</code>, or a query library.<br>
• <b>URL state</b>: filters, page, selected id belong in the route (shareable, refresh-safe).`,
          `// Component state
export class TabsComponent { active = signal<'overview' | 'lessons' | 'reviews'>('overview'); }

// Service state with signals
@Injectable({ providedIn: 'root' })
export class FilterState {
  private readonly _query = signal('');
  private readonly _level = signal<'ALL' | 'BEGINNER' | 'ADVANCED'>('ALL');
  readonly query = this._query.asReadonly();
  readonly level = this._level.asReadonly();
  readonly active = computed(() => this._query() !== '' || this._level() !== 'ALL');

  setQuery(q: string) { this._query.set(q); }
  setLevel(l: 'ALL' | 'BEGINNER' | 'ADVANCED') { this._level.set(l); }
  reset() { this._query.set(''); this._level.set('ALL'); }
}`,
        ),
      ],
      [
        blk(`<h3>A signals-based store</h3>
• A <b>store service</b> combines state, selectors (<code>computed</code>), and actions (methods). Keep the state in one object signal so updates are atomic and easy to reason about, and make it <b>immutable</b>.<br>
• Loading/error flags travel with the data (<code>status: 'idle' | 'loading' | 'success' | 'error'</code>), avoiding contradictory booleans.<br>
• Provide it at the feature route when it should be discarded with the feature.`,
          `interface CourseState { items: Course[]; status: 'idle' | 'loading' | 'success' | 'error'; error: string | null; selectedId: number | null }
const initial: CourseState = { items: [], status: 'idle', error: null, selectedId: null };

@Injectable({ providedIn: 'root' })
export class CourseStore {
  private api = inject(CourseApi);
  private state = signal<CourseState>(initial);

  // selectors
  readonly items = computed(() => this.state().items);
  readonly loading = computed(() => this.state().status === 'loading');
  readonly error = computed(() => this.state().error);
  readonly selected = computed(() => this.state().items.find(c => c.id === this.state().selectedId) ?? null);

  // actions
  load() {
    this.state.update(s => ({ ...s, status: 'loading', error: null }));
    this.api.list().subscribe({
      next: items => this.state.update(s => ({ ...s, items, status: 'success' })),
      error: () => this.state.update(s => ({ ...s, status: 'error', error: 'Could not load courses' })),
    });
  }
  select(id: number | null) { this.state.update(s => ({ ...s, selectedId: id })); }
  rename(id: number, title: string) { this.state.update(s => ({ ...s, items: s.items.map(c => c.id === id ? { ...c, title } : c) })); }
}`,
        ),
      ],
      [
        blk(`<h3>RxJS-based state and choosing an approach</h3>
• The classic pattern: <code>BehaviorSubject&lt;State&gt;</code> + <code>asObservable()</code> + selectors with <code>map</code> + <code>distinctUntilChanged</code> + <code>shareReplay</code>. It is more verbose than signals but natural when state changes come from streams (WebSocket messages, debounced search).<br>
• <b>ComponentStore</b> (NgRx) and <b>SignalStore</b> (NgRx Signals) give structured local/feature state with less boilerplate than full NgRx.<br>
<table ${TABLE}>
<tr><th>Approach</th><th>Use when</th></tr>
<tr><td>Component signals</td><td>State used by one component</td></tr>
<tr><td>Service + signals</td><td>Most shared state; small to medium apps</td></tr>
<tr><td>Service + RxJS</td><td>Stream-heavy state, existing RxJS codebases</td></tr>
<tr><td>NgRx SignalStore / ComponentStore</td><td>Feature state needing structure</td></tr>
<tr><td>NgRx Store</td><td>Large apps, many developers, need devtools/time-travel, strict unidirectional flow</td></tr>
</table>`,
          `@Injectable({ providedIn: 'root' })
export class NotificationsStore {
  private readonly state$ = new BehaviorSubject<{ unread: number; items: Notification[] }>({ unread: 0, items: [] });
  readonly unread$ = this.state$.pipe(map(s => s.unread), distinctUntilChanged());
  readonly items$ = this.state$.pipe(map(s => s.items), distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));

  constructor(socket: SocketService) {
    socket.messages$.pipe(takeUntilDestroyed()).subscribe(n =>
      this.state$.next({ unread: this.state$.value.unread + 1, items: [n, ...this.state$.value.items] }));
  }
  markAllRead() { this.state$.next({ ...this.state$.value, unread: 0 }); }
}`,
        ),
      ],
      [
        ['Where should shared application state live in Angular?', 'In an injectable service (or a store) that holds the state in signals or observables, exposes read-only selectors and changes it only through methods. Component-only state stays in the component.'],
        ['Why keep state immutable?', 'OnPush change detection, signals and memoised selectors detect changes by reference. Immutable updates make changes detectable, debugging easier and prevent accidental shared mutation.'],
        ['When is NgRx worth it?', 'In large applications with many developers and complex state interactions that benefit from a strict, predictable unidirectional flow, devtools and time travel; smaller apps do fine with signal-based services.'],
      ],
    ),
    topic(
      'ng-ngrx-store',
      'NgRx: Actions, Reducers, Effects and Selectors',
      [
        blk(`<h3>The NgRx flow</h3>
• <b>NgRx</b> is Redux for Angular, built on RxJS. One <b>Store</b> holds the state tree. Components <b>dispatch actions</b> (events describing what happened); <b>reducers</b> (pure functions) compute the new state; <b>selectors</b> read slices; <b>effects</b> handle side effects such as HTTP and dispatch new actions.<br>
• Install: <code>ng add @ngrx/store @ngrx/effects @ngrx/store-devtools</code>. Standalone setup: <code>provideStore()</code>, <code>provideEffects()</code>, <code>provideState()</code> for feature slices.<br>
• Benefits: predictable updates, time-travel debugging (Redux DevTools), testable pure functions. Cost: boilerplate.`,
          `// courses.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
export const CoursesActions = createActionGroup({
  source: 'Courses',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ courses: Course[] }>(),
    'Load Failure': props<{ error: string }>(),
    'Select': props<{ id: number }>(),
    'Remove': props<{ id: number }>(),
  },
});

// courses.reducer.ts
import { createFeature, createReducer, on } from '@ngrx/store';
export interface CoursesState { courses: Course[]; selectedId: number | null; loading: boolean; error: string | null }
const initialState: CoursesState = { courses: [], selectedId: null, loading: false, error: null };

export const coursesFeature = createFeature({
  name: 'courses',
  reducer: createReducer(
    initialState,
    on(CoursesActions.load, state => ({ ...state, loading: true, error: null })),
    on(CoursesActions.loadSuccess, (state, { courses }) => ({ ...state, courses, loading: false })),
    on(CoursesActions.loadFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(CoursesActions.select, (state, { id }) => ({ ...state, selectedId: id })),
    on(CoursesActions.remove, (state, { id }) => ({ ...state, courses: state.courses.filter(c => c.id !== id) })),
  ),
});
export const { selectCourses, selectLoading, selectSelectedId } = coursesFeature;   // selectors generated by createFeature`,
        ),
      ],
      [
        blk(`<h3>Effects</h3>
• An <b>effect</b> listens to the action stream, performs side effects (HTTP, storage, navigation) and emits new actions. Functional effects (<code>createEffect(() =&gt; ..., { functional: true })</code>) use <code>inject()</code>.<br>
• Use <code>switchMap</code> for loads (latest wins), <code>concatMap</code> for ordered writes, <code>exhaustMap</code> for logins. <b>Handle errors inside the inner pipe</b> and return a failure action so the effect stream never dies.<br>
• Keep reducers pure: no HTTP, no random, no dates inside reducers.`,
          `// courses.effects.ts
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

export const loadCourses = createEffect(
  (actions$ = inject(Actions), api = inject(CourseApi)) =>
    actions$.pipe(
      ofType(CoursesActions.load),
      switchMap(() => api.list().pipe(
        map(courses => CoursesActions.loadSuccess({ courses })),
        catchError(err => of(CoursesActions.loadFailure({ error: err.message ?? 'Failed' }))),   // error handled per request
      )),
    ),
  { functional: true },
);

export const removeCourse = createEffect(
  (actions$ = inject(Actions), api = inject(CourseApi)) =>
    actions$.pipe(
      ofType(CoursesActions.remove),
      concatMap(({ id }) => api.remove(id).pipe(
        map(() => CoursesActions.load()),
        catchError(err => of(CoursesActions.loadFailure({ error: err.message }))),
      )),
    ),
  { functional: true },
);

// app.config.ts
provideStore(),
provideState(coursesFeature),
provideEffects({ loadCourses, removeCourse }),
provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),`,
        ),
      ],
      [
        blk(`<h3>Selectors and using the store in components</h3>
• <b>Selectors</b> are memoised functions that read and derive state (<code>createSelector</code>). They recompute only when their inputs change and make components independent of the state shape.<br>
• Components read with <code>store.select(selector)</code> (Observable) or <code>store.selectSignal(selector)</code> (signal) and dispatch with <code>store.dispatch(action)</code>.<br>
• Put derived/combined data in selectors, not in components; test selectors and reducers as plain functions.`,
          `// courses.selectors.ts
import { createSelector } from '@ngrx/store';
export const selectSelectedCourse = createSelector(
  selectCourses, selectSelectedId,
  (courses, id) => courses.find(c => c.id === id) ?? null,
);
export const selectCourseCount = createSelector(selectCourses, courses => courses.length);
export const selectViewModel = createSelector(
  selectCourses, selectLoading, selectSelectedCourse,
  (courses, loading, selected) => ({ courses, loading, selected }),
);

// course-list.component.ts
export class CourseListComponent {
  private store = inject(Store);
  vm = this.store.selectSignal(selectViewModel);

  ngOnInit() { this.store.dispatch(CoursesActions.load()); }
  select(id: number) { this.store.dispatch(CoursesActions.select({ id })); }
  remove(id: number) { this.store.dispatch(CoursesActions.remove({ id })); }
}
// @if (vm().loading) { <p>Loading...</p> } @for (c of vm().courses; track c.id) { <li (click)="select(c.id)">{{ c.title }}</li> }

// Reducer test: a pure function
it('removes a course', () => {
  const state = { ...initialState, courses: [{ id: 1 } as Course, { id: 2 } as Course] };
  const next = coursesFeature.reducer(state, CoursesActions.remove({ id: 1 }));
  expect(next.courses.map(c => c.id)).toEqual([2]);
});`,
        ),
      ],
      [
        ['What are actions, reducers, effects and selectors in NgRx?', 'Actions describe events; reducers are pure functions producing new state from state and an action; effects handle side effects such as HTTP and dispatch new actions; selectors are memoised functions that read and derive state.'],
        ['Why must reducers be pure?', 'So the same state and action always give the same result with no side effects. That enables time-travel debugging, simple tests and change detection by reference.'],
        ['Why handle errors inside the inner observable of an effect?', 'An error that reaches the outer effect stream terminates it, so the effect stops reacting to future actions. catchError inside switchMap/concatMap returns a failure action and keeps the effect alive.'],
      ],
    ),
    topic(
      'ng-ngrx-signalstore-normalization',
      'NgRx SignalStore and State Normalization',
      [
        blk(`<h3>NgRx SignalStore</h3>
• <b>SignalStore</b> (<code>@ngrx/signals</code>) is a lightweight, signal-based store: define <code>withState</code>, <code>withComputed</code> (selectors), <code>withMethods</code> (actions, including async with <code>rxMethod</code>), <code>withHooks</code>. Far less boilerplate than the classic Store, while keeping structure and devtools support.<br>
• Provide it where needed (<code>providedIn: 'root'</code> or in a route/component). Methods change state with <code>patchState</code>.<br>
• Choose it for feature-level state in apps that do not need the full action/reducer ceremony.`,
          `import { patchState, signalStore, withComputed, withMethods, withState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

interface CartState { items: CartItem[]; loading: boolean }

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState<CartState>({ items: [], loading: false }),
  withComputed(({ items }) => ({
    count: computed(() => items().reduce((n, i) => n + i.qty, 0)),
    total: computed(() => items().reduce((s, i) => s + i.price * i.qty, 0)),
  })),
  withMethods((store, api = inject(CartApi)) => ({
    add(item: CartItem) { patchState(store, s => ({ items: [...s.items, item] })); },
    remove(id: number) { patchState(store, s => ({ items: s.items.filter(i => i.id !== id) })); },
    load: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.load().pipe(tapResponse({
        next: items => patchState(store, { items, loading: false }),
        error: () => patchState(store, { loading: false }),
      }))),
    )),
  })),
  withHooks({ onInit: store => store.load() }),
);

// component: readonly cart = inject(CartStore);   {{ cart.count() }}  {{ cart.total() }}   cart.add(item)`,
        ),
      ],
      [
        blk(`<h3>Normalising state</h3>
• <b>Normalisation</b> stores entities in a lookup <b>by id</b> instead of nested copies: <code>{ entities: { 1: {...}, 2: {...} }, ids: [1, 2] }</code>. Each fact is stored once, so updating a record changes one place, lookups are O(1), and there are no inconsistent duplicates (the same author embedded in 50 posts).<br>
• Relationships hold <b>ids</b>: <code>course.authorId</code>, <code>course.lessonIds</code>; selectors <b>denormalise</b> (join) for the view.<br>
• NgRx provides <b>Entity</b> (<code>@ngrx/entity</code>: <code>createEntityAdapter</code>) and SignalStore's <code>withEntities</code> for this, with helpers <code>addOne</code>, <code>setAll</code>, <code>updateOne</code>, <code>removeOne</code>, <code>upsertOne</code>.`,
          `// Nested (denormalised) - author duplicated, hard to update consistently
// courses: [{ id: 1, title: 'A', author: { id: 7, name: 'Asha' } }, { id: 2, title: 'B', author: { id: 7, name: 'Asha' } }]

// Normalised
// courses: { 1: { id: 1, title: 'A', authorId: 7 }, 2: { id: 2, title: 'B', authorId: 7 } }
// authors: { 7: { id: 7, name: 'Asha' } }

import { createEntityAdapter, EntityState } from '@ngrx/entity';
export const courseAdapter = createEntityAdapter<Course>({ sortComparer: (a, b) => a.title.localeCompare(b.title) });
export interface CourseEntityState extends EntityState<Course> { loading: boolean }
export const initialState: CourseEntityState = courseAdapter.getInitialState({ loading: false });

export const reducer = createReducer(
  initialState,
  on(CoursesActions.loadSuccess, (s, { courses }) => courseAdapter.setAll(courses, { ...s, loading: false })),
  on(CoursesActions.rename, (s, { id, title }) => courseAdapter.updateOne({ id, changes: { title } }, s)),   // one place changes
  on(CoursesActions.remove, (s, { id }) => courseAdapter.removeOne(id, s)),
);
const { selectAll, selectEntities } = courseAdapter.getSelectors();

// join at read time
export const selectCoursesWithAuthor = createSelector(selectAll, selectAuthorEntities,
  (courses, authors) => courses.map(c => ({ ...c, author: authors[c.authorId] })));

// SignalStore flavour
// signalStore(withEntities<Course>(), withMethods(store => ({ setCourses: (c: Course[]) => patchState(store, setAllEntities(c)) })))`,
        ),
      ],
      [
        blk(`<h3>Server state, caching and avoiding over-engineering</h3>
• Much "state" in a CRUD app is a cache of server data. Decide the policy: when is it stale, when to refetch, how to invalidate after a mutation, optimistic updates with rollback.<br>
• Do not push everything into a global store. <b>Colocate</b> state, keep UI state local, derive instead of duplicating, and add a store when the pain is real (many components reading and writing the same data).<br>
• Handle <b>optimistic updates</b>: apply the change to the store first, call the API, roll back on failure and show a message.<br>
• Persist only what is needed (<code>localStorage</code> for preferences) and never secrets.`,
          `// Optimistic update with rollback in a signals store
remove(id: number) {
  const snapshot = this.state().items;
  this.state.update(s => ({ ...s, items: s.items.filter(c => c.id !== id) }));       // UI updates instantly
  this.api.remove(id).subscribe({
    error: () => {
      this.state.update(s => ({ ...s, items: snapshot }));                           // roll back
      this.notify.show('Could not delete the course');
    },
  });
}

// Simple TTL cache for GETs
private cache = new Map<string, { at: number; data: unknown }>();
get<T>(url: string, ttlMs = 30_000): Observable<T> {
  const hit = this.cache.get(url);
  if (hit && Date.now() - hit.at < ttlMs) return of(hit.data as T);
  return this.http.get<T>(url).pipe(tap(data => this.cache.set(url, { at: Date.now(), data })));
}`,
        ),
      ],
      [
        ['What is state normalisation?', 'Storing entities once in lookup tables by id (and referencing them by id elsewhere) instead of nesting duplicate copies. It makes updates consistent and lookups fast; selectors join the data for display.'],
        ['SignalStore vs classic NgRx Store?', 'SignalStore is a lighter, signal-based store with state, computed, methods and hooks in one definition and little boilerplate. The classic Store uses actions, reducers, effects and selectors, suited to large apps wanting strict unidirectional flow and devtools.'],
        ['What is an optimistic update?', 'Updating the UI/state immediately assuming the request will succeed, then rolling back and informing the user if the request fails, making the app feel instant.'],
      ],
    ),
  ]),

  ng(12, 'Security and Performance', 'Production', [
    topic(
      'ng-security-auth-jwt',
      'Authentication with Spring Security, JWT and Secure Sessions',
      [
        blk(`<h3>Choose a session model</h3>
• <b>Server session (cookie)</b>: after login Spring Security creates a session and sends <code>JSESSIONID</code> as an <code>HttpOnly; Secure; SameSite</code> cookie. Simple, easy to revoke (invalidate the session), JavaScript cannot read the cookie. Requires CSRF protection. Best when Angular and the API share a site.<br>
• <b>JWT</b>: the server issues a signed token; the client sends it in <code>Authorization: Bearer ...</code>. Stateless, convenient for multiple services/mobile. Harder to revoke: use <b>short-lived access tokens</b> (5-15 min) plus a <b>refresh token</b> (days) stored in an <b>HttpOnly cookie</b> and rotated on use.<br>
• A JWT is <b>signed, not encrypted</b>: never put secrets in it; always verify signature, issuer, audience and expiry on the server.`,
          `// Spring Security 6 : stateless JWT resource server (Java)
// @Bean SecurityFilterChain api(HttpSecurity http) throws Exception {
//   return http
//     .csrf(csrf -> csrf.disable())                                  // OK for header-token APIs; keep CSRF for cookie auth
//     .cors(Customizer.withDefaults())
//     .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//     .authorizeHttpRequests(a -> a
//         .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
//         .requestMatchers("/api/admin/**").hasRole("ADMIN")
//         .anyRequest().authenticated())
//     .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
//     .build();
// }

// refresh token as a protected cookie
// ResponseCookie c = ResponseCookie.from("refresh", token).httpOnly(true).secure(true).sameSite("Strict").path("/api/auth").maxAge(Duration.ofDays(7)).build();
// response.addHeader(HttpHeaders.SET_COOKIE, c.toString());`,
        ),
      ],
      [
        blk(`<h3>The Angular side</h3>
• Keep the <b>access token in memory</b> (a signal in <code>AuthService</code>), not in <code>localStorage</code>/<code>sessionStorage</code> where XSS can steal it. After a page refresh, call <code>/api/auth/refresh</code> (the refresh cookie is sent automatically) at startup to get a new access token.<br>
• An <b>interceptor</b> attaches the token and, on 401, refreshes once and retries (single in-flight refresh). Log the user out and redirect when refresh fails.<br>
• <b>Logout</b> must call the server to revoke the refresh token/session, then clear client state.<br>
• Use <code>provideAppInitializer</code> to restore the session before the first route guard runs.`,
          `@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private _token = signal<string | null>(null);
  private _user = signal<User | null>(null);
  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  login(email: string, password: string) {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password }, { withCredentials: true })
      .pipe(tap(r => this.store(r)));
  }
  refresh() {
    return this.http.post<AuthResponse>('/api/auth/refresh', {}, { withCredentials: true }).pipe(tap(r => this.store(r)));
  }
  restore() { return firstValueFrom(this.refresh().pipe(catchError(() => of(null)))); }
  logout() {
    this.http.post('/api/auth/logout', {}, { withCredentials: true }).subscribe({ complete: () => this.clear() });
  }
  clear() { this._token.set(null); this._user.set(null); this.router.navigate(['/login']); }
  private store(r: AuthResponse) { this._token.set(r.accessToken); this._user.set(r.user); }
}

// app.config.ts
provideAppInitializer(() => inject(AuthService).restore())`,
        ),
      ],
      [
        blk(`<h3>Secure session checklist</h3>
• Passwords: hash with <b>bcrypt/Argon2</b> (<code>DelegatingPasswordEncoder</code>), never store plain text; rate-limit and lock out repeated failures; require strong passwords; consider MFA.<br>
• Cookies: <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite=Lax/Strict</code>; set short idle and absolute timeouts; rotate the session id on login (session fixation protection, default in Spring).<br>
• Tokens: short expiry, refresh-token rotation with reuse detection, revoke on logout/password change, use asymmetric keys (RS256/ES256) if several services verify tokens.<br>
• Always <b>HTTPS</b> + HSTS. Never log tokens. Do not put personal data in JWT claims.<br>
• For social login use <b>OAuth2/OIDC</b> (Spring Authorization Server, Keycloak) with the authorisation-code + PKCE flow, not hand-rolled schemes.`,
          `// Spring: session cookie + CSRF for a same-site Angular app
// http.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))    // Angular reads XSRF-TOKEN
//     .sessionManagement(s -> s.sessionFixation().migrateSession().maximumSessions(3));
// server.servlet.session.cookie.same-site=lax
// server.servlet.session.cookie.secure=true
// server.servlet.session.timeout=30m

// Angular reads the XSRF-TOKEN cookie and sends X-XSRF-TOKEN automatically for same-origin mutating requests:
provideHttpClient(withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }))`,
        ),
      ],
      [
        ['Where should the Angular app keep a JWT?', 'Access token in memory (a signal) and the refresh token in an HttpOnly, Secure, SameSite cookie. Avoid localStorage because XSS can read it.'],
        ['Session cookie vs JWT?', 'Session cookies are simple, revocable and invisible to JavaScript (needs CSRF protection). JWTs are stateless and good across services but are hard to revoke, so use short expiry plus rotating refresh tokens.'],
        ['Is a JWT encrypted?', 'No. It is signed (tamper-proof) but its payload is only base64url-encoded and readable by anyone, so never store secrets in it and always validate it on the server.'],
      ],
    ),
    topic(
      'ng-security-xss-csrf',
      'XSS, CSRF and Route Guards vs Backend Authorization',
      [
        blk(`<h3>XSS (cross-site scripting)</h3>
• XSS runs an attacker's script in your page (steals tokens and data, acts as the user). Angular is <b>secure by default</b>: interpolation <code>{{ }}</code> escapes values, and bindings to <code>[innerHTML]</code>, <code>[src]</code>/<code>[href]</code> and <code>[style]</code> are <b>sanitised</b> (dangerous parts such as <code>&lt;script&gt;</code> and <code>javascript:</code> URLs are removed).<br>
• The danger points: <code>bypassSecurityTrust*</code> (<code>DomSanitizer</code>) on untrusted input, direct DOM access (<code>nativeElement.innerHTML</code>, <code>document.write</code>), <code>eval</code>, building templates from user text, and third-party libraries.<br>
• Add a <b>Content-Security-Policy</b> header as defence in depth.`,
          `// Safe: the string is shown as text
// <p>{{ comment }}</p>

// Safe: sanitised (script and event handlers are stripped)
// <div [innerHTML]="comment"></div>

// UNSAFE: you declare the content trusted, so Angular stops sanitising it
constructor(private sanitizer: DomSanitizer) {}
bad(userHtml: string) { return this.sanitizer.bypassSecurityTrustHtml(userHtml); }      // never with user input

// UNSAFE direct DOM writes
// this.el.nativeElement.innerHTML = userHtml;

// Safe way to allow limited rich text: sanitise with an allow-list library first
import DOMPurify from 'dompurify';
clean = DOMPurify.sanitize(userHtml, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'li'], ALLOWED_ATTR: ['href'] });

// Spring Boot / nginx header
// Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'`,
        ),
      ],
      [
        blk(`<h3>CSRF (cross-site request forgery)</h3>
• CSRF makes a victim's browser send an authenticated request to your API from another site; the browser attaches cookies automatically. It matters when authentication uses <b>cookies</b>; token-in-header APIs are not vulnerable the same way.<br>
• Defences: <b>SameSite</b> cookies (<code>Lax</code>/<code>Strict</code>), a <b>CSRF token</b> (Spring Security <code>CookieCsrfTokenRepository</code> sets <code>XSRF-TOKEN</code>; Angular's <code>HttpClient</code> reads it and sends the <code>X-XSRF-TOKEN</code> header on mutating same-origin requests automatically), <code>Origin</code>/<code>Referer</code> checks, and <b>no state change on GET</b>.<br>
• Angular only adds the token for <b>relative/same-origin</b> URLs: use a proxy or same origin rather than absolute cross-origin URLs.`,
          `// Angular (default names already match Spring's defaults)
provideHttpClient(withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }))

// Spring Security
// http.csrf(csrf -> csrf
//     .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())    // the SPA must be able to read the cookie
//     .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()));       // plain token (not BREACH-masked) for SPAs
// SameSite: server.servlet.session.cookie.same-site=lax

// Never do state changes with GET
// @GetMapping("/api/courses/{id}/delete")   // WRONG: <img src="https://app/api/courses/5/delete"> triggers it
// @DeleteMapping("/api/courses/{id}")       // RIGHT`,
        ),
      ],
      [
        blk(`<h3>Route guards vs backend authorization</h3>
• <b>Guards are not security.</b> Everything in the browser, including guards, role checks and hidden buttons, can be read, modified or bypassed (devtools, replaying requests with curl). They exist for <b>usability</b>: do not show pages the user cannot use.<br>
• <b>Authorization must be enforced on the server for every request</b>: Spring Security rules (<code>hasRole</code>), method security (<code>@PreAuthorize</code>), and <b>ownership checks</b> (a user may edit only their own records; never trust an id sent by the client). Respond <code>401</code> (not authenticated) / <code>403</code> (not allowed).<br>
• Angular's role is to <b>react</b> to those responses (redirect to login on 401, show "no access" on 403).<br>
• Also remember: do not put secrets (API keys with write access, signing keys) in Angular code or <code>environment.ts</code>: they ship to every visitor.`,
          `// Frontend: usability only
export const adminGuard: CanActivateFn = () => inject(AuthService).hasRole('ADMIN') || inject(Router).createUrlTree(['/forbidden']);

// Backend: the real enforcement
// @PreAuthorize("hasRole('ADMIN')")
// @DeleteMapping("/api/users/{id}") void deleteUser(@PathVariable long id) { ... }
//
// Ownership: a student may read only his own enrolment
// @GetMapping("/api/enrolments/{id}")
// Enrolment get(@PathVariable long id, Authentication auth) {
//   Enrolment e = repo.findById(id).orElseThrow(NotFoundException::new);
//   if (!e.getStudentEmail().equals(auth.getName()) && !isAdmin(auth)) throw new AccessDeniedException("Not your enrolment");
//   return e;
// }

// Attack the frontend guard in 2 lines (that is why the server must check):
//   fetch('/api/users/7', { method: 'DELETE', credentials: 'include' })   // from the browser console`,
        ),
      ],
      [
        ['How does Angular protect against XSS?', 'It escapes interpolated values and sanitises values bound to innerHTML, URLs and styles. XSS appears when you bypass sanitisation with bypassSecurityTrust*, write to the DOM directly, or use eval-like APIs with untrusted input.'],
        ['How does CSRF protection work between Angular and Spring Boot?', 'Spring sends an XSRF-TOKEN cookie; Angular\'s HttpClient reads it and sends X-XSRF-TOKEN on mutating same-origin requests; the server rejects requests without a matching token. SameSite cookies add another layer.'],
        ['Why can\'t route guards secure an application?', 'Client code is under the user\'s control and can be bypassed. Only the server can reliably authenticate and authorise requests, so guards are merely a usability feature.'],
      ],
    ),
    topic(
      'ng-performance-production',
      'Performance: Lazy Loading, Bundle Optimization, Memory Leaks and Production Builds',
      [
        blk(`<h3>Bundle optimisation</h3>
• Measure first: <code>ng build --stats-json</code> and a visualiser (<code>esbuild-visualizer</code>, <code>source-map-explorer</code>), Lighthouse and Chrome DevTools. Watch <b>Core Web Vitals</b> (LCP, INP, CLS).<br>
• <b>Lazy-load routes</b> (<code>loadComponent</code>/<code>loadChildren</code>), <b>defer</b> heavy widgets with <code>@defer</code>, import only what you use (RxJS operators from <code>'rxjs'</code>, individual lodash functions, date-fns instead of moment), avoid pulling large libraries into the main bundle.<br>
• <b>Budgets</b> in <code>angular.json</code> fail the build when bundles grow. Use <code>NgOptimizedImage</code> (<code>ngSrc</code>, <code>priority</code>) for images, compress with Brotli, cache hashed files long-term.`,
          `// angular.json budgets
// "budgets": [
//   { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
//   { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
// ]

// optimised images
import { NgOptimizedImage } from '@angular/common';
// <img ngSrc="/assets/hero.avif" width="1200" height="600" priority alt="Students learning Angular">
// <img ngSrc="/assets/thumb.avif" width="320" height="180" alt="Course thumbnail">      <!-- lazy by default -->

// Prefer small imports
import { debounce } from 'lodash-es';       // tree-shakable; not: import _ from 'lodash'
import { format } from 'date-fns';           // not: import moment from 'moment'

// nginx: cache hashed bundles forever, never cache index.html
// location ~* \\.(js|css|woff2|avif|webp)$ { add_header Cache-Control "public, max-age=31536000, immutable"; }
// location = /index.html { add_header Cache-Control "no-cache"; }`,
        ),
      ],
      [
        blk(`<h3>Memory leak prevention</h3>
• Leaks come from things that outlive a component: <b>subscriptions</b> to never-completing streams, <b>timers</b> (<code>setInterval</code>), <b>event listeners</b> (<code>window</code>/<code>document</code>), <b>closures</b> in singletons holding component references, third-party widgets not destroyed, detached DOM.<br>
• Fixes: <code>async</code> pipe/<code>toSignal</code>, <code>takeUntilDestroyed()</code>, <code>DestroyRef.onDestroy</code>, <code>ngOnDestroy</code> cleanup, <code>@HostListener</code>/<code>Renderer2.listen</code> (auto-removed) instead of raw <code>addEventListener</code>, <code>destroy()</code> third-party instances.<br>
• Find leaks with Chrome DevTools <b>Memory</b>: take heap snapshots before and after navigating away and back; look for retained component instances and detached DOM nodes.`,
          `@Component({ selector: 'app-live-chart', standalone: true, template: '<canvas #c></canvas>' })
export class LiveChartComponent {
  private destroyRef = inject(DestroyRef);
  private ticks = inject(TickService);
  chart = viewChild.required<ElementRef<HTMLCanvasElement>>('c');

  constructor() {
    this.ticks.stream$.pipe(takeUntilDestroyed()).subscribe(t => this.draw(t));        // auto-unsubscribe

    const onResize = () => this.resize();
    window.addEventListener('resize', onResize);
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));    // remove the listener

    const id = setInterval(() => this.poll(), 5000);
    this.destroyRef.onDestroy(() => clearInterval(id));

    afterNextRender(() => {
      const chartInstance = new ThirdPartyChart(this.chart().nativeElement);
      this.destroyRef.onDestroy(() => chartInstance.destroy());                          // release the library
    });
  }
}
// Leak: a root service stores callbacks from components and never removes them`,
        ),
      ],
      [
        blk(`<h3>Change detection tuning and production builds</h3>
• <b>OnPush + signals</b>, <code>@for</code> with <code>track</code>, no heavy template methods, <code>cdk-virtual-scroll-viewport</code> for long lists, <code>NgZone.runOutsideAngular</code> for high-frequency non-UI work, zoneless mode, <code>@defer</code> for non-critical UI.<br>
• <b>Production build</b>: <code>ng build</code> (production is the default configuration) enables AOT, tree shaking, minification, dead-code elimination, hashed file names and optimised fonts/CSS. Never deploy <code>ng serve</code> output.<br>
• <b>Environment configuration</b>: file replacement or <code>define</code>; check <code>isDevMode()</code>; remove console noise; upload source maps to your error tracker but do not serve them publicly.<br>
• Add a <b>service worker</b> (<code>ng add @angular/pwa</code>) for caching and offline support; test with Lighthouse.`,
          `ng build                                         # production by default: AOT, minify, hash, tree-shake
ng build --configuration development              # fast, unoptimised, for debugging
ng build --source-map=hidden                      # maps generated but not referenced; upload to Sentry

// main.ts
if (!isDevMode()) { /* attach monitoring */ }

// Quick Lighthouse pass
// npx serve -s dist/course-portal/browser
// Chrome DevTools -> Lighthouse -> Performance, Accessibility, Best Practices, SEO

// Typical targets: LCP < 2.5 s, INP < 200 ms, CLS < 0.1, initial JS < 250 kB gzipped`,
        ),
      ],
      [
        ['How do you reduce an Angular bundle size?', 'Lazy-load routes, defer heavy parts with @defer, import only what you use (tree shaking), replace large libraries, set budgets, analyse bundles with a visualiser, and serve compressed, cached assets.'],
        ['What are common causes of memory leaks in Angular?', 'Unsubscribed long-lived observables, uncleared timers, listeners added to window/document and never removed, services retaining component callbacks, and third-party widgets that are not destroyed.'],
        ['What does a production build do?', 'ng build runs AOT compilation, tree shaking, minification, dead-code elimination and output hashing, and applies the production configuration (environment values, budgets); it should be what you deploy.'],
      ],
    ),
  ]),

  ng(13, 'Testing and Deployment', 'Production', [
    topic(
      'ng-testing-units',
      'Unit, Component, Service and HTTP Testing',
      [
        blk(`<h3>What to test and how</h3>
• Angular's <b>TestBed</b> creates a testing module/environment for components and services. Test <b>behaviour</b>: what the user sees and what a service returns, not private implementation.<br>
• <b>Service tests</b> are plain unit tests: create the service (<code>TestBed.inject</code>), call methods and assert. Provide <b>fakes</b> for dependencies: <code>{ provide: CourseApi, useValue: fakeApi }</code>.<br>
• Pure code (pipes, validators, reducers, utility functions) needs no TestBed: instantiate and call.`,
          `// file-size.pipe.spec.ts : a pure pipe needs no TestBed
describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();
  it('formats bytes', () => { expect(pipe.transform(512)).toBe('512 B'); });
  it('formats kilobytes', () => { expect(pipe.transform(2048)).toBe('2.0 KB'); });
  it('handles null', () => { expect(pipe.transform(null)).toBe(''); });
});

// cart.service.spec.ts
describe('CartService', () => {
  let service: CartService;
  beforeEach(() => { TestBed.configureTestingModule({}); service = TestBed.inject(CartService); });

  it('adds items and computes the total', () => {
    service.add({ id: 1, name: 'Angular', price: 1999, qty: 1 });
    service.add({ id: 2, name: 'Spring', price: 2499, qty: 2 });
    expect(service.count()).toBe(3);
    expect(service.total()).toBe(6997);
  });
});`,
        ),
      ],
      [
        blk(`<h3>Component testing</h3>
• Use <code>TestBed.configureTestingModule({ imports: [Component] })</code> (standalone), <code>createComponent</code>, then interact through the <b>DOM</b>: <code>fixture.nativeElement.querySelector(...)</code>, <code>click()</code>, and assert on text and attributes.<br>
• Set signal inputs with <code>fixture.componentRef.setInput('title', 'x')</code>; call <code>fixture.detectChanges()</code> (or <code>await fixture.whenStable()</code>) after changes.<br>
• Replace children and services with fakes for isolation; use <code>provideRouter([])</code>, <code>provideHttpClient()</code> + <code>provideHttpClientTesting()</code> where needed. Prefer user-visible assertions (<code>textContent</code>, roles) over internal fields.`,
          `describe('CourseCardComponent', () => {
  let fixture: ComponentFixture<CourseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CourseCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(CourseCardComponent);
  });

  it('shows the title and a formatted price', () => {
    fixture.componentRef.setInput('title', 'Angular Essentials');
    fixture.componentRef.setInput('price', 1999);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h3')?.textContent).toContain('Angular Essentials');
    expect(el.textContent).toContain('1999');
  });

  it('emits when the enroll button is clicked', () => {
    fixture.componentRef.setInput('title', 'Angular');
    fixture.detectChanges();
    const emitted: string[] = [];
    fixture.componentInstance.enrolled.subscribe(v => emitted.push(v));
    fixture.nativeElement.querySelector('button.enroll').click();
    expect(emitted).toEqual(['Angular']);
  });
});

// with a fake service
beforeEach(() => TestBed.configureTestingModule({
  imports: [CourseListComponent],
  providers: [{ provide: CourseApi, useValue: { list: () => of({ content: [{ id: 1, title: 'Angular' }], totalElements: 1 }) } }],
}));`,
        ),
      ],
      [
        blk(`<h3>HTTP testing</h3>
• Use <code>provideHttpClient()</code> + <code>provideHttpClientTesting()</code> and inject <code>HttpTestingController</code>. It captures requests so you can assert on URL/method/headers/body and <b>flush</b> fake responses (or errors) without a server.<br>
• Always call <code>httpMock.verify()</code> in <code>afterEach</code> to fail on unexpected or unflushed requests.<br>
• Test interceptors through <code>HttpClient</code>; test error handling by flushing a status like 500 or a network error (<code>req.error(new ProgressEvent('error'))</code>).<br>
• For <code>fakeAsync</code> tests use <code>tick()</code> to advance timers (debounce, retry delays).`,
          `describe('CourseApi', () => {
  let api: CourseApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(CourseApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());                                          // no unexpected requests

  it('GET /api/courses with query params', () => {
    let result: Page<Course> | undefined;
    api.list('ang', 1).subscribe(r => (result = r));

    const req = http.expectOne(r => r.url === '/api/courses' && r.params.get('q') === 'ang' && r.params.get('page') === '1');
    expect(req.request.method).toBe('GET');
    req.flush({ content: [{ id: 1, title: 'Angular' }], totalElements: 1, number: 1, size: 10 });
    expect(result?.content[0].title).toBe('Angular');
  });

  it('POST sends the body and returns the created course', () => {
    api.create({ title: 'New', price: 100 }).subscribe(c => expect(c.id).toBe(7));
    const req = http.expectOne('/api/courses');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'New', price: 100 });
    req.flush({ id: 7, title: 'New', price: 100 }, { status: 201, statusText: 'Created' });
  });

  it('propagates server errors', () => {
    let status = 0;
    api.get(99).subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });
    http.expectOne('/api/courses/99').flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    expect(status).toBe(404);
  });
});`,
        ),
      ],
      [
        ['What does HttpTestingController do?', 'It intercepts HttpClient requests in tests so you can assert on the request (URL, method, body, headers) and respond with fake data or errors using flush, without a real server. Call verify() to ensure no unexpected requests remain.'],
        ['How do you test a component with a service dependency?', 'Provide a fake for the service in the TestBed providers (useValue/useClass), create the component, trigger change detection and assert on the rendered DOM.'],
        ['Why test pipes and validators without TestBed?', 'They are plain classes/functions with no framework dependencies, so instantiating and calling them directly is faster and simpler.'],
      ],
    ),
    topic(
      'ng-testing-runners',
      'Test Runners: Jasmine and Karma, Vitest and Modern Testing Practice',
      [
        blk(`<h3>Jasmine and Karma (the classic setup)</h3>
• <b>Jasmine</b> is the test framework: <code>describe</code>, <code>it</code>, <code>beforeEach</code>, <code>expect(...).toBe/toEqual/toContain/toThrow</code>, spies (<code>jasmine.createSpyObj</code>, <code>spyOn</code>). <b>Karma</b> is the runner that launches real browsers (Chrome) and reports results. <code>ng test</code> runs them in watch mode.<br>
• Generated <code>*.spec.ts</code> files sit next to the code. Run once for CI: <code>ng test --watch=false --browsers=ChromeHeadless --code-coverage</code>.<br>
• Karma is in <b>maintenance/deprecated status</b>; new Angular projects are moving to Vitest (stable in recent versions) or Jest.`,
          `import { fakeAsync, tick } from '@angular/core/testing';

describe('Search', () => {
  it('uses a spy for a dependency', () => {
    const api = jasmine.createSpyObj<CourseApi>('CourseApi', ['search']);
    api.search.and.returnValue(of([{ id: 1, title: 'Angular' } as Course]));
    const comp = new SearchComponent(api);
    comp.run('ang');
    expect(api.search).toHaveBeenCalledOnceWith('ang');
    expect(comp.results().length).toBe(1);
  });

  it('debounces typing', fakeAsync(() => {
    const spy = jasmine.createSpy('search');
    const input$ = new Subject<string>();
    input$.pipe(debounceTime(300)).subscribe(spy);
    input$.next('a'); input$.next('an'); input$.next('ang');
    tick(300);                                           // advance the virtual clock
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('ang');
  }));
});

// karma.conf.js: headless Chrome for CI
// browsers: ['ChromeHeadlessCI'], customLaunchers: { ChromeHeadlessCI: { base: 'ChromeHeadless', flags: ['--no-sandbox'] } }`,
        ),
      ],
      [
        blk(`<h3>Vitest</h3>
• <b>Vitest</b> is a fast, Vite-based runner with a Jest-compatible API (<code>describe</code>, <code>it</code>, <code>expect</code>, <code>vi.fn()</code>, <code>vi.spyOn</code>, <code>vi.useFakeTimers()</code>). Runs in Node with jsdom or in a real browser (browser mode, Playwright). Quick startup, instant watch mode, snapshot testing and built-in coverage (v8).<br>
• Recent Angular versions support it through the official <code>@angular/build:unit-test</code> builder (<code>runner: "vitest"</code>) and the default for new projects moves in that direction; in older versions use community builders (<code>@analogjs/vitest-angular</code>).<br>
• Test code mostly stays the same: TestBed, <code>HttpTestingController</code> and <code>fixture</code> APIs are unchanged; only matchers/spies change (<code>jasmine.createSpy</code> becomes <code>vi.fn()</code>).`,
          `// angular.json (test target using the Vitest runner)
// "test": { "builder": "@angular/build:unit-test", "options": { "runner": "vitest", "buildTarget": "::development" } }

// course.service.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('CourseStore', () => {
  const api = { list: vi.fn() };
  beforeEach(() => {
    api.list.mockReset();
    TestBed.configureTestingModule({ providers: [{ provide: CourseApi, useValue: api }] });
  });

  it('loads courses', () => {
    api.list.mockReturnValue(of([{ id: 1, title: 'Angular' }]));
    const store = TestBed.inject(CourseStore);
    store.load();
    expect(store.items()).toHaveLength(1);
    expect(api.list).toHaveBeenCalledTimes(1);
  });

  it('shows an error state', () => {
    api.list.mockReturnValue(throwError(() => new Error('boom')));
    const store = TestBed.inject(CourseStore);
    store.load();
    expect(store.error()).toBe('Could not load courses');
  });
});

// Fake timers
it('debounces', () => {
  vi.useFakeTimers();
  const fn = vi.fn(); const d = debounce(fn, 300);
  d(); d(); d();
  vi.advanceTimersByTime(300);
  expect(fn).toHaveBeenCalledOnce();
  vi.useRealTimers();
});`,
        ),
      ],
      [
        blk(`<h3>Test strategy, harnesses and end-to-end tests</h3>
• <b>Testing pyramid</b>: many fast unit tests (services, pipes, validators, reducers, stores), fewer component tests, a small number of <b>end-to-end</b> tests (Playwright or Cypress) for critical journeys such as login, enrol, pay.<br>
• Use <b>component harnesses</b> (<code>@angular/cdk/testing</code>, Angular Material harnesses) to interact with widgets without depending on markup details.<br>
• Test through the public API and the DOM; avoid brittle <code>fixture.componentInstance.privateField</code> access. Prefer <code>data-testid</code> or roles for selectors.<br>
• Run lint, type-check, unit tests, coverage and build in <b>CI</b> on every pull request. Use coverage to find gaps, not as a target.`,
          `// Component harness (Angular Material)
const loader = TestbedHarnessEnvironment.loader(fixture);
const button = await loader.getHarness(MatButtonHarness.with({ text: 'Enroll' }));
await button.click();
expect(await button.isDisabled()).toBe(true);

// Playwright end-to-end
// import { test, expect } from '@playwright/test';
// test('learner can log in and open a course', async ({ page }) => {
//   await page.goto('/login');
//   await page.getByLabel('Email').fill('asha@example.com');
//   await page.getByLabel('Password').fill('secret123');
//   await page.getByRole('button', { name: 'Log in' }).click();
//   await expect(page).toHaveURL(/dashboard/);
//   await page.getByRole('link', { name: 'Angular Essentials' }).click();
//   await expect(page.getByRole('heading', { name: 'Angular Essentials' })).toBeVisible();
// });`,
        ),
      ],
      [
        ['Jasmine/Karma vs Vitest?', 'Jasmine is the framework and Karma the browser runner of the classic Angular setup. Vitest is a faster Vite-based runner with a Jest-like API that newer Angular versions support officially; TestBed code stays almost the same.'],
        ['What is fakeAsync used for?', 'It runs test code in a controlled zone where timers and promises are virtual; tick() advances the clock so you can test debounce, delays and retries deterministically without real waiting.'],
        ['What is a component harness?', 'An abstraction (from Angular CDK) that exposes a component\'s behaviour in test code (click, getText, isDisabled) so tests do not depend on internal markup and survive refactoring.'],
      ],
    ),
    topic(
      'ng-build-deploy',
      'Angular CLI Build, Environments, Ubuntu and Nginx Deployment, CI/CD',
      [
        blk(`<h3>Build and environment configuration</h3>
• <code>ng build</code> compiles to <code>dist/&lt;project&gt;/browser</code> (static files; with SSR also <code>/server</code>). Build configurations in <code>angular.json</code> (production, staging) control optimisation, budgets, source maps and <b>file replacements</b> for environment files.<br>
• Generate environment files: <code>ng generate environments</code> → <code>src/environments/environment.ts</code> (dev) and <code>environment.prod.ts</code>. Everything in them is <b>public</b>: never store secrets; use them for API URLs and feature flags.<br>
• For "build once, deploy anywhere" load a runtime <code>config.json</code> at start (<code>provideAppInitializer</code>), so the same artifact works in test, staging and production.`,
          `// src/environments/environment.ts
export const environment = { production: false, apiUrl: 'http://localhost:8080/api', sentryDsn: '' };
// src/environments/environment.prod.ts
export const environment = { production: true, apiUrl: '/api', sentryDsn: 'https://publicKey@o0.ingest.sentry.io/0' };

// angular.json
// "configurations": {
//   "production": { "fileReplacements": [{ "replace": "src/environments/environment.ts", "with": "src/environments/environment.prod.ts" }], "outputHashing": "all" },
//   "staging":    { "fileReplacements": [...staging file...], "optimization": true, "sourceMap": true }
// }
// ng build                          -> production by default
// ng build --configuration staging

// Runtime configuration (same build for every environment)
export interface RuntimeConfig { apiUrl: string; environment: string }
export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('RUNTIME_CONFIG');
provideAppInitializer(async () => {
  const cfg = await fetch('/config.json', { cache: 'no-store' }).then(r => r.json());
  inject(ConfigStore).set(cfg);
})`,
        ),
      ],
      [
        blk(`<h3>Ubuntu and Nginx</h3>
• Static hosting: copy <code>dist/.../browser</code> to <code>/var/www/javaschoollab</code>; Nginx serves it, falls back to <code>index.html</code> for client-side routes, caches hashed assets and never caches <code>index.html</code>, compresses, and <b>proxies <code>/api</code> to Spring Boot</b> (same origin: no CORS).<br>
• HTTPS with Let's Encrypt (<code>certbot --nginx</code>); firewall (<code>ufw allow 'Nginx Full'</code>); run Spring Boot as a <b>systemd</b> service bound to localhost.<br>
• Release safely: upload to a new release directory, switch a <b>symlink</b>, reload Nginx; keep the previous release for instant rollback.`,
          `# build and upload
ng build
rsync -az --delete dist/course-portal/browser/ deploy@server:/var/www/releases/2026-10-20/
ssh deploy@server 'ln -sfn /var/www/releases/2026-10-20 /var/www/current && sudo nginx -t && sudo systemctl reload nginx'

# /etc/nginx/sites-available/javaschoollab
server {
  listen 80;
  server_name app.javaschoollab.com;
  root /var/www/current;
  index index.html;
  gzip on; gzip_types text/css application/javascript application/json image/svg+xml;

  location / { try_files $uri $uri/ /index.html; }                       # Angular router fallback
  location ~* \\.(js|css|woff2|avif|webp|svg)$ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location = /index.html { add_header Cache-Control "no-cache"; }
  location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  add_header Content-Security-Policy "default-src 'self'; frame-ancestors 'none'" always;
  add_header X-Content-Type-Options nosniff always;
}
# sudo certbot --nginx -d app.javaschoollab.com        (HTTPS + renewal)
# rollback: ln -sfn /var/www/releases/<previous> /var/www/current && sudo systemctl reload nginx

# Docker alternative
# FROM node:22-alpine AS build  ... RUN npm ci && npx ng build
# FROM nginx:1.27-alpine  COPY --from=build /app/dist/course-portal/browser /usr/share/nginx/html`,
        ),
      ],
      [
        blk(`<h3>CI/CD with GitHub Actions or Jenkins</h3>
• <b>CI</b>: on every push/pull request run install (<code>npm ci</code>), lint, type-check, unit tests (headless), build. <b>CD</b>: on merge to <code>main</code> build the artifact and deploy to staging, then to production (manual approval).<br>
• <b>GitHub Actions</b>: YAML workflows in <code>.github/workflows</code>, secrets in repository/environment secrets. <b>Jenkins</b>: a <code>Jenkinsfile</code> (declarative pipeline) running on your own agents, popular in Java shops that already run Jenkins for Spring Boot.<br>
• Keep pipelines fast (cache <code>node_modules</code>), fail early, never print secrets, and make deployments repeatable and reversible. Version builds and expose the version for support.`,
          `# .github/workflows/angular.yml
name: Angular CI/CD
on:
  push: { branches: [main] }
  pull_request:
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --watch=false --browsers=ChromeHeadless --code-coverage
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist/course-portal/browser }
  deploy:
    needs: build-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - name: Deploy
        run: |
          echo "\${{ secrets.DEPLOY_KEY }}" > key && chmod 600 key
          rsync -az --delete -e "ssh -i key -o StrictHostKeyChecking=accept-new" dist/ deploy@app.javaschoollab.com:/var/www/releases/\${{ github.sha }}/
          ssh -i key deploy@app.javaschoollab.com "ln -sfn /var/www/releases/\${{ github.sha }} /var/www/current && sudo systemctl reload nginx"

// Jenkinsfile (declarative)
// pipeline {
//   agent { docker { image 'node:22' } }
//   stages {
//     stage('Install') { steps { sh 'npm ci' } }
//     stage('Test')    { steps { sh 'npm test -- --watch=false --browsers=ChromeHeadless' } }
//     stage('Build')   { steps { sh 'npm run build' } }
//     stage('Deploy')  { when { branch 'main' } steps { sshagent(['deploy-key']) { sh 'rsync -az --delete dist/ deploy@server:/var/www/current/' } } }
//   }
//   post { failure { mail to: 'team@javaschoollab.com', subject: 'Build failed', body: env.BUILD_URL } }
// }`,
        ),
      ],
      [
        ['Why must environment.ts not contain secrets?', 'Its values are compiled into the JavaScript bundle that every visitor downloads. Keep secrets on the server and put only public configuration in the Angular app.'],
        ['Why does Nginx need try_files $uri /index.html for an Angular app?', 'Client-side routes such as /courses/5 are not files on the server. The fallback returns index.html so Angular\'s router can render the route instead of a 404 on refresh or deep links.'],
        ['What is the difference between CI and CD?', 'CI automatically builds and tests every change. CD automatically delivers successful builds to staging or production, often with an approval gate for production.'],
      ],
    ),
  ]),
];

export const angularRoadmap3: SubTopic[] = [...angularRoadmap3Base, ...angularExamples];
