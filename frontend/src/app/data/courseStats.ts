// GENERATED FILE - do not edit by hand. Run: npm run gen:course-stats
//
// Per-course totals for the dashboard's completion rings. Kept separate from coursesData
// so the landing page can show progress without downloading every topic.
// 29 courses, 3643 topics.

export interface CourseStat {
  topics: number;
  modules: number;
}

export const courseStats: Record<string, CourseStat> = {
  "algorithms": { topics: 327, modules: 23 },
  "angular": { topics: 219, modules: 47 },
  "architectural-patterns": { topics: 12, modules: 1 },
  "cloud-native-patterns": { topics: 10, modules: 1 },
  "collection": { topics: 16, modules: 6 },
  "data-science": { topics: 4, modules: 2 },
  "design-patterns": { topics: 23, modules: 3 },
  "digital-image-analysis": { topics: 49, modules: 8 },
  "enterprise-patterns-1": { topics: 15, modules: 2 },
  "flutter": { topics: 66, modules: 23 },
  "hibernate": { topics: 56, modules: 15 },
  "HTML and CSS": { topics: 275, modules: 14 },
  "java": { topics: 145, modules: 15 },
  "javafx": { topics: 42, modules: 20 },
  "javascript": { topics: 66, modules: 22 },
  "jsp-servlet": { topics: 43, modules: 10 },
  "machine-learning": { topics: 355, modules: 20 },
  "math-foundations-cs": { topics: 27, modules: 6 },
  "messaging-patterns-1": { topics: 14, modules: 2 },
  "microservices-fundamentals": { topics: 62, modules: 19 },
  "microservices-patterns-1": { topics: 19, modules: 2 },
  "mysql": { topics: 247, modules: 48 },
  "programming-fundamentals": { topics: 25, modules: 3 },
  "python": { topics: 397, modules: 40 },
  "react-js": { topics: 68, modules: 19 },
  "software-foundations": { topics: 41, modules: 4 },
  "spring-boot": { topics: 515, modules: 30 },
  "spring-core": { topics: 62, modules: 24 },
  "spring-mvc": { topics: 443, modules: 35 },
};

/** Total topics across every course. */
export const TOTAL_TOPICS = 3643;
