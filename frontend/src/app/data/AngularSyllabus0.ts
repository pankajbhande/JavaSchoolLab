// Complete Angular syllabus: the overview page that sits in front of the 29 syllabus modules (AngularSyllabus1..4.ts).
import type { SubTopic } from './types';
import { blk, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';

const MODULES: [number, string, number, string][] = [
  [1, 'Web Development Fundamentals', 23, 'Foundation'],
  [2, 'TypeScript Complete Syllabus', 45, 'Foundation'],
  [3, 'Angular Introduction and Setup', 20, 'Core'],
  [4, 'Components', 30, 'Core'],
  [5, 'Templates and Data Binding', 30, 'Core'],
  [6, 'Directives', 24, 'Core'],
  [7, 'Pipes', 20, 'Core'],
  [8, 'Services and Dependency Injection', 28, 'Core'],
  [9, 'Component Lifecycle', 17, 'Core'],
  [10, 'Angular Routing', 40, 'Core'],
  [11, 'Angular Forms', 38, 'Core'],
  [12, 'RxJS', 53, 'Core'],
  [13, 'Angular Signals', 30, 'Core'],
  [14, 'HTTP Client and REST API Integration', 45, 'Essential'],
  [15, 'State Management', 25, 'Intermediate'],
  [16, 'Angular Authentication and Security', 28, 'Essential'],
  [17, 'Advanced Angular', 40, 'Advanced'],
  [18, 'Angular Performance Optimization', 30, 'Advanced'],
  [19, 'Server-Side Rendering and Modern Rendering', 20, 'Advanced'],
  [20, 'Angular Testing', 36, 'Production'],
  [21, 'Angular UI Development', 30, 'Intermediate'],
  [22, 'Browser APIs and Storage', 22, 'Intermediate'],
  [23, 'Angular with Spring Boot', 25, 'Essential'],
  [24, 'Deployment and DevOps', 30, 'Production'],
  [25, 'Angular CLI and Developer Tools', 25, 'Intermediate'],
  [26, 'Architecture and Design Patterns', 28, 'Advanced'],
  [27, 'Accessibility and Internationalization', 20, 'Advanced'],
  [28, 'Angular Interview Preparation', 35, 'Career'],
  [29, 'Practical Projects', 25, 'Practice'],
];

const rows = MODULES.map(([n, name, items, level]) => `<tr><td>${n}</td><td>${name}</td><td>${items}</td><td>${level}</td></tr>`).join('\n');

export const angularSyllabus0: SubTopic[] = [
  {
    id: 'ngs-roadmap',
    name: 'Complete Angular Syllabus (29 Modules, 862 Items)',
    topics: [
      topic(
        'ngs-roadmap-overview',
        'Complete Angular Syllabus: Beginner to Advanced',
        [
          blk(`<h3>What this syllabus covers</h3>
• The <b>complete Angular syllabus</b> is a full roadmap for software developers: web fundamentals, <b>TypeScript</b>, components, RxJS, <b>Signals</b>, API integration, security, testing, deployment and advanced topics.<br>
• It has <b>29 modules</b> and <b>862 items</b> (the last module is 25 practical projects). Every module below is a section of this course with its own overview page, lessons, code samples and interview questions.<br>
• The code uses <b>modern Angular</b>: standalone components, signals, the <code>@if</code> and <code>@for</code> control flow, <code>inject()</code>, functional guards and interceptors.<br>
• Some APIs depend on the Angular version (for example <code>resource()</code> and <code>linkedSignal()</code>). Check availability and stability in the documentation of the version you use.`),
          blk(`<h3>How to study it</h3>
• <b>Fresher path:</b> modules 1 to 8, then 9 to 11, then 14 and 23 (Spring Boot), then build the beginner projects of module 29.<br>
• <b>Working developer path:</b> modules 12 to 15 (RxJS, Signals, HTTP, state), 16 (security), 20 (testing), then the intermediate projects.<br>
• <b>Senior path:</b> modules 17 to 19 (advanced, performance, SSR), 24 to 27 (DevOps, tools, architecture, accessibility), then the advanced projects.<br>
• <b>Interview week:</b> module 28 plus the interview questions at the end of every lesson.`),
        ],
        [
          blk(`<h3>The 29 modules</h3>
<table ${TABLE}>
<tr><th>Module</th><th>Title</th><th>Items</th><th>Level</th></tr>
${rows}
</table>`),
        ],
        [
          blk(`<h3>Important notes</h3>
• <b>Route guards are not a substitute for backend authorization.</b> Angular guards only hide screens in the browser. Your Spring Boot APIs must enforce permissions independently (module 16 and module 23).<br>
• <b>Testing tools vary.</b> Angular testing defaults and recommendations change with the Angular version and project setup. Learn the test runner your project actually uses (module 20).<br>
• This syllabus sits next to the earlier 13-section Angular roadmap in this course. The earlier sections are a compact path; these 29 modules go deeper on every topic.`),
        ],
        [
          ['How is this Angular syllabus organised?', 'It has 29 modules, from web fundamentals and TypeScript through components, routing, forms, RxJS, Signals, HTTP, security, testing, performance, SSR, deployment and architecture, ending with interview preparation and 25 practical projects.'],
          ['In what order should a fresher study Angular?', 'Web fundamentals and TypeScript first, then setup, components, templates, directives, pipes, services and dependency injection, then routing and forms, then HTTP with a Spring Boot backend, and finally build the beginner projects.'],
        ],
      ),
    ],
  },
];
