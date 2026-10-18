// Canonical shape of the course content model.
//
// This lived as a copy-pasted block inside 29 separate data files, and the copies had
// already drifted: 15 of them declared Topic.id and Topic.name optional while the other
// 14 required them, and SubTopic.topics was optional in the same 15. Every one of the
// 474 topics actually shipping does have an id and a name, and the whole app keys
// navigation, routing and progress off topic.id, so the strict shape is the real contract.

export interface ContentBlock {
  /** HTML string rendered into the topic body. */
  content: string;
  /** Java (or other language) snippets rendered with syntax highlighting below the block. */
  codeExamples?: string[];
  /**
   * One plain-text walkthrough per entry in `codeExamples`, shown behind a collapsible
   * "Explain this code" toggle under that sample. Optional and positional — a topic with
   * two code examples and one explanation gets the toggle on the first sample only.
   */
  codeExplanations?: string[];
}

export interface Topic {
  /** Stable id. Used in the URL, in visited-topic progress and for every data lookup. */
  id: string;
  name: string;
  /** Shown under the Basic tab. */
  beginner?: ContentBlock[];
  /** Shown under the Expert tab, concatenated after `intermediate`. */
  intermediate?: ContentBlock[];
  expert?: ContentBlock[];
  /** Interview questions with model answers, shown in the right pane rather than in the notes. */
  interviewQA?: [question: string, answer: string][];
}

/** A module: the unit a completion test and certificate are issued against. */
export interface SubTopic {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Course {
  id: string;
  name: string;
  /** Either a lucide icon name, or a URL/filename for an image icon. */
  icon: string;
  subTopics: SubTopic[];
  cheatNotes: string[];
  interviewQuestions: {
    company: string;
    questions: string[];
  }[];
}
