import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAttemptById, getQuizById, getAttemptsByUser } from '../../services/storage';
import { ScoreRing } from '../../components/quiz/ScoreRing';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  RotateCcw,
  BookOpen,
  Trophy,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const QuizResultPage: React.FC = () => {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>();
  const navigate = useNavigate();

  const attempt = attemptId ? getAttemptById(attemptId) : undefined;
  const quiz = id ? getQuizById(id) : undefined;
  const confettiTriggeredRef = useRef(false);

  // Trigger confetti burst on passing score
  useEffect(() => {
    if (attempt?.passed && !confettiTriggeredRef.current) {
      confettiTriggeredRef.current = true;
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        });
      } catch (e) {
        console.error('Confetti error:', e);
      }
    }
  }, [attempt]);

  if (!attempt || !quiz) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Result Record Not Found
        </h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Could not locate the requested submission results.
        </p>
        <Link to="/student">
          <Button variant="primary">Return to Quizzes</Button>
        </Link>
      </div>
    );
  }

  // Calculate detailed counts
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  quiz.questions.forEach((q) => {
    const studentAns = attempt.answers[q.id];
    if (
      studentAns === undefined ||
      studentAns === null ||
      (typeof studentAns === 'string' && studentAns.trim() === '') ||
      (Array.isArray(studentAns) && studentAns.length === 0)
    ) {
      skippedCount++;
      return;
    }

    if (q.type === 'single' || q.type === 'boolean') {
      if (q.correctAnswers.includes(studentAns as string)) correctCount++;
      else incorrectCount++;
    } else if (q.type === 'multiple') {
      if (Array.isArray(studentAns)) {
        const sortedS = [...studentAns].sort();
        const sortedC = [...q.correctAnswers].sort();
        if (
          sortedS.length === sortedC.length &&
          sortedS.every((v, i) => v === sortedC[i])
        ) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      } else {
        incorrectCount++;
      }
    } else if (q.type === 'text') {
      if (typeof studentAns === 'string') {
        const norm = studentAns.trim().toLowerCase();
        if (q.correctAnswers.some((a) => a.trim().toLowerCase() === norm)) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      } else {
        incorrectCount++;
      }
    }
  });

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs < 10 ? '0' : ''}${remainingSecs}s`;
  };

  const userAttempts = getAttemptsByUser(attempt.userId).filter((a) => a.quizId === quiz.id);
  const maxAttemptsReached = quiz.maxAttempts > 0 && userAttempts.length >= quiz.maxAttempts;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Result Hero Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm text-center space-y-6">
        {/* Pass / Fail Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          {attempt.passed ? (
            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-3.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Passed Successfully!
            </span>
          ) : (
            <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 px-3.5 py-1 rounded-full flex items-center gap-1.5 border border-rose-300 dark:border-rose-800">
              <XCircle className="w-4 h-4 text-rose-600" />
              Passing Score Not Met
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {quiz.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {attempt.passed
              ? 'Congratulations! You demonstrated strong mastery of this subject.'
              : `You needed at least ${quiz.passingScore}% to pass. Review your answers below to sharpen your knowledge.`}
          </p>
        </div>

        {/* Animated Score Ring */}
        <div className="py-2">
          <ScoreRing percentage={attempt.percentage} passed={attempt.passed} size={190} />
        </div>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Score Earned
            </span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              {attempt.score} / {attempt.totalPoints}
            </div>
            <span className="text-[10px] text-slate-400">points</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Correct
            </span>
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{correctCount}</span>
            </div>
            <span className="text-[10px] text-slate-400">questions</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Incorrect
            </span>
            <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
              <XCircle className="w-4 h-4" />
              <span>{incorrectCount}</span>
            </div>
            <span className="text-[10px] text-slate-400">questions</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Time Taken
            </span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="font-mono">{formatSeconds(attempt.timeTaken)}</span>
            </div>
            <span className="text-[10px] text-slate-400">duration</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={`/quiz/${quiz.id}/review/${attempt.id}`} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              leftIcon={<BookOpen className="w-4 h-4" />}
              className="w-full sm:w-auto px-6 font-bold"
            >
              Review Full Answers &amp; Explanations
            </Button>
          </Link>

          {!maxAttemptsReached ? (
            <Link to={`/quiz/${quiz.id}`} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Retake Quiz
              </Button>
            </Link>
          ) : (
            <span className="text-xs text-slate-400">
              Max attempts reached ({quiz.maxAttempts})
            </span>
          )}

          <Link to={`/quiz/${quiz.id}/leaderboard`} className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="md"
              leftIcon={<Trophy className="w-4 h-4 text-amber-500" />}
              className="w-full sm:w-auto"
            >
              Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
