// Curated roadmaps. Steps reference real course ids from courseIndex (validated by
// learningPaths.test.ts); no content is duplicated here.

export interface PathStep {
  courseId: string;
}

export interface LearningPath {
  id: string;
  title: string;
  tagline: string;
  steps: PathStep[];
}

const steps = (...ids: string[]): PathStep[] => ids.map(courseId => ({ courseId }));

export const learningPaths: LearningPath[] = [
  {
    id: 'absolute-beginner',
    title: 'Absolute Beginner',
    tagline: 'Start from zero: how software is built, then your first language.',
    steps: steps('software-foundations', 'programming-fundamentals', 'java'),
  },
  {
    id: 'java-backend',
    title: 'Java Backend Developer',
    tagline: 'From core Java to production Spring services.',
    steps: steps('java', 'collection', 'jdbc', 'hibernate', 'spring-core', 'spring-mvc', 'spring-boot', 'microservices-fundamentals'),
  },
  {
    id: 'full-stack-web',
    title: 'Full-Stack Web',
    tagline: 'Build the interface, then the server behind it.',
    steps: steps('HTML and CSS', 'javascript', 'react-js', 'java', 'spring-boot'),
  },
  {
    id: 'data-ai-starter',
    title: 'Data & AI Starter',
    tagline: 'Python first, then data analysis and machine learning.',
    steps: steps('python', 'data-science', 'machine-learning'),
  },
  {
    id: 'dsa-interview',
    title: 'DSA & Interview Ready',
    tagline: 'Problem solving, core collections and design patterns.',
    steps: steps('algorithms', 'collection', 'design-patterns', 'java-memory-jvm'),
  },
  {
    id: 'software-architect',
    title: 'Software Architect',
    tagline: 'Patterns for enterprise, messaging, microservices and the cloud.',
    steps: steps('design-patterns', 'enterprise-patterns-1', 'architectural-patterns', 'messaging-patterns-1', 'microservices-patterns-1', 'cloud-native-patterns'),
  },
];
