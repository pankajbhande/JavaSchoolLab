// Angular course extras (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const angularExtras: Record<string, Extra> = {
    'angular-intro': x(
        ['Angular is a TypeScript-based framework from Google for building single-page applications.',
            'An app is built from components, templates, services and modules (or standalone components in recent versions).',
            'Create a project with <code>ng new my-app</code> and run it with <code>ng serve</code>.'],
        ['The Angular CLI generates code (<code>ng generate component</code>), builds, tests and serves the app.',
            'Templates use HTML plus Angular syntax: interpolation <code>{{ }}</code>, property binding <code>[prop]</code>, event binding <code>(event)</code>.',
            'Change detection updates the view when data changes; signals make this more precise in modern Angular.'],
        ['Choose standalone components over NgModules for new code; they reduce boilerplate and improve tree shaking.',
            'Angular is opinionated: dependency injection, RxJS, forms and routing come built in, which suits large teams.',
            'Plan for performance: OnPush change detection, lazy-loaded routes, trackBy, and bundle budgets.'],
        [['F', 'What is Angular?', 'A TypeScript framework for building single-page web applications from components.'],
            ['F', 'What does ng serve do?', 'Builds the app and starts a development server with live reload.'],
            ['M', 'What is a component?', 'A class with a template and styles that controls part of the screen, declared with @Component.'],
            ['M', 'What are standalone components?', 'Components that declare their own imports and need no NgModule.'],
            ['S', 'Angular vs React?', 'Angular is a full framework (DI, router, forms, HTTP) with strong conventions; React is a view library you assemble with other libraries.'],
            ['S', 'How do you keep an Angular app fast?', 'Lazy load routes, use OnPush and signals, trackBy in lists, avoid heavy template functions and watch bundle size.']],
        [['A minimal standalone component.',
            r`import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  standalone: true,
  template: '<h1>Hello {{ name }}</h1><button (click)="rename()">Rename</button>',
})
export class HelloComponent {
  name = 'Angular';
  rename() { this.name = 'JavaSchoolLab'; }
}

// OUTPUT:
// Hello Angular      (after the click: Hello JavaSchoolLab)`],
            ['CLI workflow.',
                r`ng new shop --standalone --routing --style=scss
cd shop
ng generate component product-list
ng serve

// OUTPUT:
// Application bundle generation complete.  Local: http://localhost:4200/`]],
        [['Bootstrap the app.',
            r`import { bootstrapApplication } from '@angular/platform-browser';
bootstrapApplication(AppComponent, { providers: [provideRouter(routes), provideHttpClient()] });

// OUTPUT:
// AppComponent rendered into <app-root>`],
            ['Signals for state.',
                r`import { signal, computed } from '@angular/core';
const count = signal(0);
const double = computed(() => count() * 2);
count.set(3);
console.log(double());

// OUTPUT:
// 6`]]
    ),

    'angular-components': x(
        ['A component combines a TypeScript class, an HTML template and CSS. The <code>@Component</code> decorator declares its selector, template and styles.',
            'Data binding connects class and template: interpolation, property binding <code>[x]</code>, event binding <code>(x)</code>, two-way binding <code>[(ngModel)]</code>.',
            'Components pass data with <code>@Input()</code> and notify parents with <code>@Output()</code>.'],
        ['Control flow in templates: <code>@if</code>, <code>@for</code>, <code>@switch</code> (new syntax) or <code>*ngIf</code>, <code>*ngFor</code>.',
            'Lifecycle hooks: <code>ngOnInit</code>, <code>ngOnChanges</code>, <code>ngOnDestroy</code> for setup and cleanup.',
            'Use <code>trackBy</code> (or <code>track</code> in <code>@for</code>) so lists update efficiently.'],
        ['Prefer <code>ChangeDetectionStrategy.OnPush</code> and immutable inputs for performance.',
            'Smart (container) versus presentational components: keep data fetching in containers and display logic in small components.',
            'Avoid heavy logic or function calls in templates; use computed values, pipes or signals.'],
        [['F', 'What is data binding?', 'The connection between component data and the template: interpolation, property, event and two-way binding.'],
            ['F', 'How does a child receive data?', 'Through an @Input() property set by the parent template.'],
            ['M', 'How does a child notify the parent?', 'With an @Output() EventEmitter that the parent listens to.'],
            ['M', 'What is ngOnInit for?', 'Initialization after inputs are set, such as loading data.'],
            ['S', 'What does OnPush change detection do?', 'The component is checked only when its inputs change by reference, events occur inside it or signals/observables it uses emit.'],
            ['S', 'Why use trackBy?', 'It lets Angular reuse DOM nodes for unchanged items instead of recreating the whole list.']],
        [['Input and Output.',
            r`@Component({ selector: 'app-counter', standalone: true, template: '<button (click)="inc()">{{ label }}: {{ count }}</button>' })
export class CounterComponent {
  @Input() label = 'Count';
  @Output() changed = new EventEmitter<number>();
  count = 0;
  inc() { this.count++; this.changed.emit(this.count); }
}
// parent template: <app-counter label="Clicks" (changed)="total = $event" />

// OUTPUT:
// Clicks: 1   (parent total = 1)`],
            ['New control flow.',
                r`@if (items.length) {
  <ul>@for (item of items; track item.id) { <li>{{ item.name }}</li> }</ul>
} @else { <p>No items</p> }

// OUTPUT:
// <ul><li>Pen</li><li>Book</li></ul>`]],
        [['OnPush component.',
            r`@Component({ selector: 'app-row', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: '{{ item.name }}' })
export class RowComponent { @Input({ required: true }) item!: Item; }

// OUTPUT:
// re-rendered only when the item reference changes`],
            ['Cleanup in ngOnDestroy.',
                r`ngOnInit() { this.sub = interval(1000).subscribe(n => this.tick = n); }
ngOnDestroy() { this.sub.unsubscribe(); }

// OUTPUT:
// no timers left running after the component is destroyed`]]
    ),

    'angular-services': x(
        ['A service is a class that holds logic or data shared between components, such as HTTP calls.',
            'Mark it with <code>@Injectable({ providedIn: "root" })</code> and ask for it in a constructor or with <code>inject()</code>.',
            'Dependency injection (DI) creates and supplies the instance for you.'],
        ['<code>HttpClient</code> returns Observables; subscribe or use the <code>async</code> pipe in templates.',
            'Provide services at root (singleton), at component level (one per component tree) or in route providers.',
            'Use interceptors for cross-cutting concerns: auth headers, error handling, logging.'],
        ['Keep components thin: put data access and business rules in services and test them in isolation.',
            'Use injection tokens and interfaces to swap implementations (for example fake API in tests).',
            'Avoid manual subscriptions in services; return Observables and let components use the async pipe or <code>takeUntilDestroyed</code>.'],
        [['F', 'What is a service in Angular?', 'A reusable class, usually injectable, that holds shared logic or data.'],
            ['F', 'What is dependency injection?', 'A pattern where the framework creates objects and passes them to the classes that need them.'],
            ['M', 'What does providedIn: root mean?', 'The service is registered in the root injector as a singleton available app-wide.'],
            ['M', 'How do you call an API?', 'Inject HttpClient and call get/post, which return Observables.'],
            ['S', 'What are HTTP interceptors?', 'Functions or classes that inspect or modify every HTTP request/response, e.g. to add a token or handle errors.'],
            ['S', 'How do you avoid memory leaks with Observables?', 'Use the async pipe, takeUntilDestroyed or unsubscribe in ngOnDestroy.']],
        [['A data service.',
            r`@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  list(): Observable<Product[]> { return this.http.get<Product[]>('/api/products'); }
  create(p: NewProduct): Observable<Product> { return this.http.post<Product>('/api/products', p); }
}
// component
products$ = inject(ProductService).list();
// template: @for (p of products$ | async; track p.id) { <li>{{ p.name }}</li> }

// OUTPUT:
// GET /api/products -> [ { id: 1, name: 'Pen' }, ... ]`],
            ['An auth interceptor.',
                r`export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return next(token ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req);
};
provideHttpClient(withInterceptors([authInterceptor]));

// OUTPUT:
// every request carries Authorization: Bearer <token>`]],
        [['Fake service in a test.',
            r`TestBed.configureTestingModule({ providers: [{ provide: ProductService, useValue: { list: () => of([{ id: 1, name: 'Pen' }]) } }] });

// OUTPUT:
// the component renders against the fake data with no network`],
            ['Error handling with retry.',
                r`this.http.get<Product[]>('/api/products').pipe(retry({ count: 2, delay: 500 }), catchError(() => of([])));

// OUTPUT:
// two retries 500 ms apart, then an empty list`]]
    ),

    'angular-routing': x(
        ['The Angular router maps URLs to components. Routes are an array of objects: <code>{ path: "products", component: ProductListComponent }</code>.',
            'Put <code>&lt;router-outlet&gt;</code> in a template where the routed component should appear, and link with <code>routerLink</code>.',
            'Route parameters (<code>:id</code>) are read with <code>ActivatedRoute</code> or the <code>withComponentInputBinding</code> option.'],
        ['Features: child routes, redirects, wildcard 404 route, lazy loading with <code>loadComponent</code>/<code>loadChildren</code>, guards and resolvers.',
            'Query parameters carry optional state (filters, page) and keep URLs shareable.',
            'Use <code>Router.navigate</code> for programmatic navigation.'],
        ['Lazy load feature routes to keep the initial bundle small, and preload important ones.',
            'Guards (<code>canActivate</code>, <code>canMatch</code>) protect routes; remember the server must enforce authorization too.',
            'Use resolvers or signals to load data before showing a screen, and handle loading and error states explicitly.'],
        [['F', 'What does router-outlet do?', 'It marks where the component for the current route is rendered.'],
            ['F', 'How do you link to a route?', 'With the routerLink directive.'],
            ['M', 'How do you read a route parameter?', 'Inject ActivatedRoute and read paramMap, or use withComponentInputBinding to receive it as an input.'],
            ['M', 'What is lazy loading?', 'Loading the code of a route only when the user first navigates to it, reducing the initial bundle.'],
            ['S', 'What are guards?', 'Functions that decide whether navigation is allowed (auth checks, unsaved changes).'],
            ['S', 'Why must the server also check permissions?', 'Client-side guards can be bypassed; the API must enforce authorization.']],
        [['Route configuration with lazy loading and a guard.',
            r`export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  { path: 'products', loadComponent: () => import('./products/product-list.component').then(m => m.ProductListComponent) },
  { path: 'products/:id', loadComponent: () => import('./products/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'admin', canActivate: [authGuard], loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },
  { path: '**', component: NotFoundComponent },
];

// OUTPUT:
// /products loads the list chunk; /admin requires the guard; unknown URLs show NotFound`],
            ['Reading parameters.',
                r`// provideRouter(routes, withComponentInputBinding())
@Component({ standalone: true, template: '<h1>Product {{ id }}</h1>' })
export class ProductDetailComponent { @Input() id!: string; }
// link: <a [routerLink]="['/products', 42]" [queryParams]="{ tab: 'reviews' }">Open</a>

// OUTPUT:
// URL /products/42?tab=reviews renders Product 42`]],
        [['Functional guard.',
            r`export const authGuard: CanActivateFn = () => inject(AuthService).isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);

// OUTPUT:
// anonymous users are redirected to /login`],
            ['Programmatic navigation.',
                r`this.router.navigate(['/products', id], { queryParams: { tab: 'details' } });

// OUTPUT:
// URL changes to /products/42?tab=details`]]
    )
};

