import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  pickDailyQuestion, readHistory, saveAnswer, msUntilMidnight,
  type DailyHistory, type DailyQuestion, type RawQuestion,
} from '../lib/dailyChallenge';
import { localDay } from '../lib/localDate';
import { loadDataset } from '../data/datasetLoader';
import type { QuizBank } from '../data/quiz/types';
import type { StudyPack } from '../data/studyPacks';

/** Loads the authored banks lazily so the dashboard's first paint does not wait on them. */
async function loadPool(): Promise<RawQuestion[]> {
  const [allBanks, allStudyPacks] = await Promise.all([
    loadDataset<QuizBank[]>('quiz-banks'),
    loadDataset<Record<string, StudyPack>>('study-packs'),
  ]);
  const pool: RawQuestion[] = [];
  for (const bank of allBanks) {
    for (const q of bank.questions) {
      pool.push({ id: `quiz:${bank.key}:${q.id}`, question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, source: bank.label });
    }
  }
  for (const [key, pack] of Object.entries(allStudyPacks)) {
    pack.mcq.forEach(([question, options, reason], i) => {
      // Packs author the correct option first; the daily shuffle moves it.
      pool.push({ id: `pack:${key}:${i}`, question, options: [...options], correctAnswer: 0, explanation: reason, source: key.split('/')[0] });
    });
  }
  return pool;
}

export function useDailyChallenge() {
  const [today, setToday] = useState(() => localDay());
  const [question, setQuestion] = useState<DailyQuestion | null>(null);
  const [ready, setReady] = useState(false);
  const [history, setHistory] = useState<DailyHistory>(() => readHistory());
  const [msLeft, setMsLeft] = useState(() => msUntilMidnight());
  const [pool, setPool] = useState<RawQuestion[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPool().then(p => { if (!cancelled) setPool(p); }).catch(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!pool) return;
    setQuestion(pickDailyQuestion(pool, today));
    setReady(true);
  }, [pool, today]);

  // Tick each 30s: refresh the countdown and roll over at local midnight.
  useEffect(() => {
    const id = window.setInterval(() => {
      setMsLeft(msUntilMidnight());
      const d = localDay();
      setToday(prev => (prev === d ? prev : d));
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  const answer = useCallback((choice: number) => {
    if (!question) return;
    setHistory(saveAnswer(today, { qid: question.id, choice, correct: choice === question.answerIndex }));
  }, [question, today]);

  const answered = history[today];
  const stats = useMemo(() => {
    const all = Object.values(history);
    return { answered: all.length, correct: all.filter(a => a.correct).length };
  }, [history]);

  return { today, question, ready, answered, answer, msLeft, history, stats };
}
