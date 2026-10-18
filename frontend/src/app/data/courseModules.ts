// Lazy loaders for the course source files, one per module listed in coursesData.ts.
// Each is a dynamic import, so opening a course downloads only that course's content.
// Keep this list in step with baseCourses in coursesData.ts; courseLoader.test.ts fails if
// a course is missing or loads differently from the eager list.

import type { Course } from './types';

type Loader = () => Promise<Course[]>;

/** Two-part courses are authored as separate files and shown as one course. */
const merged = (a: Course[], b: Course[]): Course[] => [{ ...a[0], subTopics: [...a[0].subTopics, ...b[0].subTopics] }];

export const courseModules: Record<string, Loader> = {
  SoftwareFoundations: () => import('./SoftwareFoundations').then(m => m.SoftwareFoundations),
  ProgrammingFundamentals: () => import('./ProgrammingFundamentals').then(m => m.ProgrammingFundamentals),
  HtmlandCSS: () => import('./HtmlandCSS').then(m => m.HtmlandCSS),
  coreJava: () => import('./coreJava').then(m => m.coreJava),
  JavaMemoryJVM: () => import('./JavaMemoryJVM').then(m => m.JavaMemoryJVM),
  JSPServlets: () => import('./JSPServlet').then(m => m.JSPServlets),
  CollectionFramework: () => import('./CollectionFramework').then(m => m.CollectionFramework),
  designPattern: () => import('./designPattern').then(m => m.designPattern),
  enterprisePatterns: () => Promise.all([import('./EnterprisePatternsPart1'), import('./EnterprisePatternsPart2')])
    .then(([a, b]) => merged(a.enterprisePatternsPart1, b.enterprisePatternsPart2)),
  microservicesPatterns: () => Promise.all([import('./MicroservicesPatternsPart1'), import('./MicroservicesPatternsPart2')])
    .then(([a, b]) => merged(a.microservicesPatternsPart1, b.microservicesPatternsPart2)),
  messagingPatterns: () => Promise.all([import('./MessagingPatternsPart1'), import('./MessagingPatternsPart2')])
    .then(([a, b]) => merged(a.messagingPatternsPart1, b.messagingPatternsPart2)),
  architecturalPatterns: () => import('./ArchitecturalPatterns').then(m => m.architecturalPatterns),
  cloudNativePatterns: () => import('./CloudNativePatterns').then(m => m.cloudNativePatterns),
  microservicesFundamentals: () => Promise.all([import('./MicroservicesFundamentalsPart1'), import('./MicroservicesFundamentalsPart2')])
    .then(([a, b]) => merged(a.microservicesFundamentalsPart1, b.microservicesFundamentalsPart2)),
  MySQLCSS: () => import('./MySQLCSS').then(m => m.MySQLCSS),
  Hibernate: () => import('./Hibernate').then(m => m.Hibernate),
  Reactjs: () => import('./Reactjs').then(m => m.Reactjs),
  JavaScriptCourse: () => import('./JavaScriptCourse').then(m => m.JavaScriptCourse),
  AngularCourse: () => import('./AngularCourse').then(m => m.AngularCourse),
  Flutter: () => import('./Flutter').then(m => m.Flutter),
  JavaFXCourse: () => import('./JavaFXCourse').then(m => m.JavaFXCourse),
  PythonCourse: () => import('./PythonCourse').then(m => m.PythonCourse),
  MachineLearningCourse: () => import('./MachineLearningCourse').then(m => m.MachineLearningCourse),
  DataScienceCourse: () => import('./DataScienceCourse').then(m => m.DataScienceCourse),
  DsaCourse: () => import('./DsaCourse').then(m => m.DsaCourse),
  DigitalImageAnalysisCourse: () => import('./DigitalImageAnalysisCourse').then(m => m.DigitalImageAnalysisCourse),
  MathFoundationsCourse: () => import('./MathFoundationsCourse').then(m => m.MathFoundationsCourse),
};
