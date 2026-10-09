// Course data structure for JavaSchoolLab

// The data-model types are declared alongside the Java course data. Re-exported here so
// consumers can import the shape and the data from one module, which is what every
// component already assumed.
export type { Course, SubTopic, Topic, ContentBlock } from './types';

import { CollectionFramework } from "./CollectionFramework";
import { coreJava } from "./coreJava";
import { designPattern } from "./designPattern";
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


const baseCourses = [ ...SoftwareFoundations, ...ProgrammingFundamentals, ...HtmlandCSS,...coreJava, ...JavaMemoryJVM, ...JSPServlets, ...CollectionFramework,
    ...designPattern, ...enterprisePatterns, ...microservicesPatterns, ...messagingPatterns, ...architecturalPatterns, ...cloudNativePatterns, ...microservicesFundamentals,
    ...MySQLCSS, ...Hibernate,...Reactjs,
    ...JavaScriptCourse, ...AngularCourse, ...Flutter, ...JavaFXCourse,
    ...PythonCourse, ...MachineLearningCourse, ...DataScienceCourse, ...DsaCourse,
    ...DigitalImageAnalysisCourse, ...MathFoundationsCourse

]

// Layer the per-topic extras (level notes, Q&A, exercises, deep dives) on every course.
export const coursesData = baseCourses.map(applyCourseExtras);



