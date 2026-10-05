import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAttemptById, getQuizById } from '../../services/storage';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Filter,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export const QuizReviewPage: React.FC = () => {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>();
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect'>('all');

  const attempt = attemptId ? getAttemptById(attemptId) : undefined;
  const quiz = id ? getQuizById(id) : undefined;

  // Question evaluations
  const evaluatedQuestions = useMemo(() => {
    if (!quiz || !attempt) return [];

    return quiz.questions.map((q, idx) => {
      const studentAns = attempt.answers[q.id];
      const isAnswered =
        studentAns !== undefined &&
        studentAns !== null &&
        (typeof studentAns === 'string' ? studentAns.trim() !== '' : studentAns.length > 0);

      let isCorrect = false;

      if (isAnswered) {
        if (q.type === 'single' || q.type === 'boolean') {
          isCorrect = q.correctAnswers.includes(studentAns as string);
        } else if (q.type === 'multiple') {
          if (Array.isArray(studentAns)) {
            const sortedS = [...studentAns].sort();
            const sortedC = [...q.correctAnswers].sort();
            isCorrect =
              sortedS.length === sortedC.length &&
              sortedS.every((v, i) => v === sortedC[i]);
          }
        } else if (q.type === 'text') {
          if (typeof studentAns === 'string') {
            const norm = studentAns.trim().toLowerCase();
            isCorrect = q.correctAnswers.some((a) => a.trim().toLowerCase() === norm);
          }
        }
      }

      return {
        question: q,
        index: idx + 1,
        studentAns,
        isAnswered,
        isCorrect,
      };
    });
  }, [quiz, attempt]);

  const filtered = useMemo(() => {
    return evaluatedQuestions.filter((item) => {
      if (filterType === 'correct') return item.isCorrect;
      if (filterType === 'incorrect') return !item.isCorrect;
      return true;
    });
  }, [evaluatedQuestions, filterType]);

  if (!attempt || !quiz) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Review Data Not Found
        </h2>
        <Link to="/student">
          <Button variant="primary" className="mt-4">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link to={`/quiz/${quiz.id}/result/${attempt.id}`}>
            <button className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Answer Review: {quiz.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Score: {attempt.score}/{attempt.totalPoints} ({attempt.percentage}%) &bull;{' '}
              {attempt.passed ? (
                <span className="text-emerald-600 font-bold">Passed</span>
              ) : (
                <span className="text-rose-600 font-bold">Failed</span>
              )}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {(['all', 'correct', 'incorrect'] as const).map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                filterType === ft
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {ft} ({evaluatedQuestions.filter((item) => {
                if (ft === 'correct') return item.isCorrect;
                if (ft === 'incorrect') return !item.isCorrect;
                return true;
              }).length})
            </button>
          ))}
        </div>
      </div>

      {/* Questions Review List */}
      <div className="space-y-6">
        {filtered.map(({ question: q, index, studentAns, isAnswered, isCorrect }) => (
          <div
            key={q.id}
            className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 sm:p-8 shadow-xs transition-colors ${
              isCorrect
                ? 'border-emerald-200 dark:border-emerald-900/60'
                : 'border-rose-200 dark:border-rose-900/60'
            }`}
          >
            {/* Question Top Bar */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Question {index} of {quiz.questions.length}
                </span>
                <Badge variant="purple" size="sm">{q.points} pt(s)</Badge>
                <Badge variant="secondary" size="sm">{q.type}</Badge>
              </div>

              <div>
                {isCorrect ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Correct (+{q.points} pts)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold text-xs border border-rose-300 dark:border-rose-800">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Incorrect (0 pts)
                  </span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-4">
              {q.text}
            </h3>

            {/* Optional Image */}
            {q.imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden max-h-56 border border-slate-200 dark:border-slate-800 flex justify-center bg-slate-50 dark:bg-slate-800/40">
                <img
                  src={q.imageUrl}
                  alt="illustration"
                  className="max-h-56 object-contain"
                />
              </div>
            )}

            {/* Options Comparison (for single, multiple, boolean) */}
            {q.type !== 'text' ? (
              <div className="space-y-2.5 mb-6">
                {q.options.map((opt, oIdx) => {
                  const letter = optionLetters[oIdx] || `${oIdx + 1}`;
                  const isCorrectChoice = q.correctAnswers.includes(opt.id);
                  const isStudentChoice = Array.isArray(studentAns)
                    ? studentAns.includes(opt.id)
                    : studentAns === opt.id;

                  let style = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';
                  let statusTag = null;

                  if (isCorrectChoice && isStudentChoice) {
                    style = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                    statusTag = (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <Check className="w-4 h-4" /> Correct Choice (Your Answer)
                      </span>
                    );
                  } else if (isCorrectChoice && !isStudentChoice) {
                    style = 'border-emerald-400/80 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300';
                    statusTag = (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Check className="w-4 h-4" /> Correct Answer
                      </span>
                    );
                  } else if (!isCorrectChoice && isStudentChoice) {
                    style = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                    statusTag = (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                        <X className="w-4 h-4" /> Your Selected Answer
                      </span>
                    );
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-xl border-2 transition-all ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                          {letter}
                        </span>
                        <span className="text-sm font-medium">{opt.text}</span>
                      </div>

                      {statusTag && <div className="pl-10 sm:pl-0">{statusTag}</div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Short Answer Review */
              <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-slate-500 block uppercase mb-1">
                    Your Response:
                  </span>
                  <div className={`p-2.5 rounded-xl border font-mono text-sm ${
                    isCorrect
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}>
                    {typeof studentAns === 'string' && studentAns.trim()
                      ? studentAns
                      : '(No answer provided)'}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-500 block uppercase mb-1">
                    Accepted Correct Answer(s):
                  </span>
                  <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-mono text-sm font-semibold">
                    {q.correctAnswers.join(' / ')}
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Explanation Box */}
            {q.explanation && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                  <Info className="w-4 h-4 shrink-0" />
                  Explanation &amp; Learning Point
                </div>
                <p className="leading-relaxed pl-5.5 text-slate-700 dark:text-slate-300">
                  {q.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
