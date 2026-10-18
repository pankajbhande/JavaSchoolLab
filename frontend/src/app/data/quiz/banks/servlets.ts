import type { QuizBank } from '../types';

// Course-wide bank: jsp-servlet (JSP Servlets) — covers all ten of its modules.
// This course ships no interviewQuestions at all, so before this bank existed its
// "Take Test" button produced an empty quiz.
export const servlets: QuizBank = {
  key: 'jsp-servlet',
  label: 'JSP Servlets',
  questions: [
    {
      id: 'srv-lifecycle',
      question: 'How many times does the container call init() and service() on a servlet?',
      options: [
        'init() once when the servlet is first loaded; service() once per request',
        'Both once per request',
        'Both once, when the application starts',
        'init() once per request; service() once per session',
      ],
      correctAnswer: 0,
      explanation:
        'The container creates a single servlet instance, calls init() once to set it up, then dispatches every incoming request through service(). destroy() runs once at shutdown. This is why init() is the place for expensive one-time setup.',
      difficulty: 'beginner',
    },
    {
      id: 'srv-thread-safety',
      question: 'Why are instance fields on a servlet dangerous?',
      options: [
        'One servlet instance serves all concurrent requests, so instance fields are shared mutable state across threads',
        'The container serialises instance fields to disk between requests',
        'Instance fields are reset to null before every request',
        'They are not dangerous, the container creates one servlet per request',
      ],
      correctAnswer: 0,
      explanation:
        'The single-instance, multi-thread model means two users can be inside service() at the same time. Anything stored in an instance field is shared between them. Keep per-request state in local variables or in the request object.',
      difficulty: 'expert',
    },
    {
      id: 'srv-forward-vs-redirect',
      question: 'What is the key difference between RequestDispatcher.forward() and response.sendRedirect()?',
      options: [
        'forward() happens server side and keeps the same request; sendRedirect() tells the browser to make a second request',
        'forward() is faster because it skips the container',
        'sendRedirect() preserves request attributes while forward() discards them',
        'They are identical apart from the URL shown in the address bar',
      ],
      correctAnswer: 0,
      explanation:
        'A forward is invisible to the client: the URL does not change and request attributes survive. A redirect sends a 302 and the browser issues a fresh request, so attributes are lost and the URL updates, which is what you want after a POST.',
      difficulty: 'intermediate',
    },
    {
      id: 'srv-doget-dopost',
      question: 'Which statement about doGet and doPost is accurate?',
      options: [
        'GET parameters ride in the query string and the request may be cached or bookmarked; POST sends them in the body',
        'POST can carry parameters but GET cannot',
        'GET is encrypted while POST is plain text',
        'Only doPost can return HTML',
      ],
      correctAnswer: 0,
      explanation:
        'Neither method is encrypted, that is what TLS is for. The real differences are where parameters travel, that GET is expected to be safe and idempotent, and that GET responses can be cached and bookmarked.',
      difficulty: 'beginner',
    },
    {
      id: 'srv-session-tracking',
      question: 'HttpSession needs to identify a returning browser. What does the container use by default?',
      options: [
        'A JSESSIONID cookie, falling back to URL rewriting when cookies are disabled',
        'The client IP address',
        'A hidden form field injected into every page',
        'The browser user-agent string',
      ],
      correctAnswer: 0,
      explanation:
        'HTTP is stateless, so the session id has to travel with each request. Cookies are the default carrier; encodeURL() appends the id to links when cookies are unavailable. IP addresses are unusable because proxies and NAT share them.',
      difficulty: 'intermediate',
    },
    {
      id: 'srv-config-vs-context',
      question: 'What separates ServletConfig from ServletContext?',
      options: [
        'ServletConfig holds parameters for one servlet; ServletContext is shared across the whole web application',
        'ServletConfig is read-only while ServletContext is writable',
        'ServletContext exists only during a single request',
        'They are two names for the same object',
      ],
      correctAnswer: 0,
      explanation:
        'Each servlet gets its own ServletConfig with its own init parameters. There is exactly one ServletContext per application, which is why it is the place for application-wide attributes, and why writing to it needs care under concurrency.',
      difficulty: 'intermediate',
    },
    {
      id: 'srv-jsp-translation',
      question: 'What happens to a JSP page the first time it is requested?',
      options: [
        'The container translates it into servlet source, compiles it, and then runs it like any other servlet',
        'It is interpreted line by line on every request',
        'It is sent to the browser, which renders the JSP tags',
        'It is converted to static HTML and cached permanently',
      ],
      correctAnswer: 0,
      explanation:
        'JSP is a servlet-authoring convenience. The container generates a servlet whose service method writes your markup, compiles it once, then reuses it. That translation step is why the first hit to a JSP is noticeably slower.',
      difficulty: 'intermediate',
    },
    {
      id: 'srv-filter-purpose',
      question: 'What is a servlet Filter designed for?',
      options: [
        'Intercepting requests and responses to apply cross-cutting concerns such as authentication, logging or compression',
        'Filtering invalid characters out of form parameters only',
        'Choosing which servlet handles a URL pattern',
        'Rejecting requests from unknown IP addresses, and nothing else',
      ],
      correctAnswer: 0,
      explanation:
        'Filters form a chain around the target servlet, so they can inspect or wrap both the request on the way in and the response on the way out. That makes them the natural home for concerns that would otherwise be duplicated in every servlet.',
      difficulty: 'intermediate',
    },
  ],
};
