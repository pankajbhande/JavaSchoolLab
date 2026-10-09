import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Award, RotateCcw } from 'lucide-react';
import { Certificate } from './Certificate';
import { buildQuiz, PASS_PERCENTAGE } from '../services/quizEngine';
import { useProgress } from '../context/ProgressContext';

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
  const [attempt, setAttempt] = useState(() => Date.now());
  const quiz = useMemo(() => buildQuiz(moduleId, courseId, attempt), [moduleId, courseId, attempt]);
  const questions = quiz.questions;
  const totalQuestions = questions.length;
  const passScore = Math.ceil(totalQuestions * PASS_PERCENTAGE / 100);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(totalQuestions).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

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
    setShowResults(true);
    // Recorded for every attempt, pass or fail: the failures are what drive the review
    // queue. No-op for guests, and a failed write never blocks the results screen.
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

  const score = showResults ? calculateScore() : 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= PASS_PERCENTAGE;

  const resetTest = () => {
    setAttempt(Date.now());
    setSelectedAnswers(new Array(totalQuestions).fill(-1));
    setCurrentQuestion(0);
    setShowResults(false);
    setShowCertificate(false);
  };

  // No authored bank for this module yet. Serving a synthesised quiz here would put a
  // certificate behind questions nobody wrote, so we say so plainly instead.
  if (totalQuestions === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
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
            /* Results */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
                passed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                {passed ? (
                  <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
                )}
              </div>

              <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {passed ? 'Congratulations!' : 'Keep Learning!'}
              </h3>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
                Module: <span className="font-semibold">{moduleName}</span>
              </p>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                You scored {score} out of {totalQuestions} ({percentage}%)
              </p>

              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Performance</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <motion.div
                    className={`h-4 rounded-full ${
                      passed
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                        : 'bg-gradient-to-r from-red-600 to-orange-600'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span className="text-orange-500 font-semibold">{PASS_PERCENTAGE}% Pass</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Question-by-question review. An assessment that only reports a score
                  teaches nothing; the explanation is the part that does the work. */}
              <div className="text-left space-y-3 mb-6">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Review your answers</div>
                {questions.map((q, i) => {
                  const chosen = selectedAnswers[i];
                  const right = chosen === q.answerIndex;
                  return (
                    <div key={q.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-start gap-2">
                        {right
                          ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 dark:text-gray-200">Q{i + 1}. {q.question}</p>
                          {!right && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              You chose: {chosen === -1 ? "nothing" : q.options[chosen]}
                            </p>
                          )}
                          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                            Correct: {q.options[q.answerIndex]}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {passed ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCertificate(true)}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg text-lg font-semibold flex items-center gap-2 mx-auto"
                >
                  <Award className="w-6 h-6" />
                  Get Your Certificate
                </motion.button>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600 dark:text-gray-400">
                    You need at least {PASS_PERCENTAGE}% ({passScore}/{totalQuestions}) to pass and earn your certificate.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTest}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Retry Test
                  </motion.button>
                </div>
              )}
            </motion.div>
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
