# Adding a question bank

A module can only award a certificate if it has a reviewed question bank. Modules without
one show "Assessment coming soon" and the test screen explains that no test exists yet.

This is deliberate. The previous generator synthesised questions from interview-question
strings and hard-coded the correct answer to option 0 in all seven of its branches, with
distractors like "Not related to Java programming". A student could score 100% by clicking
the first option ten times and receive a certificate recorded in the database. Certifying
against questions nobody wrote is worse than not certifying at all.

## Where banks live

`src/app/data/quiz/banks/<name>.ts`, registered in `src/app/data/quiz/index.ts`.

## Keys

Two shapes, checked most specific first:

| Key                  | Matches                                                  |
| -------------------- | -------------------------------------------------------- |
| `courseId/moduleId`  | one module (`moduleId` is a subTopic id in coursesData)   |
| `courseId`           | every module in the course that has no bank of its own    |

Module ids are **not** unique across courses — both Java and JSP Servlets have a module
called `exception-handling` — which is why module keys are course-scoped.

Find the ids in `src/app/data/coursesData.ts`: course `id`, then `subTopics[].id`.

## Shape

```ts
import type { QuizBank } from '../types';

export const myBank: QuizBank = {
  key: 'java/java8',
  label: 'Java 8 Features',
  questions: [
    {
      id: 'j8-stream-lazy',                  // unique within this bank
      question: 'When does a stream pipeline actually process elements?',
      options: [                             // 2-6, authored in ANY order
        'Only when a terminal operation runs; intermediate operations are lazy',
        'Immediately, as each intermediate operation is chained',
        'On a background thread as soon as the stream is created',
        'Only if the stream is parallel',
      ],
      correctAnswer: 0,                      // index into options AS AUTHORED
      explanation:
        'Intermediate operations only build up a pipeline. Nothing traverses the source '
        + 'until a terminal operation such as collect() or forEach() runs, which is what '
        + 'lets streams fuse operations into a single pass.',
      difficulty: 'intermediate',            // optional
    },
  ],
};
```

Then add it to `BANKS` in `src/app/data/quiz/index.ts`.

## Rules that matter

- **Do not arrange the options.** The engine shuffles them per attempt and remaps
  `correctAnswer`, so position carries no signal. Authoring the right answer first is fine.
- **Every distractor must be plausible** to someone who skimmed the topic. An option nobody
  would ever pick measures nothing and just narrows the real choice to three.
- **`explanation` is required.** It is shown against every question in the results review.
  A score with no explanation teaches nothing.
- **Aim for at least 10 questions**, since a quiz draws 10. A smaller pool still works, but
  every attempt then sees the whole bank.

## Engine behaviour

`src/app/services/quizEngine.ts`:

- Fisher-Yates shuffle of both question order and options, from a seeded PRNG.
- One seed per attempt, held in component state, so React re-renders do not reshuffle the
  quiz mid-test while "Try Again" deliberately draws a fresh order.
- The correct option is tracked through the shuffle by identity, not by matching text, so
  it stays correct even if two options read identically.
- Pass mark is 70% (`PASS_PERCENTAGE`), quiz length 10 (`QUIZ_LENGTH`).

In dev builds the registry logs duplicate bank keys, out-of-range `correctAnswer` values
and duplicate options to the console at startup.