export const angularDeep: Record<string, Deep> = {
    'angular-intro': dv(
        [`An Angular app starts in main.ts, which bootstraps the root component. The compiler (Ivy) turns each template into instructions that create and update DOM nodes. When something happens (event, timer, HTTP response) Angular runs change detection from the root: bindings are re-evaluated and only changed DOM parts are updated. Zone.js (or signals in zoneless mode) tells Angular when to check.`,
            r`// main.ts
bootstrapApplication(AppComponent, { providers: [provideRouter(routes), provideHttpClient()] });

// app.component.ts
@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet], template: '<h1>{{ title() }}</h1><router-outlet />' })
export class AppComponent { title = signal('Shop'); }

// OUTPUT:
// <app-root><h1>Shop</h1><router-outlet></router-outlet></app-root>`],
        [`Tooling: <code>ng new</code>, <code>ng generate</code> (component, service, pipe, guard), <code>ng build</code> (production bundle with AOT and tree shaking), <code>ng test</code>, <code>ng lint</code>, <code>ng add</code> for schematics. Configuration lives in <code>angular.json</code> and <code>tsconfig</code>; environments and budgets control builds.`,
            r`ng generate component products/product-list --standalone --change-detection OnPush
ng generate service core/auth
ng build --configuration production
ng test --watch=false --browsers=ChromeHeadless

// OUTPUT:
// Initial total  412 kB  (budgets: warning at 500 kB)`],
        [`Beginner mistakes: forgetting to import a standalone component or directive in <code>imports</code>, mutating inputs in children, subscribing without unsubscribing, manipulating the DOM directly instead of using bindings, and putting logic in templates. Let Angular manage the DOM and keep logic in classes.`,
            r`// error: 'app-hello' is not a known element
@Component({ standalone: true, imports: [], template: '<app-hello />' })     // missing HelloComponent in imports
// fix
@Component({ standalone: true, imports: [HelloComponent], template: '<app-hello />' })

// OUTPUT:
// NG8001: 'app-hello' is not a known element (before the fix)`],
        [`Performance basics: production builds (AOT, minification), lazy routes, OnPush, <code>@for</code> with track, avoiding expensive template expressions, image optimization (<code>NgOptimizedImage</code>) and deferrable views (<code>@defer</code>) for below-the-fold content.`,
            r`@defer (on viewport) { <app-reviews [productId]="id" /> } @placeholder { <p>Reviews</p> } @loading { <p>Loading...</p> }
<img ngSrc="/assets/pen.jpg" width="400" height="300" priority />

// OUTPUT:
// reviews code is downloaded only when the section scrolls into view`],
        [`Real-world: a feature-based project structure with lazy-loaded features, a core module of singletons (auth, interceptors), shared presentational components, and strict TypeScript settings for safer refactoring.`,
            r`src/app/
  core/       auth.service.ts, auth.guard.ts, auth.interceptor.ts
  shared/     ui/button.component.ts, pipes/money.pipe.ts
  features/
    products/ product-list.component.ts, product-detail.component.ts, products.routes.ts
    orders/   ...
  app.routes.ts, app.config.ts

// OUTPUT:
// each feature builds into its own lazy chunk`]
    ),

    'angular-components': dv(
        [`Each component instance has a view. Angular creates it from the template instructions, runs the constructor, sets inputs, calls ngOnChanges and ngOnInit, renders, and during change detection re-checks bindings. When the component is removed, ngOnDestroy runs. Inputs flow down, outputs (events) flow up; this one-directional flow keeps the app predictable.`,
            r`@Component({ selector: 'app-product-card', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<h3>{{ product.name }}</h3><p>{{ product.price | currency }}</p><button (click)="add.emit(product)">Add</button>' })
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<Product>();
  ngOnInit() { console.log('init', this.product.name); }
  ngOnDestroy() { console.log('destroy'); }
}

// OUTPUT:
// init Pen    ...    destroy`],
        [`Modern API: signal inputs (<code>input()</code>), <code>output()</code>, <code>model()</code> for two-way, <code>computed</code> and <code>effect</code>, <code>viewChild</code>, content projection with <code>&lt;ng-content&gt;</code>, host bindings, template reference variables and <code>@ViewChild</code>.`,
            r`@Component({ selector: 'app-rating', standalone: true, template: '{{ stars() }} / 5 ({{ label() }})' })
export class RatingComponent {
  value = input.required<number>();
  max = input(5);
  changed = output<number>();
  stars = computed(() => '★'.repeat(this.value()));
  label = computed(() => this.value() >= 4 ? 'great' : 'ok');
}

// OUTPUT:
// ★★★★ / 5 (great)`],
        [`Mistakes: mutating arrays or objects passed to OnPush children (no re-render), calling functions in templates (runs every check), using index as track key (wrong DOM reuse), subscribing in ngOnInit without cleanup, and large components that do everything. Use immutable updates, computed values, stable ids and small components.`,
            r`// bad: runs on every change detection
<p>{{ calculateTotal(items) }}</p>
// good: computed once per change
total = computed(() => this.items().reduce((s, i) => s + i.price * i.qty, 0));
<p>{{ total() }}</p>

// OUTPUT:
// the expression is evaluated only when items change`],
        [`Component performance: OnPush, signals, track keys, <code>@defer</code>, virtual scrolling for very long lists (<code>cdk-virtual-scroll-viewport</code>) and avoiding layout thrash. Profile with Angular DevTools to see which components re-render.`,
            r`<cdk-virtual-scroll-viewport itemSize="48" class="viewport">
  <div *cdkVirtualFor="let row of rows; trackBy: trackId" class="row">{{ row.name }}</div>
</cdk-virtual-scroll-viewport>

// OUTPUT:
// 100,000 rows rendered with about 20 DOM nodes`],
        [`Real-world: a list/detail screen with a smart container that loads data and presentational children that only display and emit events, so the children are reusable and easy to test.`,
            r`@Component({ standalone: true, imports: [ProductCardComponent, AsyncPipe], template: '@for (p of products$ | async; track p.id) { <app-product-card [product]="p" (add)="cart.add($event)" /> }' })
export class ProductPageComponent { products$ = inject(ProductService).list(); cart = inject(CartService); }

// OUTPUT:
// cards rendered from the API; clicking Add updates the cart service`]
    ),

    'angular-services': dv(
        [`Angular's injector tree resolves dependencies by type token. When a class asks for a service, the injector looks in the element/component injector, then up through parents to the root, creating the instance on first use and caching it per injector. <code>providedIn: 'root'</code> makes a tree-shakable singleton; component-level providers create an instance per component.`,
            r`@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>([]);
  readonly count = computed(() => this.items().reduce((n, i) => n + i.qty, 0));
  add(p: Product) { this.items.update(list => [...list, { id: p.id, qty: 1 }]); }
}
// two components both inject CartService and share the same instance

// OUTPUT:
// header shows count 1 after another component calls add()`],
        [`Provider options: <code>useClass</code>, <code>useValue</code>, <code>useFactory</code>, <code>useExisting</code>, <code>InjectionToken</code> for configuration, multi providers (interceptors), and <code>inject()</code> in functions. HttpClient returns cold Observables; operators (<code>map</code>, <code>switchMap</code>, <code>retry</code>, <code>shareReplay</code>) shape the stream.`,
            r`export const API_URL = new InjectionToken<string>('API_URL');
providers: [{ provide: API_URL, useValue: environment.apiUrl }, { provide: Logger, useClass: ConsoleLogger }];

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient); private base = inject(API_URL);
  products$ = this.http.get<Product[]>(this.base + '/products').pipe(shareReplay({ bufferSize: 1, refCount: true }));
}

// OUTPUT:
// one HTTP call is shared by all subscribers`],
        [`Mistakes: unsubscribed Observables, nested subscribes (use switchMap), services holding component state in public mutable fields, circular dependencies, and swallowing HTTP errors. Return Observables, use the async pipe and a central error strategy.`,
            r`// nested subscribe (hard to cancel)
this.route.params.subscribe(p => this.service.load(p.id).subscribe(d => this.data = d));
// flattened and cancelled when params change
data$ = this.route.paramMap.pipe(map(p => p.get('id')!), switchMap(id => this.service.load(id)));

// OUTPUT:
// the previous request is cancelled when the route parameter changes`],
        [`HTTP performance: cache read-mostly responses, cancel stale requests with switchMap, batch calls, enable compression and HTTP caching headers on the server, and avoid refetching on every navigation.`,
            r`search$ = this.query.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), switchMap(q => this.http.get<Product[]>('/api/products', { params: { q } })));

// OUTPUT:
// typing "pen" sends one request after 300 ms of silence, older requests cancelled`],
        [`Real-world: a token refresh interceptor. On 401 it obtains a new token once (shared among concurrent requests) and retries the failed requests.`,
            r`export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req).pipe(catchError(err => err.status === 401 ? auth.refresh().pipe(switchMap(t => next(req.clone({ setHeaders: { Authorization: 'Bearer ' + t } })))) : throwError(() => err)));
};

// OUTPUT:
// a request failing with 401 is retried transparently with a fresh token`]
    ),

    'angular-routing': dv(
        [`The router parses the URL into a tree, matches it against the route configuration (first match wins), runs guards and resolvers, loads lazy chunks, creates or reuses components, and renders them into the matching router-outlet. Navigation is a pipeline of events (NavigationStart, GuardsCheck, ResolveEnd, NavigationEnd) that you can observe.`,
            r`export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  { path: 'products', component: ProductListComponent, title: 'Products' },
  { path: 'products/:id', component: ProductDetailComponent, resolve: { product: productResolver } },
  { path: '**', component: NotFoundComponent },
];
inject(Router).events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => console.log('navigated to', e.urlAfterRedirects));

// OUTPUT:
// navigated to /products/42`],
        [`Options: <code>withComponentInputBinding</code> (route data as inputs), <code>withPreloading(PreloadAllModules)</code>, <code>withInMemoryScrolling</code>, route <code>data</code> and <code>title</code>, nested children with multiple outlets, <code>canMatch</code> to choose routes by condition, and <code>runGuardsAndResolvers</code>.`,
            r`provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules), withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }));
{ path: 'orders', canMatch: [() => inject(Features).enabled('orders')], loadChildren: () => import('./orders/orders.routes').then(m => m.ORDER_ROUTES) }

// OUTPUT:
// orders chunk preloaded in the background; route only matches when the feature flag is on`],
        [`Mistakes: wrong route order (a wildcard before specific routes), forgetting <code>pathMatch: 'full'</code> on empty-path redirects, relying on client guards for security, memory leaks from unsubscribed route observables, and losing state on navigation. Order routes from specific to general and enforce authorization on the server.`,
            r`// bad: redirect loops
{ path: '', redirectTo: 'products' }                    // matches every URL prefix
// good
{ path: '', pathMatch: 'full', redirectTo: 'products' }

// OUTPUT:
// without pathMatch full, /products itself would redirect again`],
        [`Routing performance: lazy load feature areas, preload what users will need next, keep resolvers fast, and cache data in services so back navigation is instant. Check chunk sizes with the build stats.`,
            r`ng build --stats-json
npx esbuild-visualizer --metadata dist/shop/stats.json

// OUTPUT:
// main 180 kB, products 42 kB (lazy), orders 58 kB (lazy), admin 91 kB (lazy)`],
        [`Real-world: an admin area guarded by a role check, lazy loaded, with a "leave without saving?" guard on edit screens.`,
            r`export const unsavedGuard: CanDeactivateFn<{ dirty(): boolean }> = c => !c.dirty() || confirm('Discard changes?');
{ path: 'products/:id/edit', component: ProductEditComponent, canDeactivate: [unsavedGuard] }

// OUTPUT:
// leaving a dirty form asks for confirmation`]
    )
};
