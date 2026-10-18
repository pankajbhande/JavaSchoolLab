import type { Course } from '../data/types';

// Every interview question for a topic, across all companies. Shared by the right sidebar
// (Interview Qs tab, MCQ tab) and the content audit, so both always agree on what a topic
// has.
export function questionsForTopic(course: Course | null, topicName: string | null): string[] {
  if (!course || !topicName) return [];

  const allQuestions: string[] = [];
  const topicLower = topicName.toLowerCase();
  const commonWords = new Set(['in', 'of', 'and', 'the', 'a', 'an', 'to', 'is', 'for', 'with', 'between', 'difference', 'java', 'what', 'how', 'why']);
  const topicKeywords = topicLower.split(/[\s,\-&]+/).filter(w => w.length > 1 && !commonWords.has(w));

  // Try to find a matching interview question section by company name
  let bestMatch: Course['interviewQuestions'][0] | null = null;
  let bestScore = 0;

  course.interviewQuestions.forEach(item => {
    const companyLower = item.company.toLowerCase();
    const matchCount = topicKeywords.filter(kw => companyLower.includes(kw)).length;
    if (matchCount > bestScore && matchCount >= Math.min(topicKeywords.length, 2)) {
      bestScore = matchCount;
      bestMatch = item;
    }
  });

  if (bestMatch) {
    (bestMatch as Course['interviewQuestions'][0]).questions.forEach(q => allQuestions.push(q));
  } else {
    // Fallback: keyword match
    course.interviewQuestions.forEach(item => {
      item.questions.forEach(q => {
        const qLower = q.toLowerCase();
        if (qLower.includes(topicLower) || topicKeywords.some(kw => qLower.includes(kw))) {
          allQuestions.push(q);
        }
      });
    });
    // No whole-course fallback: an empty panel is better than a misleading one.
  }

  // Levels are merged: every question is returned, so a topic with 12 questions shows 12.
  return allQuestions;
}
