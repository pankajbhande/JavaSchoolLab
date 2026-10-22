// Course data structure for JavaSchoolLab

// The data-model types are declared alongside the Java course data. Re-exported here so
// consumers can import the shape and the data from one module, which is what every
// component already assumed.
export type { Course, SubTopic, Topic, ContentBlock } from './types';

import { CollectionFramework } from "./CollectionFramework";
import { coreJava } from "./coreJava";
import { designPattern } from "./designPattern";
import { designPatternExtras1 } from "./DesignPatternExtras1";
import { designPatternExtras2 } from "./DesignPatternExtras2";
import { designPatternExtras3 } from "./DesignPatternExtras3";
import { designPatternExtras4 } from "./DesignPatternExtras4";
import { Hibernate } from "./Hibernate";
import { HtmlandCSS } from "./HtmlandCSS";
import { JSPServlets } from "./JSPServlet";
import { MySQLCSS } from "./MySQLCSS";
import { Reactjs } from "./Reactjs";
import { SoftwareFoundations } from "./SoftwareFoundations";
import { ProgrammingFundamentals } from "./ProgrammingFundamentals";
import { JavaMemoryJVM } from "./JavaMemoryJVM";
import { JavaScriptCourse } from "./JavaScriptCourse";
import { AngularCourse } from "./AngularCourse";
import { Flutter } from "./Flutter";
import { JavaFXCourse } from "./JavaFXCourse";
import { PythonCourse } from "./PythonCourse";
import { MachineLearningCourse } from "./MachineLearningCourse";
import { DataScienceCourse } from "./DataScienceCourse";
import { DsaCourse } from "./DsaCourse";
import { DigitalImageAnalysisCourse } from "./DigitalImageAnalysisCourse";
import { MathFoundationsCourse } from "./MathFoundationsCourse";
import { enterprisePatternsPart1 } from "./EnterprisePatternsPart1";
import { enterprisePatternsPart2 } from "./EnterprisePatternsPart2";
import { microservicesPatternsPart1 } from "./MicroservicesPatternsPart1";
import { microservicesPatternsPart2 } from "./MicroservicesPatternsPart2";
import { messagingPatternsPart1 } from "./MessagingPatternsPart1";
import { messagingPatternsPart2 } from "./MessagingPatternsPart2";
import { architecturalPatterns } from "./ArchitecturalPatterns";
import { cloudNativePatterns } from "./CloudNativePatterns";
import { microservicesFundamentalsPart1 } from "./MicroservicesFundamentalsPart1";
import { microservicesFundamentalsPart2 } from "./MicroservicesFundamentalsPart2";
import { JdbcCourse } from "./JdbcCourse";
import { withJvm, withJdbc, withJsRoadmap, withReactRoadmap, withAngularRoadmap, withAngularSyllabus, withDesignPatternExtras, withFlutterRoadmap, withHibernateRoadmap, withMicroservicesRoadmap, withSpringCoreRoadmap, withJavaFxRoadmap } from "./courseMerges";
import { javaFxRoadmap1 } from "./JavaFXRoadmap1";
import { javaFxRoadmap2 } from "./JavaFXRoadmap2";
import { javaFxRoadmap3 } from "./JavaFXRoadmap3";
import { springCoreRoadmap1 } from "./SpringCoreRoadmap1";
import { springCoreRoadmap2 } from "./SpringCoreRoadmap2";
import { springCoreRoadmap3 } from "./SpringCoreRoadmap3";
import { springCoreRoadmap4 } from "./SpringCoreRoadmap4";
import { microservicesRoadmap1 } from "./MicroservicesRoadmap1";
import { microservicesRoadmap2 } from "./MicroservicesRoadmap2";
import { microservicesRoadmap3 } from "./MicroservicesRoadmap3";
import { hibernateRoadmap1 } from "./HibernateRoadmap1";
import { hibernateRoadmap2 } from "./HibernateRoadmap2";
import { flutterRoadmap1 } from "./FlutterRoadmap1";
import { flutterRoadmap2 } from "./FlutterRoadmap2";
import { flutterRoadmap3 } from "./FlutterRoadmap3";
import { flutterRoadmap4 } from "./FlutterRoadmap4";
import { angularRoadmap1 } from "./AngularRoadmap1";
import { angularRoadmap2 } from "./AngularRoadmap2";
import { angularRoadmap3 } from "./AngularRoadmap3";
import { angularSyllabus0 } from "./AngularSyllabus0";
import { angularSyllabus1 } from "./AngularSyllabus1";
import { angularSyllabus2 } from "./AngularSyllabus2";
import { angularSyllabus3 } from "./AngularSyllabus3";
import { angularSyllabus4 } from "./AngularSyllabus4";
import { reactRoadmap1 } from "./ReactRoadmap1";
import { reactRoadmap2 } from "./ReactRoadmap2";
import { reactRoadmap3 } from "./ReactRoadmap3";
import { jsRoadmap1 } from "./JavaScriptRoadmap1";
import { jsRoadmap2 } from "./JavaScriptRoadmap2";
import { jsRoadmap3 } from "./JavaScriptRoadmap3";
import { jsRoadmap4 } from "./JavaScriptRoadmap4";
import { applyCourseExtras } from "./topics/courseExtras";

