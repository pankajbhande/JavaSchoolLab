// Lazy loaders for the course source files, one per module listed in coursesData.ts.
// Each is a dynamic import, so opening a course downloads only that course's content.
// Keep this list in step with baseCourses in coursesData.ts; courseLoader.test.ts fails if
// a course is missing or loads differently from the eager list.

import type { Course } from './types';
import { withJvm, withJdbc, withJsRoadmap, withReactRoadmap, withAngularRoadmap, withFlutterRoadmap, withHibernateRoadmap, withMicroservicesRoadmap, withSpringCoreRoadmap, withJavaFxRoadmap } from './courseMerges';

type Loader = () => Promise<Course[]>;

/** Two-part courses are authored as separate files and shown as one course. */
const merged = (a: Course[], b: Course[]): Course[] => [{ ...a[0], subTopics: [...a[0].subTopics, ...b[0].subTopics] }];

export const courseModules: Record<string, Loader> = {
  SoftwareFoundations: () => import('./SoftwareFoundations').then(m => m.SoftwareFoundations),
  ProgrammingFundamentals: () => import('./ProgrammingFundamentals').then(m => m.ProgrammingFundamentals),
  HtmlandCSS: () => import('./HtmlandCSS').then(m => m.HtmlandCSS),
  // Java Memory & JVM is part of the Java course (see courseMerges.ts)
  coreJava: () => Promise.all([import('./coreJava'), import('./JavaMemoryJVM'), import('./SpringCoreRoadmap1'), import('./SpringCoreRoadmap2'), import('./SpringCoreRoadmap3'), import('./SpringCoreRoadmap4')])
    .then(([a, b, r1, r2, r3, r4]) => withSpringCoreRoadmap(withJvm(a.coreJava, b.JavaMemoryJVM), r1.springCoreRoadmap1.slice(0, 1), [...r1.springCoreRoadmap1.slice(1), ...r2.springCoreRoadmap2, ...r3.springCoreRoadmap3, ...r4.springCoreRoadmap4])),
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
  microservicesFundamentals: () => Promise.all([import('./MicroservicesFundamentalsPart1'), import('./MicroservicesFundamentalsPart2'), import('./MicroservicesRoadmap1'), import('./MicroservicesRoadmap2'), import('./MicroservicesRoadmap3')])
    .then(([a, b, r1, r2, r3]) => withMicroservicesRoadmap(merged(a.microservicesFundamentalsPart1, b.microservicesFundamentalsPart2), r1.microservicesRoadmap1.slice(0, 1), [...r1.microservicesRoadmap1.slice(1), ...r2.microservicesRoadmap2, ...r3.microservicesRoadmap3])),
  MySQLCSS: () => import('./MySQLCSS').then(m => m.MySQLCSS),
  // JDBC is the first part of the Hibernate course (see courseMerges.ts)
  Hibernate: () => Promise.all([import('./Hibernate'), import('./JdbcCourse'), import('./HibernateRoadmap1'), import('./HibernateRoadmap2')])
    .then(([a, b, r1, r2]) => withHibernateRoadmap(withJdbc(a.Hibernate, b.JdbcCourse), r1.hibernateRoadmap1.slice(0, 1), [...r1.hibernateRoadmap1.slice(1), ...r2.hibernateRoadmap2])),
  Reactjs: () => Promise.all([import('./Reactjs'), import('./ReactRoadmap1'), import('./ReactRoadmap2'), import('./ReactRoadmap3')])
    .then(([a, r1, r2, r3]) => withReactRoadmap(a.Reactjs, r1.reactRoadmap1.slice(0, 1), [...r1.reactRoadmap1.slice(1), ...r2.reactRoadmap2, ...r3.reactRoadmap3])),
  JavaScriptCourse: () => Promise.all([import('./JavaScriptCourse'), import('./JavaScriptRoadmap1'), import('./JavaScriptRoadmap2'), import('./JavaScriptRoadmap3'), import('./JavaScriptRoadmap4')])
    .then(([a, r1, r2, r3, r4]) => withJsRoadmap(a.JavaScriptCourse, r1.jsRoadmap1.slice(0, 1), [...r1.jsRoadmap1.slice(1), ...r2.jsRoadmap2, ...r3.jsRoadmap3, ...r4.jsRoadmap4])),
  AngularCourse: () => Promise.all([import('./AngularCourse'), import('./AngularRoadmap1'), import('./AngularRoadmap2'), import('./AngularRoadmap3')])
    .then(([a, r1, r2, r3]) => withAngularRoadmap(a.AngularCourse, r1.angularRoadmap1.slice(0, 1), [...r1.angularRoadmap1.slice(1), ...r2.angularRoadmap2, ...r3.angularRoadmap3])),
  Flutter: () => Promise.all([import('./Flutter'), import('./FlutterRoadmap1'), import('./FlutterRoadmap2'), import('./FlutterRoadmap3'), import('./FlutterRoadmap4')])
    .then(([a, r1, r2, r3, r4]) => withFlutterRoadmap(a.Flutter, r1.flutterRoadmap1.slice(0, 1), [...r1.flutterRoadmap1.slice(1), ...r2.flutterRoadmap2, ...r3.flutterRoadmap3, ...r4.flutterRoadmap4])),
  JavaFXCourse: () => Promise.all([import('./JavaFXCourse'), import('./JavaFXRoadmap1'), import('./JavaFXRoadmap2'), import('./JavaFXRoadmap3')])
    .then(([a, r1, r2, r3]) => withJavaFxRoadmap(a.JavaFXCourse, r1.javaFxRoadmap1.slice(0, 1), [...r1.javaFxRoadmap1.slice(1), ...r2.javaFxRoadmap2, ...r3.javaFxRoadmap3])),
  PythonCourse: () => import('./PythonCourse').then(m => m.PythonCourse),
  MachineLearningCourse: () => import('./MachineLearningCourse').then(m => m.MachineLearningCourse),
  DataScienceCourse: () => import('./DataScienceCourse').then(m => m.DataScienceCourse),
  DsaCourse: () => import('./DsaCourse').then(m => m.DsaCourse),
  DigitalImageAnalysisCourse: () => import('./DigitalImageAnalysisCourse').then(m => m.DigitalImageAnalysisCourse),
  MathFoundationsCourse: () => import('./MathFoundationsCourse').then(m => m.MathFoundationsCourse),
};
