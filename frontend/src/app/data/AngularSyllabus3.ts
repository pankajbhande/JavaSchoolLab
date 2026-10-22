// Angular syllabus, part 3: modules 16-22 (security, advanced Angular, performance, SSR, testing, UI development, browser APIs).
import type { SubTopic, Topic } from './types';
import { blk, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';

/** Overview-and-checklist topic: every syllabus item of the module, in order, with a one-line explanation and the lesson that covers it. */
const overview = (n: number, title: string, rows: [string, string, string][]): Topic =>
  topic(
    'ngs-m' + n + '-overview',
    'Module ' + n + ' overview and checklist',
    [
      blk(
        '<h3>Module ' + n + ': ' + title + '</h3>' +
          'Use this table as a <b>checklist</b>. Every syllabus item of the module is listed in order with a one-line explanation and the lesson below that teaches it in detail.<br><br>' +
          '<table ' + TABLE + '><thead><tr><th>Syllabus item</th><th>In one line</th><th>Covered in</th></tr></thead><tbody>' +
          rows.map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') +
          '</tbody></table>',
      ),
    ],
    [],
    [],
    [],
  );

// ---------------------------------------------------------------- Module 16
const L16a = 'Authentication, JWT and token storage';
const L16b = 'Interceptors, guards, RBAC and backend authorization';
const L16c = 'XSS, CSRF, CSP and Angular sanitization';
const L16d = 'Transport, configuration and security best practices';

const module16: SubTopic = {
  id: 'ngs-mod-16',
  name: 'Module 16 · Authentication and Security',
  topics: [
    overview(16, 'Angular Authentication and Security', [
      ['Authentication vs authorization', 'Who are you (identity) versus what may you do (permissions).', L16a],
      ['Login and registration', 'Forms that call the backend; the server verifies credentials and creates accounts.', L16a],
      ['Logout', 'Discard the client session and tell the server to invalidate it.', L16a],
      ['JWT fundamentals', 'A signed token of three Base64URL parts: header, payload, signature.', L16a],
      ['Access tokens and refresh tokens', 'Short-lived token for API calls plus a longer-lived one to get new access tokens.', L16a],
      ['Token storage considerations', 'localStorage vs memory vs HttpOnly cookie, and the trade-offs of each.', L16a],
      ['HTTP interceptors for authentication', 'One functional interceptor attaches the token and handles 401.', L16b],
      ['Route guards', 'Functions that allow or block navigation (UX only).', L16b],
      ['Role-based access control', 'Allow screens and actions by role such as ADMIN or USER.', L16b],
      ['Permission-based UI', 'Show or hide buttons and menus by fine-grained permission.', L16b],
      ['Backend authorization', 'The real enforcement: Spring Boot must check every request.', L16b],
      ['Secure session management', 'Session lifetime, rotation, idle timeout and cookie flags.', L16b],
      ['Cross-Site Scripting (XSS)', 'Attacker script runs in your page and steals data or acts as the user.', L16c],
      ['Cross-Site Request Forgery (CSRF)', 'A foreign site makes the browser send an authenticated request.', L16c],
      ['Content Security Policy (CSP)', 'A response header that limits where scripts and resources may load from.', L16c],
      ['Angular template security', 'Angular treats all template values as untrusted and escapes or sanitizes them.', L16c],
      ['Sanitization', 'Angular strips dangerous parts of HTML, style and URL values.', L16c],
      ['Safe DOM manipulation', 'Prefer bindings and Renderer2; avoid raw innerHTML and ElementRef tricks.', L16c],
      ['Avoiding unsafe HTML', 'Never call bypassSecurityTrust* on user input; sanitize on a trusted library if needed.', L16c],
      ['HTTPS', 'Encrypts traffic so tokens cannot be read or altered in transit.', L16d],
      ['CORS configuration', 'Server-side rules for which browser origins may call the API.', L16d],
      ['Secure environment configuration', 'No secrets in the bundle; only public configuration ships to the browser.', L16d],
      ['Dependency vulnerability scanning', 'npm audit and automated scanners find vulnerable packages.', L16d],
      ['Authentication error handling', 'Handle 401, 403, expired tokens and failed logins gracefully.', L16b],
      ['Secure logout', 'Clear in-memory state, revoke refresh tokens, clear caches, redirect.', L16a],
      ['Open redirect prevention', 'Never redirect to an unvalidated returnUrl.', L16d],
      ['Protecting sensitive information', 'Do not log or store secrets, PII or tokens carelessly.', L16d],
      ['Angular security best practices', 'A condensed checklist for reviews.', L16d],
    ]),

    topic(
      'ngs-m16-auth-jwt-storage',
      L16a,
      [
        blk(`<h3>Who are you, and what may you do?</h3>
Think of a hotel. At reception you show your passport and get a key card: that is <b>authentication</b> (proving identity). The key card then opens only your room and the gym: that is <b>authorization</b> (permissions). Java developers know the same split in Spring Security: <code>AuthenticationManager</code> versus <code>hasRole()</code> rules.<br>
• <b>Login</b>: the user sends username and password over HTTPS, the server checks them and answers with a token or session cookie.<br>
• <b>Registration</b>: a form creates a new account; the server validates, hashes the password (BCrypt) and stores it. The browser never hashes for security; the server does.<br>
• <b>Logout</b>: the client forgets the session and the server invalidates it.`,
          `// auth.service.ts - a tiny login/register/logout service
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  user = signal<{ name: string; roles: string[] } | null>(null);   // null = logged out

  register(body: { name: string; email: string; password: string }) {
    return this.http.post('/api/auth/register', body);              // server hashes the password
  }
  login(email: string, password: string) {
    return this.http.post<{ accessToken: string; user: any }>('/api/auth/login', { email, password })
      .pipe(tap(res => this.user.set(res.user)));
  }
  logout() {
    this.http.post('/api/auth/logout', {}).subscribe();            // server invalidates refresh token
    this.user.set(null);
  }
}`,
        ),
        blk(`<h3>What is a JWT?</h3>
A <b>JWT</b> (JSON Web Token) is like a stamped ticket: anyone can read it, but only the issuer can produce a valid stamp. It has three Base64URL parts separated by dots: <b>header</b> (algorithm), <b>payload</b> (claims such as <code>sub</code>, <code>roles</code>, <code>exp</code>) and <b>signature</b>. Important: the payload is <b>encoded, not encrypted</b>, so never put secrets in it.`,
          `// What a decoded JWT looks like (payload part)
{
  "sub": "42",                 // subject = user id
  "roles": ["USER"],
  "iat": 1760000000,           // issued at
  "exp": 1760000900            // expires at (15 minutes later)
}`,
        ),
      ],
      [
        blk(`<h3>Access tokens, refresh tokens and where to store them</h3>
• An <b>access token</b> is short-lived (5-15 minutes) and sent on every API call as <code>Authorization: Bearer ...</code>. A leaked one is useful to an attacker only briefly.<br>
• A <b>refresh token</b> is long-lived and used only against one endpoint (<code>/auth/refresh</code>) to get a new access token. Good designs <b>rotate</b> it on every use and revoke the whole family if an old one is replayed.<br>
• <b>Token storage trade-offs</b>:<br>
&nbsp;&nbsp;- <b>localStorage/sessionStorage</b>: easy, survives reload, but readable by any script on the page, so a single XSS hole leaks the token.<br>
&nbsp;&nbsp;- <b>In-memory (a signal in a service)</b>: invisible to other scripts and lost on reload; pair it with a refresh cookie to silently get a new token at startup.<br>
&nbsp;&nbsp;- <b>HttpOnly + Secure + SameSite cookie</b>: JavaScript cannot read it (XSS cannot steal it), but you then need <b>CSRF</b> protection.<br>
• A common solid pattern: access token in memory, refresh token in an HttpOnly SameSite cookie scoped to the refresh path.`,
          `// auth.service.ts - access token in memory, refresh via HttpOnly cookie
private accessToken = signal<string | null>(null);
token = this.accessToken.asReadonly();

refresh() {
  // the browser attaches the HttpOnly refresh cookie automatically (withCredentials)
  return this.http.post<{ accessToken: string }>('/api/auth/refresh', {}, { withCredentials: true })
    .pipe(tap(r => this.accessToken.set(r.accessToken)));
}

// app.config.ts - try to restore the session before the app renders
provideAppInitializer(() => firstValueFrom(inject(AuthService).refresh().pipe(catchError(() => of(null)))))`,
        ),
        blk(`<h3>Secure logout</h3>
A <b>secure logout</b> does more than navigate to /login: (1) call the backend so it <b>revokes the refresh token</b> and clears the cookie, (2) clear the in-memory token and user signal, (3) clear any cached user data (state stores, HTTP caches, IndexedDB), (4) cancel in-flight requests, (5) redirect to the login page. On shared computers also consider a sync across tabs via the <code>storage</code> event or <code>BroadcastChannel</code>.`,
          `logout() {
  return this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(
    finalize(() => {
      this.accessToken.set(null);
      this.user.set(null);
      sessionStorage.clear();                       // anything we cached
      new BroadcastChannel('auth').postMessage('logout');   // log out other tabs
      inject(Router).navigateByUrl('/login');
    }),
  );
}`,
        ),
      ],
      [
        blk(`<h3>JWT internals and pitfalls</h3>
• The server validates the <b>signature</b> (HS256 shared secret, or RS256/ES256 with a public key) plus <code>exp</code>, <code>iss</code>, <code>aud</code>. Spring Boot's resource server does this for you. Reject <code>alg: none</code> and algorithm confusion.<br>
• The Angular app should <b>treat the token as opaque</b>. Decoding the payload for UI hints (name, roles) is fine, but never trust it for security: a user can edit their own copy.<br>
• JWTs cannot be revoked before <code>exp</code> unless you keep a deny list or short lifetimes; this is why access tokens are short and refresh tokens are server-tracked.<br>
• Handle <b>refresh races</b>: when several requests get 401 at once, queue them behind a single refresh call (see the interceptor lesson).<br>
• Do not put PII or secrets in the payload; tokens end up in logs, proxies and browser history if misplaced in URLs. Never send tokens in query strings.`,
        ),
        blk(`<h3>Session cookies versus JWT (Spring perspective)</h3>
Spring Security's classic <code>JSESSIONID</code> session is a server-side session with an HttpOnly cookie: simple, instantly revocable, but needs sticky sessions or a shared store (Redis) when scaled. JWT is stateless, scales horizontally and suits mobile and microservices, but is harder to revoke. For a browser-only Angular + Spring app, a cookie-based session or BFF (backend for frontend) pattern is often <b>safer</b> than putting JWTs in JavaScript-reachable storage. Choose consciously, not by fashion.`,
        ),
      ],
      [
        ['What is the difference between authentication and authorization?', 'Authentication verifies who the caller is (login, token validation). Authorization decides what that identity may do (roles, permissions). A 401 means not authenticated; a 403 means authenticated but not allowed.'],
        ['What are the three parts of a JWT and is it encrypted?', 'Header, payload and signature, Base64URL-encoded and joined by dots. A normal JWT (JWS) is signed, not encrypted: anyone can read the payload, so it must hold no secrets. The signature only guarantees integrity.'],
        ['Why use both access and refresh tokens?', 'The short-lived access token limits damage if stolen. The refresh token lets the user stay logged in without re-entering credentials; it is stored more safely, used only at one endpoint, and can be rotated and revoked server-side.'],
        ['Where should an Angular app store tokens?', 'localStorage is simple but exposed to XSS. A better approach is keeping the access token in memory and the refresh token in an HttpOnly, Secure, SameSite cookie (which then needs CSRF defense). There is no free lunch; the right choice depends on threat model.'],
        ['What should happen on logout?', 'Revoke the refresh token on the server, clear the in-memory token, user state and caches, notify other tabs, cancel pending requests and redirect to login.'],
      ],
    ),

    topic(
      'ngs-m16-interceptors-guards-rbac',
      L16b,
      [
        blk(`<h3>Doorman, bouncer and the real vault</h3>
Imagine a bank. The <b>interceptor</b> is the clerk who stamps every request slip with your ID. A <b>route guard</b> is the sign on a door saying "Staff only": it saves honest people from wandering in. But the <b>backend authorization</b> is the vault itself, which checks your key every time.<br><br>
<b>Important note: route guards are not a substitute for backend authorization.</b> Anyone can open DevTools, edit JavaScript or call your API with curl. The Spring Boot APIs must enforce permissions independently on every endpoint (<code>@PreAuthorize</code>, <code>hasRole</code>). Guards and hidden buttons only improve user experience.`,
          `// auth.guard.ts - functional guard (Angular 15+)
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // not logged in? send to login, remember where they wanted to go
  return auth.user() ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// app.routes.ts
{ path: 'orders', canActivate: [authGuard], loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent) }`,
        ),
      ],
      [
        blk(`<h3>Authentication interceptor with 401 handling</h3>
A <b>functional HTTP interceptor</b> attaches the token to API calls only (never to third-party URLs) and handles <code>401</code> by refreshing once and retrying. A <b>shared refresh observable</b> prevents a stampede of refresh calls.`,
          `// auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!req.url.startsWith('/api/') || req.url.includes('/auth/')) return next(req);   // only our API

  const withToken = (token: string | null) =>
    token ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req;

  return next(withToken(auth.token())).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);
      // refresh once (AuthService shares the in-flight refresh), then retry the original request
      return auth.refresh().pipe(
        switchMap(r => next(withToken(r.accessToken))),
        catchError(e => { auth.logoutLocal(); return throwError(() => e); }),
      );
    }),
  );
};

// app.config.ts
provideHttpClient(withInterceptors([authInterceptor]))`,
        ),
        blk(`<h3>Role-based access control and permission-based UI</h3>
<b>RBAC</b> maps users to roles (ADMIN, MANAGER, USER). <b>Permission-based UI</b> is finer: the backend returns permissions like <code>order:delete</code> and the UI shows controls accordingly. Use a role guard factory for routes and a small helper for templates. Again: this only hides things; Spring must still return 403.`,
          `// role.guard.ts - guard factory
export const hasRole = (...roles: string[]): CanActivateFn => () => {
  const user = inject(AuthService).user();
  return !!user && roles.some(r => user.roles.includes(r)) ? true : inject(Router).createUrlTree(['/forbidden']);
};
// route: { path: 'admin', canActivate: [authGuard, hasRole('ADMIN')], loadChildren: () => import('./admin/admin.routes') }`,
          `// auth.service.ts
can = (permission: string) => computed(() => this.user()?.permissions.includes(permission) ?? false);

// order-list.component.html
@if (auth.can('order:delete')()) {
  <button (click)="remove(o)">Delete</button>   <!-- UX only; DELETE /api/orders/1 is still checked by Spring -->
}`,
          `// Spring Boot side (the real enforcement)
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/api/orders/{id}")
public void delete(@PathVariable Long id) { service.delete(id); }`,
        ),
      ],
      [
        blk(`<h3>Guards, sessions and error handling in depth</h3>
• Use <code>canMatch</code> for role-based lazy routes so unauthorized users do not even download the chunk, and <code>canActivateChild</code> to protect a whole subtree. Guards can return <code>boolean | UrlTree | Observable | Promise</code>; prefer returning a <b>UrlTree</b> over calling <code>router.navigate</code> inside the guard.<br>
• <b>Authentication error handling</b>: map <code>401</code> to refresh-or-login, <code>403</code> to a "not allowed" page (do not log the user out), <code>400/422</code> to form messages, network errors to a retry banner. Show generic login errors ("Invalid email or password") to avoid account enumeration.<br>
• <b>Secure session management</b>: set an absolute lifetime and an idle timeout, rotate the session id/refresh token after login and privilege changes, use cookies with <code>HttpOnly; Secure; SameSite=Lax/Strict</code>, and offer "log out everywhere". Re-check the session when the tab regains focus.<br>
• Do not read roles from a stale token: if permissions change, force a refresh or fetch <code>/me</code>.<br>
• Test guards as plain functions inside <code>TestBed.runInInjectionContext</code>.`,
        ),
        blk(`<h3>Backend authorization checklist (Spring Boot)</h3>
Every endpoint: authenticate (resource server validates JWT), authorize by role <b>and</b> by ownership (an ordinary user must not read <code>/orders/99</code> that belongs to someone else: this is the classic <b>IDOR/BOLA</b> bug), validate inputs, and return 401/403 correctly. Treat the Angular app as an untrusted client always.`,
        ),
      ],
      [
        ['Why are route guards not enough for security?', 'Guards run in the browser, which the user controls. They can be bypassed by editing code or calling the API directly. Only server-side authorization (Spring Security rules) is trustworthy; guards just improve UX.'],
        ['How do you attach a JWT to requests in modern Angular?', 'With a functional interceptor registered via provideHttpClient(withInterceptors([...])). It clones the request with an Authorization: Bearer header for your own API URLs only.'],
        ['How do you avoid multiple refresh calls when several requests return 401?', 'Share one in-flight refresh observable (shareReplay or a subject/lock). Other requests wait for it, then retry with the new token. If refresh fails, log out once.'],
        ['What is the difference between 401 and 403 and how should the UI react?', '401: not authenticated or token expired, try refresh then login. 403: authenticated but forbidden, show a no-access message without logging out.'],
        ['What is canMatch and why use it for roles?', 'canMatch decides whether a route definition matches at all, so with lazy loading the code chunk is not even fetched for unauthorized users, and another route with the same path can match instead.'],
        ['What is IDOR and how does it relate to frontend checks?', 'Insecure direct object reference: a user changes an id in the URL to access another user data. Only the backend ownership check prevents it; hiding links in Angular does not.'],
      ],
    ),

    topic(
      'ngs-m16-xss-csrf-csp-sanitization',
      L16c,
      [
        blk(`<h3>Attacks in plain language</h3>
• <b>Cross-Site Scripting (XSS)</b>: an attacker gets their JavaScript to run on your page (for example inside a comment you display). It then runs with the user's powers: reads data, calls APIs, steals tokens in localStorage.<br>
• <b>Cross-Site Request Forgery (CSRF)</b>: the attacker's site tricks your browser into sending a request to your bank; because the browser attaches your <b>cookies automatically</b>, the bank thinks it was you. CSRF only matters when authentication relies on cookies, not on a manually attached Bearer header.<br>
• <b>Content Security Policy (CSP)</b>: a response header that tells the browser "only run scripts from these sources", a safety net that limits XSS damage.<br>
Good news: Angular treats every value in a template as <b>untrusted</b> and escapes it for you. Trouble starts only when you bypass that.`,
          `<!-- Safe: Angular escapes this; script tags show as text -->
<p>{{ comment.text }}</p>
<div [innerHTML]="comment.html"></div>   <!-- sanitized: script and event handlers are removed -->`,
        ),
      ],
      [
        blk(`<h3>Angular template security and sanitization</h3>
Angular defines security contexts: <b>HTML</b>, <b>Style</b>, <b>URL</b> and <b>Resource URL</b>. For each binding it picks the right treatment: interpolation is HTML-escaped; <code>[innerHTML]</code> goes through the built-in <b>sanitizer</b> that removes <code>&lt;script&gt;</code>, inline event handlers and <code>javascript:</code> URLs; unsafe URLs get a <code>unsafe:</code> prefix; resource URLs (iframe src, script src) are blocked unless trusted. In dev mode you see a console warning when something is removed.<br>
• <b>Safe DOM manipulation</b>: prefer template bindings. If you must touch the DOM use <code>Renderer2</code>, <code>setProperty</code> or <code>textContent</code>, not <code>elementRef.nativeElement.innerHTML = ...</code> (this skips sanitization entirely).<br>
• <b>Avoiding unsafe HTML</b>: the <code>bypassSecurityTrustHtml/Script/Style/Url/ResourceUrl</code> methods on <code>DomSanitizer</code> switch protection off. Use them only on content you fully control, never on user input, and review each usage like a security bug.`,
          `// DANGEROUS: do not do this with user data
constructor(private s: DomSanitizer) {}
bad = this.s.bypassSecurityTrustHtml(userComment);          // XSS if userComment contains <img onerror=...>

// Better: let Angular sanitize, or pre-sanitize rich text with a vetted library (e.g. DOMPurify)
safe = DOMPurify.sanitize(markdownToHtml(userComment));     // then bind with [innerHTML]; still sanitized by Angular

// Safe DOM updates
renderer.setProperty(el.nativeElement, 'textContent', userText);   // never innerHTML with user text`,
        ),
        blk(`<h3>CSRF with Angular and Spring</h3>
If you use <b>cookie-based</b> authentication, protect state-changing requests. Spring Security's <code>CookieCsrfTokenRepository.withHttpOnlyFalse()</code> sets an <code>XSRF-TOKEN</code> cookie. Angular's HttpClient automatically copies it into the <code>X-XSRF-TOKEN</code> header for mutating requests to the <b>same origin</b>. Add <code>SameSite=Lax/Strict</code> cookies as a second layer. If you use a Bearer token from JavaScript memory, classic CSRF does not apply (but XSS does).`,
          `// app.config.ts
provideHttpClient(withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }))   // defaults; for cross-origin APIs add the header manually`,
          `// SecurityConfig.java
http.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()));`,
        ),
      ],
      [
        blk(`<h3>Content Security Policy for Angular</h3>
A strict CSP reduces XSS impact. Angular specifics: inline styles added by components historically needed <code>style-src 'unsafe-inline'</code>; use a <b>nonce</b> instead: set <code>ngCspNonce</code> attribute on the root element (or provide the <code>CSP_NONCE</code> token) so Angular adds the nonce to styles it injects. Avoid <code>'unsafe-eval'</code> (AOT compiled apps do not need it; JIT does). Newer Angular (v19+) supports hash-based strict CSP for inline scripts via the build option. Roll out with <code>Content-Security-Policy-Report-Only</code> first.`,
          `# Example header set by Nginx or Spring (one line)
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-RANDOM'; style-src 'self' 'nonce-RANDOM'; img-src 'self' data:; connect-src 'self' https://api.example.com; frame-ancestors 'none'; base-uri 'self'

<!-- index.html (server injects a fresh nonce per response) -->
<app-root ngCspNonce="RANDOM"></app-root>`,
        ),
        blk(`<h3>Pitfalls</h3>
• Angular's protection covers templates, <b>not</b> your own <code>document.write</code>, <code>eval</code>, <code>new Function</code>, third-party widgets, or server-rendered HTML you inject elsewhere.<br>
• Never build templates from user strings at runtime (template injection); never use JIT with user input.<br>
• Sanitizing on the server (Java: OWASP Java HTML Sanitizer) plus encoding on output is defense in depth. Sanitization of <code>[innerHTML]</code> strips <code>style</code> and some attributes: expect that rich text may lose formatting.<br>
• XSS makes tokens in localStorage worthless as a secret, which is why storage choice and CSP belong together.<br>
• SSR note: transferred state serialization is escaped by Angular; do not put unescaped user data into hand-written <code>&lt;script&gt;</code> blocks in server templates.`,
        ),
      ],
      [
        ['How does Angular protect against XSS by default?', 'It treats all template values as untrusted: interpolation is HTML-escaped and property bindings are sanitized according to their security context (HTML, Style, URL, ResourceURL). Dangerous content like script tags and javascript: URLs is removed.'],
        ['What is bypassSecurityTrustHtml and when is it dangerous?', 'A DomSanitizer method that marks a string as trusted so Angular skips sanitization. If the string contains user-controlled content it creates an XSS vulnerability. Use only for static or fully trusted content.'],
        ['When do you need CSRF protection in Angular?', 'When authentication uses cookies the browser sends automatically. Use SameSite cookies plus the double-submit XSRF-TOKEN cookie/X-XSRF-TOKEN header pattern that HttpClient supports. Bearer-in-header schemes are not vulnerable to classic CSRF.'],
        ['What does a Content Security Policy do?', 'It tells the browser which sources of scripts, styles, images and connections are allowed, blocking injected inline scripts and unknown origins. It limits the damage of XSS but does not replace output encoding.'],
        ['Why is using nativeElement.innerHTML risky?', 'It writes directly to the DOM and bypasses Angular sanitization. Use bindings, Renderer2 or textContent instead.'],
      ],
    ),

    topic(
      'ngs-m16-transport-config-best-practices',
      L16d,
      [
        blk(`<h3>Locks on the doors and windows</h3>
• <b>HTTPS</b> encrypts traffic between browser and server like a sealed envelope; without it, Wi-Fi snoopers can read passwords and tokens. Always serve both app and API over HTTPS and redirect HTTP to HTTPS; enable <b>HSTS</b>.<br>
• <b>CORS configuration</b>: browsers block a page from <code>http://localhost:4200</code> calling an API on another origin unless the API replies with the right <code>Access-Control-Allow-*</code> headers. CORS is configured on the <b>server</b> (Spring), never fixed in Angular.<br>
• <b>Protecting sensitive information</b>: do not put passwords, API secrets or personal data where others can see them: URLs, logs, console, localStorage, or the JavaScript bundle.`,
          `// Spring Boot: allow only your Angular origin
@Bean
CorsConfigurationSource cors() {
  var c = new CorsConfiguration();
  c.setAllowedOrigins(List.of("https://app.example.com"));   // never "*" together with credentials
  c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
  c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
  c.setAllowCredentials(true);
  var src = new UrlBasedCorsConfigurationSource();
  src.registerCorsConfiguration("/api/**", c);
  return src;
}`,
        ),
      ],
      [
        blk(`<h3>Secure environment configuration, redirects and dependencies</h3>
• <b>Secure environment configuration</b>: everything in <code>environment.ts</code> or a served <code>config.json</code> is <b>public</b>. Put only API base URLs, public client ids and feature flags there. Real secrets (database passwords, private keys, client secrets) live on the server (Spring config, environment variables, a vault). Use runtime configuration so one build deploys to many environments.<br>
• <b>Open redirect prevention</b>: after login, a <code>returnUrl</code> query parameter is convenient but dangerous: <code>/login?returnUrl=https://evil.com</code> would send a user to a phishing site. Only allow <b>internal, relative</b> paths.<br>
• <b>Dependency vulnerability scanning</b>: run <code>npm audit</code> in CI, use Dependabot or Renovate, lock versions with <code>package-lock.json</code>, use <code>npm ci</code>, and update Angular regularly for security patches. Beware of typosquatted packages and install scripts.`,
          `// safe-redirect.ts
export function safeReturnUrl(url: string | null): string {
  // allow only same-site absolute paths like /orders?id=1, reject //evil.com, http://..., javascript:
  return url && url.startsWith('/') && !url.startsWith('//') && !url.includes(':') ? url : '/home';
}
// after login: router.navigateByUrl(safeReturnUrl(route.snapshot.queryParamMap.get('returnUrl')));`,
          `# CI step
npm ci
npm audit --audit-level=high      # fail the build on high/critical issues
npm outdated`,
        ),
      ],
      [
        blk(`<h3>Angular security best practices checklist</h3>
<b>1.</b> Never trust the client: authorize on the backend. <b>2.</b> Keep Angular and dependencies up to date. <b>3.</b> Do not use <code>bypassSecurityTrust*</code> with dynamic data. <b>4.</b> Avoid direct DOM access and <code>innerHTML</code>. <b>5.</b> Serve over HTTPS with HSTS and a strict CSP. <b>6.</b> Prefer HttpOnly cookies or in-memory tokens over localStorage for long-lived credentials. <b>7.</b> Configure CORS narrowly; no wildcard with credentials. <b>8.</b> No secrets in bundles or source maps in public production (or restrict source maps). <b>9.</b> Do not log tokens, passwords or personal data; scrub error reports. <b>10.</b> Use AOT production builds; never ship JIT. <b>11.</b> Validate redirects and file uploads (type, size) on the server. <b>12.</b> Add security headers: <code>X-Content-Type-Options</code>, <code>Referrer-Policy</code>, <code>frame-ancestors</code> (clickjacking), <code>Permissions-Policy</code>. <b>13.</b> Run SAST/dependency scans and periodic penetration tests, including OWASP Top 10 checks against the Spring API.`,
        ),
        blk(`<h3>Subtleties worth knowing</h3>
• CORS is not security against non-browser clients; it only instructs browsers. A preflight (<code>OPTIONS</code>) is sent for custom headers such as <code>Authorization</code>; cache it with <code>Access-Control-Max-Age</code>.<br>
• During development, use the Angular dev-server <b>proxy</b> (<code>proxy.conf.json</code>) to avoid CORS locally, but configure real CORS or a same-origin reverse proxy (Nginx) in production. Same-origin deployment also simplifies cookies and CSRF.<br>
• Environment files are compiled in; prefer a runtime <code>/assets/config.json</code> loaded by <code>provideAppInitializer</code> for per-environment values.<br>
• Error messages shown to users should be generic; log details server-side with a correlation id.`,
        ),
      ],
      [
        ['What is CORS and where do you fix a CORS error?', 'Cross-Origin Resource Sharing is a browser mechanism that blocks cross-origin calls unless the server allows the origin through response headers. You fix it on the server (Spring CORS config) or by serving app and API from one origin, not in Angular code.'],
        ['Can you hide an API key in an Angular environment file?', 'No. Everything shipped to the browser is readable. Secrets must stay on the server; the frontend calls your backend, which uses the secret.'],
        ['What is an open redirect and how do you prevent it in a login flow?', 'Redirecting to an attacker-supplied URL after login. Only accept relative internal paths for returnUrl (or an allow-list) and reject absolute or protocol-relative URLs.'],
        ['How do you keep dependencies secure?', 'Lock files and npm ci, npm audit/Dependabot in CI, regular Angular upgrades, review new packages, and avoid abandoned libraries.'],
        ['Why use HTTPS and HSTS?', 'HTTPS provides confidentiality and integrity in transit; HSTS tells browsers to always use HTTPS for the domain, preventing downgrade and SSL-strip attacks. Secure cookies require HTTPS.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 17
const L17a = 'Rendering and change detection';
const L17b = 'Dynamic components, DI and reactive abstractions';
const L17c = 'Routing, errors, interceptors and libraries';
const L17d = 'Monorepos, microfrontends and real-time channels';
const L17e = 'Internationalization, accessibility and architecture';

const module17: SubTopic = {
  id: 'ngs-mod-17',
  name: 'Module 17 · Advanced Angular',
  topics: [
    overview(17, 'Advanced Angular', [
      ['Angular rendering architecture', 'Templates compile (AOT) to instructions that create and update the DOM (Ivy).', L17a],
      ['Change detection', 'How Angular finds out what changed and refreshes the view.', L17a],
      ['Default change detection', 'Checks every component on each trigger.', L17a],
      ['OnPush change detection', 'Checks a component only on input change, event, signal or markForCheck.', L17a],
      ['Zone-based change detection', 'Zone.js patches async APIs and triggers checks automatically.', L17a],
      ['Zoneless Angular', 'No Zone.js; notifications come from signals, events and markForCheck.', L17a],
      ['Signals and change detection', 'Signals tell Angular exactly which views to refresh.', L17a],
      ['ChangeDetectorRef', 'Handle to a component view for manual control.', L17a],
      ['markForCheck()', 'Marks this view and ancestors dirty for the next check.', L17a],
      ['detectChanges()', 'Runs a check on this view subtree immediately.', L17a],
      ['Dynamic component rendering', 'Create components at runtime with ViewContainerRef or ngComponentOutlet.', L17b],
      ['ComponentRef', 'Handle to a dynamically created component instance.', L17b],
      ['ViewContainerRef', 'A slot in the DOM where views and components are inserted.', L17b],
      ['Content projection', 'Pass template content into a component (ng-content, ngTemplateOutlet).', L17b],
      ['Custom decorators', 'TypeScript functions that annotate classes or members, with caution.', L17b],
      ['Custom providers', 'useClass, useValue, useFactory, useExisting, multi.', L17b],
      ['Advanced Dependency Injection', 'Hierarchical injectors, tokens, resolution modifiers.', L17b],
      ['Injection context', 'Where inject() is allowed to run.', L17b],
      ['Custom reactive abstractions', 'Your own reusable signal/RxJS helpers.', L17b],
      ['RxJS interoperability', 'toSignal, toObservable, rxResource and takeUntilDestroyed.', L17b],
      ['Dynamic forms architecture', 'Build forms from metadata/config.', L17c],
      ['Advanced routing', 'Nested layouts, auxiliary routes, matchers, resolvers, guards.', L17c],
      ['Route-level state', 'Router state, route data, route-scoped providers.', L17c],
      ['Error handling architecture', 'Layers: local, HTTP, global, reporting.', L17c],
      ['Global error handlers', 'Custom ErrorHandler to log all uncaught errors.', L17c],
      ['Advanced HTTP interceptors', 'Chains for auth, retry, caching, loading, errors.', L17c],
      ['Reusable component libraries', 'Components shared across apps.', L17c],
      ['Angular libraries', 'ng generate library and ng-packagr packaging.', L17c],
      ['Public API design', 'Expose a small stable surface via public-api.ts.', L17c],
      ['Monorepo fundamentals', 'Many apps and libs in one repository.', L17d],
      ['Angular workspace management', 'angular.json projects, path mapping, Nx.', L17d],
      ['Microfrontend architecture', 'Independently deployed frontend pieces (Module Federation).', L17d],
      ['Web Workers', 'Run heavy CPU work off the main thread.', L17d],
      ['WebSockets', 'Full-duplex persistent connection.', L17d],
      ['Server-Sent Events', 'One-way server-to-client event stream over HTTP.', L17d],
      ['Internationalization', 'Designing the app so it can support many languages (i18n).', L17e],
      ['Localization', 'Providing the translations and formats for one locale (l10n).', L17e],
      ['Accessibility', 'Usable by everyone, including keyboard and screen-reader users.', L17e],
      ['Design systems', 'Shared tokens, components and rules.', L17e],
      ['Angular architecture best practices', 'Boundaries, smart/dumb split, strict typing, consistency.', L17e],
    ]),

    topic(
      'ngs-m17-rendering-change-detection',
      L17a,
      [
        blk(`<h3>How does the screen stay in sync?</h3>
Think of a whiteboard in a classroom. <b>Change detection</b> is the teacher walking the room to compare the whiteboard with the real data and rewriting whatever is different. The <b>rendering architecture</b> (Ivy) compiles each template ahead of time (AOT) into small instructions: a <i>creation</i> pass builds the DOM once and an <i>update</i> pass later refreshes only the bindings that changed.<br>
• <b>Default change detection</b>: after every trigger (click, timer, HTTP response) Angular checks <b>every</b> component from the root down. Simple and safe, but wasteful in big apps.<br>
• <b>OnPush change detection</b>: a component is checked only when an input reference changes, an event fires in it, a signal it reads changes, or it is marked dirty. Think "wake the teacher only when something relevant happens".`,
          `// product-card.component.ts
@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,     // check me only when needed
  template: '<h3>{{ product().name }}</h3> <p>{{ product().price | currency }}</p>',
})
export class ProductCardComponent {
  product = input.required<{ name: string; price: number }>();
}`,
        ),
      ],
      [
        blk(`<h3>Zone.js, zoneless and signals</h3>
• <b>Zone-based change detection</b>: Zone.js monkey-patches browser async APIs (events, timers, promises, XHR). When an async task finishes, <code>NgZone</code> emits <code>onMicrotaskEmpty</code> and Angular runs a check. It works with zero effort but runs checks even when nothing changed.<br>
• <b>Zoneless Angular</b>: remove Zone.js and let Angular be told when to check. Triggers: signal changes read in templates, template event listeners, <code>markForCheck()</code>, <code>AsyncPipe</code>, and component creation/removal. Enabled with <code>provideZonelessChangeDetection()</code> (developer preview in v18-19, <b>stable in v20.2</b>; names and status are version dependent). Smaller bundles, better stack traces, faster.<br>
• <b>Signals and change detection</b>: a template that reads a signal registers it as a dependency; when it changes, Angular marks exactly that view for refresh. Signals make OnPush behaviour automatic and are the foundation for zoneless.`,
          `// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),        // v20+ stable name; remove zone.js from polyfills in angular.json
    provideRouter(routes),
    provideHttpClient(),
  ],
};

// counter.component.ts - works with or without zone.js because the view reads a signal
@Component({ selector: 'app-counter', template: '<button (click)="n.update(v => v + 1)">{{ n() }}</button>' })
export class CounterComponent { n = signal(0); }`,
        ),
        blk(`<h3>Manual control: ChangeDetectorRef</h3>
Inject <code>ChangeDetectorRef</code> for manual control. <b>markForCheck()</b> marks the component and its ancestors dirty so the next normal pass refreshes it (use when OnPush state changed outside Angular's knowledge, e.g. a plain callback). <b>detectChanges()</b> runs the check <b>right now</b> on this view and its children (use sparingly, e.g. after dynamically creating views or in tests). <code>detach()</code>/<code>reattach()</code> remove a view from the tree for high-frequency widgets.`,
          `export class TickerComponent {
  private cdr = inject(ChangeDetectorRef);
  price = 0;                                           // plain field, not a signal

  constructor() {
    legacyFeed.onTick((p: number) => {                 // third-party callback
      this.price = p;
      this.cdr.markForCheck();                         // OnPush: ask for refresh on next pass
    });
  }
}`,
        ),
      ],
      [
        blk(`<h3>Internals and pitfalls</h3>
• A check is a depth-first walk of component views; per binding Angular compares old and new value with <code>Object.is</code> and updates the DOM only on difference. In dev mode a second pass throws <b>ExpressionChangedAfterItHasBeenChecked</b> (NG0100) if a value changed during the check: do not mutate parent state from a child's hook or getter.<br>
• OnPush with <b>mutated objects</b> fails silently: the input reference does not change. Use immutable updates or signals.<br>
• In zone apps run noisy work outside Angular with <code>NgZone.runOutsideAngular()</code> (scroll, mousemove, canvas loops) and re-enter only to update state. Libraries that rely on zone patching need care in zoneless apps.<br>
• Zoneless migration checklist: switch components to OnPush, convert state to signals, replace <code>setTimeout</code>-driven updates, use <code>afterNextRender</code>/<code>afterEveryRender</code> for DOM work, test with <code>provideZonelessChangeDetection()</code> in TestBed.<br>
• The signal graph uses reactive contexts: a <b>reactive consumer</b> per template; <code>computed</code> is lazy and memoised. Signal-based inputs plus OnPush give the best default today. Experimental or preview status of zoneless varies by version, so check release notes.`,
        ),
        blk(`<h3>Choosing a strategy</h3>
New code: standalone, OnPush (v20 style guides default to it), signals for state, zoneless if all dependencies allow. Keep Default only for legacy components until migrated. Debug with Angular DevTools profiler to see which components are checked and why.`,
        ),
      ],
      [
        ['What is the difference between Default and OnPush change detection?', 'Default checks the component on every cycle triggered anywhere. OnPush checks only when an input reference changes, an event originates in the component or its children, an async pipe/signal it reads emits, or it is marked via markForCheck.'],
        ['What does Zone.js do and what changes with zoneless Angular?', 'Zone.js patches async APIs so Angular knows when to run change detection. Zoneless removes it; Angular is notified by signals, template events, markForCheck, AsyncPipe and similar. Result: smaller bundle, fewer redundant checks.'],
        ['markForCheck vs detectChanges?', 'markForCheck schedules the view and its ancestors to be checked in the next cycle. detectChanges runs a check synchronously on that view subtree immediately and can cause performance or recursion issues if overused.'],
        ['Why does an OnPush component not update after I mutate an array?', 'The input reference did not change, so OnPush sees nothing new. Create a new array/object (immutable update) or use signals.'],
        ['What causes ExpressionChangedAfterItHasBeenChecked?', 'A binding value changed between the check and the dev-mode verification pass, typically because a child or lifecycle hook modified parent state. Fix by moving the logic earlier, using signals/computed, or restructuring.'],
        ['How do signals improve change detection?', 'Templates track which signals they read, so Angular refreshes only affected views, works naturally with OnPush and enables zoneless operation.'],
      ],
    ),

    topic(
      'ngs-m17-dynamic-di-reactive',
      L17b,
      [
        blk(`<h3>Building UI at runtime</h3>
Normally the template decides which components appear. Sometimes you only know at runtime (a dashboard with user-chosen widgets, a modal service). <b>Dynamic component rendering</b> creates them in code. A <b>ViewContainerRef</b> is a "parking spot" in the DOM where you can insert components, and the <b>ComponentRef</b> is the "remote control" returned: it gives access to the instance, lets you set inputs and destroy it.<br>
<b>Content projection</b> is the opposite direction: the parent hands pieces of markup to the child with <code>&lt;ng-content&gt;</code> (like slots in a card or dialog).`,
          `// widget-host.component.ts
@Component({
  selector: 'app-widget-host',
  template: '<ng-container #slot></ng-container>',
})
export class WidgetHostComponent {
  slot = viewChild.required('slot', { read: ViewContainerRef });

  show(type: Type<unknown>) {
    this.slot().clear();
    const ref: ComponentRef<any> = this.slot().createComponent(type);   // create at runtime
    ref.setInput('title', 'Sales');                                      // safe way to set an input
    // ref.destroy() removes it later
  }
}`,
        ),
      ],
      [
        blk(`<h3>Providers, injection context and advanced DI</h3>
• <b>Custom providers</b> tell the injector how to build a dependency: <code>useClass</code> (swap implementation), <code>useValue</code> (constant/config), <code>useFactory</code> (build with logic and <code>deps</code>/<code>inject()</code>), <code>useExisting</code> (alias), <code>multi: true</code> (collect many, e.g. validators or interceptors).<br>
• <b>Advanced Dependency Injection</b>: injectors form a hierarchy (element injector -> environment injector -> root -> platform). Use resolution modifiers via <code>inject(Token, { optional: true, self: true, skipSelf: true, host: true })</code>. Scope services at route level (<code>providers</code> in a route) or component level to get one instance per feature/instance.<br>
• <b>Injection context</b>: <code>inject()</code> works only while Angular is constructing something: constructor, field initialisers, a provider factory, a functional guard/interceptor/resolver, or inside <code>runInInjectionContext</code>. Calling it later in a click handler throws NG0203. Save the injector (<code>inject(Injector)</code>) and use <code>runInInjectionContext</code> or <code>assertInInjectionContext</code> in helpers.`,
          `// logger.ts
export const LOG_LEVEL = new InjectionToken<string>('LOG_LEVEL', { providedIn: 'root', factory: () => 'info' });
export abstract class Logger { abstract log(m: string): void; }

// app.config.ts
providers: [
  { provide: Logger, useFactory: () => environment.production ? new RemoteLogger(inject(HttpClient)) : new ConsoleLogger() },
  { provide: HTTP_INTERCEPTORS, useClass: LegacyInterceptor, multi: true },          // legacy class interceptor style
  { provide: LOG_LEVEL, useValue: 'warn' },
]

// helper that needs an injection context
export function injectRouteId(): Signal<string | null> {
  assertInInjectionContext(injectRouteId);
  const route = inject(ActivatedRoute);
  return toSignal(route.paramMap.pipe(map(p => p.get('id'))), { initialValue: null });
}`,
        ),
        blk(`<h3>Content projection and custom decorators</h3>
Use multi-slot projection with <code>select</code>, and <code>ngTemplateOutlet</code> when the parent supplies a template with context. <b>Custom decorators</b> are TypeScript functions (<code>@Memoize()</code>, <code>@Log()</code>). Note that Angular's own decorators are compiled specially; custom member/class decorators use the standard (or experimental, depending on <code>experimentalDecorators</code>) TypeScript proposal, are not understood by AOT metadata, and cannot add DI or template behaviour. In modern Angular prefer <b>functions, directives, host directives and DI tokens</b> over custom decorators.`,
          `<!-- card.component.html -->
<header><ng-content select="[card-title]" /></header>
<section><ng-content /></section>
<ng-container *ngTemplateOutlet="footerTpl() ?? defaultFooter; context: { $implicit: data() }" />
<ng-template #defaultFooter>Default footer</ng-template>`,
          `// log.decorator.ts - a plain method decorator (TS experimentalDecorators style)
export function Log(): MethodDecorator {
  return (target, key, desc: PropertyDescriptor) => {
    const original = desc.value;
    desc.value = function (...args: unknown[]) {
      console.log('call', String(key), args);          // runs before the real method
      return original.apply(this, args);
    };
  };
}`,
        ),
      ],
      [
        blk(`<h3>Custom reactive abstractions and RxJS interoperability</h3>
Wrap recurring reactive patterns into <b>custom reactive abstractions</b>: small functions that return signals or observables and use <code>inject()</code> internally (like React hooks, but with injection context rules). Interop bridges the two worlds: <code>toSignal(obs$, { initialValue })</code> subscribes and unsubscribes with the injection context; <code>toObservable(signal)</code> emits via an effect (so values are coalesced, not synchronous); <code>takeUntilDestroyed()</code> auto-completes streams; <code>rxResource</code>/<code>httpResource</code> (v19+, experimental in 19-20) turn request streams into signal state. Keep Observables for events, cancellation and time; signals for state.`,
          `// injectDebounced.ts - a custom reactive abstraction
export function injectDebounced<T>(source: Signal<T>, ms = 300): Signal<T> {
  assertInInjectionContext(injectDebounced);
  return toSignal(toObservable(source).pipe(debounceTime(ms)), { initialValue: source() });
}

// usage in a component
query = signal('');
debouncedQuery = injectDebounced(this.query, 250);
results = toSignal(
  toObservable(this.debouncedQuery).pipe(switchMap(q => this.api.search(q))),
  { initialValue: [] },
);`,
        ),
        blk(`<h3>Pitfalls</h3>
• <code>toSignal</code> throws if the observable errors and read; handle with <code>catchError</code> or <code>rejectErrors</code>. Without <code>initialValue</code> the type includes <code>undefined</code> (or use <code>requireSync</code> for BehaviorSubject-like sources).<br>
• Do not call <code>toSignal</code> inside effects or event handlers repeatedly (it creates subscriptions); create it once in a field.<br>
• Prefer <code>ComponentRef.setInput()</code> over assigning properties, so OnPush and signal inputs update. Always destroy dynamic refs you create manually; inputs of <code>ngComponentOutlet</code> accept an <code>ngComponentOutletInputs</code> object.<br>
• Provider scope bugs ("my service is not a singleton") usually mean a component-level or route-level provider created a second instance.`,
        ),
      ],
      [
        ['How do you create a component dynamically?', 'Get a ViewContainerRef (viewChild with read: ViewContainerRef), call createComponent(Type), set inputs with ref.setInput, and destroy via ref.destroy() or container.clear(). The declarative alternative is *ngComponentOutlet.'],
        ['Explain useClass, useValue, useFactory, useExisting and multi.', 'useClass substitutes a class, useValue gives a constant, useFactory runs a function (often with inject()), useExisting aliases another token, and multi:true collects several providers of the same token into an array.'],
        ['What is an injection context and why does inject() fail outside it?', 'It is the synchronous time window when Angular is instantiating something (constructor, field initialisers, factories, functional guards). inject() needs the current injector; outside it throws NG0203. Use runInInjectionContext with a saved Injector.'],
        ['toSignal vs the async pipe?', 'Both subscribe and clean up automatically. toSignal gives a signal usable in computed/effect and TypeScript code, the async pipe is template-only. toSignal needs an initial value or requireSync.'],
        ['Why avoid custom decorators in modern Angular?', 'They are outside Angular compiler knowledge, depend on TS decorator mode, hide behaviour and cannot participate in AOT or DI. Functions, directives and host directives are more transparent and tree-shakable.'],
      ],
    ),

    topic(
      'ngs-m17-routing-errors-libraries',
      L17c,
      [
        blk(`<h3>Growing a real application</h3>
Bigger applications need patterns beyond components: forms that come from configuration (<b>dynamic forms architecture</b>), layouts nested through <b>advanced routing</b>, one place that deals with failure (<b>error handling architecture</b>), and shared code packaged as <b>Angular libraries</b> with a clear <b>public API</b>. Picture a company: the router is the building map, the error handler is the reception that receives all complaints, and a library is a department that offers services through a front desk (the public API), not through its back rooms.`,
          `// a form described as data (dynamic forms)
export interface FieldConfig { key: string; label: string; type: 'text' | 'number' | 'select'; required?: boolean; options?: string[]; }
const fields: FieldConfig[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'city', label: 'City', type: 'select', options: ['Pune', 'Delhi'] },
];`,
        ),
      ],
      [
        blk(`<h3>Dynamic forms and advanced routing</h3>
<b>Dynamic forms architecture</b>: keep a typed metadata model, build the <code>FormGroup</code> from it, render fields by <code>@switch</code> on type (or through a registry mapping type to component with <code>ngComponentOutlet</code>), and let validators be named in metadata. The backend (Spring) can even deliver the schema.<br>
<b>Advanced routing</b>: layout routes with child outlets, <b>auxiliary (named) outlets</b>, custom <code>UrlMatcher</code>, resolvers, <code>withComponentInputBinding()</code> to bind params to inputs, view transitions with <code>withViewTransitions()</code>, and route-level code splitting. <b>Route-level state</b>: route params, query params, <code>data</code>, resolved data, and <b>route-scoped providers</b> (a service instance that lives as long as that route subtree is active).`,
          `// dynamic-form.component.ts
form = computed(() => this.fb.group(
  Object.fromEntries(this.fields().map(f => [f.key, ['', f.required ? Validators.required : []]])),
));

// app.routes.ts
export const routes: Routes = [
  {
    path: 'projects/:id',
    providers: [ProjectStore],                    // route-level state: new store per project route tree
    resolve: { project: (r: ActivatedRouteSnapshot) => inject(ProjectApi).get(r.paramMap.get('id')!) },
    loadComponent: () => import('./project-shell').then(m => m.ProjectShellComponent),
    children: [{ path: 'board', loadComponent: () => import('./board').then(m => m.BoardComponent) }],
  },
];
// main: provideRouter(routes, withComponentInputBinding())   -> project = input<Project>() receives resolver data`,
        ),
        blk(`<h3>Error handling layers and global handler</h3>
Layer your <b>error handling architecture</b>: (1) local handling where the user can act (form errors, retry button), (2) <b>HTTP interceptor</b> for cross-cutting status mapping (401, 403, 5xx, network), (3) router errors (<code>withNavigationErrorHandler</code>), (4) a <b>global error handler</b> for everything uncaught, (5) reporting to Sentry/ELK with a correlation id. Implement <code>ErrorHandler</code> and register it with <code>provideBrowserGlobalErrorListeners()</code> (v20) or <code>{ provide: ErrorHandler, useClass: ... }</code>.`,
          `// global-error-handler.ts
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  handleError(error: unknown): void {
    console.error(error);
    this.http.post('/api/client-errors', { message: String(error), url: location.href }).subscribe({ error: () => {} });
    this.toast.show('Something went wrong. We are looking into it.');       // generic message to users
  }
}
// app.config.ts: { provide: ErrorHandler, useClass: GlobalErrorHandler }`,
        ),
      ],
      [
        blk(`<h3>Advanced interceptors and libraries</h3>
<b>Advanced HTTP interceptors</b> compose in order: request goes through the array first-to-last, response comes back last-to-first. Typical stack: <code>correlationId -> auth -> loading -> cache -> retry(backoff) -> error mapping</code>. Use <code>HttpContextToken</code> to pass per-request flags (skip loading, skip auth, cache TTL). Keep interceptors pure and single purpose; avoid circular DI (an interceptor injecting a service that injects HttpClient: use <code>inject(Injector)</code> lazily).<br>
<b>Reusable component libraries / Angular libraries</b>: <code>ng generate library ui-kit</code> creates a project built with <b>ng-packagr</b> into partial-Ivy output (APF format). Use standalone components with <code>ChangeDetectionStrategy.OnPush</code>, theme with CSS custom properties, avoid depending on app services, document with Storybook, version with semver and changelog.<br>
<b>Public API design</b>: export only what consumers need in <code>public-api.ts</code> (components, tokens, <code>provideXxx()</code> functions, types); keep internals unexported (secondary entry points for big libs); prefer <code>provideUiKit(config)</code> functions and <code>InjectionToken</code> configuration; deprecate before removing; breaking changes follow major versions. Think of it as a Java module's exported packages.`,
          `// ui-kit/src/public-api.ts
export * from './lib/button/button.component';
export * from './lib/dialog/dialog.service';
export { provideUiKit, UI_KIT_CONFIG, type UiKitConfig } from './lib/config';
// NOT exported: lib/internal/*

// http-context usage
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);
this.http.get('/api/ping', { context: new HttpContext().set(SKIP_LOADING, true) });

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_LOADING)) return next(req);
  const loader = inject(LoadingService);
  loader.start();
  return next(req).pipe(finalize(() => loader.stop()));
};`,
        ),
        blk(`<h3>Pitfalls</h3>
• A global handler must never throw and should avoid loops (reporting failing triggers reporting). Zone/async errors in zoneless apps still reach <code>ErrorHandler</code> for framework-run callbacks, but plain <code>setTimeout</code> errors need <code>provideBrowserGlobalErrorListeners</code> (v20) or window listeners.<br>
• Do not catch an error in an interceptor and return <code>EMPTY</code> silently: callers hang waiting for a value.<br>
• Library peerDependencies: Angular packages are peers, not dependencies, or you ship duplicate copies and break DI.`,
        ),
      ],
      [
        ['How would you design dynamic forms?', 'Describe fields in typed metadata (possibly from the backend), build FormGroup/FormArray from it, render with @switch or a component registry, map named validators, and keep submission typed. Keep layout separate from the schema.'],
        ['Where should global error handling live?', 'A layered approach: local UI handling, an HTTP interceptor for status mapping, router navigation error handler, and a custom ErrorHandler for uncaught errors with logging/reporting and a generic user message.'],
        ['In which order do interceptors run?', 'In array order for requests and in reverse order for responses, like servlet filters. Order matters, e.g. auth before retry, error mapping last.'],
        ['What belongs in a library public API?', 'Only stable, documented components, services, tokens, provide functions and types exported from public-api.ts. Internals stay private so they can change without breaking consumers.'],
        ['What are route-level providers useful for?', 'They scope a service instance to a route subtree, creating fresh state per navigation context instead of a root singleton, and enable lazy loading of the service code.'],
      ],
    ),

    topic(
      'ngs-m17-monorepo-microfrontends-realtime',
      L17d,
      [
        blk(`<h3>One repo, many apps, live data</h3>
A <b>monorepo</b> keeps several apps and libraries in one Git repository, like one building with many offices sharing a canteen. <b>Angular workspace management</b>: one <code>angular.json</code> lists <i>projects</i> (applications and libraries); shared libraries are imported through <b>path mapping</b> in <code>tsconfig.json</code> (<code>@shop/ui</code>). Tools like <b>Nx</b> add caching and dependency-graph rules.<br>
Browsers can also do background and live work: <b>Web Workers</b> (heavy calculation off the UI thread), <b>WebSockets</b> (two-way live channel, chat) and <b>Server-Sent Events</b> (one-way live feed from the server, notifications).`,
          `# create a workspace without a default app, then add projects
ng new shop --create-application=false
cd shop
ng generate application storefront
ng generate application admin
ng generate library ui-kit

// tsconfig.json
"paths": { "@shop/ui-kit": ["projects/ui-kit/src/public-api.ts"] }`,
        ),
      ],
      [
        blk(`<h3>Web Workers, WebSockets and SSE</h3>
<b>Web Worker</b>: <code>ng generate web-worker heavy</code> creates a worker file and the tsconfig. Messages are copied (structured clone) or transferred; the worker has no DOM.<br>
<b>WebSocket</b>: use RxJS <code>webSocket()</code> for a typed stream with reconnect logic (<code>retry</code> with delay). Spring: <code>WebSocketHandler</code> or STOMP over SockJS.<br>
<b>Server-Sent Events</b>: browser <code>EventSource</code> gives automatic reconnects and works over plain HTTP/2; wrap it in an Observable. Spring: <code>SseEmitter</code> or <code>Flux&lt;ServerSentEvent&gt;</code>. SSE cannot set custom headers (so no Bearer header): use cookies or short-lived tickets in the URL.`,
          `// heavy.worker.ts
addEventListener('message', ({ data }) => {
  let sum = 0;
  for (let i = 0; i < data.n; i++) sum += i;       // heavy loop off the main thread
  postMessage(sum);
});

// component
const worker = new Worker(new URL('./heavy.worker', import.meta.url), { type: 'module' });
worker.onmessage = ({ data }) => this.result.set(data);   // signal update; works zoneless too
worker.postMessage({ n: 1_000_000_000 });`,
          `// sse.service.ts - EventSource as an Observable
events$ = new Observable<MessageEvent>(sub => {
  const es = new EventSource('/api/notifications/stream');
  es.onmessage = e => sub.next(e);
  es.onerror = e => sub.error(e);
  return () => es.close();                           // teardown on unsubscribe
});

// ws.service.ts
socket$ = webSocket<{ type: string; body: string }>('wss://app.example.com/ws/chat');
// this.socket$.subscribe(msg => ...); this.socket$.next({ type: 'chat', body: 'hi' });`,
        ),
      ],
      [
        blk(`<h3>Microfrontends and monorepo pitfalls</h3>
<b>Microfrontend architecture</b> splits a large UI into independently built and deployed apps (per team/domain). In Angular the common route is <b>Module Federation</b> (Webpack, or Native Federation with esbuild via <code>@angular-architects/native-federation</code>): a shell loads remotes at runtime (<code>loadRemoteModule</code>) and shares singleton libraries (Angular, RxJS) with version ranges. Alternatives: iframes, Web Components (Angular Elements), or server-side composition.<br>
Trade-offs: much higher complexity (shared dependency versions, consistent design system, routing contracts, auth sharing, E2E testing, observability) in exchange for team autonomy. Do not adopt microfrontends for a small team; a well-structured monorepo with libraries and enforced boundaries (Nx <code>enforce-module-boundaries</code>, ESLint rules) usually suffices.<br>
Monorepo advice: keep libs layered (feature, ui, data-access, util), forbid circular imports, use affected-only builds in CI and caching, keep one version of Angular for the whole repo.`,
        ),
        blk(`<h3>Real-time channel advice</h3>
• Run worker messaging and socket callbacks so that state lands in signals (zoneless-safe). In zone apps, high-frequency sockets can flood change detection: use <code>runOutsideAngular</code> and batch/throttle updates (<code>bufferTime</code>, <code>auditTime</code>).<br>
• WebSocket needs heartbeat/ping, reconnect with exponential backoff, resubscribe after reconnect and authentication on connect. SSE reconnects itself and supports <code>Last-Event-ID</code> for resume. Choose SSE for one-way streams (simpler, proxy friendly), WebSocket for bidirectional or binary.<br>
• Terminate workers (<code>worker.terminate()</code>) and close sockets in <code>DestroyRef.onDestroy</code>. Angular CLI bundles workers separately.`,
        ),
      ],
      [
        ['What is a monorepo and what are its benefits in Angular?', 'One repository containing multiple applications and libraries. Benefits: shared code via libs, atomic changes across projects, unified tooling and versioning; with Nx or the CLI you also get caching and affected builds.'],
        ['When would you choose microfrontends?', 'When many independent teams must deploy parts of one product separately. They bring operational complexity (shared deps, consistency, testing), so avoid them for small teams; start with modular monorepo libraries.'],
        ['WebSocket vs Server-Sent Events?', 'WebSocket is a bidirectional full-duplex protocol; SSE is one-way server to client over HTTP with built-in reconnect and event ids. SSE is simpler for notifications; WebSocket for chat, games, binary data.'],
        ['Why use a Web Worker in Angular?', 'To run CPU-heavy tasks without blocking the main thread (parsing big files, crypto, sorting large data). Workers cannot access the DOM and communicate through messages.'],
        ['How does the Angular CLI help with workspaces?', 'It manages multiple projects in angular.json, generates apps and libraries, and builds each with ng build <project>. Path mapping lets apps import libraries by alias.'],
      ],
    ),

    topic(
      'ngs-m17-i18n-a11y-architecture',
      L17e,
      [
        blk(`<h3>Software for everyone</h3>
• <b>Internationalization (i18n)</b> means designing the app so it <i>can</i> work in many languages (no hard-coded text, flexible layouts). <b>Localization (l10n)</b> is the work of providing a specific language and format (Marathi, German, dates, currency).<br>
• <b>Accessibility (a11y)</b> means people using keyboards, screen readers or magnifiers can use the app: semantic HTML, labels, contrast, focus visibility.<br>
• A <b>design system</b> is a shared set of colours, spacing, components and rules so every screen looks and behaves consistently.`,
          `<!-- built-in Angular i18n: mark text with the i18n attribute -->
<h1 i18n="@@homeTitle">Welcome to our shop</h1>
<p i18n="user greeting|Shown after login@@greet">Hello, {{ name }}!</p>
<button type="button" aria-label="Close dialog" i18n-aria-label>X</button>`,
        ),
      ],
      [
        blk(`<h3>i18n workflow and accessibility basics</h3>
Angular's compile-time i18n: add <code>@angular/localize</code>, mark text with <code>i18n</code>, run <code>ng extract-i18n</code> to produce XLF/XLIFF, translate it, configure locales in <code>angular.json</code> and build one bundle per locale (fast at runtime, but one deployment per language). Runtime libraries such as <b>Transloco</b> or <b>ngx-translate</b> switch language without rebuilding. Use ICU expressions for plurals, and locale-aware pipes (<code>date</code>, <code>currency</code>, <code>number</code>) with <code>LOCALE_ID</code>.<br>
Accessibility basics: use real <code>button</code>/<code>a</code>/<code>label</code> elements, <code>alt</code> text, a logical heading order, visible focus, sufficient contrast, <code>aria-live</code> for dynamic status messages, and <code>@angular/cdk/a11y</code> (<code>LiveAnnouncer</code>, <code>FocusTrap</code>, <code>cdkTrapFocus</code>).`,
          `<!-- ICU plural + select -->
<span i18n>You have {count, plural, =0 {no messages} =1 {one message} other {{{count}} messages}}</span>`,
          `# commands
ng add @angular/localize
ng extract-i18n --output-path src/locale
# angular.json: "i18n": { "sourceLocale": "en-US", "locales": { "mr": "src/locale/messages.mr.xlf" } }
ng build --localize`,
        ),
      ],
      [
        blk(`<h3>Architecture best practices</h3>
• <b>Structure</b>: feature folders, lazy-loaded feature routes, thin <code>core</code> (singletons, interceptors) and <code>shared</code> (dumb UI), enforce boundaries with lint rules.<br>
• <b>Smart/presentational split</b>: containers fetch and hold state, presentational components take <code>input()</code>/<code>output()</code> and are OnPush and pure.<br>
• <b>State</b>: signals in services for most apps, NgRx Signal Store or Store only when complexity warrants.<br>
• <b>Types</b>: <code>strict: true</code>, strict templates, typed forms, DTO interfaces mirroring Spring DTOs (consider generating clients from OpenAPI).<br>
• <b>Performance defaults</b>: OnPush/zoneless readiness, <code>track</code> in <code>@for</code>, lazy routes, <code>@defer</code>.<br>
• <b>Quality</b>: ESLint, Prettier, tests per layer, CI gates, performance budgets, Architecture Decision Records.<br>
• <b>i18n/a11y/design-system</b> as first-class concerns from day one: retrofitting translations or accessibility is costly. Design tokens as CSS custom properties; wrap Material or CDK in your own components so you can replace libraries.`,
        ),
        blk(`<h3>Gotchas</h3>
• Compile-time i18n bakes text at build time, so server routing must pick the locale (path <code>/mr/</code>) and each locale is a separate build; runtime i18n lets users switch instantly but costs a translations download. Pick before the project grows.<br>
• Do not concatenate translated strings; word order differs between languages. Always use ICU/parameters.<br>
• Right-to-left languages need logical CSS properties (<code>margin-inline-start</code>).<br>
• Automated a11y tools (axe, Lighthouse) catch only about a third of issues; add keyboard-only and screen-reader manual passes.`,
        ),
      ],
      [
        ['Difference between internationalization and localization?', 'i18n is engineering the app to support multiple locales (externalized text, flexible layout, locale-aware formatting). l10n is adapting it for a specific locale: translations, formats, cultural conventions.'],
        ['Compile-time i18n vs runtime libraries like Transloco?', 'Angular built-in i18n produces one optimized build per locale, requires redeployment per language and no runtime lookup. Runtime libraries load translation files dynamically so the language can switch live, at the cost of a lookup and extra requests.'],
        ['How do you make an Angular component accessible?', 'Use semantic elements, labels and alt text, ensure keyboard operation and focus management, adequate contrast, ARIA only when native elements cannot express semantics, live regions for updates, and test with axe and a screen reader.'],
        ['What is a design system and how does it appear in Angular code?', 'A shared collection of tokens, components and guidelines. In Angular it is typically a library of standalone OnPush components styled with CSS custom properties, documented in Storybook, versioned and consumed by all apps.'],
        ['Name some Angular architecture best practices.', 'Feature-based lazy modules/routes, smart vs presentational components, immutable state/signals, strict typing, enforced boundaries, interceptors for cross-cutting concerns, OnPush, tests and CI quality gates.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 18
const L18a = 'Rendering and change detection performance';
const L18b = 'Bundles, lazy loading, @defer and images';
const L18c = 'Lists, tables, data and network performance';
const L18d = 'Measuring: Lighthouse, Web Vitals, profiling and budgets';

const module18: SubTopic = {
  id: 'ngs-mod-18',
  name: 'Module 18 · Angular Performance Optimization',
  topics: [
    overview(18, 'Angular Performance Optimization', [
      ['Understanding rendering performance', 'Where time goes: JS, style, layout, paint, change detection.', L18a],
      ['Change detection optimization', 'Do less checking: fewer components, fewer bindings, cheap expressions.', L18a],
      ['OnPush strategy', 'Skip components whose inputs did not change.', L18a],
      ['Signals-based optimization', 'Fine-grained updates and memoised computed values.', L18a],
      ['Avoiding unnecessary computations', 'No heavy work in templates or getters.', L18a],
      ['Memoization', 'Cache results of pure functions (computed, pure pipes).', L18a],
      ['AsyncPipe', 'Auto-subscribe/unsubscribe in templates.', L18a],
      ['Subscription optimization', 'Fewer, shorter-lived subscriptions; share and complete.', L18a],
      ['Lazy loading', 'Load code only when needed.', L18b],
      ['Route-level code splitting', 'Each lazy route becomes its own chunk.', L18b],
      ['Tree shaking', 'Unused exports are removed from the bundle.', L18b],
      ['Bundle size analysis', 'source-map-explorer, esbuild stats, webpack-bundle-analyzer.', L18b],
      ['Production builds', 'AOT, minification, optimization, hashing.', L18b],
      ['Image optimization', 'NgOptimizedImage, sizes, lazy loading, modern formats.', L18b],
      ['Deferrable views with @defer', 'Lazy load parts of a template with triggers.', L18b],
      ['Preloading strategies', 'Fetch lazy chunks in the background.', L18b],
      ['Performance budgets', 'Build fails when bundles exceed limits.', L18d],
      ['List rendering optimization', 'Render only what is needed and keep DOM small.', L18c],
      ['Tracking items in @for', 'track gives each row identity so DOM is reused.', L18c],
      ['HTTP caching', 'Cache headers, ETag, interceptor cache.', L18c],
      ['Reducing duplicate API requests', 'shareReplay, request dedupe, resource().', L18c],
      ['Virtual scrolling', 'CDK renders only visible rows.', L18c],
      ['Large table optimization', 'Pagination, virtualization, OnPush rows, server-side paging.', L18c],
      ['Web Workers', 'Move heavy computation off the main thread.', L18c],
      ['Network performance', 'HTTP/2, compression, CDN, preconnect, caching.', L18c],
      ['Lighthouse performance analysis', 'Automated audit of speed and best practices.', L18d],
      ['Core Web Vitals', 'LCP, INP and CLS user-centric metrics.', L18d],
      ['Memory leak detection', 'Find retained objects with heap snapshots.', L18d],
      ['Browser profiling', 'Performance tab, Angular DevTools profiler.', L18d],
      ['Performance testing', 'Repeatable load/lab tests in CI.', L18d],
    ]),

    topic(
      'ngs-m18-rendering-cd-performance',
      L18a,
      [
        blk(`<h3>Where does the time go?</h3>
<b>Understanding rendering performance</b>: a page update is a pipeline: JavaScript runs, the browser recalculates styles, computes layout, paints and composites. Angular adds its own work, <b>change detection</b>. A slow app is usually doing too much of one of these: too many DOM nodes, too many checks, or heavy JavaScript. Think of a restaurant kitchen: the fix is not a faster waiter but cooking less unnecessary food.<br>
Quick wins: <b>OnPush</b> on components, <code>track</code> in lists, keep template expressions cheap, and let the <b>AsyncPipe</b> handle subscriptions.`,
          `<!-- BAD: function call runs on every change detection -->
<p>{{ calculateTotal(items) }}</p>

<!-- GOOD: computed signal runs only when items() changes -->
<p>{{ total() }}</p>`,
        ),
      ],
      [
        blk(`<h3>Change detection optimization with OnPush, signals and memoization</h3>
• <b>OnPush strategy</b> + immutable inputs lets Angular skip whole subtrees. Combine with signal inputs: the component re-renders only when the signal values it reads change.<br>
• <b>Signals-based optimization</b>: <code>computed()</code> caches the value until a dependency changes (<b>memoization</b> for free). Prefer it to getters or methods in templates. Use <code>equal</code> option for custom equality on object signals.<br>
• <b>Avoiding unnecessary computations</b>: no sorting, filtering, regex or JSON work inside bindings; move to computed/pure pipes; debounce frequent events (<code>debounceTime</code>, <code>auditTime</code>); run scroll/mousemove handlers outside the zone.<br>
• <b>Pure pipes</b> are memoized by input reference; custom functions can be memoized by a small cache (last-arguments).`,
          `export class OrdersComponent {
  orders = input.required<Order[]>();
  filter = signal('');
  sortAsc = signal(true);

  // recalculated only when orders, filter or sortAsc change - cached otherwise
  visible = computed(() => {
    const f = this.filter().toLowerCase();
    const list = this.orders().filter(o => o.customer.toLowerCase().includes(f));
    return list.sort((a, b) => (this.sortAsc() ? 1 : -1) * a.total - b.total);   // copy first in real code!
  });
}

// simple memoize helper for non-signal code
export function memoizeLast<A, R>(fn: (a: A) => R): (a: A) => R {
  let lastArg: A, lastResult: R, has = false;
  return (a: A) => (has && a === lastArg ? lastResult : ((has = true), (lastArg = a), (lastResult = fn(a))));
}`,
        ),
        blk(`<h3>AsyncPipe and subscription optimization</h3>
The <b>AsyncPipe</b> subscribes on view creation, marks the view for check on emission and unsubscribes on destroy: no leaks. Use one <code>@if (data$ | async; as data)</code> per stream, not many pipes on the same observable (each creates a separate subscription and HTTP call unless shared). <b>Subscription optimization</b>: share expensive streams with <code>shareReplay({ bufferSize: 1, refCount: true })</code>, use <code>take(1)</code>/<code>first()</code> for one-shot reads, <code>takeUntilDestroyed()</code> for manual subscriptions, switch to <code>toSignal</code>, and avoid nested subscribes (use <code>switchMap</code>).`,
          `// BAD: two subscriptions -> two HTTP calls
<h1>{{ (user$ | async)?.name }}</h1>
<p>{{ (user$ | async)?.email }}</p>

// GOOD
@if (user$ | async; as user) {
  <h1>{{ user.name }}</h1>
  <p>{{ user.email }}</p>
}`,
        ),
      ],
      [
        blk(`<h3>Deeper insights</h3>
• Profile before optimising. Use Angular DevTools (Profiler tab) to see which components were checked and how long they took; look for components checked on every mouse move because of a global listener.<br>
• Methods in templates are not always evil (a trivial getter is fine) but an expensive call multiplied by hundreds of rows with Default CD is a classic slowdown.<br>
• Signals avoid the per-view dirty walk: with signal inputs and OnPush the framework refreshes only views that read the changed signal. In zoneless mode, accidental global checks disappear.<br>
• <code>effect()</code> is not a performance tool and can cascade; keep side effects minimal and never derive state in effects.<br>
• Large object graphs in signals are compared by reference (<code>Object.is</code>); create new references for changes or define <code>equal</code>. Mutating arrays in place with <code>mutate</code> no longer exists (removed); use <code>update()</code> with copies.<br>
• Prefer <code>@if/@for</code> control flow (built in, faster than <code>*ngIf/*ngFor</code>, no directive overhead) in v17+.`,
        ),
        blk(`<h3>Rendering cost checklist</h3>
Fewer DOM nodes (virtualize, paginate, <code>@defer</code>), avoid layout thrashing (read layout then write, never alternate), use CSS <code>transform</code>/<code>opacity</code> for animation (compositor-only), <code>content-visibility: auto</code> for off-screen sections, avoid forced reflow in <code>ngAfterViewChecked</code>, and keep <code>ngDoCheck</code> hooks cheap.`,
        ),
      ],
      [
        ['Why is calling a method in a template potentially slow?', 'With Default change detection the method runs on every check, even if inputs did not change. Expensive methods multiplied across rows degrade performance. Use computed signals, pure pipes or precomputed fields.'],
        ['How does OnPush plus signals reduce work?', 'OnPush skips views unless input references change, events occur or signals read in the template update. Signals identify exactly which views depend on changed state, so unrelated components are not checked.'],
        ['AsyncPipe benefits and a common mistake?', 'Auto subscribe/unsubscribe and marks for check. The mistake is applying it several times to one cold observable, causing multiple subscriptions/HTTP calls; unwrap once with @if ... as, or share the stream.'],
        ['What is memoization and where does Angular give it to you?', 'Caching a function result for given inputs. computed() signals and pure pipes memoize automatically; others use custom caches or shareReplay for observables.'],
        ['How do you find the cause of slow rendering?', 'Use Angular DevTools profiler and the browser Performance tab, locate long tasks and repeated change detection, then fix with OnPush, track, virtualization or moving work off the main thread.'],
      ],
    ),

    topic(
      'ngs-m18-bundles-lazy-defer-images',
      L18b,
      [
        blk(`<h3>Ship less code, ship it later</h3>
The smaller the JavaScript the browser must download and run, the faster the first screen. Think of packing for a trip: carry only what you need now.<br>
• <b>Lazy loading</b> and <b>route-level code splitting</b>: each lazy route (<code>loadComponent</code>/<code>loadChildren</code>) becomes a separate file downloaded when the user visits it.<br>
• <b>Tree shaking</b>: the build removes code nobody imports. Import from specific packages, not whole barrels, and prefer ES modules.<br>
• <b>Production builds</b>: <code>ng build</code> uses production configuration by default (AOT, minification, dead-code elimination, hashed file names, no source maps in output).`,
          `// app.routes.ts
export const routes: Routes = [
  { path: '', component: HomeComponent },                                         // in the main bundle
  { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },
];`,
        ),
      ],
      [
        blk(`<h3>@defer, preloading and bundle analysis</h3>
<b>Deferrable views with @defer</b> split part of a template (and the components it uses, which must be standalone) into a lazy chunk with triggers: <code>on viewport</code>, <code>on idle</code> (default), <code>on interaction</code>, <code>on hover</code>, <code>on timer(2s)</code>, <code>on immediate</code> or <code>when condition</code>. Add <code>@placeholder</code>, <code>@loading</code> (with minimum time to avoid flicker), <code>@error</code>, and <code>prefetch on ...</code>.<br>
<b>Preloading strategies</b>: <code>withPreloading(PreloadAllModules)</code> fetches all lazy chunks after the app is stable; a custom strategy can preload only routes flagged <code>data: { preload: true }</code> or based on network quality (see below).<br>
<b>Bundle size analysis</b>: <code>ng build --stats-json</code> then upload to the esbuild bundle analyzer or <code>webpack-bundle-analyzer</code>; or <code>npx source-map-explorer dist/**/*.js</code>. Look for moment.js, whole lodash, unused icon sets, duplicated libraries.`,
          `<!-- report-page.component.html -->
@defer (on viewport; prefetch on idle) {
  <app-heavy-chart [data]="data()" />
} @placeholder (minimum 300ms) {
  <div class="chart-skeleton"></div>
} @loading (after 100ms; minimum 500ms) {
  <app-spinner />
} @error {
  <p>Could not load the chart.</p>
}`,
          `// custom-preload.ts
@Injectable({ providedIn: 'root' })
export class FlagPreload implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>) {
    return route.data?.['preload'] ? load() : of(null);   // only flagged routes
  }
}
// provideRouter(routes, withPreloading(FlagPreload))`,
        ),
        blk(`<h3>Image optimization and performance budgets</h3>
Use <code>NgOptimizedImage</code> (<code>ngSrc</code>): it requires width/height (prevents layout shift), lazy-loads by default, supports <code>priority</code> for the LCP image (adds preload and <code>fetchpriority=high</code>), and generates <code>srcset</code> with a loader (Cloudinary, Imgix, custom). Serve WebP/AVIF, correct sizes, and use a CDN.<br>
<b>Performance budgets</b> in <code>angular.json</code> make the build warn or fail when bundles grow.`,
          `<img ngSrc="assets/hero.jpg" width="1200" height="600" priority alt="Campus" sizes="(max-width: 600px) 100vw, 1200px">
<img ngSrc="assets/photo.jpg" width="400" height="300" alt="Student">   <!-- lazy by default -->`,
          `// angular.json (production configuration)
"budgets": [
  { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
  { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
]`,
        ),
      ],
      [
        blk(`<h3>Internals and trade-offs</h3>
• The new application builder (esbuild + Vite, default since v17) produces ESM with automatic code splitting, faster builds and better tree shaking than the old Webpack <code>browser</code> builder. Use <code>--stats-json</code> to analyze it.<br>
• Tree shaking is defeated by side-effectful imports, <code>require</code>/CommonJS packages (Angular warns about them), huge barrel files and global registrations. Use <code>providedIn: 'root'</code> services (tree-shakable providers) and standalone APIs, import only needed Material components, and replace heavy libraries with lighter ones (<code>date-fns</code> instead of <code>moment</code>).<br>
• Too many tiny chunks hurt HTTP/1 but with HTTP/2 or HTTP/3 it is fine; do not preload everything on slow mobile networks (<code>navigator.connection.saveData</code>).<br>
• <code>@defer</code> dependencies must not be referenced eagerly elsewhere (component imported in <code>imports</code> and used outside the block is no longer deferred). Content in <code>@defer</code> is not in SSR output unless the trigger fires on the server, and with incremental hydration (v19+) <code>hydrate on ...</code> triggers apply.<br>
• Do not defer above-the-fold content: it worsens LCP.<br>
• Budgets should be tuned to your baseline and tightened gradually. Separate budgets for <code>initial</code>, <code>anyScript</code>, <code>anyComponentStyle</code>.`,
        ),
        blk(`<h3>Production-readiness checklist</h3>
AOT on, <code>optimization</code> on, <code>sourceMap: false</code> (or hidden source maps uploaded to the error tracker), compression (gzip/brotli) at the server, long-cache headers for hashed files and <code>no-cache</code> for <code>index.html</code>, fonts with <code>font-display: swap</code> (Angular can inline critical CSS and fonts), remove unused polyfills, and keep the third-party script count low.`,
        ),
      ],
      [
        ['What is lazy loading and how do you do it in Angular?', 'Loading code only when needed. Use loadComponent/loadChildren with dynamic import() in route definitions, or @defer in templates. Each becomes a separate chunk.'],
        ['What does @defer offer compared with route lazy loading?', 'It lazy loads parts of a page inside a template with triggers (viewport, idle, interaction, timer, condition), placeholders, loading and error blocks, and prefetching.'],
        ['How does tree shaking work and how can you help it?', 'The bundler drops unused ES module exports. Help it with ES modules, specific imports, tree-shakable providers, avoiding side effects and CommonJS libraries.'],
        ['How would you analyze a large bundle?', 'Build with --stats-json and open it in an analyzer (esbuild analyzer, webpack-bundle-analyzer) or use source-map-explorer, then replace or lazy load heavy dependencies.'],
        ['Why use NgOptimizedImage?', 'It enforces width and height, lazy loads, prioritizes the LCP image, generates srcset via loaders and warns about common mistakes, improving LCP and CLS.'],
        ['What are performance budgets?', 'Size limits configured in angular.json; the build warns or errors when bundles exceed them, preventing silent regressions.'],
      ],
    ),

    topic(
      'ngs-m18-lists-data-network',
      L18c,
      [
        blk(`<h3>Big lists and repeated requests</h3>
<b>List rendering optimization</b>: every row is DOM, and DOM is expensive. With <code>@for</code> you must write <b>track</b>: it tells Angular how to recognise an item (by id) so changed lists reuse existing DOM nodes instead of rebuilding them. It is like a teacher recognising students by name instead of re-seating the whole class every time one arrives.<br>
<b>Reducing duplicate API requests</b>: if five components ask for the same data, fetch once and share the result.`,
          `@for (p of products(); track p.id) {
  <app-product-row [product]="p" />
} @empty {
  <p>No products found.</p>
}
<!-- track $index only for static lists; track the whole object (identity) only if objects are stable -->`,
        ),
      ],
      [
        blk(`<h3>Virtual scrolling and large tables</h3>
<b>Virtual scrolling</b> (<code>@angular/cdk/scrolling</code>) renders only the rows visible in the viewport plus a small buffer, so 100,000 items cost the same as 20. <b>Large table optimization</b>: server-side pagination/sorting/filtering (Spring <code>Pageable</code>), virtual scroll for long client lists, OnPush row components, fixed row height, avoid per-cell pipes and functions, and debounce filter input.`,
          `<!-- orders.component.html -->
<cdk-virtual-scroll-viewport itemSize="48" class="viewport">
  <div *cdkVirtualFor="let o of orders(); trackBy: trackById" class="row">{{ o.id }} - {{ o.customer }}</div>
</cdk-virtual-scroll-viewport>`,
          `// orders.component.ts
imports: [ScrollingModule],      // from @angular/cdk/scrolling
trackById = (_: number, o: Order) => o.id;`,
        ),
        blk(`<h3>HTTP caching and request de-duplication</h3>
<b>HTTP caching</b> has three layers: the browser cache via <code>Cache-Control</code>/<code>ETag</code> headers from Spring, an Angular <b>caching interceptor</b> (Map by URL with TTL), and state in services/stores. Reduce duplicates with <code>shareReplay</code>, the <code>resource()</code>/<code>httpResource()</code> family (experimental in v19/v20), or a keyed in-flight map. Also enable <b>SSR transfer cache</b> (<code>withHttpTransferCacheOptions</code>) so the browser does not repeat server requests, and cancel superseded requests with <code>switchMap</code>.`,
          `// cache.interceptor.ts - GET cache with 60 s TTL, concurrent duplicates share one request
const cache = new Map<string, { at: number; res$: Observable<HttpEvent<unknown>> }>();
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || req.headers.has('x-no-cache')) return next(req);
  const hit = cache.get(req.urlWithParams);
  if (hit && Date.now() - hit.at < 60_000) return hit.res$;
  const res$ = next(req).pipe(shareReplay(1));       // later callers reuse the same response
  cache.set(req.urlWithParams, { at: Date.now(), res$ });
  return res$;
};`,
        ),
      ],
      [
        blk(`<h3>Workers, network and pitfalls</h3>
• <b>Web Workers</b> for CPU work: client-side CSV parsing, big sorts, image processing, crypto. Pass typed arrays by transfer (<code>postMessage(buf, [buf])</code>) to avoid copying. Do not use workers for tiny tasks: the messaging overhead dominates.<br>
• <b>Network performance</b>: enable HTTP/2 or HTTP/3 and brotli compression (Nginx), CDN for static files, <code>preconnect</code> to API/font origins, <code>fetchpriority</code>, avoid request waterfalls (parallel with <code>forkJoin</code>/<code>combineLatest</code>, resolvers vs lazy fetching), batch small calls, return only needed fields from Spring (DTO projections, pagination), and use ETag/304. Cache hashed assets for one year with <code>immutable</code>; never cache <code>index.html</code>.<br>
• A cache needs <b>invalidation</b>: clear on mutation (POST/PUT/DELETE) and logout. Never cache per-user data in a shared (CDN) cache; use <code>Cache-Control: private</code>.<br>
• <code>track $index</code> on a list that reorders or inserts defeats the purpose: rows are reused with wrong data and state. Always track a stable id.<br>
• Virtual scroll requires a known/uniform item size (autosize strategy is experimental) and a viewport with fixed height; it does not combine well with find-in-page or accessibility without extra work.`,
        ),
        blk(`<h3>Large dataset strategy</h3>
Prefer <b>server-side</b> work: page, sort and filter in the database (indexes). Client-side virtualization is for lists you truly must hold in memory. For huge tables combine: server paging, fixed-height rows, OnPush cells, and column virtualization only when necessary.`,
        ),
      ],
      [
        ['Why is track required in @for?', 'It provides identity for each item so Angular can move and reuse DOM nodes when the collection changes instead of recreating them. It is required for correctness and speed; track a unique id, not the index for dynamic lists.'],
        ['How does virtual scrolling work?', 'The CDK viewport renders only items in view plus a buffer, using a spacer for total height and recycling DOM nodes as you scroll. Cost depends on visible rows, not total rows.'],
        ['How do you avoid duplicate HTTP requests for the same data?', 'Share the observable (shareReplay), cache in a service or interceptor with TTL, use resource-style APIs or a store, and for SSR use the HTTP transfer cache.'],
        ['When should you use a Web Worker?', 'For CPU-bound work that blocks the UI (large parsing, sorting, calculation). Not for DOM work or tiny tasks.'],
        ['How would you display a table with one million records?', 'Do not load them. Use server-side pagination/sorting/filtering; if scrolling is needed use cursor-based pagination with virtual scrolling and keep rows lightweight.'],
      ],
    ),

    topic(
      'ngs-m18-measuring-vitals-profiling',
      L18d,
      [
        blk(`<h3>Measure first, then optimise</h3>
Guessing is the biggest performance mistake. Measure with real tools:<br>
• <b>Lighthouse performance analysis</b>: built into Chrome DevTools (Lighthouse tab) or <code>npx lighthouse</code>; it scores performance, accessibility, SEO and best practices and lists concrete fixes. Run it in an incognito window on a production build.<br>
• <b>Core Web Vitals</b> are Google's user-focused metrics: <b>LCP</b> (Largest Contentful Paint, how fast the main content appears, aim under 2.5 s), <b>INP</b> (Interaction to Next Paint, responsiveness, under 200 ms; replaced FID in 2024) and <b>CLS</b> (Cumulative Layout Shift, visual stability, under 0.1).<br>
• <b>Browser profiling</b>: the Performance tab records what the CPU did; long tasks over 50 ms are red flags.`,
          `# measure a production build locally
ng build
npx http-server dist/my-app/browser -p 8080 -g
npx lighthouse http://localhost:8080 --view`,
        ),
      ],
      [
        blk(`<h3>Profiling, memory leaks and tracking vitals in code</h3>
<b>Browser profiling</b>: record in the Performance panel, interact, stop, and look at the flame chart: scripting (JS), rendering, painting. <b>Angular DevTools</b> adds a profiler that shows change detection cycles and the components checked. Use <code>performance.mark/measure</code> for custom timings.<br>
<b>Memory leak detection</b>: symptoms are a heap that never shrinks after navigating away. Use the Memory tab: take a heap snapshot, navigate away and back several times, force GC, take another snapshot and compare; search for detached DOM nodes and retained component instances. Typical Angular leaks: unmanaged <code>subscribe()</code>, <code>setInterval</code>/event listeners not removed (<code>window.addEventListener</code>), RxJS subjects in singleton services holding component references, dynamic components not destroyed, and global caches growing without limits.<br>
Report real-user metrics with the <code>web-vitals</code> library.`,
          `// vitals.ts - send real user metrics to your backend
import { onLCP, onINP, onCLS } from 'web-vitals';
const send = (m: { name: string; value: number }) => navigator.sendBeacon('/api/metrics', JSON.stringify(m));
onLCP(send); onINP(send); onCLS(send);

// leak-safe subscription
constructor() {
  fromEvent(window, 'resize').pipe(takeUntilDestroyed()).subscribe(() => this.measure());
  const id = setInterval(() => this.poll(), 5000);
  inject(DestroyRef).onDestroy(() => clearInterval(id));
}`,
        ),
        blk(`<h3>Performance testing</h3>
<b>Performance testing</b> makes performance a regression-proof requirement: Lighthouse CI in the pipeline with assertions (score and metric thresholds), bundle <b>budgets</b> failing the build, Playwright traces for key flows, and load tests (k6, JMeter, Gatling) against the Spring Boot API. Compare against a baseline on the same hardware profile and network throttling.`,
          `# lighthouserc.json assertion (Lighthouse CI)
{ "ci": { "assert": { "assertions": {
  "categories:performance": ["error", { "minScore": 0.9 }],
  "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }]
} } } }`,
        ),
      ],
      [
        blk(`<h3>Interpreting results</h3>
• Lab data (Lighthouse) is synthetic and varies; <b>field data</b> (CrUX, RUM via web-vitals) is what Google ranks on. Optimise for the 75th percentile of real users on mid-range phones.<br>
• Typical Angular LCP fixes: SSR/prerender, <code>priority</code> on the hero image, preconnect, defer non-critical JS, avoid render-blocking CSS, trim initial bundle, avoid waterfall of API calls before first paint. INP fixes: break up long tasks, OnPush/signals, move work to workers, <code>scheduler.yield</code>/<code>setTimeout</code> chunking, avoid heavy handlers. CLS fixes: dimensions on images and embeds, reserve space for async content/skeletons, avoid injecting content above existing content.<br>
• Heap snapshot analysis: use the "Comparison" view and "Detached" filter; check retainers to learn which reference keeps the object alive.<br>
• Production profiling needs source maps (hidden) to read stack traces. Dev-mode numbers are misleading: Angular does extra checks in development.<br>
• Beware of measurement bias: Chrome extensions, dev mode, cache state and CPU throttling (use 4x slowdown to emulate mobile).`,
        ),
        blk(`<h3>Performance governance</h3>
Define a performance budget (bundle and Web Vitals), track it per pull request, keep a dashboard from RUM, and assign ownership. Fixing one big regression after release costs far more than a failing CI check.`,
        ),
      ],
      [
        ['What are the Core Web Vitals?', 'LCP (loading, under 2.5 s), INP (interactivity, under 200 ms) and CLS (visual stability, under 0.1). They are measured at the 75th percentile of real user visits.'],
        ['How do you find a memory leak in an Angular app?', 'Take heap snapshots before and after repeated navigation, compare for growing objects and detached DOM nodes, inspect retainers, then fix unmanaged subscriptions, timers, listeners or retained component references.'],
        ['What do you check first when Lighthouse reports poor LCP?', 'Identify the LCP element, then reduce bundle and render-blocking resources, prioritize and size the image (NgOptimizedImage priority), use SSR/prerender, and remove request waterfalls.'],
        ['How do you prevent performance regressions?', 'Budgets in angular.json, Lighthouse CI thresholds, bundle size checks in pull requests and RUM dashboards.'],
        ['Why not trust development-mode performance?', 'Dev mode includes extra checks, unminified code and no AOT optimizations. Always profile production builds, ideally with throttling.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 19
const L19a = 'CSR, SSR, SSG and prerendering';
const L19b = 'Hydration and server vs browser code';
const L19c = 'SEO and metadata';
const L19d = 'Server data, caching, security and deployment';

const module19: SubTopic = {
  id: 'ngs-mod-19',
  name: 'Module 19 · Server-Side Rendering and Modern Rendering',
  topics: [
    overview(19, 'Server-Side Rendering and Modern Rendering', [
      ['Client-Side Rendering (CSR)', 'Browser downloads JS and builds the page itself.', L19a],
      ['Server-Side Rendering (SSR)', 'Server renders HTML per request, browser then hydrates.', L19a],
      ['Static Site Generation (SSG)', 'HTML generated at build time for fixed pages.', L19a],
      ['Prerendering', 'Angular term for build-time rendering of routes (SSG).', L19a],
      ['Angular SSR setup', 'ng new --ssr or ng add @angular/ssr.', L19a],
      ['CSR vs SSR vs SSG selection', 'Decision guide by content type, SEO and freshness.', L19a],
      ['Hydration', 'Reuse server-rendered DOM instead of rebuilding it.', L19b],
      ['Incremental hydration', 'Hydrate @defer blocks lazily on triggers (v19+).', L19b],
      ['Server and browser execution differences', 'No DOM, window, storage on the server; one app instance per request.', L19b],
      ['Browser-only APIs', 'APIs that exist only in browsers and need guarding.', L19b],
      ['Handling window and document', 'Use DOCUMENT token, afterNextRender, isPlatformBrowser.', L19b],
      ['SEO fundamentals', 'Crawlable HTML, titles, links, speed, structured data.', L19c],
      ['Dynamic metadata', 'Set tags per route with Title and Meta services.', L19c],
      ['Page titles and descriptions', 'Unique title and meta description per page.', L19c],
      ['Canonical URLs', 'link rel=canonical to avoid duplicate content.', L19c],
      ['Open Graph metadata', 'og: tags for rich link previews.', L19c],
      ['Server-side data fetching', 'Fetch during SSR and transfer to the browser.', L19d],
      ['SSR caching', 'Cache rendered pages and API responses.', L19d],
      ['SSR security', 'Per-request isolation, no leaking secrets, SSRF, headers.', L19d],
      ['Deployment of SSR applications', 'Run a Node server (or edge/serverless) with a process manager and proxy.', L19d],
    ]),

    topic(
      'ngs-m19-csr-ssr-ssg',
      L19a,
      [
        blk(`<h3>Three ways to produce a page</h3>
• <b>Client-Side Rendering (CSR)</b>: the server sends an almost empty <code>index.html</code> and a JavaScript bundle; the browser builds the page. Like receiving flat-pack furniture and assembling it at home. Great interactivity, but a blank page until JS runs, and weak for SEO/social previews.<br>
• <b>Server-Side Rendering (SSR)</b>: the server renders full HTML for every request, like a restaurant serving a cooked meal. The user sees content immediately, then Angular <b>hydrates</b> it to make it interactive.<br>
• <b>Static Site Generation (SSG) / prerendering</b>: pages are rendered once at <b>build time</b> and served as static files, like a printed menu. Fastest and cheapest, but content is only as fresh as the last build.`,
          `# add SSR to a new or existing app
ng new shop --ssr
ng add @angular/ssr

# run
ng serve                 # dev server with SSR support
npm run serve:ssr:shop   # run the built Node server`,
        ),
      ],
      [
        blk(`<h3>Angular SSR setup in practice</h3>
Modern Angular (v17+) uses <code>@angular/ssr</code> with the application builder: a <code>server.ts</code> (Express) and <code>main.server.ts</code> plus <code>app.config.server.ts</code> that merges the client config. Enable hydration with <code>provideClientHydration()</code> and <code>withEventReplay()</code> to replay clicks made before hydration. Since v19 you choose the render mode per route with <code>ServerRoute</code> (<b>RenderMode.Server</b>, <b>RenderMode.Prerender</b>, <b>RenderMode.Client</b>) in <code>app.routes.server.ts</code>; availability of this API depends on version (v19+, developer preview in some releases).`,
          `// app.config.ts
providers: [
  provideRouter(routes),
  provideHttpClient(withFetch()),                       // fetch is recommended for SSR
  provideClientHydration(withEventReplay()),
]

// app.routes.server.ts (v19+)
export const serverRoutes: ServerRoute[] = [
  { path: '',            renderMode: RenderMode.Prerender },                  // SSG at build time
  { path: 'products/:id', renderMode: RenderMode.Prerender,
    async getPrerenderParams() { return [{ id: '1' }, { id: '2' }]; } },       // which ids to prerender
  { path: 'account/**',  renderMode: RenderMode.Client },                      // pure CSR (private)
  { path: '**',          renderMode: RenderMode.Server },                      // SSR for everything else
];`,
        ),
        blk(`<h3>Choosing CSR, SSR or SSG</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"><thead><tr><th>Mode</th><th>Best for</th><th>Cost</th></tr></thead><tbody>
<tr><td>CSR</td><td>Logged-in dashboards, internal tools, admin panels</td><td>Cheap static hosting; slower first paint; poor SEO</td></tr>
<tr><td>SSR</td><td>Public, dynamic, personalised or frequently changing pages needing SEO</td><td>Node server, CPU per request, caching required</td></tr>
<tr><td>SSG / prerender</td><td>Marketing, docs, blogs, product pages that change rarely</td><td>Rebuild to update; very cheap and fast</td></tr>
</tbody></table><br>
Most real apps mix them per route (hybrid rendering).`,
        ),
      ],
      [
        blk(`<h3>Internals and trade-offs</h3>
• On each SSR request Angular bootstraps a <b>new application instance</b> on the server with a DOM emulation (Domino), renders to a string, waits until the app is <i>stable</i> (pending HTTP, router navigation, <code>PendingTasks</code>) and sends HTML. Long timers or never-completing observables delay or hang responses.<br>
• SSR improves LCP, SEO and link previews but adds server cost, TTFB latency (slow API calls block the HTML) and operational complexity. For authenticated pages it often gives little benefit; use <code>RenderMode.Client</code> for those.<br>
• Prerender cannot depend on per-request data (cookies, headers). Dynamic route params need <code>getPrerenderParams</code> or a crawl of discovered routes.<br>
• Older tooling: <code>@nguniversal/*</code> and <code>ng add @nguniversal/express-engine</code> are <b>legacy</b>; use <code>@angular/ssr</code>. NgModule-based <code>ServerModule</code> is legacy for standalone apps.<br>
• ISR (incremental static regeneration) is not built in; achieve it with CDN caching and short revalidation or an external platform.`,
        ),
        blk(`<h3>Migration tips</h3>
Start by enabling SSR on a public route group, fix browser-only code (next lesson), measure TTFB and LCP before/after, and add caching. Avoid SSR just for fashion: if the app is behind a login and not indexed, CSR + good bundles is simpler and cheaper.`,
        ),
      ],
      [
        ['What is the difference between CSR, SSR and SSG?', 'CSR renders in the browser; SSR renders HTML on the server on every request; SSG/prerender renders HTML at build time and serves static files. They trade off freshness, speed, SEO and infrastructure.'],
        ['What is prerendering in Angular?', 'Rendering routes to static HTML at build time (SSG) with the SSR engine, configured via RenderMode.Prerender or the prerender option, then served from any static host.'],
        ['When would you not use SSR?', 'For authenticated or internal apps where SEO and first paint on public pages do not matter, or when server cost and complexity outweigh benefits.'],
        ['How do you set up SSR in a new project?', 'ng new app --ssr or ng add @angular/ssr, which adds server.ts, main.server.ts, server config and hydration providers.'],
        ['What is hybrid rendering?', 'Choosing a render mode per route (server, prerender, client) in the same app, using ServerRoute configuration in v19+.'],
      ],
    ),

    topic(
      'ngs-m19-hydration-browser-apis',
      L19b,
      [
        blk(`<h3>Waking up the server HTML</h3>
With SSR the user first sees plain HTML. <b>Hydration</b> is the step where Angular attaches to that existing DOM and makes it interactive, instead of throwing it away and rendering again (which causes flicker and wasted work). Think of a pre-built shop front: hydration plugs in the electricity rather than rebuilding the shop.<br>
On the server there is <b>no real browser</b>: no <code>window</code>, no real <code>document</code> layout, no <code>localStorage</code>, no screen size. Code using them breaks with "window is not defined". These are <b>browser-only APIs</b>.`,
          `// WRONG: crashes on the server
const width = window.innerWidth;
localStorage.setItem('x', '1');

// RIGHT: let Angular run it only in the browser after rendering
constructor() {
  afterNextRender(() => {
    console.log(window.innerWidth);       // runs only in the browser
  });
}`,
        ),
      ],
      [
        blk(`<h3>Handling window, document and platform differences</h3>
Techniques: (1) <code>afterNextRender()</code> / <code>afterRender()</code> for DOM-touching code (browser only); (2) inject the <code>DOCUMENT</code> token instead of the global <code>document</code> (works on the server for basic DOM operations); (3) <code>isPlatformBrowser(inject(PLATFORM_ID))</code> guards; (4) wrap storage in an abstraction service with browser and server implementations; (5) the <code>@defer</code> and <code>ngSkipHydration</code> attribute for components that manipulate the DOM directly or are third-party widgets.`,
          `// storage.service.ts - safe wrapper
@Injectable({ providedIn: 'root' })
export class SafeStorage {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  get(key: string): string | null { return this.isBrowser ? localStorage.getItem(key) : null; }
  set(key: string, v: string) { if (this.isBrowser) localStorage.setItem(key, v); }
}

// component using DOCUMENT token
private doc = inject(DOCUMENT);
setThemeColor(c: string) { this.doc.documentElement.style.setProperty('--brand', c); }`,
          `<!-- third-party widget that mutates DOM: exclude from hydration -->
<app-legacy-chart ngSkipHydration />`,
        ),
        blk(`<h3>Incremental hydration</h3>
<b>Incremental hydration</b> (v19+, developer preview in 19, stable in later releases; check your version) builds on <code>@defer</code>: a deferred block is rendered on the server, stays dehydrated (no JS downloaded) and hydrates only when its trigger fires: <code>hydrate on viewport</code>, <code>on interaction</code>, <code>on idle</code>, <code>on hover</code>, <code>on timer</code>, <code>when</code>, or <code>hydrate never</code>. Enable with <code>provideClientHydration(withIncrementalHydration())</code>.`,
          `@defer (hydrate on viewport) {
  <app-comments [postId]="id()" />
} @placeholder {
  <p>Loading comments...</p>
}`,
        ),
      ],
      [
        blk(`<h3>Hydration mismatches and execution differences</h3>
• Hydration expects server and client DOM to match. Mismatches (NG0500-series errors) come from direct DOM manipulation, invalid HTML nesting (e.g. <code>&lt;div&gt;</code> in <code>&lt;p&gt;</code>, <code>&lt;tbody&gt;</code> missing), random/time-based content (<code>Math.random()</code>, <code>Date.now()</code> in templates) and browser-only rendering branches. Use <code>ngSkipHydration</code> sparingly, fix the cause where possible.<br>
• <b>Server and browser execution differences</b>: one process serves many users, so <b>module-level mutable state is shared across requests</b> (a security leak and bug source): keep state in injected, request-scoped services. No layout APIs (<code>getBoundingClientRect</code> returns zeros), no <code>IntersectionObserver</code>/<code>ResizeObserver</code>/<code>matchMedia</code>, timers keep the response waiting, and relative HTTP URLs need an absolute base on the server (use an interceptor or absolute <code>API_URL</code> token).<br>
• Event replay (<code>withEventReplay()</code>) records user clicks before hydration completes and replays them afterwards, improving INP.<br>
• i18n hydration is supported from v18; <code>HttpClient</code> with <code>withFetch()</code> is advised for SSR.<br>
• Avoid <code>setTimeout</code> or <code>setInterval</code> in constructors that run on the server; start them inside <code>afterNextRender</code>.`,
        ),
        blk(`<h3>Library compatibility</h3>
Many third-party UI libraries touch <code>window</code> at import time, which crashes SSR before any guard can run. Lazy import them inside <code>afterNextRender</code> with dynamic <code>import()</code>, or render the component only in the browser via <code>@defer (on immediate)</code> or <code>RenderMode.Client</code> routes.`,
        ),
      ],
      [
        ['What is hydration?', 'Reusing the server-rendered DOM: Angular attaches listeners and state to existing nodes rather than destroying and re-creating them, avoiding flicker and duplicated work.'],
        ['How do you use window or localStorage safely in an SSR app?', 'Never touch them at import/constructor time on the server. Use afterNextRender, isPlatformBrowser guards, the DOCUMENT token, or a storage abstraction with server-safe fallback.'],
        ['What is incremental hydration?', 'Server-rendered @defer blocks stay dehydrated and hydrate on triggers such as viewport or interaction, so less JavaScript runs up front. It is a v19+ feature; check the status for your version.'],
        ['What causes hydration mismatch errors?', 'Different DOM on server and client: direct DOM changes, invalid HTML, random or time-based values, or browser-only conditional rendering. Fix the source or use ngSkipHydration for problematic components.'],
        ['Why is module-level state dangerous in SSR?', 'A Node process handles many requests; a module-level variable is shared among users and can leak data between requests. Use request-scoped Angular services.'],
      ],
    ),

    topic(
      'ngs-m19-seo-metadata',
      L19c,
      [
        blk(`<h3>Helping search engines and social apps understand pages</h3>
<b>SEO fundamentals</b>: crawlers need meaningful HTML at a stable URL. Key ingredients: readable content in the initial HTML (SSR/prerender), unique <b>page titles and descriptions</b>, descriptive links (<code>&lt;a href&gt;</code> via <code>routerLink</code>, not click handlers), semantic headings, fast Core Web Vitals, mobile friendliness, <code>sitemap.xml</code> and <code>robots.txt</code>, and structured data (JSON-LD). Without SSR, Google can execute JavaScript but other crawlers and social previews often cannot.`,
          `<!-- what a crawler wants to see in the first HTML response -->
<title>Angular Course for Java Developers | JavaSchool</title>
<meta name="description" content="Learn Angular step by step with Spring Boot examples.">
<link rel="canonical" href="https://javaschool.example.com/courses/angular">`,
        ),
      ],
      [
        blk(`<h3>Dynamic metadata with Title, Meta and route titles</h3>
Angular provides <code>Title</code> and <code>Meta</code> services (they work on the server too, because they write into the DOM emulation that becomes the HTML). For simple pages use the route <code>title</code> property or a <code>TitleStrategy</code> (to add a suffix). For dynamic pages (product, article) set metadata after loading data, typically in the component or a resolver.`,
          `// seo.service.ts
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  update(p: { title: string; description: string; url: string; image?: string }) {
    this.title.setTitle(p.title + ' | JavaSchool');                                   // page title
    this.meta.updateTag({ name: 'description', content: p.description });             // meta description
    this.meta.updateTag({ property: 'og:title', content: p.title });                  // Open Graph
    this.meta.updateTag({ property: 'og:description', content: p.description });
    this.meta.updateTag({ property: 'og:url', content: p.url });
    if (p.image) this.meta.updateTag({ property: 'og:image', content: p.image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.setCanonical(p.url);
  }

  private setCanonical(url: string) {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel=canonical]');
    if (!link) { link = this.doc.createElement('link'); link.rel = 'canonical'; this.doc.head.appendChild(link); }
    link.href = url;                                                                   // canonical URL
  }
}

// route titles: { path: 'about', component: AboutComponent, title: 'About us' }`,
        ),
        blk(`<h3>Open Graph and canonical URLs explained</h3>
<b>Open Graph metadata</b> (<code>og:title</code>, <code>og:description</code>, <code>og:image</code>, <code>og:url</code>, <code>og:type</code>) controls how a link looks when shared on WhatsApp, LinkedIn, Facebook, Slack; X/Twitter uses <code>twitter:*</code> tags. The preview bot does <b>not run JavaScript</b>, so tags must be in the server-rendered HTML. A <b>canonical URL</b> tells search engines which URL is the master copy when the same content is reachable via several URLs (query strings, trailing slash, http/https, www), preventing duplicate-content dilution.`,
        ),
      ],
      [
        blk(`<h3>Details and pitfalls</h3>
• Set tags <b>before</b> the app becomes stable on the server; metadata set after a delayed callback is missed by SSR. Fetch data in a resolver or use <code>resource</code>/transfer cache so the server waits for it.<br>
• Use <code>updateTag</code> (not <code>addTag</code>) to avoid duplicates on navigation. Remove stale tags on routes that do not need them.<br>
• Titles ~50-60 chars, descriptions ~150-160 chars, og:image 1200x630 absolute HTTPS URL. Use absolute URLs for canonical and og tags.<br>
• Structured data: inject a <code>&lt;script type="application/ld+json"&gt;</code> element with JSON-LD built from your own data via <code>JSON.stringify</code>; escape the closing script sequence in user-provided strings.<br>
• Use proper status codes: a not-found page should return HTTP <b>404</b> from the server (set it on the response via the request-response token in the Express server); a client-only 404 view returns 200 ("soft 404") which hurts SEO. Redirects should be 301/302 at the server level.<br>
• Provide <code>sitemap.xml</code> generated from backend data and <code>robots.txt</code>. Avoid hash-based URLs (<code>useHash</code>), which crawlers ignore.<br>
• Testing: view the "View source" HTML, use Google Search Console URL inspection, the Rich Results test and social debuggers; <code>curl</code> the URL to see what a non-JS bot gets.`,
        ),
        blk(`<h3>Per-route SEO pattern</h3>
Store SEO data in route <code>data</code> for static pages and in resolvers for dynamic ones; a single <code>TitleStrategy</code> plus <code>SeoService</code> keeps it consistent and testable. Combine with prerender so each product page is a ready HTML file with correct tags.`,
        ),
      ],
      [
        ['Why does SEO need SSR or prerendering for many Angular sites?', 'Crawlers and social preview bots may not execute JavaScript; with CSR they see an empty shell. SSR/SSG delivers real HTML with content and metadata in the first response.'],
        ['How do you set page title and description dynamically?', 'Inject Title and Meta services (or use route title and a TitleStrategy) and update after the data loads, preferably in a resolver so SSR waits for it. Use updateTag to avoid duplicates.'],
        ['What is a canonical URL?', 'A link rel=canonical tag naming the preferred URL of a page so duplicates (query params, protocol variants) consolidate ranking signals.'],
        ['Why are Open Graph tags important with SSR?', 'Social crawlers read og tags from the initial HTML without running JS. They must be present in the server-rendered output to produce rich previews.'],
        ['What is a soft 404?', 'A not-found page returning HTTP 200. Search engines treat it as real content. Return an actual 404 status from the server for missing resources.'],
      ],
    ),

    topic(
      'ngs-m19-server-data-caching-security-deploy',
      L19d,
      [
        blk(`<h3>Data, speed and safety on the server</h3>
• <b>Server-side data fetching</b>: during SSR the server calls your API (Spring Boot) so the HTML already contains data. The browser must not repeat these calls: Angular's <b>HTTP transfer cache</b> serializes GET responses into the page and reuses them on the client during hydration.<br>
• <b>SSR caching</b>: rendering is CPU work; cache rendered HTML for anonymous pages (CDN or in memory) with short TTLs.<br>
• <b>SSR security</b>: the Node server is now a backend: treat it as part of your attack surface.<br>
• <b>Deployment of SSR applications</b>: you now run a Node process, not just static files.`,
          `// app.config.ts
provideClientHydration(withHttpTransferCacheOptions({ includePostRequests: false }))
// GET /api/products is fetched on the server, embedded in the HTML and reused in the browser`,
        ),
      ],
      [
        blk(`<h3>Fetching on the server and caching output</h3>
Use <code>HttpClient</code> with <code>withFetch()</code>. On the server, API URLs must be absolute (an <code>API_URL</code> <code>InjectionToken</code> provided differently for server and browser) or an interceptor prefixes them; inside the same network use the internal Spring hostname to avoid public round trips. Pass the user's cookies to the API only for personalised (non-cached) pages and forward them explicitly from the request (<code>REQUEST</code> token).<br>
<b>SSR caching</b> layers: (1) CDN or reverse proxy caches HTML (<code>Cache-Control: public, s-maxage=60, stale-while-revalidate=300</code>); (2) in-memory LRU of rendered pages by URL in <code>server.ts</code>; (3) cache upstream API calls. Never cache responses that depend on cookies or authorization (use <code>Vary</code> or bypass).`,
          `// server.ts (Express) - simple cache headers for anonymous pages
app.get('**', (req, res, next) => {
  angularApp.handle(req).then(response => {
    if (!response) return next();
    if (!req.headers.cookie) response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return writeResponseToNodeResponse(response, res);
  }).catch(next);
});

// api-url.interceptor.ts
export const API_URL = new InjectionToken<string>('API_URL');
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) =>
  req.url.startsWith('/api') ? next(req.clone({ url: inject(API_URL) + req.url })) : next(req);
// app.config.server.ts provides API_URL: 'http://spring-backend:8080'`,
        ),
      ],
      [
        blk(`<h3>SSR security</h3>
• <b>Isolation</b>: no per-user data in module-level variables or singletons created outside the request injector; each render gets its own platform injector but static code is shared.<br>
• <b>Secrets</b>: the server can hold secrets (API keys) but never serialize them into transfer state or HTML; the transfer cache embeds responses, so do not fetch secrets in components. Hide cookie/headers: the HTTP transfer cache drops sensitive headers such as <code>Authorization</code> and <code>Proxy-Authorization</code> unless you opt in.<br>
• <b>SSRF</b>: if a URL comes from the request (<code>Host</code> header or query parameter) and is used for fetching, an attacker can make your server call internal addresses. Newer Angular validates the host (<code>allowedHosts</code> in the server config in recent versions, after security advisories in 2025); keep Angular patched and configure an allow-list of hostnames; do not trust <code>X-Forwarded-*</code> blindly.<br>
• <b>XSS in HTML output</b>: Angular escapes templates; custom <code>REQUEST</code> data and JSON-LD scripts need escaping. Apply CSP, <code>helmet</code> headers, rate limiting and timeouts on the Express app. Prefer running Node as non-root in a container.<br>
• Tokens in cookies/localStorage: on the server there is no localStorage, so SSR auth requires cookies, which brings CSRF considerations.`,
        ),
        blk(`<h3>Deployment</h3>
Build with <code>ng build</code> (outputs <code>dist/app/browser</code> and <code>dist/app/server</code>), run <code>node dist/app/server/server.mjs</code> under <b>PM2/systemd/Docker</b>, behind <b>Nginx</b> (TLS, gzip/brotli, static asset caching, proxy to Node). Prerendered-only apps need just static hosting. Options: containers (Cloud Run, ECS, Kubernetes), Firebase Hosting with Cloud Functions, Vercel/Netlify adapters, or edge runtimes (check version support). Health check endpoints, graceful shutdown, structured logging, horizontal scaling and a render timeout are production basics. With Spring Boot, either serve Angular SSR from Node and proxy <code>/api</code> to Spring, or keep CSR and serve static files from Nginx/Spring.`,
          `# Dockerfile (outline)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
USER node
EXPOSE 4000
CMD ["node", "dist/my-app/server/server.mjs"]`,
        ),
      ],
      [
        ['How does the HTTP transfer cache help SSR?', 'GET responses fetched on the server are embedded into the HTML and reused during hydration in the browser, avoiding duplicate requests and flicker.'],
        ['How would you cache SSR output safely?', 'Cache only anonymous, non-personalised pages via CDN/reverse proxy or in-memory LRU with short TTLs and stale-while-revalidate; bypass or vary on cookies and authorization.'],
        ['What are SSR-specific security risks?', 'Cross-request state leaks, secrets in transferred state, SSRF via untrusted host headers or URLs, unescaped data in server templates, and exposing the Node server without hardening.'],
        ['How do you deploy an Angular SSR app?', 'Build, run the Node server file under a process manager or in a container, put Nginx or a CDN in front for TLS and caching, proxy API calls to Spring Boot, and add health checks. Prerendered-only sites need only static hosting.'],
        ['Why use absolute API URLs on the server?', 'There is no browser origin during SSR, so relative URLs have no base. Provide an API base token or interceptor for the server environment.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 20
const L20a = 'Testing fundamentals and tooling';
const L20b = 'TestBed, components, services and DI';
const L20c = 'Mocking, async, Observables and Signals';
const L20d = 'Forms, guards, HTTP, router and accessibility tests';

const module20: SubTopic = {
  id: 'ngs-mod-20',
  name: 'Module 20 · Angular Testing',
  topics: [
    overview(20, 'Angular Testing', [
      ['Software testing fundamentals', 'Why test, the test pyramid, arrange-act-assert.', L20a],
      ['Unit testing', 'One class/function in isolation.', L20a],
      ['Integration testing', 'Several units together (component + template + service).', L20a],
      ['End-to-end testing', 'Whole app in a real browser.', L20a],
      ['Jasmine', 'Default BDD test framework in classic Angular projects.', L20a],
      ['Karma', 'Browser test runner used with Jasmine (deprecated direction).', L20a],
      ['Jest', 'Popular Node-based runner with jsdom.', L20a],
      ['Vitest', 'Vite-based runner; experimental/newer Angular CLI option.', L20a],
      ['Playwright', 'Modern cross-browser E2E tool.', L20a],
      ['Cypress', 'Browser E2E tool with interactive runner.', L20a],
      ['Code coverage', 'Measure which lines/branches tests execute.', L20a],
      ['Continuous Integration testing', 'Run tests headless on every push.', L20a],
      ['Angular testing utilities', 'TestBed, fixtures, harnesses, fakeAsync.', L20b],
      ['TestBed', 'Test-time Angular module/injector configuration.', L20b],
      ['ComponentFixture', 'Wrapper giving access to a component, its DOM and change detection.', L20b],
      ['Component testing', 'Render and assert on DOM and behaviour.', L20b],
      ['Service testing', 'Plain class tests or via TestBed.inject.', L20b],
      ['Dependency Injection testing', 'Override providers with fakes.', L20b],
      ['Testing inputs and outputs', 'setInput and output subscriptions/spies.', L20b],
      ['Testing lifecycle behavior', 'ngOnInit, ngOnChanges, ngOnDestroy via fixture.', L20b],
      ['Testing directives', 'Host test component applying the directive.', L20b],
      ['Testing pipes', 'Instantiate and call transform.', L20b],
      ['Mocking dependencies', 'Replace real collaborators with fakes.', L20c],
      ['Spies and stubs', 'jasmine.createSpyObj, jest.fn, vi.fn.', L20c],
      ['Asynchronous testing', 'fakeAsync/tick, waitForAsync, async/await, whenStable.', L20c],
      ['Testing Observables', 'Subscribe/done, firstValueFrom, marble tests.', L20c],
      ['Testing Signals', 'Read signals directly; flush effects with TestBed.tick.', L20c],
      ['Testing error handling', 'Make dependencies fail and assert UI/state.', L20c],
      ['Testing forms', 'Set control values, check validity and messages.', L20d],
      ['Testing validators', 'Call validator functions with controls.', L20d],
      ['Testing route guards', 'runInInjectionContext with fake services.', L20d],
      ['Testing resolvers', 'Call the ResolveFn in injection context.', L20d],
      ['Testing HTTP services', 'provideHttpClientTesting.', L20d],
      ['HttpTestingController', 'expectOne, flush, verify.', L20d],
      ['Router testing', 'RouterTestingHarness and provideRouter.', L20d],
      ['Accessibility testing', 'axe checks and keyboard/ARIA assertions.', L20d],
    ]),

    topic(
      'ngs-m20-fundamentals-tooling',
      L20a,
      [
        blk(`<h3>Why test?</h3>
<b>Software testing fundamentals</b>: tests are a safety net so you can change code without fear, like the seat belt in a car. They run automatically and tell you when behaviour breaks. A good test follows <b>Arrange - Act - Assert</b>: set up, do the thing, check the result. The <b>test pyramid</b> says: many fast <b>unit tests</b>, a medium number of <b>integration tests</b>, and few slow <b>end-to-end (E2E) tests</b>.<br>
• <b>Unit testing</b>: one piece in isolation (a pipe, a service, a validator).<br>
• <b>Integration testing</b>: pieces working together (a component with its template and a fake service).<br>
• <b>End-to-end testing</b>: a robot uses the real app in a real browser, against the real or stubbed backend. For Java developers: JUnit ~ unit, Spring Boot Test ~ integration, Selenium ~ E2E.`,
          `// tax.service.ts and its first unit test (Jasmine/Jest/Vitest syntax is the same here)
export class TaxService { calc(amount: number) { return Math.round(amount * 0.18); } }

describe('TaxService', () => {
  it('calculates 18 percent GST', () => {
    const service = new TaxService();         // arrange
    const result = service.calc(1000);        // act
    expect(result).toBe(180);                 // assert
  });
});`,
        ),
      ],
      [
        blk(`<h3>The tool landscape</h3>
<b>Note on tooling and versions:</b> Angular testing defaults vary by version and project configuration. Classic CLI projects use <b>Jasmine</b> (framework: <code>describe/it/expect/spyOn</code>) with <b>Karma</b> (runner that launches real Chrome). Newer Angular versions are moving away from Karma (Karma is deprecated upstream); the CLI offers an experimental <b>Vitest</b> builder (<code>@angular/build:unit-test</code>) and the team's direction is Vitest, while many teams use <b>Jest</b> (jsdom, with <code>jest-preset-angular</code> or the builders). Learn the runner your project actually uses and read its <code>angular.json</code>/<code>package.json</code>.<br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"><thead><tr><th>Tool</th><th>Type</th><th>Notes</th></tr></thead><tbody>
<tr><td>Jasmine + Karma</td><td>Unit/integration in a real browser</td><td>Classic default; real browser fidelity, slower; Karma is legacy direction</td></tr>
<tr><td>Jest</td><td>Unit/integration in jsdom (Node)</td><td>Fast, snapshots, <code>jest.fn</code>, <code>jest.spyOn</code>; no real layout</td></tr>
<tr><td>Vitest</td><td>Unit/integration, Vite-powered</td><td>Jest-compatible API (<code>vi.fn</code>), fast watch mode; Angular support newer / experimental in some versions</td></tr>
<tr><td>Playwright</td><td>E2E (Chromium, Firefox, WebKit)</td><td>Auto-waiting, traces, parallel; recommended modern E2E</td></tr>
<tr><td>Cypress</td><td>E2E (+ component testing)</td><td>Great interactive runner; runs in the browser, one tab model</td></tr>
</tbody></table><br>
<b>Code coverage</b>: <code>ng test --code-coverage</code> produces a report (statements, branches, functions, lines). Use it to find untested areas, not as a goal in itself (100 percent coverage does not mean correct).`,
          `// the same spy, three dialects
// Jasmine
const api = jasmine.createSpyObj('Api', ['load']); api.load.and.returnValue(of([]));
// Jest
const api2 = { load: jest.fn().mockReturnValue(of([])) };
// Vitest
const api3 = { load: vi.fn().mockReturnValue(of([])) };

// Playwright E2E
test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('a@b.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/dashboard/);
});`,
        ),
        blk(`<h3>Continuous Integration testing</h3>
Run unit tests headless on every push/pull request, fail the build on test or coverage regressions, run E2E against a deployed preview or docker-compose stack (Angular + Spring Boot + DB), upload reports/traces as artifacts.`,
          `# .github/workflows/ci.yml (excerpt)
- run: npm ci
- run: npx ng test --watch=false --browsers=ChromeHeadless --code-coverage    # Karma/Jasmine project
# or for a Jest/Vitest project: npm test -- --coverage
- run: npx playwright install --with-deps chromium
- run: npx playwright test`,
        ),
      ],
      [
        blk(`<h3>Strategy and honest trade-offs</h3>
• Jasmine/Karma tests run in a real browser (accurate layout, <code>getBoundingClientRect</code>, CSS) but are slow and need Chrome in CI. Jest/Vitest in jsdom or happy-dom are faster but do not implement layout, <code>IntersectionObserver</code> or many CSS features; stub those, or move such checks to Playwright.<br>
• Migration from Karma: check the official guidance for your version; Jest migration usually means replacing <code>jasmine.createSpyObj</code>/<code>spyOn().and.returnValue</code> with <code>jest.fn</code>/<code>jest.spyOn().mockReturnValue</code>, <code>fakeAsync</code> still works with zone.js (needs zone testing setup) but zoneless/Vitest setups use fake timers (<code>vi.useFakeTimers</code>) and <code>await fixture.whenStable()</code>.<br>
• Prefer testing <b>behaviour</b> (what the user sees) over implementation (private methods). Query by role/label/text, not CSS classes.<br>
• Keep unit tests deterministic: no real network, time, randomness; control with fakes and fake timers.<br>
• Balance: pyramid plus a handful of critical E2E journeys (login, checkout). Flaky E2E tests destroy trust; use auto-wait locators, isolated test data, and avoid fixed sleeps.<br>
• Contract testing / Spring Cloud Contract or a mock server (MSW) keeps front and back in sync; real full-stack E2E validates integration with Spring Boot, CORS and security.<br>
• Coverage thresholds in CI (e.g. 80 percent for new code) plus mutation testing (Stryker) give a better quality signal.`,
        ),
        blk(`<h3>Choosing for a new project</h3>
Follow the CLI default of your Angular version unless there is a reason. If starting fresh on a recent version, evaluate Vitest (speed, Vite alignment) but confirm it is supported (stable or experimental) for your Angular release; use Playwright for E2E.`,
        ),
      ],
      [
        ['What is the test pyramid?', 'A guideline: many fast unit tests at the base, fewer integration tests in the middle and a few slow end-to-end tests at the top, balancing speed, confidence and maintenance cost.'],
        ['Jasmine vs Karma?', 'Jasmine is the testing framework (describe, it, expect, spies). Karma is the runner that launches browsers and executes the tests. Karma is on the deprecation path; many teams use Jest or Vitest.'],
        ['Jest vs Vitest in Angular?', 'Both offer Jest-style APIs. Jest runs in Node with jsdom and is mature; Vitest is Vite-based, faster, with ESM focus, and has newer, sometimes experimental, Angular CLI support. Check your Angular version.'],
        ['Playwright vs Cypress?', 'Both test the real app in browsers. Playwright supports multiple browsers including WebKit, multiple tabs and contexts, auto-waits and traces; Cypress has an excellent interactive runner and component testing but a different execution model.'],
        ['Does 100 percent code coverage guarantee quality?', 'No. It only shows lines executed, not that assertions are meaningful. Use it to find gaps and combine with good assertions and mutation testing.'],
      ],
    ),

    topic(
      'ngs-m20-testbed-components-services',
      L20b,
      [
        blk(`<h3>Angular testing utilities</h3>
<b>Angular testing utilities</b> live in <code>@angular/core/testing</code>. <b>TestBed</b> creates a mini Angular environment for a test, like a small stage where you place only the actors (components, providers) you need. <b>ComponentFixture</b> is the handle to the created component: <code>fixture.componentInstance</code> (the class), <code>fixture.nativeElement</code> (the DOM) and <code>fixture.detectChanges()</code> (run change detection so the template updates).<br>
<b>Component testing</b>: create it, change state, detect changes, assert on DOM text.`,
          `// greeting.component.spec.ts
@Component({ selector: 'app-greeting', template: '<h1>Hello {{ name() }}</h1>' })
class GreetingComponent { name = input('guest'); }

describe('GreetingComponent', () => {
  let fixture: ComponentFixture<GreetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GreetingComponent] }).compileComponents();   // standalone: import it
    fixture = TestBed.createComponent(GreetingComponent);
  });

  it('shows the name', () => {
    fixture.componentRef.setInput('name', 'Asha');       // set signal input
    fixture.detectChanges();                              // render
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Hello Asha');
  });
});`,
        ),
      ],
      [
        blk(`<h3>Services, DI, inputs/outputs, lifecycle</h3>
<b>Service testing</b>: for a plain service just <code>new</code> it with fakes, or use TestBed when it uses <code>inject()</code>. <b>Dependency Injection testing</b>: override providers (<code>{ provide: Api, useValue: fakeApi }</code>) to isolate the unit; check hierarchical/route scopes with <code>TestBed.inject</code>. <b>Testing inputs and outputs</b>: set inputs with <code>fixture.componentRef.setInput</code>; for <code>output()</code> subscribe with <code>.subscribe(spy)</code> (or an <code>EventEmitter</code> spy), then trigger the DOM event. <b>Testing lifecycle behavior</b>: the first <code>fixture.detectChanges()</code> runs <code>ngOnInit</code>; changes via <code>setInput</code> trigger <code>ngOnChanges</code>; <code>fixture.destroy()</code> runs <code>ngOnDestroy</code>.`,
          `// cart.service.spec.ts - DI with a fake
describe('CartService', () => {
  let service: CartService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService, { provide: PriceApi, useValue: { getPrice: () => 100 } }],   // override dependency
    });
    service = TestBed.inject(CartService);
  });
  it('adds an item', () => {
    service.add('book');
    expect(service.total()).toBe(100);
  });
});

// rating.component.spec.ts - output and lifecycle
it('emits the chosen rating', () => {
  const spy = jasmine.createSpy('rated');               // jest.fn() / vi.fn() in other runners
  fixture.componentInstance.rated.subscribe(spy);        // output()
  fixture.nativeElement.querySelector('button.star-4').click();
  expect(spy).toHaveBeenCalledWith(4);
});
it('cleans up on destroy', () => {
  fixture.detectChanges();
  fixture.destroy();                                     // triggers ngOnDestroy
  expect(timerService.activeTimers).toBe(0);
});`,
        ),
        blk(`<h3>Directives and pipes</h3>
<b>Testing pipes</b> is the easiest: instantiate and call <code>transform</code>. <b>Testing directives</b>: create a small host component whose template uses the directive, then assert on the host element (classes, attributes, events).`,
          `it('truncates long text', () => {
  expect(new TruncatePipe().transform('abcdefghij', 5)).toBe('abcde...');
});

@Component({ imports: [HighlightDirective], template: '<p appHighlight="yellow">text</p>' })
class HostComponent {}

it('highlights the element', () => {
  const f = TestBed.createComponent(HostComponent);
  f.detectChanges();
  const p: HTMLElement = f.nativeElement.querySelector('p');
  expect(p.style.backgroundColor).toBe('yellow');
});`,
        ),
      ],
      [
        blk(`<h3>Best practices and pitfalls</h3>
• With the default <code>ComponentFixtureAutoDetect</code> off, nothing renders until <code>detectChanges()</code>. For OnPush components, setting a plain property after first <code>detectChanges()</code> does not re-render; use <code>setInput</code> (or a host wrapper) because the fixture's change detection respects OnPush.<br>
• Prefer <b>component harnesses</b> (<code>@angular/cdk/testing</code>, Material harnesses like <code>MatButtonHarness</code>) over CSS selectors for library widgets: they hide DOM details and wait for stability automatically (<code>TestbedHarnessEnvironment.loader(fixture)</code>).<br>
• Shallow vs deep component tests: import child components for realistic integration, or override them (<code>TestBed.overrideComponent</code> with stubs) for isolation. Avoid <code>NO_ERRORS_SCHEMA</code> hiding real template errors.<br>
• Use <code>TestBed.runInInjectionContext(() => ...)</code> for functions using <code>inject()</code> (guards, interceptors, helpers). Call <code>TestBed.resetTestingModule()</code> only if you must; the framework resets between tests. Avoid sharing state between specs.<br>
• Do not test Angular itself (that <code>*ngIf</code> works); test your logic and visible outcomes.<br>
• Zoneless: configure <code>provideZonelessChangeDetection()</code> in tests to match production, and use <code>await fixture.whenStable()</code> instead of relying on automatic zone-triggered detection.<br>
• Keep tests fast: use <code>TestBed</code> only when needed; pure functions do not need it.`,
        ),
        blk(`<h3>Structuring specs</h3>
Co-locate <code>*.spec.ts</code> with the file, one <code>describe</code> per unit, builders/factories for test data, shared test providers in a helper, and descriptive names ("shows an error when the email is invalid") so failures read like documentation.`,
        ),
      ],
      [
        ['What does TestBed do?', 'It configures and creates a testing Angular environment: declares or imports components, sets providers, creates components and exposes the injector (TestBed.inject).'],
        ['What is ComponentFixture used for?', 'It wraps a created component: access componentInstance, nativeElement/debugElement, run detectChanges, set inputs via componentRef.setInput, and destroy it.'],
        ['How do you test a component output?', 'Subscribe to the output (or spy on the EventEmitter) and trigger the DOM event that causes it, then assert the spy was called with the right value.'],
        ['How do you test a directive?', 'Create a host test component that uses the directive in its template, detect changes and assert on the host element, simulating events with dispatchEvent.'],
        ['What are component harnesses?', 'Abstractions from the CDK that expose a component API for tests (click, getText) independent of the DOM structure, handling async stability automatically.'],
        ['Why does my OnPush component not update in a test?', 'Mutating a property after the first detectChanges does not mark an OnPush view dirty. Use setInput, signals, or markForCheck via a wrapper host.'],
      ],
    ),

    topic(
      'ngs-m20-mocking-async-observables-signals',
      L20c,
      [
        blk(`<h3>Fakes, spies and waiting</h3>
<b>Mocking dependencies</b> means replacing real collaborators (HTTP, router, other services) with controllable fakes so the test checks only your unit. A <b>stub</b> returns canned answers; a <b>spy</b> records how it was called (like Mockito's <code>mock</code> and <code>verify</code>). <b>Asynchronous testing</b> deals with code that finishes later: promises, timers, observables.`,
          `// stub: returns canned data; spy: records calls
const userApi = jasmine.createSpyObj<UserApi>('UserApi', ['load']);
userApi.load.and.returnValue(of([{ id: 1, name: 'Asha' }]));

TestBed.configureTestingModule({ providers: [{ provide: UserApi, useValue: userApi }] });
// ... act ...
expect(userApi.load).toHaveBeenCalledTimes(1);`,
        ),
      ],
      [
        blk(`<h3>Asynchronous tests, Observables, Signals, errors</h3>
<b>Asynchronous testing</b> options: (1) <code>async/await</code> with <code>await fixture.whenStable()</code>; (2) <code>fakeAsync</code> + <code>tick(ms)</code> / <code>flush()</code> / <code>flushMicrotasks()</code> to control time without waiting (needs zone.js testing; for zoneless use fake timers of the runner); (3) <code>waitForAsync</code> (legacy-ish helper). <b>Testing Observables</b>: convert with <code>firstValueFrom</code>/<code>lastValueFrom</code> and await, or collect emissions; use RxJS <code>TestScheduler</code> marble tests for time-based operators (debounce, switchMap). <b>Testing Signals</b>: signals are synchronous, so write/read them directly; <code>computed</code> recomputes on read; effects run during change detection, so call <code>TestBed.tick()</code> (v20; earlier <code>TestBed.flushEffects()</code>) or <code>fixture.detectChanges()</code>. <b>Testing error handling</b>: make the fake throw (<code>throwError(() => new Error('x'))</code>) and assert the error message, state or fallback.`,
          `// fakeAsync + debounce
it('searches after 300 ms', fakeAsync(() => {
  const api = jasmine.createSpyObj('Api', ['search']); api.search.and.returnValue(of([]));
  const cmp = createSearchComponent(api);
  cmp.query.set('ang');
  tick(299); expect(api.search).not.toHaveBeenCalled();
  tick(1);   expect(api.search).toHaveBeenCalledWith('ang');
}));

// observable with await
it('emits user list', async () => {
  const users = await firstValueFrom(service.users$);
  expect(users.length).toBe(1);
});

// signals
it('computes total', () => {
  const cart = TestBed.inject(CartStore);
  cart.add({ price: 10 }); cart.add({ price: 5 });
  expect(cart.total()).toBe(15);                         // no async needed
});

// error handling
it('shows message when API fails', async () => {
  api.load.and.returnValue(throwError(() => new Error('boom')));
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Could not load users');
});`,
        ),
        blk(`<h3>Marble test example</h3>
Marbles describe streams over virtual time: <code>-</code> is a frame, letters are values, <code>|</code> completes, <code>#</code> errors.`,
          `it('debounces', () => {
  new TestScheduler((a, e) => expect(a).toEqual(e)).run(({ cold, expectObservable }) => {
    const src = cold('a-b-c---|');
    expectObservable(src.pipe(debounceTime(2))).toBe('------c-|');   // only the last value within 2 frames
  });
});`,
        ),
      ],
      [
        blk(`<h3>Details and pitfalls</h3>
• <b>Jest/Vitest equivalents</b>: <code>jest.useFakeTimers()</code> + <code>jest.advanceTimersByTime</code> / <code>vi.useFakeTimers()</code> replace <code>fakeAsync/tick</code> when zone.js testing is not set up; <code>jest.spyOn(service, 'x').mockReturnValue(...)</code> vs Jasmine <code>spyOn(service, 'x').and.returnValue(...)</code>. Tests that mix <code>fakeAsync</code> with real timers or pending periodic timers fail with "1 periodic timer(s) still in the queue": call <code>discardPeriodicTasks()</code> or <code>flush()</code>.<br>
• Do not use <code>subscribe</code> with <code>done</code> callbacks and forget failures; <code>firstValueFrom</code> is cleaner. An observable that never completes will hang <code>lastValueFrom</code>.<br>
• <b>Spies vs stubs vs fakes</b>: prefer small hand-written fakes (an in-memory repository) for complex collaborators, spies for verifying interactions. Over-mocking couples tests to implementation; verify outcomes first.<br>
• Signal <code>effect()</code> timing: effects are scheduled; in zoneless tests, <code>await fixture.whenStable()</code> flushes them. For <code>toSignal</code> you need an injection context (<code>TestBed.runInInjectionContext</code>).<br>
• Use <code>HttpTestingController</code> or MSW rather than mocking <code>HttpClient</code> itself when the HTTP details (URL, headers, body) matter.<br>
• Always assert that errors are handled without unhandled rejections; Jasmine fails on unhandled promise rejections in newer versions.`,
        ),
        blk(`<h3>Testing strategy for async code</h3>
Make time injectable: pass a scheduler or use <code>asyncScheduler</code> override, wrap <code>Date.now</code> in a clock service, and keep timing operators at the edges. Pure signal/computed logic needs no async handling at all, one more reason to keep state in signals.`,
        ),
      ],
      [
        ['Spy vs stub vs mock?', 'A stub supplies canned responses; a spy wraps a function or object to record calls (and can also return values); a mock is a pre-programmed object with expectations (Mockito-style). In Jasmine/Jest, spies cover most needs.'],
        ['How does fakeAsync work?', 'It runs the test in a zone that virtualizes timers and microtasks. tick(ms) advances virtual time, flush() runs all pending timers, so time-based code is tested instantly and deterministically.'],
        ['How do you test an RxJS stream with debounce?', 'Use fakeAsync/tick or fake timers, or RxJS TestScheduler marble tests with virtual time and assert the expected marble diagram.'],
        ['How do you test signals and effects?', 'Read and write signals directly because they are synchronous; for effects trigger scheduling with fixture.detectChanges, TestBed.tick (or flushEffects in older versions) or whenStable.'],
        ['How do you test error paths?', 'Have the fake dependency return throwError or reject, then assert that the UI shows the message, state flags are set and no unhandled error is thrown.'],
      ],
    ),

    topic(
      'ngs-m20-forms-http-router-a11y',
      L20d,
      [
        blk(`<h3>Testing the building blocks of real apps</h3>
• <b>Testing forms</b>: set a control value, check <code>valid/invalid</code> and the error message shown.<br>
• <b>Testing validators</b>: a validator is just a function; call it with a <code>FormControl</code>.<br>
• <b>Testing HTTP services</b>: never hit the network; use <code>provideHttpClientTesting()</code> and <b>HttpTestingController</b> to intercept requests and answer them with fake data, like a mock server.`,
          `// email validator test
it('rejects emails without @', () => {
  const result = emailDomainValidator('corp.com')(new FormControl('abc'));
  expect(result).toEqual({ domain: true });
});

// reactive form test
it('marks form invalid when empty', () => {
  const f = fixture.componentInstance;
  f.form.setValue({ email: '', password: '' });
  expect(f.form.valid).toBeFalse();      // toBe(false) in Jest/Vitest
});`,
        ),
      ],
      [
        blk(`<h3>HTTP, guards, resolvers and router</h3>
Provide <code>provideHttpClient()</code> then <code>provideHttpClientTesting()</code>. Use <code>expectOne(url)</code> to find the request, check method/headers/body, <code>flush(data)</code> to answer (or <code>flush(msg, { status: 500, statusText: '...' })</code> for errors) and finally <code>verify()</code> to be sure no unexpected requests remain.<br>
<b>Testing route guards</b> and <b>resolvers</b> (functional): run them inside <code>TestBed.runInInjectionContext</code> with fake services. <b>Router testing</b>: use <code>RouterTestingHarness</code> (v15+) with <code>provideRouter(routes)</code> to navigate and get the activated component; stub child components or lazy routes as needed.`,
          `// product.service.spec.ts
beforeEach(() => TestBed.configureTestingModule({
  providers: [provideHttpClient(), provideHttpClientTesting()],
}));

it('GETs products', () => {
  const svc = TestBed.inject(ProductService);
  const http = TestBed.inject(HttpTestingController);
  let result: Product[] = [];
  svc.list().subscribe(r => (result = r));

  const req = http.expectOne('/api/products');
  expect(req.request.method).toBe('GET');
  req.flush([{ id: 1, name: 'Pen' }]);                    // fake server response
  expect(result.length).toBe(1);
  http.verify();                                            // no outstanding requests
});

it('handles 500', () => {
  svc.list().subscribe({ error: e => (status = e.status) });
  http.expectOne('/api/products').flush('fail', { status: 500, statusText: 'Server Error' });
  expect(status).toBe(500);
});`,
          `// auth.guard.spec.ts
it('redirects anonymous users to /login', () => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: { user: () => null } }],
  });
  const result = TestBed.runInInjectionContext(() => authGuard({} as any, { url: '/orders' } as any));
  expect(result instanceof UrlTree).toBeTrue();
});

// router test
it('navigates to the order page', async () => {
  const harness = await RouterTestingHarness.create();
  const cmp = await harness.navigateByUrl('/orders/7', OrderDetailComponent);
  expect(cmp.id()).toBe('7');
});`,
        ),
        blk(`<h3>Accessibility testing</h3>
<b>Accessibility testing</b>: run <code>axe-core</code> (via <code>jest-axe</code>, <code>axe-playwright</code> or <code>@axe-core/playwright</code>) on rendered components/pages, assert roles and labels (<code>getByRole</code>), verify keyboard operation (Tab, Enter, Escape), focus return after dialogs, and <code>aria-live</code> messages. Automated tools catch a portion of issues; combine with manual screen-reader checks.`,
          `// Playwright + axe
import AxeBuilder from '@axe-core/playwright';
test('home page has no detectable a11y violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});`,
        ),
      ],
      [
        blk(`<h3>Depth and pitfalls</h3>
• Register interceptors in tests with <code>provideHttpClient(withInterceptors([myInterceptor]))</code> to test them through real HttpClient plus the testing backend; assert the cloned request headers on the matched <code>req.request</code>.<br>
• For async validators use <code>fakeAsync</code> + <code>tick</code>; for cross-field validators build a <code>FormGroup</code> and assert errors on the group.<br>
• Resolvers returning Observables: <code>await firstValueFrom(result as Observable&lt;T&gt;)</code>. Functions may return value, Promise or Observable; normalise in the test.<br>
• <code>RouterTestingHarness</code> performs real navigation with guards and resolvers, so it doubles as an integration test of route config. Use <code>RouterModule.forRoot</code> mocks only in legacy code.<br>
• <code>http.verify()</code> in <code>afterEach</code> catches forgotten requests; remember <code>expectOne</code> fails if there are two matching requests (use <code>match</code>).<br>
• Testing forms: dispatch real <code>input</code> events to test template-driven <code>ngModel</code> (it updates asynchronously: <code>await fixture.whenStable()</code>); reactive forms can be tested via the model alone, plus a few DOM checks for error messages and disabled buttons.<br>
• Real backend: a handful of E2E tests against Spring Boot (using Testcontainers or a seeded test database) verify CORS, security rules and DTO mapping which front-end unit tests cannot.<br>
• Coverage on guards/resolvers/validators is cheap and high value, because they are pure functions.`,
        ),
        blk(`<h3>Test-suite hygiene</h3>
Keep one assertion theme per test, share builders (e.g. <code>buildUser({ role: 'ADMIN' })</code>), do not depend on test order, and clean up with <code>afterEach</code>. Run tests in random order if the runner supports it to expose hidden coupling.`,
        ),
      ],
      [
        ['How do you test a service that uses HttpClient?', 'Provide provideHttpClient and provideHttpClientTesting, call the method, use HttpTestingController.expectOne to assert the request, flush a fake response, and call verify().'],
        ['What does HttpTestingController.verify() do?', 'It asserts that no unmatched or unexpected HTTP requests are outstanding, catching forgotten or extra requests.'],
        ['How do you unit-test a functional route guard?', 'Configure TestBed with fake services and call the guard inside TestBed.runInInjectionContext, then assert the boolean or UrlTree result.'],
        ['How do you test routing?', 'Use RouterTestingHarness with provideRouter(routes): navigateByUrl returns the activated component so you can assert state, with guards and resolvers executed for real.'],
        ['How do you test a custom validator?', 'Call the validator function with a FormControl or FormGroup holding test values and assert the returned error object or null; async validators need fakeAsync or await.'],
        ['What can automated accessibility tests not do?', 'Axe finds a subset of issues (missing labels, contrast, roles). Keyboard flow, focus management and screen-reader experience still need manual verification.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 21
const L21a = 'Responsive layout, CSS architecture and encapsulation';
const L21b = 'Angular Material and the CDK';
const L21c = 'Bootstrap, Tailwind, design systems and theming';
const L21d = 'UI patterns: navigation, dialogs, tables and accessibility';

const module21: SubTopic = {
  id: 'ngs-mod-21',
  name: 'Module 21 · Angular UI Development',
  topics: [
    overview(21, 'Angular UI Development', [
      ['Responsive UI design', 'Layouts adapt to any screen size (mobile first).', L21a],
      ['Component-based UI architecture', 'Build screens from small reusable components.', L21a],
      ['CSS architecture', 'Organise styles: tokens, global, component, utilities.', L21a],
      ['CSS Flexbox and Grid', 'One-dimensional and two-dimensional layout systems.', L21a],
      ['Angular component styling', 'styles/styleUrl scoped to a component.', L21a],
      ['View encapsulation', 'Emulated, None and ShadowDom modes.', L21a],
      ['CSS custom properties', 'Runtime variables that pierce encapsulation.', L21a],
      ['Angular Material', 'Official Material Design component library.', L21b],
      ['Material components', 'Buttons, cards, chips, snackbars, tabs and more.', L21b],
      ['Material tables', 'mat-table with sort and paginator.', L21b],
      ['Material dialogs', 'MatDialog for modal windows.', L21b],
      ['Material forms', 'mat-form-field, inputs, selects, datepickers.', L21b],
      ['Material navigation', 'Toolbar, sidenav, menu, tabs.', L21b],
      ['CDK fundamentals', 'Unstyled behaviour building blocks.', L21b],
      ['CDK overlays', 'Floating panels positioned over the page.', L21b],
      ['CDK accessibility', 'FocusTrap, LiveAnnouncer, FocusMonitor, ListKeyManager.', L21b],
      ['CDK drag and drop', 'cdkDrag, cdkDropList for reordering.', L21b],
      ['Bootstrap with Angular', 'Use Bootstrap CSS or ng-bootstrap components.', L21c],
      ['Tailwind CSS with Angular', 'Utility-first CSS integrated in the build.', L21c],
      ['Reusable UI components', 'Button, card, input wrappers with inputs/outputs.', L21c],
      ['Design systems', 'Tokens, components and rules shared across apps.', L21c],
      ['Theming and dark mode', 'CSS variables, Material themes, prefers-color-scheme.', L21c],
      ['Responsive navigation', 'Sidebar on desktop, drawer on mobile.', L21d],
      ['Modal and popup design', 'Dialog, popover, tooltip patterns and focus.', L21d],
      ['Data tables', 'Structured tabular display with actions.', L21d],
      ['Pagination', 'Page through large result sets.', L21d],
      ['Sorting and filtering', 'Order and narrow rows, ideally on the server.', L21d],
      ['Accessibility and keyboard navigation', 'Everything reachable and operable via keyboard.', L21d],
      ['ARIA attributes', 'Roles, states and properties for assistive tech.', L21d],
      ['UI testing', 'Component, harness, visual and E2E tests of the UI.', L21d],
    ]),

    topic(
      'ngs-m21-layout-css-encapsulation',
      L21a,
      [
        blk(`<h3>Building screens that fit every device</h3>
<b>Responsive UI design</b> means one codebase looks good on a phone, a tablet and a desktop, like water taking the shape of its glass. Start <b>mobile first</b> (simple one-column layout) and add rules for larger screens with media queries. <b>Component-based UI architecture</b> means the screen is a tree of small components (header, card, button), each responsible for one thing and reusable.<br>
Two layout tools: <b>Flexbox</b> arranges items in one direction (a row or a column), <b>Grid</b> arranges in rows and columns at once.`,
          `/* product-list.component.css */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));   /* as many columns as fit */
  gap: 1rem;
}
.toolbar { display: flex; justify-content: space-between; align-items: center; gap: .5rem; flex-wrap: wrap; }
@media (min-width: 768px) { .toolbar { gap: 1.5rem; } }`,
        ),
      ],
      [
        blk(`<h3>Component styling, encapsulation, CSS architecture and variables</h3>
<b>Angular component styling</b>: styles in <code>styles</code> / <code>styleUrl</code> apply only to that component. <b>View encapsulation</b> controls it: <code>Emulated</code> (default; Angular adds attributes like <code>_ngcontent-abc</code> to scope rules), <code>None</code> (styles become global), <code>ShadowDom</code> (native Shadow DOM, real isolation). Use <code>:host</code> to style the component's own element, <code>:host-context(.dark)</code> for theme ancestors, and avoid the deprecated <code>::ng-deep</code> (it still works but is deprecated; prefer CSS variables or exposed classes).<br>
<b>CSS custom properties</b> (<code>--brand</code>) are inherited at runtime and cross encapsulation boundaries, making them the right API for theming components.<br>
<b>CSS architecture</b> (layers): (1) design tokens as variables in <code>:root</code>, (2) global reset/typography in <code>styles.css</code>, (3) layout utilities, (4) component styles co-located, (5) optional utility framework. Use a naming convention (BEM) for global classes and keep specificity low. Use <code>@layer</code> to control order.`,
          `/* styles.css - tokens and global layer */
:root {
  --color-brand: #2563eb;
  --space-2: .5rem;
  --radius: 8px;
}
@media (prefers-color-scheme: dark) { :root { --color-bg: #0b1020; --color-text: #e5e7eb; } }`,
          `// card.component.ts
@Component({
  selector: 'app-card',
  encapsulation: ViewEncapsulation.Emulated,      // default
  template: '<div class="card"><ng-content /></div>',
  styles: [':host { display: block; } .card { border-radius: var(--radius); border: 1px solid var(--color-border, #ddd); padding: var(--space-2); }'],
})
export class CardComponent {}`,
        ),
        blk(`<h3>Responsive tools in Angular</h3>
Use CSS first (media/container queries). When logic needs breakpoints, the CDK <code>BreakpointObserver</code> gives an Observable; convert to a signal with <code>toSignal</code> and branch with <code>@if</code>.`,
          `private bp = inject(BreakpointObserver);
isHandset = toSignal(this.bp.observe(Breakpoints.Handset).pipe(map(r => r.matches)), { initialValue: false });
// template: @if (isHandset()) { <app-bottom-nav /> } @else { <app-side-nav /> }`,
        ),
      ],
      [
        blk(`<h3>Deeper notes</h3>
• Emulated encapsulation does not style child component internals; do not fight it with <code>::ng-deep</code> globally. Expose variables (<code>--card-bg</code>) from the child. Content projected via <code>ng-content</code> belongs to the parent's scope, so parent styles apply.<br>
• ShadowDom encapsulation blocks global CSS (including Bootstrap/Tailwind) from reaching inside; usually desirable only for widgets (Angular Elements).<br>
• Style budgets matter: big component CSS is duplicated per component instance type only once, but huge style bundles slow parsing; use shared partials via <code>@use</code> (Sass) sparingly and avoid importing large files in every component.<br>
• Prefer <b>logical properties</b> (<code>margin-inline</code>, <code>padding-block</code>) for RTL, <b>rem</b> units for accessibility scaling, <b>container queries</b> (<code>@container</code>) so components respond to their own width rather than the viewport (supported in all modern browsers).<br>
• Avoid layout thrashing and animating width/height; animate <code>transform</code>/<code>opacity</code>. Respect <code>prefers-reduced-motion</code>.<br>
• Flexbox vs Grid: Flexbox for content-driven one-dimensional alignment (toolbars, nav), Grid for page and card layouts; they nest well. Use <code>gap</code> instead of margins.<br>
• Keep component styles small, with no hard-coded colours; consume tokens. Angular's <code>animations</code> package is legacy-ish in v20.2+ in favour of CSS <code>animate.enter/leave</code> (check your version).`,
        ),
        blk(`<h3>Structure of a UI codebase</h3>
<code>ui/</code> (dumb reusable components), <code>features/</code> (screens using them), <code>styles/</code> (tokens, mixins, themes). Presentational components accept inputs and emit outputs only, are OnPush, and are visually tested in isolation (Storybook).`,
        ),
      ],
      [
        ['Explain Angular view encapsulation modes.', 'Emulated (default) scopes styles using generated attributes, None makes styles global, ShadowDom uses the browser shadow root for true isolation.'],
        ['How can a parent theme a child component without ng-deep?', 'Expose CSS custom properties from the child (var(--card-bg)) and set them on the parent or host; custom properties inherit through encapsulation.'],
        ['Flexbox or Grid?', 'Flexbox for one-dimensional alignment and distribution (rows of buttons, navbars); Grid for two-dimensional layouts (page areas, card galleries). Combine them.'],
        ['What does :host do?', 'It targets the component host element from inside the component styles, e.g. :host { display: block; }.'],
        ['What is mobile-first responsive design?', 'Write base styles for small screens, then enhance with min-width media queries or container queries for larger ones.'],
      ],
    ),

    topic(
      'ngs-m21-material-cdk',
      L21b,
      [
        blk(`<h3>Ready-made building blocks</h3>
<b>Angular Material</b> is the official component library implementing Google's Material Design: buttons, cards, form fields, tables, dialogs, menus. Add with <code>ng add @angular/material</code>. Under it sits the <b>CDK (Component Dev Kit)</b>: unstyled behaviour such as overlays, drag and drop, accessibility helpers, virtual scrolling. Think of Material as a furnished flat and the CDK as the plumbing and wiring you can use to build your own flat.<br>
<b>Material components</b> are standalone: import only what you use in <code>imports</code>.`,
          `// hello.component.ts
@Component({
  selector: 'app-hello',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: '<mat-card><mat-card-content>Hello</mat-card-content><button mat-flat-button color="primary"><mat-icon>add</mat-icon> Add</button></mat-card>',
})
export class HelloComponent {}`,
        ),
      ],
      [
        blk(`<h3>Tables, dialogs, forms and navigation</h3>
<b>Material tables</b>: <code>mat-table</code> with a <code>MatTableDataSource</code>, <code>matSort</code>, <code>mat-paginator</code>. <b>Material dialogs</b>: inject <code>MatDialog</code>, <code>open(Component, { data })</code>, and read <code>afterClosed()</code>. <b>Material forms</b>: <code>mat-form-field</code> wraps <code>matInput</code>, <code>mat-select</code>, <code>mat-datepicker</code> with <code>mat-label</code>, <code>mat-error</code> and <code>mat-hint</code>; works with Reactive Forms. <b>Material navigation</b>: <code>mat-toolbar</code>, <code>mat-sidenav-container</code>, <code>mat-menu</code>, <code>mat-tab-group</code>, <code>mat-nav-list</code> with <code>routerLink</code>.`,
          `// users-table.component.ts
displayed = ['id', 'name', 'email'];
ds = new MatTableDataSource<User>([]);
sort = viewChild.required(MatSort);
paginator = viewChild.required(MatPaginator);
constructor() { afterNextRender(() => { this.ds.sort = this.sort(); this.ds.paginator = this.paginator(); }); }
applyFilter(v: string) { this.ds.filter = v.trim().toLowerCase(); }`,
          `<!-- users-table.component.html -->
<mat-form-field><mat-label>Filter</mat-label><input matInput (input)="applyFilter($any($event.target).value)"></mat-form-field>
<table mat-table [dataSource]="ds" matSort>
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
    <td mat-cell *matCellDef="let u">{{ u.name }}</td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="displayed"></tr>
  <tr mat-row *matRowDef="let row; columns: displayed"></tr>
</table>
<mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons />`,
        ),
        blk(`<h3>Dialog service pattern</h3>`,
          `confirm(msg: string) {
  return this.dialog.open(ConfirmDialogComponent, { data: { msg }, width: '360px', autoFocus: 'first-tabbable' })
    .afterClosed();                                // Observable<boolean | undefined>
}
// ConfirmDialogComponent: inject(MAT_DIALOG_DATA), buttons use [mat-dialog-close]="true"`,
        ),
      ],
      [
        blk(`<h3>CDK in depth</h3>
• <b>CDK fundamentals</b>: behaviour without styling. Modules/APIs: <code>a11y</code>, <code>overlay</code>, <code>portal</code>, <code>drag-drop</code>, <code>scrolling</code>, <code>table</code>, <code>layout</code>, <code>testing</code> (harnesses), <code>clipboard</code>, <code>menu</code>, <code>listbox</code>, <code>stepper</code>.<br>
• <b>CDK overlays</b>: <code>Overlay.create({ positionStrategy, scrollStrategy, hasBackdrop })</code> returns an <code>OverlayRef</code>; attach a <code>ComponentPortal</code>/<code>TemplatePortal</code>. Position strategies: global (centered) and flexible connected (anchored to an element with fallbacks). Material dialogs, menus, tooltips, selects and autocompletes are built on it. Always dispose the overlay.<br>
• <b>CDK accessibility</b>: <code>cdkTrapFocus</code> keeps Tab inside a modal; <code>FocusMonitor</code> knows if focus came from keyboard, mouse or program; <code>LiveAnnouncer.announce()</code> speaks text to screen readers; <code>ListKeyManager</code>/<code>ActiveDescendantKeyManager</code> give arrow-key navigation; <code>cdkAriaLive</code>.<br>
• <b>CDK drag and drop</b>: <code>cdkDropList</code> + <code>cdkDrag</code>, <code>(cdkDropListDropped)</code> with <code>moveItemInArray</code>/<code>transferArrayItem</code>; supports handles, previews, placeholders, connected lists (Kanban).`,
          `<div cdkDropList (cdkDropListDropped)="drop($event)">
  @for (t of tasks(); track t.id) { <div cdkDrag class="task">{{ t.title }}</div> }
</div>`,
          `drop(e: CdkDragDrop<Task[]>) {
  const list = [...this.tasks()];
  moveItemInArray(list, e.previousIndex, e.currentIndex);   // reorder
  this.tasks.set(list);                                      // keep state immutable (signal)
}

// simple overlay
const ref = this.overlay.create({
  positionStrategy: this.overlay.position().flexibleConnectedTo(button).withPositions([
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
  ]),
  scrollStrategy: this.overlay.scrollStrategies.reposition(),
});
ref.attach(new ComponentPortal(PopoverComponent));
// later: ref.dispose();`,
        ),
        blk(`<h3>Pitfalls and version notes</h3>
• Import Material only per component; global <code>MatModule</code> imports are legacy. Material 3 (v18+) theming uses Sass mixins (<code>mat.theme</code> in v19/20) and CSS system variables (<code>--mat-sys-*</code>); older M2 palettes (<code>mat.define-light-theme</code>) are legacy. Theming APIs changed between v17, v18, v19 and v20: read the guide for your version.<br>
• <code>MatTableDataSource</code> is client-side; for server-side paging implement your own <code>DataSource</code>/signal list and drive <code>matSort</code>/<code>mat-paginator</code> events to the API. Many rows: add virtual scroll or paginate.<br>
• Wrap dialog opening in a service so UI code stays testable; use <code>MatDialogHarness</code> in tests. Return focus is handled by default.<br>
• Animations: Material needs <code>provideAnimationsAsync()</code> (or no-op animations) in older versions; newer versions reduce this dependency.`,
        ),
      ],
      [
        ['Angular Material vs CDK?', 'Material is a styled component library following Material Design. The CDK is the unstyled behavioural layer (overlay, a11y, drag-drop, virtual scroll, table) that Material is built on and that you can use to craft your own components.'],
        ['How do you open a dialog and get its result?', 'Inject MatDialog, call open(Component, { data }), subscribe to afterClosed() (or convert to a promise). The dialog closes with [mat-dialog-close] or dialogRef.close(value).'],
        ['How do Material tables support sorting and pagination?', 'Use MatTableDataSource and attach MatSort and MatPaginator to it for client-side work; for server-side data, listen to sort/page events and fetch from the API.'],
        ['What is a CDK overlay?', 'A floating pane rendered at the document body level with a position strategy and scroll strategy, hosting a portal; it powers dialogs, menus, tooltips and selects.'],
        ['Which CDK utilities help accessibility?', 'FocusTrap, FocusMonitor, LiveAnnouncer, ListKeyManager, and a11y-focused harnesses; they handle focus and keyboard navigation patterns correctly.'],
      ],
    ),

    topic(
      'ngs-m21-frameworks-design-systems-theming',
      L21c,
      [
        blk(`<h3>Choosing a look and feel</h3>
• <b>Bootstrap with Angular</b>: add Bootstrap CSS (or Sass) for grid, utilities and styled components; use <b>ng-bootstrap</b> or <b>ngx-bootstrap</b> for components so you do not rely on Bootstrap's jQuery-style JavaScript.<br>
• <b>Tailwind CSS with Angular</b>: utility classes in templates (<code>class="flex gap-2 p-4"</code>); the build scans files and ships only used classes.<br>
• <b>Reusable UI components</b>: wrap repeated markup (button with spinner, form field with label and error) in a component with inputs/outputs.<br>
• A <b>design system</b> collects tokens, components and guidelines so every team builds consistent screens.`,
          `# Tailwind v4 setup in Angular (v19+ CLI)
npm install tailwindcss @tailwindcss/postcss postcss
# .postcssrc.json: { "plugins": { "@tailwindcss/postcss": {} } }
# styles.css:  @import "tailwindcss";

<!-- usage -->
<button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Save</button>`,
        ),
      ],
      [
        blk(`<h3>Reusable components and theming</h3>
A reusable UI component is small, OnPush, driven by <code>input()</code>, communicates by <code>output()</code>, uses content projection for flexibility, hides styling behind variants, and uses tokens. <b>Theming and dark mode</b>: define colours as CSS custom properties; switch by toggling a class or <code>data-theme</code> attribute on <code>&lt;html&gt;</code>; default to <code>prefers-color-scheme</code> and remember the user's choice (localStorage, guarded for SSR). Material 3 themes provide the same via Sass mixins and <code>color-scheme</code>.`,
          `// button.component.ts - reusable component with variants
@Component({
  selector: 'ui-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<button class="btn" [attr.data-variant]="variant()" [disabled]="loading() || disabled()" (click)="pressed.emit()"><ng-content />@if (loading()) { <span class="spinner"></span> }</button>',
})
export class ButtonComponent {
  variant = input<'primary' | 'ghost' | 'danger'>('primary');
  loading = input(false);
  disabled = input(false);
  pressed = output<void>();
}`,
          `// theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private doc = inject(DOCUMENT);
  theme = signal<'light' | 'dark'>('light');
  constructor() {
    afterNextRender(() => {
      const saved = localStorage.getItem('theme');
      this.theme.set(saved === 'dark' || saved === 'light' ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });
    effect(() => {
      this.doc.documentElement.dataset['theme'] = this.theme();
      try { localStorage.setItem('theme', this.theme()); } catch {}
    });
  }
  toggle() { this.theme.update(t => (t === 'dark' ? 'light' : 'dark')); }
}`,
        ),
        blk(`<h3>Tokens in CSS</h3>`,
          `:root { --bg: #fff; --fg: #111827; --brand: #2563eb; color-scheme: light; }
:root[data-theme='dark'] { --bg: #0b1020; --fg: #e5e7eb; --brand: #60a5fa; color-scheme: dark; }
body { background: var(--bg); color: var(--fg); }`,
        ),
      ],
      [
        blk(`<h3>Choosing and combining</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"><thead><tr><th>Option</th><th>Strength</th><th>Watch out</th></tr></thead><tbody>
<tr><td>Angular Material</td><td>Accessible, official, consistent, themeable</td><td>Opinionated look; major theming changes between versions</td></tr>
<tr><td>Bootstrap (+ ng-bootstrap)</td><td>Familiar, quick, big ecosystem</td><td>Global CSS, generic look; avoid its JS bundle with Angular</td></tr>
<tr><td>Tailwind</td><td>Fast iteration, small CSS, custom designs</td><td>Long class lists; wrap in components; need headless/CDK for behaviour</td></tr>
<tr><td>PrimeNG / Spartan / others</td><td>Rich component sets</td><td>Evaluate license, a11y quality and maintenance</td></tr>
</tbody></table><br>
• Mixing Material and Tailwind is common (Tailwind for layout, Material for components); set Tailwind <code>preflight</code> carefully to avoid resetting Material styles.<br>
• Design system practice: tokens (colour, spacing, type, radius, elevation) in a single source (JSON or CSS), components as a versioned library, documentation in Storybook with accessibility checks, visual regression tests (Chromatic/Playwright snapshots), and contribution rules. Build design-system components on CDK primitives to inherit accessibility.<br>
• Dark mode traps: hard-coded colours, images with white backgrounds, insufficient contrast in one theme, flash of wrong theme (set the attribute early via inline script or SSR cookie), third-party widgets ignoring tokens. Test contrast in both themes.<br>
• Do not duplicate Bootstrap's grid and Angular Material layout both: pick one system per concern. Avoid overriding framework internals with <code>!important</code>; use tokens or wrapper components.`,
        ),
        blk(`<h3>Governance</h3>
Version the UI library separately, deprecate with codemods or schematics, and test visual changes. A thin adapter layer (<code>ui-button</code> rather than direct <code>mat-button</code> everywhere) lets you swap or update underlying libraries with one change.`,
        ),
      ],
      [
        ['How do you add Tailwind to an Angular project?', 'Install tailwindcss with its PostCSS plugin, configure PostCSS (.postcssrc.json), import Tailwind in styles.css and use utility classes in templates. Exact setup depends on the Tailwind and Angular versions.'],
        ['Why prefer ng-bootstrap over Bootstrap JS?', 'ng-bootstrap implements components natively in Angular without jQuery or Bootstrap JS DOM manipulation, so it integrates with change detection and the template system.'],
        ['How do you implement dark mode?', 'Define colours as CSS custom properties, switch a data-theme attribute or class on the root element, respect prefers-color-scheme, persist the choice and avoid a flash by applying it early.'],
        ['What makes a UI component reusable?', 'Clear inputs and outputs, content projection, no hard-wired services or styles, token-based styling, accessibility built in, OnPush and documentation/tests.'],
        ['What is a design system?', 'A set of design tokens, reusable components and usage guidelines shared across products to keep UI consistent and speed development.'],
      ],
    ),

    topic(
      'ngs-m21-ui-patterns-a11y-testing',
      L21d,
      [
        blk(`<h3>Everyday UI patterns</h3>
• <b>Responsive navigation</b>: a sidebar on large screens becomes a hamburger drawer on phones.<br>
• <b>Modal and popup design</b>: a modal blocks the page for a focused task; a popover or tooltip is lightweight and non-blocking. Always provide a clear close action and Escape.<br>
• <b>Data tables</b> show records; <b>pagination</b> splits them into pages; <b>sorting and filtering</b> help find rows.<br>
• <b>Accessibility and keyboard navigation</b>: everything must work with Tab, Shift+Tab, Enter, Space, Arrow keys and Escape.<br>
• <b>ARIA attributes</b> describe roles and states to screen readers when native HTML is not enough (prefer native elements first).`,
          `<!-- native first: no ARIA needed -->
<button type="button" (click)="save()">Save</button>

<!-- custom widget: ARIA required -->
<div role="tablist">
  <button role="tab" [attr.aria-selected]="tab() === 'a'" aria-controls="panel-a" id="tab-a">Details</button>
</div>
<div role="tabpanel" id="panel-a" aria-labelledby="tab-a"></div>`,
        ),
      ],
      [
        blk(`<h3>Navigation, tables with server-side paging, dialogs</h3>
Responsive navigation: Material sidenav in <code>over</code> mode on handsets and <code>side</code> on desktop. Data tables: semantic <code>&lt;table&gt;</code> with <code>&lt;th scope&gt;</code>, a caption, sticky header, loading and empty states. Pagination, sorting and filtering for large data belong on the <b>server</b> (Spring <code>Pageable</code>: <code>?page=0&size=20&sort=name,asc&q=ann</code>); keep the state in the URL query params so views are shareable and the back button works.`,
          `// products.component.ts - server-driven table state in signals
page = signal(0); size = signal(20); sort = signal('name,asc'); q = signal('');
params = computed(() => ({ page: this.page(), size: this.size(), sort: this.sort(), q: this.q() }));
data = toSignal(
  toObservable(this.params).pipe(
    debounceTime(250),
    switchMap(p => this.http.get<Page<Product>>('/api/products', { params: p })),     // cancels stale requests
  ),
  { initialValue: null },
);
changeSort(col: string) { this.sort.update(s => (s === col + ',asc' ? col + ',desc' : col + ',asc')); this.page.set(0); }`,
          `<!-- sidenav switches mode by screen size -->
<mat-sidenav-container>
  <mat-sidenav [mode]="isHandset() ? 'over' : 'side'" [opened]="!isHandset()">
    <mat-nav-list><a mat-list-item routerLink="/home" routerLinkActive="active">Home</a></mat-nav-list>
  </mat-sidenav>
  <mat-sidenav-content><router-outlet /></mat-sidenav-content>
</mat-sidenav-container>`,
        ),
        blk(`<h3>Keyboard and ARIA essentials, focus in dialogs, UI testing</h3>
Dialog checklist: <code>role="dialog"</code> (or <code>alertdialog</code>), <code>aria-modal="true"</code>, labelled by its title, focus moves inside on open, Tab is trapped, <b>Escape</b> closes, focus returns to the trigger. Use <code>aria-live="polite"</code> for async messages, <code>aria-expanded</code>/<code>aria-controls</code> for disclosure buttons, <code>aria-sort</code> on sorted column headers, <code>aria-current="page"</code> on the active link, and <code>aria-label</code> for icon-only buttons.<br>
<b>UI testing</b>: component tests with harnesses, a11y checks with axe, visual regression with Playwright screenshots or Storybook/Chromatic, E2E for critical flows and responsive viewport tests (<code>page.setViewportSize</code>).`,
          `<button type="button" aria-label="Close dialog" (click)="close()"><mat-icon>close</mat-icon></button>
<th scope="col" [attr.aria-sort]="sortCol() === 'name' ? (asc() ? 'ascending' : 'descending') : 'none'">
  <button (click)="toggleSort('name')">Name</button>
</th>
<div aria-live="polite">{{ statusMessage() }}</div>`,
          `// component test with harness
it('opens the menu with the keyboard', async () => {
  const loader = TestbedHarnessEnvironment.loader(fixture);
  const menu = await loader.getHarness(MatMenuHarness);
  await menu.open();
  expect((await menu.getItems()).length).toBe(3);
});`,
        ),
      ],
      [
        blk(`<h3>Depth and pitfalls</h3>
• First rule of ARIA: do not use ARIA if a native element does it (<code>button</code>, <code>a</code>, <code>select</code>, <code>dialog</code>). Wrong ARIA is worse than none. The native <code>&lt;dialog&gt;</code> element (<code>showModal()</code>) now handles focus trapping and Escape and is a valid base for modals.<br>
• Keyboard patterns follow the WAI-ARIA Authoring Practices: tabs use arrow keys with roving <code>tabindex</code>; menus use arrows, Home/End and type-ahead; use CDK <code>ListKeyManager</code> instead of reinventing.<br>
• Never remove focus outlines without a replacement; use <code>:focus-visible</code>. Provide skip links ("Skip to content") and a logical DOM order. Touch targets at least 44x44 px (WCAG 2.2: 24x24 minimum).<br>
• Data tables: avoid putting interactive elements in every cell without labels; for very wide tables allow horizontal scroll in a focusable region (<code>tabindex="0"</code> with label) or switch to card layout on mobile. Announce sort changes and result counts via live regions.<br>
• Pagination vs infinite scroll: pagination is better for orientation, keyboard use and footer access; infinite scroll needs "load more" fallback and focus management.<br>
• Modals: avoid stacking modals; prefer inline editing, drawers or separate routes for complex flows (so the URL and back button work). Use a route-based dialog for deep-linkable screens.<br>
• Test with real usage: keyboard only, 200 percent zoom, screen readers (NVDA, VoiceOver), reduced motion, high contrast. Automated axe covers maybe a third of WCAG issues.<br>
• Filtering with debounce, cancellation (<code>switchMap</code>) and reset-to-first-page on change avoid stale and empty-page bugs.`,
        ),
        blk(`<h3>UI testing pyramid</h3>
Unit-test logic (sort/page state), component-test rendering and events with harnesses, visual-regression key states (empty, loading, error, dark mode, mobile), and keep a few Playwright journeys for responsive nav, dialogs and tables against a seeded backend.`,
        ),
      ],
      [
        ['How would you implement a data table for 100k rows?', 'Server-side pagination, sorting and filtering through the Spring API (Pageable), keep state in signals or URL params, debounce and cancel stale requests, show loading/empty/error states, and use virtual scroll only for in-memory lists.'],
        ['What makes a modal accessible?', 'Role dialog and aria-modal, accessible name, focus moved in and trapped, Escape closes, focus restored to the trigger, background inert. CDK/Material dialogs or native dialog handle most of this.'],
        ['When should you use ARIA?', 'Only when native HTML cannot express the semantics (custom tabs, comboboxes). Use correct roles, states and keyboard behaviour; wrong ARIA harms accessibility.'],
        ['How do you build responsive navigation in Angular?', 'CSS for layout plus BreakpointObserver to switch Material sidenav mode (over on mobile, side on desktop), a hamburger toggle, and routerLinkActive for the current page.'],
        ['How do you test UI in Angular?', 'Component tests with TestBed and harnesses, axe for accessibility, visual regression snapshots, and Playwright/Cypress for end-to-end flows at multiple viewport sizes.'],
      ],
    ),
  ],
};

// ---------------------------------------------------------------- Module 22
const L22a = 'Browser architecture, DOM and storage';
const L22b = 'Device and user-interaction APIs';
const L22c = 'Background work, live channels, history and observers';
const L22d = 'Compatibility, permissions and secure API usage';

const module22: SubTopic = {
  id: 'ngs-mod-22',
  name: 'Module 22 · Browser APIs and Storage',
  topics: [
    overview(22, 'Browser APIs and Storage', [
      ['Browser architecture', 'Rendering engine, JS engine, networking, storage, event loop.', L22a],
      ['DOM APIs', 'Tree of nodes you can query and change.', L22a],
      ['Window and Document', 'Global browser objects and the page document.', L22a],
      ['LocalStorage', 'Persistent string key-value store per origin.', L22a],
      ['SessionStorage', 'Per-tab string store cleared when the tab closes.', L22a],
      ['IndexedDB', 'Asynchronous structured database for large data.', L22a],
      ['Cookies', 'Small key-values sent automatically with requests.', L22a],
      ['Cookie security', 'HttpOnly, Secure, SameSite, Path, Domain, expiry.', L22a],
      ['Clipboard API', 'Copy and paste text programmatically.', L22b],
      ['Geolocation API', 'Get the user position with consent.', L22b],
      ['Notifications API', 'Show system notifications.', L22b],
      ['File API', 'Read files chosen by the user, Blob and FileReader.', L22b],
      ['Drag and Drop API', 'Native drag events and file drop.', L22b],
      ['Browser permissions', 'Permissions API and consent flows.', L22d],
      ['Web Workers', 'Background threads for heavy computation.', L22c],
      ['WebSockets', 'Two-way live connection.', L22c],
      ['Server-Sent Events', 'One-way server push over HTTP.', L22c],
      ['History API', 'pushState/replaceState and popstate; what the Angular Router wraps.', L22c],
      ['Intersection Observer', 'Know when elements enter or leave the viewport.', L22c],
      ['Resize Observer', 'Know when an element changes size.', L22c],
      ['Browser compatibility', 'Feature detection, browserslist, polyfills.', L22d],
      ['Secure browser API usage', 'Least privilege, validate, avoid sensitive data, HTTPS-only.', L22d],
    ]),

    topic(
      'ngs-m22-dom-storage-cookies',
      L22a,
      [
        blk(`<h3>What is inside a browser?</h3>
<b>Browser architecture</b>: a browser is many parts working together: a <b>rendering engine</b> (turns HTML/CSS into pixels), a <b>JavaScript engine</b> (V8) with a single-threaded <b>event loop</b>, a networking layer, storage, and security sandboxing per tab/site. Your Angular app lives in one tab's sandbox.<br>
• <b>DOM APIs</b>: the page is a tree of nodes you can find (<code>querySelector</code>) and modify. In Angular you rarely touch it directly: templates and bindings do the work.<br>
• <b>Window and Document</b>: <code>window</code> is the global object (location, history, localStorage, innerWidth); <code>document</code> is the page (<code>document.title</code>, <code>body</code>).<br>
• Storage choices: <b>LocalStorage</b> (stays until cleared), <b>SessionStorage</b> (until the tab closes), <b>IndexedDB</b> (big structured data), <b>Cookies</b> (sent to the server with every request).`,
          `// quick tour (plain browser JS)
localStorage.setItem('theme', 'dark');            // survives restart
sessionStorage.setItem('draft', 'hello');         // gone when the tab closes
console.log(localStorage.getItem('theme'));       // 'dark'
document.cookie = 'lang=en; Max-Age=31536000; Secure; SameSite=Lax';`,
        ),
      ],
      [
        blk(`<h3>Using storage properly in Angular</h3>
<code>localStorage</code> and <code>sessionStorage</code>: synchronous, string-only (use <code>JSON.stringify</code>), about 5 MB per origin, shared across tabs for local (the <code>storage</code> event notifies other tabs), blocks the main thread and is unavailable on the server (SSR) or throws in private mode / when disabled. Wrap it in a service with a try/catch and an in-memory fallback. <b>IndexedDB</b>: asynchronous, transactional, indexed, stores objects, blobs and files, hundreds of MB; use a wrapper like <code>idb</code> or <code>Dexie</code>. <b>Cookies</b>: sent automatically with requests to matching domain/path, 4 KB each; set by the server (<code>Set-Cookie</code>) or <code>document.cookie</code>.<br>
Access globals the Angular way: inject <code>DOCUMENT</code>, and get <code>window</code> via <code>DOCUMENT.defaultView</code>, so code is testable and SSR-safe. Prefer Renderer2 or template bindings to DOM manipulation.`,
          `// storage.service.ts
@Injectable({ providedIn: 'root' })
export class StorageService {
  private store = (() => { try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; } })();
  private memory = new Map<string, string>();            // fallback when storage is blocked / SSR

  get<T>(key: string, fallback: T): T {
    const raw = this.store?.getItem(key) ?? this.memory.get(key);
    try { return raw == null ? fallback : (JSON.parse(raw) as T); } catch { return fallback; }
  }
  set(key: string, value: unknown) {
    const raw = JSON.stringify(value);
    try { this.store?.setItem(key, raw); } catch { /* quota exceeded or blocked */ }
    this.memory.set(key, raw);
  }
}`,
          `// tiny IndexedDB example using the idb library
import { openDB } from 'idb';
const db = await openDB('shop', 1, { upgrade(d) { d.createObjectStore('orders', { keyPath: 'id' }); } });
await db.put('orders', { id: 1, items: ['pen'], offline: true });
const all = await db.getAll('orders');`,
        ),
        blk(`<h3>Cookie security</h3>
<b>Cookie security</b> attributes: <code>HttpOnly</code> (JavaScript cannot read it, protects against XSS theft), <code>Secure</code> (HTTPS only), <code>SameSite=Strict|Lax|None</code> (controls cross-site sending, main CSRF defence; <code>None</code> requires <code>Secure</code>), <code>Path</code>/<code>Domain</code> (scope as narrow as possible), <code>Max-Age/Expires</code> (short lifetimes for session cookies), and the <code>__Host-</code> prefix (forces Secure, Path=/, no Domain). Set auth cookies on the server; JavaScript-set cookies cannot be HttpOnly.`,
          `// Spring Boot - setting a hardened cookie
ResponseCookie c = ResponseCookie.from("refresh", token)
    .httpOnly(true).secure(true).sameSite("Strict").path("/api/auth").maxAge(Duration.ofDays(7)).build();
response.addHeader(HttpHeaders.SET_COOKIE, c.toString());`,
        ),
      ],
      [
        blk(`<h3>Trade-offs and pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"><thead><tr><th>Store</th><th>Size</th><th>Lifetime</th><th>Readable by JS</th><th>Sent to server</th></tr></thead><tbody>
<tr><td>Cookie</td><td>about 4 KB</td><td>Session or expiry</td><td>Unless HttpOnly</td><td>Yes, automatically</td></tr>
<tr><td>localStorage</td><td>about 5 MB</td><td>Until cleared</td><td>Yes</td><td>No</td></tr>
<tr><td>sessionStorage</td><td>about 5 MB</td><td>Tab session</td><td>Yes</td><td>No</td></tr>
<tr><td>IndexedDB</td><td>Large (quota based)</td><td>Until cleared/evicted</td><td>Yes (async)</td><td>No</td></tr>
</tbody></table><br>
• Anything in web storage is readable by any script on the origin: <b>never store secrets, long-lived tokens or sensitive personal data</b> there unaccompanied by XSS defences (see security module). Encrypting in JavaScript does not help if the key sits beside the data.<br>
• Storage is per origin (scheme + host + port); subdomains do not share localStorage. Browsers may evict data under storage pressure; request persistence with <code>navigator.storage.persist()</code> for important IndexedDB data. Safari limits script-writable storage (about 7 days of inactivity for some cases) under ITP.<br>
• Always version stored data (<code>{ v: 2, ... }</code>) and handle migration or invalidation after deployments; validate on read because users and extensions can modify it. Use <code>effect()</code> to persist signals and read once at startup; synchronous large writes can jank, prefer IndexedDB for big data.<br>
• Third-party cookie restrictions: cross-site cookies are increasingly blocked; keep API and app on the same site (or use proper SameSite/CORS credentials) to avoid surprises.<br>
• SSR: <code>localStorage</code> and <code>document.cookie</code> do not exist on the server; read cookies from the request via the Angular SSR <code>REQUEST</code> token, and use storage only in the browser.<br>
• Browser internals worth knowing: the event loop runs one task at a time; long synchronous JS blocks rendering and input (INP), so offload to workers and chunk work.`,
        ),
        blk(`<h3>Choosing quickly</h3>
UI preference (theme, table columns): localStorage. Wizard draft for one tab: sessionStorage. Offline data and caches (PWA): IndexedDB. Authentication session: HttpOnly Secure SameSite cookie from the server. Server-only data: not in the browser at all.`,
        ),
      ],
      [
        ['LocalStorage vs SessionStorage vs Cookies?', 'localStorage persists across sessions for an origin; sessionStorage is scoped to a tab and cleared on close; cookies are small, can expire, and are automatically sent to the server with matching requests. Cookies can be HttpOnly, web storage cannot.'],
        ['When would you use IndexedDB?', 'For large or structured data, offline-first apps, caching API results or files, since it is asynchronous, indexed and has far larger quota than localStorage.'],
        ['Explain HttpOnly, Secure and SameSite.', 'HttpOnly hides the cookie from JavaScript; Secure sends it only over HTTPS; SameSite restricts cross-site sending (Lax/Strict) which mitigates CSRF.'],
        ['Why is localStorage a bad place for secrets?', 'Any script running on the page, including injected XSS or compromised third-party code, can read it, and it persists indefinitely.'],
        ['How do you handle storage in an SSR Angular app?', 'Never access localStorage on the server; guard with isPlatformBrowser or afterNextRender, use cookies via the request for server-visible state, and wrap storage in an injectable service.'],
        ['What is the difference between window and document?', 'window is the global browser object (location, history, storage, size); document, a property of window, represents the loaded page DOM tree.'],
      ],
    ),

    topic(
      'ngs-m22-device-interaction-apis',
      L22b,
      [
        blk(`<h3>Talking to the device</h3>
Browsers expose powerful features through APIs, usually asking the user for permission first:<br>
• <b>Clipboard API</b>: copy text with <code>navigator.clipboard.writeText()</code> (e.g. a "Copy link" button).<br>
• <b>Geolocation API</b>: <code>navigator.geolocation.getCurrentPosition()</code> returns latitude and longitude after the user allows it.<br>
• <b>Notifications API</b>: show a system notification after the user grants permission.<br>
• <b>File API</b>: read files the user picked from an <code>&lt;input type="file"&gt;</code> without uploading them first.<br>
• <b>Drag and Drop API</b>: native drag events, including dropping files onto your page.`,
          `<!-- copy-button.component.html -->
<button (click)="copy()">Copy link</button>
@if (copied()) { <span aria-live="polite">Copied!</span> }`,
          `// copy-button.component.ts
copied = signal(false);
async copy() {
  try {
    await navigator.clipboard.writeText(location.href);      // needs HTTPS and a user gesture
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  } catch { /* permission denied or unsupported */ }
}`,
        ),
      ],
      [
        blk(`<h3>Practical usage with Angular</h3>
<b>Geolocation</b>: wrap the callback API in a Promise/Observable; handle <code>PERMISSION_DENIED</code>, <code>POSITION_UNAVAILABLE</code>, <code>TIMEOUT</code>; use <code>watchPosition</code> for tracking and clear it on destroy. <b>Notifications</b>: ask in response to a user action, not on page load; <code>Notification.requestPermission()</code> then <code>new Notification(title, options)</code>; background push uses Service Workers + Push API (Angular <code>SwPush</code>). <b>File API</b>: <code>File</code> and <code>Blob</code>, <code>FileReader</code> or the modern <code>file.text()</code>/<code>arrayBuffer()</code>, <code>URL.createObjectURL</code> for image previews (revoke afterwards). Validate type and size before upload (and again in Spring). <b>Drag and Drop API</b>: <code>dragover</code> (must <code>preventDefault()</code> to allow dropping), <code>drop</code> with <code>event.dataTransfer.files</code>; for in-app reordering prefer CDK drag and drop.`,
          `// geo.service.ts
getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }));
}

// notify.service.ts
async notify(title: string, body: string) {
  if (!('Notification' in window)) return;
  const perm = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
  if (perm === 'granted') new Notification(title, { body, icon: '/assets/icon.png' });
}`,
          `<!-- upload-zone.component.html -->
<div class="drop" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">Drop files here
  <input #f type="file" multiple accept="image/*" (change)="pick($any($event.target).files)">
</div>`,
          `// upload-zone.component.ts
onDrop(e: DragEvent) { e.preventDefault(); this.pick(e.dataTransfer?.files ?? null); }
pick(files: FileList | null) {
  for (const file of Array.from(files ?? [])) {
    if (!file.type.startsWith('image/') || file.size > 5_000_000) continue;     // client-side check only
    const url = URL.createObjectURL(file);                                       // preview
    this.previews.update(p => [...p, { name: file.name, url }]);
  }
}`,
        ),
      ],
      [
        blk(`<h3>Pitfalls and design guidance</h3>
• <b>Secure context</b>: Clipboard, Geolocation, Notifications and Service Workers require HTTPS (localhost is exempt). Clipboard write needs a user gesture; <code>clipboard.readText()</code> prompts and is not available in all browsers (Firefox restricts it).<br>
• Permission fatigue: request at the moment of need with an explanation (a pre-permission dialog) because a denied permission is hard to reverse (the user must change browser site settings, and you cannot prompt again).<br>
• Geolocation is sensitive personal data: use the lowest accuracy that works, do not store it without consent, send it only over HTTPS, and handle denial gracefully with a manual alternative (type your city). iOS Safari requires a user gesture for notifications and supports web push only for installed web apps.<br>
• File handling: never trust <code>file.type</code> or the name (they come from the client); validate with magic bytes server-side, limit size, scan for malware, and store outside the web root. Revoke object URLs (<code>URL.revokeObjectURL</code>) to avoid leaks. Big files: stream or chunk the upload, use <code>HttpClient</code> with <code>reportProgress</code>. The File System Access API (<code>showOpenFilePicker</code>) is Chromium-only.<br>
• HTML5 DnD quirks: dragenter/dragleave fire on child elements (use a counter or <code>pointer-events: none</code> on children), the API is not touch-friendly and has poor accessibility; always provide a keyboard alternative (the file input, move up/down buttons).<br>
• Test these APIs by injecting thin wrappers (<code>CLIPBOARD</code> token or service) so unit tests can substitute fakes; in zoneless apps ensure results are written to signals.`,
        ),
        blk(`<h3>Wrap native APIs behind services</h3>
Create <code>ClipboardService</code>, <code>GeolocationService</code>, <code>NotificationService</code> with SSR-safe checks and typed results (<code>Result = granted | denied | unsupported</code>). Feature components then stay declarative and testable, and you can swap in CDK <code>Clipboard</code> (<code>@angular/cdk/clipboard</code>, with <code>cdkCopyToClipboard</code>) which has a fallback for older browsers.`,
          `<button [cdkCopyToClipboard]="inviteLink()">Copy invite</button>     <!-- CDK clipboard: no manual API calls -->`,
        ),
      ],
      [
        ['How do you copy text to the clipboard in Angular?', 'Use navigator.clipboard.writeText() in a click handler on HTTPS, or the CDK Clipboard service/cdkCopyToClipboard directive that includes a fallback; handle failure and give feedback.'],
        ['What conditions apply to the Geolocation API?', 'It needs user permission and a secure context, returns async results or errors (denied, unavailable, timeout), and should be requested only when needed with a fallback.'],
        ['How do you build an image upload preview with the File API?', 'Read the File from an input or drop event, validate type and size, create an object URL with URL.createObjectURL for the preview, revoke it later, and upload with FormData via HttpClient.'],
        ['Why call preventDefault on dragover?', 'The default behaviour disallows dropping; cancelling dragover marks the element as a valid drop target so the drop event fires.'],
        ['Why should you not trust file.type for uploads?', 'The MIME type and extension are client-supplied and can be forged; the server must validate content, size and name.'],
      ],
    ),

    topic(
      'ngs-m22-workers-realtime-history-observers',
      L22c,
      [
        blk(`<h3>Doing things in the background and watching the page</h3>
• <b>Web Workers</b>: extra threads for heavy computation so the page stays responsive, like hiring a helper for the long calculation.<br>
• <b>WebSockets</b>: a persistent two-way line to the server (chat, live prices).<br>
• <b>Server-Sent Events (SSE)</b>: the server pushes updates one-way over normal HTTP (notifications, progress).<br>
• <b>History API</b>: <code>history.pushState</code> changes the URL without reloading; the Angular Router uses it for you, and the browser Back button fires <code>popstate</code>.<br>
• <b>Intersection Observer</b>: tells you when an element enters or leaves the viewport (lazy images, infinite scroll, animations on reveal).<br>
• <b>Resize Observer</b>: tells you when an element's size changes (responsive charts).`,
          `// Intersection Observer - detect when the element becomes visible
const io = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) console.log('visible!');
}, { threshold: 0.5 });
io.observe(document.querySelector('#banner')!);`,
        ),
      ],
      [
        blk(`<h3>Angular-friendly wrappers</h3>
Wrap observers in Observables so teardown is automatic, and run them outside the zone when they fire frequently. Use SSR guards: these APIs do not exist on the server.`,
          `// observers.ts
export function visible$(el: Element, options?: IntersectionObserverInit) {
  return new Observable<boolean>(sub => {
    const io = new IntersectionObserver(([e]) => sub.next(e.isIntersecting), options);
    io.observe(el);
    return () => io.disconnect();                           // cleanup
  });
}
export function size$(el: Element) {
  return new Observable<DOMRectReadOnly>(sub => {
    const ro = new ResizeObserver(([e]) => sub.next(e.contentRect));
    ro.observe(el);
    return () => ro.disconnect();
  });
}

// infinite-scroll directive: load more when the sentinel becomes visible
@Directive({ selector: '[appInfiniteScroll]' })
export class InfiniteScrollDirective {
  more = output<void>();
  constructor() {
    const el = inject(ElementRef).nativeElement;
    visible$(el, { rootMargin: '200px' }).pipe(filter(Boolean), takeUntilDestroyed()).subscribe(() => this.more.emit());
  }
}`,
          `// history: Angular Router does this for you. Raw API, for reference:
history.pushState({ step: 2 }, '', '/wizard/2');              // add entry, no reload
window.addEventListener('popstate', e => console.log(e.state)); // user pressed Back/Forward
history.replaceState(null, '', '/wizard/3');                  // change URL without a new entry`,
        ),
        blk(`<h3>Workers, sockets and SSE in use</h3>
Generate a worker with <code>ng generate web-worker</code>; post messages and receive results; terminate on destroy. For live data wrap <code>WebSocket</code> (or RxJS <code>webSocket()</code>) and <code>EventSource</code> in services exposing a signal or Observable, with reconnect and heartbeat. Detailed examples are in the Module 17 real-time lesson; here note browser rules: workers have no DOM or <code>window</code> (use <code>self</code>), data crosses by structured clone, and transferable objects (<code>ArrayBuffer</code>) move without copying.`,
          `// reconnecting websocket as a signal
messages = signal<string[]>([]);
connect(url: string, attempt = 0) {
  const ws = new WebSocket(url);
  ws.onmessage = e => this.messages.update(m => [...m, e.data]);
  ws.onclose = () => setTimeout(() => this.connect(url, attempt + 1), Math.min(1000 * 2 ** attempt, 30000));   // backoff
  inject(DestroyRef).onDestroy(() => ws.close());
}`,
        ),
      ],
      [
        blk(`<h3>Details and trade-offs</h3>
• <b>Workers</b>: dedicated (one page), shared (multiple tabs, limited support) and service workers (network proxy for PWAs, offline, push). Overhead of message passing means only worthwhile for tasks above roughly 50 ms. Module workers (<code>type: 'module'</code>) are supported by the Angular build. Libraries like Comlink give RPC-style calls.<br>
• <b>WebSocket security</b>: browsers do not apply CORS to WebSockets, so the server must validate the <code>Origin</code> header and authenticate the handshake (cookie or short-lived ticket in query; custom headers cannot be set from the browser API). Use <code>wss://</code>, limit message size, and re-authorize on reconnect. Backpressure is poor: slow consumers can accumulate memory.<br>
• <b>SSE</b>: auto-reconnect and <code>Last-Event-ID</code> resume, text only, limited to about 6 connections per domain on HTTP/1.1 (fine on HTTP/2), no custom headers, so token in cookie. Proxies may buffer: disable buffering in Nginx (<code>proxy_buffering off</code>).<br>
• <b>History API</b>: with <code>PathLocationStrategy</code> the server must return <code>index.html</code> for deep links (fallback rule); <code>HashLocationStrategy</code> avoids this but is ugly and bad for SEO. State objects must be serializable. Do not mix manual <code>pushState</code> with the Router; use <code>Location</code>/<code>router.navigate</code> with <code>replaceUrl</code>, <code>skipLocationChange</code> or <code>state</code>.<br>
• <b>IntersectionObserver</b> is asynchronous and cheap compared with scroll handlers; options <code>root</code>, <code>rootMargin</code>, <code>threshold</code>. Disconnect when done. <b>ResizeObserver</b> callbacks can cause "ResizeObserver loop" warnings when you change layout inside the callback; batch with <code>requestAnimationFrame</code>. Both are browser-only (SSR guard) and not available in jsdom unless polyfilled in tests.<br>
• Run high-frequency observer events outside Angular's zone or write results to signals so only affected views update.`,
        ),
        blk(`<h3>Checklist</h3>
Cleanup everything (disconnect, close, terminate, remove listeners) on destroy; keep sockets and workers in services scoped as narrowly as needed; guard with <code>isPlatformBrowser</code>; handle offline and reconnection; test through wrapper services.`,
        ),
      ],
      [
        ['Why prefer IntersectionObserver over scroll listeners?', 'It runs asynchronously off the hot path, reports visibility changes without per-scroll layout reads, and is more efficient and simpler for lazy loading and infinite scroll.'],
        ['What is the difference between a Web Worker and a Service Worker?', 'A Web Worker runs scripts in a background thread for computation tied to a page. A Service Worker is an event-driven proxy between app and network used for offline caching, push and background sync, living beyond a single page.'],
        ['WebSocket or SSE for live notifications?', 'SSE for simple one-way server push (auto reconnect, plain HTTP). WebSocket for bidirectional, low-latency or binary communication. Mind auth: neither lets the browser set custom headers.'],
        ['How does Angular Router relate to the History API?', 'The Router uses Location/PathLocationStrategy, which calls history.pushState and listens for popstate, so navigation updates the URL without reloading. The server needs a fallback to index.html.'],
        ['How do you avoid leaks with observers and sockets?', 'Disconnect/close/terminate in ngOnDestroy or DestroyRef.onDestroy, or wrap them in Observables with teardown and use takeUntilDestroyed.'],
      ],
    ),

    topic(
      'ngs-m22-compat-permissions-secure-usage',
      L22d,
      [
        blk(`<h3>Not every browser is the same</h3>
<b>Browser compatibility</b>: a feature may exist in Chrome but not Safari or an older phone. The safe habit is <b>feature detection</b> (ask "does this exist?") rather than guessing by browser name. Check support tables (caniuse.com, MDN).<br>
<b>Browser permissions</b>: sensitive features (camera, microphone, location, notifications, clipboard read) need the user's consent. The user can allow, block or ignore the prompt, and your code must cope with each.<br>
<b>Secure browser API usage</b>: use these powers carefully: ask only when needed, send nothing sensitive over plain HTTP, and never trust data that came from the browser.`,
          `// feature detection
if ('IntersectionObserver' in window) { /* use it */ } else { /* fallback: load all images */ }
if (navigator.clipboard?.writeText) { /* modern path */ }`,
        ),
      ],
      [
        blk(`<h3>Compatibility toolchain and Permissions API</h3>
Angular targets "evergreen" browsers; the supported list is defined by <code>.browserslistrc</code> (and since v18 the CLI warns when the configuration is outside the supported matrix). The build transpiles syntax (not APIs), so missing <b>APIs need polyfills</b> (add to the <code>polyfills</code> array in <code>angular.json</code>, e.g. <code>core-js</code> modules, not the whole library). Test with BrowserStack/Playwright across Chromium, Firefox and WebKit. CSS: use <code>@supports</code> and autoprefixer (built in). <b>Permissions API</b>: <code>navigator.permissions.query({ name })</code> returns <code>granted | denied | prompt</code> and a <code>change</code> event; not every name is supported in every browser (Safari partial), so wrap in try/catch.`,
          `// permissions.service.ts
async state(name: PermissionName): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  try {
    const s = await navigator.permissions.query({ name });
    return s.state;
  } catch { return 'unsupported'; }                 // name or API not supported in this browser
}

// UI: show an enable button only when 'prompt'; show instructions when 'denied'
// .browserslistrc
// last 2 Chrome versions
// last 2 Firefox versions
// last 2 Safari versions
// last 2 Edge versions`,
        ),
        blk(`<h3>Secure usage rules of thumb</h3>
Request permissions in context and explain why; degrade gracefully on denial; use the least-powerful API; keep everything on HTTPS; do not write secrets to storage, clipboard or logs; validate everything you read back from the browser (storage, URL, postMessage, files); revoke or stop resources (geolocation watch, media streams, object URLs) when done. For <code>window.postMessage</code> always check <code>event.origin</code> and use an exact target origin.`,
          `window.addEventListener('message', (e: MessageEvent) => {
  if (e.origin !== 'https://trusted.example.com') return;       // verify the sender
  handle(e.data);                                               // still validate the payload shape
});`,
        ),
      ],
      [
        blk(`<h3>Defense in depth</h3>
• <b>Permissions-Policy</b> response header limits which features pages and iframes may use (<code>Permissions-Policy: geolocation=(self), camera=(), microphone=()</code>); <code>iframe sandbox</code> and <code>allow</code> attributes restrict embedded content. Combine with CSP.<br>
• <b>Secure contexts</b>: many APIs are HTTPS-only. Use <code>window.isSecureContext</code> to check. Mixed content is blocked.<br>
• <b>Fingerprinting and privacy</b>: avoid APIs that expose device details unnecessarily; honour Do Not Track/consent laws (GDPR cookie consent applies to non-essential storage). Document what you store and why.<br>
• <b>Third-party scripts</b> run with full page privileges; use Subresource Integrity (<code>integrity=</code>) for CDN files, prefer self-hosting, and isolate untrusted widgets in sandboxed iframes.<br>
• <b>Input trust</b>: <code>location.search</code>, hash fragments, <code>document.referrer</code>, storage and <code>postMessage</code> are all attacker-influenceable; sanitize before use and never feed them to <code>innerHTML</code>, <code>eval</code> or <code>bypassSecurityTrust*</code>.<br>
• <b>Compatibility policy</b>: decide your support matrix with analytics (not assumptions), use progressive enhancement (core function without the fancy API), isolate API access behind services so fallbacks live in one place, and test fallbacks deliberately (disable the API in DevTools or stub it). Keep Angular, browserslist and polyfills updated; check release notes since Angular drops old browsers over time.<br>
• Permission UX: store a "do not ask again" decision, never re-prompt in a loop, and make the feature work without the permission wherever possible.`,
        ),
        blk(`<h3>Testing and observability</h3>
Use Playwright to grant or deny permissions per test (<code>context.grantPermissions(['geolocation'])</code>, <code>setGeolocation</code>) and run the suite on Chromium, Firefox and WebKit. Log feature-support and permission outcomes (without personal data) to learn which fallbacks users actually hit.`,
        ),
      ],
      [
        ['How do you handle browser compatibility in Angular?', 'Define supported browsers in .browserslistrc, rely on feature detection with fallbacks, add targeted polyfills for missing APIs, and test across Chromium, Firefox and WebKit.'],
        ['Feature detection vs browser sniffing?', 'Feature detection checks whether an API exists and works, which is reliable and future-proof. User-agent sniffing is brittle and often wrong.'],
        ['What are good practices for browser permissions?', 'Ask in context after a user action with an explanation, handle granted, denied and dismissed states, provide fallbacks, do not re-prompt repeatedly, and use the Permissions API to read state.'],
        ['How do you secure postMessage communication?', 'Verify event.origin against an allow-list, specify the exact target origin when sending, and validate the message payload.'],
        ['What does a secure context mean?', 'A page served over HTTPS (or localhost) that unlocks powerful APIs like Clipboard, Geolocation and Service Workers; check with window.isSecureContext.'],
      ],
    ),
  ],
};

export const angularSyllabus3: SubTopic[] = [module16, module17, module18, module19, module20, module21, module22];
