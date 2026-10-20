// Courses that were authored separately but are shown as part of another course:
//   Java Memory & JVM -> the end of the Java course
//   JDBC              -> the start of the Hibernate course (JDBC first, then the ORM built on top of it)
// Used by coursesData.ts (eager list) and courseModules.ts (lazy loaders) so both build the same courses.

import type { Course, SubTopic } from './types';

const join = (base: Course, before: Course[], after: Course[]): Course => ({
  ...base,
  subTopics: [...before.flatMap(c => c.subTopics), ...base.subTopics, ...after.flatMap(c => c.subTopics)],
  cheatNotes: [...before.flatMap(c => c.cheatNotes), ...base.cheatNotes, ...after.flatMap(c => c.cheatNotes)],
  interviewQuestions: [
    ...before.flatMap(c => c.interviewQuestions),
    ...base.interviewQuestions,
    ...after.flatMap(c => c.interviewQuestions),
  ],
});

/** The Java course with the Java Memory & JVM modules appended; every other course is returned as is. */
export const withJvm = (javaCourses: Course[], jvm: Course[]): Course[] =>
  javaCourses.map(c => (c.id === 'java' ? join(c, [], jvm) : c));

/** The Hibernate course with the JDBC modules placed in front of it. */
export const withJdbc = (hibernate: Course[], jdbc: Course[]): Course[] =>
  hibernate.map(c => (c.id === 'hibernate' ? join(c, jdbc, []) : c));

/** The JavaScript course with the roadmap overview in front of it and the 17 roadmap phases after its original modules. */
export const withJsRoadmap = (javascript: Course[], overview: SubTopic[], phases: SubTopic[]): Course[] =>
  javascript.map(c => (c.id === 'javascript' ? { ...c, subTopics: [...overview, ...c.subTopics, ...phases] } : c));

/** The React course with the roadmap overview in front of it and the 16 roadmap phases after its original module. */
export const withReactRoadmap = (react: Course[], overview: SubTopic[], phases: SubTopic[]): Course[] =>
  react.map(c => (c.id === 'react-js' ? { ...c, subTopics: [...overview, ...c.subTopics, ...phases] } : c));

/** The Angular course with the roadmap overview in front of it and the 13 roadmap sections after its original modules. */
export const withAngularRoadmap = (angular: Course[], overview: SubTopic[], sections: SubTopic[]): Course[] =>
  angular.map(c => (c.id === 'angular' ? { ...c, subTopics: [...overview, ...c.subTopics, ...sections] } : c));

/** The Flutter course with the roadmap overview in front of it and the 18 roadmap sections after its original modules. */
export const withFlutterRoadmap = (flutter: Course[], overview: SubTopic[], sections: SubTopic[]): Course[] =>
  flutter.map(c => (c.id === 'flutter' ? { ...c, subTopics: [...overview, ...c.subTopics, ...sections] } : c));

/** The Hibernate course (already joined with JDBC) with the roadmap overview in front and the 11 roadmap sections after it. */
export const withHibernateRoadmap = (hibernate: Course[], overview: SubTopic[], sections: SubTopic[]): Course[] =>
  hibernate.map(c => (c.id === 'hibernate' ? { ...c, subTopics: [...overview, ...c.subTopics, ...sections] } : c));

/** The Microservices Fundamentals course with the roadmap overview in front and the 15 roadmap sections after its original modules. */
export const withMicroservicesRoadmap = (ms: Course[], overview: SubTopic[], sections: SubTopic[]): Course[] =>
  ms.map(c => (c.id === 'microservices-fundamentals' ? { ...c, subTopics: [...overview, ...c.subTopics, ...sections] } : c));

/** The Spring Core course with the roadmap overview in front and the 20 roadmap sections after its original modules. */
export const withSpringCoreRoadmap = (courses: Course[], overview: SubTopic[], sections: SubTopic[]): Course[] =>
  courses.map(c => (c.id === 'spring-core' ? { ...c, subTopics: [...overview, ...c.subTopics, ...sections] } : c));

/** The JavaFX course with the roadmap overview in front and the 16 roadmap sections after its original modules. */
export const withJavaFxRoadmap = (courses: Course[], overview: SubTopic[], sections: SubTopic[]): Course[] =>
  courses.map(c => (c.id === 'javafx' ? { ...c, subTopics: [...overview, ...c.subTopics, ...sections] } : c));
