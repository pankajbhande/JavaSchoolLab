// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const AngularCourse: Course[] = [
    {
        id: 'angular',
        name: 'Angular',
        icon: 'Server',
        subTopics: [
            {
                id: 'angular-basics',
                name: 'Angular Fundamentals',
                topics: [
                    {
                        id: 'angular-intro',
                        name: 'Introduction to Angular',
                        beginner: [
                            {
                                content: `<h3>What is Angular?</h3>
• Angular is a TypeScript-based, opinionated front-end framework maintained by Google, used for building large-scale single-page applications (SPAs).<br>
• Unlike React (a library), Angular is a complete framework: it ships with routing, forms, HTTP client, and dependency injection built in.<br>
• Angular apps are built from <strong>components</strong> - each with a TypeScript class (logic), an HTML template (view), and CSS (style).<br>`,
                                codeExamples: [
                                    `// hello.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  template: \`<h1>Hello, {{ name }}!</h1>\`,
})
export class HelloComponent {
  name = 'Angular';
}
// OUTPUT: Renders <h1>Hello, Angular!</h1> wherever <app-hello></app-hello> is used`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'angular-components',
                        name: 'Components & Data Binding',
                        beginner: [
                            {
                                content: `<h3>Data Binding</h3>
Angular offers 4 kinds of binding between the component class and its template:<br>
1. Interpolation: <code>{{ value }}</code> - display a value.<br>
2. Property Binding: <code>[property]="value"</code> - set a DOM property.<br>
3. Event Binding: <code>(event)="handler()"</code> - respond to DOM events.<br>
4. Two-Way Binding: <code>[(ngModel)]="value"</code> - keep a form input and a property in sync.<br>`,
                                codeExamples: [
                                    `// counter.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: \`
    <p>Count: {{ count }}</p>
    <button (click)="increment()">Increment</button>
    <input [(ngModel)]="username" placeholder="Type your name" />
    <p>Hello, {{ username }}</p>
  \`,
})
export class CounterComponent {
  count = 0;
  username = '';

  increment() {
    this.count++;
  }
}
// OUTPUT: Clicking the button increments "Count"; typing in the input updates the greeting live`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>Structural Directives - *ngIf and *ngFor</h4>
Structural directives change the DOM's structure by adding/removing elements. <code>*ngIf</code> conditionally renders an element; <code>*ngFor</code> repeats an element for each item in a collection.<br>`,
                                codeExamples: [
                                    `@Component({
  selector: 'app-user-list',
  template: \`
    <ul>
      <li *ngFor="let user of users">{{ user.name }}</li>
    </ul>
    <p *ngIf="users.length === 0">No users found.</p>
  \`,
})
export class UserListComponent {
  users = [{ name: 'Pankaj' }, { name: 'Sheru' }, { name: 'Dheeraj' }];
}
// OUTPUT: Renders a bullet for each user; shows "No users found." only when the array is empty`
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'angular-core',
                name: 'Angular Core Concepts',
                topics: [
                    {
                        id: 'angular-services',
                        name: 'Services & Dependency Injection',
                        beginner: [
                            {
                                content: `<h3>Services & Dependency Injection (DI)</h3>
A <strong>Service</strong> is a plain TypeScript class that holds logic/data meant to be shared across components (e.g. an API client). Angular's DI system automatically creates and supplies (injects) a service instance to any component that asks for it in its constructor - you never call <code>new</code> yourself.<br>`,
                                codeExamples: [
                                    `// user.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' }) // singleton, available app-wide
export class UserService {
  private users = ['Pankaj', 'Sheru', 'Dheeraj'];

  getUsers() {
    return this.users;
  }
}

// user-list.component.ts
import { Component } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-list',
  template: \`<li *ngFor="let u of users">{{ u }}</li>\`,
})
export class UserListComponent {
  users: string[];

  // Angular's DI injects the SAME UserService instance here
  constructor(private userService: UserService) {
    this.users = this.userService.getUsers();
  }
}`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'angular-routing',
                        name: 'Routing',
                        beginner: [
                            {
                                content: `<h3>Angular Router</h3>
The Angular Router maps URL paths to components, enabling navigation within a single-page app without a full page reload. Routes are declared as an array of path → component mappings.<br>`,
                                codeExamples: [
                                    `// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { AboutComponent } from './about.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

// In a template, navigate without a full page reload:
// <a routerLink="/about">About</a>
// <router-outlet></router-outlet>  <-- matched component renders here`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>Route Parameters</h4>
Dynamic segments in a route path (e.g. <code>:id</code>) let one route template handle many URLs, with the actual value read via <code>ActivatedRoute</code>.<br>`,
                                codeExamples: [
                                    `// route config: { path: 'users/:id', component: UserDetailComponent }

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({ selector: 'app-user-detail', template: '<p>User ID: {{ userId }}</p>' })
export class UserDetailComponent implements OnInit {
  userId!: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id')!;
  }
}
// Navigating to /users/42 renders: User ID: 42`
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        cheatNotes: [
            '@Component - Decorator that marks a class as an Angular component',
            'Interpolation {{ }} - Display a component property\'s value in the template',
            '[property] - Property binding, sets a DOM element property',
            '(event) - Event binding, calls a method on a DOM event',
            '[(ngModel)] - Two-way binding between a form input and a property',
            '*ngIf - Structural directive, conditionally renders an element',
            '*ngFor - Structural directive, repeats an element per collection item',
            '@Injectable - Marks a class as available for dependency injection',
            'providedIn: root - Registers a service as a singleton for the whole app',
            'Constructor injection - Angular supplies service instances via the constructor',
            'RouterModule - Enables client-side routing between components',
            'routerLink - Directive for SPA navigation without full page reload',
            'router-outlet - Placeholder where the routed component renders',
            'ActivatedRoute - Service to read route parameters and query params',
            'Module (@NgModule) - Groups related components, directives, and services',
            'Pipe - Transforms displayed values in a template, e.g. {{ date | date }}',
            'Lifecycle hooks - ngOnInit(), ngOnDestroy(), etc. run at specific component stages',
            'RxJS Observable - Stream of async values used throughout Angular (HTTP, forms, router)',
            'HttpClient - Angular\'s built-in service for making HTTP requests',
            'Standalone components - Components that don\'t require an NgModule (modern Angular)',
        ],
        interviewQuestions: [
            {
                company: 'General Angular Interview',
                questions: [
                    'What is the difference between AngularJS and Angular (2+)?',
                    'Explain the four types of data binding in Angular.',
                    'What is dependency injection, and how does Angular implement it?',
                    'What is the difference between *ngIf and [hidden]?',
                    'How does the Angular Router work, and what is a route parameter?',
                    'What are Angular lifecycle hooks? Name a few and when they run.',
                    'What is the difference between a Component and a Service?',
                    'What is RxJS and why does Angular rely on Observables?'
                ]
            }
        ]
    }
];