// Merge split-authored pattern courses into single clean course cards
const enterprisePatterns = [{
    ...enterprisePatternsPart1[0],
    subTopics: [...enterprisePatternsPart1[0].subTopics, ...enterprisePatternsPart2[0].subTopics]
}];
const microservicesPatterns = [{
    ...microservicesPatternsPart1[0],
    subTopics: [...microservicesPatternsPart1[0].subTopics, ...microservicesPatternsPart2[0].subTopics]
}];
const messagingPatterns = [{
    ...messagingPatternsPart1[0],
    subTopics: [...messagingPatternsPart1[0].subTopics, ...messagingPatternsPart2[0].subTopics]
}];
const microservicesFundamentals = [{
    ...microservicesFundamentalsPart1[0],
    subTopics: [...microservicesFundamentalsPart1[0].subTopics, ...microservicesFundamentalsPart2[0].subTopics]
}];


export const baseCourses = [ ...SoftwareFoundations, ...ProgrammingFundamentals, ...HtmlandCSS,...withSpringCoreRoadmap(withJvm(coreJava, JavaMemoryJVM), springCoreRoadmap1.slice(0, 1), [...springCoreRoadmap1.slice(1), ...springCoreRoadmap2, ...springCoreRoadmap3, ...springCoreRoadmap4]), ...JSPServlets, ...CollectionFramework,
    ...withDesignPatternExtras(designPattern, { ...designPatternExtras1, ...designPatternExtras2, ...designPatternExtras3, ...designPatternExtras4 }), ...enterprisePatterns, ...microservicesPatterns, ...messagingPatterns, ...architecturalPatterns, ...cloudNativePatterns, ...withMicroservicesRoadmap(microservicesFundamentals, microservicesRoadmap1.slice(0, 1), [...microservicesRoadmap1.slice(1), ...microservicesRoadmap2, ...microservicesRoadmap3]),
    ...MySQLCSS, ...withHibernateRoadmap(withJdbc(Hibernate, JdbcCourse), hibernateRoadmap1.slice(0, 1), [...hibernateRoadmap1.slice(1), ...hibernateRoadmap2]),...withReactRoadmap(Reactjs, reactRoadmap1.slice(0, 1), [...reactRoadmap1.slice(1), ...reactRoadmap2, ...reactRoadmap3]),
    ...withJsRoadmap(JavaScriptCourse, jsRoadmap1.slice(0, 1), [...jsRoadmap1.slice(1), ...jsRoadmap2, ...jsRoadmap3, ...jsRoadmap4]), ...withAngularSyllabus(withAngularRoadmap(AngularCourse, angularRoadmap1.slice(0, 1), [...angularRoadmap1.slice(1), ...angularRoadmap2, ...angularRoadmap3]), angularSyllabus0, [...angularSyllabus1, ...angularSyllabus2, ...angularSyllabus3, ...angularSyllabus4]), ...withFlutterRoadmap(Flutter, flutterRoadmap1.slice(0, 1), [...flutterRoadmap1.slice(1), ...flutterRoadmap2, ...flutterRoadmap3, ...flutterRoadmap4]), ...withJavaFxRoadmap(JavaFXCourse, javaFxRoadmap1.slice(0, 1), [...javaFxRoadmap1.slice(1), ...javaFxRoadmap2, ...javaFxRoadmap3]),
    ...PythonCourse, ...MachineLearningCourse, ...DataScienceCourse, ...DsaCourse,
    ...DigitalImageAnalysisCourse, ...MathFoundationsCourse

]

// Layer the per-topic extras (level notes, Q&A, exercises, deep dives) on every course.
export const coursesData = baseCourses.map(applyCourseExtras);



