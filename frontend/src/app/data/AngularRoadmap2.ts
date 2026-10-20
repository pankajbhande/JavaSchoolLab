// Angular roadmap, part 2: sections 5-9 (services and dependency injection, routing, forms, HTTP and API integration, RxJS).
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const ng = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('ng', n, title, priority, topics);

export const angularRoadmap2: SubTopic[] = [
  ng(5, 'Services and Dependency Injection', 'Essential', [
    topic(
      'ng-services-di',
      'Services, Dependency Injection and Providers',
      [
        blk(`<h3>Why services?</h3>
• Components should be thin: they display data and handle user events. <b>Services</b> hold reusable logic and data access: HTTP calls, authentication, caching, shared state, logging, business rules. A service is a plain TypeScript class marked <code>@Injectable()</code>.<br>
• <b>Dependency injection (DI)</b>: a component <em>asks</em> for a service and Angular's injector creates and supplies it. This is the same idea as Spring's IoC container with <code>@Autowired</code> constructor injection.<br>
• Generate with <code>ng g service core/course</code>.`,
          `// course.service.ts
import { Injectable, signal } from '@angular/core';
import { Course } from './course.model';

@Injectable({ providedIn: 'root' })          // one shared instance for the whole app
export class CourseService {
  private readonly _courses = signal<Course[]>([
    { id: 1, title: 'Angular Essentials', price: 1999 },
    { id: 2, title: 'Spring Boot REST', price: 2499 },
  ]);
  readonly courses = this._courses.asReadonly();

  add(course: Course) { this._courses.update(list => [...list, course]); }
  byId(id: number) { return this._courses().find(c => c.id === id); }
}

// course-list.component.ts
import { Component, inject } from '@angular/core';
@Component({
  selector: 'app-course-list', standalone: true,
  template: '@for (c of service.courses(); track c.id) { <p>{{ c.title }}</p> }',
})
export class CourseListComponent {
  protected readonly service = inject(CourseService);     // Angular supplies the instance
}`,
        ),
      ],
      [
        blk(`<h3>Providers: telling the injector how to create things</h3>
• A <b>provider</b> maps a <b>token</b> (usually the class) to how to build the value. Forms: <code>useClass</code> (another class), <code>useValue</code> (a constant), <code>useFactory</code> (a function, with <code>deps</code>), <code>useExisting</code> (an alias).<br>
• Where to register: <code>@Injectable({ providedIn: 'root' })</code> (app-wide, tree-shakable: preferred), <code>providers</code> in <code>app.config.ts</code> (<code>bootstrapApplication</code>), in a route's <code>providers</code>, or in a component's <code>providers</code> (new instance per component).<br>
• Non-class values use an <b>InjectionToken</b> (like a qualified bean name): config objects, API URLs, feature flags.`,
          `import { InjectionToken, inject } from '@angular/core';

export interface AppConfig { apiUrl: string; pageSize: number }
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_CONFIG, useValue: { apiUrl: '/api', pageSize: 10 } },
    { provide: Logger, useClass: environment.production ? RemoteLogger : ConsoleLogger },
    { provide: Clock, useFactory: () => new SystemClock(inject(APP_CONFIG).apiUrl) },
  ],
};

// anywhere
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private config = inject(APP_CONFIG);
  url(path: string) { return this.config.apiUrl + path; }
}

// Swap implementations in tests: { provide: CourseService, useClass: FakeCourseService }`,
        ),
      ],
      [
        blk(`<h3>Spring vs Angular DI, side by side</h3>
<table ${TABLE}>
<tr><th>Concept</th><th>Spring</th><th>Angular</th></tr>
<tr><td>Declare a managed class</td><td><code>@Service</code>, <code>@Component</code></td><td><code>@Injectable()</code></td></tr>
<tr><td>Register</td><td>Component scan / <code>@Bean</code></td><td><code>providedIn</code>, <code>providers</code></td></tr>
<tr><td>Request a dependency</td><td>Constructor injection</td><td><code>inject(Type)</code> or constructor parameter</td></tr>
<tr><td>Qualified / named bean</td><td><code>@Qualifier</code></td><td><code>InjectionToken</code></td></tr>
<tr><td>Scope</td><td>singleton, prototype, request</td><td>root singleton, per-route, per-component</td></tr>
<tr><td>Test double</td><td><code>@MockBean</code></td><td><code>{ provide: X, useValue/useClass }</code></td></tr>
</table>
• Programming against the DI system, not <code>new Service()</code>, is what makes code testable and replaceable.`),
      ],
      [
        ['What is dependency injection in Angular?', 'A design pattern where a class declares what it needs and Angular\'s injector creates and supplies it, instead of the class creating dependencies itself. It enables loose coupling and easy testing.'],
        ['What does providedIn: root do?', 'It registers the service with the root injector as an application-wide singleton, and makes it tree-shakable: it is removed from the bundle if nothing injects it.'],
        ['When do you use an InjectionToken?', 'For dependencies that are not classes or that need a named key: configuration objects, API URLs, interfaces (which do not exist at runtime) or multiple implementations.'],
      ],
    ),
    topic(
      'ng-injector-hierarchy',
      'Hierarchical Injectors, Singleton Services and inject()',
      [
        blk(`<h3>The injector tree</h3>
• Angular has a <b>hierarchy of injectors</b>: the <b>environment injector</b> tree (root, route-level, set by <code>providers</code>) and the <b>element injector</b> tree (one per component/directive in the DOM). A lookup starts at the requesting component and walks <b>up</b> until a provider is found, else throws <code>NullInjectorError</code>.<br>
• Where you provide a service decides its <b>scope and lifetime</b>: root = one instance for the whole app; route providers = one per lazy route; component <code>providers</code> = a new instance for each component instance (destroyed with it).`,
          `@Injectable()                                  // note: no providedIn
export class WizardState {
  step = signal(1);
  next() { this.step.update(s => s + 1); }
}

@Component({
  selector: 'app-wizard',
  standalone: true,
  providers: [WizardState],                      // a NEW WizardState per <app-wizard>, shared with its children
  template: '<app-step /> <app-summary />',
})
export class WizardComponent {}

@Component({ selector: 'app-step', standalone: true, template: '<button (click)="state.next()">Next ({{ state.step() }})</button>' })
export class StepComponent { state = inject(WizardState); }   // finds WizardState from the nearest parent wizard

// Two <app-wizard> instances on one page each get their own state. A root singleton would be shared by both.`,
        ),
      ],
      [
        blk(`<h3>Singleton services and scoping options</h3>
• <b>Singleton</b>: <code>providedIn: 'root'</code> (or listed once in <code>app.config.ts</code>). Use for auth state, API clients, caches, app-wide settings.<br>
• <b>Feature-scoped</b>: provide in a route (<code>{ path: 'admin', providers: [AdminStore], loadChildren: ... }</code>) so the service lives while the feature does.<br>
• <b>Component-scoped</b>: <code>providers</code> or <code>viewProviders</code> on the component for state that must not leak (forms wizard, dialog state, per-row editors).<br>
• Beware of accidentally creating a second instance by providing a root service again in a component's <code>providers</code>.<br>
• Resolution modifiers: <code>inject(Token, { optional: true })</code>, <code>{ self: true }</code>, <code>{ skipSelf: true }</code>, <code>{ host: true }</code>.`,
          `// Route-scoped service
export const routes: Routes = [
  { path: 'admin', providers: [AdminStore], loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },
];

// Optional dependency: no error if nobody provided it
const analytics = inject(AnalyticsService, { optional: true });
analytics?.track('page_view');

// Look in the PARENT injector only (decorator-style use cases)
const parentConfig = inject(FormConfig, { skipSelf: true, optional: true });`,
        ),
      ],
      [
        blk(`<h3>The inject() function</h3>
• <code>inject(Token)</code> returns a dependency and works in an <b>injection context</b>: field initialisers, constructors, factory functions, functional guards/resolvers/interceptors, and <code>runInInjectionContext()</code>. It <b>cannot</b> be called later inside a method or callback.<br>
• Advantages over constructor injection: less boilerplate, works in functions (guards, interceptors), no constructor-parameter inheritance problems, enables reusable "inject helper" functions.<br>
• Use <code>runInInjectionContext(injector, () =&gt; ...)</code> when you must call it outside a context, after capturing <code>inject(Injector)</code>.`,
          `import { Component, Injector, inject, runInInjectionContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({ selector: 'app-demo', standalone: true, template: '' })
export class DemoComponent {
  private http = inject(HttpClient);          // field initialiser: valid injection context
  private router = inject(Router);
  private injector = inject(Injector);

  constructor() { /* inject() also works here */ }

  later() {
    // inject(Router);                         // Error: inject() must be called from an injection context
    runInInjectionContext(this.injector, () => { const r = inject(Router); console.log(r.url); });
  }
}

// A reusable helper built on inject()
export function injectRouteParam(name: string) {
  const route = inject(ActivatedRoute);
  return toSignal(route.paramMap.pipe(map(p => p.get(name))));
}
// id = injectRouteParam('id');          // in any component`,
        ),
      ],
      [
        ['What are hierarchical injectors?', 'Injectors arranged in a tree (environment injectors and per-component element injectors). A dependency lookup starts at the requesting node and moves up until a provider is found, so providing a service at different levels controls its scope and number of instances.'],
        ['How do you create a new service instance per component?', 'Add the service to the component\'s providers array (and do not use providedIn root for that class). Each component instance, and its children, then get their own instance.'],
        ['What is an injection context?', 'The synchronous execution phases in which inject() is allowed: constructors, field initialisers, provider factories and functional guards/interceptors/resolvers. It is not valid inside later callbacks without runInInjectionContext.'],
      ],
    ),
    topic(
      'ng-service-communication',
      'Service-to-Service Communication and Shared State',
      [
        blk(`<h3>Services injecting services</h3>
• Services can inject other services, forming a layered design: <b>data access</b> (<code>CourseApi</code> uses <code>HttpClient</code>), <b>domain/store</b> (<code>CourseStore</code> uses <code>CourseApi</code>), <b>facade</b> or UI services (<code>NotificationService</code>).<br>
• Keep dependencies <b>one-directional</b>. Circular dependencies (<code>A</code> injects <code>B</code> injects <code>A</code>) throw <code>NG0200</code>; fix by extracting the shared part into a third service or by communicating through events/signals.`,
          `@Injectable({ providedIn: 'root' })
export class CourseApi {                                    // data access only
  private http = inject(HttpClient);
  list() { return this.http.get<Course[]>('/api/courses'); }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _messages = signal<string[]>([]);
  readonly messages = this._messages.asReadonly();
  show(text: string) { this._messages.update(m => [...m, text]); setTimeout(() => this.dismiss(text), 4000); }
  dismiss(text: string) { this._messages.update(m => m.filter(x => x !== text)); }
}

@Injectable({ providedIn: 'root' })
export class CourseStore {                                  // depends on the two services above
  private api = inject(CourseApi);
  private notify = inject(NotificationService);
  readonly courses = signal<Course[]>([]);
  load() {
    this.api.list().subscribe({
      next: c => this.courses.set(c),
      error: () => this.notify.show('Could not load courses'),
    });
  }
}`,
        ),
      ],
      [
        blk(`<h3>Sharing state across components</h3>
• A root service holding state is the Angular way to share data between unrelated components. Expose <b>read-only</b> signals (or Observables) and mutate only through methods, so changes are traceable.<br>
• <b>Signals</b> (<code>signal</code>, <code>computed</code>) are the simplest option; <b>BehaviorSubject</b> + <code>asObservable()</code> suits stream-heavy code; a store library (NgRx) suits large apps.<br>
• <b>Events</b> between services: a <code>Subject</code> acts as a message bus (<code>events$</code>); use sparingly because implicit flows are hard to follow.`,
          `@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();                 // consumers cannot call set()
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.roles.includes('ADMIN') ?? false);
  setUser(u: User | null) { this._user.set(u); }
}

// Header and Sidebar both react to the same state without knowing each other
// @if (auth.isLoggedIn()) { <a routerLink="/dashboard">{{ auth.user()?.name }}</a> }

// Event bus (use sparingly)
@Injectable({ providedIn: 'root' })
export class EventBus {
  private subject = new Subject<{ type: string; payload?: unknown }>();
  readonly events$ = this.subject.asObservable();
  emit(type: string, payload?: unknown) { this.subject.next({ type, payload }); }
  on(type: string) { return this.events$.pipe(filter(e => e.type === type)); }
}`,
        ),
      ],
      [
        blk(`<h3>Design guidelines</h3>
• <b>Single responsibility</b>: one reason to change per service. Name by role: <code>*Api</code>/<code>*Client</code> (HTTP), <code>*Store</code>/<code>*State</code> (state), <code>*Service</code> (logic).<br>
• <b>No UI in services</b> (no DOM access); use components or Renderer for that. Keep side effects in well-named methods.<br>
• <b>Immutability</b>: never mutate arrays/objects held in signals; produce new ones with <code>update(x =&gt; [...x, item])</code>.<br>
• <b>Testing</b>: because everything is injected, replace collaborators with fakes (<code>{ provide: CourseApi, useValue: fakeApi }</code>).<br>
• Prefer <b>facade services</b> to give components one simple API over several back-end services.`,
          `// Facade: one entry point for the dashboard component
@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private courses = inject(CourseStore);
  private progress = inject(ProgressStore);
  private auth = inject(AuthService);

  readonly vm = computed(() => ({
    user: this.auth.user(),
    courses: this.courses.courses(),
    completed: this.progress.completedCount(),
  }));
  refresh() { this.courses.load(); this.progress.load(); }
}
// component: protected facade = inject(DashboardFacade);   template: {{ facade.vm().user?.name }}`,
        ),
      ],
      [
        ['How can two unrelated components share data?', 'Through an injectable singleton service that holds the state (signals or a BehaviorSubject) and exposes it read-only; both components inject the same instance.'],
        ['What causes a circular dependency error in DI and how do you fix it?', 'Two services inject each other (NG0200). Extract the shared logic into a third service, or restructure so the dependency flows one way (for example using events or signals).'],
        ['Why expose asReadonly() or asObservable() from a service?', 'To prevent consumers from changing the state directly. Only the service\'s own methods can update it, which keeps state changes centralised and traceable.'],
      ],
    ),
  ]),

  ng(6, 'Routing', 'Core', [
    topic(
      'ng-router-config',
      'Angular Router: Configuration, Parameters, Query Parameters and 404',
      [
        blk(`<h3>Routes and navigation</h3>
• The <b>Router</b> maps URLs to components so an SPA behaves like a multi-page site without reloads. Define a <b>route table</b> (<code>Routes</code>), register it with <code>provideRouter(routes)</code>, render the matched component in <code>&lt;router-outlet&gt;</code> and navigate with <code>routerLink</code> or <code>Router.navigate()</code>.<br>
• Route fields: <code>path</code>, <code>component</code>, <code>redirectTo</code> + <code>pathMatch</code>, <code>title</code>, <code>data</code>, <code>children</code>, <code>canActivate</code>, <code>resolve</code>, <code>loadComponent</code>/<code>loadChildren</code>.<br>
• A wildcard route <code>**</code> placed <b>last</b> handles unknown URLs (404).`,
          `// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
  { path: 'courses', component: CourseListComponent, title: 'Courses' },
  { path: 'courses/:id', component: CourseDetailComponent, title: 'Course details' },
  { path: 'about', component: AboutComponent },
  { path: '**', component: NotFoundComponent, title: 'Page not found' },     // MUST be last
];

// app.component.ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: \`
    <nav>
      <a routerLink="/courses" routerLinkActive="active">Courses</a>
      <a [routerLink]="['/courses', 42]">Course 42</a>
      <a routerLink="/about" routerLinkActive="active" ariaCurrentWhenActive="page">About</a>
    </nav>
    <router-outlet />\`,
})
export class AppComponent {}`,
        ),
      ],
      [
        blk(`<h3>Route parameters and query parameters</h3>
• <b>Path parameters</b> (<code>:id</code>) identify a resource. Read them with <code>ActivatedRoute</code>, or (since v16) bind them straight to <b>component inputs</b> with <code>withComponentInputBinding()</code>: <code>id = input.required&lt;string&gt;()</code>.<br>
• <b>Query parameters</b> (<code>?q=angular&amp;page=2</code>) hold optional state like filters, sort and page: <code>queryParams</code> in <code>routerLink</code>/<code>navigate</code>, read via <code>queryParamMap</code> or inputs. Keeping state in the URL makes it shareable and refresh-safe.<br>
• Params are <b>strings</b>: convert numbers. They are observables because the same component instance is reused when only the parameter changes.`,
          `// app.config.ts
provideRouter(routes, withComponentInputBinding())

// course-detail.component.ts : path and query params become inputs
@Component({ selector: 'app-course-detail', standalone: true, templateUrl: './course-detail.component.html' })
export class CourseDetailComponent {
  id = input.required<string>();            // from /courses/:id
  tab = input<string>('overview');          // from ?tab=reviews
  private api = inject(CourseApi);
  course = toSignal(toObservable(this.id).pipe(switchMap(id => this.api.get(Number(id)))));
}

// course-list.component.ts : navigation with query params
export class CourseListComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  search(q: string, page = 0) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { q, page }, queryParamsHandling: 'merge' });
  }
}
// <a [routerLink]="['/courses', c.id]" [queryParams]="{ tab: 'reviews' }">Reviews</a>

// classic way
this.route.paramMap.subscribe(p => console.log(p.get('id')));
this.route.queryParamMap.subscribe(q => console.log(q.get('q')));`,
        ),
      ],
      [
        blk(`<h3>Navigation details, titles and server configuration</h3>
• <code>router.navigate(['/courses', id])</code> (array form, safe encoding) or <code>navigateByUrl('/courses/5')</code>. <code>replaceUrl: true</code> avoids adding a history entry (after login).<br>
• Set page <code>title</code> per route (or a <code>TitleStrategy</code>) for accessibility and SEO. Use <code>withInMemoryScrolling</code> to restore scroll and handle fragments; <code>withViewTransitions()</code> for animated transitions.<br>
• <b>PathLocationStrategy</b> (default, clean URLs) needs the <b>server to return <code>index.html</code></b> for unknown paths, otherwise a refresh on <code>/courses/5</code> gives a 404: nginx <code>try_files $uri /index.html</code>; Spring Boot: forward non-API, non-file paths to <code>index.html</code>. <code>withHashLocation()</code> avoids the issue (URLs with <code>#</code>).<br>
• For true 404 content, the wildcard component can also set the HTTP status under SSR.`,
          `provideRouter(
  routes,
  withComponentInputBinding(),
  withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
  withViewTransitions(),
)

// after login: do not leave /login in the history
this.router.navigate(['/dashboard'], { replaceUrl: true });

// Spring Boot: SPA fallback
// @Controller class SpaController {
//   @GetMapping(value = "/{path:^(?!api|assets).*[^.]*}")      // paths without a dot and not /api
//   String forward() { return "forward:/index.html"; }
// }

// nginx
// location / { try_files $uri $uri/ /index.html; }`,
        ),
      ],
      [
        ['How do you read a route parameter in Angular?', 'Inject ActivatedRoute and use paramMap (an observable), snapshot.paramMap for a one-off read, or enable withComponentInputBinding and declare an input() with the parameter name.'],
        ['Why must the wildcard route be last?', 'The router uses the first matching route. ** matches every URL, so placing it earlier would hide all routes after it.'],
        ['Why does refreshing a deep link return 404 in production?', 'With clean URLs the browser asks the server for /courses/5, which is not a file. Configure the server to return index.html for unknown paths so Angular\'s router can handle them.'],
      ],
    ),
    topic(
      'ng-child-lazy-routes',
      'Child Routes and Lazy Loading',
      [
        blk(`<h3>Child routes and layouts</h3>
• A route can have <b><code>children</code></b> rendered inside a second <code>&lt;router-outlet&gt;</code> in the parent's template: the pattern for layouts (dashboard shell with a sidebar), tabbed pages and master/detail.<br>
• A route with <b>no <code>component</code></b> (a "componentless route") only groups children and shares a path prefix, guards, resolvers or providers.<br>
• Relative links inside children (<code>routerLink="settings"</code> or <code>"../"</code>) are resolved from the current route.`,
          `// app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,            // contains <router-outlet />
    canActivate: [authGuard],
    children: [
      { path: '', component: OverviewComponent },                     // /dashboard
      { path: 'courses', component: MyCoursesComponent },             // /dashboard/courses
      { path: 'courses/:id', component: CourseProgressComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
];

// dashboard-layout.component.ts
@Component({
  selector: 'app-dashboard-layout', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: \`
    <aside>
      <a routerLink="." routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Overview</a>
      <a routerLink="courses" routerLinkActive="active">My courses</a>
      <a routerLink="settings" routerLinkActive="active">Settings</a>
    </aside>
    <main><router-outlet /></main>\`,
})
export class DashboardLayoutComponent {}`,
        ),
      ],
      [
        blk(`<h3>Lazy loading</h3>
• By default everything lands in one bundle. <b>Lazy loading</b> splits features into chunks downloaded <b>when the route is first visited</b>, cutting the initial download and startup time.<br>
• Single component: <code>loadComponent: () =&gt; import('./reports/reports.component').then(m =&gt; m.ReportsComponent)</code>.<br>
• A whole feature: <code>loadChildren: () =&gt; import('./admin/admin.routes').then(m =&gt; m.ADMIN_ROUTES)</code>. The feature exports a <code>Routes</code> array; it can also declare its own <code>providers</code>.<br>
• Never import a lazy component class statically elsewhere, or it ends up in the main bundle.`,
          `export const routes: Routes = [
  { path: '', component: HomeComponent },                          // main bundle
  { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) },
  {
    path: 'admin',
    canMatch: [adminGuard],                                        // chunk is not even downloaded for non-admins
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
];

// admin/admin.routes.ts
export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminHomeComponent, providers: [AdminStore] },     // service scoped to this feature
  { path: 'users', loadComponent: () => import('./users/users.component').then(m => m.UsersComponent) },
];

// Preload lazy chunks in the background after startup
provideRouter(routes, withPreloading(PreloadAllModules))`,
        ),
      ],
      [
        blk(`<h3>Preloading and measuring</h3>
• <b>Preloading strategies</b> download lazy chunks in the background after the first render: <code>PreloadAllModules</code>, <code>NoPreloading</code> (default) or a custom strategy (preload only routes with <code>data: { preload: true }</code>).<br>
• Verify with the browser <b>Network</b> tab (a new <code>chunk-XXXX.js</code> appears on first navigation) and <code>ng build --stats-json</code> plus a bundle analyser (<code>source-map-explorer</code>, <code>esbuild-visualizer</code>).<br>
• Rule of thumb: lazy-load every feature except the landing page and the shell; use <code>@defer</code> for heavy widgets inside a page.`,
          `@Injectable({ providedIn: 'root' })
export class SelectivePreload implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['preload'] ? load() : of(null);
  }
}

// { path: 'reports', data: { preload: true }, loadComponent: ... }
provideRouter(routes, withPreloading(SelectivePreload))

// package.json
// "analyze": "ng build --stats-json && npx esbuild-visualizer --metadata dist/app/stats.json --open"`,
        ),
      ],
      [
        ['What is lazy loading in Angular?', 'Loading a route\'s code only when the user first navigates to it, using loadComponent or loadChildren with a dynamic import(), so the initial bundle stays small and the app starts faster.'],
        ['What is a componentless route?', 'A route without a component that only groups child routes, sharing a path prefix, guards, resolvers or providers.'],
        ['What does PreloadAllModules do?', 'After the initial render it downloads all lazy-loaded chunks in the background, so later navigation is instant without delaying the first load.'],
      ],
    ),
    topic(
      'ng-guards-resolvers',
      'Route Guards, Resolvers and Protected Routes',
      [
        blk(`<h3>Functional guards</h3>
• A <b>guard</b> decides whether navigation may proceed. Modern guards are <b>functions</b> that use <code>inject()</code> and return <code>boolean</code>, a <code>UrlTree</code> (redirect) or an Observable/Promise of those.<br>
• Types: <code>canActivate</code> (may enter), <code>canActivateChild</code>, <code>canMatch</code> (may this route be matched/loaded: use for role-based lazy routes), <code>canDeactivate</code> (leave with unsaved changes).<br>
• Returning a <code>UrlTree</code> (<code>router.createUrlTree(['/login'])</code>) is the idiomatic redirect.`,
          `import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });   // redirect, remember where they wanted to go
};

export const roleGuard = (role: string): CanActivateFn => () =>
  inject(AuthService).user()?.roles.includes(role) ? true : inject(Router).createUrlTree(['/forbidden']);

export interface HasUnsavedChanges { dirty(): boolean }
export const leaveGuard: CanDeactivateFn<HasUnsavedChanges> = component =>
  !component.dirty() || confirm('You have unsaved changes. Leave this page?');

// routes
// { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
// { path: 'admin', canActivate: [authGuard, roleGuard('ADMIN')], loadChildren: ... },
// { path: 'editor', component: EditorComponent, canDeactivate: [leaveGuard] },`,
        ),
      ],
      [
        blk(`<h3>Resolvers: load data before the route activates</h3>
• A <b>resolver</b> (<code>ResolveFn&lt;T&gt;</code>) fetches data before the component is created, so the view never renders half-empty. The result is available as <code>route.data</code> (or as an input with component input binding).<br>
• Handle failures inside the resolver (<code>catchError</code> returning a redirect or <code>EMPTY</code>), because a failing resolver cancels navigation.<br>
• Use for essential data of the page; for secondary or slow data prefer loading in the component with a skeleton, or <code>@defer</code>.`,
          `import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';

export const courseResolver: ResolveFn<Course> = (route) => {
  const api = inject(CourseApi);
  const router = inject(Router);
  return api.get(Number(route.paramMap.get('id'))).pipe(
    catchError(() => { router.navigate(['/404']); return EMPTY; }),   // cancel navigation and redirect
  );
};

// { path: 'courses/:id', component: CourseDetailComponent, resolve: { course: courseResolver } },

// component using input binding
export class CourseDetailComponent {
  course = input.required<Course>();                  // resolved data is bound by name
}`,
        ),
      ],
      [
        blk(`<h3>Protected routes and the golden rule of security</h3>
• A typical protected-route flow: unauthenticated user opens <code>/dashboard</code> → <code>authGuard</code> redirects to <code>/login?returnUrl=/dashboard</code> → after login navigate to <code>returnUrl</code> with <code>replaceUrl</code>.<br>
• On a page refresh the in-memory auth state is empty: initialise it at startup (<code>provideAppInitializer</code>) by calling <code>/api/me</code> so the guard does not wrongly redirect.<br>
• <b>Guards are user-experience, not security.</b> The JavaScript runs in the user's browser and can be bypassed; <b>Spring Boot must authenticate and authorise every request</b> (<code>@PreAuthorize</code>, security filter chain). Treat the Angular guard as a convenience that hides pages the API would reject anyway.`,
          `// Restore the session before the first navigation
provideAppInitializer(() => inject(AuthService).restoreSession())

// AuthService
restoreSession(): Promise<void> {
  return firstValueFrom(
    this.http.get<User>('/api/me').pipe(
      tap(u => this._user.set(u)),
      catchError(() => of(null)),            // not logged in is fine
      map(() => void 0),
    ),
  );
}

// login component: go where the user wanted to go
const target = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
this.router.navigateByUrl(target, { replaceUrl: true });

// Spring Boot is the real gatekeeper
// @PreAuthorize("hasRole('ADMIN')")
// @DeleteMapping("/api/courses/{id}") void delete(@PathVariable long id) { ... }`,
        ),
      ],
      [
        ['canActivate vs canMatch?', 'canActivate runs after the route matched and decides whether to enter it. canMatch runs during matching and decides whether the route applies at all, so a lazy chunk is not even downloaded when it returns false.'],
        ['Are Angular route guards a security feature?', 'No. They only improve the experience by hiding pages. Because client code can be bypassed, the server (Spring Security) must authenticate and authorise every request.'],
        ['What is a resolver used for?', 'To fetch data before a route activates so the component renders with its data ready. It runs before the component is created and the result is available in route data or as an input.'],
      ],
    ),
  ]),

  ng(7, 'Forms', 'Core', [
    topic(
      'ng-template-driven-forms',
      'Template-Driven Forms',
      [
        blk(`<h3>Forms in the template</h3>
• <b>Template-driven forms</b> put the form model in the template using <code>ngModel</code>, with Angular building <code>FormControl</code>/<code>FormGroup</code> behind the scenes. Import <code>FormsModule</code>.<br>
• Good for <b>simple forms</b> (login, search, contact). For complex, dynamic or heavily validated forms prefer reactive forms.<br>
• <code>#f="ngForm"</code> exposes the form; <code>#email="ngModel"</code> exposes a control with <code>valid</code>, <code>invalid</code>, <code>touched</code>, <code>dirty</code>, <code>errors</code>.`,
          `// contact.component.ts
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({ selector: 'app-contact', standalone: true, imports: [FormsModule], templateUrl: './contact.component.html' })
export class ContactComponent {
  model = { name: '', email: '', message: '' };
  submitted = false;
  send(form: NgForm) {
    if (form.invalid) return;
    console.log('sending', this.model);
    this.submitted = true;
    form.resetForm();
  }
}

// contact.component.html
// <form #f="ngForm" (ngSubmit)="send(f)" novalidate>
//   <label for="name">Name</label>
//   <input id="name" name="name" [(ngModel)]="model.name" required minlength="3" #name="ngModel">
//   @if (name.invalid && (name.dirty || name.touched)) {
//     <p role="alert">
//       @if (name.errors?.['required']) { Name is required }
//       @if (name.errors?.['minlength']) { At least 3 characters }
//     </p>
//   }
//   <label for="email">Email</label>
//   <input id="email" name="email" type="email" [(ngModel)]="model.email" required email #email="ngModel">
//   <button type="submit" [disabled]="f.invalid">Send</button>
// </form>`,
        ),
      ],
      [
        blk(`<h3>Validation states and CSS classes</h3>
• Angular adds CSS classes to controls: <code>ng-valid</code> / <code>ng-invalid</code>, <code>ng-pristine</code> / <code>ng-dirty</code>, <code>ng-untouched</code> / <code>ng-touched</code>. Style them to show errors only after interaction.<br>
• Built-in validator attributes: <code>required</code>, <code>minlength</code>, <code>maxlength</code>, <code>min</code>, <code>max</code>, <code>pattern</code>, <code>email</code>.<br>
• Every control needs a <b><code>name</code></b> attribute inside a form; otherwise <code>ngModel</code> throws.<br>
• Disable native validation with <code>novalidate</code> so Angular's messages are used.`,
          `// styles
// input.ng-invalid.ng-touched { border-color: #dc2626; }
// input.ng-valid.ng-touched   { border-color: #16a34a; }

// Select, checkbox and radio
// <select name="level" [(ngModel)]="model.level"><option value="beginner">Beginner</option><option value="advanced">Advanced</option></select>
// <label><input type="checkbox" name="terms" [(ngModel)]="model.terms" required> I accept the terms</label>
// <label><input type="radio" name="plan" value="free" [(ngModel)]="model.plan"> Free</label>

// Cross-field check kept simple in the template
// <input name="confirm" [(ngModel)]="model.confirm" required #confirm="ngModel">
// @if (confirm.touched && model.confirm !== model.password) { <p role="alert">Passwords do not match</p> }`,
        ),
      ],
      [
        blk(`<h3>When to use template-driven forms</h3>
• Template-driven: little code for simple forms; logic hidden in the template; harder to unit-test; asynchronous, hard to control programmatically.<br>
• Reactive: explicit, immutable-ish model in the class; synchronous access to values; easy dynamic fields, custom/cross-field validators and tests.<br>
• Both use the same underlying classes. Do not mix <code>ngModel</code> and <code>formControlName</code> on the same control.`,
          `// Quick decision table
// Login/search/contact with 2-4 fields, simple rules             -> template-driven
// Registration, checkout, multi-step wizard, dynamic rows        -> reactive
// Custom validators, async validators, conditional fields         -> reactive
// Need to unit test form logic without a DOM                      -> reactive`,
        ),
      ],
      [
        ['What module does ngModel require?', 'FormsModule (imported in the standalone component or NgModule). Reactive forms use ReactiveFormsModule instead.'],
        ['What are the ng-touched and ng-dirty classes?', 'ng-touched means the control has lost focus at least once; ng-dirty means its value was changed by the user. They are used to show validation errors only after interaction.'],
        ['Template-driven vs reactive forms?', 'Template-driven keeps the form model in the template with ngModel and suits simple forms. Reactive forms define the model in TypeScript, giving explicit control, easy dynamic fields, custom validators and straightforward testing.'],
      ],
    ),
    topic(
      'ng-reactive-forms',
      'Reactive Forms: FormControl, FormGroup, FormBuilder',
      [
        blk(`<h3>Defining the form model in code</h3>
• Import <code>ReactiveFormsModule</code>. Build the model from <code>FormControl</code> (one value), <code>FormGroup</code> (named controls) and <code>FormArray</code> (list of controls). <code>FormBuilder</code> (<code>fb.group({...})</code>, or <code>fb.nonNullable.group</code>) shortens it.<br>
• Bind in the template: <code>[formGroup]="form"</code>, <code>formControlName="email"</code>, <code>(ngSubmit)="submit()"</code>.<br>
• Forms are <b>typed</b> since Angular 14: <code>form.value</code> is <code>Partial&lt;{...}&gt;</code>; use <code>getRawValue()</code> for the complete value.`,
          `import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({ selector: 'app-register', standalone: true, imports: [ReactiveFormsModule], templateUrl: './register.component.html' })
export class RegisterComponent {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    level: ['beginner'],
    terms: [false, Validators.requiredTrue],
  });

  get f() { return this.form.controls; }                 // shorthand for the template

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();               // fully typed
    console.log(value.email, value.level);
  }
}

// register.component.html
// <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
//   <input formControlName="name" placeholder="Name">
//   @if (f.name.touched && f.name.errors; as e) {
//     <p role="alert">@if (e['required']) { Name is required } @else if (e['minlength']) { Min {{ e['minlength'].requiredLength }} characters }</p>
//   }
//   <input type="email" formControlName="email">
//   <input type="password" formControlName="password">
//   <label><input type="checkbox" formControlName="terms"> I accept</label>
//   <button [disabled]="form.invalid">Register</button>
// </form>`,
        ),
      ],
      [
        blk(`<h3>Working with the form programmatically</h3>
• <b>Read/write values</b>: <code>setValue</code> (all fields), <code>patchValue</code> (some), <code>reset()</code>, <code>control.disable()/enable()</code>, <code>get('address.city')</code>, <code>markAsTouched</code>.<br>
• <b>React to changes</b>: <code>valueChanges</code> and <code>statusChanges</code> observables; combine with <code>debounceTime</code> and <code>switchMap</code> for search-as-you-type or dependent dropdowns.<br>
• <b>Nested groups</b> mirror nested objects (<code>address: fb.group({ city, pin })</code>), bound with <code>formGroupName</code>.<br>
• Use <code>updateOn: 'blur' | 'submit'</code> to validate less eagerly.`,
          `form = this.fb.nonNullable.group({
  search: [''],
  country: [''],
  state: [{ value: '', disabled: true }],               // disabled until a country is chosen
  address: this.fb.nonNullable.group({ city: [''], pin: ['', Validators.pattern(/^\\d{6}$/)] }),
});

constructor() {
  // search as you type
  this.form.controls.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
    .subscribe(q => this.search(q));

  // dependent dropdown
  this.form.controls.country.valueChanges.pipe(
    tap(() => this.form.controls.state.reset({ value: '', disabled: false })),
    switchMap(code => this.geo.states(code)),
    takeUntilDestroyed(),
  ).subscribe(states => (this.states = states));
}

load(user: User) { this.form.patchValue({ address: { city: user.city } }); }
clear() { this.form.reset(); }`,
        ),
      ],
      [
        blk(`<h3>Typed forms and update strategies</h3>
• Use <code>FormBuilder.nonNullable</code> (or <code>new FormControl('', { nonNullable: true })</code>) so <code>reset()</code> returns to the initial value instead of <code>null</code> and the type stays <code>string</code>.<br>
• <code>FormGroup&lt;{ email: FormControl&lt;string&gt; }&gt;</code> types let the compiler check <code>form.controls.email</code> and <code>patchValue</code>.<br>
• <code>unified control state change events</code> (<code>control.events</code>, v18+) expose value, status, touched and reset events in one stream.<br>
• Avoid <code>any</code>-typed forms (<code>UntypedFormGroup</code>) in new code.`,
          `interface RegisterForm {
  name: FormControl<string>;
  email: FormControl<string>;
  age: FormControl<number | null>;
}
const form = new FormGroup<RegisterForm>({
  name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  age: new FormControl<number | null>(null, [Validators.min(18)]),
});
form.controls.name.setValue('Asha');            // typed: string
// form.controls.name.setValue(5);              // compile error
form.reset();                                   // name -> '' (not null) because nonNullable`,
        ),
      ],
      [
        ['FormControl, FormGroup and FormArray?', 'FormControl tracks one value and its validation state; FormGroup groups named controls into an object; FormArray holds an ordered list of controls (dynamic rows). Together they form a tree.'],
        ['setValue vs patchValue?', 'setValue requires every control of the group and throws if one is missing; patchValue updates only the provided fields and ignores the rest.'],
        ['Why use nonNullable controls?', 'So the control type is string rather than string | null and reset() restores the initial value instead of setting null, avoiding null checks.'],
      ],
    ),
    topic(
      'ng-form-validation-dynamic',
      'Validation, Custom Validators, FormArray, Dynamic Forms and Submission',
      [
        blk(`<h3>Built-in and custom validators</h3>
• Built-ins: <code>Validators.required</code>, <code>requiredTrue</code>, <code>min</code>, <code>max</code>, <code>minLength</code>, <code>maxLength</code>, <code>pattern</code>, <code>email</code>, <code>compose</code>.<br>
• A <b>custom validator</b> is a function <code>(control) =&gt; ValidationErrors | null</code>: return <code>null</code> when valid, an object <code>{ errorKey: details }</code> when invalid. Use a <b>factory</b> function to pass parameters.<br>
• A <b>cross-field validator</b> is applied to the <b>group</b> and reads several controls (password match, date range).<br>
• An <b>async validator</b> returns an Observable/Promise (is this username taken?) and runs only after sync validators pass; debounce it.`,
          `import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { map, of, switchMap, timer } from 'rxjs';

// factory validator
export function noWhitespace(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null =>
    typeof c.value === 'string' && c.value.trim() !== c.value ? { whitespace: true } : null;
}
export function forbiddenWords(words: string[]): ValidatorFn {
  return c => words.some(w => String(c.value ?? '').toLowerCase().includes(w)) ? { forbidden: { words } } : null;
}

// cross-field validator on the group
export const passwordsMatch: ValidatorFn = group => {
  const p = group.get('password')?.value, c = group.get('confirm')?.value;
  return p && c && p !== c ? { mismatch: true } : null;
};

// async validator with debounce
export function uniqueUsername(api: UserApi): AsyncValidatorFn {
  return control => timer(400).pipe(
    switchMap(() => api.exists(control.value)),
    map(exists => (exists ? { taken: true } : null)),
  );
}

form = this.fb.nonNullable.group({
  username: ['', { validators: [Validators.required, noWhitespace()], asyncValidators: [uniqueUsername(this.api)], updateOn: 'blur' }],
  password: ['', [Validators.required, Validators.minLength(8)]],
  confirm: [''],
}, { validators: passwordsMatch });
// template: @if (form.hasError('mismatch') && form.controls.confirm.touched) { <p role="alert">Passwords do not match</p> }`,
        ),
      ],
      [
        blk(`<h3>FormArray and dynamic forms</h3>
• <b>FormArray</b> models a variable-length list: invoice lines, phone numbers, quiz options. Add with <code>push</code>, remove with <code>removeAt</code>; iterate in the template with <code>@for</code> and bind with <code>[formGroupName]="i"</code>.<br>
• <b>Dynamic forms</b> are generated from metadata (JSON from the server or a config object): loop over field definitions, create controls with validators, and render the right input component by <code>type</code> (<code>@switch</code>).<br>
• Toggle validators when fields become conditional: <code>setValidators</code>, then <code>updateValueAndValidity()</code>.`,
          `export class QuizEditorComponent {
  private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    questions: this.fb.array([this.newQuestion()]),
  });
  get questions() { return this.form.controls.questions; }
  newQuestion() { return this.fb.nonNullable.group({ text: ['', Validators.required], answer: ['', Validators.required] }); }
  add() { this.questions.push(this.newQuestion()); }
  remove(i: number) { this.questions.removeAt(i); }
}
// <div formArrayName="questions">
//   @for (q of questions.controls; track $index; let i = $index) {
//     <div [formGroupName]="i">
//       <input formControlName="text" placeholder="Question {{ i + 1 }}">
//       <input formControlName="answer" placeholder="Answer">
//       <button type="button" (click)="remove(i)">Remove</button>
//     </div>
//   }
// </div>
// <button type="button" (click)="add()">Add question</button>

// Dynamic form from metadata
interface FieldDef { key: string; label: string; type: 'text' | 'email' | 'select'; required?: boolean; options?: string[] }
buildForm(fields: FieldDef[]) {
  const group: Record<string, FormControl> = {};
  for (const f of fields) group[f.key] = new FormControl('', { nonNullable: true, validators: f.required ? [Validators.required] : [] });
  return new FormGroup(group);
}
// @for (f of fields; track f.key) { @switch (f.type) { @case ('select') { <select [formControlName]="f.key">...</select> } @default { <input [type]="f.type" [formControlName]="f.key"> } } }`,
        ),
      ],
      [
        blk(`<h3>Form submission</h3>
• On submit: check <code>form.invalid</code> and call <code>markAllAsTouched()</code> to show every error; disable the button and show a spinner while the request is pending (a <code>submitting</code> signal) to prevent double posts.<br>
• Send <code>form.getRawValue()</code> as JSON with <code>HttpClient.post</code>; on success <code>reset()</code> and navigate; on failure show a message and map server field errors (HTTP 400/422) back with <code>control.setErrors({ server: message })</code>.<br>
• <b>Server-side validation is mandatory</b>; the client only improves the experience.<br>
• Accessibility: label every field, <code>role="alert"</code> on errors, focus the first invalid control.`,
          `submitting = signal(false);
serverError = signal<string | null>(null);

submit() {
  if (this.form.invalid) { this.form.markAllAsTouched(); this.focusFirstInvalid(); return; }
  this.submitting.set(true);
  this.serverError.set(null);
  this.api.register(this.form.getRawValue()).pipe(finalize(() => this.submitting.set(false))).subscribe({
    next: () => this.router.navigate(['/welcome']),
    error: (err: HttpErrorResponse) => {
      if (err.status === 422 && err.error?.errors) {
        for (const [field, message] of Object.entries<string>(err.error.errors)) this.form.get(field)?.setErrors({ server: message });
      } else this.serverError.set('Something went wrong. Please try again.');
    },
  });
}
private focusFirstInvalid() {
  document.querySelector<HTMLElement>('form .ng-invalid:not(form)')?.focus();
}
// <button type="submit" [disabled]="submitting()">{{ submitting() ? 'Saving...' : 'Register' }}</button>
// @if (serverError()) { <p role="alert">{{ serverError() }}</p> }`,
        ),
      ],
      [
        ['How do you write a custom validator?', 'A function that takes an AbstractControl and returns null when valid or an object such as { forbidden: true } when invalid. Use a factory function to pass parameters, and apply it to a FormGroup for cross-field rules.'],
        ['When do you use FormArray?', 'For a variable number of similar controls or groups, such as invoice lines or quiz questions, adding and removing them at runtime with push and removeAt.'],
        ['How do you handle server-side validation errors in a reactive form?', 'Map the error response to controls with control.setErrors({ server: message }) so they display like client errors, while still validating on the client for faster feedback.'],
      ],
    ),
  ]),

  ng(8, 'HTTP and API Integration', 'Essential', [
    topic(
      'ng-httpclient-crud',
      'HttpClient: GET, POST, PUT, PATCH and DELETE',
      [
        blk(`<h3>Setting up HttpClient</h3>
• <code>HttpClient</code> is Angular's HTTP client (the counterpart of Spring's <code>RestTemplate</code>/<code>WebClient</code>). Register it with <code>provideHttpClient()</code> in <code>app.config.ts</code> (add <code>withInterceptors([...])</code> and <code>withFetch()</code>).<br>
• Methods return <b>cold Observables</b>: nothing is sent until you <code>subscribe</code> (or use the <code>async</code> pipe / <code>toSignal</code>). Each subscription sends a separate request.<br>
• Type the response with a generic: <code>http.get&lt;Course[]&gt;(url)</code>. JSON is parsed automatically (the type is a compile-time promise, not validation).`,
          `// app.config.ts
provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor]))

// course.api.ts
@Injectable({ providedIn: 'root' })
export class CourseApi {
  private http = inject(HttpClient);
  private base = '/api/courses';

  list(q = '', page = 0, size = 10) {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);   // encodes values safely
    return this.http.get<Page<Course>>(this.base, { params });
  }
  get(id: number)                      { return this.http.get<Course>(this.base + '/' + id); }
  create(body: CourseRequest)          { return this.http.post<Course>(this.base, body); }
  replace(id: number, body: CourseRequest) { return this.http.put<Course>(this.base + '/' + id, body); }
  update(id: number, patch: Partial<CourseRequest>) { return this.http.patch<Course>(this.base + '/' + id, patch); }
  remove(id: number)                   { return this.http.delete<void>(this.base + '/' + id); }
}`,
        ),
      ],
      [
        blk(`<h3>Using the API in components</h3>
• Prefer <b>declarative</b> consumption: <code>toSignal(api.list())</code> or the <code>async</code> pipe, which subscribe and unsubscribe for you. For user actions (create, delete) call <code>subscribe</code> (or <code>firstValueFrom</code>) with <code>next</code>/<code>error</code> handlers.<br>
• HTTP observables <b>complete</b> after one response, so they do not leak; still avoid nested subscribes (use <code>switchMap</code>).<br>
• Show loading and error state; do not leave the UI blank. <code>resource()</code>/<code>httpResource()</code> (Angular 19+) wrap this pattern in signals.`,
          `@Component({ selector: 'app-course-list', standalone: true, imports: [FormsModule], templateUrl: './course-list.component.html' })
export class CourseListComponent {
  private api = inject(CourseApi);
  query = signal('');
  page = signal(0);

  // reactive pipeline: any change of query/page cancels the previous request and issues a new one
  result = toSignal(
    combineLatest([toObservable(this.query), toObservable(this.page)]).pipe(
      debounceTime(250),
      switchMap(([q, p]) => this.api.list(q, p).pipe(map(data => ({ data, error: null })), catchError(() => of({ data: null, error: 'Failed to load' })))),
    ),
    { initialValue: undefined },
  );

  delete(c: Course) {
    if (!confirm('Delete ' + c.title + '?')) return;
    this.api.remove(c.id).subscribe({ next: () => this.page.update(p => p), error: e => alert('Could not delete') });
  }
}
// @if (result(); as r) { @if (r.error) { <p role="alert">{{ r.error }}</p> } @else { @for (c of r.data!.content; track c.id) { <p>{{ c.title }}</p> } } } @else { <p>Loading...</p> }`,
        ),
      ],
      [
        blk(`<h3>Typed responses, observe options and status codes</h3>
• <code>{ observe: 'response' }</code> returns the full <code>HttpResponse</code> (status, headers: read <code>Location</code> after a 201 or pagination headers); <code>{ observe: 'events' }</code> with <code>reportProgress: true</code> reports upload progress; <code>{ responseType: 'blob' }</code> downloads files.<br>
• Map the response to your domain model in the API layer (dates as <code>Date</code>, enums), so components deal with clean types.<br>
• The response generic is a promise to the compiler only. Validate untrusted shapes (Zod) in critical places.<br>
• New in recent versions: <code>httpResource(() =&gt; url)</code> is a signal-based GET that reloads when its signals change.`,
          `// full response, to read headers
this.http.post<Course>('/api/courses', body, { observe: 'response' }).subscribe(res => {
  console.log(res.status, res.headers.get('Location'), res.body);    // 201 /api/courses/7 {...}
});

// file download
download(id: number) {
  return this.http.get('/api/reports/' + id, { responseType: 'blob' }).subscribe(blob => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'report.pdf'; a.click(); URL.revokeObjectURL(a.href);
  });
}

// upload with progress
upload(file: File) {
  const form = new FormData(); form.append('file', file);
  return this.http.post('/api/upload', form, { reportProgress: true, observe: 'events' }).pipe(
    map(e => e.type === HttpEventType.UploadProgress ? Math.round(100 * e.loaded / (e.total ?? file.size)) : e.type === HttpEventType.Response ? 100 : null),
    filter((p): p is number => p !== null),
  );
}

// Angular 19+: signal-based resource
const id = signal(1);
course = httpResource<Course>(() => '/api/courses/' + id());
// course.value(), course.isLoading(), course.error()`,
        ),
      ],
      [
        ['Why must you subscribe to an HttpClient call?', 'HttpClient returns a cold Observable: the request is only sent when something subscribes (subscribe, the async pipe or toSignal). Without a subscription nothing happens.'],
        ['How do you send query parameters safely?', 'Use HttpParams (or the params option with an object) so values are encoded correctly, instead of concatenating strings into the URL.'],
        ['What does observe: "response" give you?', 'The full HttpResponse including status and headers, not just the body; useful to read the Location header after a POST or pagination headers.'],
      ],
    ),
    topic(
      'ng-http-interceptors-errors',
      'HTTP Headers, Interceptors and Error Handling',
      [
        blk(`<h3>Headers and functional interceptors</h3>
• Set headers per request with <code>{ headers: new HttpHeaders({...}) }</code> or globally with an <b>interceptor</b>. Typical headers: <code>Authorization: Bearer ...</code>, <code>Content-Type</code> (set automatically for JSON), <code>Accept-Language</code>, <code>X-Request-Id</code>, <code>X-XSRF-TOKEN</code>.<br>
• <b>Interceptors</b> are functions in the request/response pipeline (like servlet filters): <code>HttpInterceptorFn = (req, next) =&gt; next(req)</code>. <b>Requests are immutable</b>: use <code>req.clone({...})</code>. Register with <code>withInterceptors([a, b])</code>; order matters (first listed runs first on the way out).`,
          `// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).accessToken();
  const isApi = req.url.startsWith('/api/');
  if (!token || !isApi) return next(req);                         // never send the token to third-party hosts
  return next(req.clone({
    setHeaders: { Authorization: 'Bearer ' + token, 'X-Request-Id': crypto.randomUUID() },
    withCredentials: true,                                        // send the HttpOnly refresh cookie
  }));
};

// loading indicator interceptor
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};`,
        ),
      ],
      [
        blk(`<h3>Error handling</h3>
• Failed requests produce an <code>HttpErrorResponse</code> with <code>status</code> (0 = network/CORS error), <code>statusText</code>, <code>error</code> (parsed body) and <code>message</code>.<br>
• Handle at <b>three levels</b>: the <b>call site</b> (<code>catchError</code> for local recovery or a fallback), a <b>global error interceptor</b> (401, 403, 5xx, network; toasts, redirect to login), and the global <code>ErrorHandler</code> for uncaught exceptions (log to Sentry).<br>
• <b>Retry</b> only idempotent requests and only for transient failures, with backoff: <code>retry({ count: 3, delay: (e, i) =&gt; timer(2 ** i * 300) })</code>.<br>
• Do not show raw server messages to users; map status codes to friendly text.`,
          `export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notify = inject(NotificationService);
  return next(req).pipe(
    retry({ count: 2, delay: (err: HttpErrorResponse, i) => (req.method === 'GET' && (err.status === 0 || err.status >= 500) ? timer(300 * 2 ** i) : throwError(() => err)) }),
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 0:   notify.show('Network problem. Check your connection.'); break;
        case 401: inject(AuthService).clear(); router.navigate(['/login'], { queryParams: { returnUrl: router.url } }); break;
        case 403: router.navigate(['/forbidden']); break;
        case 429: notify.show('Too many requests. Please wait a moment.'); break;
        default:  if (err.status >= 500) notify.show('Server problem. Try again later.');
      }
      return throwError(() => err);                                 // let call sites handle validation errors (400/422)
    }),
  );
};

// call site: local recovery
this.api.get(id).pipe(catchError(() => of(null))).subscribe(c => (this.course = c));

// uncaught errors
{ provide: ErrorHandler, useClass: GlobalErrorHandler }   // forward to Sentry`,
        ),
      ],
      [
        blk(`<h3>Token refresh and caching in interceptors</h3>
• A common pattern: on 401 call <code>/auth/refresh</code> <b>once</b> (share the in-flight request with <code>shareReplay</code>), then retry the original request with the new token. Do not intercept the refresh/login URLs themselves (infinite loop).<br>
• <b>Caching interceptor</b>: keep GET responses in a <code>Map</code> (with TTL) and return <code>of(new HttpResponse(...))</code> for hits; or use HTTP caching headers.<br>
• <b>Context tokens</b> (<code>HttpContext</code>) let a request opt out: <code>context: new HttpContext().set(SKIP_AUTH, true)</code>.`,
          `export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
let refresh$: Observable<string> | null = null;

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || req.context.get(SKIP_AUTH)) return throwError(() => err);
      refresh$ ??= auth.refreshToken().pipe(shareReplay(1), finalize(() => (refresh$ = null)));   // one refresh for all waiting calls
      return refresh$.pipe(switchMap(token => next(req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }))));
    }),
  );
};
// refreshToken(): this.http.post<{accessToken: string}>('/api/auth/refresh', {}, { context: new HttpContext().set(SKIP_AUTH, true), withCredentials: true })`,
        ),
      ],
      [
        ['What is an HTTP interceptor?', 'A function in the HttpClient pipeline that can inspect or modify every outgoing request and incoming response, used for auth headers, logging, error handling, caching and loading indicators.'],
        ['Why do interceptors use req.clone()?', 'HttpRequest objects are immutable. To change headers, URL or body you create a modified copy with clone and pass that to next().'],
        ['What does status 0 mean in an HttpErrorResponse?', 'The browser could not complete the request: network failure, DNS/connection problem, timeout or a CORS block, so no HTTP status was received.'],
      ],
    ),
    topic(
      'ng-spring-cors-auth',
      'API Integration with Spring Boot, CORS and Authentication',
      [
        blk(`<h3>Angular and Spring Boot together</h3>
• Typical architecture: Angular (dev server on port 4200) calls a Spring Boot REST API (port 8080) with JSON. In development use the <b>dev-server proxy</b> so the browser sees one origin; in production serve the built Angular files and the API from the <b>same origin</b> (Nginx in front, or Spring Boot static resources).<br>
• Keep a clear <b>contract</b>: DTOs on the server (records), matching interfaces on the client (or generate them from OpenAPI with <code>openapi-generator</code>/<code>ng-openapi-gen</code>). Use proper status codes: 201 + Location, 204, 400/422 with field errors, 404, 409, 401/403.`,
          `// proxy.conf.json  (ng serve --proxy-config proxy.conf.json, or set in angular.json)
// { "/api": { "target": "http://localhost:8080", "secure": false, "changeOrigin": true } }

// Spring Boot controller
// @RestController @RequestMapping("/api/courses") @RequiredArgsConstructor
// class CourseController {
//   private final CourseService service;
//   @GetMapping Page<CourseDto> list(@RequestParam(defaultValue = "") String q, Pageable pageable) { return service.search(q, pageable); }
//   @PostMapping ResponseEntity<CourseDto> create(@Valid @RequestBody CourseRequest r) {
//     CourseDto c = service.create(r);
//     return ResponseEntity.created(URI.create("/api/courses/" + c.id())).body(c);
//   }
// }
// public record CourseDto(long id, String title, BigDecimal price) {}

// Angular model (same shape)
export interface CourseDto { id: number; title: string; price: number }
export interface Page<T> { content: T[]; totalElements: number; number: number; size: number }`,
        ),
      ],
      [
        blk(`<h3>CORS</h3>
• The browser blocks a page from reading responses from a different <b>origin</b> (scheme + host + port) unless the server allows it. It is enforced by the browser and configured on the server. Non-simple requests (JSON body, <code>Authorization</code> header, PUT/DELETE) trigger a <b>preflight</b> <code>OPTIONS</code> request.<br>
• Best: avoid CORS with the dev proxy and a same-origin production deployment. If you need it, configure Spring Security CORS with <b>explicit</b> origins; with cookies use <code>withCredentials: true</code> and <code>allowCredentials(true)</code> with a specific origin (never <code>*</code>).<br>
• A "CORS error" with status 0 in Angular is often really a server error or a missing preflight handler.`,
          `// Spring Boot
// @Bean CorsConfigurationSource corsConfigurationSource() {
//   CorsConfiguration c = new CorsConfiguration();
//   c.setAllowedOrigins(List.of("https://app.javaschoollab.com", "http://localhost:4200"));
//   c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
//   c.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-XSRF-TOKEN"));
//   c.setAllowCredentials(true);
//   c.setMaxAge(Duration.ofHours(1));
//   UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
//   s.registerCorsConfiguration("/api/**", c);
//   return s;
// }
// http.cors(Customizer.withDefaults());    // must be enabled in the security filter chain

// Debug checklist
// 1. Network tab: is the OPTIONS preflight 200 with Access-Control-Allow-* headers?
// 2. Is the Origin exactly allowed (scheme, host and port)?
// 3. Cookies? withCredentials + explicit origin + Allow-Credentials: true
// 4. Does a security filter reject OPTIONS before CORS runs?`,
        ),
      ],
      [
        blk(`<h3>Authentication and authorization with Spring Security</h3>
• <b>Authentication</b> = who are you; <b>authorization</b> = what may you do. Spring Security authenticates (session cookie or JWT) and enforces roles with <code>@PreAuthorize</code>; Angular only reflects the result in the UI (hide buttons, guard routes).<br>
• Two common designs: <b>HttpOnly session cookie</b> (simplest and safest for same-site apps; add CSRF protection) or <b>JWT</b> (short-lived access token in memory + refresh token in an HttpOnly cookie). Do not keep tokens in <code>localStorage</code>: XSS can read it.<br>
• On startup call <code>/api/me</code> to restore the user; expose <code>user</code>, <code>isLoggedIn</code>, <code>roles</code> from an <code>AuthService</code> with signals; handle 401 centrally in an interceptor.`,
          `@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly roles = computed(() => this._user()?.roles ?? []);
  private token = signal<string | null>(null);                  // memory only
  readonly accessToken = this.token.asReadonly();

  login(email: string, password: string) {
    return this.http.post<{ accessToken: string; user: User }>('/api/auth/login', { email, password }, { withCredentials: true }).pipe(
      tap(r => { this.token.set(r.accessToken); this._user.set(r.user); }),
    );
  }
  logout() { return this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(tap(() => { this.token.set(null); this._user.set(null); })); }
  hasRole(role: string) { return this.roles().includes(role); }
}

// Spring Security (Java)
// http.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
//     .authorizeHttpRequests(a -> a.requestMatchers("/api/auth/**").permitAll().requestMatchers("/api/admin/**").hasRole("ADMIN").anyRequest().authenticated())
//     .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));`,
        ),
      ],
      [
        ['How do you avoid CORS problems between Angular and Spring Boot?', 'Use the Angular dev-server proxy in development and serve the front end and API from the same origin in production. Otherwise configure CORS on Spring Boot with explicit origins, methods and headers.'],
        ['Where should Angular store a JWT?', 'Keep the short-lived access token in memory and the refresh token in an HttpOnly, Secure, SameSite cookie. Avoid localStorage because any XSS can read it.'],
        ['Who enforces authorization, Angular or Spring Boot?', 'Spring Boot. Angular guards and hidden buttons only improve the experience; every API request must be authenticated and authorised on the server.'],
      ],
    ),
  ]),

  ng(9, 'RxJS and Reactive Programming', 'Core', [
    topic(
      'ng-rxjs-basics',
      'Observables, Observers, Subscriptions and Promises vs Observables',
      [
        blk(`<h3>The core idea</h3>
• <b>RxJS</b> (Reactive Extensions for JavaScript) models asynchronous data as <b>streams</b>. An <b>Observable</b> is a lazy producer of zero or more values over time (HTTP responses, clicks, timers, form changes, WebSocket messages). Nothing happens until someone <b>subscribes</b>.<br>
• An <b>Observer</b> is an object (or callbacks) with <code>next</code>, <code>error</code> and <code>complete</code>. <code>subscribe()</code> returns a <b>Subscription</b> you can <code>unsubscribe()</code>.<br>
• Convention: name Observables with a trailing <code>$</code> (<code>courses$</code>).`,
          `import { Observable, of, from, interval, fromEvent } from 'rxjs';

const numbers$ = new Observable<number>(observer => {
  observer.next(1);
  observer.next(2);
  setTimeout(() => { observer.next(3); observer.complete(); }, 500);
  return () => console.log('teardown: cleanup when unsubscribed or completed');
});

const subscription = numbers$.subscribe({
  next: v => console.log('value', v),
  error: e => console.error('error', e),
  complete: () => console.log('done'),
});
// subscription.unsubscribe();        // stop early

// Creation helpers
of(1, 2, 3);                          // emits 1,2,3 then completes
from([10, 20]);                       // from an array, Promise or iterable
interval(1000);                       // 0,1,2... every second, never completes (must unsubscribe!)
fromEvent(document, 'click');         // DOM events as a stream`,
        ),
      ],
      [
        blk(`<h3>Cold vs hot, and Promises vs Observables</h3>
<table ${TABLE}>
<tr><th></th><th>Promise</th><th>Observable</th></tr>
<tr><td>Values</td><td>One (or an error)</td><td>Zero, one or many over time</td></tr>
<tr><td>Execution</td><td>Eager: starts immediately</td><td>Lazy: starts on subscribe</td></tr>
<tr><td>Cancellation</td><td>Not built in</td><td><code>unsubscribe()</code> / operators</td></tr>
<tr><td>Operators</td><td>then/catch/finally</td><td>100+ (map, filter, switchMap, ...)</td></tr>
<tr><td>Multiple consumers</td><td>Shares one result</td><td>Each subscription re-runs (cold) unless shared</td></tr>
<tr><td>Async/await</td><td>Yes</td><td>Convert: <code>firstValueFrom()</code>, <code>lastValueFrom()</code></td></tr>
</table>
• <b>Cold</b> observables (HttpClient) run per subscriber: two subscriptions send two requests. <b>Hot</b> observables (DOM events, Subjects) emit regardless of subscribers. <code>shareReplay(1)</code> turns a cold one into a shared, cached one.`,
          `const result$ = this.http.get<Course[]>('/api/courses');
result$.subscribe();                   // request #1
result$.subscribe();                   // request #2 (cold: a second HTTP call!)

const shared$ = result$.pipe(shareReplay(1));   // one request, replayed to late subscribers
shared$.subscribe(); shared$.subscribe();

// Bridge to promises
const courses = await firstValueFrom(this.http.get<Course[]>('/api/courses'));
const p = new Promise<number>(r => setTimeout(() => r(42), 100));
from(p).subscribe(v => console.log(v));

// Bridge to signals (preferred in templates)
courses = toSignal(this.http.get<Course[]>('/api/courses'), { initialValue: [] });`,
        ),
      ],
      [
        blk(`<h3>Subscribing safely and subscription cleanup</h3>
• Long-lived streams (<code>interval</code>, <code>fromEvent</code>, store selectors, <code>valueChanges</code>, Subjects) <b>never complete</b>: an un-cancelled subscription is a <b>memory leak</b> and keeps handlers running after the component is gone.<br>
• Ways to clean up (best first): the <code>async</code> pipe, <code>toSignal()</code>, <code>takeUntilDestroyed()</code> (v16+), <code>take(1)</code>/<code>first()</code> for one-shot streams, a manual <code>Subscription</code> object unsubscribed in <code>ngOnDestroy</code>, or <code>takeUntil(destroy$)</code> (older pattern).<br>
• HTTP calls complete by themselves and need no cleanup (but may still be cancelled with <code>switchMap</code>).`,
          `import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class TickerComponent {
  private destroyRef = inject(DestroyRef);
  seconds = signal(0);

  constructor() {
    interval(1000).pipe(takeUntilDestroyed()).subscribe(n => this.seconds.set(n));        // in a constructor: no argument needed
  }
  ngOnInit() {
    fromEvent(window, 'resize').pipe(debounceTime(200), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.measure());   // outside: pass destroyRef
  }
}

// Older, still common
private sub = new Subscription();
ngOnInit() { this.sub.add(interval(1000).subscribe(...)); this.sub.add(this.form.valueChanges.subscribe(...)); }
ngOnDestroy() { this.sub.unsubscribe(); }

// Easiest of all: let the template subscribe
// {{ time$ | async }}`,
        ),
      ],
      [
        ['What is the difference between an Observable and a Promise?', 'A Promise delivers one value and runs eagerly; an Observable can emit many values over time, is lazy (runs on subscribe), is cancellable and has a rich operator library.'],
        ['What does cold observable mean?', 'Each subscription triggers a new execution of the producer, such as a new HTTP request. Use shareReplay or a Subject to share one execution between subscribers.'],
        ['How do you prevent subscription memory leaks?', 'Prefer the async pipe or toSignal; otherwise use takeUntilDestroyed, take(1) for one-shot streams or unsubscribe in ngOnDestroy for long-lived streams such as interval, fromEvent and Subjects.'],
      ],
    ),
    topic(
      'ng-rxjs-operators',
      'Operators: pipe, map, filter, switchMap, mergeMap, concatMap, catchError, debounceTime',
      [
        blk(`<h3>pipe() and transformation operators</h3>
• <code>pipe(op1, op2, ...)</code> chains <b>operators</b>: pure functions that take an Observable and return a new one. Operators run in order for each value.<br>
• <code>map(fn)</code> transforms each value; <code>filter(pred)</code> lets values through; <code>tap(fn)</code> performs side effects (logging) without changing values; <code>take(n)</code>, <code>first()</code>, <code>distinctUntilChanged()</code>, <code>startWith(x)</code>, <code>scan((acc, v) =&gt; ...)</code> (running state) and <code>reduce</code>.`,
          `import { of, from } from 'rxjs';
import { map, filter, tap, take, distinctUntilChanged, scan, startWith } from 'rxjs/operators';

of(1, 2, 3, 4, 5, 6).pipe(
  filter(n => n % 2 === 0),                       // 2, 4, 6
  map(n => n * 10),                               // 20, 40, 60
  tap(n => console.log('passing', n)),
).subscribe(v => console.log(v));                 // 20 40 60

this.http.get<Course[]>('/api/courses').pipe(
  map(courses => courses.filter(c => c.published)),
  map(courses => courses.map(c => ({ ...c, label: c.title.toUpperCase() }))),
).subscribe(...);

// running total
from([10, 20, 5]).pipe(scan((sum, n) => sum + n, 0)).subscribe(console.log);   // 10 30 35

// ignore repeated values
from(['a', 'a', 'b', 'b', 'a']).pipe(distinctUntilChanged()).subscribe(console.log);   // a b a`,
        ),
      ],
      [
        blk(`<h3>Flattening operators: switchMap, mergeMap, concatMap, exhaustMap</h3>
• They map each value to an <b>inner Observable</b> (often an HTTP call) and flatten the results. The difference is <b>what happens when a new value arrives while the previous inner request is still running</b>:<br>
<table ${TABLE}>
<tr><th>Operator</th><th>Behaviour</th><th>Use for</th></tr>
<tr><td><code>switchMap</code></td><td>Cancels the previous inner request, keeps the latest</td><td>Search-as-you-type, route param loading, "latest wins"</td></tr>
<tr><td><code>mergeMap</code></td><td>Runs all inner requests in parallel, results in completion order</td><td>Independent parallel work (limit with the concurrent argument)</td></tr>
<tr><td><code>concatMap</code></td><td>Queues; runs one at a time in order</td><td>Ordered writes, saving sequentially</td></tr>
<tr><td><code>exhaustMap</code></td><td>Ignores new values while one is running</td><td>Submit/login buttons: block double clicks</td></tr>
</table>`,
          `// search-as-you-type: only the latest query matters
this.search.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  filter(q => q.length >= 2),
  switchMap(q => this.api.search(q)),               // a new query cancels the previous HTTP request
).subscribe(results => (this.results = results));

// route param drives a request
this.route.paramMap.pipe(
  map(p => Number(p.get('id'))),
  switchMap(id => this.api.get(id)),
).subscribe(c => (this.course = c));

// upload many files in parallel, max 3 at once
from(files).pipe(mergeMap(f => this.api.upload(f), 3)).subscribe();

// save edits strictly in order
edits$.pipe(concatMap(edit => this.api.save(edit))).subscribe();

// prevent double submit
click$.pipe(exhaustMap(() => this.api.pay(order))).subscribe();`,
        ),
      ],
      [
        blk(`<h3>Error handling and timing: catchError, retry, debounceTime, throttleTime</h3>
• <code>catchError((err, caught) =&gt; ...)</code> handles an error and returns a <b>replacement Observable</b> (<code>of(fallback)</code>, <code>EMPTY</code>, or <code>throwError(() =&gt; newError)</code>). Place it <b>inside the inner pipe</b> of <code>switchMap</code> so one failed request does not kill the outer stream (otherwise the search box stops working after the first error).<br>
• <code>retry({ count, delay })</code> resubscribes on error (use for idempotent calls). <code>timeout(ms)</code> errors when no value arrives.<br>
• <code>debounceTime(ms)</code> emits only after a quiet period (typing); <code>throttleTime(ms)</code> emits at most once per period (scroll, clicks); <code>auditTime</code>, <code>delay</code>, <code>timer</code>, <code>interval</code>.`,
          `// WRONG: an error terminates the whole stream, search stops working
this.search.valueChanges.pipe(
  switchMap(q => this.api.search(q)),
  catchError(() => of([])),
).subscribe(...);

// RIGHT: handle the error per request, the outer stream survives
this.search.valueChanges.pipe(
  debounceTime(300),
  switchMap(q => this.api.search(q).pipe(
    retry({ count: 2, delay: 500 }),
    catchError(err => { this.error.set('Search failed'); return of([] as Course[]); }),
  )),
).subscribe(r => this.results.set(r));

fromEvent(window, 'scroll').pipe(throttleTime(200)).subscribe(() => this.updateProgressBar());
this.api.slowCall().pipe(timeout(5000)).subscribe({ error: e => console.log(e.name) });    // TimeoutError`,
        ),
      ],
      [
        ['switchMap vs mergeMap vs concatMap vs exhaustMap?', 'switchMap cancels the previous inner observable (latest wins); mergeMap runs all in parallel; concatMap queues them and runs one at a time in order; exhaustMap ignores new triggers while one is active.'],
        ['Where should catchError be placed in a switchMap search pipeline?', 'Inside the inner observable (after the HTTP call) so a failed request returns a fallback while the outer stream stays alive. At the outer level an error would complete the stream.'],
        ['debounceTime vs throttleTime?', 'debounceTime waits until the source is quiet for N ms and then emits the last value (search input). throttleTime emits the first value and ignores others for N ms (scroll, rapid clicks).'],
      ],
    ),
    topic(
      'ng-rxjs-combination-subjects',
      'Combining Streams, Subject, BehaviorSubject and the async Pipe',
      [
        blk(`<h3>Combining Observables</h3>
• <code>combineLatest([a$, b$])</code> emits an array of the latest values <b>whenever any source emits</b> (after all have emitted once): filters + data, form fields together.<br>
• <code>forkJoin({ user: user$, courses: courses$ })</code> waits for all sources to <b>complete</b>, then emits once with the last values: parallel HTTP calls ("load everything for this page"). If one errors the whole thing errors; if one never completes it never emits.<br>
• <code>zip</code> pairs by index; <code>merge</code> interleaves several streams into one; <code>withLatestFrom</code> adds the latest of another stream when the source emits; <code>race</code> takes the first to emit.`,
          `// load everything a page needs in parallel
forkJoin({
  course: this.api.get(id),
  lessons: this.api.lessons(id),
  progress: this.progressApi.forCourse(id),
}).subscribe(({ course, lessons, progress }) => { /* all three arrived */ });

// react to several inputs
const vm$ = combineLatest([this.courses$, this.query$, this.sort$]).pipe(
  map(([courses, q, sort]) =>
    courses.filter(c => c.title.toLowerCase().includes(q.toLowerCase()))
           .sort((a, b) => sort === 'price' ? a.price - b.price : a.title.localeCompare(b.title))),
);

merge(click$.pipe(map(() => 'click')), keydown$.pipe(map(() => 'key'))).subscribe(console.log);
clicks$.pipe(withLatestFrom(this.user$)).subscribe(([click, user]) => console.log(user?.name));`,
        ),
      ],
      [
        blk(`<h3>Subject, BehaviorSubject, ReplaySubject</h3>
• A <b>Subject</b> is both an Observable and an Observer: you call <code>next()</code> to push values to all current subscribers (<b>multicast</b>, hot). Use it as an event bus or to bridge callbacks.<br>
• <b>BehaviorSubject&lt;T&gt;(initial)</b> remembers the <b>current value</b>: new subscribers immediately get it; read synchronously with <code>.value</code>. The classic way to hold state in a service (signals now cover most of this).<br>
• <b>ReplaySubject(n)</b> replays the last n values; <b>AsyncSubject</b> emits only the last value on completion.<br>
• Expose <code>asObservable()</code> so outsiders cannot call <code>next()</code>.`,
          `@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly items = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this.items.asObservable();                           // read-only view
  readonly count$ = this.items$.pipe(map(i => i.length), distinctUntilChanged());
  readonly total$ = this.items$.pipe(map(i => i.reduce((s, x) => s + x.price * x.qty, 0)));

  add(item: CartItem) { this.items.next([...this.items.value, item]); }
  remove(id: number) { this.items.next(this.items.value.filter(i => i.id !== id)); }
  clear() { this.items.next([]); }
}
// header:  {{ cart.count$ | async }}        checkout: {{ cart.total$ | async | currency: 'INR' }}

const notifications = new Subject<string>();
notifications.next('lost: no subscribers yet');
notifications.subscribe(m => console.log('A got', m));
notifications.next('hello');                                                // A got hello

const last3 = new ReplaySubject<number>(3);
[1, 2, 3, 4].forEach(n => last3.next(n));
last3.subscribe(console.log);                                               // 2 3 4`,
        ),
      ],
      [
        blk(`<h3>The async pipe, toSignal and interop</h3>
• The <code>async</code> pipe subscribes, marks the view for check on emissions and <b>unsubscribes automatically</b>: the default way to render Observables. Use <code>@if (data$ | async; as data)</code> to avoid several subscriptions to the same source.<br>
• <code>toSignal(obs$, { initialValue })</code> converts an Observable to a signal (auto-unsubscribe); <code>toObservable(signal)</code> goes the other way. This lets you use RxJS for async flows and signals for state.<br>
• Avoid <code>subscribe()</code> inside <code>subscribe()</code> (callback hell): use flattening operators.<br>
• Avoid <code>BehaviorSubject.value</code> sprinkled around: it hides data flow. Prefer signals for state, RxJS for events and async work.`,
          `// template
// @if (vm$ | async; as vm) {
//   <h2>{{ vm.course.title }}</h2>
//   @for (l of vm.lessons; track l.id) { <li>{{ l.title }}</li> }
// } @else { <p>Loading...</p> }

// Interop
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

query = signal('');
results = toSignal(
  toObservable(this.query).pipe(
    debounceTime(300),
    switchMap(q => (q ? this.api.search(q) : of([] as Course[]))),
  ),
  { initialValue: [] as Course[] },
);
// <input (input)="query.set($any($event.target).value)"> @for (r of results(); track r.id) {...}

// Anti-pattern
this.route.paramMap.subscribe(p => {
  this.api.get(+p.get('id')!).subscribe(course => this.course = course);   // nested subscribe: leak and race-prone
});`,
        ),
      ],
      [
        ['combineLatest vs forkJoin?', 'combineLatest emits every time any source emits (after each has emitted once) and keeps going. forkJoin waits for all sources to complete and then emits once with their last values, which suits parallel HTTP calls.'],
        ['What is a BehaviorSubject and when is it used?', 'A Subject that holds a current value and gives it immediately to new subscribers. It was the standard way to store observable state in services; signals now cover most such cases.'],
        ['Why prefer the async pipe over manual subscription?', 'It subscribes and unsubscribes automatically, triggers change detection, and avoids leaks and boilerplate, so templates stay declarative.'],
      ],
    ),
  ]),
];
