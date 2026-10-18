import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { QuizResults } from './quiz/QuizResults';
import { PracticeRetake } from './quiz/PracticeRetake';
import { buildRetakeSet } from '../lib/quizReview';
import type { PreparedQuestion } from '../services/quizEngine';
import { Certificate } from './Certificate';
import { buildQuiz, PASS_PERCENTAGE } from '../services/quizEngine';
import { allBanks } from '../data/quiz';
import { useDataset } from '../hooks/useDataset';
import type { QuizBank } from '../data/quiz/types';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';

interface MCQTestProps {
  /** subTopic id of the module under test - selects the authored question bank. */
  moduleId?: string;
  /** course id - supplies the fallback bank when the module has none of its own. */
  courseId?: string;
  moduleName: string;
  courseName: string;
  onClose: () => void;
}

// Questions used to be synthesised from interview-question strings with the correct
// option hard-coded at index 0, which meant a student could pass without reading
// anything. They now come from authored banks and are shuffled by the engine.


export function MCQTest({ moduleId, courseId, moduleName, courseName, onClose }: MCQTestProps) {
  // One seed per attempt. Keeping it in state means React re-renders do not reshuffle
  // the quiz under the student, while Try Again deliberately draws a fresh order.
  const { saveAttempt } = useProgress();
  const { isLoggedIn } = useAuth();
  // Whether this attempt's result has been recorded for a signed-in user
  const savedRef = useRef(false);
  const [attempt, setAttempt] = useState(() => Date.now());
  const { data: banks } = useDataset<QuizBank[]>('quiz-banks', allBanks);
  const quiz = useMemo(() => buildQuiz(moduleId, courseId, attempt, banks ?? []), [moduleId, courseId, attempt, banks]);
  const questions = quiz.questions;
  const totalQuestions = questions.length;
  const passScore = Math.ceil(totalQuestions * PASS_PERCENTAGE / 100);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(totalQuestions).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const navigate = useNavigate();
  const [practice, setPractice] = useState<PreparedQuestion[] | null>(null);
  const startedAt = useRef(Date.now());
  const [durationMs, setDurationMs] = useState(0);

  // Esc closes the test modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const goToNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitTest = () => {
    setDurationMs(Date.now() - startedAt.current);
    setShowResults(true);
    // Recorded for every attempt, pass or fail: the failures are what drive the review
    // queue. No-op for guests, and a failed write never blocks the results screen.
    savedRef.current = isLoggedIn;
    void saveAttempt({
      courseId: courseId || '',
      moduleId: moduleId || '',
      moduleName,
      score: calculateScore(),
      totalQuestions,
    });
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answerIndex) {
        correct++;
      }
    });
    return correct;
  };

  // A guest can finish the test and log in afterwards from the certificate screen; record the result then
  useEffect(() => {
    if (!showResults || !isLoggedIn || savedRef.current) return;
    savedRef.current = true;
    void saveAttempt({ courseId: courseId || '', moduleId: moduleId || '', moduleName, score: calculateScore(), totalQuestions });
  }, [showResults, isLoggedIn]);

  const score = showResults ? calculateScore() : 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= PASS_PERCENTAGE;

  const resetTest = () => {
    setAttempt(Date.now());
    setSelectedAnswers(new Array(totalQuestions).fill(-1));
    setCurrentQuestion(0);
    setShowResults(false);
    setShowCertificate(false);
    savedRef.current = false;
    setPractice(null);
    startedAt.current = Date.now();
  };

  // No authored bank for this module yet. Serving a synthesised quiz here would put a
  // certificate behind questions nobody wrote, so we say so plainly instead.
  if (totalQuestions === 0) {
    return (
      <div role="dialog" aria-modal="true" aria-label="Module test" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-5 text-white">
            <h2 className="text-xl font-bold">Assessment not ready</h2>
            <p className="text-orange-100 mt-1 text-sm">{moduleName} - {courseName}</p>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              This module does not have a reviewed question bank yet, so there is no test to take
              and no certificate to earn here.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              In the meantime, the Interview Q&amp;A tab in the right sidebar covers this material.
            </p>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg font-semibold"
            >
              Back to the topic
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  if (showCertificate) {
    return <Certificate moduleName={moduleName} courseName={courseName} score={score} totalQuestions={totalQuestions} onClose={onClose} />;
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Module test" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-5 text-white">
          <h2 className="text-2xl font-bold">Module Completion Test</h2>
          <p className="text-orange-100 mt-1 text-sm">{moduleName} - {courseName}</p>
          <p className="text-orange-200 text-xs mt-0.5">Pass: {PASS_PERCENTAGE}% ({passScore}/{totalQuestions} correct)</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {!showResults ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Question {currentQuestion + 1} of {totalQuestions}</span>
                    <span>{selectedAnswers.filter(a => a !== -1).length}/{totalQuestions} Answered</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-orange-600 to-amber-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Q{currentQuestion + 1}. {questions[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(index)}
                        aria-pressed={selectedAnswers[currentQuestion] === index}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 ${
                          selectedAnswers[currentQuestion] === index
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedAnswers[currentQuestion] === index
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-400 dark:border-gray-500'
                          }`}>
                            {selectedAnswers[currentQuestion] === index && (
                              <div className="w-3 h-3 bg-white rounded-full" />
                            )}
                          </div>
                          <span className="text-sm text-gray-800 dark:text-gray-200">{option}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToPrevious}
                    disabled={currentQuestion === 0}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </motion.button>

                  {currentQuestion === totalQuestions - 1 ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={submitTest}
                      disabled={selectedAnswers.includes(-1)}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Test
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={goToNext}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg"
                    >
                      Next
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            practice ? (
              <PracticeRetake questions={practice} onBack={() => setPractice(null)} />
            ) : (
              <QuizResults
                moduleName={moduleName}
                courseId={courseId}
                moduleId={moduleId}
                bankLabel={quiz.bankLabel}
                questions={questions}
                answers={selectedAnswers}
                durationMs={durationMs}
                passPercentage={PASS_PERCENTAGE}
                onCertificate={() => setShowCertificate(true)}
                onRetryFull={resetTest}
                onPractice={() => setPractice(buildRetakeSet(questions, selectedAnswers, Date.now()))}
                onOpenLesson={(href) => { onClose(); navigate(href); }}
              />
            )
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
