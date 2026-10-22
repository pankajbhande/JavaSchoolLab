// Angular syllabus, part 4: modules 23-29 (Spring Boot integration, deployment, CLI, architecture, accessibility and i18n, interview preparation, practical projects).
import type { SubTopic, Topic } from './types';
import { blk, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
/** A literal dollar sign, used to write GitHub Actions expressions without template-literal clashes. */
const D = '$';

/** Module overview lesson: a table of every syllabus item, a one-line explanation and the lesson that covers it. */
const overview = (n: number, title: string, lessons: string[], rows: [string, string, number][]): Topic =>
  topic(
    'ngs-m' + n + '-overview',
    'Module ' + n + ' overview and checklist',
    [
      blk(`<h3>Module ${n}: ${title}</h3>
This checklist lists <b>every syllabus item</b> of the module in order, with a one-line explanation and the lesson below that teaches it. Tick items off as you learn them.
<table ${TABLE}><thead><tr><th>#</th><th>Item</th><th>In plain words</th><th>Lesson</th></tr></thead><tbody>
${rows.map((r, i) => '<tr><td>' + (i + 1) + '</td><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + lessons[r[2] - 1] + '</td></tr>').join('\n')}
</tbody></table>`),
    ],
    [
      blk(`<h3>Suggested study order</h3>
${lessons.map((l, i) => '• Lesson ' + (i + 1) + ': <b>' + l + '</b><br>').join('\n')}
Read each lesson in three passes: the <b>Basic</b> tab for the idea, the <b>Intermediate</b> tab to write the code yourself, and the <b>Expert</b> tab for pitfalls and version notes. Then answer the interview questions aloud.`),
    ],
    [
      blk(`<h3>How to use this module on a real project</h3>
• Treat the table as a <b>definition of done</b>: for a production application every row should be a conscious decision (done, deliberately skipped, or planned).<br>
• Java developers: map each item to what you already know from Spring (profiles, filters, Maven, JUnit) and note only the Angular-specific differences.<br>
• Some items are <b>version dependent</b> (Angular 17-20, Spring Boot 3, Spring Security 6); the lessons say so where it matters.`),
    ],
    [
      ['How should I use a module checklist?', 'As a definition of done: for each item decide whether it is implemented, deliberately skipped or planned, and revisit the list before every release.'],
      ['Why group topics into lessons rather than learn them one by one?', 'Items interact (for example CORS, interceptors and JWT all appear in one login flow), so learning them together mirrors how they are used in a real application.'],
      ['What versions does this module assume?', 'Modern Angular (v17-20, standalone components, signals, functional guards and interceptors) with Spring Boot 3 and Spring Security 6; version-specific APIs are flagged.'],
    ],
  );

/** Interview area: three Q/A pairs (common, scenario, deep). */
type Area = { name: string; b: [string, string]; i: [string, string]; e: [string, string] };

const qaBlock = (areas: Area[], tier: 'b' | 'i' | 'e') =>
  blk(areas
    .map(a => '<h3>' + a.name + '</h3><b>Q:</b> ' + a[tier][0] + '<br><b>A:</b> ' + a[tier][1])
    .join('<br><br>'));

/** Interview question-bank lesson built from areas. */
const qaLesson = (id: string, name: string, areas: Area[]): Topic =>
  topic(
    id,
    name,
    [qaBlock(areas, 'b')],
    [qaBlock(areas, 'i')],
    [qaBlock(areas, 'e')],
    areas.flatMap(a => [a.b, a.e] as [string, string][]),
  );

// ---------------------------------------------------------------- Module 23
const L23 = [
  'Architecture, REST communication, CORS and environments',
  'CRUD APIs, DTOs, service layer and error models',
  'Pagination, search, validation and file transfer',
  'Spring Security, JWT, refresh tokens and roles',
  'Database, OpenAPI, testing and production',
];

const mod23: SubTopic = {
  id: 'ngs-mod-23',
  name: 'Module 23 · Angular with Spring Boot',
  topics: [
    overview(23, 'Angular with Spring Boot', L23, [
      ['Frontend-backend architecture', 'Angular runs in the browser, Spring Boot runs on the server, they talk only through HTTP and JSON.', 1],
      ['Angular and Spring Boot integration', 'Two separate projects in development; in production either two deployments or one jar serving the built files.', 1],
      ['REST API communication', 'Angular HttpClient calls Spring controllers using GET, POST, PUT, PATCH, DELETE.', 1],
      ['Spring Boot CRUD APIs', 'Controller, service and repository layers exposing create, read, update, delete.', 2],
      ['DTOs and JSON mapping', 'Transfer objects shape what goes over the wire; Jackson converts them to JSON.', 2],
      ['Angular service layer', 'One injectable service per resource wraps all HttpClient calls.', 2],
      ['Generic API response models', 'Generic TypeScript interfaces such as Page&lt;T&gt; and ApiError mirror the Java response classes.', 2],
      ['Error response handling', 'Spring returns a consistent error body; Angular maps it to messages.', 2],
      ['Pagination and sorting', 'Spring Data Pageable on the server, page/size/sort parameters from Angular.', 3],
      ['Search and filtering', 'Optional query parameters, debounced input and server-side filtering.', 3],
      ['Form validation on frontend and backend', 'Validators for fast feedback, Bean Validation as the real authority.', 3],
      ['Spring Security integration', 'SecurityFilterChain with stateless sessions, CORS and authorization rules.', 4],
      ['JWT authentication', 'Signed token proving identity, sent in the Authorization header.', 4],
      ['Refresh token design', 'Short-lived access token plus long-lived rotating refresh token.', 4],
      ['Role-based authorization', 'Roles in the token enforced with method security and Angular guards for UX.', 4],
      ['CORS configuration', 'Server rules telling browsers which other origins may call the API.', 1],
      ['File upload and download', 'multipart/form-data upload and blob download with progress.', 3],
      ['Database-backed applications', 'JPA entities, repositories and migrations behind the API.', 5],
      ['PostgreSQL/MySQL integration through Spring Boot', 'Driver, datasource properties and dialect configuration.', 5],
      ['API versioning', 'URL or header versions so old Angular builds keep working.', 2],
      ['Environment-specific configurations', 'Angular environment files and Spring profiles per environment.', 1],
      ['API documentation with OpenAPI', 'springdoc generates Swagger UI and a spec that can generate TypeScript clients.', 5],
      ['Integration testing', 'MockMvc/Testcontainers on the server, HttpTestingController in Angular.', 5],
      ['Production deployment', 'Nginx serving Angular and proxying /api to Spring Boot, or a single jar.', 5],
      ['End-to-end security testing', 'Verify the whole login, token, role and CORS chain with real requests.', 5],
    ]),

    topic(
      'ngs-m23-architecture-cors',
      'Architecture, REST communication, CORS and environments',
      [
        blk(`<h3>Two programs, one conversation</h3>
Think of a restaurant. <b>Angular</b> is the dining room (what the customer sees, running in the browser). <b>Spring Boot</b> is the kitchen (business rules and the database). <b>REST</b> over HTTP is the waiter, and <b>JSON</b> is the order slip. They are built, tested and often deployed <b>separately</b>.<br>
• <b>Frontend-backend architecture</b>: the browser downloads static files (HTML, JS, CSS) once, then Angular calls the API for data. The server never renders HTML (unlike JSP/Thymeleaf).<br>
• <b>Angular and Spring Boot integration</b> in development: Angular on <code>localhost:4200</code> (ng serve), Spring Boot on <code>localhost:8080</code>. Different ports mean different <b>origins</b>, which is why CORS matters.<br>
• <b>REST API communication</b>: Angular <code>HttpClient</code> sends <code>GET /api/employees</code>; Spring returns JSON that Angular turns into typed objects.`,
          `// app.config.ts - enable HttpClient once for the whole app
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()],
};

// employee.service.ts - first call to Spring Boot
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  getAll() { return this.http.get<Employee[]>('http://localhost:8080/api/employees'); }
}`,
          `// EmployeeController.java - the matching server side
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeService service;
    public EmployeeController(EmployeeService service) { this.service = service; }

    @GetMapping
    public List<EmployeeDto> all() { return service.findAll(); }   // Jackson turns this into JSON
}`,
        ),
      ],
      [
        blk(`<h3>CORS and the dev proxy</h3>
• <b>CORS configuration</b> (Cross-Origin Resource Sharing): the browser blocks Angular on :4200 from reading responses from :8080 unless the server sends <code>Access-Control-Allow-Origin</code>. Configure it <b>once</b> in Spring Security via a <code>CorsConfigurationSource</code> bean and enable it in the filter chain.<br>
• Alternative in development: Angular's <b>proxy</b> forwards <code>/api</code> to :8080 so the browser sees a single origin and no CORS is needed at all.<br>
• Never use <code>allowedOrigins("*")</code> together with <code>allowCredentials(true)</code>; list the real origins.`,
          `// SecurityConfig.java (Spring Security 6)
@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults())                 // picks up the CorsConfigurationSource bean
            .csrf(csrf -> csrf.disable())                    // OK for stateless bearer-token APIs
            .authorizeHttpRequests(a -> a.anyRequest().authenticated());
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of("http://localhost:4200", "https://app.example.com"));
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        c.setMaxAge(3600L);                                  // browsers cache the preflight result
        UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/api/**", c);
        return s;
    }
}`,
          `// proxy.conf.json (development alternative) - run: ng serve --proxy-config proxy.conf.json
{
  "/api": { "target": "http://localhost:8080", "secure": false, "changeOrigin": true }
}

// angular.json (serve options) can reference it:
// "serve": { "options": { "proxyConfig": "proxy.conf.json" } }`,
        ),
        blk(`<h3>Environment-specific configurations</h3>
• <b>Angular</b>: since v15.1 environments are not generated by default; run <code>ng generate environments</code> to create <code>environment.ts</code> (production) and <code>environment.development.ts</code> with <code>fileReplacements</code> in angular.json. Keep only the <b>API base URL</b> there, never secrets (everything in the bundle is public).<br>
• <b>Spring Boot</b>: use <b>profiles</b>: <code>application.yml</code> plus <code>application-dev.yml</code> and <code>application-prod.yml</code>, activated with <code>SPRING_PROFILES_ACTIVE=prod</code>. Secrets come from environment variables.`,
          `// environment.development.ts
export const environment = { production: false, apiUrl: 'http://localhost:8080/api/v1' };
// environment.ts (production build)
export const environment = { production: true, apiUrl: '/api/v1' };   // relative: same origin behind Nginx

// application-dev.yml
server:
  port: 8080
app:
  cors-origins: http://localhost:4200
logging:
  level:
    org.springframework.web: DEBUG`,
        ),
      ],
      [
        blk(`<h3>Preflight, credentials and the cleanest setup</h3>
• Non-simple requests (JSON body, Authorization header, PUT/DELETE) trigger an <b>OPTIONS preflight</b>. Spring's CORS support must run <b>before</b> authentication, otherwise preflights get 401. Using <code>http.cors()</code> in the filter chain guarantees that order; a <code>@CrossOrigin</code> annotation alone is not enough once Spring Security is present.<br>
• The browser, not the server, enforces CORS: curl and Postman ignore it, so "works in Postman" proves nothing.<br>
• Cookies across origins need <code>allowCredentials(true)</code>, an explicit origin (no wildcard) and <code>withCredentials: true</code> on the Angular request, plus <code>SameSite=None; Secure</code> cookies.<br>
• Best production design: serve Angular and the API under the <b>same origin</b> (Nginx routes <code>/</code> to files and <code>/api</code> to Spring). CORS then disappears, cookies are first-party and the setup is simpler to secure.<br>
• Version notes: Spring Boot 3 requires Java 17+ and Jakarta (<code>jakarta.*</code>) packages; Angular environment handling above is v15.1+.`),
      ],
      [
        ['Why do I get a CORS error in the browser but not in Postman?', 'CORS is enforced by browsers only. The server must send Access-Control-Allow-Origin (and answer the OPTIONS preflight); Postman and curl do not check it.'],
        ['What is a preflight request?', 'An automatic OPTIONS request the browser sends before a non-simple cross-origin request to ask whether the method and headers are allowed. Spring must answer it without requiring authentication.'],
        ['How do you avoid CORS entirely?', 'Make the browser see one origin: use the Angular dev proxy in development and an Nginx reverse proxy (or a single Spring Boot jar serving the Angular files) in production.'],
        ['How are environments handled in Angular and Spring Boot?', 'Angular uses environment files replaced at build time (or runtime config loaded at startup); Spring Boot uses profiles and environment variables. Secrets must never live in the Angular bundle.'],
        ['Why is allowedOrigins("*") with credentials invalid?', 'The CORS spec forbids a wildcard when credentials are allowed; the server must echo a specific trusted origin.'],
      ],
    ),

    topic(
      'ngs-m23-crud-dto-service',
      'CRUD APIs, DTOs, service layer and error models',
      [
        blk(`<h3>CRUD end to end</h3>
<b>CRUD</b> = Create, Read, Update, Delete, mapped to POST, GET, PUT/PATCH, DELETE. In Spring Boot you write a <b>controller</b> (HTTP), a <b>service</b> (business rules) and a <b>repository</b> (database). In Angular you write a <b>service</b> that calls the controller and a <b>component</b> that shows the result.<br>
• A <b>DTO</b> (Data Transfer Object) is the shape you promise to the frontend. Never expose JPA entities directly: you would leak columns, trigger lazy-loading errors and tie the API to the schema.<br>
• <b>JSON mapping</b>: Jackson maps Java field names to JSON keys (camelCase by default, which matches TypeScript conventions).`,
          `// EmployeeDto.java (Java 17 record) and entity mapping
public record EmployeeDto(Long id, String name, String email, String department) {}
public record CreateEmployeeRequest(
    @NotBlank String name, @Email String email, @NotBlank String department) {}

// EmployeeController.java
@PostMapping
public ResponseEntity<EmployeeDto> create(@Valid @RequestBody CreateEmployeeRequest req) {
    EmployeeDto saved = service.create(req);
    return ResponseEntity.created(URI.create("/api/v1/employees/" + saved.id())).body(saved);  // 201 + Location
}
@PutMapping("/{id}")  public EmployeeDto update(@PathVariable Long id, @Valid @RequestBody CreateEmployeeRequest r) { return service.update(id, r); }
@DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) { service.delete(id); }`,
          `// employee.model.ts - mirror of the Java records
export interface Employee { id: number; name: string; email: string; department: string; }
export type CreateEmployee = Omit<Employee, 'id'>;`,
        ),
      ],
      [
        blk(`<h3>The Angular service layer and generic models</h3>
• One <b>Angular service layer</b> class per resource keeps URLs, parameters and types in one place; components never call <code>HttpClient</code> directly.<br>
• <b>Generic API response models</b>: define reusable generics once, <code>Page&lt;T&gt;</code> for paged results and <code>ApiError</code> for failures, so every service is typed without repetition. A generic base service removes CRUD duplication.<br>
• <b>API versioning</b>: put the version in the URL (<code>/api/v1/...</code>) or a header; Angular reads the base from the environment so a v2 migration is a one-line change. Old mobile or cached Angular builds keep working against v1.`,
          `// crud.service.ts - generic base for every resource
export abstract class CrudService<T extends { id: number }, C = Omit<T, 'id'>> {
  protected http = inject(HttpClient);
  constructor(private path: string) {}
  private get url() { return environment.apiUrl + '/' + this.path; }

  list()                    { return this.http.get<T[]>(this.url); }
  get(id: number)           { return this.http.get<T>(this.url + '/' + id); }
  create(body: C)           { return this.http.post<T>(this.url, body); }
  update(id: number, body: C) { return this.http.put<T>(this.url + '/' + id, body); }
  remove(id: number)        { return this.http.delete<void>(this.url + '/' + id); }
}

@Injectable({ providedIn: 'root' })
export class EmployeeService extends CrudService<Employee> { constructor() { super('employees'); } }

// api.models.ts
export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }
export interface ApiError { status: number; error: string; message: string; path: string; timestamp: string; fieldErrors?: Record<string, string>; }`,
        ),
        blk(`<h3>Error response handling</h3>
Make the server return <b>one consistent error body</b> using <code>@RestControllerAdvice</code> (Spring 6 also offers RFC 7807 <code>ProblemDetail</code>), then translate it in Angular, ideally in one error interceptor.`,
          `// GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fields = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(f -> fields.put(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of("status", 400, "message", "Validation failed",
            "fieldErrors", fields, "path", req.getRequestURI()));
    }
    @ExceptionHandler(EntityNotFoundException.class)
    ResponseEntity<Map<String, Object>> notFound(EntityNotFoundException ex, HttpServletRequest req) {
        return ResponseEntity.status(404).body(Map.of("status", 404, "message", ex.getMessage(), "path", req.getRequestURI()));
    }
}`,
          `// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(catchError((e: HttpErrorResponse) => {
    const api = e.error as ApiError | null;
    const message = e.status === 0 ? 'Server unreachable' : (api?.message ?? 'Unexpected error');
    inject(ToastService).error(message);
    return throwError(() => api ?? e);        // components can still read fieldErrors
  }));`,
        ),
      ],
      [
        blk(`<h3>Contracts, mapping and drift</h3>
• Map entities to DTOs with <b>MapStruct</b> (compile-time, fast) rather than hand-written or reflection mappers; keep DTOs per use-case (create, update, summary, detail) so changing one screen does not break another.<br>
• Dates travel as ISO-8601 strings: configure Jackson (<code>spring.jackson.serialization.write-dates-as-timestamps=false</code>) and treat them as strings in TypeScript, converting with <code>DatePipe</code>. Money should be a string or integer minor units to avoid floating-point issues; <code>BigDecimal</code> serialises as a JSON number which JavaScript parses as a double.<br>
• To stop frontend and backend models drifting, generate the TypeScript client from the <b>OpenAPI</b> spec (see the OpenAPI lesson) instead of writing interfaces by hand.<br>
• Avoid returning <code>200</code> with an error payload; use correct status codes (201, 204, 400, 401, 403, 404, 409, 422, 500). Angular's <code>HttpClient</code> only throws on non-2xx, so status discipline makes <code>catchError</code> work.<br>
• Version policy: additive changes (new optional fields) are backward compatible; renames or removals need a new version. Keep two versions alive during rollout.`),
      ],
      [
        ['Why use DTOs instead of returning entities?', 'DTOs decouple the API contract from the database model, avoid leaking fields and lazy-loading/serialization problems, and let each use case expose only what it needs.'],
        ['What does a generic Page<T> model give you?', 'One typed shape for every paged endpoint; it mirrors Spring Data Page JSON (content, totalElements, number, size) so services and tables are reusable.'],
        ['How do you return consistent errors from Spring Boot?', 'Use @RestControllerAdvice with @ExceptionHandler methods (or ProblemDetail) producing one body with status, message, path and field errors.'],
        ['How do you version an API consumed by Angular?', 'Put the version in the URL (/api/v1) or a header, read it from Angular environment config, keep old versions running during migration and only break contracts in a new version.'],
        ['Why have a service layer in Angular instead of calling HttpClient in components?', 'It centralizes URLs, typing and error mapping, makes components easy to test with a mock service and lets you change the API without touching the UI.'],
      ],
    ),

    topic(
      'ngs-m23-paging-validation-files',
      'Pagination, search, validation and file transfer',
      [
        blk(`<h3>Big lists, forms and files</h3>
• <b>Pagination and sorting</b>: never send 100,000 rows. The client asks for <code>page=0&amp;size=10&amp;sort=name,asc</code>; Spring Data answers with one page plus totals.<br>
• <b>Search and filtering</b>: optional query parameters (<code>?q=ann&amp;department=IT</code>) handled on the server, because only the server sees all the data. In Angular, wait for the user to stop typing (<b>debounce</b>).<br>
• <b>Form validation on frontend and backend</b>: the frontend validates for speed and friendliness; the backend validates because users (or attackers) can bypass the browser. Both are required.<br>
• <b>File upload and download</b>: files travel as <code>multipart/form-data</code> (upload) and as binary blobs (download).`,
          `// EmployeeController.java - paging, sorting, filtering
@GetMapping
public Page<EmployeeDto> search(@RequestParam(required = false) String q,
                                @RequestParam(required = false) String department,
                                @PageableDefault(size = 10, sort = "name") Pageable pageable) {
    return service.search(q, department, pageable);        // Spring reads page, size, sort automatically
}`,
          `// employee.service.ts
search(q: string, dept: string, page: number, size: number, sort: string) {
  let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
  if (q) params = params.set('q', q);
  if (dept) params = params.set('department', dept);
  return this.http.get<Page<Employee>>(this.url, { params });
}`,
        ),
      ],
      [
        blk(`<h3>Debounced search, validation mirror and file handling</h3>
Combine a reactive form control with <code>debounceTime</code>, <code>distinctUntilChanged</code> and <code>switchMap</code> so every keystroke does not hit the server and stale responses are cancelled. For <b>validation on both sides</b>, use the same rules in <code>Validators</code> and in Bean Validation annotations, and display server <code>fieldErrors</code> on the matching control.`,
          `// employee-list.component.ts
search = new FormControl('', { nonNullable: true });
page = signal(0);
result = toSignal(
  combineLatest([
    this.search.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
    toObservable(this.page),
  ]).pipe(
    switchMap(([q, p]) => this.service.search(q, '', p, 10, 'name,asc')),   // switchMap cancels the previous call
  ),
  { initialValue: null },
);

// employee-form.component.ts - show backend field errors on controls
save() {
  this.service.create(this.form.getRawValue()).subscribe({
    error: (err: ApiError) => Object.entries(err.fieldErrors ?? {})
      .forEach(([field, msg]) => this.form.get(field)?.setErrors({ server: msg })),
  });
}`,
          `// UploadController.java (Spring Boot 3)
@PostMapping(value = "/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public FileInfo upload(@RequestParam("file") MultipartFile file) throws IOException {
    if (file.isEmpty() || file.getSize() > 5_000_000) throw new IllegalArgumentException("Invalid file");
    String stored = UUID.randomUUID() + "-" + StringUtils.cleanPath(file.getOriginalFilename());
    Files.copy(file.getInputStream(), uploadDir.resolve(stored));
    return new FileInfo(stored, file.getSize());
}
@GetMapping("/files/{name}")
public ResponseEntity<Resource> download(@PathVariable String name) {
    Resource r = new FileSystemResource(uploadDir.resolve(name));
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\\"" + name + "\\"")
        .body(r);
}`,
          `// file.service.ts
upload(file: File) {
  const body = new FormData();
  body.append('file', file);                       // do NOT set Content-Type manually; the browser adds the boundary
  return this.http.post<FileInfo>(this.url + '/files', body, { reportProgress: true, observe: 'events' });
}
download(name: string) {
  return this.http.get(this.url + '/files/' + name, { responseType: 'blob' }).pipe(
    tap(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href); }));
}`,
        ),
      ],
      [
        blk(`<h3>Pitfalls and best practices</h3>
• Pagination: offset paging (<code>page</code>/<code>size</code>) gets slow on huge tables; use <b>keyset (cursor) pagination</b> for feeds. Whitelist sortable fields on the server to avoid injection through <code>sort</code> parameters. Spring Boot caps <code>size</code> (default max 2000); set <code>spring.data.web.pageable.max-page-size</code>. Note Spring Data 3.3+ recommends <code>PagedModel</code>/<code>@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)</code> because the raw <code>PageImpl</code> JSON structure is not guaranteed stable.<br>
• Dynamic filters: use <b>Specifications</b> or Querydsl instead of string concatenation; always parameterised queries.<br>
• Validation: never trust client validation; also validate request params with <code>@Validated</code>, and return <b>422/400</b> with field errors. Custom cross-field rules need a class-level constraint.<br>
• Files: validate type by content (not just extension or <code>Content-Type</code>), limit size (<code>spring.servlet.multipart.max-file-size</code>), store outside the web root, generate your own file names (path traversal), and consider S3-style object storage plus virus scanning. Large downloads should stream.<br>
• Upload progress: with <code>observe: 'events'</code> check <code>HttpEventType.UploadProgress</code> to draw a progress bar.`),
      ],
      [
        ['How does Angular tell Spring Boot which page to return?', 'It sends page, size and sort query parameters (HttpParams); Spring MVC resolves them into a Pageable that Spring Data applies in the query.'],
        ['Why debounce a search box?', 'To avoid one request per keystroke; combined with switchMap the in-flight stale request is cancelled so only the latest term updates the UI.'],
        ['Why validate on both frontend and backend?', 'Frontend validation gives instant feedback; backend validation is the security boundary because requests can be crafted without the UI.'],
        ['How do you upload a file from Angular to Spring Boot?', 'Send FormData with HttpClient.post (no manual Content-Type) and receive it as @RequestParam MultipartFile; limit size and validate the file server-side.'],
        ['How do you download a file with Angular?', 'Request with responseType blob, create an object URL, click a temporary anchor with the download attribute and revoke the URL.'],
      ],
    ),

    topic(
      'ngs-m23-security-jwt',
      'Spring Security, JWT, refresh tokens and roles',
      [
        blk(`<h3>Who are you, and what may you do?</h3>
• <b>Authentication</b> = proving who you are (login). <b>Authorization</b> = what you are allowed to do (roles).<br>
• <b>Spring Security integration</b>: a filter chain in front of every controller. For a single-page app the API is <b>stateless</b>: no server session, each request carries a token.<br>
• <b>JWT authentication</b>: after login the server returns a signed <b>JSON Web Token</b> (header.payload.signature). Angular stores it and sends <code>Authorization: Bearer &lt;token&gt;</code> on every call. Think of it as a signed wristband at a festival: staff check the signature, not a guest list.<br>
• The payload is only encoded, not encrypted: never put passwords or secrets in it.`,
          `// login.service.ts
login(email: string, password: string) {
  return this.http.post<{ accessToken: string }>(environment.apiUrl + '/auth/login', { email, password })
    .pipe(tap(r => this.token.set(r.accessToken)));
}

// auth.interceptor.ts - attach the token to every API call
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return next(token ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req);
};`,
        ),
      ],
      [
        blk(`<h3>Stateless Spring Security 6 with a JWT filter</h3>
The filter reads the header, validates the signature and expiry, and puts an <code>Authentication</code> with authorities into the <code>SecurityContext</code>. Use a maintained library (Nimbus via <code>spring-boot-starter-oauth2-resource-server</code> is the simplest way to validate JWTs) instead of hand-rolling crypto.`,
          `// SecurityConfig.java
@Bean
SecurityFilterChain api(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
    http.cors(Customizer.withDefaults())
        .csrf(c -> c.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a -> a
            .requestMatchers("/api/v1/auth/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
            .requestMatchers(HttpMethod.DELETE, "/api/v1/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}

// AuthController.java
@PostMapping("/login")
public TokenResponse login(@Valid @RequestBody LoginRequest req, HttpServletResponse res) {
    Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
    String access = jwtService.createAccessToken(auth);          // 10-15 minutes
    String refresh = refreshService.issue(auth.getName());        // 7-30 days, stored hashed in DB
    res.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from("refresh", refresh)
        .httpOnly(true).secure(true).sameSite("Strict").path("/api/v1/auth").maxAge(Duration.ofDays(7)).build().toString());
    return new TokenResponse(access);
}`,
        ),
        blk(`<h3>Refresh token design and role-based authorization</h3>
• <b>Access token</b>: short life (10-15 min), kept in memory in Angular. <b>Refresh token</b>: long life, in an <b>HttpOnly, Secure, SameSite cookie</b> and <b>rotated</b> on each use (the old one is invalidated; reuse of an old one means theft, so revoke the family).<br>
• On <code>401</code> the Angular interceptor calls <code>/auth/refresh</code> once, queues parallel requests, retries them with the new token, and logs out if refresh fails.<br>
• <b>Role-based authorization</b>: roles go into a claim; Spring enforces with <code>@PreAuthorize("hasRole('ADMIN')")</code> (enable <code>@EnableMethodSecurity</code>); Angular only hides UI and blocks routes with guards.`,
          `// auth.interceptor.ts - refresh on 401 with a single in-flight refresh
let refreshing$: Observable<string> | null = null;
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req).pipe(catchError(err => {
    if (err.status !== 401 || req.url.includes('/auth/')) return throwError(() => err);
    refreshing$ ??= auth.refresh().pipe(shareReplay(1), finalize(() => (refreshing$ = null)));   // one refresh for all
    return refreshing$.pipe(
      switchMap(token => next(req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }))),
      catchError(e => { auth.logout(); return throwError(() => e); }));
  }));
};

// role.guard.ts - UX only; the server enforces the same rule
export const roleGuard = (role: string): CanActivateFn => () =>
  inject(AuthService).roles().includes(role) || inject(Router).createUrlTree(['/forbidden']);`,
          `// EmployeeController.java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public void delete(@PathVariable Long id) { service.delete(id); }`,
        ),
      ],
      [
        blk(`<h3>Token storage trade-offs and hardening</h3>
• <b>localStorage</b> tokens are readable by any XSS; <b>HttpOnly cookies</b> are immune to JS theft but need CSRF defence (SameSite=Strict/Lax, or a CSRF token with Angular's <code>withXsrfConfiguration</code> and Spring <code>CookieCsrfTokenRepository</code>). A common compromise: access token in memory, refresh token in an HttpOnly cookie.<br>
• Use asymmetric keys (RS256/ES256) when several services validate tokens; HS256 needs a secret of at least 256 bits from the environment. Always check <code>exp</code>, <code>iss</code>, <code>aud</code>; reject <code>alg: none</code>. Keep a small clock-skew allowance.<br>
• Store refresh tokens <b>hashed</b> in the database with user, device, expiry and revoked flag, to support logout-all and reuse detection. Logout must revoke the refresh token server side; deleting the browser copy is not enough. Access tokens cannot be revoked before expiry, which is why they are short.<br>
• Do not decode the JWT in Angular to make security decisions; decode only for display (name, roles). Guards and hidden buttons are UX; <b>every endpoint must enforce authorization itself</b>.<br>
• Version note: Spring Security 6 removed <code>WebSecurityConfigurerAdapter</code>; use <code>SecurityFilterChain</code> beans and the lambda DSL. For enterprise SSO consider OAuth2/OIDC (Keycloak, Auth0) with the Authorization Code + PKCE flow instead of custom login.`),
      ],
      [
        ['How does JWT authentication work between Angular and Spring Boot?', 'The login endpoint returns a signed token; Angular sends it in the Authorization header via an interceptor; a Spring filter validates the signature and expiry and sets the security context.'],
        ['Why use both access and refresh tokens?', 'The short-lived access token limits damage if stolen; the refresh token lets users stay logged in without re-entering credentials and can be rotated and revoked server-side.'],
        ['Where should the JWT be stored in the browser?', 'No option is perfect: localStorage is exposed to XSS, HttpOnly cookies need CSRF protection. A good pattern is access token in memory and refresh token in an HttpOnly Secure SameSite cookie.'],
        ['Are Angular route guards enough for authorization?', 'No. Guards only improve UX; the Spring Boot API must enforce roles itself with authorizeHttpRequests or @PreAuthorize.'],
        ['What is refresh token rotation?', 'Each refresh issues a new refresh token and invalidates the old one; if an old token is reused, the server treats it as theft and revokes the whole token family.'],
        ['Why can CSRF be disabled for a bearer-token API?', 'Browsers do not attach Authorization headers automatically, so cross-site forms cannot forge authenticated requests; with cookie-based auth CSRF protection must stay on.'],
      ],
    ),

    topic(
      'ngs-m23-database-openapi-testing-prod',
      'Database, OpenAPI, testing and production',
      [
        blk(`<h3>Data, docs, tests and going live</h3>
• <b>Database-backed applications</b>: Spring Data JPA turns Java entities into tables; the API reads and writes through repositories. Angular never sees the database.<br>
• <b>PostgreSQL/MySQL integration through Spring Boot</b>: add the driver dependency and a few <code>spring.datasource.*</code> properties; Hibernate does the rest.<br>
• <b>API documentation with OpenAPI</b>: <code>springdoc-openapi</code> produces a live Swagger UI at <code>/swagger-ui.html</code> from your controllers.<br>
• <b>Integration testing</b>: test controller plus database together instead of mocks only.<br>
• <b>Production deployment</b> and <b>end-to-end security testing</b>: build both apps, put Nginx in front, then try to break your own login and roles.`,
          `# application-dev.yml (PostgreSQL)
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/hrdb
    username: hr_user
    password: change-me-in-env        # real password comes from env var SPRING_DATASOURCE_PASSWORD
  jpa:
    hibernate.ddl-auto: validate      # never 'update' in production; use Flyway migrations
    open-in-view: false
# MySQL: url jdbc:mysql://localhost:3306/hrdb and driver com.mysql:mysql-connector-j

// pom.xml additions
// org.postgresql:postgresql, org.springframework.boot:spring-boot-starter-data-jpa,
// org.flywaydb:flyway-core, org.springdoc:springdoc-openapi-starter-webmvc-ui`,
        ),
      ],
      [
        blk(`<h3>Entities, migrations, OpenAPI client and tests</h3>
Use <b>Flyway</b> or Liquibase for versioned schema scripts, keep entities out of controllers (DTOs), and test with a real database via <b>Testcontainers</b>. Generate Angular clients from the OpenAPI spec so the contract cannot drift.`,
          `// Employee.java
@Entity @Table(name = "employees")
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(unique = true, nullable = false) private String email;
    @ManyToOne(fetch = FetchType.LAZY) private Department department;
}
// EmployeeRepository.java
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {
    Page<Employee> findByNameContainingIgnoreCase(String q, Pageable p);
}

// V1__create_employees.sql (Flyway)
// create table employees (id bigserial primary key, name varchar(100) not null, email varchar(150) unique not null);`,
          `# generate a typed Angular client from the spec (run once per API change)
npx @openapitools/openapi-generator-cli generate -i http://localhost:8080/v3/api-docs -g typescript-angular -o src/app/api
# alternatives: ng-openapi-gen, orval`,
          `// EmployeeControllerIT.java - Spring Boot 3 integration test with MockMvc + Testcontainers
@SpringBootTest @AutoConfigureMockMvc @Testcontainers
class EmployeeControllerIT {
    @Container @ServiceConnection static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16");
    @Autowired MockMvc mvc;

    @Test @WithMockUser(roles = "ADMIN")
    void createsEmployee() throws Exception {
        mvc.perform(post("/api/v1/employees").contentType(MediaType.APPLICATION_JSON)
                .content("{\\"name\\":\\"Asha\\",\\"email\\":\\"asha@x.com\\",\\"department\\":\\"IT\\"}"))
           .andExpect(status().isCreated())
           .andExpect(jsonPath("$.name").value("Asha"));
    }
}

// employee.service.spec.ts - Angular side
it('GETs employees', () => {
  service.list().subscribe(list => expect(list.length).toBe(1));
  const req = httpMock.expectOne(environment.apiUrl + '/employees');
  expect(req.request.method).toBe('GET');
  req.flush([{ id: 1, name: 'Asha', email: 'a@x.com', department: 'IT' }]);
});`,
        ),
      ],
      [
        blk(`<h3>Production deployment and security testing</h3>
• <b>Deployment shape</b>: (a) Nginx serves <code>dist/app/browser</code> and proxies <code>/api</code> to the Spring Boot jar (best separation, same origin); (b) copy the Angular build into <code>src/main/resources/static</code> of the jar (one artifact, simplest, but redeploys everything and needs a forwarding controller for deep links); (c) separate hosts plus CORS. Details are in Module 24.<br>
• Production checklist: <code>ddl-auto=validate</code>, Flyway on, <code>server.forward-headers-strategy=framework</code> behind a proxy, actuator health endpoint for probes, secrets from env or a vault, connection pool sized (HikariCP), HTTPS only, springdoc disabled or protected in prod.<br>
• <b>End-to-end security testing</b> checklist: call every endpoint without a token (expect 401), with a user token on admin routes (403), with an expired and a tampered token, with another user's id (IDOR / broken object-level authorization), with oversized and malicious payloads (validation, SQL injection through filters), check CORS from a disallowed origin, refresh token reuse, logout revocation, response headers (CSP, HSTS), and run OWASP ZAP or Burp plus Playwright/Cypress flows for the login journey. Add <code>@WebMvcTest</code> security slices for authorization rules so they run in CI.<br>
• Do not rely on Angular tests to prove security: security is proved against the running API.`),
      ],
      [
        ['What do you need to connect Spring Boot to PostgreSQL or MySQL?', 'The JDBC driver dependency, spring.datasource url/username/password, JPA/Hibernate settings and ideally Flyway migrations; the database dialect is auto-detected in Spring Boot 3.'],
        ['Why not use ddl-auto=update in production?', 'It changes the schema unpredictably and cannot be reviewed or rolled back; use versioned migrations (Flyway/Liquibase) with ddl-auto=validate.'],
        ['How does OpenAPI help the Angular team?', 'springdoc exposes the spec and Swagger UI for exploration, and the spec can generate typed Angular clients so frontend models always match the API.'],
        ['How do you integration test a Spring Boot API?', 'Use @SpringBootTest with MockMvc and a Testcontainers database, plus @WithMockUser or real tokens to exercise security rules.'],
        ['Name tests you would run for end-to-end security.', 'Missing/expired/tampered tokens, role escalation, accessing another user\'s resources, CORS from a foreign origin, refresh reuse, input fuzzing and a ZAP scan, in addition to UI journey tests.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 24
const L24 = [
  'Builds, configuration and secrets',
  'Static hosting, Ubuntu, Nginx, DNS and HTTPS',
  'Git, GitHub workflows, Jenkins and CI/CD',
  'Docker, Compose, containers and cloud',
  'Operations: monitoring, rollback, backup and hardening',
];

const mod24: SubTopic = {
  id: 'ngs-mod-24',
  name: 'Module 24 · Deployment and DevOps',
  topics: [
    overview(24, 'Deployment and DevOps', L24, [
      ['Angular development build', 'Unminified build with source maps and checks for fast feedback (ng serve / ng build -c development).', 1],
      ['Production build', 'Optimized, minified, hashed bundles produced by ng build.', 1],
      ['Build configuration', 'Named configurations in angular.json (budgets, fileReplacements, optimization).', 1],
      ['Environment configuration', 'Values fixed at build time such as the API URL.', 1],
      ['Runtime configuration', 'A config.json loaded at startup so one build runs in every environment.', 1],
      ['Environment variables and secret management', 'Secrets live in the CI vault or server environment, never in the Angular bundle.', 1],
      ['Build artifact management', 'Version, store and promote the exact same dist output between environments.', 1],
      ['Hosting static Angular applications', 'The build is plain files; any web server or CDN can host them.', 2],
      ['Ubuntu server basics', 'SSH, users, apt, systemd, firewall and file permissions on the host.', 2],
      ['Nginx configuration', 'Server blocks, root, try_files for SPA routing, caching and gzip.', 2],
      ['Reverse proxy fundamentals', 'Nginx forwards /api to Spring Boot so the browser sees one origin.', 2],
      ['Domain and DNS configuration', 'A and CNAME records pointing your domain to the server.', 2],
      ['HTTPS and SSL certificates', 'Free Let\'s Encrypt certificates via certbot, HTTP to HTTPS redirect.', 2],
      ['Deployment automation', 'Scripts and pipelines that replace manual copy-and-restart.', 3],
      ['Git fundamentals', 'Commits, branches, merges, rebases and pull requests.', 3],
      ['GitHub workflows', 'GitHub Actions YAML that builds, tests and deploys on push.', 3],
      ['Jenkins fundamentals', 'Self-hosted automation server driven by a Jenkinsfile.', 3],
      ['CI/CD pipelines', 'Automatic stages: install, lint, test, build, deploy.', 3],
      ['Docker fundamentals', 'Images, containers, layers, registries.', 4],
      ['Dockerizing Angular applications', 'Multi-stage build: Node builds, Nginx serves.', 4],
      ['Docker Compose', 'One YAML file starts Angular, Spring Boot and the database together.', 4],
      ['Container deployment', 'Pull the tagged image on the server and restart safely.', 4],
      ['Cloud hosting fundamentals', 'VMs, containers, managed databases, CDN and object storage.', 4],
      ['Logging and monitoring', 'Access and application logs plus health and metrics dashboards.', 5],
      ['Error monitoring', 'Sentry-style capture of browser errors with source maps.', 5],
      ['Rollback strategies', 'Return to the previous version in minutes.', 5],
      ['Versioned deployments', 'Immutable, tagged releases and release folders.', 5],
      ['Backup and recovery', 'Scheduled database dumps and tested restores.', 5],
      ['Production troubleshooting', 'Systematic checks from DNS to browser console.', 5],
      ['Security hardening', 'Headers, minimal exposure, patching, least privilege.', 5],
    ]),

    topic(
      'ngs-m24-builds-config-secrets',
      'Builds, configuration and secrets',
      [
        blk(`<h3>Development build versus production build</h3>
• The <b>Angular development build</b> (<code>ng serve</code> or <code>ng build --configuration development</code>) is quick to produce: no minification, <b>source maps</b> on, readable code.<br>
• The <b>production build</b> (<code>ng build</code>, since v12 the default configuration) does ahead-of-time compilation, <b>tree-shaking</b>, minification, and adds a content hash to file names (<code>main-A1B2C3.js</code>) so browsers cache safely. Output goes to <code>dist/&lt;project&gt;/browser</code> (v17+ application builder).<br>
• Analogy: development is a rough draft with notes in the margin; production is the printed, proofread book.`,
          `# build commands
ng build --configuration development     # fast, source maps, no optimization
ng build                                  # production (default configuration)
ls dist/my-app/browser                    # index.html, main-HASH.js, styles-HASH.css, media/`,
        ),
      ],
      [
        blk(`<h3>Build configuration, environments and runtime config</h3>
• <b>Build configuration</b> lives in <code>angular.json</code> under <code>configurations</code>: <code>budgets</code> (fail the build if bundles grow), <code>optimization</code>, <code>outputHashing</code>, <code>fileReplacements</code>. You can add <code>staging</code> next to <code>production</code>.<br>
• <b>Environment configuration</b> is baked in at <b>build time</b> (a new build per environment). Simple, but you ship different artifacts, so what you tested is not what you deploy.<br>
• <b>Runtime configuration</b>: build once, load <code>/assets/config.json</code> (or <code>/config.json</code>) before the app starts with <code>provideAppInitializer</code> (v19+; <code>APP_INITIALIZER</code> earlier). The deploy step just writes a different JSON file. This gives true "build once, promote everywhere".`,
          `// angular.json (excerpt)
"configurations": {
  "production": {
    "budgets": [
      { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
      { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
    ],
    "outputHashing": "all"
  },
  "staging": { "fileReplacements": [{ "replace": "src/environments/environment.ts", "with": "src/environments/environment.staging.ts" }], "optimization": true },
  "development": { "optimization": false, "extractLicenses": false, "sourceMap": true }
}
// build: ng build --configuration staging`,
          `// config.service.ts - runtime configuration
export interface AppConfig { apiUrl: string; featureFlags: Record<string, boolean>; }

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private cfg!: AppConfig;
  get api() { return this.cfg.apiUrl; }
  async load() { this.cfg = await (await fetch('/config.json', { cache: 'no-store' })).json(); }
}

// app.config.ts
providers: [ provideAppInitializer(() => inject(ConfigService).load()) ]

// /usr/share/nginx/html/config.json, written at container start or deploy time
// { "apiUrl": "https://api.example.com/api/v1", "featureFlags": { "newDashboard": true } }`,
        ),
      ],
      [
        blk(`<h3>Secrets, artifacts and traceability</h3>
• <b>Environment variables and secret management</b>: anything in the Angular bundle (environment files, config.json) is <b>public</b>. Put only non-secret values there (API URL, public client IDs). Real secrets (DB passwords, JWT signing keys, third-party API keys) live in the backend, injected from the CI secret store, Docker/Kubernetes secrets or a vault (HashiCorp Vault, AWS Secrets Manager). If the frontend needs a third-party key, proxy the call through your backend.<br>
• Node-time variables (e.g. <code>NG_BUILD_...</code>, API URL passed to a script that generates <code>environment.ts</code>) exist only during the CI build; they are not runtime variables in the browser.<br>
• <b>Build artifact management</b>: build once in CI, name the artifact with version and commit SHA (<code>app-1.8.2-3f9c1ab.tgz</code> or a Docker image tag), store it (GitHub Actions artifacts, Nexus/Artifactory, container registry) and <b>promote the same artifact</b> dev, staging, production. Never rebuild for production. Keep the last N versions for rollback and keep the source maps privately (upload to the error tracker, do not serve them publicly).<br>
• Cache correctness: <code>index.html</code> must be <code>no-cache</code> while hashed JS/CSS can be cached for a year (<code>immutable</code>). Version notes: Angular 17+ default <code>application</code> builder (esbuild + Vite) replaces the webpack browser builder; output moved to <code>dist/&lt;app&gt;/browser</code>.`),
      ],
      [
        ['What is the difference between a development and production Angular build?', 'Development keeps code readable with source maps for fast rebuilds; production applies AOT, tree-shaking, minification, hashing and budgets for small, cacheable bundles.'],
        ['Environment files versus runtime configuration?', 'Environment files are replaced at build time so you need one build per environment; runtime configuration loads a JSON at startup so one build can be promoted everywhere.'],
        ['Where do secrets belong in an Angular project?', 'Not in Angular at all: the bundle is public. Keep secrets in the backend and CI/server secret stores, and expose only non-secret config to the browser.'],
        ['What are build budgets?', 'Size limits in angular.json that warn or fail the build when bundles or component styles grow beyond a threshold.'],
        ['Why version and store build artifacts?', 'To deploy exactly what was tested, trace production back to a commit and roll back by redeploying a previous artifact.'],
      ],
    ),

    topic(
      'ngs-m24-hosting-nginx-dns-https',
      'Static hosting, Ubuntu, Nginx, DNS and HTTPS',
      [
        blk(`<h3>Angular is just files</h3>
<b>Hosting static Angular applications</b> is easy because after <code>ng build</code> you only have HTML, JS, CSS and images. Any web server (Nginx, Apache, S3 plus CloudFront, Netlify, GitHub Pages, Firebase Hosting) can serve them. The one special rule: for a single-page app, unknown URLs like <code>/employees/5</code> must return <code>index.html</code>, otherwise a browser refresh shows 404.<br>
<b>Ubuntu server basics</b> you need: connect with <code>ssh user@server</code>, update with <code>sudo apt update &amp;&amp; sudo apt upgrade</code>, install software with <code>apt install</code>, manage services with <code>systemctl</code>, open ports with <code>ufw</code>, and keep files owned by the right user.`,
          `# first steps on an Ubuntu server
ssh deploy@203.0.113.10
sudo apt update && sudo apt install -y nginx ufw
sudo ufw allow OpenSSH && sudo ufw allow "Nginx Full" && sudo ufw enable
sudo systemctl status nginx
sudo mkdir -p /var/www/myapp && sudo chown deploy:deploy /var/www/myapp
scp -r dist/my-app/browser/* deploy@203.0.113.10:/var/www/myapp/`,
        ),
      ],
      [
        blk(`<h3>Nginx configuration and reverse proxy</h3>
• <b>Nginx configuration</b> is a <i>server block</i> per site in <code>/etc/nginx/sites-available</code> (symlinked into <code>sites-enabled</code>). <code>try_files $uri $uri/ /index.html</code> is the SPA fallback.<br>
• <b>Reverse proxy fundamentals</b>: Nginx accepts the browser request and forwards <code>/api/</code> to Spring Boot on <code>localhost:8080</code>, then returns the answer. The browser sees one origin (no CORS), Spring Boot is not exposed to the internet and Nginx handles TLS, compression and caching.`,
          `# /etc/nginx/sites-available/myapp.conf
server {
    listen 80;
    server_name app.example.com;
    root /var/www/myapp;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;           # SPA fallback for deep links
    }
    location = /index.html {
        add_header Cache-Control "no-cache";          # always revalidate the shell
    }
    location ~* .(js|css|woff2|png|jpg|svg)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";   # hashed files
    }
    location /api/ {
        proxy_pass http://127.0.0.1:8080;             # Spring Boot
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
# enable and test:  sudo ln -s /etc/nginx/sites-available/myapp.conf /etc/nginx/sites-enabled/
#                   sudo nginx -t && sudo systemctl reload nginx`,
        ),
        blk(`<h3>Domain, DNS and HTTPS</h3>
• <b>Domain and DNS configuration</b>: at your registrar create an <b>A record</b> (<code>app.example.com</code> to the server IPv4), an <b>AAAA</b> record for IPv6 and a <b>CNAME</b> for aliases (<code>www</code> to <code>app</code>). Propagation can take minutes to hours; check with <code>dig app.example.com</code> or <code>nslookup</code>. Lower the TTL before a migration.<br>
• <b>HTTPS and SSL certificates</b>: use <b>Let's Encrypt</b> through <b>certbot</b>; it edits the Nginx config, adds a 301 redirect from HTTP and renews automatically (check <code>sudo certbot renew --dry-run</code>). Modern features (service workers, geolocation, clipboard, secure cookies) require HTTPS.`,
          `sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com -d www.example.com      # obtains cert, configures HTTPS and the redirect
sudo certbot renew --dry-run                                       # verify auto-renewal works
dig +short app.example.com                                         # confirm the A record

# what certbot adds to the server block
# listen 443 ssl;
# ssl_certificate     /etc/letsencrypt/live/app.example.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;`,
        ),
      ],
      [
        blk(`<h3>Production Nginx details that bite</h3>
• Add <code>proxy_set_header X-Forwarded-Proto</code> and set <code>server.forward-headers-strategy=framework</code> in Spring Boot, otherwise redirects and absolute links come out as <code>http://</code> behind the proxy.<br>
• Do not apply the SPA fallback to <code>/api</code>: a missing API route must stay a real 404 JSON, and missing static assets (<code>.js</code>) should return 404 rather than <code>index.html</code>, or a stale tab loads HTML as JavaScript and shows a confusing syntax error after a deploy.<br>
• Raise <code>client_max_body_size</code> for uploads (default 1 MB), tune <code>proxy_read_timeout</code> for slow endpoints, use <code>http2 on</code>, enable Brotli if available, and add HSTS (<code>Strict-Transport-Security</code>) once HTTPS is stable.<br>
• For SSE and WebSockets add <code>proxy_http_version 1.1</code>, <code>Upgrade</code>/<code>Connection</code> headers and <code>proxy_buffering off</code>.<br>
• Prefer a non-root deploy user with key-based SSH, <code>PasswordAuthentication no</code>, fail2ban and automatic security updates (<code>unattended-upgrades</code>). A CDN in front gives global caching and DDoS absorption.<br>
• Subpath hosting (<code>/app/</code>) needs <code>ng build --base-href /app/</code> and a matching location block.`),
      ],
      [
        ['Why does refreshing /employees/5 give 404 on a static server?', 'The server looks for a file at that path. An SPA needs a fallback (try_files ... /index.html) so Angular\'s router handles the URL.'],
        ['What does a reverse proxy do for an Angular plus Spring Boot app?', 'It serves static files, forwards /api to Spring Boot, terminates TLS and compresses/caches responses; the browser sees one origin so CORS is unnecessary.'],
        ['Which DNS records do you need to publish a site?', 'An A record (IPv4) and optionally AAAA (IPv6) to the server, and CNAME records for aliases such as www.'],
        ['How do you get free HTTPS?', 'Install certbot, run it with the Nginx plugin to get a Let\'s Encrypt certificate, redirect HTTP to HTTPS and rely on the auto-renew timer.'],
        ['How should hashed assets and index.html be cached?', 'Hashed JS/CSS can use a very long immutable cache; index.html must be no-cache so users get new hash references after each deploy.'],
      ],
    ),

    topic(
      'ngs-m24-git-cicd',
      'Git, GitHub workflows, Jenkins and CI/CD',
      [
        blk(`<h3>From laptop to server without hands</h3>
• <b>Deployment automation</b>: replace "copy files by hand" with a repeatable pipeline. Same steps, same order, every time.<br>
• <b>Git fundamentals</b>: a commit is a snapshot; a <b>branch</b> is a moving label; <b>merge</b> or <b>rebase</b> combines work; a <b>pull request</b> is a reviewed merge. Basic loop: <code>git switch -c feature/login</code>, <code>git add</code>, <code>git commit</code>, <code>git push</code>, open a PR.<br>
• <b>CI/CD pipelines</b>: <b>CI</b> (continuous integration) builds and tests every push; <b>CD</b> (delivery/deployment) ships the passing build to an environment. Analogy: an assembly line with quality checks at every station.`,
          `git clone https://github.com/acme/hr-portal.git
git switch -c feature/employee-search     # new branch
git add src/app/employee && git commit -m "feat: employee search with debounce"
git push -u origin feature/employee-search
git fetch origin && git rebase origin/main  # keep history linear before the PR
git tag v1.4.0 && git push --tags            # tag a release`,
        ),
      ],
      [
        blk(`<h3>GitHub workflows</h3>
A workflow is a YAML file in <code>.github/workflows</code>. <b>Jobs</b> run on runners; <b>steps</b> use actions (<code>actions/checkout</code>, <code>actions/setup-node</code>) or shell commands. Secrets are referenced as <b>GitHub expressions</b> and are masked in logs. Use <code>npm ci</code> (reproducible installs from the lock file) and cache npm.`,
          `# .github/workflows/ci.yml
name: ci
on:
  push: { branches: [main] }
  pull_request:
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npx ng test --watch=false --browsers=ChromeHeadless
      - run: npx ng build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist/my-app/browser }
  deploy:
    needs: build-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - name: Copy to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ` + D + `{{ secrets.SSH_HOST }}
          username: ` + D + `{{ secrets.SSH_USER }}
          key: ` + D + `{{ secrets.SSH_KEY }}
          source: dist/*
          target: /var/www/myapp-new`,
        ),
        blk(`<h3>Jenkins fundamentals</h3>
<b>Jenkins</b> is a self-hosted automation server. A <code>Jenkinsfile</code> in the repository defines a declarative pipeline of <b>stages</b>; credentials are stored in Jenkins and bound with <code>withCredentials</code>. Use it when you must stay on-premises or already run Jenkins; for new projects GitHub Actions or GitLab CI is lighter to maintain.`,
          `// Jenkinsfile (declarative)
pipeline {
  agent { docker { image 'node:20' } }
  options { timestamps() }
  stages {
    stage('Install') { steps { sh 'npm ci' } }
    stage('Lint and Test') { steps { sh 'npm run lint && npx ng test --watch=false --browsers=ChromeHeadlessCI' } }
    stage('Build') { steps { sh 'npx ng build' } }
    stage('Deploy') {
      when { branch 'main' }
      steps {
        sshagent(credentials: ['deploy-key']) {
          sh 'rsync -az --delete dist/my-app/browser/ deploy@203.0.113.10:/var/www/myapp/'
        }
      }
    }
  }
  post { failure { echo 'Build failed - notify the team' } }
}`,
        ),
      ],
      [
        blk(`<h3>Designing a trustworthy pipeline</h3>
• Order stages fast-to-slow: install, lint, unit tests, build, e2e, publish artifact, deploy. Fail early. Run Angular unit tests in headless Chrome (Karma <code>ChromeHeadlessCI</code> with <code>--no-sandbox</code> in containers) or your project's runner (Jest/Vitest); testing tools vary by version.<br>
• Build <b>once</b>, then deploy the same artifact to staging and production, with a manual approval gate before production (GitHub <i>environments</i> with required reviewers, Jenkins <code>input</code> step).<br>
• Deploy atomically: upload to a new release folder, then switch a <code>current</code> symlink (see rollback lesson) so users never see a half-copied site.<br>
• Branching: trunk-based with short-lived branches and feature flags tends to beat long-lived <code>develop</code> branches. Protect <code>main</code> (required checks, reviews, no force-push). Use conventional commits and semantic-release for automatic versioning if desired.<br>
• Security: pin actions to a version or SHA, use least-privilege <code>GITHUB_TOKEN</code> permissions, store secrets only in the secret store, use OIDC to cloud providers instead of long-lived keys, scan dependencies (<code>npm audit</code>, Dependabot, Trivy for images), and never print secrets.<br>
• Speed: cache <code>~/.npm</code>, parallelise jobs (lint, unit tests, backend tests), and use Nx or Turborepo affected-only builds in monorepos. Backend (Spring Boot) gets its own parallel job: <code>./mvnw verify</code>.`),
      ],
      [
        ['What is the difference between CI and CD?', 'CI builds and tests every change automatically; CD delivers (or deploys) the passing build to an environment, optionally after approval.'],
        ['Why use npm ci instead of npm install in a pipeline?', 'It installs exactly what package-lock.json specifies, fails on mismatches and is faster and reproducible.'],
        ['Merge versus rebase?', 'Merge preserves history with a merge commit; rebase replays your commits on top of the target branch for a linear history. Never rebase shared public branches.'],
        ['GitHub Actions or Jenkins?', 'Actions is hosted, YAML-based and integrated with GitHub; Jenkins is self-hosted, highly extensible and suits on-prem constraints but needs maintenance.'],
        ['How do you keep secrets safe in a pipeline?', 'Use the platform secret store or OIDC, reference secrets only in steps that need them, restrict who can trigger deploys and never echo them or bake them into artifacts.'],
        ['What is a good deployment gate?', 'Passing lint, tests and build on main, then a manual approval for production with the same artifact that passed staging.'],
      ],
    ),

    topic(
      'ngs-m24-docker-cloud',
      'Docker, Compose, containers and cloud',
      [
        blk(`<h3>Ship the whole kitchen, not just the recipe</h3>
• <b>Docker fundamentals</b>: an <b>image</b> is a read-only package of an app plus its runtime; a <b>container</b> is a running instance; a <b>registry</b> (Docker Hub, GHCR, ECR) stores images; layers are cached so rebuilds are fast. "Works on my machine" becomes "works in the container".<br>
• <b>Dockerizing Angular applications</b>: a <b>multi-stage build</b>: stage 1 uses Node to run <code>ng build</code>; stage 2 copies only the static output into a tiny Nginx image. The final image has no Node and no source code.`,
          `# Dockerfile (Angular)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                      # cached layer unless package files change
COPY . .
RUN npx ng build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/my-app/browser /usr/share/nginx/html
EXPOSE 80
# build and run:  docker build -t hr-web:1.0.0 .   then   docker run -p 8080:80 hr-web:1.0.0`,
          `# .dockerignore
node_modules
dist
.git
.angular`,
        ),
      ],
      [
        blk(`<h3>Docker Compose and container deployment</h3>
<b>Docker Compose</b> describes several containers in one YAML file: Angular/Nginx, Spring Boot and PostgreSQL, with a private network, volumes for data, health checks and environment variables from an <code>.env</code> file (not committed). <b>Container deployment</b> on a single server: CI pushes <code>ghcr.io/acme/hr-web:1.4.0</code>, the server runs <code>docker compose pull &amp;&amp; docker compose up -d</code>.`,
          `# docker-compose.yml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: hrdb
      POSTGRES_USER: hr_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_password]
    volumes: [dbdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hr_user -d hrdb"]
      interval: 10s
  api:
    image: ghcr.io/acme/hr-api:1.4.0
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/hrdb
      SPRING_DATASOURCE_USERNAME: hr_user
    depends_on:
      db: { condition: service_healthy }
    restart: unless-stopped
  web:
    image: ghcr.io/acme/hr-web:1.4.0
    ports: ["80:80"]
    depends_on: [api]
    restart: unless-stopped
volumes: { dbdata: {} }
secrets:
  db_password: { file: ./secrets/db_password.txt }`,
          `# nginx.conf inside the web image: proxy_pass uses the Compose service name
server {
  listen 80;
  root /usr/share/nginx/html;
  location / { try_files $uri $uri/ /index.html; }
  location /api/ { proxy_pass http://api:8080; }
}`,
          `# Spring Boot image (Dockerfile.api) - layered, non-root
FROM eclipse-temurin:21-jre
RUN useradd -r app
USER app
COPY target/hr-api.jar /app/hr-api.jar
ENTRYPOINT ["java", "-jar", "/app/hr-api.jar"]`,
        ),
        blk(`<h3>Cloud hosting fundamentals</h3>
• <b>IaaS</b> (a VM such as EC2, a droplet): you manage the OS. <b>PaaS/containers</b> (Azure App Service, Cloud Run, Elastic Beanstalk, Render, Fly.io): you provide an app or image. <b>Kubernetes</b> (EKS, AKS, GKE): many services at scale.<br>
• Typical low-cost layout: Angular static files on <b>object storage plus a CDN</b> (S3 + CloudFront, Azure Static Web Apps, Firebase Hosting, Netlify); Spring Boot in a container; <b>managed database</b> (RDS, Cloud SQL) with automated backups; secrets in the provider vault; a load balancer with TLS.<br>
• Think about regions, scaling, cost, and shared responsibility (you secure your app and data, the provider secures hardware).`),
      ],
      [
        blk(`<h3>Container best practices and pitfalls</h3>
• Pin base image versions (not <code>latest</code>), run as a <b>non-root</b> user (<code>nginxinc/nginx-unprivileged</code>), keep images small (alpine/distroless), scan with Trivy or Docker Scout and rebuild regularly for patches.<br>
• Order Dockerfile layers by change frequency (package files before source) for cache hits; use BuildKit cache mounts for npm. Never copy <code>.env</code> or secrets into images: image layers are readable by anyone with the image.<br>
• <b>Runtime config in containers</b>: generate <code>config.json</code> at container start from environment variables with an entrypoint script (<code>envsubst</code>) so the same image runs in every environment.<br>
• Add a <code>HEALTHCHECK</code>, graceful shutdown (Spring <code>server.shutdown=graceful</code>), resource limits and log to stdout/stderr, not files. The database must use a named volume and must <b>not</b> be exposed publicly. In Compose, <code>depends_on</code> with <code>service_healthy</code> only orders startup; the app still needs DB retry logic.<br>
• Zero-downtime on one host: run two replicas behind Nginx, or use blue/green with a proxy switch; on Kubernetes use rolling updates with readiness probes.<br>
• Angular SSR images need Node at runtime (<code>node dist/app/server/server.mjs</code>), unlike the static Nginx image above.`),
      ],
      [
        ['Why a multi-stage Docker build for Angular?', 'The Node build stage compiles the app; only the static output is copied into a small Nginx image, so the final image is small, fast and contains no build tools or source.'],
        ['Image versus container?', 'An image is an immutable template with the app and its dependencies; a container is a running instance of an image.'],
        ['What does Docker Compose add?', 'It defines and runs multi-container applications (web, API, database) with networks, volumes, environment and health checks from a single file.'],
        ['How do you handle secrets with Docker?', 'Keep them out of images and source: use Docker/Compose secrets, orchestrator secrets or environment injection at runtime from a vault.'],
        ['How would you host Angular plus Spring Boot in the cloud cheaply?', 'Angular static files on object storage with a CDN, Spring Boot as a container on a PaaS, and a managed PostgreSQL with backups.'],
      ],
    ),

    topic(
      'ngs-m24-operations-hardening',
      'Operations: monitoring, rollback, backup and hardening',
      [
        blk(`<h3>Keeping it running</h3>
• <b>Logging and monitoring</b>: logs say what happened (Nginx access/error logs, Spring Boot application logs), monitoring says how healthy it is now (uptime, CPU, memory, response times). Start with <code>tail -f /var/log/nginx/error.log</code> and <code>docker logs -f api</code>; add Spring Boot Actuator <code>/actuator/health</code> and an uptime checker.<br>
• <b>Error monitoring</b>: browser errors never reach your server logs unless you send them. Tools like Sentry capture exceptions with stack traces (readable through uploaded source maps).<br>
• <b>Rollback strategies</b>: the ability to go back to the previous working version within minutes.<br>
• <b>Versioned deployments</b>: every release has a version number and its own folder or image tag.<br>
• <b>Backup and recovery</b>: copies of the database, regularly, stored elsewhere, and <i>tested</i> by restoring.`,
          `# angular global error handler sending errors to a tracker
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  handleError(error: unknown) {
    console.error(error);
    // Sentry.captureException(error);        // forward to the monitoring service
  }
}
// app.config.ts: { provide: ErrorHandler, useClass: AppErrorHandler }`,
        ),
      ],
      [
        blk(`<h3>Release folders, rollback and backup scripts</h3>
Deploy each release into <code>/var/www/myapp/releases/&lt;version&gt;</code> and point Nginx at the <code>current</code> symlink. Rolling back is re-pointing the symlink (instant); keep the last five releases. With Docker, roll back by redeploying the previous image tag. Backups use <code>pg_dump</code> from cron with retention and an off-server copy.`,
          `#!/bin/bash
# deploy.sh - atomic release with instant rollback
set -euo pipefail
VERSION=$1
BASE=/var/www/myapp
mkdir -p $BASE/releases/$VERSION
tar -xzf /tmp/app-$VERSION.tgz -C $BASE/releases/$VERSION
ln -sfn $BASE/releases/$VERSION $BASE/current      # nginx root is /var/www/myapp/current
sudo nginx -t && sudo systemctl reload nginx
ls -1dt $BASE/releases/* | tail -n +6 | xargs -r rm -rf   # keep the last 5

# rollback.sh
PREV=$(ls -1dt /var/www/myapp/releases/* | sed -n 2p)
ln -sfn $PREV /var/www/myapp/current && echo "rolled back to $PREV"

# backup.sh (cron: 0 2 * * *)
pg_dump -U hr_user -h localhost hrdb | gzip > /backups/hrdb-$(date +%F).sql.gz
find /backups -name "*.sql.gz" -mtime +14 -delete
# restore test: gunzip -c hrdb-2025-01-10.sql.gz | psql -U hr_user -h localhost hrdb_restore`,
          `// main.ts - Sentry init (SDK API shown in outline; check the current @sentry/angular docs)
// Sentry.init({ dsn: environment.sentryDsn, release: environment.version, environment: 'production' });
// CI step: upload source maps to Sentry with the same release, then do NOT publish *.map files publicly.`,
        ),
      ],
      [
        blk(`<h3>Troubleshooting runbook and hardening</h3>
<b>Production troubleshooting</b> go layer by layer: (1) does DNS resolve (<code>dig</code>)? (2) is the port reachable and TLS valid (<code>curl -vI https://...</code>)? (3) Nginx up and config valid (<code>nginx -t</code>, error log)? (4) is the right release deployed (version endpoint, <code>current</code> symlink, image tag)? (5) API health and logs (<code>/actuator/health</code>, correlation id)? (6) database connectivity and disk space (<code>df -h</code>)? (7) browser: Network tab status codes, Console errors, stale cache or service worker? Typical culprits: SPA fallback missing, old cached <code>index.html</code> referencing deleted hashed files, CORS/mixed content, expired certificate, wrong environment config, out-of-memory kills.<br>
<b>Security hardening</b>:<br>
• Send headers: <code>Strict-Transport-Security</code>, <code>Content-Security-Policy</code>, <code>X-Content-Type-Options: nosniff</code>, <code>Referrer-Policy</code>, <code>Permissions-Policy</code>, and frame protection via CSP <code>frame-ancestors</code>. Hide the Nginx version (<code>server_tokens off</code>).<br>
• Expose only 80/443 (and SSH from known IPs); database and Spring Boot listen on localhost or a private network. SSH keys only, no root login, fail2ban, automatic security updates.<br>
• Least privilege for service accounts and database users; rate-limit login routes (<code>limit_req</code>); rotate secrets; keep dependencies patched (<code>npm audit</code>, Dependabot).<br>
• Monitoring in production: structured JSON logs with request ids, Actuator plus Prometheus/Grafana for metrics, alerts on error rate, latency, disk and certificate expiry, and Real User Monitoring for Core Web Vitals.<br>
• <b>Recovery objectives</b>: define RPO (how much data you can lose) and RTO (how long you can be down), rehearse restores, and store backups in another region or provider, encrypted.`,
          `# nginx security headers (inside server block)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'" always;
server_tokens off;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
location = /api/v1/auth/login { limit_req zone=login burst=5; proxy_pass http://127.0.0.1:8080; }`,
        ),
      ],
      [
        ['How do you roll back an Angular deployment?', 'Keep immutable versioned releases and switch the current symlink (or redeploy the previous image tag); keep the previous artifact available and make database migrations backward compatible.'],
        ['Why do users see a blank page or JS errors right after a deploy?', 'A cached index.html references hashed files that no longer exist (or the fallback returns index.html for missing JS). Serve index.html with no-cache, keep old assets for a while and return real 404s for missing assets.'],
        ['What belongs in a backup strategy?', 'Automated scheduled database dumps or snapshots, retention, off-site encrypted copies, defined RPO/RTO and periodic restore tests.'],
        ['How do you monitor frontend errors?', 'Install a global ErrorHandler that reports to a tool such as Sentry, tagged with the release and with source maps uploaded privately.'],
        ['Name key hardening steps for the server.', 'Open only 80/443, SSH keys and no root login, security headers (HSTS, CSP), hidden server version, rate limiting, patching, least-privilege accounts and secrets from a vault.'],
        ['What is your first step debugging "site is down"?', 'Work through layers: DNS, TLS/port, proxy status and logs, deployed version, API health, database/disk, then the browser console and network tab.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 25
const L25 = [
  'Angular CLI: creating projects and generating code',
  'Builds, dev server, compiler and AOT',
  'Code quality: ESLint and Prettier',
  'Debugging and profiling tools',
];

const mod25: SubTopic = {
  id: 'ngs-mod-25',
  name: 'Module 25 · Angular CLI and Developer Tools',
  topics: [
    overview(25, 'Angular CLI and Developer Tools', L25, [
      ['Angular CLI commands', 'The ng command: new, serve, generate, build, test, lint, update, add.', 1],
      ['Creating projects', 'ng new with flags for routing, style, SSR and standalone defaults.', 1],
      ['Generating components', 'ng generate component with inline template/style, OnPush, skip-tests.', 1],
      ['Generating services', 'ng generate service creates an injectable providedIn root.', 1],
      ['Generating directives', 'ng generate directive for attribute behaviour.', 1],
      ['Generating pipes', 'ng generate pipe for template transformations.', 1],
      ['Generating guards', 'ng generate guard produces a functional guard.', 1],
      ['Generating interceptors', 'ng generate interceptor produces a functional interceptor.', 1],
      ['Generating environments', 'ng generate environments creates environment files and fileReplacements.', 1],
      ['Build commands', 'ng build with configurations, output path, stats and watch.', 2],
      ['Development server', 'ng serve: live reload, HMR, proxy, ports and host.', 2],
      ['Production builds', 'Optimized hashed output with budgets.', 2],
      ['Build configuration', 'angular.json architect targets and configurations.', 2],
      ['Angular compiler', 'ngc / esbuild pipeline that turns TypeScript and templates into JavaScript.', 2],
      ['AOT compilation', 'Templates compiled at build time, not in the browser.', 2],
      ['Template type checking', 'strictTemplates checks bindings against component types.', 2],
      ['Source maps', 'Mappings from minified code back to TypeScript for debugging.', 2],
      ['ESLint', 'angular-eslint rules for TypeScript and templates.', 3],
      ['Prettier', 'Opinionated formatter that ends style debates.', 3],
      ['Browser DevTools', 'Elements, Console, Sources, Network, Application tabs.', 4],
      ['Angular DevTools', 'Chrome extension: component tree, signals, profiler.', 4],
      ['Network debugging', 'Inspect requests, headers, status, timing and CORS.', 4],
      ['Performance profiling', 'Profiler and Lighthouse to find slow change detection and bundles.', 4],
      ['Dependency analysis', 'Bundle stats, source-map-explorer, madge and npm ls.', 4],
      ['Debugging production issues', 'Source maps, error tracker, versions and reproducing with prod builds.', 4],
    ]),

    topic(
      'ngs-m25-cli-generate',
      'Angular CLI: creating projects and generating code',
      [
        blk(`<h3>The ng command is your power tool</h3>
The <b>Angular CLI</b> is a command-line program (<code>npm install -g @angular/cli</code>). Like Maven archetypes plus code generators for Java: it creates projects, generates correctly wired files, runs the dev server and builds. Most used commands: <code>ng new</code>, <code>ng serve</code>, <code>ng generate</code> (alias <code>g</code>), <code>ng build</code>, <code>ng test</code>, <code>ng update</code>, <code>ng add</code>, <code>ng version</code>.<br>
<b>Creating projects</b>: <code>ng new hr-portal</code> asks for style format, SSR and so on. Modern Angular creates standalone applications by default (no NgModule).`,
          `ng new hr-portal --routing --style=scss --ssr=false   # create a project
cd hr-portal
ng serve -o                                             # dev server on http://localhost:4200, opens browser
ng version                                              # CLI and framework versions
ng add @angular/material                                # install and configure a library with schematics`,
        ),
      ],
      [
        blk(`<h3>Generating code</h3>
<b>Generated files</b> follow the official style guide and add a <b>spec file</b>. Useful flags: <code>--dry-run</code> (preview), <code>--skip-tests</code>, <code>--inline-template</code>, <code>--inline-style</code>, <code>--change-detection OnPush</code>, <code>--flat</code>. Since Angular 20 the generated files use the new naming (for example <code>employee-list.ts</code> without the <code>.component</code> suffix); the style guide change is version dependent, so check your CLI version.`,
          `ng g c employee/employee-list --change-detection OnPush --inline-style   # component
ng g s core/api                   # service (providedIn: 'root')
ng g d shared/highlight           # attribute directive
ng g p shared/initials            # pipe
ng g guard core/auth              # asks which type: CanActivate etc. (functional guard)
ng g interceptor core/auth        # functional HttpInterceptorFn
ng g environments                 # environment.ts and environment.development.ts + fileReplacements
ng g interface models/employee    # plain TypeScript interface
ng g c ui/card --dry-run          # show what would be created without writing`,
          `// generated auth.guard.ts (functional guard)
import { CanActivateFn } from '@angular/router';
export const authGuard: CanActivateFn = (route, state) => {
  return true;        // replace with real logic: inject(AuthService).isLoggedIn() || router.createUrlTree(['/login'])
};

// generated auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
export const authInterceptor: HttpInterceptorFn = (req, next) => next(req);   // register with provideHttpClient(withInterceptors([authInterceptor]))`,
        ),
      ],
      [
        blk(`<h3>Schematics, defaults and migrations</h3>
• Every generator is a <b>schematic</b>. Set <b>project-wide defaults</b> in <code>angular.json</code> under <code>schematics</code> (for example OnPush and skipTests for all components) so the team generates consistent code. You can write custom schematics for company-specific templates.<br>
• <code>ng update @angular/core @angular/cli</code> runs <b>automated migrations</b> between versions; update one major version at a time, commit between steps and read the update guide at update.angular.dev. <code>ng generate @angular/core:standalone</code>, <code>:control-flow</code> and <code>:inject</code> migrate old code to modern syntax.<br>
• Cache and analytics: the CLI caches in <code>.angular/cache</code> (delete it when builds behave strangely); <code>ng analytics disable</code> turns off prompts in CI; <code>NG_CLI_ANALYTICS=false</code> is a common CI variable.<br>
• Use <code>npx @angular/cli@latest new</code> to try a version without installing globally, and pin the CLI version in <code>devDependencies</code> so CI and teammates match.`,
          `// angular.json - team-wide generation defaults
"schematics": {
  "@schematics/angular:component": { "changeDetection": "OnPush", "skipTests": false, "style": "scss" }
}

// migrations
ng update @angular/core@19 @angular/cli@19
ng generate @angular/core:control-flow        // *ngIf/*ngFor -> @if/@for
ng generate @angular/core:inject              // constructor injection -> inject()`,
        ),
      ],
      [
        ['What does ng generate do and why use it?', 'It runs a schematic that creates correctly named, wired files (and specs) following the style guide, saving time and keeping consistency.'],
        ['How do you preview generated files without creating them?', 'Add --dry-run to the ng generate command.'],
        ['How do you upgrade Angular safely?', 'Use ng update one major version at a time with the update guide, run the provided migrations, test and commit between steps.'],
        ['What does ng add do?', 'Installs a package and runs its schematic to configure the project (for example @angular/material or @angular/pwa).'],
        ['How do you set default options for generated components across a team?', 'Configure schematics defaults in angular.json (for example OnPush and style), so every ng g c follows them.'],
      ],
    ),

    topic(
      'ngs-m25-build-compiler',
      'Builds, dev server, compiler and AOT',
      [
        blk(`<h3>Serve, build and what the compiler does</h3>
• <b>Development server</b>: <code>ng serve</code> compiles in memory, serves on port 4200 and reloads the browser on save. Change the port with <code>--port</code>, expose to the network with <code>--host 0.0.0.0</code>, proxy the API with <code>--proxy-config</code>.<br>
• <b>Build commands</b>: <code>ng build</code> writes to <code>dist/</code>; <code>--configuration development</code> or <code>production</code>; <code>--watch</code> rebuilds on change; <code>--stats-json</code> creates data for bundle analysis.<br>
• <b>Production builds</b> optimize and hash files.<br>
• The <b>Angular compiler</b> translates your templates and decorators into efficient JavaScript instructions. <b>AOT</b> (ahead-of-time) does this at build time, so the browser downloads ready code, errors are found before release and no compiler ships to users. (Old JIT compiled in the browser.)`,
          `ng serve --port 4300 --host 0.0.0.0 --proxy-config proxy.conf.json
ng build --configuration development --watch
ng build --stats-json                 # then analyse dist/.../stats.json`,
        ),
      ],
      [
        blk(`<h3>Build configuration, template type checking and source maps</h3>
• <b>Build configuration</b>: angular.json has <i>architect</i> targets (<code>build</code>, <code>serve</code>, <code>test</code>) each with <code>options</code> and named <code>configurations</code>. Pick one with <code>-c</code>.<br>
• <b>Template type checking</b>: enable <code>strictTemplates</code> in <code>tsconfig.json</code> (<code>angularCompilerOptions</code>) so the compiler verifies every binding, pipe argument, event type and <code>@for</code> variable. It catches typos at build time that would otherwise appear at runtime.<br>
• <b>Source maps</b> map minified bundles back to TypeScript. They are on in development; in production you can generate them (<code>"sourceMap": true</code> or <code>{ "scripts": true, "hidden": true }</code>) and upload them privately to your error tracker rather than publishing them.`,
          `// tsconfig.json
{
  "compilerOptions": { "strict": true, "noImplicitOverride": true, "noPropertyAccessFromIndexSignature": true },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true          // checks template bindings against component types
  }
}

// angular.json
"build": {
  "builder": "@angular-devkit/build-angular:application",
  "options": { "outputPath": "dist/hr-portal", "browser": "src/main.ts", "tsConfig": "tsconfig.app.json" },
  "configurations": {
    "production": { "sourceMap": { "scripts": true, "hidden": true }, "outputHashing": "all" },
    "development": { "optimization": false, "sourceMap": true }
  },
  "defaultConfiguration": "production"
}`,
          `// What strictTemplates catches
@Component({ template: '<app-user-card [user]="usr" (selected)="onPick($event.id)" />' })   // error: 'usr' does not exist; did you mean 'user'?
export class Page { user = { id: 1 }; onPick(id: string) {} }                                // error: number not assignable to string`,
        ),
      ],
      [
        blk(`<h3>Under the hood: builders, Ivy and AOT details</h3>
• Angular 17+ projects use the <b>application builder</b> (esbuild for bundling plus the Angular compiler plugin, Vite for the dev server). It is much faster than the earlier webpack-based <code>browser</code> builder, supports SSR/prerendering in one pipeline, and outputs to <code>dist/&lt;app&gt;/browser</code> (and <code>server</code>). Migrate with <code>ng update</code>'s builder migration. Dev-server HMR for styles and templates works out of the box.<br>
• <b>Ivy</b> (default since v9) compiles each component into locality-friendly instructions (<code>ɵcmp</code>, <code>ɵɵelementStart</code>...). The compiler requires static analysability: templates must be known at build time, which is why template-only logic and strict types help tree-shaking. Libraries are published in partial-compiled form and linked by the app build.<br>
• <b>AOT limitations</b>: no dynamic template strings; decorator metadata must be statically resolvable. <code>ngc</code> still exists for library builds (<code>ng-packagr</code>).<br>
• <code>ng build --verbose</code>, <code>NG_BUILD_DEBUG_CACHE</code> and deleting <code>.angular/cache</code> help diagnose odd builds. Use <code>"budgets"</code> to guard size, and <code>NG_BUILD_MAX_WORKERS</code> to limit CPU in CI.<br>
• Differential loading is gone: Angular targets modern browsers (ES2022); the browserslist file controls support. Version notes: zoneless, signal forms and some builders are experimental in certain releases.`),
      ],
      [
        ['What is AOT compilation and why is it default?', 'AOT compiles templates to JavaScript at build time. It gives faster startup, smaller bundles, earlier error detection and better security because no template compiler runs in the browser.'],
        ['What does strictTemplates do?', 'It enables the strictest type checking of templates so wrong property names, argument types and event payloads fail the build.'],
        ['Why use source maps and should they be public in production?', 'They map minified code to TypeScript for debugging. In production generate them hidden and upload them to your error tracker rather than serving them publicly.'],
        ['What is the difference between ng serve and ng build?', 'ng serve builds in memory, serves and live-reloads for development; ng build writes files to dist for deployment.'],
        ['What is the Angular application builder?', 'The esbuild/Vite-based builder (default in v17+) that builds browser, server and prerendered output faster than the older webpack builder.'],
      ],
    ),

    topic(
      'ngs-m25-lint-format',
      'Code quality: ESLint and Prettier',
      [
        blk(`<h3>Linting and formatting</h3>
• <b>ESLint</b> reads your code and warns about mistakes and bad patterns (unused variables, missing track, inaccessible markup). Like Checkstyle/SpotBugs in Java.<br>
• <b>Prettier</b> rewrites the code layout (quotes, spacing, line width) automatically so nobody argues about style, like a Java formatter.<br>
Setup: <code>ng add angular-eslint</code> then <code>npx ng lint</code>. Install Prettier with npm and add a <code>.prettierrc</code>.`,
          `ng add angular-eslint        # adds ESLint with Angular rules and a lint target
npx ng lint                   # run checks
npm install --save-dev prettier eslint-config-prettier
npx prettier --write "src/**/*.{ts,html,scss}"`,
        ),
      ],
      [
        blk(`<h3>A sensible configuration and automation</h3>
Use the <b>flat config</b> (<code>eslint.config.js</code>) that angular-eslint generates, extend recommended rules plus the template-accessibility ruleset, and let <code>eslint-config-prettier</code> disable rules that clash with Prettier (ESLint finds problems, Prettier formats). Run both in a <b>pre-commit hook</b> (Husky + lint-staged) and in <b>CI</b>; <b>Prettier</b> formats, <b>ESLint</b> checks.`,
          `// eslint.config.js (angular-eslint flat config, abridged)
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      '@angular-eslint/prefer-standalone': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  { files: ['**/*.html'], extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility] },
);`,
          `// .prettierrc
{ "singleQuote": true, "printWidth": 120, "trailingComma": "all" }

// package.json
"lint-staged": { "*.{ts,html}": ["eslint --fix", "prettier --write"], "*.scss": "prettier --write" },
"scripts": { "lint": "ng lint", "format:check": "prettier --check \\"src/**/*.{ts,html,scss}\\"" }`,
        ),
      ],
      [
        blk(`<h3>Rules that matter and rollout tips</h3>
• High-value Angular rules: <code>no-output-native</code>, <code>no-input-rename</code>, <code>template/eqeqeq</code>, <code>template/no-negated-async</code>, <code>template/click-events-have-key-events</code> and <code>interactive-supports-focus</code> (accessibility), <code>prefer-standalone</code>, <code>prefer-signals</code> (newer versions), <code>use-lifecycle-interface</code>. Combine with typescript-eslint's type-aware rules (<code>no-floating-promises</code>, <code>no-misused-promises</code>) for async safety; they are slower, so scope them.<br>
• Introduce lint on a legacy codebase gradually: errors only for new rules on changed files (lint-staged), warnings elsewhere, and auto-fix with <code>--fix</code> in a dedicated commit so blame stays useful. Use <code>.git-blame-ignore-revs</code> for the formatting commit.<br>
• Keep one source of truth: <code>.editorconfig</code> for indentation, Prettier for layout, ESLint for correctness. Do not duplicate stylistic rules in ESLint.<br>
• CI: <code>ng lint</code> and <code>prettier --check</code> fail the build; enforce the same versions via lock file. Version note: ESLint 9 uses flat config by default; older projects have <code>.eslintrc.json</code>. TSLint is dead; ignore old tutorials.`),
      ],
      [
        ['ESLint versus Prettier?', 'ESLint finds code problems and enforces rules; Prettier only formats layout. Use both and disable formatting rules in ESLint with eslint-config-prettier.'],
        ['How do you install ESLint in an Angular project?', 'Run ng add angular-eslint, which adds the configuration and a lint target used by ng lint.'],
        ['How do you enforce quality before code is merged?', 'Husky/lint-staged pre-commit hooks for fast checks and CI jobs running ng lint, prettier --check, tests and build as required PR checks.'],
        ['Which ESLint rules help accessibility in Angular templates?', 'The templateAccessibility set: alt-text, click-events-have-key-events, interactive-supports-focus, label-has-associated-control and valid-aria.'],
      ],
    ),

    topic(
      'ngs-m25-debugging-tools',
      'Debugging and profiling tools',
      [
        blk(`<h3>Looking inside the running app</h3>
• <b>Browser DevTools</b> (F12): <b>Elements</b> (DOM and CSS), <b>Console</b> (errors, <code>console.log</code>), <b>Sources</b> (breakpoints in TypeScript thanks to source maps), <b>Network</b> (every request), <b>Application</b> (localStorage, cookies, service workers).<br>
• <b>Angular DevTools</b>: a browser extension adding an "Angular" tab with the <b>component tree</b>, inputs/outputs and state, signal values and a <b>profiler</b>.<br>
• <b>Network debugging</b>: check the status code, request payload, response body, headers (Authorization, CORS), timing and the red "blocked by CORS" messages.`,
          `// handy debugging helpers
debugger;                              // pauses when DevTools is open
console.table(this.employees());       // readable arrays
// In the console, with a component selected in Elements:  ng.getComponent($0)   (development builds only)
// Angular DevTools: select a component, view signals and inspect injected services`,
        ),
      ],
      [
        blk(`<h3>Profiling, dependency analysis and a debugging workflow</h3>
• <b>Performance profiling</b>: in Angular DevTools Profiler record an interaction and see which components were checked and how long each change-detection cycle took. In Chrome's Performance tab look for long tasks; Lighthouse reports Core Web Vitals and bundle warnings.<br>
• <b>Dependency analysis</b>: find what makes bundles large and what depends on what.<br>
• Workflow: reproduce, read the console error, check Network, set a breakpoint, inspect state in Angular DevTools, fix, add a test.`,
          `# bundle analysis
ng build --stats-json
npx esbuild-visualizer --metadata dist/hr-portal/stats.json --open      # treemap of the bundle (esbuild builder)
# older webpack builder:  npx webpack-bundle-analyzer dist/hr-portal/stats.json
npx source-map-explorer dist/hr-portal/browser/main-*.js                # needs source maps

# dependency graph and circular imports
npx madge --circular --extensions ts src/
npm ls rxjs                      # which versions are installed?
npm outdated && npm audit        # stale and vulnerable packages`,
          `// measure a section in code
performance.mark('list-start');
// ... render work ...
performance.mark('list-end');
performance.measure('list-render', 'list-start', 'list-end');     // appears in the Performance tab

// log change detection hits while investigating (remove afterwards)
ngDoCheck() { console.count('CD ' + this.constructor.name); }`,
        ),
      ],
      [
        blk(`<h3>Debugging production issues</h3>
Production builds are minified, so stack traces say <code>at e.t (main-4f2a.js:1:33021)</code>. Approach:<br>
• Use an <b>error tracker</b> (Sentry, Application Insights) with the release id and privately uploaded source maps to get readable stack traces plus breadcrumbs (clicks, requests).<br>
• Reproduce with a local production build served statically (<code>npx http-server dist/.../browser -c-1</code> with a SPA fallback) because AOT, minification and strict CD (e.g. <code>ExpressionChangedAfterItHasBeenChecked</code> appears only in dev) behave differently; check the Network tab for 4xx/5xx and compare the deployed version number.<br>
• Add a <b>correlation id</b> header in an interceptor and log it in Spring Boot so one user action can be traced across both logs.<br>
• Use feature flags and remote logging for hard-to-reproduce issues; capture the user agent, route and app version in every report. Chrome's "Override content" and local overrides let you test a fix against production assets.<br>
• Common production-only bugs: stale cache after deploy, missing SPA fallback, CORS misconfiguration, wrong runtime config, <code>window</code> usage during SSR, differences in locale or timezone, and memory leaks from unsubscribed streams (use the Memory tab heap snapshots; compare snapshots to see detached DOM nodes).<br>
• Source maps stay off the public web server but the browser's DevTools can load them locally when you drop them in (Sources, Add source map).`,
          `// correlation-id.interceptor.ts
export const correlationInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { 'X-Correlation-Id': crypto.randomUUID() } }));
// Spring Boot: read the header in a filter and put it in the logging MDC so every log line carries it.`,
        ),
      ],
      [
        ['What does Angular DevTools offer that normal DevTools do not?', 'A component tree with inputs, state and signals, and a profiler that shows change detection cycles per component.'],
        ['How do you find why a bundle is big?', 'Build with --stats-json and open it in a visualizer (esbuild-visualizer or source-map-explorer) to see which libraries and modules dominate, then lazy load or replace them.'],
        ['How do you debug a production-only error?', 'Use an error tracker with source maps, reproduce with a local production build, check network responses and the deployed version, and trace with a correlation id across frontend and backend.'],
        ['How do you spot a memory leak?', 'Take heap snapshots in the Memory tab before and after navigating; growth in detached DOM nodes or listeners signals unsubscribed streams or retained references.'],
        ['What can you see in the Network tab for an API bug?', 'Status code, request URL and payload, headers such as Authorization and CORS, the response body and timing.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 26
const L26 = [
  'Application structure, boundaries, monorepos and microfrontends',
  'Component patterns and reusable forms',
  'Design patterns in Angular',
  'State, service layer, API abstraction and error architecture',
  'DDD, clean code, SOLID, reviews and refactoring',
];

const mod26: SubTopic = {
  id: 'ngs-mod-26',
  name: 'Module 26 · Architecture and Design Patterns',
  topics: [
    overview(26, 'Architecture and Design Patterns', L26, [
      ['Angular application architecture', 'Layers: UI components, facades/state, data access, shared utilities.', 1],
      ['Feature-based folder structure', 'Group files by feature (employees, billing) not by type.', 1],
      ['Core and shared concepts', 'core = app-wide singletons, shared = reusable dumb UI and pipes.', 1],
      ['Standalone application architecture', 'No NgModules: route-level providers, lazy loadComponent.', 1],
      ['Smart and presentational components', 'Smart fetch and decide; presentational only render inputs and emit outputs.', 2],
      ['Container and UI component patterns', 'The same idea named container/view; keeps UI testable and reusable.', 2],
      ['Facade pattern', 'One simple service hiding state, API and side effects from components.', 3],
      ['Repository pattern', 'A data-access service hiding where data comes from.', 3],
      ['Adapter pattern', 'Converts API shapes to UI models and back.', 3],
      ['Strategy pattern', 'Swappable algorithms chosen via DI tokens.', 3],
      ['Observer pattern', 'RxJS and signals as built-in observers.', 3],
      ['Dependency Injection patterns', 'Tokens, factories, multi providers, scoped providers.', 3],
      ['State management patterns', 'Service+signals store, NgRx, component-local state.', 4],
      ['Service layer design', 'Separate API, domain and UI-state services.', 4],
      ['Component composition', 'Build with content projection and small parts instead of inheritance or giant inputs.', 2],
      ['Reusable form architecture', 'Form-section components, ControlValueAccessor and typed form factories.', 2],
      ['API abstraction', 'Components never know URLs; a data layer hides HTTP.', 4],
      ['Error handling architecture', 'Interceptor, global handler, UI notification and logging.', 4],
      ['Feature boundaries', 'Public API per feature; lint rules forbid deep imports.', 1],
      ['Domain-driven design fundamentals', 'Ubiquitous language, bounded contexts, entities and value objects.', 5],
      ['Modular architecture', 'Independent, lazily loaded feature slices.', 1],
      ['Microfrontend design', 'Independently deployed frontends composed at runtime.', 1],
      ['Monorepo architecture', 'Several apps and libraries in one workspace (Nx or Angular workspace).', 1],
      ['Maintainability and scalability', 'Conventions, small units, tests and boundaries that keep change cheap.', 5],
      ['Clean code principles', 'Names, small functions, no duplication, no magic numbers.', 5],
      ['SOLID principles in Angular', 'Five design principles applied to services, components and DI.', 5],
      ['Code review practices', 'Checklists and etiquette that improve quality and sharing.', 5],
      ['Refactoring strategies', 'Small, safe, test-backed steps, including migrating to signals and standalone.', 5],
    ]),

    topic(
      'ngs-m26-structure-boundaries',
      'Application structure, boundaries, monorepos and microfrontends',
      [
        blk(`<h3>Organise by feature, like Java packages by domain</h3>
• <b>Angular application architecture</b>: think in layers: UI components, a layer that holds state and logic (facades/stores), a data-access layer (HTTP), and shared utilities. Dependencies point inward: UI to facade to data access, never the other way.<br>
• <b>Feature-based folder structure</b>: put everything about employees in <code>features/employees</code> (components, routes, services, models), not all components in one folder and all services in another.<br>
• <b>Core and shared concepts</b>: <code>core/</code> holds app-wide singletons used once (auth service, interceptors, layout shell). <code>shared/</code> holds reusable, stateless building blocks (buttons, pipes, directives) with no knowledge of any feature.<br>
• <b>Standalone application architecture</b>: no NgModules; each route lazily loads a component or a route array with its own providers.`,
          `src/app/
  core/                    # singletons: auth.service.ts, auth.interceptor.ts, error-handler.ts, layout/
  shared/                  # ui/ (button, modal), pipes/, directives/, util/
  features/
    employees/
      data-access/         # employee.api.ts, employee.store.ts, employee.model.ts
      ui/                  # employee-card.component.ts (presentational)
      pages/               # employee-list.page.ts, employee-detail.page.ts (containers)
      employees.routes.ts  # lazy route array
    billing/ ...
  app.routes.ts
  app.config.ts`,
        ),
      ],
      [
        blk(`<h3>Lazy feature routes and feature boundaries</h3>
Each feature exposes a <b>public API</b> (an <code>index.ts</code> barrel or its route file) and hides the rest. Features should not import each other's internals; shared needs go to <code>shared</code> or a domain library. Enforce <b>feature boundaries</b> with ESLint (<code>@nx/enforce-module-boundaries</code> in Nx, or <code>no-restricted-imports</code> patterns).`,
          `// app.routes.ts - standalone lazy loading with route-level providers
export const routes: Routes = [
  { path: '', component: ShellComponent, children: [
    { path: 'employees', loadChildren: () => import('./features/employees/employees.routes').then(m => m.EMPLOYEE_ROUTES) },
    { path: 'billing',   loadChildren: () => import('./features/billing/billing.routes').then(m => m.BILLING_ROUTES) },
  ]},
];

// features/employees/employees.routes.ts
export const EMPLOYEE_ROUTES: Routes = [{
  path: '',
  providers: [EmployeeStore, EmployeeApi],                  // exists only while this feature is loaded
  children: [
    { path: '', component: EmployeeListPage },
    { path: ':id', component: EmployeeDetailPage },
  ],
}];

// .eslintrc excerpt - forbid reaching into another feature
// "no-restricted-imports": ["error", { "patterns": ["**/features/*/data-access/*", "**/features/*/ui/*"] }]`,
        ),
        blk(`<h3>Modular architecture</h3>
<b>Modular architecture</b> means each feature can be understood, tested, loaded and even owned by a team on its own. In standalone Angular the unit of modularity is the route array plus its components and providers, not an NgModule. Legacy NgModules still work and can be migrated feature by feature.`),
      ],
      [
        blk(`<h3>Monorepos and microfrontends</h3>
• <b>Monorepo architecture</b>: one repository with several applications (admin, customer) and <b>libraries</b> (ui, data-access, util) built with the Angular workspace (<code>ng g library</code>, <code>projects/</code> folder) or <b>Nx</b> (computation cache, affected builds, generators, module-boundary rules). Benefits: atomic changes, shared tooling, easy reuse. Costs: CI tooling, ownership rules, build time without caching. Use path aliases in <code>tsconfig.base.json</code> (<code>@acme/ui</code>).<br>
• <b>Microfrontend design</b>: split a very large product into independently deployed frontends owned by different teams, composed in a shell using <b>Native Federation</b> (<code>@angular-architects/native-federation</code>, works with the esbuild builder) or webpack <b>Module Federation</b>. Share singletons (Angular core, RxJS) carefully, keep a thin shared contract (events, a shared auth token, design tokens), version remotes independently and avoid shared mutable state. Alternatives are simpler: iframes, or just a monorepo with lazy features. Microfrontends add real operational cost (versions, duplicated bundles, cross-app routing); adopt them for organisational scaling, not for code organisation.<br>
• Scalability checklist: single responsibility folders, enforced boundaries, lazy loading by route, shared design system library, consistent naming, automated tests per layer, architecture decision records (ADRs).`,
          `// Nx style library layout and aliases (tsconfig.base.json)
// "paths": { "@acme/ui": ["libs/ui/src/index.ts"], "@acme/employees/data-access": ["libs/employees/data-access/src/index.ts"] }

// shell host (Native Federation) - loading a remote lazily
{ path: 'orders', loadChildren: () => loadRemoteModule('orders', './routes').then(m => m.ORDER_ROUTES) }`,
        ),
      ],
      [
        ['Why organise Angular code by feature instead of by type?', 'Related files change together, features can be lazy loaded and owned by a team, and deleting or moving a feature is simple.'],
        ['What belongs in core and what in shared?', 'Core holds app-wide singletons (auth, interceptors, shell) loaded once; shared holds reusable stateless UI, pipes and directives with no feature knowledge.'],
        ['How do you enforce feature boundaries?', 'Expose a public API per feature and use lint rules (Nx module boundaries or no-restricted-imports) to forbid deep imports across features.'],
        ['When would you choose a monorepo?', 'When several apps share libraries and need atomic changes and common tooling; use Nx or the Angular workspace with caching and affected builds.'],
        ['When are microfrontends justified?', 'For large products with many teams needing independent deployment; they add complexity (shared deps, routing, versioning), so use a monorepo with lazy features first.'],
      ],
    ),

    topic(
      'ngs-m26-component-patterns',
      'Component patterns and reusable forms',
      [
        blk(`<h3>Smart and presentational components</h3>
• A <b>smart (container) component</b> knows about services, loads data and handles events. A <b>presentational (UI) component</b> only receives data with <code>input()</code> and reports user actions with <code>output()</code>. Analogy: the smart component is the chef (decides and cooks), the presentational component is the plate (shows what it is given).<br>
• The <b>container and UI component pattern</b> is the same idea under different names. It makes UI parts reusable, easy to test (no HTTP) and fast with OnPush.`,
          `// employee-card.component.ts - presentational
@Component({
  selector: 'app-employee-card', changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<h3>{{ employee().name }}</h3><button (click)="remove.emit(employee().id)">Delete</button>',
})
export class EmployeeCardComponent {
  employee = input.required<Employee>();
  remove = output<number>();
}

// employee-list.page.ts - container
@Component({
  imports: [EmployeeCardComponent],
  template: '@for (e of store.employees(); track e.id) { <app-employee-card [employee]="e" (remove)="store.remove($event)" /> }',
})
export class EmployeeListPage { store = inject(EmployeeStore); }`,
        ),
      ],
      [
        blk(`<h3>Component composition and reusable form architecture</h3>
• <b>Component composition</b>: prefer small components combined with <b>content projection</b> (<code>ng-content</code>, slots, <code>ng-template</code> inputs) over deep inheritance or components with 20 inputs. A card, table or dialog exposes slots; the caller composes.<br>
• <b>Reusable form architecture</b>: split large forms into <b>sub-form components</b> that receive a typed <code>FormGroup</code> as input (or implement <code>ControlValueAccessor</code> for single-value widgets such as a date picker). Centralise validation messages and reuse validators in a shared file. Use <code>NonNullableFormBuilder</code> and typed forms.`,
          `// address-form.component.ts - reusable sub-form
export type AddressForm = FormGroup<{ street: FormControl<string>; city: FormControl<string>; zip: FormControl<string> }>;

@Component({
  selector: 'app-address-form', imports: [ReactiveFormsModule],
  template: '<div [formGroup]="group()"><input formControlName="street"><input formControlName="city"><input formControlName="zip"></div>',
})
export class AddressFormComponent {
  group = input.required<AddressForm>();
  static build(fb: NonNullableFormBuilder): AddressForm {
    return fb.group({ street: ['', Validators.required], city: ['', Validators.required], zip: ['', Validators.pattern('[0-9]{5,6}')] });
  }
}

// parent
form = this.fb.group({ name: [''], address: AddressFormComponent.build(this.fb) });
// <app-address-form [group]="form.controls.address" />

// card.component.html - composition by slots
// <section class="card"><header><ng-content select="[card-title]" /></header><ng-content /><footer><ng-content select="[card-actions]" /></footer></section>`,
        ),
      ],
      [
        blk(`<h3>Rules of thumb and traps</h3>
• Presentational components should be <b>OnPush</b>, take plain data, and avoid injecting feature services. If a UI component needs three services, it is probably a container.<br>
• Avoid "boolean explosion" (<code>[showHeader] [showFooter] [compact] [rounded]</code>); use slots or a configuration object. Avoid component inheritance; share behaviour through directives, <b>host directives</b>, services or composition functions.<br>
• Container nesting: avoid containers inside every level (prop-drilling is not evil in Angular; signals and DI make passing data cheap). One container per route page is a good default; use an injected store for deeper sharing.<br>
• Reusable forms: keep the <i>form model</i> separate from the <i>API model</i> (map in the container or an adapter); pass only the sub-group a child needs; expose validation through the group so parents see child errors; use <code>ControlValueAccessor</code> for leaf widgets and avoid two-way plumbing of many values. Typed forms catch rename errors at compile time. Unsubscribe via <code>takeUntilDestroyed</code>.<br>
• Test presentational components with plain inputs, containers with a fake store.`),
      ],
      [
        ['Smart versus presentational components?', 'Smart components get data and coordinate services; presentational components render inputs and emit outputs only. This improves reuse, testing and OnPush performance.'],
        ['Why prefer composition over inheritance for components?', 'Inheritance couples templates, lifecycle and DI; composition with content projection, directives and services is more flexible and easier to test.'],
        ['How do you make a big form reusable?', 'Split it into sub-form components taking a typed FormGroup (or ControlValueAccessor for single controls) and share validators and messages.'],
        ['What is a sign of a component doing too much?', 'Many inputs/booleans, several injected feature services, mixed HTTP and presentation logic, or hard-to-test behaviour.'],
      ],
    ),

    topic(
      'ngs-m26-design-patterns',
      'Design patterns in Angular',
      [
        blk(`<h3>Patterns you already know from Java, in Angular clothes</h3>
• <b>Facade pattern</b>: one simple service in front of several complicated ones. Components call <code>employeeFacade.load()</code> and do not care about stores, APIs or caching.<br>
• <b>Repository pattern</b>: a service that hides where data comes from (REST, cache, local storage). Components ask for employees, not for URLs.<br>
• <b>Adapter pattern</b>: converts one shape into another, such as an API DTO into a UI model (rename fields, parse dates).<br>
• <b>Strategy pattern</b>: swap an algorithm at runtime, such as different discount or sorting rules, chosen through DI.<br>
• <b>Observer pattern</b>: built in. RxJS <code>Observable</code>/<code>Subject</code> and signals are observers: subscribers react when the source changes.<br>
• <b>Dependency Injection patterns</b>: Angular's DI is the Spring DI of the frontend.`,
          `// facade: one entry point for a screen
@Injectable({ providedIn: 'root' })
export class EmployeeFacade {
  private repo = inject(EmployeeRepository);
  private _list = signal<Employee[]>([]);
  readonly employees = this._list.asReadonly();
  load() { this.repo.getAll().subscribe(l => this._list.set(l)); }
}

// observer: subscribe to changes
total$ = this.cart.items$.pipe(map(items => items.reduce((s, i) => s + i.price, 0)));`,
        ),
      ],
      [
        blk(`<h3>Repository, adapter and strategy with DI</h3>
An abstract class (or <code>InjectionToken</code>) is the interface; different providers implement it. Swap implementations per environment, per route, or in tests without touching consumers.`,
          `// repository + adapter
export abstract class EmployeeRepository { abstract getAll(): Observable<Employee[]>; }

@Injectable({ providedIn: 'root' })
export class HttpEmployeeRepository extends EmployeeRepository {
  private http = inject(HttpClient);
  getAll() {
    return this.http.get<EmployeeDto[]>(environment.apiUrl + '/employees').pipe(map(list => list.map(toEmployee)));
  }
}
// adapter: DTO -> UI model
export const toEmployee = (d: EmployeeDto): Employee => ({
  id: d.id, fullName: d.firstName + ' ' + d.lastName, joined: new Date(d.joinDate), active: d.status === 'ACTIVE',
});

// app.config.ts - choose implementation
{ provide: EmployeeRepository, useClass: HttpEmployeeRepository }
// tests / demo:  { provide: EmployeeRepository, useClass: InMemoryEmployeeRepository }`,
          `// strategy via injection token
export interface DiscountStrategy { apply(total: number): number; }
export const DISCOUNT = new InjectionToken<DiscountStrategy>('DISCOUNT');

const festival: DiscountStrategy = { apply: t => t * 0.9 };
const none: DiscountStrategy = { apply: t => t };

@Component({ providers: [{ provide: DISCOUNT, useValue: festival }] })    // or choose with a factory from config
export class CheckoutComponent { private discount = inject(DISCOUNT); pay(t: number) { return this.discount.apply(t); } }

// multi providers = strategy registry
{ provide: VALIDATORS, useClass: EmailRule, multi: true }, { provide: VALIDATORS, useClass: ZipRule, multi: true }
rules = inject(VALIDATORS);   // array of all rules`,
        ),
      ],
      [
        blk(`<h3>When patterns help and when they hurt</h3>
• <b>Facade</b> is valuable when a screen touches several services or a store; do not add a facade that just forwards one call. With signal stores, the store itself often is the facade.<br>
• <b>Repository</b> is worth it when data sources may vary (API plus cache, offline sync) or when you want fakes in tests. For simple CRUD, an HTTP service is already the repository; extra abstraction is premature.<br>
• <b>Adapters</b> belong at the boundary (in the data-access layer) so the rest of the app uses the clean model; this isolates you from backend renames. Keep them pure functions, easily unit tested. Convert dates and money once.<br>
• <b>Observer</b>: pick signals for synchronous state and RxJS for events over time; avoid manual <code>Subject</code> event buses spread across features, which hide dependencies. Always complete or unsubscribe (<code>takeUntilDestroyed</code>, <code>async</code> pipe).<br>
• <b>DI patterns</b>: use <code>providedIn: 'root'</code> for app singletons; component or route providers for scoped instances; <code>InjectionToken</code> with factory for configuration; <code>multi: true</code> for plug-in lists; <code>inject()</code> in functions (guards, interceptors) and in injection contexts only; <code>runInInjectionContext</code> for tests; <code>Optional/Self/SkipSelf</code> for hierarchical lookups. Prefer abstract class tokens over TypeScript interfaces (interfaces vanish at runtime).<br>
• Over-engineering warning: patterns exist to reduce change cost; do not add one without a concrete pressure (testing, multiple implementations, boundary).`),
      ],
      [
        ['What is the facade pattern in Angular?', 'A service offering a simple API for a screen or feature that hides stores, repositories and side effects from components.'],
        ['How would you implement the strategy pattern?', 'Define an interface/abstract class or InjectionToken, provide different implementations (or multi providers) and inject the chosen one where needed.'],
        ['Why use an adapter between API and UI?', 'It isolates the UI from backend naming and format, so API changes only affect the mapping function.'],
        ['How does Angular implement the observer pattern?', 'Through RxJS Observables and Subjects (subscribers are notified of emissions) and through signals whose consumers update when the value changes.'],
        ['Why use abstract classes as DI tokens instead of interfaces?', 'TypeScript interfaces do not exist at runtime; a class or InjectionToken can be used as a DI key.'],
      ],
    ),

    topic(
      'ngs-m26-state-services-errors',
      'State, service layer, API abstraction and error architecture',
      [
        blk(`<h3>Who owns what</h3>
• <b>State management patterns</b>: keep state as local as possible. Component signals for UI-only state, a feature store service for shared feature data, NgRx only for large, complex cross-feature state.<br>
• <b>Service layer design</b>: split services by responsibility: <i>API services</i> (HTTP only), <i>state/store services</i> (hold signals), <i>domain services</i> (pure business rules), <i>UI services</i> (toasts, dialogs).<br>
• <b>API abstraction</b>: components never build URLs or handle HTTP; they call typed methods.<br>
• <b>Error handling architecture</b>: errors are caught at three levels: the HTTP interceptor (network/API), the global <code>ErrorHandler</code> (unexpected exceptions) and the component (expected, recoverable cases).`,
          `// a feature store with signals
@Injectable()
export class EmployeeStore {
  private api = inject(EmployeeApi);
  private state = signal<{ items: Employee[]; loading: boolean; error: string | null }>({ items: [], loading: false, error: null });
  readonly items = computed(() => this.state().items);
  readonly loading = computed(() => this.state().loading);
  load() {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.list().subscribe({
      next: items => this.state.set({ items, loading: false, error: null }),
      error: e => this.state.update(s => ({ ...s, loading: false, error: e.message })),
    });
  }
}`,
        ),
      ],
      [
        blk(`<h3>A layered data-access and error pipeline</h3>
Create a thin typed API client, error classes that carry meaning, one interceptor that normalises errors and one global handler that logs the unexpected. Components show messages from the store or a notification service, not raw <code>HttpErrorResponse</code>.`,
          `// api-client.ts - the only place that knows HttpClient and the base URL
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private http = inject(HttpClient);
  private base = inject(API_BASE_URL);                       // InjectionToken<string>
  get<T>(path: string, params?: Record<string, string | number>) { return this.http.get<T>(this.base + path, { params }); }
  post<T, B>(path: string, body: B) { return this.http.post<T>(this.base + path, body); }
}

// app-error.ts
export class AppError extends Error {
  constructor(message: string, readonly kind: 'network' | 'auth' | 'validation' | 'server', readonly details?: unknown) { super(message); }
}
export const toAppError = (e: HttpErrorResponse): AppError =>
  e.status === 0 ? new AppError('Cannot reach server', 'network')
  : e.status === 401 || e.status === 403 ? new AppError('Not allowed', 'auth')
  : e.status === 400 || e.status === 422 ? new AppError('Check the form', 'validation', e.error)
  : new AppError('Server error', 'server');

// error.interceptor.ts + global-error-handler.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => next(req).pipe(catchError(e => throwError(() => toAppError(e))));
@Injectable() export class GlobalErrorHandler implements ErrorHandler {
  handleError(e: unknown) { inject(LoggerService).error(e); inject(ToastService).show('Something went wrong'); }
}`,
        ),
      ],
      [
        blk(`<h3>Choosing and scaling the approach</h3>
• Selection guide: <b>local signal</b> for UI toggles; <b>service + signals</b> (or NgRx Signal Store) per feature; <b>NgRx Store</b> when you need time-travel debugging, strict unidirectional flow, many collaborating effects or large teams; server state caching via <code>httpResource</code>/<code>resource</code> or a query library.<br>
• Keep state <b>immutable</b>, normalised by id when shared, derive with <code>computed</code>, expose read-only signals (<code>asReadonly</code>) and mutate only through store methods (single writer). Avoid pushing derived data into the store.<br>
• Service layering rule: UI depends on state services; state services depend on API services; API services depend only on HttpClient and tokens. Never inject a component into a service; never let API services touch UI services.<br>
• Error architecture: distinguish <b>expected</b> errors (validation, 404) handled inline from <b>unexpected</b> ones (bugs) handled globally; add retry only for idempotent GETs and transient statuses (<code>retry</code> with backoff); correlate with request ids; do not swallow errors in <code>catchError(() =&gt; of([]))</code> without telling the user; show friendly text, log technical detail. Handle <code>NG0100</code>-type errors by fixing, not hiding them. For observables inside effects, handle errors in the stream to avoid killing it.<br>
• Version notes: <code>provideBrowserGlobalErrorListeners()</code> and <code>provideZonelessChangeDetection()</code> exist in recent versions; an unhandled promise rejection reaches <code>ErrorHandler</code> in zoneless apps only through those listeners.`),
      ],
      [
        ['How do you decide between service+signals and NgRx?', 'Start with local signals, then feature services with signals. Adopt NgRx when state is large, shared across many features, needs strict patterns, devtools and complex side-effect orchestration.'],
        ['What is a good service layering rule?', 'UI depends on state/facade services; state services depend on API services; API services depend only on HttpClient and configuration tokens.'],
        ['How do you design Angular error handling?', 'Interceptor for HTTP errors, a global ErrorHandler for unexpected errors with logging, and component-level handling for expected cases with friendly messages.'],
        ['What is API abstraction good for?', 'Components stay independent of URLs and HTTP details, so backend changes and mocks only affect the data-access layer.'],
        ['Why expose signals as readonly from a store?', 'Only the store should change state; asReadonly prevents consumers from calling set or update.'],
      ],
    ),

    topic(
      'ngs-m26-ddd-clean-solid',
      'DDD, clean code, SOLID, reviews and refactoring',
      [
        blk(`<h3>Thinking in the business domain</h3>
• <b>Domain-driven design fundamentals</b>: use the same words as the business (the <b>ubiquitous language</b>): Invoice, Enrollment, not DataItem. A <b>bounded context</b> is a part of the system with its own model (Billing and Support may both have a Customer, but with different fields). Entities have identity (Employee 42); value objects are defined by value (Money, DateRange).<br>
• <b>Maintainability and scalability</b>: code you can change cheaply and an app that stays fast and organised as it grows.<br>
• <b>Clean code principles</b>: meaningful names, small functions, one level of abstraction, no duplication (DRY), no magic numbers, comments explain why not what.`,
          `// domain models in the employees context
export type EmployeeId = number & { readonly brand: 'EmployeeId' };     // avoids mixing ids
export interface Money { readonly amount: number; readonly currency: 'INR' | 'USD'; }
export const addMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) throw new Error('Currency mismatch');
  return { amount: a.amount + b.amount, currency: a.currency };
};`,
        ),
      ],
      [
        blk(`<h3>SOLID in Angular</h3>
• <b>S</b>ingle Responsibility: a component renders, a service fetches, a pipe formats.<br>
• <b>O</b>pen/Closed: extend behaviour by adding a provider or directive, not by editing a long switch.<br>
• <b>L</b>iskov: any implementation provided for a token must honour its contract (a fake repository behaves like the real one).<br>
• <b>I</b>nterface Segregation: small interfaces/tokens (a component needing only <code>load()</code> should not depend on a 20-method service).<br>
• <b>D</b>ependency Inversion: depend on abstractions (abstract class/token) and let DI supply details.`,
          `// Open/Closed + Dependency Inversion: add a new exporter without editing existing code
export abstract class Exporter { abstract readonly format: string; abstract export(rows: unknown[]): Blob; }
export const EXPORTERS = new InjectionToken<Exporter[]>('EXPORTERS');

@Injectable() class CsvExporter extends Exporter { format = 'csv'; export(rows: unknown[]) { return new Blob([rows.map(r => Object.values(r as object).join(',')).join('\\n')]); } }
@Injectable() class JsonExporter extends Exporter { format = 'json'; export(rows: unknown[]) { return new Blob([JSON.stringify(rows)]); } }

providers: [{ provide: EXPORTERS, useClass: CsvExporter, multi: true }, { provide: EXPORTERS, useClass: JsonExporter, multi: true }]

@Injectable({ providedIn: 'root' })
export class ExportService {
  private exporters = inject(EXPORTERS);
  run(format: string, rows: unknown[]) { return this.exporters.find(e => e.format === format)!.export(rows); }
}`,
        ),
        blk(`<h3>Code review and refactoring</h3>
<b>Code review practices</b>: keep pull requests small, review for correctness, tests, security, readability and boundaries; be kind and specific; automate the boring part (lint, format, tests in CI); use a checklist. <b>Refactoring strategies</b>: change structure without changing behaviour, in small steps, with tests first (the "red-green-refactor" safety net). Typical Angular refactors: extract a presentational component, move HTTP into a service, replace <code>*ngIf/*ngFor</code> with <code>@if/@for</code>, constructor injection with <code>inject()</code>, RxJS state with signals, NgModules with standalone, <code>any</code> with real types.`,
          `# automated refactors provided by Angular
ng generate @angular/core:standalone
ng generate @angular/core:control-flow
ng generate @angular/core:inject
ng generate @angular/core:signal-input-migration        # @Input -> input()  (availability depends on Angular version)`,
        ),
      ],
      [
        blk(`<h3>Applying the principles with judgement</h3>
• <b>DDD in a frontend</b> is mostly: name things as the business does, split features along bounded contexts (a feature library per context), keep domain rules in pure functions or small classes (testable without Angular) and map API DTOs into domain models at the boundary. Do not mirror the entire backend model; the frontend model serves screens. Use branded types, discriminated unions and exhaustive <code>switch</code> to make invalid states unrepresentable (<code>type Load = { s: 'idle' } | { s: 'loading' } | { s: 'ok'; data: T } | { s: 'error'; e: string }</code>).<br>
• <b>Scalability signals</b>: lazy-loaded features, OnPush plus signals, virtual scrolling, bounded bundle budgets, and a CI that fails on boundary violations. Maintainability signals: low coupling, one reason to change, tests at the right level (many unit, some integration, few e2e), consistent conventions, documented decisions (ADRs), up-to-date dependencies.<br>
• <b>Clean code traps</b>: giant components, business logic in templates, deeply nested subscribes (use higher-order operators), boolean parameters, comment-driven code, premature abstraction (rule of three: abstract on the third repetition).<br>
• <b>Review checklist</b>: Does it follow the layering? Subscriptions cleaned up? OnPush-friendly (immutable updates)? Accessible markup? Types (no <code>any</code>)? Error and loading states? Tests? Security (no <code>innerHTML</code> without sanitising, no secrets)? Naming? Small enough to review in 20 minutes?<br>
• <b>Refactoring at scale</b>: use the strangler approach (new code in the new style, old code migrated when touched), feature flags, codemods and one migration per pull request; measure with bundle size and test coverage; never mix refactor and behaviour change in one commit.`),
      ],
      [
        ['What are ubiquitous language and bounded context?', 'Ubiquitous language is the shared vocabulary of developers and business used in code and conversation; a bounded context is an area where a given model and terms have one precise meaning.'],
        ['Give examples of SOLID in Angular.', 'Single responsibility for components/services/pipes; open/closed with multi providers and directives; dependency inversion with abstract tokens supplied by DI; interface segregation with small tokens; Liskov with faithful fakes.'],
        ['What belongs in a good Angular code review?', 'Correctness, tests, layering and boundaries, subscription cleanup, immutability and OnPush compatibility, accessibility, security, error/loading states and naming, in a small PR.'],
        ['How do you refactor safely?', 'Cover behaviour with tests, change structure in small steps, use Angular migration schematics, keep refactors separate from feature changes and release behind flags if risky.'],
        ['Name clean-code habits for Angular templates and components.', 'Small components, logic out of templates, descriptive names, no magic strings or numbers, typed models, one responsibility each and comments that explain why.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 27
const L27 = [
  'Accessibility fundamentals: semantics, ARIA, keyboard, focus, contrast',
  'Accessible forms, validation, dialogs and testing',
  'Internationalization: translation, locales, formats, RTL',
];

const mod27: SubTopic = {
  id: 'ngs-mod-27',
  name: 'Module 27 · Accessibility and Internationalization',
  topics: [
    overview(27, 'Accessibility and Internationalization', L27, [
      ['Accessibility fundamentals', 'Building so people with disabilities (and everyone) can use the app.', 1],
      ['Semantic HTML', 'Use button, nav, main, label, h1-h6 instead of generic div.', 1],
      ['ARIA roles and attributes', 'Extra labels and states for custom widgets when native HTML is not enough.', 1],
      ['Keyboard navigation', 'Everything reachable and usable with Tab, Enter, Space, Escape, arrows.', 1],
      ['Focus management', 'Move focus deliberately after route changes, dialogs and errors.', 1],
      ['Screen-reader support', 'Names, roles, states and live announcements.', 1],
      ['Accessible forms', 'Visible labels, hints, grouping and autocomplete.', 2],
      ['Accessible validation messages', 'Errors linked to inputs with aria-describedby and announced.', 2],
      ['Accessible dialogs', 'Focus trap, role dialog, Escape, return focus.', 2],
      ['Color contrast', 'Contrast ratios (4.5:1 text) and not using color alone.', 1],
      ['Responsive accessibility', 'Zoom, reflow, touch target size, orientation.', 1],
      ['WCAG fundamentals', 'POUR: Perceivable, Operable, Understandable, Robust; levels A, AA, AAA.', 1],
      ['Internationalization (i18n)', 'Designing the app so it can be translated and localized.', 3],
      ['Translation management', 'Extracting, translating and reviewing message files.', 3],
      ['Locale configuration', 'LOCALE_ID, registerLocaleData, build-time locales.', 3],
      ['Date and number formatting', 'Locale-aware date and number pipes and Intl API.', 3],
      ['Currency formatting', 'CurrencyPipe with code and locale.', 3],
      ['Right-to-left layouts', 'dir="rtl" and CSS logical properties for Arabic, Hebrew.', 3],
      ['Language switching', 'Build-per-locale vs runtime translation libraries.', 3],
      ['Accessibility testing', 'Automated (axe, Lighthouse, eslint) and manual (keyboard, screen reader) checks.', 2],
    ]),

    topic(
      'ngs-m27-a11y-fundamentals',
      'Accessibility fundamentals: semantics, ARIA, keyboard, focus, contrast',
      [
        blk(`<h3>Everyone should be able to use your app</h3>
<b>Accessibility (a11y)</b> means people with visual, hearing, motor or cognitive disabilities (and people with a broken arm, bright sunlight or a slow connection) can use your app. It is also a legal requirement in many places and improves SEO and usability for all.<br>
• <b>WCAG fundamentals</b>: the Web Content Accessibility Guidelines are organised as <b>POUR</b>: Perceivable, Operable, Understandable, Robust. Conformance levels A, AA (the normal target) and AAA.<br>
• <b>Semantic HTML</b>: use the right element. A real <code>&lt;button&gt;</code> is focusable, works with Enter/Space and is announced as a button; a <code>&lt;div (click)&gt;</code> is none of that. Use <code>nav</code>, <code>main</code>, <code>header</code>, headings in order, <code>ul</code> for lists, <code>label</code> for fields.<br>
• <b>Color contrast</b>: text needs at least <b>4.5:1</b> contrast (3:1 for large text and UI components) and information must never rely on color alone.`,
          `<!-- bad: not focusable, no role, mouse only -->
<div class="btn" (click)="save()">Save</div>

<!-- good: native semantics for free -->
<button type="button" (click)="save()">Save</button>

<nav aria-label="Main"><ul><li><a routerLink="/employees">Employees</a></li></ul></nav>
<main id="main-content"> <h1>Employees</h1> ... </main>`,
        ),
      ],
      [
        blk(`<h3>ARIA, keyboard, focus and screen readers</h3>
• <b>ARIA roles and attributes</b>: first rule of ARIA is "do not use ARIA if a native element works". Use it for custom widgets: <code>role</code>, <code>aria-label</code>, <code>aria-expanded</code>, <code>aria-controls</code>, <code>aria-live</code>. In Angular, bind with <code>[attr.aria-expanded]="open()"</code>.<br>
• <b>Keyboard navigation</b>: every action reachable with Tab/Shift+Tab, activated with Enter/Space, closed with Escape, menus and tabs with arrow keys. Never remove the focus outline without a visible replacement. Add a "skip to content" link.<br>
• <b>Focus management</b>: after a route change move focus to the new page heading; after opening a dialog move focus inside and return it to the trigger on close; after a failed submit focus the first invalid field.<br>
• <b>Screen-reader support</b>: every control needs an accessible name (visible text, label or <code>aria-label</code>); images need <code>alt</code> (empty for decorative); dynamic changes are announced through <code>aria-live</code> regions (the CDK <code>LiveAnnouncer</code>).<br>
• <b>Responsive accessibility</b>: layouts reflow at 320px width and 400% zoom without two-direction scrolling, touch targets at least 24x24 CSS px (44px recommended), do not lock orientation, and respect <code>prefers-reduced-motion</code>.`,
          `// a disclosure widget
@Component({
  selector: 'app-details', imports: [],
  template: '<button type="button" [attr.aria-expanded]="open()" aria-controls="panel1" (click)="open.set(!open())">{{ title() }}</button>' +
            '<div id="panel1" [hidden]="!open()"><ng-content /></div>',
})
export class DetailsComponent { title = input.required<string>(); open = signal(false); }

// skip link + focus the heading after navigation
// <a class="skip-link" href="#main-content">Skip to content</a>
export class AppComponent {
  constructor() {
    inject(Router).events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => document.querySelector<HTMLElement>('h1')?.focus());   // give h1 tabindex="-1"
  }
}

// live announcements with the CDK
private announcer = inject(LiveAnnouncer);
saved() { this.announcer.announce('Employee saved', 'polite'); }`,
          `/* focus visible and reduced motion */
:focus-visible { outline: 3px solid #1a73e8; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }`,
        ),
      ],
      [
        blk(`<h3>Deeper points for production apps</h3>
• Prefer native elements; when you build custom controls follow the <b>WAI-ARIA Authoring Practices</b> patterns (roles, states and key handling) or use <b>Angular CDK a11y</b> (<code>FocusTrap</code>, <code>FocusMonitor</code>, <code>ListKeyManager</code>, <code>LiveAnnouncer</code>) and Angular Material, which implement them. Bad ARIA is worse than none (a wrong role overrides correct native semantics).<br>
• SPA specifics: route changes do not reload the page, so screen-reader users get no cue. Update the document title (route <code>title</code> option) and move focus or announce the navigation. <code>Title</code> must be unique per page (WCAG 2.4.2).<br>
• Do not use <code>tabindex</code> greater than 0. Use <code>tabindex="-1"</code> for programmatic focus targets only. Use <code>inert</code> on background content or CDK focus trap for modals.<br>
• Contrast needs checking for hover, focus, disabled, placeholder and dark-mode states; tokens in CSS custom properties make this auditable. Do not rely on <code>opacity</code> for disabled text.<br>
• Angular specifics: <code>[attr.aria-*]</code> not <code>[aria-*]</code> (ARIA attributes are not DOM properties in most browsers); avoid <code>(click)</code> on non-interactive elements (the ESLint template rules flag it); <code>@for</code> lists should render real <code>ul/li</code> or table markup; keep DOM order equal to visual order. WCAG 2.2 adds focus-not-obscured, target size and accessible authentication criteria; the legal baseline is usually WCAG 2.1 AA (and the European Accessibility Act, ADA/Section 508 elsewhere).`),
      ],
      [
        ['What are the four WCAG principles?', 'Perceivable, Operable, Understandable and Robust (POUR), with conformance levels A, AA and AAA.'],
        ['Why use a button instead of a div with a click handler?', 'A native button is focusable, keyboard-operable (Enter/Space), announced correctly by screen readers and styled for states; a div has none of this unless you rebuild it with ARIA and key handlers.'],
        ['When should you use ARIA?', 'Only when native HTML cannot express the widget (tabs, tree, combobox); ARIA changes semantics but adds no behaviour, so you must also implement keyboard support.'],
        ['How do you manage focus in a single-page app?', 'Move focus to the new page heading after navigation, trap focus in dialogs and restore it to the trigger afterwards, and focus the first invalid field on failed submit.'],
        ['What contrast ratio is required for text?', 'WCAG AA requires at least 4.5:1 for normal text and 3:1 for large text and UI components.'],
      ],
    ),

    topic(
      'ngs-m27-forms-dialogs-testing',
      'Accessible forms, validation, dialogs and testing',
      [
        blk(`<h3>Forms people can actually complete</h3>
• <b>Accessible forms</b>: every input has a visible <code>&lt;label&gt;</code> linked by <code>for</code>/<code>id</code> (placeholders are not labels, they vanish). Group related fields with <code>fieldset</code> and <code>legend</code> (radio groups). Mark required fields in text, use correct <code>type</code> and <code>autocomplete</code>.<br>
• <b>Accessible validation messages</b>: show the error text next to the field, in text (not only red color), connect it with <code>aria-describedby</code> and set <code>aria-invalid</code>.<br>
• <b>Accessible dialogs</b>: a dialog has <code>role="dialog"</code> (or native <code>&lt;dialog&gt;</code>), an accessible name, traps focus, closes with Escape and returns focus to the button that opened it.`,
          `<!-- employee-form.component.html -->
<form [formGroup]="form" (ngSubmit)="submit()" novalidate>
  <label for="email">Email (required)</label>
  <input id="email" type="email" autocomplete="email" formControlName="email" required
         [attr.aria-invalid]="email.invalid && email.touched"
         [attr.aria-describedby]="email.invalid && email.touched ? 'email-err' : null">
  @if (email.invalid && email.touched) {
    <p id="email-err" class="error" role="alert">Enter a valid email address, for example name@company.com.</p>
  }
  <button type="submit">Save</button>
</form>`,
        ),
      ],
      [
        blk(`<h3>Dialogs and an error summary</h3>
Use the CDK/Material dialog (focus trap, Escape, restore focus built in) or the native <code>&lt;dialog&gt;</code> element opened with <code>showModal()</code>. For long forms, add an <b>error summary</b> at the top listing links to each invalid field, and focus it after a failed submit.`,
          `// confirm dialog with Angular Material (focus handled by the CDK)
openConfirm() {
  this.dialog.open(ConfirmDialog, { data: { text: 'Delete employee?' }, ariaLabelledBy: 'dlg-title', restoreFocus: true, autoFocus: 'first-tabbable' });
}

// native dialog alternative
// <dialog #dlg aria-labelledby="t"><h2 id="t">Delete employee?</h2> <button (click)="dlg.close()">Cancel</button></dialog>
// <button (click)="dlg.showModal()">Delete</button>

// error summary focus on failed submit
submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.summary().nativeElement.focus();            // <div #summary tabindex="-1" role="alert">...</div>
    return;
  }
}
summary = viewChild.required<ElementRef<HTMLElement>>('summary');`,
        ),
        blk(`<h3>Accessibility testing</h3>
Automate what can be automated, and test the rest by hand: (1) ESLint template accessibility rules; (2) <b>axe-core</b> in unit/e2e tests (jest-axe, <code>@axe-core/playwright</code>, cypress-axe); (3) Lighthouse accessibility score; (4) manual: keyboard-only pass, 200%/400% zoom, high-contrast mode, and a screen reader (NVDA or JAWS on Windows, VoiceOver on Mac, TalkBack on Android). Automation catches roughly a third of issues, so manual checks are required.`,
          `// playwright accessibility test
import AxeBuilder from '@axe-core/playwright';
test('employee list has no detectable a11y violations', async ({ page }) => {
  await page.goto('/employees');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});

// keyboard test
await page.keyboard.press('Tab');
await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();`,
        ),
      ],
      [
        blk(`<h3>Details that separate good from compliant</h3>
• Announce validation at the right moment: validate on blur or submit (not every keystroke), move focus on submit, use <code>role="alert"</code> or an <code>aria-live="polite"</code> region sparingly (multiple alerts at once are noisy). Do not rely on the browser's native bubbles when using <code>novalidate</code> and custom messages.<br>
• Custom form controls built with <code>ControlValueAccessor</code> must forward <code>aria-*</code>, label association (<code>aria-labelledby</code>), disabled and invalid states to an inner native element.<br>
• Dialogs: background must be inert (CDK uses <code>aria-hidden</code> on siblings / the <code>inert</code> attribute), the scroll must be locked, <code>aria-modal="true"</code>, and destructive actions need a clear name ("Delete employee", not "OK"). Toast notifications use <code>role="status"</code>/<code>alert</code> and must not disappear before they can be read.<br>
• Authentication (WCAG 2.2 3.3.8): allow password managers and paste; avoid cognitive tests. Provide error identification and suggestions (3.3.1, 3.3.3), and consistent help.<br>
• Put accessibility in the pipeline: lint rule failures and axe violations fail CI, and a design-system component library tests each component once. Include accessibility acceptance criteria in tickets. Accessibility testing cannot be fully automated; schedule an expert/user-testing audit for major releases and publish an accessibility statement.`),
      ],
      [
        ['How do you make form validation messages accessible?', 'Show text errors next to fields, link them with aria-describedby, set aria-invalid, announce via role=alert or a live region, and move focus to the first error or an error summary on submit.'],
        ['What makes a dialog accessible?', 'Role dialog and a name, focus moved in and trapped, background inert, Escape to close and focus returned to the trigger; CDK/Material dialogs do this.'],
        ['Are placeholders a replacement for labels?', 'No. They disappear on input, have low contrast and are not reliably announced; use a visible label.'],
        ['How do you test accessibility?', 'Combine ESLint template rules, automated axe/Lighthouse checks in CI, keyboard-only testing and real screen reader testing, since automation finds only part of the issues.'],
      ],
    ),

    topic(
      'ngs-m27-i18n',
      'Internationalization: translation, locales, formats, RTL',
      [
        blk(`<h3>One app, many languages</h3>
• <b>Internationalization (i18n)</b> = preparing the app so text, dates, numbers and layout can adapt. <b>Localization (l10n)</b> = the actual translation and regional settings for one language.<br>
• <b>Date and number formatting</b> and <b>currency formatting</b> differ per region: 1,234.56 in English (US), 1.234,56 in German, 12/31/2025 vs 31/12/2025. Angular's <code>date</code>, <code>number</code>, <code>percent</code> and <code>currency</code> pipes format according to the active <b>locale</b>.<br>
• <b>Language switching</b>: let users pick a language; remember it.`,
          `<p>{{ today | date:'longDate' }}</p>           <!-- December 31, 2025 (en-US) / 31. Dezember 2025 (de) -->
<p>{{ 1234567.891 | number:'1.0-2' }}</p>        <!-- 1,234,567.89 (en-US) / 1.234.567,89 (de) -->
<p>{{ price | currency:'INR':'symbol':'1.2-2' }}</p>   <!-- Rs. or the rupee sign -->
<p>{{ 0.256 | percent }}</p>`,
        ),
      ],
      [
        blk(`<h3>Built-in Angular i18n: mark, extract, translate, build</h3>
<b>Translation management</b> with <code>@angular/localize</code> follows a build-time workflow: add <code>i18n</code> attributes to templates (and <code>$localize</code> in code), run <code>ng extract-i18n</code> to create <code>messages.xlf</code>, hand it to translators (XLIFF files go to tools such as Lokalise, Crowdin or Phrase), save <code>messages.fr.xlf</code> and configure locales in angular.json. Each locale gets its own optimized build (fastest runtime, but one deployment per language, and no switching without reload).<br>
<b>Locale configuration</b>: set the source locale and the translation files; for extra locale data (pipes) register it with <code>registerLocaleData</code> and provide <code>LOCALE_ID</code>.`,
          `<!-- template -->
<h1 i18n="@@home.title">Welcome to the portal</h1>
<p i18n="employee count|shown on dashboard@@home.count">{count, plural, =0 {No employees} =1 {One employee} other {{{count}} employees}}</p>
<img src="logo.png" i18n-alt alt="Company logo">`,
          `// in code: $localize is a tagged template literal (written with backticks in real code):
//   const msg = $localize :@@save.ok:Saved successfully ;   <- the text sits between two backticks
// angular.json
// "i18n": { "sourceLocale": "en-US", "locales": { "hi": { "translation": "src/locale/messages.hi.xlf" } } },
// "build": { "configurations": { "hi": { "localize": ["hi"] } } }
// build all locales: ng build --localize        serve one: ng serve --configuration=hi`,
        ),
      ],
      [
        blk(`<h3>Runtime switching, RTL and pitfalls</h3>
The built-in approach needs one build per locale. For <b>language switching</b> inside the running app, many teams use a runtime library: <b>Transloco</b> or <b>ngx-translate</b> (JSON files, lazy loaded per feature, plural/ICU support). Pick one approach per project. For <b>right-to-left layouts</b> (Arabic, Hebrew, Urdu) set <code>dir="rtl"</code> on the html element and write CSS with <b>logical properties</b> (<code>margin-inline-start</code>, <code>padding-inline</code>, <code>text-align: start</code>, <code>inset-inline-end</code>) so a single stylesheet serves both directions; flip directional icons; use the CDK <code>Directionality</code> service.`,
          `// transloco-style runtime switching (outline; check library docs for the exact provider API)
// app.config.ts: provideTransloco({ config: { availableLangs: ['en', 'ar', 'hi'], defaultLang: 'en', reRenderOnLangChange: true }, loader: HttpLoader })
// template: <h1>{{ 'home.title' | transloco }}</h1>
export class LangSwitcher {
  private t = inject(TranslocoService);
  set(lang: string) {
    this.t.setActiveLang(lang);
    document.documentElement.lang = lang;                                   // screen readers pick the voice
    document.documentElement.dir = ['ar', 'he', 'ur'].includes(lang) ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
  }
}`,
          `/* logical properties: works for LTR and RTL */
.card { padding-inline: 1rem; margin-inline-start: auto; border-inline-start: 4px solid var(--accent); text-align: start; }
[dir="rtl"] .icon-arrow { transform: scaleX(-1); }

// runtime locale data for the built-in pipes
import { registerLocaleData } from '@angular/common';
import localeHi from '@angular/common/locales/hi';
registerLocaleData(localeHi);
providers: [{ provide: LOCALE_ID, useValue: 'hi' }]       // or a factory reading the user's choice`,
        ),
        blk(`<h3>Expert notes</h3>
• Never concatenate translated fragments ("You have " + n + " items"); use ICU messages with plural and select so grammar works in every language. Give translators context via the meaning/description in the <code>i18n</code> attribute and stable custom ids (<code>@@id</code>).<br>
• Use the <code>Intl</code> API (<code>Intl.DateTimeFormat</code>, <code>NumberFormat</code>, <code>PluralRules</code>, <code>RelativeTimeFormat</code>, <code>Collator</code> for sorting) for formatting outside templates. Store dates in UTC ISO strings, show in the user's timezone; format currency by its ISO code, never hardcode symbols. Keep amounts from the backend as minor units or strings.<br>
• Layout must tolerate text expansion (German is about 30% longer) and different scripts and fonts; avoid text in images; do not truncate with fixed widths.<br>
• Backend alignment: Spring Boot uses <code>MessageSource</code> / <code>messages_hi.properties</code> and the <code>Accept-Language</code> header for API error messages; send error codes and let the frontend translate when possible. Add an interceptor to send <code>Accept-Language</code>.<br>
• SEO and SSR: with build-time locales use URL prefixes (<code>/hi/</code>) and <code>hreflang</code> links; set the html <code>lang</code> attribute for accessibility. Runtime-library approach with SSR needs the translations loaded on the server too to avoid flashing the default language.<br>
• Version notes: Angular's built-in i18n is stable; runtime translation (loading translations without rebuilds) is possible through <code>loadTranslations()</code> from <code>@angular/localize</code> but is less common; libraries such as Transloco cover it with fewer limits.`),
      ],
      [
        ['What is the difference between i18n and l10n?', 'i18n prepares the app to support multiple languages and regions (marking text, locale-aware formats); l10n is producing the actual translations and regional settings.'],
        ['How does Angular built-in i18n work?', 'Mark text with the i18n attribute or $localize, run ng extract-i18n to produce XLIFF, translate it and build each locale separately via angular.json localize configuration.'],
        ['Built-in i18n or Transloco/ngx-translate?', 'Built-in produces fast per-locale builds but needs separate deployments and no runtime switching; runtime libraries switch language without reload and load JSON lazily at a small runtime cost.'],
        ['How do you support right-to-left languages?', 'Set dir and lang on the html element, use CSS logical properties instead of left/right, mirror directional icons and use the CDK Directionality service.'],
        ['Why use ICU plural messages?', 'Plural rules differ by language; ICU plural/select expressions let translators supply correct forms, unlike string concatenation.'],
        ['How do date, number and currency pipes know the format?', 'They use the active LOCALE_ID and the registered locale data; the currency pipe also takes the ISO currency code.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 28
const L28 = [
  'Core concepts: architecture, components, binding, lifecycle',
  'DI, providers, pipes, routing and guards',
  'Forms and RxJS comparisons',
  'Signals, change detection, interceptors and errors',
  'Auth, state, performance, SSR, testing and security',
  'Tooling, deployment, Spring Boot and real-world debugging',
  'Coding exercises with solutions',
];

const area = (name: string, b: [string, string], i: [string, string], e: [string, string]): Area => ({ name, b, i, e });

const mod28: SubTopic = {
  id: 'ngs-mod-28',
  name: 'Module 28 · Angular Interview Preparation',
  topics: [
    overview(28, 'Angular Interview Preparation', L28, [
      ['Angular architecture', 'Components, templates, DI, router, compiler and change detection working together.', 1],
      ['Angular vs React', 'Full framework with conventions versus a UI library you assemble.', 1],
      ['Components and directives', 'Components own a template; directives add behaviour to existing elements.', 1],
      ['Standalone components vs NgModules', 'Self-contained components versus module-declared ones.', 1],
      ['Data binding', 'Interpolation, property, event and two-way binding.', 1],
      ['Component communication', 'Inputs/outputs, services, signals, ViewChild, route data.', 1],
      ['Lifecycle hooks', 'ngOnChanges, ngOnInit, ngAfterViewInit, ngOnDestroy and friends.', 1],
      ['Services and Dependency Injection', 'Injectable classes supplied by the injector hierarchy.', 2],
      ['Providers and injection tokens', 'How to tell DI what to create: useClass, useValue, useFactory, multi.', 2],
      ['Pipes', 'Template value transformers, pure versus impure.', 2],
      ['Routing and lazy loading', 'Route config, params, loadComponent/loadChildren.', 2],
      ['Route guards', 'Functional guards for access, leaving and matching.', 2],
      ['Template-driven vs reactive forms', 'Directive-driven versus code-driven form models.', 3],
      ['Form validation', 'Built-in, custom, cross-field and async validators.', 3],
      ['Observables vs Promises', 'Streams with cancellation versus single eager values.', 3],
      ['Subject vs BehaviorSubject', 'Plain multicast versus multicast with current value.', 3],
      ['switchMap vs mergeMap', 'Cancel previous inner versus run all in parallel.', 3],
      ['concatMap vs exhaustMap', 'Queue in order versus ignore while busy.', 3],
      ['Signals vs RxJS', 'Synchronous state versus asynchronous event streams.', 4],
      ['Signals vs traditional component state', 'Fine-grained reactivity versus plain fields and zone checks.', 4],
      ['Change detection', 'How Angular syncs data to the DOM.', 4],
      ['OnPush strategy', 'Check a component only when inputs, events or signals change.', 4],
      ['HTTP interceptors', 'Middleware for requests and responses.', 4],
      ['Error handling', 'catchError, interceptors, ErrorHandler, user feedback.', 4],
      ['Authentication and JWT', 'Login, token handling, refresh and guards.', 5],
      ['State management', 'Services, signals, NgRx and when to use each.', 5],
      ['Performance optimization', 'OnPush, lazy loading, defer, virtual scroll, bundle size.', 5],
      ['SSR and hydration', 'Server rendering, reuse of server DOM, SEO and speed.', 5],
      ['Angular testing', 'TestBed, mocks, HttpTestingController, e2e.', 5],
      ['Security vulnerabilities', 'XSS, CSRF, token theft, open redirects and mitigations.', 5],
      ['Angular CLI and builds', 'Schematics, builders, configurations, AOT.', 6],
      ['Deployment', 'Static hosting, Nginx, Docker, CI/CD, rollback.', 6],
      ['Angular with Spring Boot', 'REST, CORS, JWT, DTOs, validation, deployment.', 6],
      ['Debugging real-world problems', 'Systematic diagnosis of leaks, ExpressionChanged errors, CORS and stale views.', 6],
      ['Angular coding exercises', 'Typical hands-on tasks with worked solutions.', 7],
    ]),

    qaLesson('ngs-m28-core-concepts', 'Core concepts: architecture, components, binding, lifecycle', [
      area('Angular architecture',
        ['What are the main building blocks of Angular?', 'Components (UI), directives, pipes, services with dependency injection, the router, forms, HttpClient, and the compiler/runtime that renders templates and detects changes. Modern apps are built from standalone components.'],
        ['A new developer asks how a click ends up on screen. Walk through it.', 'The event listener runs your handler, which updates state (a signal or field). Change detection (triggered by zone.js or by signal notification) re-evaluates the template bindings of affected views and updates the DOM.'],
        ['How does Ivy and AOT shape the architecture?', 'The compiler turns each template into component-local instruction functions at build time, enabling tree-shaking, lazy loading and locality; the runtime has no template compiler, and DI is resolved through hierarchical injectors (element and environment).']),
      area('Angular vs React',
        ['Main difference between Angular and React?', 'Angular is an opinionated full framework (router, forms, HTTP, DI, CLI, TypeScript by default); React is a UI library where you choose routing, state and data tools.'],
        ['Your team must choose for a large enterprise app. What do you weigh?', 'Consistency and built-in tooling (Angular) versus ecosystem flexibility and hiring (React); team Java/TypeScript background, long-term maintenance, size of team and existing code usually favour Angular for big structured apps.'],
        ['Compare their reactivity models.', 'Angular uses zone-based or signal-based change detection with templates compiled ahead of time; React re-renders components using a virtual DOM and hooks. Angular signals now give fine-grained updates similar to Solid/Vue refs.']),
      area('Components and directives',
        ['Component versus directive?', 'A component is a directive with a template. Attribute directives change appearance/behaviour of an existing element; structural directives (and control flow) change the DOM structure.'],
        ['When would you create a custom directive instead of a component?', 'When behaviour applies to any element without its own template, such as autofocus, tooltip, permission-based visibility or click-outside; use hostDirectives to compose them.'],
        ['What are host bindings and host directives?', 'host metadata binds properties, attributes and events on the host element; hostDirectives composes other directives onto a component or directive with exposed inputs/outputs, replacing inheritance.']),
      area('Standalone components vs NgModules',
        ['What is a standalone component?', 'A component that declares its own template dependencies in imports and needs no NgModule; it is the default since Angular 19 and the recommended approach.'],
        ['How do you migrate an NgModule app?', 'Run the standalone migration schematic in steps (convert declarations, remove unnecessary modules, bootstrap with bootstrapApplication) and move providers to app config or routes.'],
        ['What do NgModules still do that standalone does not replace directly?', 'Nothing essential; providers use provideX functions and route-level providers, and legacy libraries can still be imported as modules into standalone components.']),
      area('Data binding',
        ['List the types of data binding.', 'Interpolation {{ }}, property binding [prop], event binding (event), and two-way binding [(ngModel)] or [(value)] with model().'],
        ['Why does [(ngModel)] not work and what is the fix?', 'FormsModule/NgModel must be imported into the standalone component; two-way binding is just [ngModel] plus (ngModelChange).'],
        ['Property versus attribute binding?', 'Property binding sets DOM properties (value, hidden); attribute binding [attr.aria-label] sets HTML attributes, needed when no DOM property exists (aria-*, colspan).']),
      area('Component communication',
        ['How does a parent pass data to a child?', 'Through an input (input() signal or @Input) and the child notifies the parent with output() or @Output EventEmitter.'],
        ['Two unrelated components must share data. How?', 'A shared injectable service holding signals (or a BehaviorSubject), or a store such as NgRx; avoid ViewChild and event buses across features.'],
        ['What are model inputs?', 'model() creates a signal input plus an output for two-way binding [(value)], making custom two-way components concise.']),
      area('Lifecycle hooks',
        ['Name important lifecycle hooks in order.', 'constructor, ngOnChanges, ngOnInit, ngDoCheck, ngAfterContentInit, ngAfterViewInit, then ngOnDestroy when removed.'],
        ['Where do you fetch data and why not in the constructor?', 'Use ngOnInit (or signal/resource APIs and route resolvers): inputs are set by then and the constructor should only do dependency injection and trivial initialisation.'],
        ['What are afterNextRender and afterRender?', 'Hooks registered in injection context that run after Angular finishes rendering, browser-only, for direct DOM work; they replace ad-hoc ngAfterViewInit DOM code and are SSR-safe.']),
    ]),

    qaLesson('ngs-m28-di-routing', 'DI, providers, pipes, routing and guards', [
      area('Services and Dependency Injection',
        ['What is dependency injection in Angular?', 'A pattern where classes ask for dependencies (inject(Service) or constructor parameters) and Angular\'s injectors create and supply them, enabling reuse and testing, like Spring beans.'],
        ['Explain hierarchical injectors.', 'Injectors form a tree: element injectors (component/directive providers) and environment injectors (root, route). A lookup walks up from the requesting node until a provider is found.'],
        ['How do you get a new instance per component?', 'List the service in the component providers array; each component instance then gets its own instance, destroyed with the component.']),
      area('Providers and injection tokens',
        ['What is providedIn root?', 'Registers a tree-shakable singleton in the root injector without listing it in any providers array.'],
        ['When do you use an InjectionToken?', 'For non-class values such as config objects, strings and function strategies; use useValue, useFactory or useExisting to supply it.'],
        ['What does multi: true do?', 'Several providers contribute to one token, which then injects as an array; used by HTTP interceptors (legacy), validators and plug-in systems.']),
      area('Pipes',
        ['What is a pipe?', 'A template function that transforms a value for display, for example date, currency, uppercase, async.'],
        ['Pure versus impure pipe?', 'A pure pipe re-runs only when its input reference changes (cheap, default); an impure pipe runs every change detection cycle, so use it rarely (async is impure by design).'],
        ['Why avoid method calls in templates compared with pipes?', 'Template method calls run on every change detection; a pure pipe or computed signal memoises the result.']),
      area('Routing and lazy loading',
        ['How do you configure routes?', 'Define a Routes array with path/component entries, register it with provideRouter(routes) and render with router-outlet; navigate with routerLink or Router.navigate.'],
        ['How do you lazy load a feature?', 'Use loadComponent: () => import(...) for a component or loadChildren for a route array; the bundle is fetched when the route is first activated.'],
        ['How do preloading strategies work?', 'withPreloading(PreloadAllModules) or a custom strategy loads lazy routes in the background after startup so later navigation is instant without a large initial bundle.']),
      area('Route guards',
        ['What are route guards?', 'Functions that decide whether navigation proceeds: canActivate, canActivateChild, canDeactivate and canMatch; resolvers fetch data before activation.'],
        ['How do you protect admin routes?', 'A functional canActivate guard injecting AuthService that returns true or a UrlTree to /login; combine with canMatch so unauthorised users cannot even load the lazy bundle, and enforce roles on the server.'],
        ['canMatch versus canActivate?', 'canMatch decides whether a route definition applies at all (useful for role-based alternatives or feature flags); canActivate runs after matching and blocks activation. canMatch prevents lazy code download.']),
    ]),

    qaLesson('ngs-m28-forms-rxjs', 'Forms and RxJS comparisons', [
      area('Template-driven vs reactive forms',
        ['Difference between template-driven and reactive forms?', 'Template-driven forms build the model implicitly from directives (ngModel) in the template; reactive forms build an explicit FormGroup/FormControl model in code, which is more scalable and testable.'],
        ['Which would you choose for a dynamic, complex form and why?', 'Reactive forms: programmatic control, FormArray for dynamic rows, typed forms, custom validators and easy unit tests without rendering.'],
        ['What are typed forms?', 'Since v14 FormControl<T> and FormGroup types give compile-time safety on value and controls; NonNullableFormBuilder avoids null values after reset.']),
      area('Form validation',
        ['How do you validate required and email fields?', 'Validators.required and Validators.email in the control definition (or required/email attributes in template-driven forms) and display control.errors when touched.'],
        ['How do you validate that password and confirm password match?', 'A validator on the FormGroup (cross-field) returning { mismatch: true }, with errors shown at group level.'],
        ['How do async validators work and what are the pitfalls?', 'They return an Observable/Promise (e.g. username availability), run only after sync validators pass, put the control in PENDING; debounce them (timer in the validator or updateOn blur) and cancel stale requests.']),
      area('Observables vs Promises',
        ['Observables versus Promises?', 'A Promise yields a single value, is eager and cannot be cancelled; an Observable is lazy, can emit many values, supports operators, cancellation (unsubscribe) and retry.'],
        ['How do you convert between them?', 'firstValueFrom/lastValueFrom turn an Observable into a Promise; from(promise) turns a Promise into an Observable.'],
        ['Why is HttpClient cold and what does that imply?', 'The request is sent per subscription, so two subscriptions send two requests; use shareReplay or signals/toSignal to share, and unsubscribing cancels the in-flight request.']),
      area('Subject vs BehaviorSubject',
        ['Subject versus BehaviorSubject?', 'A Subject multicasts to current subscribers only; a BehaviorSubject stores the latest value, requires an initial value and gives it to new subscribers immediately.'],
        ['When would you use ReplaySubject?', 'When late subscribers need the last N emissions, such as a log or recent notifications.'],
        ['Why expose subjects as observables?', 'Use asObservable() or a private subject with a public stream so consumers cannot call next(), preserving encapsulation; signals with asReadonly give the same.']),
      area('switchMap vs mergeMap',
        ['switchMap versus mergeMap?', 'switchMap cancels the previous inner observable when a new value arrives; mergeMap runs all inner observables concurrently.'],
        ['Which operator for type-ahead search?', 'switchMap after debounceTime and distinctUntilChanged so outdated requests are cancelled and only the latest result shows.'],
        ['What can go wrong with mergeMap on user input?', 'Responses can arrive out of order and overwhelm the server; results of old requests may overwrite newer ones.']),
      area('concatMap vs exhaustMap',
        ['concatMap versus exhaustMap?', 'concatMap queues inner observables and runs them one after another in order; exhaustMap ignores new outer values while an inner one is running.'],
        ['Which for a Save button double-click and which for ordered updates?', 'exhaustMap prevents duplicate submits; concatMap guarantees ordered saves such as sequential autosave updates.'],
        ['Rank the four flattening operators by concurrency and cancellation.', 'mergeMap: parallel, no cancel; switchMap: latest wins, cancels older; concatMap: sequential queue; exhaustMap: drop new while busy. Choose by what should happen to overlapping work.']),
    ]),

    qaLesson('ngs-m28-signals-cd-http', 'Signals, change detection, interceptors and errors', [
      area('Signals vs RxJS',
        ['What is the difference between signals and RxJS?', 'Signals hold a current synchronous value with automatic dependency tracking; RxJS models asynchronous streams of events over time with operators. Use signals for state, RxJS for events and HTTP flows.'],
        ['How do they interoperate?', 'toSignal converts an observable into a signal (with initialValue), toObservable converts a signal to a stream, and rxResource/resource load async data from signals.'],
        ['Why are signals glitch-free and what is computed laziness?', 'The graph is evaluated pull-based: computed values are memoised, recalculated only when read and when a dependency changed, so consumers never see inconsistent intermediate states.']),
      area('Signals vs traditional component state',
        ['Why use signals instead of plain fields?', 'Angular knows exactly which template reads which signal, so only those views update, enabling OnPush-like performance and zoneless apps without manual markForCheck.'],
        ['How do you derive state?', 'With computed(), which depends on other signals, is cached and read-only; avoid effect() for deriving values.'],
        ['What is linkedSignal and when use it?', 'A writable signal that resets from a source signal, such as a selected item that resets when the list changes; it is stable in recent versions, so check your Angular version.']),
      area('Change detection',
        ['What is change detection?', 'The mechanism that checks template bindings against the component state and updates the DOM when values changed.'],
        ['What triggers it in a zone-based app?', 'zone.js patches async APIs (events, timers, XHR/fetch, promises) and calls ApplicationRef.tick after they run, checking the component tree from the root.'],
        ['What is ExpressionChangedAfterItHasBeenChecked?', 'In development mode Angular runs a second check; if a binding changed during or after its own check (state modified in a child hook or getter), it throws to flag unstable data flow. Fix the data flow, do not silence it.']),
      area('OnPush strategy',
        ['What does ChangeDetectionStrategy.OnPush do?', 'The component is checked only when an input reference changes, an event originates in it, an async pipe or signal read in its template emits, or markForCheck is called.'],
        ['Why does my OnPush component not update after mutating an array?', 'The input reference did not change; replace the object/array immutably (spread, map) or use signals.'],
        ['How does OnPush relate to zoneless?', 'Zoneless apps (provideZonelessChangeDetection, experimental/stable depending on version) rely on signals, markForCheck, async pipe and events for scheduling, so OnPush-style discipline is required.']),
      area('HTTP interceptors',
        ['What is an HTTP interceptor?', 'A function in the HttpClient pipeline that can inspect or transform every request and response, for auth headers, logging, error handling or caching.'],
        ['How do you write and register a functional interceptor?', 'Export an HttpInterceptorFn (req, next) => next(req.clone(...)) and register with provideHttpClient(withInterceptors([fn])); order in the array is the order for requests.'],
        ['How do you implement refresh-token handling in an interceptor?', 'On 401 call refresh once (shared with shareReplay), retry the failed request with the new token, queue parallel requests, and log out if refresh fails; skip the auth endpoints to avoid loops.']),
      area('Error handling',
        ['How do you handle HTTP errors?', 'catchError in the stream (or an error interceptor) mapping HttpErrorResponse to a friendly message and showing it via a notification service.'],
        ['What is the difference between error status 0 and 4xx/5xx?', 'Status 0 means no response reached the app (network down, CORS block, blocked request); 4xx are client errors and 5xx server errors with a response body.'],
        ['Where does ErrorHandler fit?', 'It catches uncaught exceptions in Angular code; override it to log to a service like Sentry. Expected errors are handled locally; unexpected ones globally.']),
    ]),

    qaLesson('ngs-m28-auth-state-perf-security', 'Auth, state, performance, SSR, testing and security', [
      area('Authentication and JWT',
        ['How does JWT authentication work in Angular?', 'Login returns a token; an interceptor adds it as a Bearer header; a guard blocks protected routes; the server verifies the signature and expiry on every request.'],
        ['Where would you store tokens?', 'Access token in memory, refresh token in an HttpOnly Secure SameSite cookie; localStorage is exposed to XSS.'],
        ['Why are guards not security?', 'Client code can be modified. Authorization must be enforced by the server on every endpoint; guards only improve user experience.']),
      area('State management',
        ['What is state management?', 'How an application stores, shares and updates data across components, for example with services, signals or NgRx.'],
        ['When is NgRx justified?', 'Large apps with complex cross-feature state, many side effects, need for devtools time travel and strict patterns; otherwise a service with signals (or NgRx Signal Store) is simpler.'],
        ['Describe normalised state and why.', 'Store entities by id in a dictionary with an id list, so updates are O(1), duplicates are avoided and derived views are computed.']),
      area('Performance optimization',
        ['Name five Angular performance techniques.', 'OnPush/signals, lazy loading, trackBy/track in @for, @defer for heavy views, virtual scrolling, pure pipes, production build with tree-shaking.'],
        ['A list of 5,000 rows is slow. What do you do?', 'Virtual scroll (CDK), track by id, OnPush rows, server-side paging, avoid heavy template functions, and profile with Angular DevTools.'],
        ['How do you measure and enforce performance?', 'Lighthouse and Core Web Vitals in CI, bundle budgets in angular.json, bundle analysis, Angular DevTools profiler, and real-user monitoring.']),
      area('SSR and hydration',
        ['What is SSR and why use it?', 'The server renders the initial HTML for faster first paint and better SEO/social previews; the browser then takes over.'],
        ['What is hydration?', 'The client reuses the server-rendered DOM and attaches listeners instead of re-creating it, avoiding flicker; it requires identical DOM structure on both sides.'],
        ['What are common SSR pitfalls?', 'Using window/document/localStorage on the server (guard with isPlatformBrowser or afterNextRender), duplicate HTTP calls (use TransferState/HTTP cache), non-deterministic rendering and per-request state leaks in singletons.']),
      area('Angular testing',
        ['Which tools test an Angular app?', 'Jasmine/Karma or Jest/Vitest for unit tests with TestBed, HttpTestingController for HTTP, Playwright or Cypress for end-to-end; the default runner depends on the Angular version.'],
        ['How do you test a component that uses a service?', 'Provide a fake service in TestBed (useValue or a spy), create the fixture, set inputs, call detectChanges and assert on the DOM and calls.'],
        ['What is a good test pyramid for Angular?', 'Many fast unit tests for logic and services, component tests for templates and interaction, fewer integration tests with routing and HTTP mocks, and a small set of e2e journeys.']),
      area('Security vulnerabilities',
        ['How does Angular protect against XSS?', 'It escapes interpolated values and sanitises bound HTML/URLs/styles by default; avoid bypassSecurityTrust* and innerHTML with untrusted input.'],
        ['How do you defend against CSRF?', 'For cookie sessions use SameSite cookies and CSRF tokens (Angular reads XSRF-TOKEN and sends X-XSRF-TOKEN); bearer-token APIs are not vulnerable to classic CSRF.'],
        ['List other web risks relevant to Angular apps.', 'Token theft via XSS, open redirects after login, insecure third-party scripts, vulnerable npm dependencies, sensitive data in the bundle, missing CSP and broken server authorization (IDOR).']),
    ]),

    qaLesson('ngs-m28-tooling-spring-debug', 'Tooling, deployment, Spring Boot and real-world debugging', [
      area('Angular CLI and builds',
        ['What does Angular CLI do?', 'It scaffolds projects and code (ng new, ng generate), serves, builds, tests, lints and updates the app via schematics and builders.'],
        ['What is AOT and why is it the default?', 'Templates are compiled at build time, giving faster startup, smaller output and compile-time template errors.'],
        ['What changed with the application builder?', 'esbuild and Vite replaced webpack for builds and the dev server, speeding rebuilds and unifying browser, SSR and prerender output.']),
      area('Deployment',
        ['How do you deploy an Angular app?', 'Run ng build, upload dist/browser to a static host or Nginx with SPA fallback, serve over HTTPS and proxy /api to the backend.'],
        ['How do you build one artifact for many environments?', 'Use runtime configuration (config.json loaded at startup) or container entrypoint substitution instead of build-time environment files.'],
        ['How do you roll back safely?', 'Deploy versioned immutable releases and switch a symlink or image tag, keep the previous assets available and ensure database migrations are backward compatible.']),
      area('Angular with Spring Boot',
        ['How does Angular call Spring Boot?', 'HttpClient to REST controllers returning JSON DTOs, with CORS configured or a shared-origin proxy.'],
        ['Describe a secure login flow with Spring Boot.', 'POST credentials to /auth/login, receive a short-lived access token and a rotating HttpOnly refresh cookie, an interceptor attaches the access token, Spring Security validates it statelessly and enforces roles.'],
        ['How do you keep frontend and backend contracts in sync?', 'Generate an OpenAPI spec with springdoc and a typed Angular client from it, validate in CI, version APIs and use contract tests.']),
      area('Debugging real-world problems',
        ['The page is blank after deploy. What do you check?', 'Browser console and Network tab (404 for hashed files, MIME type errors), cached index.html, SPA fallback, base href, and the CORS or API errors.'],
        ['The app gets slower over time. How do you investigate?', 'Heap snapshots to find leaks (unsubscribed streams, listeners, detached nodes), the Angular DevTools profiler for change detection storms, and the Network tab for duplicate requests.'],
        ['NG0100 ExpressionChanged error appears only in development. Meaning and fix?', 'A binding changed after being checked in the same cycle (state mutated in lifecycle hooks or via getters). Fix by deriving state with computed, moving the change earlier, or restructuring data flow; do not hide with setTimeout.']),
    ]),

    topic(
      'ngs-m28-coding-exercises',
      'Coding exercises with solutions',
      [
        blk(`<h3>How coding rounds work</h3>
Interviewers ask for <b>small, complete components</b> in 20-40 minutes (<b>live coding</b>): a counter, a todo list, a debounced search, a parent-child data flow, a custom validator, an interceptor. They look for correct modern syntax, clean structure, handling of edge cases, and your ability to explain choices. Practise typing solutions without autocomplete.<br>
<b>Exercise 1: counter with signals</b>: increment, decrement, reset, and a computed double.`,
          `// counter.component.ts
@Component({
  selector: 'app-counter',
  template: '<p>{{ count() }} (double {{ double() }})</p><button (click)="dec()">-</button><button (click)="inc()">+</button><button (click)="count.set(0)">Reset</button>',
})
export class CounterComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);
  inc() { this.count.update(c => c + 1); }
  dec() { this.count.update(c => c - 1); }
}`,
        ),
        blk(`<b>Exercise 2: todo list</b> with add, toggle, remove and a filter. Expect questions about <b>track</b> and <b>immutability</b>.`,
          `// todos.component.ts
interface Todo { id: number; title: string; done: boolean; }

@Component({
  selector: 'app-todos', imports: [FormsModule],
  template: '<input [(ngModel)]="text" (keyup.enter)="add()"><button (click)="add()">Add</button>' +
    '@for (t of visible(); track t.id) { <li [class.done]="t.done"><input type="checkbox" [checked]="t.done" (change)="toggle(t.id)">{{ t.title }}<button (click)="remove(t.id)">x</button></li> }' +
    '<button (click)="filter.set(\\'all\\')">All</button><button (click)="filter.set(\\'open\\')">Open</button>',
})
export class TodosComponent {
  text = '';
  todos = signal<Todo[]>([]);
  filter = signal<'all' | 'open'>('all');
  visible = computed(() => this.filter() === 'all' ? this.todos() : this.todos().filter(t => !t.done));
  private nextId = 1;
  add() { if (!this.text.trim()) return; this.todos.update(l => [...l, { id: this.nextId++, title: this.text.trim(), done: false }]); this.text = ''; }
  toggle(id: number) { this.todos.update(l => l.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  remove(id: number) { this.todos.update(l => l.filter(t => t.id !== id)); }
}`,
        ),
      ],
      [
        blk(`<h3>Exercise 3: debounced search with cancellation</h3>
Requirement (<b>debounce</b> plus <b>switchMap</b>): call <code>/api/users?q=</code> after 300 ms of silence, ignore duplicates, cancel old requests, handle errors without killing the stream.`,
          `// search.component.ts
@Component({
  selector: 'app-search', imports: [ReactiveFormsModule],
  template: '<input [formControl]="q" placeholder="Search users">' +
            '@for (u of results(); track u.id) { <p>{{ u.name }}</p> } @empty { <p>No results</p> }',
})
export class SearchComponent {
  private http = inject(HttpClient);
  q = new FormControl('', { nonNullable: true });
  results = toSignal(
    this.q.valueChanges.pipe(
      debounceTime(300),
      map(v => v.trim()),
      distinctUntilChanged(),
      switchMap(term => term.length < 2 ? of([]) : this.http.get<User[]>('/api/users', { params: { q: term } }).pipe(
        catchError(() => of([] as User[])),               // error handled inside so the outer stream survives
      )),
    ),
    { initialValue: [] as User[] },
  );
}`,
        ),
        blk(`<h3>Exercise 4: custom validators</h3>
A cross-field password match and an async "username available" validator.`,
          `// validators.ts
export const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const p = group.get('password')?.value, c = group.get('confirm')?.value;
  return p && c && p !== c ? { mismatch: true } : null;
};

export const usernameAvailable = (api: UserApi): AsyncValidatorFn => (control) =>
  timer(400).pipe(                                         // debounce
    switchMap(() => api.exists(control.value)),
    map(exists => (exists ? { taken: true } : null)),
    catchError(() => of(null)),
  );

// usage
form = this.fb.group({
  username: ['', [Validators.required, Validators.minLength(3)], [usernameAvailable(this.api)]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  confirm: [''],
}, { validators: passwordsMatch });`,
        ),
        blk(`<h3>Exercise 5: functional interceptor and guard</h3>
Attach a token, and redirect unauthenticated users while remembering the target URL.`,
          `export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return next(token && req.url.startsWith('/api') ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req);
};

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};`,
        ),
      ],
      [
        blk(`<h3>Exercise 6: parent-child with model() and a reusable pipe</h3>
Build a rating widget that works with <code>[(value)]</code>, and a pure pipe that truncates text.`,
          `@Component({
  selector: 'app-rating',
  template: '@for (s of stars; track s) { <button type="button" (click)="value.set(s)" [attr.aria-pressed]="s <= value()">{{ s <= value() ? "*" : "-" }}</button> }',
})
export class RatingComponent {
  value = model(0);                 // enables [(value)]="rating" in the parent
  stars = [1, 2, 3, 4, 5];
}

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(text: string, max = 20, suffix = '...'): string {
    return text.length > max ? text.slice(0, max).trimEnd() + suffix : text;
  }
}`,
        ),
        blk(`<h3>Exercise 7: tests, and an RxJS puzzle</h3>
Test a service with HttpTestingController; then explain what a nested subscribe does wrong and refactor it.`,
          `// user.service.spec.ts
describe('UserService', () => {
  let service: UserService; let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(UserService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('loads users', () => {
    service.list().subscribe(u => expect(u.length).toBe(2));
    const req = http.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }, { id: 2 }]);
  });
});

// puzzle: nested subscribes (leaks, no cancellation, error handling per level)
this.route.params.subscribe(p => this.api.getUser(p['id']).subscribe(u => this.user = u));
// fix: one stream, automatic cancellation, signal for the template
user = toSignal(this.route.paramMap.pipe(map(p => p.get('id')!), switchMap(id => this.api.getUser(id))));`,
        ),
      ],
      [
        ['Implement a counter with signals.', 'signal(0) for count, update(c => c + 1) for increment, computed for derived double, and call count() in the template.'],
        ['How do you implement a type-ahead search?', 'FormControl valueChanges with debounceTime, distinctUntilChanged and switchMap to the HTTP call, catching errors inside the inner observable, then toSignal or async pipe.'],
        ['How do you write a cross-field validator?', 'A ValidatorFn on the FormGroup that reads both controls and returns an error object or null, applied through the group validators option.'],
        ['How do you test an HTTP service?', 'Provide provideHttpClient and provideHttpClientTesting, call the method, use HttpTestingController.expectOne, assert method/url, flush a response and verify no outstanding requests.'],
        ['What is wrong with nested subscribes?', 'They leak, skip cancellation, scatter error handling and are hard to read; use a flattening operator such as switchMap and share via signals or the async pipe.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 29
interface Project {
  n: number;
  title: string;
  goal: string;
  features: string[];
  concepts: string;
  endpoints?: string[];
  extend: string[];
  folder: string;
  model: string;
  code: string;
}

/** One project brief: goal, features, architecture, concepts, model, key code, endpoints and extension ideas. */
const proj = (p: Project) =>
  blk(
    `<h3>Project ${p.n}: ${p.title}</h3>
<b>Goal.</b> ${p.goal}<br>
<b>Features.</b>
<ul>${p.features.map(f => '<li>' + f + '</li>').join('')}</ul>
<b>Angular concepts practised.</b> ${p.concepts}<br>
${p.endpoints ? '<b>Spring Boot endpoints.</b><ul>' + p.endpoints.map(e => '<li><code>' + e + '</code></li>').join('') + '</ul>' : '<b>Backend.</b> None needed: data is kept in memory and <code>localStorage</code> or a static JSON file.<br>'}
<b>Extend it.</b>
<ul>${p.extend.map(f => '<li>' + f + '</li>').join('')}</ul>
Samples below: (1) suggested folder structure, (2) key data model, (3) the heart of the project.`,
    p.folder,
    p.model,
    p.code,
  );

const L29 = ['Beginner projects (1-7)', 'Intermediate projects (8-17)', 'Advanced projects (18-25)'];

const beginnerProjects: Project[] = [
  {
    n: 1, title: 'Personal Portfolio',
    goal: 'Build a responsive one-page portfolio (about, skills, projects, contact) from reusable components, deployed as a static site.',
    features: ['Header with smooth-scroll navigation and active link highlight', 'Skills section rendered from an array with progress bars', 'Project cards with filter by tag', 'Contact form with validation (no backend)', 'Dark mode toggle remembered in localStorage'],
    concepts: 'Module 3 (CLI, setup), Module 4 (components, input()), Module 5 (@for, @if, binding), Module 11 (simple form), Module 21 (responsive CSS, theming), Module 24 (static hosting).',
    extend: ['Add a blog section with routes and markdown', 'Translate to two languages (Module 27)', 'Add Lighthouse CI and reach 95+ accessibility', 'Pre-render with SSG (Module 19)'],
    folder: `src/app/
  layout/header.component.ts, footer.component.ts
  sections/hero/, skills/, projects/, contact/
  shared/section-title.component.ts
  data/portfolio.data.ts        # skills and projects arrays
  core/theme.service.ts`,
    model: `export interface Skill { name: string; level: number; }          // level 0-100
export interface PortfolioProject { id: number; title: string; description: string; tags: string[]; repoUrl: string; imageUrl: string; }`,
    code: `// theme.service.ts + projects.component.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<'light' | 'dark'>((localStorage.getItem('theme') as 'light' | 'dark') ?? 'light');
  constructor() {
    effect(() => {
      document.documentElement.dataset['theme'] = this.theme();         // CSS uses [data-theme="dark"]
      localStorage.setItem('theme', this.theme());
    });
  }
  toggle() { this.theme.update(t => (t === 'light' ? 'dark' : 'light')); }
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
})
export class ProjectsComponent {
  all = input.required<PortfolioProject[]>();
  tag = signal<string | null>(null);
  tags = computed(() => [...new Set(this.all().flatMap(p => p.tags))]);
  visible = computed(() => this.all().filter(p => !this.tag() || p.tags.includes(this.tag()!)));
}
// template: @for (p of visible(); track p.id) { <app-project-card [project]="p" /> }`,
  },
  {
    n: 2, title: 'Calculator',
    goal: 'Create a calculator with keyboard support and history, with the arithmetic logic separated from the UI so it can be unit tested.',
    features: ['Digits, operators, decimal, clear, backspace', 'Keyboard input with host listeners', 'Division by zero and overflow handling', 'History panel of the last 10 calculations', 'Unit tests for the calculation engine'],
    concepts: 'Module 2 (TypeScript types, unions), Module 4 (component), Module 5 (event binding, @for), Module 6 (host listener), Module 13 (signals, computed), Module 20 (unit tests).',
    extend: ['Scientific mode with parentheses and a tokenizer/parser', 'Persist history', 'Memory keys (M+, M-, MR)', 'Theme and accessibility (aria-live for the display)'],
    folder: `src/app/calculator/
  calculator.component.ts|html|scss
  calculator.engine.ts          # pure functions, no Angular
  calculator.engine.spec.ts
  history.component.ts`,
    model: `export type Operator = '+' | '-' | '*' | '/';
export interface HistoryEntry { expression: string; result: string; at: number; }`,
    code: `// calculator.engine.ts - pure and testable
export function apply(a: number, op: Operator, b: number): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': if (b === 0) throw new Error('Cannot divide by zero'); return a / b;
  }
}

// calculator.component.ts
export class CalculatorComponent {
  display = signal('0');
  private acc: number | null = null;
  private pending: Operator | null = null;
  private fresh = true;
  history = signal<HistoryEntry[]>([]);

  digit(d: string) { this.display.update(v => (this.fresh || v === '0' ? d : v + d)); this.fresh = false; }
  operator(op: Operator) {
    this.equals();
    this.acc = Number(this.display()); this.pending = op; this.fresh = true;
  }
  equals() {
    if (this.pending === null || this.acc === null) return;
    try {
      const result = apply(this.acc, this.pending, Number(this.display()));
      this.history.update(h => [{ expression: this.acc + ' ' + this.pending + ' ' + this.display(), result: String(result), at: Date.now() }, ...h].slice(0, 10));
      this.display.set(String(result));
    } catch (e) { this.display.set((e as Error).message); }
    this.acc = null; this.pending = null; this.fresh = true;
  }
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) { if (/^[0-9]$/.test(e.key)) this.digit(e.key); else if ('+-*/'.includes(e.key)) this.operator(e.key as Operator); else if (e.key === 'Enter') this.equals(); }
}`,
  },
  {
    n: 3, title: 'To-Do List',
    goal: 'A task manager with add, edit, complete, delete, filters and persistence: the classic first state-handling project.',
    features: ['Add task with Enter key, inline edit on double click', 'Complete and delete with immutable updates', 'Filters: all, active, completed with counters', 'Persist to localStorage', 'Drag to reorder (CDK) as a stretch goal'],
    concepts: 'Module 4 (components, outputs), Module 5 (@for track, class binding), Module 13 (signals, computed, effect), Module 15 (local state, persistence), Module 20 (tests).',
    extend: ['Due dates and priority with a DatePipe', 'Sync with a Spring Boot API (project 10)', 'Categories with route-based filters', 'Undo and redo stack'],
    folder: `src/app/todos/
  todo.model.ts
  todo.store.ts            # signals + localStorage
  todo-list.component.ts
  todo-item.component.ts   # presentational
  todo-footer.component.ts`,
    model: `export interface Todo { id: string; title: string; done: boolean; createdAt: number; }
export type TodoFilter = 'all' | 'active' | 'completed';`,
    code: `// todo.store.ts
@Injectable({ providedIn: 'root' })
export class TodoStore {
  private readonly KEY = 'todos';
  private _todos = signal<Todo[]>(JSON.parse(localStorage.getItem(this.KEY) ?? '[]'));
  readonly filter = signal<TodoFilter>('all');
  readonly todos = this._todos.asReadonly();
  readonly visible = computed(() => {
    const f = this.filter();
    return this._todos().filter(t => f === 'all' || (f === 'active' ? !t.done : t.done));
  });
  readonly remaining = computed(() => this._todos().filter(t => !t.done).length);

  constructor() { effect(() => localStorage.setItem(this.KEY, JSON.stringify(this._todos()))); }

  add(title: string) {
    const t = title.trim();
    if (t) this._todos.update(l => [...l, { id: crypto.randomUUID(), title: t, done: false, createdAt: Date.now() }]);
  }
  toggle(id: string) { this._todos.update(l => l.map(t => (t.id === id ? { ...t, done: !t.done } : t))); }
  rename(id: string, title: string) { this._todos.update(l => l.map(t => (t.id === id ? { ...t, title } : t))); }
  remove(id: string) { this._todos.update(l => l.filter(t => t.id !== id)); }
  clearCompleted() { this._todos.update(l => l.filter(t => !t.done)); }
}`,
  },
  {
    n: 4, title: 'Student Registration Form',
    goal: 'A multi-section reactive form with validation, a dynamic FormArray for subjects and a review step before submit.',
    features: ['Personal, contact and address sections (nested FormGroups)', 'Required, pattern, min age and email validators with messages', 'Cross-field validation (password/confirm)', 'Dynamic subjects with FormArray add/remove', 'Summary page and reset; accessible error messages'],
    concepts: 'Module 11 (reactive forms, typed forms, validators, FormArray), Module 5 (@if, binding), Module 27 (accessible forms), Module 20 (form tests).',
    extend: ['POST to Spring Boot and show server field errors (Module 23)', 'Multi-step wizard with route per step', 'Save draft in localStorage', 'Async validator for unique email'],
    folder: `src/app/registration/
  registration.component.ts|html
  registration.validators.ts
  subject-row.component.ts
  student.model.ts
  summary.component.ts`,
    model: `export interface StudentForm {
  firstName: string; lastName: string; email: string; dob: string; phone: string;
  address: { street: string; city: string; zip: string };
  subjects: { name: string; grade: string }[];
}`,
    code: `// registration.component.ts
export class RegistrationComponent {
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    dob: ['', [Validators.required, minAge(16)]],
    phone: ['', Validators.pattern('^[0-9]{10}$')],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
    address: this.fb.group({ street: [''], city: ['', Validators.required], zip: ['', Validators.pattern('^[0-9]{5,6}$')] }),
    subjects: this.fb.array([this.newSubject()]),
  }, { validators: passwordsMatch });

  get subjects() { return this.form.controls.subjects; }
  newSubject() { return this.fb.group({ name: ['', Validators.required], grade: [''] }); }
  addSubject() { this.subjects.push(this.newSubject()); }
  removeSubject(i: number) { this.subjects.removeAt(i); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    console.log(this.form.getRawValue());          // later: this.api.register(...)
  }
}

export const minAge = (years: number): ValidatorFn => c => {
  const d = new Date(c.value); const limit = new Date(); limit.setFullYear(limit.getFullYear() - years);
  return c.value && d > limit ? { minAge: { required: years } } : null;
};`,
  },
  {
    n: 5, title: 'Employee Directory',
    goal: 'A searchable, sortable directory of employees with a detail page, reading from a JSON file with HttpClient.',
    features: ['List with cards or table', 'Search by name with debounce, filter by department', 'Sort by name or joining date', 'Employee detail route with route params and a back link', 'Loading, empty and error states'],
    concepts: 'Module 8 (services), Module 10 (routing, params), Module 12 (debounce, switchMap), Module 14 (HttpClient), Module 7 (pipes), Module 13 (computed).',
    extend: ['Replace the JSON file with Spring Boot (project 10)', 'Pagination (project 14)', 'Favorites stored in localStorage', 'Virtual scrolling for 5,000 rows'],
    folder: `src/app/directory/
  directory.routes.ts
  employee.service.ts
  employee-list.page.ts
  employee-detail.page.ts
  employee-card.component.ts
public/assets/employees.json`,
    model: `export interface Employee { id: number; name: string; email: string; department: string; title: string; joined: string; photoUrl?: string; }`,
    code: `// employee.service.ts
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private all$ = this.http.get<Employee[]>('assets/employees.json').pipe(shareReplay(1));   // fetch once, cache
  list() { return this.all$; }
  byId(id: number) { return this.all$.pipe(map(l => l.find(e => e.id === id))); }
}

// employee-list.page.ts
export class EmployeeListPage {
  private service = inject(EmployeeService);
  search = signal('');
  department = signal('');
  sortBy = signal<'name' | 'joined'>('name');
  employees = toSignal(this.service.list(), { initialValue: [] as Employee[] });

  departments = computed(() => [...new Set(this.employees().map(e => e.department))].sort());
  visible = computed(() => {
    const q = this.search().toLowerCase();
    return this.employees()
      .filter(e => (!q || e.name.toLowerCase().includes(q)) && (!this.department() || e.department === this.department()))
      .sort((a, b) => (this.sortBy() === 'name' ? a.name.localeCompare(b.name) : a.joined.localeCompare(b.joined)));
  });
}
// routes: { path: 'employees', component: EmployeeListPage }, { path: 'employees/:id', component: EmployeeDetailPage }
// detail: id = input.required<string>() with withComponentInputBinding() in provideRouter`,
  },
  {
    n: 6, title: 'Product Listing Page',
    goal: 'An e-commerce style listing with filters, sorting, a cart badge and a product detail page, using signals and a cart service.',
    features: ['Grid of product cards with image, price (CurrencyPipe) and rating', 'Category and price-range filters, sorting', 'Add to cart with quantity and a header cart count', 'Product detail route and lazy-loaded cart page', 'Skeleton loading using @defer or placeholders'],
    concepts: 'Module 4 (inputs/outputs), Module 7 (currency pipe), Module 8 (shared cart service), Module 10 (lazy routes), Module 13 (computed totals), Module 18 (track, @defer).',
    extend: ['Server-side filtering with Spring Boot (project 14)', 'Wishlist', 'Product reviews form', 'Checkout flow (project 18)'],
    folder: `src/app/shop/
  products/product-list.page.ts, product-card.component.ts, product-filters.component.ts
  cart/cart.service.ts, cart.page.ts   # lazy loaded
  shop.routes.ts, product.model.ts`,
    model: `export interface Product { id: number; name: string; category: string; price: number; rating: number; stock: number; imageUrl: string; }
export interface CartLine { product: Product; qty: number; }`,
    code: `// cart.service.ts
@Injectable({ providedIn: 'root' })
export class CartService {
  private lines = signal<CartLine[]>([]);
  readonly items = this.lines.asReadonly();
  readonly count = computed(() => this.lines().reduce((n, l) => n + l.qty, 0));
  readonly total = computed(() => this.lines().reduce((s, l) => s + l.product.price * l.qty, 0));

  add(product: Product) {
    this.lines.update(ls => {
      const existing = ls.find(l => l.product.id === product.id);
      if (existing) return ls.map(l => (l === existing && l.qty < product.stock ? { ...l, qty: l.qty + 1 } : l));
      return [...ls, { product, qty: 1 }];
    });
  }
  setQty(id: number, qty: number) { this.lines.update(ls => ls.map(l => (l.product.id === id ? { ...l, qty } : l)).filter(l => l.qty > 0)); }
}

// product-list.page.ts (filters as signals)
category = signal(''); maxPrice = signal(100000); sort = signal<'price' | 'rating'>('rating');
visible = computed(() => this.products()
  .filter(p => (!this.category() || p.category === this.category()) && p.price <= this.maxPrice())
  .sort((a, b) => (this.sort() === 'price' ? a.price - b.price : b.rating - a.rating)));`,
  },
  {
    n: 7, title: 'Expense Tracker',
    goal: 'Track income and expenses by category, show totals and a simple chart, and keep data in localStorage.',
    features: ['Add expense/income with date, amount and category', 'Monthly summary: income, expense, balance', 'Category breakdown with a bar chart (CSS or a chart library)', 'Filter by month and category', 'Export to CSV'],
    concepts: 'Module 11 (forms), Module 7 (date, currency pipes), Module 13 (computed aggregates), Module 15 (persistence), Module 22 (localStorage, file download), Module 21 (UI).',
    extend: ['Move storage to Spring Boot + PostgreSQL', 'Recurring transactions', 'Budgets with alerts', 'Charts with ng2-charts or D3'],
    folder: `src/app/expenses/
  expense.model.ts
  expense.store.ts
  expense-form.component.ts
  expense-table.component.ts
  summary.component.ts
  category-chart.component.ts`,
    model: `export type Kind = 'income' | 'expense';
export interface Transaction { id: string; kind: Kind; amount: number; category: string; date: string; note?: string; }`,
    code: `// expense.store.ts
@Injectable({ providedIn: 'root' })
export class ExpenseStore {
  private tx = signal<Transaction[]>(JSON.parse(localStorage.getItem('tx') ?? '[]'));
  readonly month = signal(new Date().toISOString().slice(0, 7));          // 2025-06
  readonly inMonth = computed(() => this.tx().filter(t => t.date.startsWith(this.month())));

  readonly income = computed(() => this.sum('income'));
  readonly expense = computed(() => this.sum('expense'));
  readonly balance = computed(() => this.income() - this.expense());
  readonly byCategory = computed(() => {
    const map = new Map<string, number>();
    for (const t of this.inMonth().filter(t => t.kind === 'expense')) map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    return [...map].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
  });

  constructor() { effect(() => localStorage.setItem('tx', JSON.stringify(this.tx()))); }
  add(t: Omit<Transaction, 'id'>) { this.tx.update(l => [...l, { ...t, id: crypto.randomUUID() }]); }
  private sum(kind: Kind) { return this.inMonth().filter(t => t.kind === kind).reduce((s, t) => s + t.amount, 0); }

  exportCsv() {
    const rows = ['date,kind,category,amount', ...this.inMonth().map(t => [t.date, t.kind, t.category, t.amount].join(','))];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows.join(String.fromCharCode(10))], { type: 'text/csv' }));
    a.download = 'expenses-' + this.month() + '.csv'; a.click(); URL.revokeObjectURL(a.href);
  }
}`,
  },
];

const intermediateProjects: Project[] = [
  {
    n: 8, title: 'Employee Management System',
    goal: 'A full CRUD application for employees and departments with forms, tables, validation and a typed API layer (mock server first, Spring Boot later).',
    features: ['Employee table with search, sort and pagination', 'Create/edit form (reactive) with department select', 'Delete with confirmation dialog', 'Department management', 'Toast notifications and loading/error states'],
    concepts: 'Module 8 (services), Module 10 (routing, resolvers), Module 11 (reactive forms), Module 14 (HttpClient, interceptors), Module 15 (feature store), Module 21 (tables, dialogs).',
    endpoints: ['GET /api/v1/employees?page=0&size=10&sort=name,asc&q=', 'GET /api/v1/employees/{id}', 'POST /api/v1/employees', 'PUT /api/v1/employees/{id}', 'DELETE /api/v1/employees/{id}', 'GET /api/v1/departments'],
    extend: ['Role-based access (project 16)', 'Export to Excel/CSV', 'Photo upload (project 15)', 'Audit history per employee'],
    folder: `features/employees/
  data-access/employee.api.ts, employee.store.ts, employee.model.ts
  ui/employee-form.component.ts, employee-table.component.ts
  pages/employee-list.page.ts, employee-edit.page.ts
  employees.routes.ts`,
    model: `export interface Employee { id: number; name: string; email: string; salary: number; departmentId: number; joinedOn: string; }
export type EmployeeInput = Omit<Employee, 'id'>;
export interface Page<T> { content: T[]; totalElements: number; number: number; size: number; }`,
    code: `// employee.store.ts - signal store with optimistic delete
@Injectable()
export class EmployeeStore {
  private api = inject(EmployeeApi);
  readonly page = signal<Page<Employee> | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal({ q: '', page: 0, size: 10, sort: 'name,asc' });

  constructor() {
    effect(() => {                                     // re-load whenever the query signal changes
      const q = this.query();
      this.loading.set(true);
      this.api.search(q).subscribe({
        next: p => { this.page.set(p); this.loading.set(false); },
        error: e => { this.error.set(e.message); this.loading.set(false); },
      });
    }, { allowSignalWrites: true });                    // flag required in older versions; not needed in v19+
  }

  remove(id: number) {
    const before = this.page();
    this.page.update(p => p && { ...p, content: p.content.filter(e => e.id !== id) });   // optimistic
    this.api.delete(id).subscribe({ error: () => { this.page.set(before); this.error.set('Delete failed'); } });
  }
}`,
  },
  {
    n: 9, title: 'Student Management System',
    goal: 'Manage students, courses and enrollments with relations (many-to-many) and a grades view.',
    features: ['Student CRUD with search', 'Course catalog and capacity', 'Enroll/unenroll students (many-to-many)', 'Grade entry per course', 'Student profile page with GPA'],
    concepts: 'Module 10 (nested routes), Module 11 (forms, FormArray for grades), Module 12 (combineLatest, forkJoin), Module 14 (parallel requests), Module 23 (relations, DTOs).',
    endpoints: ['GET/POST /api/v1/students', 'GET/PUT/DELETE /api/v1/students/{id}', 'GET/POST /api/v1/courses', 'POST /api/v1/students/{id}/enrollments {courseId}', 'DELETE /api/v1/students/{id}/enrollments/{courseId}', 'PUT /api/v1/enrollments/{id}/grade'],
    extend: ['Attendance tracking', 'PDF report cards', 'Teacher role and timetable', 'Notifications when grades are published'],
    folder: `features/students/ (list, profile, form)
features/courses/ (catalog, detail)
features/enrollments/ (enroll-dialog, grade-sheet)
core/ (api client, auth)`,
    model: `export interface Student { id: number; name: string; email: string; enrolledCourses: CourseSummary[]; }
export interface Course { id: number; code: string; title: string; capacity: number; enrolled: number; }
export interface Enrollment { id: number; studentId: number; courseId: number; grade?: number; }
export type CourseSummary = Pick<Course, 'id' | 'code' | 'title'>;`,
    code: `// student-profile.page.ts - load student and enrollments in parallel, compute GPA
export class StudentProfilePage {
  private api = inject(StudentApi);
  id = input.required<string>();                              // route param via withComponentInputBinding()

  data = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => forkJoin({
        student: this.api.get(+id),
        enrollments: this.api.enrollments(+id),
      })),
    ),
  );
  gpa = computed(() => {
    const graded = this.data()?.enrollments.filter(e => e.grade != null) ?? [];
    return graded.length ? graded.reduce((s, e) => s + e.grade!, 0) / graded.length : null;
  });

  enroll(courseId: number) {
    this.api.enroll(+this.id(), courseId).subscribe({
      next: () => this.reload(),
      error: (e: ApiError) => this.toast.error(e.message),       // e.g. 409 "Course is full"
    });
  }
}

// Spring Boot: StudentController.java
// @PostMapping("/{id}/enrollments") ResponseEntity<EnrollmentDto> enroll(@PathVariable Long id, @RequestBody EnrollRequest r) { ... 409 if capacity reached }`,
  },
  {
    n: 10, title: 'CRUD Application with Spring Boot',
    goal: 'The reference full-stack CRUD: an Angular client for a Spring Boot + JPA + PostgreSQL REST API with validation and error handling end to end.',
    features: ['Entity (Book/Task/Product) CRUD', 'Bean Validation on the server, field errors shown in the Angular form', 'Global exception handling with consistent error body', 'Dev proxy and CORS configuration', 'Docker Compose for API + database'],
    concepts: 'Module 14 (HttpClient, error handling), Module 11 (forms, server errors), Module 23 (the whole module), Module 24 (Docker Compose), Module 20 (HttpTestingController).',
    endpoints: ['GET /api/v1/books', 'GET /api/v1/books/{id}', 'POST /api/v1/books (201 + Location)', 'PUT /api/v1/books/{id}', 'DELETE /api/v1/books/{id} (204)', 'GET /v3/api-docs (OpenAPI)'],
    extend: ['Generate the TypeScript client from OpenAPI', 'Pagination and sorting', 'Optimistic locking with @Version and 409 handling', 'Flyway migrations and Testcontainers tests'],
    folder: `backend/src/main/java/com/acme/books/
  BookController.java, BookService.java, BookRepository.java, Book.java, BookDto.java, GlobalExceptionHandler.java
frontend/src/app/books/
  book.api.ts, book-list.page.ts, book-form.page.ts, book.model.ts`,
    model: `export interface Book { id: number; title: string; author: string; isbn: string; price: number; version: number; }
export type BookInput = Omit<Book, 'id' | 'version'>;
export interface ApiError { status: number; message: string; fieldErrors?: Record<string, string>; }`,
    code: `// book-form.page.ts - show server validation errors on the matching controls
export class BookFormPage {
  private api = inject(BookApi);
  private fb = inject(NonNullableFormBuilder);
  saving = signal(false);
  form = this.fb.group({
    title: ['', Validators.required], author: ['', Validators.required],
    isbn: ['', [Validators.required, Validators.pattern('^[0-9-]{10,17}$')]], price: [0, [Validators.required, Validators.min(0)]],
  });

  save() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.saving.set(true);
    this.api.create(this.form.getRawValue()).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: b => this.router.navigate(['/books', b.id]),
      error: (e: ApiError) => {
        Object.entries(e.fieldErrors ?? {}).forEach(([f, m]) => this.form.get(f)?.setErrors({ server: m }));
        if (!e.fieldErrors) this.toast.error(e.message);
      },
    });
  }
}

// BookController.java
// @PostMapping public ResponseEntity<BookDto> create(@Valid @RequestBody BookInput in) { BookDto b = service.create(in); return ResponseEntity.created(URI.create("/api/v1/books/" + b.id())).body(b); }`,
  },
  {
    n: 11, title: 'Login and Registration System',
    goal: 'Registration, login, logout and protected pages with a simple auth state service and guard (session cookie or token).',
    features: ['Registration with password strength and confirm check', 'Login with remember-me', 'Auth state exposed as signals', 'Guarded routes with returnUrl redirect', 'Navbar that changes by auth state and a profile page'],
    concepts: 'Module 11 (forms, validators), Module 10 (guards, query params), Module 16 (auth vs authorization, secure logout), Module 14 (interceptors), Module 23 (Spring Security).',
    endpoints: ['POST /api/v1/auth/register', 'POST /api/v1/auth/login', 'POST /api/v1/auth/logout', 'GET /api/v1/auth/me'],
    extend: ['Email verification and password reset', 'Social login with OAuth2/OIDC', 'Two-factor authentication', 'Account lockout after repeated failures (server side)'],
    folder: `core/auth/
  auth.service.ts, auth.guard.ts, auth.interceptor.ts, auth.model.ts
features/auth/
  login.page.ts, register.page.ts
features/profile/profile.page.ts`,
    model: `export interface User { id: number; name: string; email: string; roles: string[]; }
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest extends LoginRequest { name: string; }`,
    code: `// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  readonly user = signal<User | null>(null);
  readonly isLoggedIn = computed(() => this.user() !== null);

  login(body: LoginRequest) {
    return this.http.post<User>('/api/v1/auth/login', body, { withCredentials: true }).pipe(tap(u => this.user.set(u)));
  }
  restore() {                                                     // call from provideAppInitializer
    return this.http.get<User>('/api/v1/auth/me', { withCredentials: true }).pipe(
      tap(u => this.user.set(u)), catchError(() => of(null)));
  }
  logout() {
    this.http.post('/api/v1/auth/logout', {}, { withCredentials: true }).subscribe(() => {
      this.user.set(null); this.router.navigateByUrl('/login');
    });
  }
}

// auth.guard.ts
export const authGuard: CanActivateFn = (_r, state) =>
  inject(AuthService).isLoggedIn() || inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

// after login: navigate to the validated returnUrl only if it starts with '/' (prevents open redirect)`,
  },
  {
    n: 12, title: 'JWT Authentication Application',
    goal: 'Stateless authentication with access and refresh tokens: interceptor, silent refresh, logout and role claims, against Spring Security 6.',
    features: ['Login returning access token and HttpOnly refresh cookie', 'Interceptor attaches token and handles 401 with one shared refresh', 'Token kept in memory; restore session via refresh on page load', 'Role claim decoded for UI only', 'Idle timeout and logout on all tabs (BroadcastChannel)'],
    concepts: 'Module 16 (JWT, tokens, storage), Module 14 (functional interceptors), Module 12 (shareReplay, switchMap, catchError), Module 10 (guards), Module 23 (Spring Security JWT).',
    endpoints: ['POST /api/v1/auth/login -> { accessToken } + Set-Cookie refresh', 'POST /api/v1/auth/refresh (cookie) -> { accessToken }', 'POST /api/v1/auth/logout (revokes refresh token)', 'GET /api/v1/profile (authenticated)'],
    extend: ['Refresh token rotation with reuse detection', 'Device management (list and revoke sessions)', 'Move to OAuth2 Authorization Code + PKCE', 'Rate limiting on login'],
    folder: `core/auth/
  token.store.ts          # in-memory access token
  auth.interceptor.ts     # attach + refresh
  auth.service.ts, jwt.util.ts, auth.guard.ts, role.guard.ts`,
    model: `export interface TokenResponse { accessToken: string; }
export interface JwtClaims { sub: string; roles: string[]; exp: number; iat: number; }`,
    code: `// auth.interceptor.ts
let refresh$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const withToken = (r: HttpRequest<unknown>, t: string | null) => (t ? r.clone({ setHeaders: { Authorization: 'Bearer ' + t } }) : r);
  if (req.url.includes('/auth/')) return next(req);

  return next(withToken(req, auth.accessToken())).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);
      refresh$ ??= auth.refresh().pipe(                          // one refresh shared by all failed calls
        map(r => r.accessToken),
        shareReplay(1),
        finalize(() => (refresh$ = null)),
      );
      return refresh$.pipe(
        switchMap(token => next(withToken(req, token))),
        catchError(e => { auth.logout(); return throwError(() => e); }),
      );
    }),
  );
};

// jwt.util.ts (display only, never trust on the client)
export const decode = (t: string): JwtClaims => JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));`,
  },
  {
    n: 13, title: 'Product Management Dashboard',
    goal: 'An admin dashboard to manage products, stock and categories with summary cards, charts and a data table.',
    features: ['KPI cards: total products, low stock, inventory value', 'Product table with inline status toggle, sort, filter, pagination', 'Create/edit in a dialog or side panel', 'Category chart', 'Low-stock alerts'],
    concepts: 'Module 21 (Angular Material table/dialog, layout), Module 13 (computed KPIs), Module 14 (HTTP, params), Module 15 (store), Module 18 (OnPush, track).',
    endpoints: ['GET /api/v1/products?page&size&sort&category&q', 'POST/PUT/DELETE /api/v1/products', 'PATCH /api/v1/products/{id}/active', 'GET /api/v1/products/stats (counts, value, lowStock)', 'GET /api/v1/categories'],
    extend: ['CSV import with preview and validation', 'Bulk actions and undo', 'Barcode scan using camera API', 'Real-time stock updates with SSE'],
    folder: `features/products/
  data-access/product.api.ts, product.store.ts
  ui/kpi-card.component.ts, product-table.component.ts, product-dialog.component.ts
  pages/dashboard.page.ts`,
    model: `export interface Product { id: number; sku: string; name: string; category: string; price: number; stock: number; active: boolean; }
export interface ProductStats { total: number; lowStock: number; inventoryValue: number; byCategory: { category: string; count: number }[]; }`,
    code: `// product-table.component.ts (Angular Material, OnPush)
@Component({
  selector: 'app-product-table', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatSlideToggleModule, CurrencyPipe],
  templateUrl: './product-table.component.html',
})
export class ProductTableComponent {
  products = input.required<Product[]>();
  total = input.required<number>();
  sortChange = output<Sort>();
  pageChange = output<PageEvent>();
  toggle = output<{ id: number; active: boolean }>();
  columns = ['sku', 'name', 'category', 'price', 'stock', 'active', 'actions'];
  lowStock = (p: Product) => p.stock < 10;
}
// html: <table mat-table [dataSource]="products()" matSort (matSortChange)="sortChange.emit($event)"> ...
//       <mat-paginator [length]="total()" [pageSize]="10" (page)="pageChange.emit($event)">

// product.store.ts - server-driven table state
query = signal({ page: 0, size: 10, sort: 'name,asc', category: '', q: '' });
result = toSignal(toObservable(this.query).pipe(switchMap(q => this.api.search(q))));
stats = toSignal(this.api.stats());`,
  },
  {
    n: 14, title: 'Search and Pagination Application',
    goal: 'A large dataset browser with server-side search, filters, sorting and pagination whose state lives in the URL.',
    features: ['Debounced search box', 'Filter chips and sort selector', 'Server-side paging with page size selector', 'Query parameters reflect state (shareable, back button works)', 'Highlight matches, empty and error states'],
    concepts: 'Module 12 (debounceTime, distinctUntilChanged, switchMap), Module 10 (query params, withComponentInputBinding), Module 14 (HttpParams), Module 13 (signals), Module 23 (Spring Data Pageable, Specifications).',
    endpoints: ['GET /api/v1/items?q=&category=&page=0&size=20&sort=createdAt,desc -> Page<ItemDto>'],
    extend: ['Cursor (keyset) pagination and infinite scroll', 'Full-text search with PostgreSQL tsvector or Elasticsearch', 'Saved searches', 'Search suggestions endpoint'],
    folder: `features/catalog/
  catalog.api.ts
  catalog.page.ts          # URL <-> state
  search-box.component.ts
  pager.component.ts`,
    model: `export interface ItemQuery { q: string; category: string; page: number; size: number; sort: string; }
export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }`,
    code: `// catalog.page.ts - the URL is the single source of truth
export class CatalogPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CatalogApi);

  query = toSignal(this.route.queryParamMap.pipe(map((p): ItemQuery => ({
    q: p.get('q') ?? '', category: p.get('category') ?? '',
    page: +(p.get('page') ?? 0), size: +(p.get('size') ?? 20), sort: p.get('sort') ?? 'createdAt,desc',
  }))), { requireSync: true });

  result = toSignal(
    toObservable(this.query).pipe(
      debounce(() => timer(150)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap(q => this.api.search(q).pipe(catchError(() => of(null)))),
    ),
  );

  update(patch: Partial<ItemQuery>) {
    const page = 'page' in patch ? patch.page : 0;               // any filter change resets paging
    this.router.navigate([], { queryParams: { ...patch, page }, queryParamsHandling: 'merge' });
  }
}

// catalog.api.ts
search(q: ItemQuery) {
  let params = new HttpParams().set('page', q.page).set('size', q.size).set('sort', q.sort);
  if (q.q) params = params.set('q', q.q);
  if (q.category) params = params.set('category', q.category);
  return this.http.get<Page<Item>>(environment.apiUrl + '/items', { params });
}`,
  },
  {
    n: 15, title: 'File Upload and Download System',
    goal: 'Upload files with drag and drop and progress, list them, download, preview and delete, with server-side validation and secure storage.',
    features: ['Drag-and-drop zone and file picker, multiple files', 'Client checks for size/type, progress bars, cancel upload', 'List with download and delete', 'Image preview and PDF open in a new tab', 'Server stores files outside the web root with generated names'],
    concepts: 'Module 14 (FormData, progress events, blob download, cancellation), Module 22 (File API, Drag and Drop API), Module 13 (signals), Module 23 (multipart in Spring), Module 16 (secure uploads).',
    endpoints: ['POST /api/v1/files (multipart/form-data) -> FileInfo', 'GET /api/v1/files -> FileInfo[]', 'GET /api/v1/files/{id}/content (attachment or inline)', 'DELETE /api/v1/files/{id}'],
    extend: ['Chunked/resumable uploads (tus protocol)', 'Store in S3-compatible storage with pre-signed URLs', 'Virus scanning and thumbnail generation', 'Per-user quotas'],
    folder: `features/files/
  file.api.ts, upload.service.ts
  dropzone.component.ts, upload-item.component.ts, file-list.page.ts`,
    model: `export interface FileInfo { id: string; name: string; size: number; contentType: string; uploadedAt: string; }
export interface UploadState { file: File; progress: number; status: 'queued' | 'uploading' | 'done' | 'error'; sub?: Subscription; }`,
    code: `// upload.service.ts
@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);
  readonly uploads = signal<UploadState[]>([]);
  private readonly MAX = 10 * 1024 * 1024;

  add(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      if (file.size > this.MAX) { this.patch(file, { status: 'error' }); continue; }
      const state: UploadState = { file, progress: 0, status: 'uploading' };
      this.uploads.update(l => [...l, state]);
      const body = new FormData(); body.append('file', file);
      state.sub = this.http.post<FileInfo>('/api/v1/files', body, { reportProgress: true, observe: 'events' }).subscribe({
        next: ev => {
          if (ev.type === HttpEventType.UploadProgress && ev.total) this.patch(file, { progress: Math.round((100 * ev.loaded) / ev.total) });
          if (ev.type === HttpEventType.Response) this.patch(file, { status: 'done', progress: 100 });
        },
        error: () => this.patch(file, { status: 'error' }),
      });
    }
  }
  cancel(file: File) { this.uploads().find(u => u.file === file)?.sub?.unsubscribe(); this.patch(file, { status: 'error' }); }   // unsubscribe aborts the XHR
  private patch(file: File, p: Partial<UploadState>) { this.uploads.update(l => l.map(u => (u.file === file ? { ...u, ...p } : u))); }
}

// dropzone: <div (dragover)="$event.preventDefault()" (drop)="onDrop($event)"> ... onDrop(e: DragEvent) { e.preventDefault(); this.uploads.add(e.dataTransfer!.files); }`,
  },
  {
    n: 16, title: 'Role-Based Admin Dashboard',
    goal: 'An admin area where menus, routes, buttons and API access depend on user roles and permissions, enforced on both client and server.',
    features: ['Roles: ADMIN, MANAGER, USER with permissions', 'Menu built from permissions', 'canMatch guards prevent loading forbidden lazy modules', 'Structural directive *hasPermission hides actions', 'Server rejects forbidden calls with 403, UI shows a friendly page'],
    concepts: 'Module 16 (RBAC, permission-based UI, backend authorization), Module 10 (canMatch, role navigation, lazy loading), Module 6 (custom structural directive), Module 8 (DI), Module 23 (method security).',
    endpoints: ['GET /api/v1/auth/me -> user + permissions', 'GET /api/v1/admin/users (ROLE_ADMIN)', 'PUT /api/v1/admin/users/{id}/roles (ROLE_ADMIN)', 'GET /api/v1/reports (ROLE_MANAGER or ADMIN)', 'All return 401 without a token, 403 for wrong role'],
    extend: ['Dynamic permissions stored in the database', 'Audit log of admin actions', 'Impersonation with audit', 'Permission matrix editor UI'],
    folder: `core/auth/ permission.service.ts, permission.guard.ts
shared/directives/has-permission.directive.ts
features/admin/ users/, roles/, reports/ (each lazy)
layout/sidebar.component.ts (menu from permission map)`,
    model: `export type Permission = 'user.read' | 'user.write' | 'report.read' | 'settings.write';
export interface SessionUser { id: number; name: string; roles: string[]; permissions: Permission[]; }
export interface MenuItem { label: string; path: string; permission: Permission; }`,
    code: `// has-permission.directive.ts - structural directive
@Directive({ selector: '[hasPermission]' })
export class HasPermissionDirective {
  private tpl = inject(TemplateRef);
  private vcr = inject(ViewContainerRef);
  private perms = inject(PermissionService);
  hasPermission = input.required<Permission>();

  constructor() {
    effect(() => {
      this.vcr.clear();
      if (this.perms.has(this.hasPermission())) this.vcr.createEmbeddedView(this.tpl);
    });
  }
}
// <button *hasPermission="'user.write'" (click)="remove(u)">Delete</button>

// permission.guard.ts - canMatch also stops the lazy bundle download
export const requires = (p: Permission): CanMatchFn => () => inject(PermissionService).has(p) || inject(Router).createUrlTree(['/forbidden']);

// routes
{ path: 'admin/users', canMatch: [requires('user.read')], loadComponent: () => import('./users/users.page').then(m => m.UsersPage) },

// Spring Boot: the real enforcement
// @PreAuthorize("hasAuthority('user.write')") @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { ... }`,
  },
  {
    n: 17, title: 'Real-Time Notification Application',
    goal: 'Push notifications from Spring Boot to Angular in real time (SSE first, WebSocket as the alternative) with unread counters, toasts and a notification center.',
    features: ['Server-Sent Events stream per authenticated user', 'Unread badge in the header, toast on arrival', 'Notification center with mark-as-read and delete', 'Auto-reconnect with backoff and missed message catch-up', 'Browser Notification API opt-in'],
    concepts: 'Module 12 (Observable creation, retry, share), Module 22 (SSE, WebSockets, Notifications API), Module 13 (toSignal), Module 9 (cleanup), Module 23 (Spring SseEmitter).',
    endpoints: ['GET /api/v1/notifications/stream (text/event-stream)', 'GET /api/v1/notifications?unread=true', 'PATCH /api/v1/notifications/{id}/read', 'POST /api/v1/notifications/read-all'],
    extend: ['WebSocket/STOMP version with topics', 'Web Push with a service worker', 'Per-user notification preferences', 'Scale out with Redis pub/sub between server instances'],
    folder: `core/notifications/
  notification.service.ts       # stream + state
  notification-toast.component.ts
features/notifications/ center.page.ts, bell.component.ts`,
    model: `export interface AppNotification { id: number; title: string; body: string; level: 'info' | 'warn' | 'error'; createdAt: string; read: boolean; }`,
    code: `// notification.service.ts - SSE as an Observable
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private zone = inject(NgZone);
  readonly items = signal<AppNotification[]>([]);
  readonly unread = computed(() => this.items().filter(n => !n.read).length);

  private stream$ = new Observable<AppNotification>(sub => {
    const es = new EventSource('/api/v1/notifications/stream', { withCredentials: true });
    es.onmessage = e => this.zone.run(() => sub.next(JSON.parse(e.data)));
    es.onerror = () => sub.error(new Error('SSE connection lost'));
    return () => es.close();                                      // teardown closes the connection
  }).pipe(
    retry({ delay: (_err, n) => timer(Math.min(1000 * 2 ** n, 30000)) }),   // exponential backoff
    share(),
  );

  connect() { this.stream$.pipe(takeUntilDestroyed()).subscribe(n => this.items.update(l => [n, ...l])); }
}

// NotificationController.java (Spring Boot)
// @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
// public SseEmitter stream(Principal p) { SseEmitter e = new SseEmitter(0L); emitters.put(p.getName(), e); e.onCompletion(() -> emitters.remove(p.getName())); return e; }
// EventSource cannot set an Authorization header: use a cookie session or a short-lived stream ticket.`,
  },
];

const advancedProjects: Project[] = [
  {
    n: 18, title: 'E-Commerce Application',
    goal: 'A complete shop: catalog, search, cart, checkout, orders and admin, with JWT auth and a Spring Boot + PostgreSQL backend.',
    features: ['Catalog with server-side search, facets and pagination', 'Persistent cart (server for logged-in users, local for guests, merged on login)', 'Multi-step checkout with address, shipping and payment sandbox', 'Orders history and order status tracking', 'Admin: products, stock and orders; SSR for catalog SEO'],
    concepts: 'Modules 10, 11, 14, 15 (NgRx Signal Store for cart), 16 (JWT, guards), 18 (performance, defer), 19 (SSR), 23 (Spring Boot), 24 (Docker, CI/CD).',
    endpoints: ['GET /api/v1/products, GET /api/v1/products/{slug}', 'GET/PUT /api/v1/cart, POST /api/v1/cart/merge', 'POST /api/v1/orders (idempotency key header)', 'GET /api/v1/orders, GET /api/v1/orders/{id}', 'POST /api/v1/payments/intent (payment provider sandbox)', 'Admin: /api/v1/admin/products, /api/v1/admin/orders'],
    extend: ['Coupons and promotions engine', 'Inventory reservation with timeouts', 'Recommendations', 'Webhooks from the payment provider and email receipts'],
    folder: `apps/shop (Angular)   libs: ui, catalog, cart, checkout, orders, auth, admin
Each lib: data-access (api + store), feature (pages), ui (dumb components)
backend: catalog, cart, order, payment, identity packages (modular monolith)`,
    model: `export interface CartLine { productId: number; name: string; unitPrice: number; qty: number; }
export interface Order { id: number; status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'; lines: CartLine[]; total: number; shipping: Address; createdAt: string; }
export interface Address { name: string; street: string; city: string; zip: string; phone: string; }`,
    code: `// cart.store.ts - NgRx Signal Store with server sync (outline)
export const CartStore = signalStore(
  { providedIn: 'root' },
  withState({ lines: [] as CartLine[], syncing: false }),
  withComputed(({ lines }) => ({
    count: computed(() => lines().reduce((n, l) => n + l.qty, 0)),
    total: computed(() => lines().reduce((s, l) => s + l.unitPrice * l.qty, 0)),
  })),
  withMethods((store, api = inject(CartApi), auth = inject(AuthService)) => ({
    add(p: Product) {
      patchState(store, s => ({ lines: upsert(s.lines, p) }));
      if (auth.isLoggedIn()) api.put(store.lines()).subscribe();      // fire and forget; reconcile on error
    },
    async merge() {                                                    // guest cart + server cart after login
      const merged = await firstValueFrom(api.merge(store.lines()));
      patchState(store, { lines: merged });
    },
  })),
);

// checkout.page.ts - idempotent order creation prevents duplicate orders on double click / retry
placeOrder() {
  const key = this.idempotencyKey ??= crypto.randomUUID();
  this.orders.create(this.cart.lines(), this.address(), key).pipe(exhaustMap(o => this.payments.confirm(o.id)))
    .subscribe(() => { this.cart.clear(); this.router.navigate(['/orders', 'thanks']); });
}`,
  },
  {
    n: 19, title: 'Learning Management System',
    goal: 'Courses with lessons, video progress, quizzes, certificates and role-specific dashboards for students and instructors.',
    features: ['Course catalog, enrollment and lesson player with resume position', 'Quiz engine with attempts and scoring', 'Instructor course builder (drag to reorder lessons)', 'Progress tracking, certificates as PDFs', 'Discussion threads per lesson'],
    concepts: 'Modules 10 (nested routes, resolvers), 11 (dynamic forms for quizzes), 12, 15 (signal stores), 16 (roles), 21 (CDK drag and drop), 22 (video, IndexedDB offline notes), 23.',
    endpoints: ['GET /api/v1/courses, GET /api/v1/courses/{id}/outline', 'POST /api/v1/courses/{id}/enroll', 'PUT /api/v1/lessons/{id}/progress {seconds, completed}', 'POST /api/v1/quizzes/{id}/attempts', 'GET /api/v1/certificates/{courseId}', 'Instructor: POST/PUT /api/v1/instructor/courses'],
    extend: ['Live classes with WebRTC', 'Gamification (badges, streaks)', 'Learning paths with prerequisites', 'Analytics for instructors (project 21)'],
    folder: `features/catalog, features/player (lesson-player, outline-sidebar, notes), features/quiz,
features/instructor (course-builder), features/certificates
core/progress.service.ts (debounced autosave)`,
    model: `export interface Lesson { id: number; title: string; videoUrl: string; durationSec: number; order: number; }
export interface Progress { lessonId: number; seconds: number; completed: boolean; }
export interface Question { id: number; text: string; type: 'single' | 'multi'; options: { id: number; label: string }[]; }`,
    code: `// progress.service.ts - autosave video position without flooding the API
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private http = inject(HttpClient);
  private position$ = new Subject<{ lessonId: number; seconds: number }>();

  constructor() {
    this.position$.pipe(
      groupBy(p => p.lessonId),
      mergeMap(g => g.pipe(auditTime(5000))),                       // at most one save per 5 s per lesson
      concatMap(p => this.http.put('/api/v1/lessons/' + p.lessonId + '/progress', { seconds: p.seconds, completed: false })),
      takeUntilDestroyed(),
    ).subscribe();
  }
  report(lessonId: number, seconds: number) { this.position$.next({ lessonId, seconds }); }
}

// lesson-player.page.ts
@ViewChild('video') video!: ElementRef<HTMLVideoElement>;
onTimeUpdate() { this.progress.report(this.lessonId(), Math.floor(this.video.nativeElement.currentTime)); }
onEnded() { this.http.put(..., { seconds: 0, completed: true }).subscribe(() => this.outline.markDone(this.lessonId())); }

// quiz: render questions with @for and a FormArray of FormControls; score on the SERVER (never ship correct answers to the client)`,
  },
  {
    n: 20, title: 'Online Examination Platform',
    goal: 'Timed exams with randomised questions, autosave, anti-cheating signals and instant or deferred results, with strict server-side control.',
    features: ['Exam scheduling and eligibility', 'Server-timed countdown, autosave of answers, resume after disconnect', 'Question and option randomisation per attempt', 'Tab-switch and fullscreen exit logging (signals, not proof)', 'Results, review mode and an examiner dashboard'],
    concepts: 'Modules 12 (timer, interval, takeUntil), 13 (signals), 10 (CanDeactivate), 16 (security), 22 (Page Visibility, Fullscreen API), 23 (server authority), 20 (testing time-dependent code).',
    endpoints: ['POST /api/v1/exams/{id}/attempts -> attempt with serverDeadline', 'GET /api/v1/attempts/{id} (questions without answers)', 'PUT /api/v1/attempts/{id}/answers/{questionId}', 'POST /api/v1/attempts/{id}/submit', 'GET /api/v1/attempts/{id}/result', 'POST /api/v1/attempts/{id}/events (violations)'],
    extend: ['Proctoring via webcam snapshots (with consent)', 'Question banks with tags and difficulty', 'Adaptive exams', 'Offline-tolerant mode with a service worker queue'],
    folder: `features/exam/
  data-access/attempt.api.ts, attempt.store.ts
  pages/exam-runner.page.ts, result.page.ts
  ui/timer.component.ts, question-card.component.ts, palette.component.ts
  guards/exam-leave.guard.ts`,
    model: `export interface Attempt { id: number; examId: number; startedAt: string; serverDeadline: string; questions: ExamQuestion[]; answers: Record<number, number[]>; }
export interface ExamQuestion { id: number; text: string; options: { id: number; label: string }[]; }`,
    code: `// attempt.store.ts - the deadline comes from the server; the client only displays it
@Injectable()
export class AttemptStore {
  private api = inject(AttemptApi);
  readonly attempt = signal<Attempt | null>(null);
  private offset = 0;                                                // serverNow - clientNow, measured at load
  readonly remainingMs = toSignal(
    interval(1000).pipe(map(() => Math.max(0, this.deadlineMs() - (Date.now() + this.offset)))),
    { initialValue: 0 },
  );
  readonly expired = computed(() => this.attempt() !== null && this.remainingMs() === 0);

  private deadlineMs = () => new Date(this.attempt()?.serverDeadline ?? 0).getTime();

  answer(qid: number, optionIds: number[]) {
    this.attempt.update(a => a && { ...a, answers: { ...a.answers, [qid]: optionIds } });
    this.save$.next({ qid, optionIds });
  }
  private save$ = new Subject<{ qid: number; optionIds: number[] }>();
  private _ = this.save$.pipe(concatMap(x => this.api.saveAnswer(this.attempt()!.id, x.qid, x.optionIds).pipe(retry(2))), takeUntilDestroyed()).subscribe();
}

// violation logging
@HostListener('document:visibilitychange') onVis() { if (document.hidden) this.api.event(this.attemptId(), 'TAB_HIDDEN').subscribe(); }

// exam-leave.guard.ts
export const examLeaveGuard: CanDeactivateFn<ExamRunnerPage> = c => c.submitted() || confirm('Leave the exam? Your attempt stays active.');`,
  },
  {
    n: 21, title: 'Analytics Dashboard',
    goal: 'An interactive dashboard with KPI tiles, time-series and breakdown charts, date-range filters, drill-down and live refresh.',
    features: ['Global date range and segment filters shared by all widgets', 'Line, bar and donut charts, sortable tables', 'Drill-down from chart to table', 'Widget lazy loading with @defer on viewport', 'CSV export and shareable URL state'],
    concepts: 'Modules 12 (combineLatest, shareReplay, switchMap), 13 (signals), 18 (OnPush, @defer, web workers for heavy aggregation), 21 (grid layouts, CSS variables), 22 (ResizeObserver, IntersectionObserver), 23 (aggregate endpoints).',
    endpoints: ['GET /api/v1/metrics/summary?from&to&segment', 'GET /api/v1/metrics/timeseries?metric=revenue&from&to&interval=day', 'GET /api/v1/metrics/breakdown?by=country&from&to', 'GET /api/v1/metrics/export.csv', 'GET /api/v1/metrics/stream (SSE for live KPI)'],
    extend: ['User-configurable widget layout (drag and resize, saved per user)', 'Alerts with thresholds', 'Server-side materialised views for speed', 'Embeddable read-only dashboards'],
    folder: `features/analytics/
  state/filters.store.ts          # date range, segment (signals)
  data-access/metrics.api.ts
  widgets/kpi-tile, line-chart, donut-chart, breakdown-table (each standalone, OnPush)
  pages/dashboard.page.ts`,
    model: `export interface DateRange { from: string; to: string; }
export interface SeriesPoint { t: string; value: number; }
export interface Breakdown { key: string; value: number; delta: number; }`,
    code: `// filters.store.ts + widget data using resource-style signal flows
@Injectable({ providedIn: 'root' })
export class FiltersStore {
  readonly range = signal<DateRange>({ from: daysAgo(30), to: today() });
  readonly segment = signal('all');
  readonly params = computed(() => ({ ...this.range(), segment: this.segment() }));
}

// line-chart.component.ts - fetches its own data when the filters change
@Component({ selector: 'app-revenue-chart', changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './chart.html' })
export class RevenueChartComponent {
  private filters = inject(FiltersStore);
  private api = inject(MetricsApi);
  series = toSignal(
    toObservable(this.filters.params).pipe(
      switchMap(p => this.api.timeseries('revenue', p).pipe(startWith(null), catchError(() => of([])))),
    ),
  );
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('c');
  constructor() {
    afterRenderEffect(() => {                                       // v20; use effect + afterNextRender in earlier versions
      const data = this.series();
      if (data) drawLine(this.canvas().nativeElement, data);        // chart.js or d3 wrapper
    });
  }
}

// dashboard.page.html
// @defer (on viewport) { <app-revenue-chart /> } @placeholder { <div class="skeleton"></div> }`,
  },
  {
    n: 22, title: 'Microservices-Based Frontend',
    goal: 'An Angular front end working with several Spring Boot microservices behind an API gateway, optionally composed as micro frontends.',
    features: ['Gateway (Spring Cloud Gateway) as single origin with route per service', 'Per-service API clients with shared auth and error handling', 'Backend-for-frontend aggregation endpoint for the dashboard', 'Micro frontends with Native Federation: shell + 2 remotes', 'Resilience: timeouts, retries, circuit-breaker fallbacks in UI'],
    concepts: 'Modules 14 (interceptors, retry, timeout), 16 (token relay), 17 (micro frontends, monorepo), 26 (boundaries, adapters), 24 (Docker Compose, Nginx), 23 (CORS at the gateway).',
    endpoints: ['Gateway: /api/users/** -> user-service, /api/orders/** -> order-service, /api/catalog/** -> catalog-service', 'BFF: GET /bff/dashboard (aggregates users + orders + catalog)', 'Health: /actuator/health on every service', 'Auth: tokens issued by an identity service (Keycloak) and validated by each service'],
    extend: ['Event-driven updates with Kafka and SSE to the UI', 'Distributed tracing (traceparent header, OpenTelemetry)', 'Contract tests (Pact) between UI and services', 'Independent deployment pipelines per remote'],
    folder: `monorepo/
  apps/shell, apps/orders-mfe, apps/catalog-mfe
  libs/shared/auth, libs/shared/ui, libs/shared/http
  services/gateway, user-service, order-service, catalog-service
  deploy/docker-compose.yml, nginx.conf`,
    model: `export interface ServiceConfig { name: string; baseUrl: string; timeoutMs: number; }
export interface RemoteDef { name: string; remoteEntry: string; exposedModule: string; }`,
    code: `// resilient-http.interceptor.ts - uniform policy for every service call
export const resilienceInterceptor: HttpInterceptorFn = (req, next) => {
  const idempotent = req.method === 'GET' || req.method === 'HEAD';
  return next(req).pipe(
    timeout({ first: 8000 }),
    retry({
      count: idempotent ? 2 : 0,
      delay: (err, attempt) => (err instanceof HttpErrorResponse && err.status >= 500) || err.name === 'TimeoutError'
        ? timer(300 * 2 ** attempt)                                 // exponential backoff
        : throwError(() => err),
    }),
    catchError(err => { inject(ObservabilityService).record(req.url, err); return throwError(() => err); }),
  );
};

// shell route table using Native Federation remotes
export const routes: Routes = [
  { path: 'orders', loadChildren: () => loadRemoteModule('orders', './routes').then(m => m.ORDER_ROUTES) },
  { path: 'catalog', loadChildren: () => loadRemoteModule('catalog', './routes').then(m => m.CATALOG_ROUTES) },
];

// BFF response adapter: one call instead of three on slow mobile networks
dashboard = toSignal(this.http.get<DashboardDto>('/bff/dashboard').pipe(catchError(() => of(null))));
// Gateway (application.yml): spring.cloud.gateway.routes[0].id=orders, uri=http://order-service:8080, predicates=Path=/api/orders/**`,
  },
  {
    n: 23, title: 'Real-Time Chat Application',
    goal: 'A multi-room chat with presence, typing indicators, message history and delivery status over WebSocket (STOMP) with reconnection.',
    features: ['Rooms and direct messages', 'Presence (online/offline) and typing indicators', 'Message history with infinite scroll upwards', 'Delivery and read receipts', 'Reconnect with backoff and message queue while offline'],
    concepts: 'Modules 12 (webSocket subject, retry, multicasting), 13 (signals), 18 (virtual scroll, OnPush), 22 (WebSockets, Intersection Observer, Notifications), 16 (token on handshake), 23 (Spring WebSocket/STOMP).',
    endpoints: ['WS /ws (STOMP endpoint, SockJS fallback optional)', 'SUBSCRIBE /topic/rooms/{id}, /user/queue/dm, /topic/presence', 'SEND /app/rooms/{id}/message, /app/rooms/{id}/typing', 'REST: GET /api/v1/rooms/{id}/messages?before={id}&size=30', 'REST: POST /api/v1/rooms, GET /api/v1/rooms'],
    extend: ['File and image messages (project 15)', 'End-to-end encryption', 'Message reactions and threads', 'Horizontal scaling with a broker relay (RabbitMQ) and Redis presence'],
    folder: `features/chat/
  data-access/chat-socket.service.ts, message.api.ts, chat.store.ts
  ui/message-list.component.ts (virtual scroll), composer.component.ts, presence-list.component.ts
  pages/chat.page.ts`,
    model: `export interface ChatMessage { id: number; roomId: number; senderId: number; text: string; sentAt: string; status: 'sending' | 'sent' | 'read'; clientId: string; }
export interface Presence { userId: number; online: boolean; }`,
    code: `// chat-socket.service.ts - wrapper around RxJS webSocket with reconnect and outbound queue
@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private auth = inject(AuthService);
  readonly connected = signal(false);
  private queue: ChatMessage[] = [];
  private socket$?: WebSocketSubject<ServerEvent | ClientEvent>;

  readonly events$: Observable<ServerEvent> = defer(() => {
    this.socket$ = webSocket<ServerEvent | ClientEvent>({
      url: 'wss://' + location.host + '/ws/chat?ticket=' + this.auth.wsTicket(),   // short-lived ticket, not the JWT in the URL
      openObserver: { next: () => { this.connected.set(true); this.flush(); } },
      closeObserver: { next: () => this.connected.set(false) },
    });
    return this.socket$ as Observable<ServerEvent>;
  }).pipe(
    retry({ delay: (_e, n) => timer(Math.min(1000 * 2 ** n, 15000)) }),
    share(),
  );

  send(msg: ChatMessage) {
    if (this.connected()) this.socket$!.next({ type: 'message', payload: msg });
    else this.queue.push(msg);                                      // sent after reconnect
  }
  private flush() { this.queue.splice(0).forEach(m => this.send(m)); }
}

// chat.store.ts: optimistic message with clientId, replaced when the server echo arrives
onEcho(e: ChatMessage) { this.messages.update(l => l.map(m => (m.clientId === e.clientId ? { ...e, status: 'sent' } : m))); }`,
  },
  {
    n: 24, title: 'SSR-Based SEO-Friendly Website',
    goal: 'A content site (blog or catalog) with Angular SSR, hydration, dynamic metadata, sitemap and excellent Core Web Vitals.',
    features: ['SSR with incremental hydration and prerendered static pages for content', 'Per-page title, description, canonical, Open Graph and JSON-LD', 'Server data fetching with transfer cache (no duplicate calls)', 'Images with NgOptimizedImage, fonts and critical CSS', 'Sitemap.xml, robots.txt, 404 with a real 404 status'],
    concepts: 'Modules 19 (SSR, hydration, SEO, deployment), 18 (Core Web Vitals, images, defer), 10 (route titles, resolvers), 14 (HTTP cache), 24 (Node server in Docker behind Nginx), 22 (browser-only APIs).',
    endpoints: ['GET /api/v1/posts?page, GET /api/v1/posts/{slug}', 'GET /api/v1/sitemap (list of slugs and lastModified)', 'Server route: /sitemap.xml generated by the Angular server'],
    extend: ['ISR-like revalidation with CDN cache and stale-while-revalidate', 'RSS feed', 'Multi-language with hreflang (Module 27)', 'Automated Lighthouse CI budgets'],
    folder: `src/app/
  pages/home, post-list, post-detail, not-found
  core/seo.service.ts
src/server.ts (Express engine)  src/app/app.routes.server.ts (RenderMode per route)
app.config.ts (provideClientHydration(withEventReplay()))`,
    model: `export interface Post { slug: string; title: string; excerpt: string; html: string; coverUrl: string; publishedAt: string; updatedAt: string; tags: string[]; }
export interface SeoData { title: string; description: string; image?: string; canonical: string; type?: 'website' | 'article'; }`,
    code: `// seo.service.ts
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title); private meta = inject(Meta); private doc = inject(DOCUMENT);

  set(d: SeoData) {
    this.title.setTitle(d.title + ' | MyBlog');
    this.meta.updateTag({ name: 'description', content: d.description });
    this.meta.updateTag({ property: 'og:title', content: d.title });
    this.meta.updateTag({ property: 'og:description', content: d.description });
    this.meta.updateTag({ property: 'og:type', content: d.type ?? 'website' });
    if (d.image) this.meta.updateTag({ property: 'og:image', content: d.image });
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = this.doc.createElement('link'); link.rel = 'canonical'; this.doc.head.appendChild(link); }
    link.href = d.canonical;
  }
}

// post-detail.page.ts - data via a resolver so the server waits and metadata exists in the first HTML
export const postResolver: ResolveFn<Post> = route => inject(PostApi).bySlug(route.paramMap.get('slug')!);
// route: { path: 'blog/:slug', component: PostDetailPage, resolve: { post: postResolver } }
export class PostDetailPage {
  post = input.required<Post>();                                    // resolver data bound with withComponentInputBinding()
  constructor() { effect(() => this.seo.set({ title: this.post().title, description: this.post().excerpt, canonical: 'https://blog.example.com/blog/' + this.post().slug, type: 'article' })); }
}

// app.routes.server.ts (v19+)
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'blog/:slug', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];`,
  },
  {
    n: 25, title: 'Enterprise Admin Portal',
    goal: 'A large multi-module admin portal combining everything: SSO login, RBAC, a design-system library, feature modules with strict boundaries, i18n, accessibility, audit trail, CI/CD and observability.',
    features: ['OIDC login (Authorization Code + PKCE) with Keycloak/Entra ID and role mapping', 'Nx monorepo: shell app, domain libraries, design system library with Storybook', 'Generic data-grid, dynamic forms from JSON schema, saved views', 'Audit trail UI, notifications, i18n (3 languages incl. RTL) and WCAG AA', 'Pipeline: lint, tests, e2e, a11y checks, bundle budgets, container build, staged deploys and rollback'],
    concepts: 'Everything: Modules 8, 10, 11, 15 (NgRx), 16, 17, 18, 20, 21, 24, 26 (architecture), 27 (a11y and i18n), 23 (Spring Boot, OpenAPI client generation).',
    endpoints: ['Spring Boot resource server validating JWT from the IdP (issuer-uri)', 'GET /api/v1/me/permissions', 'CRUD per domain: /api/v1/{customers,contracts,invoices,users}', 'GET /api/v1/audit?entity=&actor=&from=&to=', 'OpenAPI spec -> generated TypeScript clients in libs/api'],
    extend: ['Feature flags service and gradual rollout', 'Tenant isolation (multi-tenancy) with a tenant header and row-level security', 'Offline-capable PWA for field staff', 'Self-service report builder'],
    folder: `apps/portal (shell: layout, routing, auth bootstrap)
libs/
  shared/ui (design system), shared/util, shared/data-grid, shared/forms
  api (generated OpenAPI clients)
  customers/{feature,data-access,ui,domain}, contracts/..., invoices/...
tools/ (generators, lint rules for boundaries)`,
    model: `export interface PermissionSet { permissions: string[]; tenantId: string; }
export interface GridColumn<T> { field: keyof T & string; header: string; sortable?: boolean; format?: (v: T[keyof T], row: T) => string; width?: string; }
export interface AuditEntry { id: string; actor: string; action: string; entity: string; entityId: string; at: string; diff: Record<string, [unknown, unknown]>; }`,
    code: `// app.config.ts - composition root of the portal
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),                                // stable from v20.2; experimental earlier
    provideRouter(routes, withComponentInputBinding(), withPreloading(QuicklinkStrategy), withViewTransitions()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, tenantInterceptor, resilienceInterceptor, errorInterceptor])),
    provideOAuthClient({ resourceServer: { allowedUrls: ['/api'], sendAccessToken: true } }),   // angular-oauth2-oidc
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: LOCALE_ID, deps: [LocaleService], useFactory: (l: LocaleService) => l.current() },
    provideAppInitializer(async () => { await inject(AuthService).initialize(); await inject(PermissionStore).load(); }),
  ],
};

// generic data grid contract (shared/data-grid)
@Component({ selector: 'app-grid', changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './grid.html' })
export class GridComponent<T extends { id: string | number }> {
  columns = input.required<GridColumn<T>[]>();
  rows = input.required<T[]>();
  sort = model<{ field: string; dir: 'asc' | 'desc' } | null>(null);
  rowClick = output<T>();
}

// boundary rule (eslint): feature libs may import only ui, data-access, domain, shared. Features never import other features.`,
  },
];

const mod29: SubTopic = {
  id: 'ngs-mod-29',
  name: 'Module 29 · Practical Projects',
  topics: [
    overview(29, 'Practical Projects', L29, [
      ['1 Personal Portfolio', 'Static responsive showcase site.', 1],
      ['2 Calculator', 'Pure logic engine plus keyboard UI.', 1],
      ['3 To-Do List', 'Signal store with persistence.', 1],
      ['4 Student Registration Form', 'Large reactive form with FormArray.', 1],
      ['5 Employee Directory', 'Search, sort, routing with JSON data.', 1],
      ['6 Product Listing Page', 'Filters, cart service, lazy cart route.', 1],
      ['7 Expense Tracker', 'Aggregates with computed signals.', 1],
      ['8 Employee Management System', 'Full CRUD with a feature store.', 2],
      ['9 Student Management System', 'Relations, enrollments, grades.', 2],
      ['10 CRUD Application with Spring Boot', 'Reference full-stack CRUD with validation.', 2],
      ['11 Login and Registration System', 'Auth state, guard and returnUrl.', 2],
      ['12 JWT Authentication Application', 'Access and refresh tokens with interceptor.', 2],
      ['13 Product Management Dashboard', 'KPI tiles and Material table.', 2],
      ['14 Search and Pagination Application', 'URL-driven server-side search and paging.', 2],
      ['15 File Upload and Download System', 'Drag and drop, progress, download.', 2],
      ['16 Role-Based Admin Dashboard', 'Permissions, directive and canMatch.', 2],
      ['17 Real-Time Notification Application', 'SSE with reconnect.', 2],
      ['18 E-Commerce Application', 'Cart, checkout, orders, SSR catalog.', 3],
      ['19 Learning Management System', 'Courses, progress, quizzes.', 3],
      ['20 Online Examination Platform', 'Server-timed exams and autosave.', 3],
      ['21 Analytics Dashboard', 'Shared filters and lazy charts.', 3],
      ['22 Microservices-Based Frontend', 'Gateway, BFF and micro frontends.', 3],
      ['23 Real-Time Chat Application', 'WebSocket with reconnect and queue.', 3],
      ['24 SSR-Based SEO-Friendly Website', 'SSR, metadata and prerendering.', 3],
      ['25 Enterprise Admin Portal', 'Everything combined in a monorepo.', 3],
    ]),

    topic(
      'ngs-m29-beginner-projects',
      'Beginner projects (1-7)',
      [
        blk(`<h3>How to use the beginner projects</h3>
Build these in order. Each project is small enough to finish in a weekend and trains one cluster of ideas. For every project: (1) sketch the screens, (2) write the data model first, (3) build the smallest working version, (4) add features one at a time, (5) commit after each step. Compare your solution with the key code only <b>after</b> you tried.`),
        ...beginnerProjects.map(proj),
      ],
      [
        blk(`<h3>Build order and quality checklist (beginner)</h3>
• Order inside each project: model, service/store, container component, presentational components, styling, tests, polish.<br>
• Checklist: strict TypeScript with no <code>any</code>, standalone components, <code>@for</code> with <code>track</code>, signals for state, labels on every input, keyboard usable, responsive at 360px width, at least three unit tests (engine or store logic), lint and format clean.<br>
• Publish to GitHub Pages or Netlify with <code>ng build</code> and write a README with screenshots: it becomes your portfolio.`),
      ],
      [
        blk(`<h3>Reviewing your own beginner projects like a senior</h3>
• Is logic outside the template and testable (calculator engine, store)? Are updates immutable? Could the component be OnPush-safe? Is persisted data validated when read (corrupt localStorage must not crash the app)?<br>
• Accessibility: real buttons, focus order, live region for the calculator display, error messages linked to inputs.<br>
• Refactor pass: extract presentational components, move constants out, replace magic strings with union types, add a route-level lazy load for the heaviest page. Write down one trade-off per project.`),
      ],
      [
        ['Which beginner project teaches signals best?', 'The to-do list and expense tracker: signals for state, computed for filtered lists and totals, effect for persistence.'],
        ['How do you keep calculator logic testable?', 'Put arithmetic in pure functions in a separate file and let the component only handle input and display.'],
        ['What do you practise with the registration form project?', 'Typed reactive forms, nested groups, FormArray, built-in and custom validators, cross-field checks and accessible errors.'],
        ['Why separate smart and presentational components in the product listing?', 'The page handles filters and the cart service; cards only render inputs and emit outputs, which makes them reusable and OnPush-friendly.'],
      ],
    ),

    topic(
      'ngs-m29-intermediate-projects',
      'Intermediate projects (8-17)',
      [
        blk(`<h3>How to use the intermediate projects</h3>
These add a real backend, authentication and real-time features. Start the Spring Boot API first (or a mock with json-server), publish its OpenAPI spec, then build the Angular client against it. Projects 10 to 12 are the reference implementations you will reuse in projects 13 to 17 and in the advanced projects: finish them well.`),
        ...intermediateProjects.map(proj),
      ],
      [
        blk(`<h3>Build order and quality checklist (intermediate)</h3>
• Order: API contract (DTOs, errors), Angular models and API service, store, pages, validation and error states, auth, tests, Docker Compose.<br>
• Checklist: feature folders with lazy routes, functional guards and interceptors, one error format end to end, loading/empty/error UI everywhere, server-side validation mirrored in forms, CORS or proxy configured, HttpTestingController tests for each API service, integration tests with MockMvc and Testcontainers, Swagger UI available, secrets in environment variables.<br>
• Security checks: test every endpoint without token and with the wrong role; remember guards are UX only.`),
      ],
      [
        blk(`<h3>Expert review points (intermediate)</h3>
• Consistency: one place for URLs, one error mapper, one pagination model. Idempotent GET retries only; double-submit protection with <code>exhaustMap</code> on writes.<br>
• Concurrency: add optimistic locking (<code>@Version</code>) and handle 409 in the UI; cancel stale requests with <code>switchMap</code>; clean up SSE or sockets with teardown logic.<br>
• Token design (project 12): refresh in an HttpOnly cookie, rotation, a single shared refresh, logout everywhere. File handling (project 15): validate content, never trust names, stream large files.<br>
• Observability: correlation id header, structured logs, Actuator health, and frontend error reporting. Deploy through the pipeline from Module 24 and practise a rollback.`),
      ],
      [
        ['What should project 10 (CRUD with Spring Boot) demonstrate?', 'Typed Angular service, DTOs, Bean Validation with field errors in the form, global error handling, CORS or proxy, and Docker Compose with a database.'],
        ['How does project 12 avoid a refresh storm?', 'The interceptor shares one in-flight refresh observable (shareReplay) so concurrent 401s wait for the same new token and then retry.'],
        ['Why keep search state in the URL in project 14?', 'Pages become shareable and bookmarkable, back/forward works and state survives refresh; the query params become the single source of truth.'],
        ['How do you secure uploads in project 15?', 'Validate size and content type on the server, generate stored names, store outside the web root, authorize downloads and consider scanning.'],
        ['SSE or WebSocket for notifications in project 17?', 'SSE is simpler for one-way server push with automatic reconnect; WebSocket is needed for bidirectional traffic such as chat. EventSource cannot set headers, so authenticate by cookie or ticket.'],
      ],
    ),

    topic(
      'ngs-m29-advanced-projects',
      'Advanced projects (18-25)',
      [
        blk(`<h3>How to use the advanced projects</h3>
These are architecture exercises. Do not try to build every feature: slice vertically. Deliver a thin end-to-end path first (login, one list, one write), then deepen. Write an architecture decision record (ADR) for each major choice (state library, rendering mode, monorepo tool, federation or not).`),
        ...advancedProjects.map(proj),
      ],
      [
        blk(`<h3>Delivery plan (advanced)</h3>
• Week 1: workspace, CI, auth, design tokens, one vertical slice deployed. Week 2-3: domain features with boundaries and tests. Week 4: performance budgets, accessibility audit, i18n, observability, load test, runbook, rollback rehearsal.<br>
• Definition of done: lint, unit, integration and e2e green; Lighthouse performance and accessibility at least 90; bundle budgets enforced; OWASP checks done; documented ADRs and a README that lets a stranger run it with one command (<code>docker compose up</code>).`),
      ],
      [
        blk(`<h3>Architecture trade-offs to defend in an interview</h3>
• <b>Monolith first</b>: a modular monolith backend plus a well-bounded Angular monorepo beats premature microservices and micro frontends; adopt federation only for independent team deployment.<br>
• <b>State</b>: signals and feature stores by default; NgRx for the cart, exams and chat where event traceability and complex concurrency matter.<br>
• <b>Real time</b>: SSE for server push, WebSocket/STOMP for bidirectional; always plan reconnection, ordering, duplicates (client ids) and backpressure. <b>Time and exams</b>: server authority, client display only.<br>
• <b>Rendering</b>: prerender content, SSR dynamic pages, CSR for authenticated apps; transfer cache to avoid double fetches; never touch <code>window</code> on the server.<br>
• <b>Operations</b>: idempotency keys on payments and orders, retries only on idempotent calls, circuit breaker at the gateway, tracing across services, feature flags for safe rollout. Version note: zoneless, <code>afterRenderEffect</code>, route render modes and incremental hydration depend on Angular 19-20+; check your version.`),
      ],
      [
        ['How would you structure the e-commerce project?', 'An Nx workspace with catalog, cart, checkout, orders and admin domain libraries (feature, data-access, ui), SSR for the public catalog, a signal store for the cart and a modular monolith Spring Boot backend.'],
        ['Why must the exam timer use server time?', 'Client clocks can be changed; the server issues the deadline, the client shows a countdown adjusted by an offset and the server rejects late submissions.'],
        ['What makes chat reconnection robust?', 'Exponential backoff, a queue of unsent messages, client-generated ids for de-duplication and optimistic UI reconciled by server echoes, plus history catch-up after reconnect.'],
        ['How do you make an SSR site SEO friendly?', 'Prerender or SSR content pages, set title, description, canonical and Open Graph per route, return real 404 status, provide sitemap and robots, optimise images and Core Web Vitals.'],
        ['When are micro frontends the right choice?', 'When separate teams must deploy parts of a very large product independently; otherwise use a monorepo with lazy feature libraries.'],
        ['What proves the enterprise portal is production ready?', 'Green quality gates in CI, enforced boundaries, accessibility and i18n coverage, security tests, observability, documented runbooks and a rehearsed rollback.'],
      ],
    ),
  ],
};

export const angularSyllabus4: SubTopic[] = [mod23, mod24, mod25, mod26, mod27, mod28, mod29];
